/**
 *  licoda.data.js
 *  data module for licodo
 *
*/
licodo.data = (function() {

        //cate代表分类， childCate代表自分类， task代表任务
    var cate, childCate, task, 
        cateText, childCateText, taskText,

        getStorage, initModule, initData, storageInit, saveStorage;
    
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
    saveStorage = function(key) {
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
        saveStorage: saveStorage,
        initModule: initModule,
        getStorage: getStorage
    };
})();