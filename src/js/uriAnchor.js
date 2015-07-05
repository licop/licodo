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