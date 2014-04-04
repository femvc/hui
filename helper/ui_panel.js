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
define('./hui.Panel', ['./hui', './hui.Control'], function(){


hui.Panel = function (options, pending) {
    hui.Panel.superClass.call(this, options, 'pending');
      
    this.type = 'panel';
    this.controlMap = {};
    this.isFormItem = false;

    // 进入控件处理主流程!
    if (pending != 'pending') {
        this.enterControl();
    }
};

hui.Panel.prototype = {
    
    /**
     * @name 绘制对话框
     * @public
     */
    render: function(options) {
        hui.Panel.superClass.prototype.render.call(this);
        
        var me = this;
        
        // 渲染对话框
        hui.Control.init(me.getMain(), (hui.Action ? hui.Action.get() : {}).model, me);
    }

};

/*通过hui.Control派生hui.Button*/
// hui.Control.derive(hui.Panel);
/* hui.Panel 继承了 hui.Control */
hui.inherits(hui.Panel, hui.Control);

});