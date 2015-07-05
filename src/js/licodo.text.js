/*
 *  licodo.text.js
 *  text module for Licodo
*/

licodo.text = (function() {
    //---------Begin module scope variables
    var configmap = {
        main_html: String() +
           '<div class = "licodo-text-head">' +
               '<span class = "licodo-text-title">' +
                    
               '</span>' +
               '<ul class = "licodo-text-icon">' +
                   '<li id = "licodo-text-true"></li>' +
                   '<li id = "licodo-text-edit"></li>' +
               '</ul>' +
           '</div>' +
           '<div class = "licodo-text-time">' +
               
           '</div>' +
           '<div class = "licodo-text-editor">' +
                '<div class = "licodo-text-content"></div>' +
           '</div>',
        
        sub_html: String() + 
           '<div class = "licodo-text-head">' +
               '<span class = "licodo-text-title">' +
                    '<input class = "licodo-text-inputTitle" type = "text" placeholder = "请输入标题"/>' +
               '</span>' +
               '<ul class = "licodo-text-icon">' +
                   '<input class = "licodo-text-cancel  btn" type = "button" value = "取消"/>' +
                   '<input class = "licodo-text-confirm btn" type = "button" value = "确认"/>' +
                '</ul>' +
           '</div>' +
           '<div class = "licodo-text-time">' +
               '任务日期：' +
               '<input class = "licodo-text-inputTime" type = "text" placeholder = "格式为 2015-06-01"/>' +
           '</div>' +
           '<div class = "licodo-text-editor">' +
               '<textarea class = "licodo-text-area"></textarea>'   +
           '</div>',
      
        text_html: null,
        isEdited: false,

        settable_map: {
            text_html: null,
        }
    },
      stateMap = {
          contain: null,
          infoStr: null,
          overMode: null,
          overBool: false,
      },
      selectorMap = {
          
      },
      initModule, configModule, addHtml, 
      onclickCancel, setSelectorMap, whenInput,
      onclickConfirm, whenStatic, onclickEdit, makeText;
      
      //Begin dom method
      setSelectorMap = function() {
          selectorMap = {
              $cancel: $(".licodo-text-cancel")[0] || '',
          }
      }

      configModule = function(input_map) {
          licodo.util.setConfigMap({
              input_map: input_map,
              settable_map: configmap.settable_map,
              config_map: configmap
          })
          addHtml(configmap.text_html);         
      }

      addHtml = function(str) {
          if (str == 'sub_html') {
              stateMap.contain.innerHTML = configmap.sub_html;
              whenInput();
        } else {
              stateMap.contain.innerHTML = configmap.main_html;
          }
      } 
      //用于生成页面内容
      makeText = function(target) {
          if (target) {
              var subId = target.id,
                  num = parseInt(subId.replace(/\D/g, '')),
                  task = licodo.data.getStorage('task'),
                  node = licodo.util.getObjByKey(task, 'id', num);
              configmap.text_html = 'main_html';
              addHtml(configmap.text_html);
              $('.licodo-text-title')[0].innerHTML = node.name;
              $('.licodo-text-time')[0].innerHTML = '任务日期：' + node.date;
              $('.licodo-text-content')[0].innerHTML =  node.content;
              // 启动可编辑模式
              whenStatic();
          }  else {
              configmap.text_html = 'main_html';
              addHtml(configmap.text_html);
              $('.licodo-text-title')[0].innerHTML = '';
              $('.licodo-text-time')[0].innerHTML = '任务日期：';
              $('.licodo-text-content')[0].innerHTML =  '';
          }
          
      }
      //处于静态的状态时
      whenStatic = function() {
          addClickEvent($("#licodo-text-edit")[0], onclickEdit);
          addClickEvent($("#licodo-text-true")[0], onclickTrue);
      }
      //处于输入的状态时
      whenInput = function() {
          $('.licodo-text-inputTitle')[0].focus();
          addClickEvent($(".licodo-text-cancel")[0], onclickCancel);
          addClickEvent($(".licodo-text-confirm")[0], onclickConfirm);
      }
      //Begin event method
       //点击取消
      onclickCancel = function() {
          configmap.text_html = 'main_html';
          addHtml(configmap.text_html);
          whenStatic();
          makeText($('.licodo-task-on')[0]);
      }
      //点击确认
      onclickConfirm = function() {
          var title = trim($('.licodo-text-inputTitle')[0].value),
              time = trim($('.licodo-text-inputTime')[0].value),
              content = trim($('.licodo-text-area')[0].value);

          //当输入的值为空时
          if (!title || !time || !content) {
                stateMap.infoStr = '请完整输入您的任务';
                licodo.info.configModule({
                infoStr: stateMap.infoStr,
            })
          } else if (!(/\d{4}-\d{2}-\d{2}/.test(time))) {
                stateMap.infoStr = '你输入的时间不符合格式';
                licodo.info.configModule({
                infoStr: stateMap.infoStr,
            }) 
          } else {

                if (configmap.isEdited) {
                    licodo.task.modifyTask(false, title, time, content);
                    configmap.isEdited = false;
                }  else {
                    //更新任务栏
                    licodo.task.addTask(title, time, content);
                    
                }
                onclickCancel();
                $('.licodo-text-title')[0].innerHTML = title;
                $('.licodo-text-time')[0].innerHTML = '任务日期：' + time;
                $('.licodo-text-content')[0].innerHTML = content;
                whenStatic();
            }
          
      }
      onclickEdit = function() {
        //可以替换成全局变量
          var subId = $('.licodo-task-on')[0].id,
              num = parseInt(subId.replace(/\D/g, '')),
              task = licodo.data.getStorage('task'),
              node = licodo.util.getObjByKey(task, 'id', num);
          configmap.text_html = 'sub_html';
          addHtml(configmap.text_html);
          $('.licodo-text-inputTitle')[0].value = node.name;
          $('.licodo-text-inputTime')[0].value = node.date;
          $('.licodo-text-area')[0].value = node.content;
          //使得输入框获得焦点
          //改变configmap里的isEdited值
          configmap.isEdited = true;
      }
      onclickTrue = function() {
          if (hasClass($('.licodo-task-on')[0], 'licodo-task-doing')) {
              stateMap.overMode = 3;
              stateMap.overBool = true;
              licodo.overlay.configModule({
                  overMode: stateMap.overMode,
                  overBool: stateMap.overBool,
              });
          } else {
              stateMap.infoStr = '该任务已是完成任务';
              licodo.info.configModule({
                  infoStr: stateMap.infoStr,
              });
          }
      }
      //Begin public method
      initModule = function(selector) {
          if (selector) {
              stateMap.contain = selector;
          }
          selector.innerHTML = configmap.main_html;
          makeText($('#licodo-task-ul0')[0].childNodes[0]);
      }
      
      return {
          makeText: makeText,
          initModule: initModule,
          configModule: configModule
      };
})()