/*
    json2.js
    2015-05-03

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse. This file is provides the ES5 JSON capability to ES3 systems.
    If a project might run on IE8 or earlier, then this file should be included.
    This file does nothing on ES5 systems.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 
                            ? '0' + n 
                            : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date 
                    ? 'Date(' + this[key] + ')' 
                    : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint 
    eval, for, this 
*/

/*property
    JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';
    
    var rx_one = /^[\],:{}\s]*$/,
        rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
        rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        rx_four = /(?:^|:|,)(?:\s*\[)+/g,
        rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 
            ? '0' + n 
            : n;
    }
    
    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + '-' +
                        f(this.getUTCMonth() + 1) + '-' +
                        f(this.getUTCDate()) + 'T' +
                        f(this.getUTCHours()) + ':' +
                        f(this.getUTCMinutes()) + ':' +
                        f(this.getUTCSeconds()) + 'Z'
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap,
        indent,
        meta,
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string) 
            ? '"' + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string'
                    ? c
                    : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' 
            : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) 
                ? String(value) 
                : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap 
                                    ? ': ' 
                                    : ':'
                            ) + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap 
                                    ? ': ' 
                                    : ':'
                            ) + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return '\\u' +
                            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (
                rx_one.test(
                    text
                        .replace(rx_two, '@')
                        .replace(rx_three, ']')
                        .replace(rx_four, '')
                )
            ) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

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
            + '<div class = "licodo-classify-add">' +
                    '<span class = "licodo-task-add">＋</span>' +
                    '新建分类'  
            +  '</div>'
    },
        stateMap = {
            overMode: null,
            overBool: false,
            classifyMain: null,
            target: null,
            infoStr: null,
        },
        selectorMap = {},
        initModule, setSelectorMap, onclickNew, addClassOn, 
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
    addClassOn = function(target, classNameOn) {
        removeClass($('.' + classNameOn)[0], classNameOn);
        addClass(target, classNameOn);
    }
    addItems = function() {
        var c, idStr, newCate, newChildCate, subId, idLen,      
            cate = licodo.data.getStorage('cate'),
            childCate = licodo.data.getStorage('childCate');
        if ( hasClass( $('.licodo-classify-main')[0], 'licodo-classify-on') ) {
            
            newCate = {
                "id": cate[cate.length - 1].id + 1,
                "name": $('.licodo-overlay-input')[0].value,
                "child": [],
                "taskChild": [],
            };
            cate.push(newCate);
            //保存数据
            licodo.data.savaStorage(cate);
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
            licodo.data.savaStorage(cate);
            childCate.push(newChildCate);
            //保存数据
            licodo.data.savaStorage(childCate);
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
               +     '<span class = "licodo-classify-itemDel">x</span>'
            if (cate[i].child.length !== 0) {
                html += ''
                   +  '<ul class = "licodo-classify-subMain">';
                for (var j = 0; j < cate[i].child.length; j++) {
                    childNode = licodo.util.getObjByKey(childCate, 'id', cate[i].child[j]);
                    if (childNode) {
                        console.log(childNode.id);
                        html += ''
                            + '<li class = "licodo-classify-subItem" id = "licodo-classify-subItem' 
                            + childNode.id +'">'
                            +     '<span class = "licodo-classify-itemName">'
                            +          childNode.name  +   " (" + childNode.taskChild.length + ")"         
                            +     '</span>'
                            +     '<span class = "licodo-classify-itemDel licodo-classify-subItemDel">x</span>'      
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
            addClassOn(target, 'licodo-classify-on'); 
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
            addClassOn(target, 'licodo-classify-on'); 
            //任务栏切换
            licodo.task.makeTask(target);
            addClassOn($('#licodo-task-all')[0], 'licodo-task-processOn');
            //切换时选择默认任务
            if ($('#licodo-task-ul0')[0]) {
                addClass($('#licodo-task-ul0')[0].childNodes[0], 'licodo-task-on');
                //text栏默认选择第一个
                licodo.text.makeText($('#licodo-task-ul0')[0].childNodes[0]);
            } else {
                licodo.text.makeText();
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
    }
    return {
        initModule: initModule,
        setSelectorMap: setSelectorMap,
        addItems: addItems,
        makeItems: makeItems
    }

})()
/**
 *  licoda.data.js
 *  data module for licodo
 *
*/
licodo.data = (function() {

        //cate代表分类， childCate代表自分类， task代表任务
    var cate, childCate, task, 
        cateText, childCateText, taskText,

        getStorage, initModule, initData, storageInit, savaStorage;
    
    initData = function() {
        cateText = [
                {
                    "id": 0,
                    "name": "默认分类",
                    "child": [],
                    "taskChild": [0, 1, 3],
                },
                {
                    "id": 1,
                    "name": "百度ife",
                    "child": [0],
                    "taskChild": [2],
                }
            ],
        childCateText = [
               {
                   "id": 0,
                   "key": 0,
                   "name": "task0004",
                   "parent": 1,
                   "taskChild" : [4],
               },
            ],
        taskText = [
                {
                   "id": 0,
                   "name": "完成重构",
                   "parent": 0,
                   "isFinish": "doing",
                   "date": "2015-06-20",
                   "content": "对task3进行重新编码"
                },
                {
                   "id": 1,
                   "name": "完成移动端配适",
                   "parent": 0,
                   "isFinish": "done",
                   "date": "2015-06-21",
                   "content": "对移动端进行配适"
                },
                {
                   "id": 2,
                   "name": "完成重构3",
                   "parent": 0,
                   "isFinish": "doing",
                   "date": "2015-06-20",
                   "content": "对task3进行重新编码"
                },
                {
                   "id": 3,
                   "name": "完成移动端配适3",
                   "parent": 0,
                   "isFinish": "doing",
                   "date": "2015-06-21",
                   "content": "对移动端进行配适"
                },
                {
                   "id": 4,
                   "name": "完成移动端配适4",
                   "parent": 0,
                   "isFinish": "doing",
                   "date": "2015-06-21",
                   "content": "对移动端进行配适"
                }
            ]
    }
    //设置数据的原始值
    storageInit = function() {
        if (!localStorage.getItem('cate')) {       
            localStorage.setItem('cate', JSON.stringify(cateText));
            localStorage.setItem('childCate', JSON.stringify(childCateText));
            localStorage.setItem('task', JSON.stringify(taskText));    
        }
    
    }
    //用于获取数据
    getStorage = function(key) {
        switch(key) {
            case "cate": 
                cate = JSON.parse(localStorage.getItem("cate"));
                return cate;
                break;
            case "childCate":
                childCate = JSON.parse(localStorage.getItem("childCate"));
                return childCate;
                break;
            case "task":
                task = JSON.parse(localStorage.getItem("task"));
                return task;
                break; 
        }
    }
    //用于保存数据
    savaStorage = function(key) {
        switch(key) {
            case cate: 
                localStorage.setItem("cate", JSON.stringify(key));
                break;
            case childCate:
                localStorage.setItem("childCate", JSON.stringify(key));
                break;
            case task:
                localStorage.setItem("task", JSON.stringify(key));
                break;
        }
    }
    
    
    initModule = function() {
        initData();
        storageInit();
    }

    return {
        savaStorage: savaStorage,
        initModule: initModule,
        getStorage: getStorage
    };
})();
/*
 * info module for licodo
 * 
*/
 
