licodo.text=function(){var t,o,i,e,l,n,c,d,a,s,r={main_html:String()+'<div class = "licodo-text-head"><span class = "licodo-text-title"></span><ul class = "licodo-text-icon"><li id = "licodo-text-true"></li><li id = "licodo-text-edit"></li></ul></div><div class = "licodo-text-time"></div><div class = "licodo-text-editor"><div class = "licodo-text-content"></div></div>',sub_html:String()+'<div class = "licodo-text-head"><span class = "licodo-text-title"><input class = "licodo-text-inputTitle" type = "text" placeholder = "请输入标题"/></span><ul class = "licodo-text-icon"><input class = "licodo-text-cancel  btn" type = "button" value = "取消"/><input class = "licodo-text-confirm btn" type = "button" value = "确认"/></ul></div><div class = "licodo-text-time">任务日期：<input class = "licodo-text-inputTime" type = "text" placeholder = "格式为 2015-06-01"/></div><div class = "licodo-text-editor"><textarea class = "licodo-text-area"></textarea></div>',text_html:null,isEdited:!1,settable_map:{text_html:null}},u={contain:null,infoStr:null,overMode:null,overBool:!1},x={};return l=function(){x={$cancel:$(".licodo-text-cancel")[0]||""}},o=function(t){licodo.util.setConfigMap({input_map:t,settable_map:r.settable_map,config_map:r}),i(r.text_html)},i=function(t){"sub_html"==t?(u.contain.innerHTML=r.sub_html,n()):u.contain.innerHTML=r.main_html},s=function(t){if(t){var o=t.id,e=parseInt(o.replace(/\D/g,"")),l=licodo.data.getStorage("task"),n=licodo.util.getObjByKey(l,"id",e);r.text_html="main_html",i(r.text_html),$(".licodo-text-title")[0].innerHTML=n.name,$(".licodo-text-time")[0].innerHTML="任务日期："+n.date,$(".licodo-text-content")[0].innerHTML=n.content,d()}else r.text_html="main_html",i(r.text_html),$(".licodo-text-title")[0].innerHTML="",$(".licodo-text-time")[0].innerHTML="任务日期：",$(".licodo-text-content")[0].innerHTML=""},d=function(){addClickEvent($("#licodo-text-edit")[0],a),addClickEvent($("#licodo-text-true")[0],onclickTrue)},n=function(){$(".licodo-text-inputTitle")[0].focus(),addClickEvent($(".licodo-text-cancel")[0],e),addClickEvent($(".licodo-text-confirm")[0],c)},e=function(){r.text_html="main_html",i(r.text_html),d(),s($(".licodo-task-on")[0])},c=function(){var t=trim($(".licodo-text-inputTitle")[0].value),o=trim($(".licodo-text-inputTime")[0].value),i=trim($(".licodo-text-area")[0].value);t&&o&&i?/\d{4}-\d{2}-\d{2}/.test(o)?(r.isEdited?(licodo.task.modifyTask(!1,t,o,i),r.isEdited=!1):licodo.task.addTask(t,o,i),e(),$(".licodo-text-title")[0].innerHTML=t,$(".licodo-text-time")[0].innerHTML="任务日期："+o,$(".licodo-text-content")[0].innerHTML=i,d()):(u.infoStr="你输入的时间不符合格式",licodo.info.configModule({infoStr:u.infoStr})):(u.infoStr="请完整输入您的任务",licodo.info.configModule({infoStr:u.infoStr}))},a=function(){var t=$(".licodo-task-on")[0].id,o=parseInt(t.replace(/\D/g,"")),e=licodo.data.getStorage("task"),l=licodo.util.getObjByKey(e,"id",o);r.text_html="sub_html",i(r.text_html),$(".licodo-text-inputTitle")[0].value=l.name,$(".licodo-text-inputTime")[0].value=l.date,$(".licodo-text-area")[0].value=l.content,r.isEdited=!0},onclickTrue=function(){hasClass($(".licodo-task-on")[0],"licodo-task-doing")?(u.overMode=3,u.overBool=!0,licodo.overlay.configModule({overMode:u.overMode,overBool:u.overBool})):(u.infoStr="该任务已是完成任务",licodo.info.configModule({infoStr:u.infoStr}))},t=function(t){t&&(u.contain=t),t.innerHTML=r.main_html,s($("#licodo-task-ul0")[0].childNodes[0])},{makeText:s,initModule:t,configModule:o}}();