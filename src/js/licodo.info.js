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