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
 * @name 对话框控件
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 * @param {Object} options 控件初始化参数.
 */
define('./hui.Modal', ['./hui', './hui.Control'], function(){


hui.Modal = function (options, pending) {
    hui.Modal.superClass.call(this, options, 'pending');
      
    this.type = 'modal';
    
    this.action = {
        // {key: 'min', name: '小'},
        'max': {key: 'max', name: 'D', className: ''},
        'save': {key: 'save', name: 'Save', className: 'btn-primary'},
        'close': {key: 'close', name: 'Cancel', className: ''}
    };
    
    this.controlMap = {};

    // 进入控件处理主流程!
    if (pending != 'pending') {
        this.enterControl();
    }
};

hui.Modal.prototype = {
    /*
    <div style="display: block;" class="modal" id="example">
        <div class="modal-header">
            <a data-dismiss="modal" class="close">×</a>
            <h3>This is a Modal Heading</h3>
        </div>
        <div class="modal-body">
            <h4>Text in a modal</h4>
            <p>You can add some text here.</p>
        </div>
        <div class="modal-footer">
            <a class="btn btn-success" href="#">Call to action</a>
            <a data-dismiss="modal" class="btn" href="#">Close</a> 
        </div>
    </div>
    <div class="modal-backdrop">&nbsp;</div>
    */
    /**
     * @name 设置标题文字
     * @param {String} html 要设置的文字，支持html.
     */
    setTitle: function(html) {
        var me = this,
            title = hui.c(me.getClass('title'), me.getMain())[0];
        
        if (title) {
            me.setInnerHTML(html, title);
        }
        
        this.title = html;
    },

    /**
     * @name 关闭，最大化，最小化按钮的html模板
     * @private
     */
    tplAction: '<div id="#{0}" class="#{1}">#{2}</div>',
    tplActionBtn: '<button class="btn #{0}" onclick="hui.Control.getById(\'#{1}\').onAction(\'#{2}\')">#{3}</button>',

    /**
     * @name 获取对话框头部的html <div id="#{0}" class="#{1}" onclick="#{2}">#{3}</div>
     * @private
     * @return {String}
     */
    getToolbarHtml: function() {
        var me = this,
            str = [],
            map = me['action'],
            win = me.win || 'save|close',
            arr = String(win).split('|');
        
        for (var i in arr) {
            if (map[arr[i]]) {
                str.push(hui.Control.format( me.tplActionBtn, 
                    map[arr[i]].className,
                    me.id,
                    map[arr[i]].key,
                    map[arr[i]].name
                ));
            }
        }

        return str.join('');
    },
    /**
     * @name 绘制对话框Action
     * @public
     * @comment 注: 需新设置win之后再调用
     */
    setWinContent: function(){
        var me = this,
            action = hui.c(me.getClass('action'), me.getMain())[0];
        // 关闭、最大化按钮
        if (me.win !== '') {
            if (!action) {
                action = hui.dom.createElement('div');
                action.id = me.getId('action');
                action.className = me.getClass('action');
                me.getMain().appendChild(action);
                if (me.getMain().firstChild !== action) {
                    me.getMain().insertBefore(action, me.getMain().firstChild);
                }
            }
            me.setInnerHTML(me.getToolbarHtml(), action);
        }
    },
    /**
     * @name 绘制对话框Title
     * @public
     * @comment 注: 需新设置title之后再调用
     */
    setHeadContent: function(){
        var me = this,
            main = me.getMain(),
            head   = hui.c(me.getClass('header'), main)[0],
            action = hui.c(me.getClass('action'), main)[0],
            title  = hui.c(me.getClass('title'),  main)[0];
        // 标题
        if (me.title !== undefined) {
            if (!head) {
                head = hui.dom.createElement('DIV');
                head.id = me.getId('header');
                head.className = me.getClass('header');
                main.appendChild(head);
                if (main.firstChild !== head) {
                    main.insertBefore(head, main.firstChild);
                }
            };
            if (!title) {
                title = hui.dom.createElement('H3');
                title.id = me.getId('title');
                title.className = me.getClass('title');
                head.appendChild(title);
            }
            me.setInnerHTML(me.title, title);
        }
    },
    /**
     * @name 绘制对话框Body
     * @public
     * @comment 注: 需新设置contentView之后再调用
     */
    setBodyContent: function () {
        var me = this;
        // 判断是否设置contentView模板
        if (me.contentView) {
            me.setBodyContentHtml(me.getExtClass('hui.Template').merge(
                me.getExtClass('hui.Template').getTarget(me.contentView),
                (me.parentControl||{}).model
            ));
        }
    },
    setBodyContentHtml: function (html) {
        var me = this,
            elem = hui.c(me.getClass('body'), me.getMain())[0];
        // 判断是否设置contentView模板
        if (!elem) {
            elem = hui.dom.createElement('div');
            elem.id = me.getId('body');
            elem.className = me.getClass('body');
            me.getMain().appendChild(elem);
        }
        me.setInnerHTML(html, elem);
    },
    /**
     * @name 绘制对话框Foot
     * @public
     * @comment 注: 需新设置footView之后再调用
     */
    setFootContent: function () {
        var me = this;
        // 判断是否设置footView模板
        if (me.footView) {
            me.setFootContentHtml(me.getExtClass('hui.Template').merge(
                me.getExtClass('hui.Template').getTarget(me.footView),
                (me.parentControl||{}).model
            ));
        }
    },
    setFootContentHtml: function () {
        var me = this,
            elem = hui.c(me.getClass('foot'), me.getMain())[0];
        // 判断是否设置footView模板
        if (!elem) {
            elem = hui.dom.createElement('div');
            elem.id = me.getId('foot');
            elem.className = me.getClass('foot');
            me.getMain().appendChild(elem);
        }
        me.setInnerHTML(html, elem);
    },
    /**
     * @name 绘制对话框
     * @public
     */
    render: function(options) {
        hui.Modal.superClass.prototype.render.call(this);
        
        var me = this,
            main = me.getMain();
        
        if (me.view) {
            me.setInnerHTML(me.getExtClass('hui.Template').merge(
                me.getExtClass('hui.Template').getTarget(me.view),
                (me.parentControl||{}).model
            ));
        }
        
        me.setHeadContent();
        me.setBodyContent();
        me.setFootContent();
        
        me.setWinContent();

        // 绑定事件
        me.getMain().onclick = 'hui.Control.getById(\''+me.getId()+'\').onMainClick();';
        // _.getDragClass({el: main, start:function(e){if (e.target.className !== 'ui-modal-title') {return false;}}});
        // 渲染对话框
        hui.Control.init(me.getMain(), (hui.Action ? hui.Action.get() : {}).model, me);
        
        me.setSize(me.size);
    },

    /**
     * @name 显示对话框
     * @public
     */
    show: function() {
        var me = this;
        if (!me.main) {
            me.render();
        }
        // me.getExtClass('hui.Mask').show();
        // document.body.style.overflow = 'hidden';
        me.getMain().style.display = 'block';
    },

    /**
     * @name 隐藏对话框
     * @public
     */
    hide: function(e) {
        var me = this;
        me.getMain().style.display = 'none';
        // document.body.style.overflow = 'scroll';
        // me.getExtClass('hui.Mask').hide();
    },
    onMainClick: function () {
        this.onAction('click');
        this.onclick();
    },
    // 外部接口
    onclose: new Function(),
    onclick: new Function(),
    onminimize: new Function(),
    
    onAction: function(type) {
        var me = this;
        if (me['doAction_'+type]) {
            me['doAction_'+type]();
        }
    },
    
    doAction_close: function() {
        var me = this;
        me.trigger('BEFORE_CLOSE', me);
        me.hide();
        me.onclose();
        /*alert('Modal close&dispose');
        hui.window.setTimeout(function(){
            me.dispose();
        }, 300);*/
    },
    doAction_min: function() {
        var me = this;
        me.trigger('BEFORE_MIN', me);
        me.hide();
        me.onminimize();
    },
    /**
     * @name 释放控件
     * @protected
     */
    dispose: function() {
        hui.Control.prototype.dispose.call(this);
    },

    getExtClass: function (clazz) {
        var result = function(){};
        switch (clazz) {
            case 'hui.Mask':
                if (typeof hui !== 'undefined' && hui.Mask) {
                    result = hui.Mask;
                }
                else {
                    result.show = new Function();
                    result.hide = new Function();
                }
            break;
            case 'hui.Template':
                if (typeof hui !== 'undefined' && hui.Template) {
                    result = hui.Template;
                }
                else {
                    result.merge = new Function();
                    result.getTarget = new Function();
                }
            break;
            default: 
        }
        return result;
    }
};

/*通过hui.Control派生hui.Button*/
// hui.Control.derive(hui.Modal);
/* hui.Modal 继承了 hui.Control */
hui.inherits(hui.Modal, hui.Control);

});