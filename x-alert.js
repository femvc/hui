'use strict';
//   ____             ___          __              ___              
//  /\  __`\     __  /\_ \    __  /\ \        __  /\_ \    __       
//  \ \ \  \ \  /\_\ \//\ \  /\_\ \ \ \      /\_\ \//\ \  /\_\      
//   \ \ \__\ \ \/_/   \ \ \ \/_/  \ \ \____ \/_/   \ \ \ \/_/      
//    \ \  __ <,  /\ˉ\  \ \ \  /\ˉ\ \ \ '___`\ /\ˉ\  \ \ \  /\ˉ\    
//     \ \ \  \ \ \ \ \  \ \ \ \ \ \ \ \ \  \ \\ \ \  \ \ \ \ \ \   
//      \ \ \__\ \ \ \ \  \_\ \_\ \ \ \ \ \__\ \\ \ \  \_\ \_\ \ \  
//       \ \_____/  \ \_\ /\____\\ \_\ \ \_____/ \ \_\ /\____\\ \_\ 
//        \/____/    \/_/ \/____/ \/_/  \/____/   \/_/ \/____/ \/_/ 
//                                                                  

/**
 * @name 组件
 * @public
 * @author haiyang5210
 * @date 2017-09-27 20:10
 * @param {Object} args 控件初始化参数.
 */
hui.createClass('x-alert', {
  'x-alert': function (args, pending, opt_propMap) {
    window['x-tag'].call(this, args, 'pending')
    this.isformitem = args.isformitem === undefined ? false : true
    this.tagName = 'x-alert'

    // 进入控件处理主流程!
    if (pending != 'pending') {
      this.enterControl(opt_propMap)
    }
  },
  isformitem: false,
  render: function (opt_propMap) {
    hui.Control.prototype.render.call(this, opt_propMap)
    var me = this
    // 渲染对话框
    // hui.Control.initChildControl(me, {}, opt_propMap)
    
    // console.log('invoked children ChangedCallback!')
    var me = this
    var raw = me.innerHTML
    me.innerHTML = [
      '<div class="alert alert-warning alert-dismissible fade in">',
      '  <button type="button" class="close">',
      '    <span aria-hidden="true">&times;</span>',
      '  </button>',
      '  <div class="content">' + raw + '1</div>',
      '</div>'
    ].join('\n')

    me.querySelector('button.close').onclick = function () { me.close() }
    me.close()
  },
  setContent: function (str) {
    this.querySelector('.content').innerHTML = str
  },
  close: function () {
    this.style.display = 'none'
  },
  show: function () {
    this.style.display = 'block'
  }
})

hui.importCssString([
  'x-alert .alert { width: 400px; margin: auto; margin-top: 20px; padding: 15px; margin-bottom: 20px; border: 1px solid transparent; border-radius: 4px; }',
  'x-alert .alert-dismissable,',
  'x-alert .alert-dismissible { padding-right: 35px; }',
  'x-alert .alert-dismissable .close,',
  'x-alert .alert-dismissible .close { position: relative; top: -2px; right: -21px; color: inherit; }',
  'x-alert .alert-success { color: rgb(60, 118, 61); background-color: rgb(223, 240, 216); border-color: rgb(214, 233, 198); }',
  'x-alert .alert-info { color: rgb(49, 112, 143); background-color: rgb(217, 237, 247); border-color: rgb(188, 232, 241); }',
  'x-alert .alert-warning { color: rgb(138, 109, 59); background-color: rgb(252, 248, 227); border-color: rgb(250, 235, 204); }',
  'x-alert .alert-danger { color: rgb(169, 68, 66); background-color: rgb(242, 222, 222); border-color: rgb(235, 204, 209); }',
  'x-alert .close { float: right; font-size: 21px; font-weight: 700; line-height: 1; color: rgb(0, 0, 0); text-shadow: rgb(255, 255, 255) 0px 1px 0px; opacity: 0.2; }',
  'x-alert .close:focus,',
  'x-alert .close:hover { color: rgb(0, 0, 0); text-decoration: none; cursor: pointer; opacity: 0.5; }',
  'x-alert button.close { -webkit-appearance: none; padding: 0px; cursor: pointer; background: 0px 0px; border: 0px; }'
].join('\n'))
