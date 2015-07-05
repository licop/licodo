/*
 *  licodo.classify.js
 *  classify module for licodo
*/

licodo.classify = (function() {
    //begin module scope variables
    var configmap = {
        main_html: String()
            + '<div class = "licodo-classify-head">'
                + '所有任务'
                
            + '</div>'
            + '<ul class = "licodo-classify-main">'
                
            + '</ul>'
           // + '<div class = "licodo-classify-trash">回收站</div>'
            + '<div class = "licodo-classify-add">' 
            +      '<span class = "licodo-task-add">＋</span>' 
            +      '<span class = "licodo-classify-newTitle">新建分类</span> '
            +  '</div>',
    },
        stateMap = {
            overMode: null,
            overBool: false,
            classifyMain: null,
            target: null,
            infoStr: null,
        },
        selectorMap = {},
        initModule, setSelectorMap, onclickNew, onTouchItem,
        onclickItem, onclickLength, removeClassOn, addItems, makeItems;
    
    //Begin dom method
    setSelectorMap = function() {
        selectorMap = {
            $overlay: $('.licodo-shell-overlay')[0] || '',
            $add: $('.licodo-classify-add')[0] || '',
            $classifyMain: $('.licodo-classify-main')[0] || '',
            $classifyItem: $('.licodo-classify-item') || '',
        }
    }
    addItems = function() {
        var c, idStr, newCate, newChildCate, subId, idLen,      
            cate = licodo.data.getStorage('cate'),
            childCate = licodo.data.getStorage('childCate');
        if ( hasClass( $('.licodo-classify-main')[0], 'licodo-classify-on') ) {
            
            newCate = {
                "id": cate[cate.length - 1].id + 1,
                "name": licodo.util.filterXSS($('.licodo-overlay-input')[0].value), //xss防护
                "child": [],
                "taskChild": [],
            };
            cate.push(newCate);
            //保存数据
            licodo.data.saveStorage(cate);
        } else {
            subId = $('.licodo-classify-on')[0].parentNode.id;
            idStr = '#' + subId;
            //获取id的值
            idLen = (childCate.length != 0) ? (childCate[childCate.length - 1].id + 1) : 0;
            newChildCate = {
                "id": idLen,
                "key": childCate.length,
                "name": $('.licodo-overlay-input')[0].value,
                "parent": parseInt(subId.substring(20, subId.length)),
                "taskChild": [],
            };
            
            var parent = licodo.util.getObjByKey(cate, 'id', newChildCate.parent);
            parent.child.push(newChildCate.id);
            licodo.data.saveStorage(cate);
            childCate.push(newChildCate);
            //保存数据
            licodo.data.saveStorage(childCate);
        }
        //刷新分类栏
        makeItems();
        licodo.classify.setSelectorMap();
    }
    //生成分类列表
    makeItems = function() {
        var childNode,
            cate = licodo.data.getStorage("cate"),
            childCate = licodo.data.getStorage("childCate"),
            html = '';
        for (var i = 0; i < cate.length; i++) {
            html += ''
               +  '<li class = "licodo-classify-item" id = "licodo-classify-item' + cate[i].id + '">'
               +      '<span class = "licodo-classify-itemName">'
               +           cate[i].name + " (" + cate[i].taskChild.length + ")"
               +      '</span>'
               +     '<span class = "licodo-classify-itemDel"></span>'
            if (cate[i].child.length !== 0) {
                html += ''
                   +  '<ul class = "licodo-classify-subMain">';
                for (var j = 0; j < cate[i].child.length; j++) {
                    childNode = licodo.util.getObjByKey(childCate, 'id', cate[i].child[j]);
                    if (childNode) {
                        html += ''
                            + '<li class = "licodo-classify-subItem" id = "licodo-classify-subItem' 
                            + childNode.id +'">'
                            +     '<span class = "licodo-classify-itemName">'
                            +          childNode.name  +   " (" + childNode.taskChild.length + ")"         
                            +     '</span>'
                            +     '<span class = "licodo-classify-itemDel licodo-classify-subItemDel"></span>'      
                            + '</li>'
                    }
                }
                html += ''
                    +  '</ul>';
            }
            html += ''
                +  '</li>'

        }
        $('.licodo-classify-main')[0].innerHTML = html;
        $('#licodo-classify-item0')[0].childNodes[1].style.display = 'none';
        addClass($('#licodo-classify-item0')[0].childNodes[0], 'licodo-classify-on');
        
        if (hasClass( $('.licodo-classify-main')[0], 'licodo-classify-on' )) {
            removeClass($('.licodo-classify-main')[0], 'licodo-classify-on');
        }
    }

    //----begin event handlers
    onclickNew = function() {
        if ( hasClass( $('#licodo-classify-item0')[0], 'licodo-classify-on') 
            || hasClass( $('#licodo-classify-item0')[0].childNodes[0], 'licodo-classify-on')) {
            stateMap.infoStr = '默认任务不能添加子分类';
            licodo.info.configModule({
                infoStr: stateMap.infoStr,
            })
        } else if($('.licodo-classify-on')[0].parentNode.className.indexOf('licodo-classify-subItem') == 0) {
            stateMap.infoStr = '子分类不能添加子分类';
            licodo.info.configModule({
                infoStr: stateMap.infoStr,
            })
        } else {
            stateMap.overMode = 1;
            stateMap.overBool = true;
            licodo.overlay.configModule({
                overMode: stateMap.overMode,
                overBool: stateMap.overBool,
            });
        }
    }
    //当点击任务列表时 
    onclickItem = function() {
        var  e = arguments[0] || window.event,
        target = e.srcElement ? e.srcElement : e.target;
        
        if (hasClass(target, 'licodo-classify-main')) {
            licodo.util.addClassOn(target, 'licodo-classify-on'); 
        } else if (hasClass(target, 'licodo-classify-itemDel')) {
           
            stateMap.overMode = 2;
            stateMap.overBool = true;
            stateMap.target = target;
            licodo.overlay.configModule({
                overMode: stateMap.overMode,
                overBool: stateMap.overBool,
                target: stateMap.target
            });

        } else { 
            licodo.util.addClassOn(target, 'licodo-classify-on'); 
            //任务栏切换
            licodo.task.makeTask(target);
            licodo.util.addClassOn($('#licodo-task-all')[0], 'licodo-task-processOn');
            //切换时选择默认任务
            if ($('#licodo-task-ul0')[0]) {
                addClass($('#licodo-task-ul0')[0].childNodes[0], 'licodo-task-on');
                //text栏默认选择第一个
                licodo.text.makeText($('#licodo-task-ul0')[0].childNodes[0]);
            } else {
                licodo.text.makeText();
            }
        }
        
        if (licodo.util.mobileFit()) {
            if (!hasClass(target, 'licodo-classify-main') && !hasClass(target, 'licodo-classify-itemDel') ) {
                /*
                licodo.util.toggleClass($(".licodo-shell-classify")[0],  'pre-page');
                licodo.util.toggleClass($(".licodo-shell-task")[0],  'current-page'); 
                licodo.util.toggleClass($(".licodo-shell-text")[0], 'next-page');  
                */
                licodo.shell.showPage($('.licodo-mobile-task')[0]);
            }
        }
    }
    
    //----begin public method
    initModule = function(selector) {
        selector.innerHTML = configmap.main_html;
        setSelectorMap();
        makeItems();
        //从data中获取li添加到licodo-classify-main中
        licodo.overlay.initModule(selectorMap.$overlay);
        addClickEvent(selectorMap.$add, onclickNew);
        addClickEvent(selectorMap.$classifyMain, onclickItem);
        $.on(selectorMap.$classifyMain, "touchstart", onclickItem);        
    }

    return {
        initModule: initModule,
        setSelectorMap: setSelectorMap,
        addItems: addItems,
        makeItems: makeItems
    }

})()