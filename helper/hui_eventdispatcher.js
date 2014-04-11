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
 * @name 事件派发基类
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 */
define('./hui.EventDispatcher', ['./hui'], function(){

hui.EventDispatcher = function() {
    this._listeners = {};
};
hui.EventDispatcher.prototype = {
    /**
     * @name 添加监听器
     * @public
     * @param {String} eventType 事件类型.
     * @param {Function} listener 监听器.
     */
    on: function(eventType, listener) {
        if (!this._listeners[eventType]) {
            this._listeners[eventType] = [];
        }
        var list = this._listeners[eventType],
            exist = false,
            index;
        
        for (var i=0,len=list.length; i<len; i++) {
            if (list[i] === listener) {
                exist = true;
                index = i;
                break;
            }
        }
        if (!exist) {
            this._listeners[eventType].push(listener);
            index = this._listeners[eventType].length - 1;
        }
        return index;
    },

    /**
     * @name 移除监听器
     * @public
     * @param {String} eventType 事件类型.
     * @param {Function} listener 监听器.
     */
    off: function(eventType, listener) {
        if (!this._listeners[eventType]) {
            return;
        }
        var list = this._listeners[eventType];
        
        for (var i=0,len=list.length; i<len; i++) {
            if (list[i] === listener || i === listener) {
                this._listeners[eventType][i] = undefined;
                break;
            }
        }
        if (listener === undefined) {
            this._listeners[eventType] = [];
        }
    },
    /**
     * @name 清除所有监听器
     * @public
     */
    clear: function(eventType) {
        // 清除全部
        if (!eventType) {
            this._listeners = [];
        }
        // 只清除指定类型
        else if (this._listeners[eventType]) {
            this._listeners[eventType] = [];
        }
        else if (Object.prototype.toString.call(eventType)==='[object Array]') {
            for (var i=0,len=eventType.length; i<len; i++) {
                this.clear(eventType[i]);
            }
        }
    },
    /**
     * @name 触发事件
     * @public
     * @param {String} eventType 事件类型.
     */
    trigger: function(eventType) {
        if (!this._listeners[eventType]) {
            return;
        }
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        for (var i=0,len=this._listeners[eventType].length; i<len; i++) {
            if (this._listeners[eventType][i]) {
                this._listeners[eventType][i].apply(this, args);
            }
        }
    }
};

});