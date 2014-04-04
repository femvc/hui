'use strict';
//    ____     ____                _   _     ____          ____      ____                   
//  /\  __\  /\  __\    /'\_/`\  /\ \/\ \  /\  __`\      /\  __`\  /\  __`\    /'\_/`\      
//  \ \ \_/_ \ \ \_/_  /\      \ \ \ \ \ \ \ \ \ \_\     \ \ \ \_\ \ \ \ \ \  /\      \     
//   \ \  __\ \ \  __\ \ \ \_/\_\ \ \ \ \ \ \ \ \  __     \ \ \  __ \ \ \ \ \ \ \ \_/\_\    
//    \ \ \_/  \ \ \_/_ \ \ \\ \ \ \ \ \_/ \ \ \ \_\ \  __ \ \ \_\ \ \ \ \_\ \ \ \ \\ \ \   
//     \ \_\    \ \____/ \ \_\\ \_\ \ `\___/  \ \____/ /\_\ \ \____/  \ \_____\ \ \_\\ \_\  
//      \/_/     \/___/   \/_/ \/_/  `\/__/    \/___/  \/_/  \/___/    \/_____/  \/_/ \/_/  
//                                                                                          
//

/**
 * @name 前端构造测试数据
 */
define('./hui.Mockup', ['./hui'], function(){

hui.Mockup = {
    find: function(url) {
        return !!hui.Mockup.maps[url];
    },
    get: function(url, opt_options){
        var result = null,
            target = hui.Mockup.maps[url];
        
        //mockup是函数
        if (Object.prototype.toString.call(target)==='[object Function]') {
            target(url, opt_options);
        }
        //mockup是数组
        else if (Object.prototype.toString.call(target)==='[object Array]') {
            if (target.length>0) {
                opt_options['onsuccess'](null, target[(new Date()).getTime()%target.length])
            }
            else {
                opt_options['onsuccess'](null, target);
            }
        }
        //mockup是对象
        else if (Object.prototype.toString.call(target)==='[object Object]') {
            opt_options['onsuccess'](null, target);
        }
        //mockup不是字符串
        else if (typeof target != 'string') {
            opt_options['onsuccess'](null, target);
        }
        //mockup是字符串(url)的话直接返回
        else {
            result = target;
        }
        
        return result;
    },
    set: function(url, target){
        hui.Mockup.maps[url] = target;
    },
    remove: function(url){
        hui.Mockup.maps[url] = undefined;
    },
    clear: function(){
        hui.Mockup.maps = {};
    }
};
hui.Mockup.maps = {};

hui.Mockup.set('/helloworld', {
    success: 'true',
    result: 'Hello world.'
});

});