licodo.info = (function() {
    //begin module scope variables
    var configmap = {
        settable_map: {
            infoStr: null,
        },

        infoStr: null
    },

    initModule, configModule, showInfo;
    configModule = function(input_map) {
        // Change the value in configmap
        licodo.util.setConfigMap({
            input_map: input_map,
            settable_map: configmap.settable_map,
            config_map: configmap
        });
        initModule();
    }
    showInfo = function() {
        if (configmap.infoStr !== null) {
            $('.licodo-shell-info')[0].innerHTML = configmap.infoStr;
            var x = 0 , y = 1;
            var t1 = setInterval(function() {
                if ( x > 1 ) {
                    clearInterval(t1);
                }
                x += 0.1;
                $('.licodo-shell-info')[0].style.opacity = x;
                $('.licodo-shell-info')[0].style.filter = "alpha(opacity="+(x*100)+")";
            }, 50);
       
            setTimeout(function() {
                $('.licodo-shell-info')[0].style.opacity = 0;
                $('.licodo-shell-info')[0].style.filter = 'alpha(opacity=0)';
            }, 2000);
        }
    }
    initModule = function() {
        showInfo();
    }
    return {
        configModule: configModule,
        initModule: initModule
    }
})()
/*
 * licodo.js 
 * root name module
*/

var licodo = (function() {

    var initModule = function(selector) {
        licodo.shell.initModule(selector);
        console.log("licop");
    }

    return {initModule: initModule};
})()

