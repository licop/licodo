/*
 * licodo.util.js
 * General Javascript Untilities
*/

licodo.util = (function() {
    var makeError, setConfigMap, getObjByKey, mobileFit,
        getIndexByKey, addClassOn, filterXSS, toggleClass;
    
    makeError = function(name_text, msg_text, data) {
        var error = new Error();
        error.name = name_text;
        error.message = msg_text;
        if (data) {
            error.data = data;
        }
        return error;
    }
    //用于同步对象
    setConfigMap = function(arg_map) {
        var input_map = arg_map.input_map,
            settable_map = arg_map.settable_map,
            config_map = arg_map.config_map,
            keyName, error;
        for (keyName in input_map) {
            if (input_map.hasOwnProperty(keyName)) {
                if (settable_map.hasOwnProperty(keyName)) {
                    config_map[keyName] = input_map[keyName];
                }
                else {
                    error = makeError("Bad input", "setting config key" + keyName + "is not support");
                    throw(error);
                }
            }
        }
    }
    //根据键值获取对象
    getObjByKey = function(obj, key, value) {
        for (var i = 0; i < obj.length; i++) {
            if (obj[i][key] === value) {
                return obj[i];
            } 
        }  
    }
    //根据键值获得多个对象
    getObjsByKey = function(obj, key, value) {
        var objArr = [];
        for (var i = 0; i < obj.length; i++) {
            if (obj[i][key] === value) {
                objArr.push(obj[i]);
            } 
        } 
        return objArr;
    }
    //根据键值获得对象所在的位置
    getIndexByKey = function(obj, key, value) {
        for (var i = 0; i < obj.length; i++) {
            if (obj[i][key] === value) {
                return i;
            } 
        }  
    }
   
    addClassOn = function(target, classNameOn) {
        removeClass($('.' + classNameOn)[0], classNameOn);
        addClass(target, classNameOn);
    }
    /**
    toggleClass = function(target, nameRemove, nameAdd) {
        removeClass(target, nameRemove);
        addClass(target,nameAdd);
    }
    */
    toggleClass = function(target, nameAdd) {
        var reg = /page$/g;
        for (var i = 0; i < target.classList.length; i++) {
            if (reg.test(target.classList[i])) {
                removeClass(target, target.classList[i]);
            }
        }
        addClass(target,nameAdd);
    }

    //判断是否为移动端或者屏幕宽度小于860px
    mobileFit = function() {
        var winWidth, 
            isMobile = navigator.userAgent.match(/(iPhone|iPod|Android|ios|ipad|BlackBerry|IEMobile)/i);
        if (window.innerWidth) {
            winWidth = window.innerWidth; 
        }  else if ((document.body) && (document.body.clientWidth)) {
            winWidth = document.body.clientWidth; 
        }
        if ((winWidth < 860) || isMobile) {
            return true;
        } else {
            return false;
        }
    }
   //用于html转码，防止xss注入
    filterXSS = function(html) {
        return html.replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#x27;")
            .replace(/\//g, "&#x2f")
    } 
    return {
        makeError: makeError,
        setConfigMap: setConfigMap,
        getObjByKey: getObjByKey,
        getObjsByKey: getObjsByKey,
        getIndexByKey: getIndexByKey,
        addClassOn: addClassOn,
        filterXSS: filterXSS,
        toggleClass: toggleClass,
        mobileFit: mobileFit,
    }

})();

