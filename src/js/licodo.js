/*
 * licodo.js 
 * root name module
*/

var licodo = (function() {

    var initModule = function(selector) {
        licodo.shell.initModule(selector);
    }

    return {initModule: initModule};
})()

window.onload = function() {
    //var sel = document.getElementById('licodo');

    licodo.initModule($('#licodo')[0]);
    //console.log($('.licodo-shell-head'));

}


