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
 * @name 文本输入框控件
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 * @param {Object} options 控件初始化参数.
 */
define('./hui.TextInput', ['./hui', './hui.Control'], function(){

hui.TextInput = function (options, pending) { 
    hui.TextInput.superClass.call(this, options, 'pending'); 
    
    this.form = 1;
    this.tagName = 'input';
    this.value = this.value === 0 ? 0 : (this.value || '');
    
    //进入控件处理主流程!
    if (pending != 'pending') {
        this.enterControl();
    }
};

hui.TextInput.prototype = {
    /**
     * @name 获取文本输入框的值
     * @public
     * @return {String}
     */
    getValue: function() {
        return this.getMain().value;
    },

    /**
     * @name 设置文本输入框的值
     * @public
     * @param {String} value
     */
    setValue: function(value) {
        value = value === undefined ? '' : value;
        this.getChangeHandler()(value);
        
        this.getMain().value = value;
        if (value) {
            this.getFocusHandler()();
        } 
        else {
            this.getBlurHandler()();
        }
    },

    /**
     * @name 设置输入控件的title提示
     * @public
     * @param {String} title
     */
    setTitle: function(title) {
        this.getMain().setAttribute('title', title);
    },

    /**
     * @name 将文本框设置为不可写
     * @public
     */
    disable: function(disabled) {
        if (typeof disabled === 'undefined') {
            disabled = true;
        }
        if (disabled) {
            this.getMain().disabled = 'disabled';
            this.setState('disabled');
        } else {
            this.getMain().removeAttribute('disabled');
            this.removeState('disabled');
        }
    },

    /**
     * @name 设置控件为只读
     * @public
     * @param {Object} readonly
     */
    setReadonly: function(readonly) {
        readonly = !!readonly;
        this.getMain().readOnly = readonly;
        /*this.getMain().setAttribute('readonly', readonly);*/
        this.readonly = readonly;
    },
    /**
     * @name 渲染控件
     * @protected
     * @param {Object} main 控件挂载的DOM.
     */
    render: function() {
        var me = this,
            main = me.getMain(),
            tagName = main.tagName,
            inputType = main.getAttribute('type');
        
        // 判断是否input或textarea输入框
        if (tagName == 'TEXTAREA'|| (tagName == 'INPUT' && (!inputType || inputType == 'text' || inputType == 'password'))) {
            me.type = tagName == 'INPUT' ? 'text' : 'textarea'; // 初始化type用于样式
            
            // 绘制控件行为
            hui.TextInput.superClass.prototype.render.call(me);
            
            // 设置readonly状态
            me.setReadonly(!!me.readonly);
            
            // 绑定事件
            main.onkeypress = me.getPressHandler;
            main.onfocus    = me.getFocusHandler;
            main.onblur     = me.getBlurHandler;
            main.onchange   = me.getChangeHandler;
        }
                
        if (me.main && me.value != '') {
            me.getMain().value = me.value;
        }
    },

    /**
     * @name 获取获焦事件处理函数
     * @private
     * @return {Function}
     */
    getFocusHandler: function(e) {
        // this -> control's main element
        var main = this;
        hui.Control.getById(main.control).onfocus();
    },

    /**
     * @name 获取失焦事件处理函数
     * @private
     * @return {Function}
     */
    getBlurHandler: function(e) {
        // this -> control's main element
        var main = this;
        hui.Control.getById(main.control).onblur();
    },

    /**
     * @name 获取键盘敲击的事件handler
     * @private
     * @return {Function}
     */
    getPressHandler: function(e) {
        var main = this;
        e = e || hui.window.event;
        var keyCode = e.keyCode || e.which;
        if (keyCode == 13) {
            return hui.Control.getById(main.control).onenter();
        }
    },
    getChangeHandler: function (e) {
        var main = this;
        var me = hui.Control.getById(main.control);
        var value = (e && (e.target || e.srcElement)) ? me.getMain().value : e;
        me.onchange(value);
    },
    onenter: new Function(),
    onfocus: new Function(),
    onblur: new Function(),
    onchange: new Function(),

    /** 
     * @name 获焦并选中文本
     * @public
     */
    focusAndSelect: function() {
        this.getMain().select();
    },

    /**
     * @name 释放控件
     * @public
     */
    dispose: function() {
        // 卸载main的事件
        var main = this.getMain();
        main.onkeypress = null;
        main.onchange = null;
        main.onpropertychange = null;
        main.onfocus = null;
        main.onblur = null;

        hui.Control.prototype.dispose.call(this);
    }
};
/*通过hui.Control派生hui.Button*/
//hui.Control.derive(hui.TextInput);
/* hui.TextInput 继承了 hui.Control */
hui.inherits(hui.TextInput, hui.Control);

});