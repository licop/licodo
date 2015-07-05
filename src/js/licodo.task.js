/*
 *  licodo.task.js
 *  task module for Licodo
*/

licodo.task = (function() {
    //---------Begin module scope variables
    var configmap = {
        main_html: String()
           +  '<ul class = "licodo-task-head">' +
                  '<li id = "licodo-task-all"  class = "licodo-task-hall licodo-task-processOn"></li>' +
                  '<li id = "licodo-task-done" class = "licodo-task-hdone"></li>' +
                  '<li id = "licodo-task-doing" class = "licodo-task-hdoing"></li>' +
              '</ul>' +
              '<div class = "licodo-task-main">' +

              '</div>' +
              '<div class = "licodo-task-new">' +
                  '<span class = "licodo-task-add">＋</span>' +
                  '<span class = "licodo-task-newTitle">新建任务</span>'+
              '</div>'
    },
        stateMap = {
             text_html: 'main_html',
             infoStr: null
        },
        selecorMap = {},
        initModule, onclickNew, onWhichDo, makeTask, sortDate, addTask, modifyTask, onclickHead;
    //Begin dom method
    // 对任务进行时间上的排序
    sortDate = function(date) {
        date.sort(function(a, b) {
            return a.replace(/-/g, '') - b.replace(/-/g, '');
        })
    }
    //编辑更改任务
    modifyTask = function(isTrue, title, time, content) {
        var target = $('.licodo-task-on')[0],
            subId = target.id,
            num = parseInt(subId.replace(/\D/g, '')),
            task = licodo.data.getStorage('task'),
            node = licodo.util.getObjByKey(task, 'id', num);
            
            if(!isTrue) {
                node.name = licodo.util.filterXSS(title);
                node.date = licodo.util.filterXSS(time);
                node.content = licodo.util.filterXSS(content);
            } else {
                node.isFinish = 'done';
            }

            licodo.data.saveStorage(task);
            makeTask($('.licodo-classify-on')[0]);
            addClass($('#licodo-task-item' + num)[0], 'licodo-task-on');
    }
    //新建任务
    addTask = function(title, time, content) {
        var onCate, onChildCate,
            target = $('.licodo-classify-on')[0],
            subId = target.parentNode.id,
            num = parseInt(subId.replace(/\D/g, '')),
            task = licodo.data.getStorage('task'),
            cate = licodo.data.getStorage('cate'),
            childCate =licodo.data.getStorage('childCate'),
            newTask = {
                "id": task[task.length - 1].id + 1,
                "name": licodo.util.filterXSS(title),
                "parent": 0,
                "isFinish": "doing",
                "date": licodo.util.filterXSS(time),
                "content": licodo.util.filterXSS(content)   
            };
        task.push(newTask);
        licodo.data.saveStorage(task);
        // 如果任务属于父分类
        if (hasClass(target.parentNode, 'licodo-classify-item')) {
            onCate = licodo.util.getObjByKey(cate, 'id', num);
            onCate.taskChild.push(newTask.id);
            licodo.data.saveStorage(cate); 
            //更新分类栏
            licodo.classify.makeItems();
            licodo.util.addClassOn($('#licodo-classify-item' + num)[0].childNodes[0], 'licodo-classify-on'); 
        } else {  //如果任务属于子分类
            onChildCate = licodo.util.getObjByKey(childCate, 'id', num);
            onChildCate.taskChild.push(newTask.id);
            licodo.data.saveStorage(childCate);  
            //更新分类栏
            licodo.classify.makeItems();
            licodo.util.addClassOn($('#licodo-classify-subItem' + num)[0].childNodes[0], 'licodo-classify-on');
        }
        //更新分类栏子标题的数量
        
        licodo.util.addClassOn($('#licodo-task-all')[0], 'licodo-task-processOn');
        makeTask($('.licodo-classify-on')[0]);
        addClass($('#licodo-task-item' + newTask.id)[0], 'licodo-task-on');
    }
    //生成任务列表
    makeTask = function(target, process) {
        var subId = target.parentNode.id,
            num = parseInt(subId.replace(/\D/g, '')), 
            cate = licodo.data.getStorage("cate"),
            childCate = licodo.data.getStorage("childCate"),
            task = licodo.data.getStorage("task"),
            taskDate = [],
            taskNode = [],
            processNode = [],
            timeNode = [],  
            taskItem, html = '';
        
        if (hasClass(target.parentNode, 'licodo-classify-item')) {
            node = licodo.util.getObjByKey(cate, 'id', num);
        } else {
            node = licodo.util.getObjByKey(childCate, 'id', num);
        }  
        if (node.taskChild.length == 0) {
            html += '<p class = "licodo-task-noTask">目前还没有任务哦</p>';
        }
      
        for (var i = 0; i < node.taskChild.length; i++) {
            
            taskItem = licodo.util.getObjByKey(task, 'id', node.taskChild[i]);
            // 获得此分类下的所有任务
            taskNode.push(taskItem);

        }
        
        //用于筛选任务是否完成
        if(process == 'done' || process == 'doing') {
            taskNode = licodo.util.getObjsByKey(taskNode, 'isFinish', process);
            if (taskNode.length == 0) {
                switch(process) {
                    case 'done':
                        html = '<p class = "licodo-task-noTask">还没有已完成任务哦</p>';
                        break;
                    case 'doing':
                        html = '<p class = "licodo-task-noTask">还没有未完成任务哦</p>';
                        break;
                }
            } 
        }
        // 获得任务的完成时间
        for (var i = 0; i < taskNode.length; i++) {
            taskDate.push(taskNode[i].date);

        }

        // 数组去重
        taskDate = uniqArray1(taskDate);
        // 对时间进行排序
        sortDate(taskDate);
        
        for (var j = 0; j < taskDate.length; j++) {
            html += ''
                +  '<p class = "licodo-task-time">' + taskDate[j] + '</p>'
                +  '<ul class = "licodo-task-ul" id = "licodo-task-ul' + j +'">'
                timeNode = licodo.util.getObjsByKey(taskNode, 'date', taskDate[j]);
                for (var m = 0; m < timeNode.length; m++) {
                    html += '' 
                        + '<li class = "licodo-task-item licodo-task-' + timeNode[m].isFinish 
                        +'" id = "licodo-task-item' + timeNode[m].id +'">' 
                        + timeNode[m].name +'</li>';
                }
            html += ''
                + '</ul>';
        };
        $('.licodo-task-main')[0].innerHTML = html;    
    }
    
    //Begin event method
    onclickNew = function() {
        if (hasClass($('.licodo-classify-main')[0], 'licodo-classify-on')) {
            stateMap.infoStr = '请选择所属分类';
            licodo.info.configModule({
                infoStr: stateMap.infoStr,
            })     
        } else {
            stateMap.text_html = 'sub_html';
            licodo.text.configModule({
                text_html: stateMap.text_html
            });
        }
    }
    
    onclickItem = function() {
        var  e = arguments[0] || window.event,
        target = e.srcElement ? e.srcElement : e.target;
        if(hasClass(target, 'licodo-task-item')) {
            licodo.util.addClassOn(target, 'licodo-task-on');

            //用于兼容移动端
            if(licodo.util.mobileFit()) {
                 
                licodo.shell.showPage($('.licodo-mobile-text')[0]);
            }
        } else {
            return false;
        }
        //用于切换text模块
        licodo.text.makeText(target);
        

    }

    onclickHead = function() {
        var  e = arguments[0] || window.event,
        target = e.srcElement ? e.srcElement : e.target,
        subId = target.id,
        process = subId.substring(12, subId.length);
        if(!hasClass(target, 'licodo-task-head')) {
            licodo.util.addClassOn(target, 'licodo-task-processOn');       
            //用于切换task选项
            if(hasClass($('.licodo-classify-on')[0], 'licodo-classify-itemName')) {
                makeTask($('.licodo-classify-on')[0], process);
                    //切换时选择默认任务
                if ($('#licodo-task-ul0')[0]) {
                    addClass($('#licodo-task-ul0')[0].childNodes[0], 'licodo-task-on');
                    //text栏默认选择第一个
                    licodo.text.makeText($('#licodo-task-ul0')[0].childNodes[0]);
                }  else {
                    licodo.text.makeText();
                }
            } else {
                stateMap.infoStr = '请选择所属分类';
                licodo.info.configModule({
                    infoStr: stateMap.infoStr,
                }) 
            }
        }
        
    }
    
    //Begin public method
    initModule = function(selecor) {
        selecor.innerHTML = configmap.main_html;
        makeTask($("#licodo-classify-item0 .licodo-classify-itemName")[0]);
        //为第一个任务添加on
        if ($('#licodo-task-ul0')[0]) {
            addClass($('#licodo-task-ul0')[0].childNodes[0], 'licodo-task-on');
        } 
        addClickEvent($(".licodo-task-new")[0], onclickNew);
        addClickEvent($(".licodo-task-main")[0], onclickItem);
        addClickEvent($(".licodo-task-head")[0], onclickHead);
    }
    
    return {
        modifyTask: modifyTask,
        addTask: addTask,
        initModule: initModule,
        makeTask: makeTask,
    };
})()