window.onload = function() {
    //var sel = document.getElementById('licodo');

    licodo.initModule($('#licodo')[0]);
    //console.log($('.licodo-shell-head'));

}



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
        onclickConfirm1, pageClick, onclickConfirm2, onclickConfirm3, sortNum;
    
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
            licodo.classify.addItems(obj);
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
            console.log(index);
            console.log(node);
            console.log(childCate[index]);
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
        licodo.data.savaStorage(task);
        licodo.data.savaStorage(cate);
        licodo.data.savaStorage(childCate);
        //刷新分类列表板块
        licodo.classify.makeItems();
        //刷新任务板块
        licodo.task.makeTask($('.licodo-classify-on')[0]);
        addClass($('#licodo-task-ul0')[0].childNodes[0], 'licodo-task-on');
        //刷新text板块
        licodo.text.makeText($('#licodo-task-ul0')[0].childNodes[0]);
        onclickCancel();
      
    }

    
    sortNum = function (arr, id) {
        for (var i = 0; i < arr.length; i++) {
            arr[i].id = i;
        }
        return arr;
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
            + '<div class = "licodo-shell-info"></div>',
    },
        stateMap = {

        },
        selectorMap = {},
        initModule, setSelectorMap;
    //------------Begin dom method
    setSelectorMap = function() {
        selectorMap = {
            $classify: $('.licodo-shell-classify')[0],
            $task: $('.licodo-shell-task')[0],
            $text: $('.licodo-shell-text')[0],
        }

    }
    //------------Begin public method
    initModule = function(selector) {
        localStorage.clear();
        selector.innerHTML = configmap.main_html;
        setSelectorMap();
        licodo.data.initModule();
        licodo.classify.initModule(selectorMap.$classify);
        licodo.task.initModule(selectorMap.$task);
        licodo.text.initModule(selectorMap.$text);

    }

    return {initModule: initModule};
})()
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
                  '新建任务'                    +
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
        console.log(target);
        var target = $('.licodo-task-on')[0],
            subId = target.id,
            num = parseInt(subId.replace(/\D/g, '')),
            task = licodo.data.getStorage('task'),
            node = licodo.util.getObjByKey(task, 'id', num);
            
            if(!isTrue) {
                node.name = title;
                node.date = time;
                node.content = content;
            } else {
                node.isFinish = 'done';
            }

            licodo.data.savaStorage(task);
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
                "name": title,
                "parent": 0,
                "isFinish": "doing",
                "date": time,
                "content": content
            };
        task.push(newTask);
        licodo.data.savaStorage(task);
        // 如果任务属于父分类
        if (hasClass(target.parentNode, 'licodo-classify-item')) {
            onCate = licodo.util.getObjByKey(cate, 'id', num);
            onCate.taskChild.push(newTask.id);
            licodo.data.savaStorage(cate); 
            //更新分类栏
            licodo.classify.makeItems();
            addClassOn($('#licodo-classify-item' + num)[0].childNodes[0], 'licodo-classify-on'); 
        } else {  //如果任务属于子分类
            onChildCate = licodo.util.getObjByKey(childCate, 'id', num);
            onChildCate.taskChild.push(newTask.id);
            licodo.data.savaStorage(childCate);  
            //更新分类栏
            licodo.classify.makeItems();
            addClassOn($('#licodo-classify-subItem' + num)[0].childNodes[0], 'licodo-classify-on');
        }
        //更新分类栏子标题的数量
        
        addClassOn($('#licodo-task-all')[0], 'licodo-task-processOn');
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
    //此函数可以进行复用
    addClassOn = function(target, classNameOn) {
        removeClass($('.' + classNameOn)[0], classNameOn);
        addClass(target, classNameOn);
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
        if (hasClass(target, 'licodo-task-item')) {
            addClassOn(target, 'licodo-task-on');
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
        addClassOn(target, 'licodo-task-processOn');       
        //用于切换task选项
        makeTask($('.licodo-classify-on')[0], process);
        //切换时选择默认任务
        if ($('#licodo-task-ul0')[0]) {
            addClass($('#licodo-task-ul0')[0].childNodes[0], 'licodo-task-on');
            //text栏默认选择第一个
            licodo.text.makeText($('#licodo-task-ul0')[0].childNodes[0]);
        }  else {
            licodo.text.makeText();
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
/*
 *  licodo.task.js
 *  task module for Licodo
*/

licodo.task = (function() {
    //---------Begin module scope variables
    var configmap = {
        main_html: String()
           +  '<ul class = "licodo-task-head">' +
                  '<li id = "licodo-task-all"></li>' +
                  '<li id = "licodo-task-done"></li>' +
                  '<li id = "licodo-task-doing"></li>' +
              '</ul>' +
              '<ul class = "licodo-task-main">' +
              '</ul>' +
              '<div class = "licodo-task-new">' +
                  '<span class = "licodo-task-add">＋</span>' +
                  '新建任务'                    +
              '</div>'
    },
        stateMap = {
             text_html: 'main_html',
        },
        selecorMap = {},
        initModule, onclickNew, onWhichDo, makeTask;
    //Begin dom method
    onWhichDo = function() {
        
    }

    makeTask = function(target) {
        var subId = target.parentNode.id, 
            cate = licodo.data.getStorage("cate"),
            childCate = licodo.data.getStorage("childCate"),
            task = licodo.data.getStorage("task"),
            cateId, childCateId;
            // 如果点击的是cate
            if (hasClass(target.parentNode, 'licodo-classify-item')) {
                cateId = parseInt(subId.substring(20, subId.length));
                //getObjById(task, 'id', )
                console.log(cateId);
            } else if (hasClass(target.parentNode, 'licodo-classify-subItem')) {  //如果点击childCate
                childCateId = parseInt(subId.substring(23, subId.length));
                console.log(childCateId);
            } else {
                return false;
            }
     
    }
    //Begin event method
    onclickNew = function() {
        stateMap.text_html = 'sub_html';
        licodo.text.configModule({
            text_html: stateMap.text_html
        });
    }
    
    //Begin public method
    initModule = function(selecor) {
        selecor.innerHTML = configmap.main_html;
        addClickEvent($(".licodo-task-new")[0], onclickNew);
    }

    return {
        initModule: initModule,
        makeTask: makeTask,
    };

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
/*
 * licodo.util.js
 * General Javascript Untilities
*/

licodo.util = (function() {
    var makeError, setConfigMap, getObjByKey, getIndexByKey;
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


    return {
        makeError: makeError,
        setConfigMap: setConfigMap,
        getObjByKey: getObjByKey,
        getObjsByKey: getObjsByKey,
        getIndexByKey: getIndexByKey
    }
})();


/*   A javascript plugin for the state managment through the uri anchor
 *   Jun 7 by licop
 *   参考 jquery.uriAnchor.js
*/

(function() {
    uriAnchor = (function() {
        //BEGIN SCOPE VARIABLES
        var configmap = {
            regex_clean1: /^[!#]*/,
            regex_clean2: /\?[^?]*$/
        },
        getErrorReject,   getVarType,       getCleanAnchorString,
        parseStringToMap, makeAnchorString, setAnchor,
        makeAnchorMap;

        //BEGIN UTILITY METHODS
        
        //用于抛出错误，来提醒框架的使用者出现错误的原因
        getErrorReject = function(message) {
            var error = new Error();
            error.name = 'Anchor Schema Reject';
            error.message = message;
            return error;
        }
        
        //用于判断数据类型
        // Returns 'Object', 'Array', 'String', 'Number', 'Boolean', 'Undefined', 'Null'
        getVarType = function(data) {
            if (data === null) {
                return null;
            } else if (data === undefined) {
                return undefined;
            } else {
                return {}.toString.call(data).slice(8, -1);
            }

        }   
        
        getCleanAnchorString = function() {
            var cleanAnchor = String(document.location.href.split('#')[1] || '')
                // 用于除去头部＃号!号
                .replace(configmap.regex_clean1, '')
                // 剪掉最后一个？后面的所有字符串
                .replace(configmap.regex_clean2, '');
            
            return cleanAnchor;
        }
        
        parseStringToMap = function(arg_map) {
            var input_string = arg_map.input_string || '',
                delimit_char = arg_map.delimit_char || '&',
                delimit_kv_char = arg_map.delimit_kv_char || '=',
                output_map = {},

                key_val_array, splitter_array, i;

            splitter_array = input_string.split(delimit_char);
            for (i = 0; i < splitter_array.length; i++) {
                
                key_val_array = splitter_array[i].split(delimit_kv_char);

                if (key_val_array.length == 0) {
                     continue;
                } 
                if (key_val_array.length == 1) {
                    //decodeURIComponent对uri进行解码
                     output_map[decodeURIComponent( key_val_array[0] )] = true;
                }
                if (key_val_array.length == 2) {
                     output_map[decodeURIComponent( key_val_array[0] )] = decodeURIComponent( key_val_array[1] );
                }
            }

            return output_map;
        }

        makeAnchorString = function(arg_map_in, option_map_in) {
            var arg_map = arg_map_in || {},
                option_map = option_map_in || {},
                delimit_char = option_map.delimit_char || '&',
                delimit_kv_char = option_map.delimit_kv_char || '=',
                sub_delimit_char = option_map.sub_delimit_char || ':',
                dep_delimit_char = option_map.dep_delimit_char || '|',
                dep_delimit_kv_char = option_map.dep_delimit_kv_char || ',',
                key_val_array       = [],

                schema_map_val, schema_map_dep, schema_map_dep_val,
                key_name, key_value, class_name, output_kv_string,
                sub_key_name, dep_map, dep_key_name, dep_key_value, dep_kv_array;
                
                if (getVarType(arg_map) !== 'Object') {
                    return false;
                };
                for (key_name in arg_map) {
                    if (arg_map.hasOwnProperty(key_name)) {
                        
                        if (!key_name) { continue; }
                        if (key_name.indexOf('_') == 0 ) { continue; }

                        key_value = arg_map[key_name];
                        output_kv_string = '';
                        class_name = getVarType(key_value);

                        if (key_value === undefined) {key_value = '';}
                        //过滤掉bool值为fasle的
                        if (class_name == 'Boolean') {
                            if (key_value) {output_kv_string = encodeURIComponent(key_name);}
                        } 
                        //String Number
                        else {
                            output_kv_string
                             += encodeURIComponent(key_name) 
                             + delimit_kv_char 
                             + encodeURIComponent(key_value)
                        }

                        sub_key_name = '_' + key_name;
                        if (arg_map.hasOwnProperty(sub_key_name)) {
                            dep_map = arg_map[sub_key_name];
                            dep_kv_array = [];
                        
                            for (dep_key_name in dep_map) {
                                if (dep_map.hasOwnProperty(dep_key_name)) {
                                   
                                    dep_key_value = dep_map[dep_key_name];
                                    if (class_name == 'Boolean') {
                                        if (dep_key_value = true) {
                                             dep_kv_array.push(encodeURIComponent(dep_key_name));
                                        }
                                    } else {
                                        dep_kv_array.push(
                                            encodeURIComponent(dep_key_name)
                                            + dep_delimit_kv_char
                                            + encodeURIComponent(dep_key_value)
                                        )
                                    }
                                }
                                
                            }
                            //如果有非独立元素则加上
                            if (dep_kv_array.length > 0) {
                                output_kv_string 
                                    += sub_delimit_char 
                                    + dep_kv_array.join(dep_delimit_char);

                            }
                        }
                        key_val_array.push(output_kv_string);
                    }
                }
            return key_val_array.join(delimit_char);
        }
   
        setAnchor = function(arg_map_in, option_map_in, replace_flag) {
            
            var argString = makeAnchorString(arg_map_in, option_map_in),
                uriString, uriArray;

            uriArray = document.location.href.split('#', 2);
            uriString = argString ? uriArray[0] + '#!' + argString : uriArray[0];

            if (replace_flag) {
                if (argString) {
                    document.location.replace(uriArray[0] + '#!' + argString);
                } else {
                    document.location.replace(uriArray[0]);
                }
            }

            document.location.href = uriString;
        }
        
        
        makeAnchorMap = function() {
            var
                anchor_string = getCleanAnchorString(),
                anchor_map, idx, keys_array, key_name, key_value, dep_array;

            if (anchor_string === '') { return {} };

            anchor_map = parseStringToMap({
                input_string: anchor_string,
                delimit_char: '&',
                delimit_kv_char: '='
            })
            keys_array = [];

            for (key_name in anchor_map) {
                if (anchor_map.hasOwnProperty(key_name)) {
                    keys_array.push(key_name);
                }
            }
            for (idx = 0; idx < keys_array.length; idx++) {
                key_name = keys_array[idx];
                key_value = anchor_map[key_name];
                if (getVarType(key_value) !== 'String' || key_name == '') {
                    continue;
                };
                anchor_map['_s_' + key_name] = key_value;
                
                dep_array = key_value.split(':');

                if (dep_array[1] && dep_array[1] !== 0) {
                    anchor_map[key_name] = dep_array[0];
                    anchor_map['_' + key_name] = parseStringToMap({
                        input_string: dep_array[1],
                        delimit_char: '|',
                        delimit_kv_char: ','
                    });
                }
            }
            return anchor_map;
        }
        //将内部函数暴露出来
        return {
            getVarType       : getVarType,
            makeAnchorMap    : makeAnchorMap,
            makeAnchorString : makeAnchorString,
            setAnchor        : setAnchor
        };
    
    })();

})();


/**
 * mini $
 *
 * @param {string} selector 选择器
 * @return {Array.<HTMLElement>} 返回匹配的元素列表
 */
function $(selector) {
    var idReg = /^#([\w_\-]+)/;
    var classReg = /^\.([\w_\-]+)/;
    var tagReg = /^\w+$/i;
    // [data-log]
    // [data-log="test"]
    // [data-log=test]
    // [data-log='test']
    var attrReg = /(\w+)?\[([^=\]]+)(?:=(["'])?([^\]"']+)\3?)?\]/;

    // 不考虑'>' 、`~`等嵌套关系
    // 父子选择器之间用空格相隔
    var context = document;

    function blank() {}

    function direct(part, actions) {
        actions = actions || {
            id: blank,
            className: blank,
            tag: blank,
            attribute: blank
        };
        var fn;
        var params = [].slice.call(arguments, 2);
        // id
        if (result = part.match(idReg)) {
            fn = 'id';
            params.push(result[1]);
        }
        // class
        else if (result = part.match(classReg)) {
            fn = 'className';
            params.push(result[1]);
        }
        // tag
        else if (result = part.match(tagReg)) {
            fn = 'tag';
            params.push(result[0]);
        }
        // attribute
        else if (result = part.match(attrReg)) {
            fn = 'attribute';
            var tag = result[1];
            var key = result[2];
            var value = result[4];
            params.push(tag, key, value);
        }
        return actions[fn].apply(null, params);
    }

    function find(parts, context) {
        var part = parts.pop();

        var actions = {
            id: function (id) {
                return [
                    document.getElementById(id)
                ];
            },
            className: function (className) {
                var result = [];
                if (context.getElementsByClassName) {
                    result = context.getElementsByClassName(className)
                }
                else {
                    var temp = context.getElementsByTagName('*');
                    for (var i = 0, len = temp.length; i < len; i++) {
                        var node = temp[i];
                        if (hasClass(node, className)) {
                            result.push(node);
                        }
                    }
                }
                return result;
            },
            tag: function (tag) {
                return context.getElementsByTagName(tag);
            },
            attribute: function (tag, key, value) {
                var result = [];
                var temp = context.getElementsByTagName(tag || '*');

                for (var i = 0, len = temp.length; i < len; i++) {
                    var node = temp[i];
                    if (value) {
                        var v = node.getAttribute(key);
                        (v === value) && result.push(node);
                    }
                    else if (node.hasAttribute(key)) {
                        result.push(node);
                    }
                }
                return result;
            }
        };

        var ret = direct(part, actions);

        // to array
        ret = [].slice.call(ret);

        return parts[0] && ret[0] ? filterParents(parts, ret) : ret;
    }

    function filterParents(parts, ret) {
        var parentPart = parts.pop();
        var result = [];

        for (var i = 0, len = ret.length; i < len; i++) {
            var node = ret[i];
            var p = node;

            while (p = p.parentNode) {
                var actions = {
                    id: function (el, id) {
                        return (el.id === id);
                    },
                    className: function (el, className) {
                         return hasClass(el, className);
                    },
                    tag: function (el, tag) {
                        return (el.tagName.toLowerCase() === tag);
                    },
                    attribute: function (el, tag, key, value) {
                        var valid = true;
                        if (tag) {
                            valid = actions.tag(el, tag);
                        }
                        valid = valid && el.hasAttribute(key);
                        if (value) {
                            valid = valid && (value === el.getAttribute(key))
                        }
                        return valid;
                    }
                };
                var matches = direct(parentPart, actions, p);

                if (matches) {
                    break;
                }
            }

            if (matches) {
                result.push(node);
            }
        }

        return parts[0] && result[0] ? filterParents(parts, result) : result;
    }

    var result = find(selector.split(/\s+/), context);

    return result;
}

/**
* 判断是否有某个className
* @param {HTMLElement} element 元素
* @param {string} className className
* @return {boolean}
*/
function hasClass(element, className) {
    var classNames = element.className;
    if (!classNames) {
        return false;
    }
    classNames = classNames.split(/\s+/);
    for (var i = 0, len = classNames.length; i < len; i++) {
        if (classNames[i] === className) {
            return true;
        }
    }
    return false;
}

/**
* 添加className
*
* @param {HTMLElement} element 元素
* @param {string} className className
*/
function addClass(element, className) {
    if (!hasClass(element, className)) {
        element.className = element.className ?[element.className, className].join(' ') : className;
    }
}

/**
* 删除元素className
* @param {HTMLElement} element 元素
* @param {string} className className
*/
function removeClass(element, className) {
    if (className && hasClass(element, className)) {
        var classNames = element.className.split(/\s+/);
        for (var i = 0, len = classNames.length; i < len; i++) {
            if (classNames[i] === className) {
                classNames.splice(i, 1);
                break;
            }
        }
    }
    element.className = classNames.join(' ');
}

/**
 * 判断是否是兄弟元素
 *
 * @param {HTMLElement} element html元素
 * @param {HTMLElement} siblingNode 判断元素
 * @return {boolean}
 */
function isSiblingNode(element, siblingNode) {
    for (var node = element.parentNode.firstChild; node; node = node.nextSibling) {
        if (node === siblingNode) {
            return true;
        }
    }
    return false;
}

/**
 * 获取元素相对于浏览器窗口左上角的位置
 * 注意：不是文档左上角，如果是相对于文档左上角，还需要加上scrollTop、scrollLeft
 *
 * @param {HTMLElement} element 元素
 * @return {Object} 位置
 */
function getPosition(element) {
    var box = element.getBoundingClientRect();
    return box;
}


// 为了便于查找绑定过的事件，增加了一级命名空间
$.event = {
    listeners: []
};


// 给一个element绑定一个针对event事件的响应，响应函数为listener
$.event.addEvent = function(element, type, listener) {
    type = type.replace(/^on/i, '').toLowerCase();

    var lis = $.event.listeners;

    var realListener = function (e) {
        if (typeof listener === 'function') {
            listener.call(element, e);
        }
    };

    if (element.addEventListener) {
        element.addEventListener(type, realListener, false);
    }
    else if (element.attachEvent) {
        element.attachEvent('on' + type, realListener);
    }

    lis[lis.length] = [element, type, listener, realListener];

    return element;
};

// 移除element对象对于event事件发生时执行listener的响应
$.event.removeEvent = function (element, type, listener) {
    type = type.replace(/^on/i, '').toLowerCase();

    var lis = $.event.listeners;
    var len = lis.length;

    while (len--) {
        var item = lis[len];
        var isRemoveAll = !listener;

        // listener存在时，移除element的所有以listener监听的type类型事件
        // listener不存在时，移除element的所有type类型事件
        if (item[1] === type
            && item[0] === element
            && (isRemoveAll || item[2] === listener)) {
            var realListener = item[3];

            if (element.removeEventListener) {
                element.removeEventListener(type, realListener, false);
            }
            else if (element.detachEvent) {
                element.detachEvent('on' + type, realListener);
            }

            lis.splice(len, 1);
        }
    }

    return element;
};

// 实现对click事件的绑定
function addClickEvent(element, listener) {
    return $.event.addEvent(element, 'click', listener);
}

// 实现对于按Enter键时的事件绑定
function addEnterEvent(element, listener) {
    return $.event.addEvent(element, 'keypress', function (e) {
        var event = e || window.event;
        var keyCode = event.which || event.keyCode;

        if (keyCode === 13) {
            listener.call(element, event);
        }
    });
}

// 事件代理
$.event.delegateEvent = function(element, tag, eventName, listener) {
    $.event.addEvent(element, eventName, function (e) {
        var event = e || window.event;
        var target = event.target || event.srcElement;

        if (target && target.tagName === tag.toUpperCase()) {
            listener.call(target, event);
        }
    });
}

$.on = function (selector, event, listener) {
    return $.event.addEvent($(selector), event, listener);
};

$.click = function (selector, listener) {
    return $.event.addEvent($(selector), 'click', listener);
};

$.un = function (selector, event, listener) {
    return $.event.removeEvent($(selector), 'click', listener);
};

$.delegate = function (selector, tag, event, listener) {
    return $.event.delegateEvent($(selector), tag, event, listener);
};




/**
 * @file util2
 * @author junmer
 * @description 数据类型及语言基础
 */


/**
 * 判断arr是否为一个数组，返回一个bool值
 *
 * @param  {any}  arr 目标对象
 * @return {boolean}        判断结果
 */
function isArray(arr) {
    return '[object Array]' === Object.prototype.toString.call(arr);
}

/**
 * 判断fn是否为一个函数，返回一个bool值
 *
 * @param  {any}  fn 目标对象
 * @return {boolean}        判断结果
 */
function isFunction(fn) {
    // chrome下,'function' == typeof /a/ 为true.
    return '[object Function]' === Object.prototype.toString.call(fn);
}

/**
 * 判断一个对象是不是字面量对象，即判断这个对象是不是由{}或者new Object类似方式创建
 *
 * 事实上来说，在Javascript语言中，任何判断都一定会有漏洞，因此本方法只针对一些最常用的情况进行了判断
 *
 * @returns {Boolean} 检查结果
 */
function isPlain(obj){
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        key;
    if ( !obj ||
         //一般的情况，直接用toString判断
         Object.prototype.toString.call(obj) !== "[object Object]" ||
         //IE下，window/document/document.body/HTMLElement/HTMLCollection/NodeList等DOM对象上一个语句为true
         //isPrototypeOf挂在Object.prototype上的，因此所有的字面量都应该会有这个属性
         //对于在window上挂了isPrototypeOf属性的情况，直接忽略不考虑
         !('isPrototypeOf' in obj)
       ) {
        return false;
    }

    //判断new fun()自定义对象的情况
    //constructor不是继承自原型链的
    //并且原型中有isPrototypeOf方法才是Object
    if ( obj.constructor &&
        !hasOwnProperty.call(obj, "constructor") &&
        !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
        return false;
    }
    //判断有继承的情况
    //如果有一项是继承过来的，那么一定不是字面量Object
    //OwnProperty会首先被遍历，为了加速遍历过程，直接看最后一项
    for ( key in obj ) {}
    return key === undefined || hasOwnProperty.call( obj, key );
}


/**
 * 对一个object进行深度拷贝
 *
 * 使用递归来实现一个深度克隆，可以复制一个目标对象，返回一个完整拷贝
 * 被复制的对象类型会被限制为数字、字符串、布尔、日期、数组、Object对象。不会包含函数、正则对象等
 *
 * @param  {Object} source 需要进行拷贝的对象
 * @return {Object} 拷贝后的新对象
 */
function cloneObject (source) {
    var result = source, i, len;
    if (!source
        || source instanceof Number
        || source instanceof String
        || source instanceof Boolean) {
        return result;
    } else if (isArray(source)) {
        result = [];
        var resultLen = 0;
        for (i = 0, len = source.length; i < len; i++) {
            result[resultLen++] = cloneObject(source[i]);
        }
    } else if (isPlain(source)) {
        result = {};
        for (i in source) {
            if (source.hasOwnProperty(i)) {
                result[i] = cloneObject(source[i]);
            }
        }
    }
    return result;
}

// 测试用例：
var srcObj = {
    a: 1,
    b: {
        b1: ["hello", "hi"],
        b2: "JavaScript"
    }
};
var abObj = srcObj;
var tarObj = cloneObject(srcObj);

srcObj.a = 2;
srcObj.b.b1[0] = "Hello";

// console.log(abObj.a);
// console.log(abObj.b.b1[0]);

// console.log(tarObj.a);      // 1
// console.log(tarObj.b.b1[0]);    // "hello"



/**
 * 对数组进行去重操作，只考虑数组中元素为数字或字符串，返回一个去重后的数组
 *
 * @param  {Array} source 需要过滤相同项的数组
 * @return {Array}        过滤后的新数组
 */
function uniqArray(source) {
    var len = source.length,
        result = source.slice(0),
        i, datum;


    // 从后往前双重循环比较
    // 如果两个元素相同，删除后一个
    while (--len > 0) {
        datum = result[len];
        i = len;
        while (i--) {
            if (datum === result[i]) {
                result.splice(len, 1);
                break;
            }
        }
    }

    return result;
}

// hash
function uniqArray1(arr) {
    var obj = {};
    var result = [];
    for (var i = 0, len = arr.length; i < len; i++) {

        var key = arr[i];

        if (!obj[key]) {
            result.push(key);
            obj[key] = true;
        }
    }
    return result;
}


// hash + es5
function uniqArray2(arr) {
    var obj = {};
    for (var i = 0, len = arr.length; i < len; i++) {
        obj[arr[i]] = true;
    }
    return Object.keys(obj);
}

// 使用示例
var a = [1, 3, 5, 7, 5, 3];
var b = uniqArray(a);
//console.log(b); // [1, 3, 5, 7]


var al = 10000;
var a = [];
while (al--){
    a.push(al%2);
}

/*
console.time('uniqArray')
console.log(uniqArray(a).length);
console.timeEnd('uniqArray')

console.time('uniqArray1')
console.log(uniqArray1(a).length);
console.timeEnd('uniqArray1')

console.time('uniqArray2')
console.log(uniqArray2(a).length);
console.timeEnd('uniqArray2')
*/

// 中级班同学跳过此题
// 实现一个简单的trim函数，用于去除一个字符串，头部和尾部的空白字符
// 假定空白字符只有半角空格、Tab
// 练习通过循环，以及字符串的一些基本方法，分别扫描字符串str头部和尾部是否有连续的空白字符，并且删掉他们，最后返回一个完成去除的字符串
function simpleTrim(str) {

    function isEmpty(c) {
        return /\s/.test(c);
    }

    for (var i = 0, l = str.length; i < l; i++) {
        if (!isEmpty(str.charAt(i))) {
            break;
        }
    }

    for (var j = str.length; j > 0; j--) {
        if (!isEmpty(str.charAt(j - 1))) {
            break;
        }
    }

    if (i > j) {
        return '';
    }

    return str.substring(i, j);
}

simpleTrim(' \t trimed   ')

/**
 * 很多同学肯定对于上面的代码看不下去，接下来，我们真正实现一个trim
 * 对字符串头尾进行空格字符的去除、包括全角半角空格、Tab等，返回一个字符串
 * 尝试使用一行简洁的正则表达式完成该题目
 *
 * @param  {string} source 目标字符串
 * @return {string} 删除两端空白字符后的字符串
 */
function trim(str) {

    var trimer = new RegExp("(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g");

    return String(str).replace(trimer, "");

}

// 使用示例
var str = '   hi!  ';
str = trim(str);
// console.log(str); // 'hi!'

// 实现一个遍历数组的方法，针对数组中每一个元素执行fn函数，并将数组索引和元素作为参数传递
function each(arr, fn) {
    for (var i = 0, l = arr.length; i < l; i++) {
        fn(arr[i], i);
    }
}

// 其中fn函数可以接受两个参数：item和index

// 使用示例
var arr = ['java', 'c', 'php', 'html'];
function output(item) {
    console.log(item)
}
// each(arr, output);  // java, c, php, html

// 使用示例
var arr = ['java', 'c', 'php', 'html'];
function output(item, index) {
    console.log(index + ': ' + item)
}
// each(arr, output);  // 0:java, 1:c, 2:php, 3:html


/**
 * 获取一个对象里面第一层元素的数量，返回一个整数
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
 *
 * @param  {Object} obj
 * @return {number} 元素长度
 */
var getObjectLength = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({
            toString: null
        }).propertyIsEnumerable('toString'),
        dontEnums = [
            'toString',
            'toLocaleString',
            'valueOf',
            'hasOwnProperty',
            'isPrototypeOf',
            'propertyIsEnumerable',
            'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
        if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
            throw new TypeError('getObjectLength called on non-object');
        }

        var result = [],
            prop, i;

        for (prop in obj) {
            if (hasOwnProperty.call(obj, prop)) {
                result.push(prop);
            }
        }

        if (hasDontEnumBug) {
            for (i = 0; i < dontEnumsLength; i++) {
                if (hasOwnProperty.call(obj, dontEnums[i])) {
                    result.push(dontEnums[i]);
                }
            }
        }
        return result.length;
    };
}());

// 使用示例
var obj = {
    a: 1,
    b: 2,
    c: {
        c1: 3,
        c2: 4
    }
};
// console.log(getObjectLength(obj)); // 3

// todo 用 shicai　代码

// 为dom增加一个样式名为newClassName的新样式
function addClass(element, newClassName) {
    var result;
    var valid = typeof newClassName === "string";

    if (valid) {
        var classes = (newClassName || "").match(/\S+/g) || [];
        var elemClasses = element.className;
        var cur = element.nodeType === 1 && (elemClasses ?
                (" " + elemClasses + " ").replace(/[\t\r\n\f]/g, " ") :
                " ");
        if (cur) {
            var len = classes.length;
            for (var i = 0; i < len; i++) {
                if (cur.indexOf(" " + classes[i] + " ") < 0) {
                    cur += classes[i] + " ";
                }
            }

            result = trim(cur);
            if (elemClasses !== result) {
                element.className = result;
            }
        }
    }
}
// 移除dom中的样式oldClassName
function removeClass(element, oldClassName) {
    var result;
    var valid = typeof oldClassName === "string";

    if (valid) {
        var classes = (oldClassName || "").match(/\S+/g) || [];
        var elemClasses = element.className;
        var cur = element.nodeType === 1 && (elemClasses ?
            (" " + elemClasses + " ").replace(/[\t\r\n\f]/g, " ") :
            " ");
        if (cur) {
            var len = classes.length;
            for (var i = 0; i < len; i++) {
                if (cur.indexOf(" " + classes[i] + " ") >= 0) {
                    cur = cur.replace(" " + classes[i] + " ", " ");
                }
            }

            result = trim(cur);
            if (elemClasses !== result) {
                element.className = result;
            }
        }
    }
}
// 判断siblingNode和dom是否为同一个父元素下的同一级的元素，返回bool值
function isSiblingNode(element, siblingNode) {
    return element.parentNode === siblingNode.parentNode;
}

// 获取dom相对于浏览器窗口的位置，返回一个对象{x, y}
function getPosition(element) {
    var x = 0;
    var y = 0;
    var current = element;
    var pre = null;

    while (current !== null) {
        x += current.offsetLeft;
        y += current.offsetTop;
        pre = current;
        current = current.offsetParent;
    }

    return {x: x, y: y};
}


// mini selector
/*
function $(selector) {
    return document.querySelector(selector);
}
*/



/**
 * 判断是否为邮箱地址
 *
 * @param  {string}  emailStr 目标字符串
 * @return {boolean}          结果
 */
function isEmail(emailStr) {
    return /^([\w_\.\-\+])+\@([\w\-]+\.)+([\w]{2,10})+$/.test(emailStr);
}

// console.log(isEmail('lj.meng@s.baidu.com'))


/**
 * 判断是否为手机号
 * 简单判断 不考虑 (+86) 185 xxxx xxxx
 *
 * @param  {string}  phone 目标字符串
 * @return {boolean}          结果
 */
function isMobilePhone(phone) {
    return /^1\d{10}$/.test(phone);
}

// console.log(isMobilePhone('18512341234'))





// ------------------------------------------------------------------
// 判断IE版本号，返回-1或者版本号
// ------------------------------------------------------------------

// 首先要说明的是，各种判断浏览器版本的方法，难在所有环境下都正确。navigator下的字段容易被任意篡改。
// 所以在实际场景下，如果可能的话，避免使用获取IE版本号的方式来处理问题，
// 更推荐的是直接判断浏览器特性（http://modernizr.com/）而非从浏览器版本入手。

// 这是传统的userAgent + documentMode方式的ie版本判断。
// 这在大多数对老IE问题进行hack的场景下有效果。
function isIE() {
    return /msie (\d+\.\d+)/i.test(navigator.userAgent)
        ? (document.documentMode || + RegExp['\x241']) : undefined;
}





// ------------------------------------------------------------------
// 设置cookie
// ------------------------------------------------------------------


function isValidCookieName(cookieName) {
    // http://www.w3.org/Protocols/rfc2109/rfc2109
    // Syntax:  General
    // The two state management headers, Set-Cookie and Cookie, have common
    // syntactic properties involving attribute-value pairs.  The following
    // grammar uses the notation, and tokens DIGIT (decimal digits) and
    // token (informally, a sequence of non-special, non-white space
    // characters) from the HTTP/1.1 specification [RFC 2068] to describe
    // their syntax.
    // av-pairs   = av-pair *(";" av-pair)
    // av-pair    = attr ["=" value] ; optional value
    // attr       = token
    // value      = word
    // word       = token | quoted-string

    // http://www.ietf.org/rfc/rfc2068.txt
    // token      = 1*<any CHAR except CTLs or tspecials>
    // CHAR       = <any US-ASCII character (octets 0 - 127)>
    // CTL        = <any US-ASCII control character
    //              (octets 0 - 31) and DEL (127)>
    // tspecials  = "(" | ")" | "<" | ">" | "@"
    //              | "," | ";" | ":" | "\" | <">
    //              | "/" | "[" | "]" | "?" | "="
    //              | "{" | "}" | SP | HT
    // SP         = <US-ASCII SP, space (32)>
    // HT         = <US-ASCII HT, horizontal-tab (9)>

    return (new RegExp('^[^\\x00-\\x20\\x7f\\(\\)<>@,;:\\\\\\\"\\[\\]\\?=\\{\\}\\/\\u0080-\\uffff]+\x24'))
        .test(cookieName);
}

function setCookie(cookieName, cookieValue, expiredays) {
    if (!isValidCookieName(cookieName)) {
        return;
    }

    var expires;
    if (expiredays != null) {
        expires = new Date();
        expires.setTime(expires.getTime() + expiredays * 24 * 60 * 60 * 1000);
    }

    document.cookie =
        cookieName + '=' + encodeURIComponent(cookieValue)
        + (expires ? '; expires=' + expires.toGMTString() : '');
}

function getCookie(cookieName) {
    if (isValidCookieName(cookieName)) {
        var reg = new RegExp('(^| )' + cookieName + '=([^;]*)(;|\x24)');
        var result = reg.exec(document.cookie);

        if (result) {
            return result[2] || null;
        }
    }

    return null;
}




// ------------------------------------------------------------------
// Ajax
// ------------------------------------------------------------------

/**
 * @param {string} url 发送请求的url
 * @param {Object} options 发送请求的选项参数
 * @config {string} [options.type] 请求发送的类型。默认为GET。
 * @config {Object} [options.data] 需要发送的数据。
 * @config {Function} [options.onsuccess] 请求成功时触发，function(XMLHttpRequest xhr, string responseText)。
 * @config {Function} [options.onfail] 请求失败时触发，function(XMLHttpRequest xhr)。
 *
 * @returns {XMLHttpRequest} 发送请求的XMLHttpRequest对象
 */
function ajax(url, options) {
    var options = options || {};
    var data = stringifyData(options.data || {});
    var type = (options.type || 'GET').toUpperCase();
    var xhr;
    var eventHandlers = {
        onsuccess: options.onsuccess,
        onfail: options.onfail
    };

    try {
        if (type === 'GET' && data) {
            url += (url.indexOf('?') >= 0 ? '&' : '?') + data;
            data = null;
        }

        xhr = getXHR();
        xhr.open(type, url, true);
        xhr.onreadystatechange = stateChangeHandler;

        // 在open之后再进行http请求头设定
        if (type === 'POST') {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.send(data);
    }
    catch (ex) {
        fire('fail');
    }

    return xhr;

    function stringifyData(data) {
        // 此方法只是简单示意性实现，并未考虑数组等情况。
        var param = [];
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                param.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
            }
        }
        return param.join('&');
    }

    function stateChangeHandler() {
        var stat;
        if (xhr.readyState === 4) {
            try {
                stat = xhr.status;
            }
            catch (ex) {
                // 在请求时，如果网络中断，Firefox会无法取得status
                fire('fail');
                return;
            }

            fire(stat);

            // http://www.never-online.net/blog/article.asp?id=261
            // case 12002: // Server timeout
            // case 12029: // dropped connections
            // case 12030: // dropped connections
            // case 12031: // dropped connections
            // case 12152: // closed by server
            // case 13030: // status and statusText are unavailable

            // IE error sometimes returns 1223 when it
            // should be 204, so treat it as success
            if ((stat >= 200 && stat < 300)
                || stat === 304
                || stat === 1223) {
                fire('success');
            }
            else {
                fire('fail');
            }

            /*
             * NOTE: Testing discovered that for some bizarre reason, on Mozilla, the
             * JavaScript <code>XmlHttpRequest.onreadystatechange</code> handler
             * function maybe still be called after it is deleted. The theory is that the
             * callback is cached somewhere. Setting it to null or an empty function does
             * seem to work properly, though.
             *
             * On IE, there are two problems: Setting onreadystatechange to null (as
             * opposed to an empty function) sometimes throws an exception. With
             * particular (rare) versions of jscript.dll, setting onreadystatechange from
             * within onreadystatechange causes a crash. Setting it from within a timeout
             * fixes this bug (see issue 1610).
             *
             * End result: *always* set onreadystatechange to an empty function (never to
             * null). Never set onreadystatechange from within onreadystatechange (always
             * in a setTimeout()).
             */
            window.setTimeout(
                function() {
                    xhr.onreadystatechange = new Function();
                    xhr = null;
                },
                0
            );
        }
    }

    function getXHR() {
        if (window.ActiveXObject) {
            try {
                return new ActiveXObject('Msxml2.XMLHTTP');
            }
            catch (e) {
                try {
                    return new ActiveXObject('Microsoft.XMLHTTP');
                }
                catch (e) {}
            }
        }
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        }
    }

    function fire(type) {
        type = 'on' + type;
        var handler = eventHandlers[type];

        if (!handler) {
            return;
        }
        if (type !== 'onsuccess') {
            handler(xhr);
        }
        else {
            //处理获取xhr.responseText导致出错的情况,比如请求图片地址.
            try {
                xhr.responseText;
            }
            catch(error) {
                return handler(xhr);
            }
            handler(xhr, xhr.responseText);
        }
    }
}