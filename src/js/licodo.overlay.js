/**
 *  licodo.overlay.js
 *  overlay module for licodo
 *
*/
licodo.overlay = (function() {
    //begin module scope variables
    var configmap = {
        main_html: String()
            + '<div class = "licodo-overlay">' +
                  '<div class = "licodo-overlay-page">' +
                      
                  '</div>' +
             '</div>',
        new_html: String()
            + '<form class = "licodo-overlay-new, licodo-overlay-form">' +
                   '<div class = "licodo-overlay-title">' +
                       '<span class = "licodo-overlay-info">请输入任务名称:</span>' +
                       '<input class = "licodo-overlay-input" type = "text" value=""/>' +
                       '<span class = "licodo-overlay-delete">x</span>' +
                   '</div>' +
                   '<div class = "licodo-overlay-action">' +
                       '<input class = "licodo-overlay-cancel btn"  type = "button" value = "取消">' +
                       '<input class = "licodo-overlay-confirm btn" type = "button" value ="确认">' +
                   '</div>' +
              '</form>',
        trash_html: String()
            + '<form class = "licodo-overlay-trash, licodo-overlay-form">' +
                   '<div class = "licodo-overlay-title">' +
                       '<span class = "licodo-overlay-info"></span>' +
                       '<span class = "licodo-overlay-delete">x</span>' +
                   '</div>' +
                   '<div class = "licodo-overlay-action">' +
                       '<input class = "licodo-overlay-cancel btn"  type = "button" value = "取消">' +
                       '<input class = "licodo-overlay-confirm btn" type = "button" value ="确认">' +
                   '</div>' +
              '</form>',
        
        settable_map: {
            overMode: null,
            overBool: false,
            classifyMain: null,
            target: null
        },

        overMode: null,
        overBool: false,
        classifyMain: null,
        target: null


    },  
        
        stateMap = {
            infoStr: null
        },
        selectorMap = {},
        initModule, modeAdd, configModule, selectorMap, onclickCancel,
        onclickConfirm1, pageClick, onclickConfirm2, onclickConfirm3;
    
    //----begin dom method
    setSelectorMap = function() {
        selectorMap = {
            page: $('.licodo-overlay-page')[0] || '',
            over_delete: $('.licodo-overlay-delete')[0] || '',
            over_cancel: $('.licodo-overlay-cancel')[0] || '',
            over_confirm: $('.licodo-overlay-confirm')[0] || '',
            over_input: $('.licodo-overlay-input')[0] || '',
        }

    }
    mainHtmlAdd = function() {
         var contain = stateMap.contain;
         if (configmap.overBool) {
            contain.innerHTML = configmap.main_html;
         } else {
            contain.innerHTML = '';
         }
         setSelectorMap();

    }
    subHtmlAdd = function(overMode) {
        if (configmap.overBool) {
             // overMode == 1 for new task
            if (overMode === 1) {
                selectorMap.page.innerHTML = configmap.new_html;
                pageClick();
                addClickEvent(selectorMap.over_confirm, onclickConfirm1);
            }
            // overMode == 2 for delete from trash
            else if (overMode === 2) {
                selectorMap.page.innerHTML = configmap.trash_html;
                $(".licodo-overlay-info")[0].innerHTML = '将永久删除，are you OK？';
                pageClick();
                addClickEvent(selectorMap.over_confirm, onclickConfirm2);
            } 
            // overMode == 3 for confirm finishing the task
            else if (overMode === 3) {
                selectorMap.page.innerHTML = configmap.trash_html;
                $(".licodo-overlay-info")[0].innerHTML = '确定已完成任务？';
                pageClick();
                addClickEvent(selectorMap.over_confirm, onclickConfirm3);

            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    pageClick = function() {
        setSelectorMap();
        addClickEvent(selectorMap.over_cancel, onclickCancel);
        addClickEvent(selectorMap.over_delete, onclickCancel);
    }
    configModule = function(input_map) {
        // change the value in configmap
        licodo.util.setConfigMap({
            input_map: input_map,
            settable_map: configmap.settable_map,
            config_map: configmap
        });
        initModule();
    }
    //---begin event handlers
    onclickCancel = function() {
        configmap.overMode = null;
        configmap.overBool = false;
        mainHtmlAdd();
    }
    onclickConfirm1 = function() {
        var fileName = $('.licodo-overlay-input')[0].value;
        if (fileName !== '') {
            licodo.classify.addItems();
            onclickCancel();
        } else {
            stateMap.infoStr = '您的任务名为空';
        }
        licodo.info.configModule({
            infoStr: stateMap.infoStr,
        });
        
    }
    
    onclickConfirm2 = function() {

        var node, parent, id, childIndex, taskIndex, subTaskIndex, index,
            target = configmap.target,
            subId = target.parentNode.id,
            num = parseInt(subId.replace(/\D/g, '')), 
            cate = licodo.data.getStorage("cate"),
            childCate = licodo.data.getStorage("childCate"),
            task = licodo.data.getStorage("task");
        //如果是父分类
        if (hasClass(target.parentNode, 'licodo-classify-item')) {
            node = licodo.util.getObjByKey(cate, 'id', num);
            index = licodo.util.getIndexByKey(cate, 'id', num);
            // 删除子分类和子分类任务
            for (var i = 0; i < cate[index].child.length; i++) { 
                childIndex = licodo.util.getIndexByKey(childCate, 'id', cate[index].child[i]);
                for (var j = 0; j < childCate[childIndex].taskChild.length; j++) {
                    subTaskIndex = licodo.util.getIndexByKey(task, 'id', childCate[childIndex].taskChild[j]);
                    task.splice(subTaskIndex, 1);
                }
                childCate.splice(childIndex, 1);
            }
            // 删除分类下任务
            for (var m = 0; m < cate[index].taskChild.length; m++) {
                taskIndex = licodo.util.getIndexByKey(task, 'id', cate[index].taskChild[m]);
                task.splice(taskIndex, 1);
            }
            //删除分类
            cate.splice(index, 1);
            
        } else {  //如果是子分类
            index = licodo.util.getIndexByKey(childCate, 'id', num);
            node = licodo.util.getObjByKey(childCate, 'id', num);
            parent = licodo.util.getObjByKey(cate, 'id', node.parent);
            // 删除该分类下任务
            for (var i = 0; i < childCate[index].taskChild.length; i++) {       
                taskIndex = licodo.util.getIndexByKey(task, 'id', childCate[index].taskChild[i])
                task.splice(taskIndex, 1);
            }
            //除去父分类child数组里的值
            parent.child.splice(parent.child.indexOf(childCate[index].id), 1);
            childCate.splice(index, 1);
        }
        //保存数据 
        licodo.data.saveStorage(task);
        licodo.data.saveStorage(cate);
        licodo.data.saveStorage(childCate);
        //刷新分类列表板块
        licodo.classify.makeItems();
        //刷新任务板块
        licodo.task.makeTask($('.licodo-classify-on')[0]);
        addClass($('#licodo-task-ul0')[0].childNodes[0], 'licodo-task-on');
        //刷新text板块
        licodo.text.makeText($('#licodo-task-ul0')[0].childNodes[0]);
        onclickCancel();
      
    }
   
    onclickConfirm3 = function() {
        licodo.task.modifyTask(true);
        onclickCancel();
    }
    //----begin public method
    initModule = function(selector) {
        if (selector) {
            stateMap.contain = selector;
            setSelectorMap()
        }
        mainHtmlAdd();
        subHtmlAdd(configmap.overMode);
    }

    return {
        initModule: initModule,
        configModule: configModule
    }
})()
