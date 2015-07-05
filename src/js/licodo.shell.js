/*
 * licodo.shell.js
 * Shell.module for Licodo
*/

licodo.shell = (function() {
    //------------Begin module scope variables
    var configmap = {
        main_html: String()
            + '<div class = "licodo-shell-head">'
                + '<div class = "licodo-shell-logo"></div>'
                + '<ul class = "licodo-shell-links">'
                    + '<li id = "link-item1"><a href = "http://www.cnblogs.com/licop/" target = "_blank"></a></li>'
                    + '<li id = "link-item2"><a href = "https://github.com/licop" target = "_blank"></a></li>'
                    + '<li id = "link-item3"><a href = "http://weibo.com/licoop" target = "_blank"></a></li>'
                +  '</ul>'
            + '</div>'
            + '<div class = "licodo-shell-contain">'
                + '<div class = "licodo-shell-classify"></div>'
                + '<div class = "licodo-shell-task"></div>'
                + '<div class = "licodo-shell-text"></div>'
            + '</div>'
            + '<div class = "licodo-shell-overlay"></div>'
            + '<div class = "licodo-shell-info"></div>'
       
            + '<ul class = "licodo-mobile">'
                + '<li class = "licodo-mobile-classify"></li>'
                + '<li class = "licodo-mobile-task"></li>'
                + '<li class = "licodo-mobile-text"></li>'
            + '</ul>'
    },
        stateMap = {

        },
        selectorMap = {},
        initModule, setSelectorMap, showPage;
    //------------Begin dom method
    setSelectorMap = function() {
        selectorMap = {
            $classify: $('.licodo-shell-classify')[0],
            $task: $('.licodo-shell-task')[0],
            $text: $('.licodo-shell-text')[0],
        }

    }
    showPage= function(current) {
        var  e = arguments[0] || window.event,
        target1 = e.srcElement ? e.srcElement : e.target,
        target = target1 || current;
        if (hasClass(target, 'licodo-mobile-classify')) {
            licodo.util.toggleClass($(".licodo-shell-classify")[0],  'current-page');
            licodo.util.toggleClass($(".licodo-shell-task")[0],  'next-page'); 
            licodo.util.toggleClass($(".licodo-shell-text")[0], 'next-next-page');
            licodo.util.addClassOn($('.licodo-mobile-classify')[0], 'licodo-mobile-on'); 
        } else if (hasClass(target, 'licodo-mobile-task')) {
            licodo.util.toggleClass($(".licodo-shell-classify")[0],  'pre-page');
            licodo.util.toggleClass($(".licodo-shell-task")[0],  'current-page'); 
            licodo.util.toggleClass($(".licodo-shell-text")[0], 'next-page');
            licodo.util.addClassOn($('.licodo-mobile-task')[0], 'licodo-mobile-on');  
        } else if (hasClass(target, 'licodo-mobile-text')) {
            licodo.util.toggleClass($(".licodo-shell-classify")[0],  'pre-pre-page');
            licodo.util.toggleClass($(".licodo-shell-task")[0],  'pre-page'); 
            licodo.util.toggleClass($(".licodo-shell-text")[0], 'current-page');
            licodo.util.addClassOn($('.licodo-mobile-text')[0], 'licodo-mobile-on'); 
        };
    }

    //------------Begin public method
    initModule = function(selector) {
        //localStorage.clear();
        selector.innerHTML = configmap.main_html;
        setSelectorMap();
        licodo.data.initModule();
        licodo.classify.initModule(selectorMap.$classify);
        licodo.task.initModule(selectorMap.$task);
        licodo.text.initModule(selectorMap.$text);
        addClickEvent($(".licodo-mobile")[0], showPage);
        $.on($(".licodo-mobile")[0], "touchstart", showPage);  
        addClass($(".licodo-shell-classify")[0], 'current-page');
        addClass($(".licodo-shell-task")[0], 'next-page'); 
        addClass($(".licodo-shell-text")[0], 'next-next-page');  
        addClass($('.licodo-mobile-classify')[0], 'licodo-mobile-on')
    }

    return {
        initModule: initModule,
        showPage: showPage,
    };
})()