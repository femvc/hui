'use strict'
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
 * @class hui.Flow
 * @description Javascript简单异步框架。注：异步队列中的函数需要实现callback的接口
 */
hui.Flow = function() {
  if (!(this instanceof hui.Flow)) return new hui.Flow()
  var me = this
  /**
   * @property {Array} que 保存回调队列
   * @memerberof hui.Flow
   */
  me.que = [hui.fn(me.endFlow, me)]; // 注：存放要调用的函数列表
  me.id = hui.Flow.getIndex(); // 注：仅用于标示，不会被调用（即使删掉也没什么影响）
  me.parentflow = []
  /**  
   * @method hui.Flow.next
   * @description 开始执行异步队列
   * @public
   * @memerberof hui.Flow
   * @param {Function} callback 嵌套时的回调函数，其实就是hui.Flow.prototype.next
   */
  me.next = function() {
    var args = [].slice.call(arguments, 0)

    // console.log(me.id)
    if (me.que.length > 0) {
      var fn = me.que.shift()
      fn.apply(null, args)
    }
  }
  me.next._isFlowPrivate = hui.Flow.getGUID()
  me.next.mainFlow = me

}
hui.Flow.getGUID = (function() {
  var guid = new Date().toString() + Math.random()
  return function() {
    return guid
  }
})();
hui.Flow.getIndex = (function() {
  var guid = 1
  return function() {
    return guid++
  }
})();
/**  
 * @method hui.Flow.push
 * @description 添加需要异步执行的函数
 * @public
 * @memerberof hui.Flow
 * @param {Function} fn 需要异步执行的函数
 * @return {this} 返回主体以便于后续操作
 * @example
 * function doit() {
 *     alert('a')
 *     
 *     var que1 = new hui.Flow()
 *     que1.push(a)
 *     que1.push(d); 
 *     setTimeout(function(){
 *         que1.next()
 *     },400)
 * }
 *  
 * function a(callback) {
 *     alert('a')
 *     
 *     var que2 = new hui.Flow()
 *     que2.push(b).push(c).push(callback); 
 *     
 *     setTimeout(function(){
 *         que2.next()
 *     },400)
 * }
 * function b(callback) {
 *     alert('b')
 *     callback&&callback()
 * }
 * function c(callback) {
 *     alert('c')
 *     callback&&callback()
 * }
 */
hui.Flow.prototype.push = function(fn) {
  var me = this,
    endFlow

  if (fn && fn._isFlowPrivate === hui.Flow.getGUID()) {
    endFlow = me.que.pop()
    me.que.push(fn)
    me.que.push(endFlow)
    if (fn.mainFlow) {
      fn.mainFlow.parentflow.push(me)
    }
  } else {
    var callback = hui.fn(me.next, me)
    callback._isFlowPrivate = hui.Flow.getGUID()

    endFlow = me.que.pop()
    me.que.push(function() {
      fn.apply(me, [callback].concat([].slice.call(arguments, 0)))
    })
    me.que.push(endFlow)
  }

  return me
}
hui.Flow.prototype.endFlow = function() {
  var me = this
  if (me.parentflow) {
    while (me.parentflow.length) {
      me.parentflow.pop().next()
    }
  }
}

hui.isES6 = function() {
  return false
  var es6 = true
  try {
    eval('typeof(class {})')
  } catch (e) {
    es6 = false
  }
  return es6
}

/***
 * @class hui.Control
 * @description 基础控件类
 * @param {Object} options 传入的初始化参数  
 * @param {String} pending 子类调用此构造函数时需传入'pending'
 */
hui.Control = function(options, pending, opt_propMap) {
  // 状态列表
  options = options || {}
  // 初始化参数
  this.initOptions(options)
  // if (this.tagName) {}
  // 生成控件id
  if (!this.id) {
    this.id = hui.makeGUID(this.formname)
  }
  hui.Control.appendControl(options.parentControl, this)
  // 子类调用此构造函数不可以立即执行!!只能放在子类的构造函数中执行!否则实例化时找不到子类中定义的属性!
  // 进入控件处理主流程!
  if (pending != 'pending') {
    this.enterControl(opt_propMap)
  }
}

/**  
 * @property {Object} hui.Control.prototype 基础控件类原型 
 */
hui.Control.prototype = {
  /**
   * @method initOptions
   * @description 初始化参数
   * @protected
   * @memerberof hui.Control.prototype
   * @param {Object} options 参数集合
   */
  initOptions: function(options) {
    for (var k in options) {
      if (options.hasOwnProperty(k)) {
        this[k] = options[k]
      }
    }
  },
  // 注: childControl不能放在这里,放在这里会导致"原型继承属性只是用一个副本的坑"!!
  // cc: [],
  /**
   * @method getClass
   * @description 获取dom子部件的css class
   * @memerberof hui.Control.prototype
   * @protected
   * @return {String}
   */
  getClass: function(opt_key) {
    if (!this.type) {
      return ''
    }

    var me = this,
      type = String(me.type).toLowerCase(),
      className = 'hui_' + type,
      skinName = 'skin_' + type + '_' + me.skin

    if (opt_key) {
      className += '_' + opt_key
      skinName += '_' + opt_key
    }

    if (me.skin) {
      className = skinName + ' ' + className
    }

    return className
  },

  /**
   * @method getMain
   * @description 获取控件的elem(nodejs). 注:控件即使不需要显示任何内容也必须有一个挂载的elem(可以是隐藏的),
   * @memerberof hui.Control.prototype
   * 通过模板解析控件时会用到 [nodejs&browser]
   * @public
   * @return {String}
   */
  getMain: function() {
    return hui.isES6() ? this : this.main ? document.getElementById(this.main) : null
  },
  /**
   * @method render
   * @description 渲染控件
   * @memerberof hui.Control.prototype
   * @public
   */
  render: function(opt_propMap) {
    // var me = this;
    // var main = me.getMain();
    // var data = me.model && me.model.getData && typeof me.model.getData === 'function' ? me.model.getData() : {};
    // hui.Control.create(main, data, me);
    // main.setAttribute('_rendered', 'true');
  },
  // 
  /**
   * @description 生成HTML
   * @memerberof hui.Control.prototype
   * @public
   */
  // initView: function (callback) {
  //     callback && callback()
  // },
  /**
   * @method initBehavior
   * @description 绑定事件
   * @memerberof hui.Control.prototype
   * @public
   */
  initBehavior: function() {
    //var me = this
  },
  initBehaviorByTree: function() {
    var me = this,
      main = me.getMain()
    if (me.cc) {
      for (var i = 0, len = me.cc.length; i < len; i++) {
        me.cc[i].initBehaviorByTree()
      }
    }
    if (main && main.getAttribute('_initbehavior') != 'true') {
      main.setAttribute('_initbehavior', 'true')
      me.initBehavior()
    }
  },
  // 返回控件的值
  //getValue:   function(){}, // 注: 控件直接返回值(对象/数组/字符串)时才能使用getValue! 获取所有子控件的值,应该用getParamMap
  setValue: function(paramMap) {
    var me = this
    if (me.cc && (/\[object Object\]/.test(Object.prototype.toString.call(paramMap)))) {
      me.setValueByTree(paramMap)
    } else {
      // 注：在setValue/getValue时不允许使用hui.Control.getMain(me).setAttirbute('value', value)和
      // hui.Control.getMain(me).getAttirbute('value'),因为value有可能是数组/对象！！
      // 如果确定value是num或str可以在子类中覆盖setValue/getValue！！
      var main = hui.Control.getMain(me)
      if (String(main.tagName).toLowerCase() === 'input' &&
        (String(main.type).toLowerCase() === 'checkbox' || String(main.type).toLowerCase() === 'radio')) {
        if (main.value === String(paramMap)) {
          main.checked = 'checked'
        } else main.checked = false
      } else {
        main.value = paramMap
      }
    }
    return me
  },
  /**
   * @method setValueByTree
   * @description 给控件树一次性赋值
   * @memerberof hui.Control.prototype
   * @param {Object} paramMap 值
   */
  setValueByTree: function(paramMap) {
    var me = this,
      value,
      list,
      ctr
    if (me.cc && paramMap) {
      for (var formname in paramMap) {
        if (formname && paramMap.hasOwnProperty(formname)) {
          list = me.getByFormnameAll(formname, false)
          if (list.length < 1) continue

          if (list.length > 1 && Object.prototype.toString.call(paramMap[formname]) === '[object Array]') {
            value = paramMap[formname]
          } else {
            value = []
            for (var i = list.length; i > 0; i--) {
              value.push(paramMap[formname])
            }
          }

          for (var i = 0, len = list.length; i < len; i++) {
            ctr = list[i]

            if (ctr.cc) {
              ctr.setValueByTree(value[i])
            } else if (ctr.setValue) {
              ctr.setValue(value[i])
            } else {
              var main = hui.Control.getMain(ctr)
              if (String(main.tagName).toLowerCase() === 'input' &&
                (String(main.type).toLowerCase() === 'checkbox' || String(main.type).toLowerCase() === 'radio')) {
                if (main.value === String(value[i])) {
                  main.checked = 'checked'
                } else main.checked = false
              } else {
                main.value = value[i]
              }
            }

            ctr = null
          }
        }
      }
    }
  },
  /**
   * @method getParamMap
   * @description 获取子控件的值，返回一个map
   * @memerberof hui.Control.prototype
   * @public
   */
  getParamMap: function() {
    return this.getValueByTree()
  },
  getValueByTree: function() {
    var me = this,
      paramMap = {},
      ctr,
      formname,
      value,
      groupList = {}

    // 如果有子控件建议递归调用子控件的getValue!!
    if (me.cc) {
      for (var i = 0, len = me.cc.length; i < len; i++) {
        ctr = me.cc[i]
        formname = hui.Control.prototype.getFormname.call(ctr)
        if (formname) groupList[formname] = !!ctr.group

        if (hui.Control.isFormItem(ctr)) {
          paramMap[formname] = paramMap[formname] ? paramMap[formname] : []
          if (ctr.cc) {
            value = ctr.getParamMap()
            paramMap[formname].push(value)
          }
          // 对于input元素而言value是property而不是atrribute，因此
          // input.getAttribute('value') 默认为空不会因为input.value=123而改变， div.value默认undefined
          else if (ctr.getValue !== undefined) {
            var main = hui.Control.getMain(ctr)
            var tagName = String(main.tagName).toLowerCase()
            if (tagName == 'input' && (main.type == 'checkbox' || main.type == 'radio')) {
              value = main.checked ? ctr.getValue() : ''
            } else {
              value = ctr.getValue()
            }
            paramMap[formname].push(value)
          }
          // input.getAttribute('value') 默认为空不会因为input.value=123而改变， div.value默认undefined
          else if (ctr.getMain) {
            var main = ctr.getMain()
            if (main && main.value !== undefined) {
              var tagName = String(main.tagName).toLowerCase()
              if (tagName == 'input' && (main.type == 'checkbox' || main.type == 'radio')) {
                value = main.checked ? main.value : ''
              } else {
                value = main.value
              }
              paramMap[formname].push(value)
            }
          }
        }
      }
      // 注：默认都用数组包装，此处还原为值
      for (var j in paramMap) {
        if (paramMap[j] && paramMap[j].length < 2) {
          paramMap[j] = paramMap[j][0] !== undefined ? (groupList[j] ? paramMap[j] : paramMap[j][0]) : ''
        }
      }
    }

    return paramMap
  },

  /**
   * @method getByFormname
   * @description 通过formname访问子控件
   * @memerberof hui.Control.prototype
   * @public
   * @param {String} formname 子控件的formname
   * @example 
   * <button hui-type="Button" hui-formname="save">Save</button>
   * var save = hui.Control.getByFormname('save')
   */
  getByFormname: function(formname) {
    var me = this
    return hui.Control.getByFormname(formname, me)
  },
  getByFormnameAll: function(formname, all) {
    var me = this
    return hui.Control.getByFormnameAll(formname, me, all)
  },
  /**
   * @method getFormname
   * @description 获取表单控件的表单名
   * @memerberof hui.Control.prototype
   * @public
   * @param {Object} control
   */
  getFormname: function() {
    var me = this,
      main = hui.Control.getMain(me)
    var itemName = me.formname || me.name || (main.getAttribute ? (main.getAttribute('formname') || main.getAttribute('name')) : '')
    return itemName
  },
  // 
  //  * @method getView 
  //  * @description 获取视图模板名
  //  * @memerberof hui.Control.prototype
  //  * @protected
  //  * @return {String} target名字
  //  * @default 默认为action的id
  //  */
  // getView: function () {
  //     var view = (this.view === null ? '' : this.view)
  //     // 获取view
  //     if (typeof view === 'function') {
  //         view = view()
  //     }
  //     view = hui.Control.getExtClass('hui.Template').getTarget(String(view))

  //     return view
  // },
  /**
   * @method enterControl
   * @description Control的主要处理流程
   * @memerberof hui.Control.prototype
   * @protected
   * @param {Object} argMap arg表.
   */
  enterControl: function(opt_propMap, callback) {
    var uiObj = this
    // 注：默认增加一个空元素作为控件主元素!
    if (typeof uiObj.getMain !== 'function') {
      uiObj.getMain = hui.Control.prototype.getMain
    }
    var elem = uiObj.getMain() || (uiObj.createMain ? uiObj.createMain() : hui.Control.prototype.createMain.call(uiObj))
    if (!elem) {
      return console.error('Control\'s main element is invalid')
    } else {
      elem.setAttribute('_rendered', '')
      elem.setAttribute('_initbehavior', '')
    }

    var que = new hui.Flow(); // 注：可以参照hui_flow.js文件。非常简单，不到30行代码
    if (!hui.Control.parseCtrId(elem)) {
      que.push(function(next) {
        var me = uiObj
        var main = me.getMain()
        // 默认设置value
        if (uiObj.value !== undefined) {
          main.value = uiObj.value
        }
        // 便于通过hui.Control.parseCtrId(main)找到control
        var ctrid = hui.Control.parseCtrId(main)
        if (!ctrid) {
          ctrid = hui.makeGUID('')
          main.className = (main.className + ' hui_ctrid' + ctrid).replace(/^(\s+|\s+$)/g, '')
        }
        if (me.getClass) hui.addClass(main, me.getClass())
        if (me.setSize) me.setSize()

        if (next) next()
      })
    }

    // 初始化Model
    if (elem.getAttribute && elem.getAttribute('_initModel') != 'true') {
      if (uiObj.initModel && uiObj.initModelMethod !== 'async' && uiObj.initModelMethod !== 'skip') {
        que.push(function(next) {
          var me = uiObj
          me.initModel()

          if (next) next()
        })
        que.push(function(next) {
          var me = uiObj
          var main = me.getMain()
          main.getAttribute('_initModel', 'true')
          if (next) next()
        })
      } else if (uiObj.initModelAsync && uiObj.initModelMethod !== 'sync' && uiObj.initModelMethod !== 'skip') {
        que.push(function(next) {
          uiObj.initModelAsync(next)
        })
        que.push(function(next) {
          var me = uiObj
          var main = me.getMain()
          main.getAttribute('_initModel', 'true')
          if (next) next()
        })
      }
    }

    // 渲染视图
    if (elem.getAttribute && elem.getAttribute('_initView') != 'true') {
      if (uiObj.initView && uiObj.initViewMethod !== 'async' && uiObj.initViewMethod !== 'skip') {
        que.push(function(next) {
          var me = uiObj
          me.initView()

          if (next) next()
        })

        que.push(function(next) {
          var me = uiObj
          var main = me.getMain()
          main.getAttribute('_initView', 'true')

          if (next) next()
        })

      } else if (uiObj.initViewAsync && uiObj.initViewMethod !== 'sync' && uiObj.initViewMethod !== 'skip') {
        que.push(function(next) {
          uiObj.initViewAsync(next)
        })

        que.push(function(next) {
          var me = uiObj
          var main = me.getMain()
          main.getAttribute('_initView', 'true')

          if (next) next()
        })
      }


    }

    que.push(function(next) {
      var me = uiObj
      me.parseParentControl()
      if (next) next()
    })

    // 1. initView()会在render调用父类的render时自动调用，
    // 2. hui.Control.create()会通过enterControl来执行render
    // 3. initBehavior()会在后面执行
    if (elem.getAttribute && elem.getAttribute('_rendered') != 'true') {
      que.push(function(next) {
        var me = uiObj
        var main = me.getMain()

        main.setAttribute('_rendered', 'true')
        // 注：原本isES6和!isES6的逻辑不应该互相调用
        // 这里由于用户默认采用isES6的格式传入方法参数，因此这里才会调用childrenChangedCallback
        if (me.childrenChangedCallback) {
          me.childrenChangedCallback()
        } else {
          if (me.render) me.render(opt_propMap)
        }

        if (next) next()
      })
    }
    if (elem.getAttribute && elem.getAttribute('_initbehavior') != 'true') {
      que.push(function(next) {
        var me = uiObj
        if (me.initBehaviorByTree) {
          me.initBehaviorByTree()
        } else if (me.initBehavior) {
          me.initBehavior()
        }

        if (next) next()
      })
    }
    que.push(function() {
      var me = uiObj
      if (me.finish) me.finish()

      if (callback) callback()
    })

    que.next()
  },

  /**
   * @method createMain
   * @description 生成主DOM
   * @memerberof hui.Control.prototype
   * @protected
   */
  createMain: function() {
    var me = this,
      tagName = this.tagName || 'DIV',
      main = document.createElement(String(tagName).toUpperCase()),
      control = me.parentControl,
      wrap = null

    if (!wrap && control && control.getMain) {
      wrap = control.getMain()
    }
    if (!wrap && control && control.main) {
      wrap = document.getElementById(control.main)
    }
    if (!wrap) {
      wrap = document.body || document.documentElement
    }
    if (me.parentElement) {
      wrap = typeof me.parentElement === 'string' ? (document.getElementById(me.parentElement) || document.documentElement) : me.parentElement
    }

    wrap.appendChild(main)

    main.id = hui.makeGUID(me.id)
    me.main = main.id

    return main
  },
  /**
   * @method appendControl
   * @description 父控件添加子控件. 注: 将子控件加到父控件下面的容器中也可以调用appendSelfTo
   * @memerberof hui.Control.prototype
   * @public
   * @param {Control} uiObj 子控件.
   */
  appendControl: function(uiObj) {
    return hui.Control.appendControl(this, uiObj)
  },
  /**
   * @method validate
   * @description 验证控件的值
   * @memerberof hui.Control.prototype
   * @public
   */
  validate: function(show_error) {
    if (!hui.Validator) {
      window.console.error('hui.Validator is invalid')
      return false
    }

    var me = this,
      result = true,
      cc = me.cc,
      rule = me.rule || me.getAttribute('rule'),
      c,
      list,
      m,
      n

    if (rule && !hui.Control.getMain(me).disabled) {
      result = false
      list = String(rule).split('||')
      for (var i = 0, len = list.length; i < len && !result; i++) {
        c = true
        m = list[i].split('&&')
        for (var j = 0, len2 = m.length; j < len2; j++) {
          n = m[j]
          c = c && hui.Validator.applyRule(me, n, show_error)
        }
        result = result || c
      }
    }
    // result ===  null
    if (!rule && cc && !hui.Control.getMain(me).disabled) {
      result = true
      m = null
      for (var i = 0, len = cc.length; i < len; i++) {
        n = cc[i].validate ? cc[i].validate(show_error) : me.validate.call(cc[i], show_error)
        result = n && result
        m = m === null && !n ? cc[i] : m
      }
      //m && m.getInput && m.getInput() && m.getInput().focus()
    }

    return result
  }
}

/**
 * @method hui.Control.find AllNodes
 * @description 获取所有子节点element
 * @private
 * @param {HTMLElement} main
 * @param {Function} 如果元素满足条件condition，如存在该属性,如'hui-type',则不遍历其下面的子元素
 */
hui.Control.findAllNodes = function(main, condition) {
  var childNode,
    elements,
    list,
    childlist,
    node
  elements = []
  list = []
  childlist = main && main.children && main.children.length ? main.children : []
  // 注：Nodelist是伪数组且IE不支持Array.prototype.slice.call(Nodelist)转化数组
  for (var i = 0, len = childlist.length; i < len; i++) {
    node = childlist[i]
    list.unshift(node)
  }

  while (list.length) {
    childNode = list.pop()
    if (!childNode) continue

    // 1. 无效DOM:          nn 不收录, 不遍历其子节点
    // 2. 已经渲染过的控件: nn 不收录，不遍历其子节点. hui-type或x-tag && item.getAttribute('_rendered') === 'true'
    // 3. 未渲染过的控件:   yn 收录，  不遍历其子节点. hui-type或x-tag && item.getAttribute('_rendered') !== 'true'
    // 4. 非控件:           ny 不收录, 继续遍历子节点
    // res: 收录|遍历 y/n
    var res = condition ? condition(childNode) : 'yy'
    if (res == 'yy' || res == 'yn') elements.unshift(childNode)
    if (res == 'yy' || res == 'ny') {
      childlist = childNode.children
      if (!childlist || childlist.length < 1) continue
      // 注：Nodelist是伪数组且IE不支持Array.prototype.slice.call(Nodelist)转化数组
      for (var i = 0, len = childlist.length; i < len; i++) {
        node = childlist[i]
        list.unshift(node)
      }
    }
  }
  // 去掉顶层main,如不去掉处理复合控件时会导致死循环!!
  if (elements[0] === main) elements.shift()

  return elements.reverse()
}

/**
 * @method hui.Control.isChildControl
 * @description 判断一个解析前DOM元素是否是子控件，是则跳过非父控件的hui.Control.create()
 * @public
 * @param {String} elem DOM元素
 */
hui.Control.isChildControl = function(elem, list) {
  var result = false
  // 回溯找到父控件,若要移动控件,则需手动维护parentControl属性!!
  while (elem && elem.tagName && elem.parentNode) {
    elem = elem.parentNode
    if (',html,body,'.indexOf(',' + String(elem.tagName).toLowerCase() + ',') != -1) break
    for (var i = 0, len = list.length; i < len; i++) {
      if (list[i] == elem) {
        result = true
        break
      }
    }
  }
  return result
}

/**
 * @method hui.Control.findAllControl
 * @description 获取父控件或Action下所有控件
 * @private
 * @param {Object} control
 */
hui.Control.findAllControl = function(parentControl) {
  var childNode,
    results,
    list
  results = []

  list = [parentControl]
  while (list.length) {
    childNode = list.pop()
    if (!childNode) continue

    results.push(childNode)

    if (!childNode.cc) continue
    list = list.concat(childNode.cc)
  }

  // 去掉顶层父控件或Action,如不去掉处理复合控件时会导致死循环!!
  if (results.length > 0) results.shift()

  // 后序遍历出来的结果，因此需要反转数组
  results.reverse()

  return results
}

// 所有控件实例的索引. 注释掉原因: 建了索引会造成无法GC内存暴涨!
// hui.Control.elemList = []


/**
 * @method hui.Control.getByCtrId
 * @description 根据控件id找到对应控件
 * @public
 * @param {Control} [parentControl] 可不传, 默认从当前Action开始找, 如果未使用action则直接从document.cc开始找
 * @param {String} id 控件id
 */
hui.Control.getByCtrId = function(id) {
  var list,
    result = null

  list = hui.Control.findAllControl(document)
  for (var i = 0, len = list.length; i < len; i++) {
    if (hui.Control.parseCtrId(hui.Control.getMain(list[i])) === String(id)) {
      result = list[i]
    }
  }
  return result
}

/**
 * @method hui.Control.getByFormnameAll
 * @description 根据控件formname找到对应控件
 * @static
 * @param {String} formname 控件formname
 * @param {Control} parentNode 父控件
 * @param {Boolean} all 仅查找直接子级，默认所有子级
 */
hui.Control.getByFormnameAll = function(formname, parentNode) {
  var list = [],
    childNodes,
    item,
    main = parentNode.getMain && parentNode.getMain() ? parentNode.getMain() : parentNode,
    /* 强制确认parentControl */
    parentControl = parentNode && hui.Control.parseCtrId(main) ? parentNode : document

  if (formname) {
    formname = String(formname)

    // 注：不应该找parentNode自身！！
    // 再遍历控件树
    childNodes = hui.Control.findAllControl(parentControl)
    for (var i = 0, len = childNodes.length; i < len; i++) {
      item = childNodes[i]
      if ((item.getFormname && item.getFormname() === formname) || hui.Control.prototype.getFormname.call(item) === formname) {
        list.push(childNodes[i])
      }
    }
  }

  return list
}

/**
 * @method hui.Control.getByFormname
 * @description 根据控件formname找到对应控件，只返回一个结果
 * @static
 * @param {String} formname 控件formname
 * @param {Control} parentNode 父控件
 * @example 
 * <button hui-type="Button" hui-formname="save">Save</button>
 * var save = hui.Control.getByFormname('save')
 */
hui.Control.getByFormname = function(formname, parentNode) {
  var result = null,
    list,
    min = Number.MAX_VALUE,
    deep,
    ctr

  parentNode = parentNode && typeof parentNode === 'object' ? parentNode : document

  list = hui.Control.getByFormnameAll(formname, parentNode)

  // 注：默认返回直接子级第一个,直接子级没有才会返回最近子级的第一个
  // 注：要找到所有直接子级等于formname的可以用getByFormnameAll(formname, parentNode, false)
  for (var i = 0, len = list.length; i < len && min > 0; i++) {
    deep = 0
    ctr = list[i]
    while (ctr.parentControl && ctr.parentControl !== parentNode) {
      deep++
      ctr = ctr.parentControl
    }
    if (deep < min) {
      min = deep
      result = list[i]
    }
  }

  return result
}

hui.Control.parseCtrId = function(elem) {
  return ((String((elem || {}).className).match(/hui_ctrid\d+/) || [])[0] || '')
}

hui.Control.getMain = function(ctr) {
  if (hui.isES6()) return ctr
  else {
    if (!ctr) return {}
    if (ctr.getMain) return ctr.getMain() || {}
    if (ctr.main) return document.getElementById(ctr.main) || {}
  }
}
hui.Control.isFormItem = function(ctr) {
  if (!ctr || ctr.isformitem === false) return false
  if (ctr.isformitem) return true
  var main = hui.Control.getMain(ctr)
  if (main.getAttribute && main.getAttribute('isformitem')) return true
  var tagName = String(main.tagName).toLowerCase()
  var tagType = '|' + String(main.type).toLowerCase() + '|'
  if ((tagName === 'input' && '|button|reset|submit|file|image|'.indexOf(tagType) === -1) ||
    tagName === 'textarea' ||
    tagName === 'select') return true
  return false
}

// 解析:options一类的属性 <x-tag :datasource="{aa:123}"></x-tag>
hui.Control.parseProperty = function(elem, main) {
  var list = elem.attributes
  main = main || elem
  for (var i = list.length - 1; i > -1; i--) {
    if (!list[i]) continue;
    var str = list[i].name
    if (str && str.length > 1 && str.indexOf(':') === 0) {
      main[str.replace(':', '')] = Function('return ' + (list[i].value || '""')).call(main)
    }
  }
}

// 解析@click一类的事件 <x-tag @onclick="alert(123)"></x-tag>
hui.Control.parseMethod = function(elem, main) {
  var list = elem.attributes
  main = main || elem
  for (var i = list.length - 1; i > -1; i--) {
    if (list[i] && list[i].name && list[i].name.length > 1 && list[i].name.indexOf('@') === 0) {
      var evtName = list[i].name.replace('@', '')
      var handler = Function(list[i].value).bind(elem)
      main[evtName] = handler
      elem.addEventListener(evtName.replace(/^on/i, ''), handler, false)
    }
  }
}


/**
 * @method hui.Control.appendControl
 * @description 父控件添加子控件. 注: 将子控件加到父控件下面的容器中也可以调用appendSelfTo
 * @public
 * @param {Control} uiObj 子控件.
 */
hui.Control.appendControl = function(parent, uiObj) {
  var i, len

  // parentControl父控件不传则默认为document对象
  // parentControl父控件默认为document对象, 不是的话后面会再改回来. 
  // var parentControl = document
  // Add: 上面这样做静态没问题，动态生成appendSelfTo就会出问题，因此需要加上options.parentControl
  // Fixme: 第二次执行到这里hui.Master.get()居然是前一个action？
  parent = parent || document
  parent.cc = parent.cc || []

  // var ctrid = uiObj.parseCtrId ? uiObj.parseCtrId() : uiObj.id
  // 注：从原来的父控件childControl中移除
  if (uiObj.parentControl && uiObj.parentControl.cc && uiObj.parentControl.cc != parent.cc) {
    var list = uiObj.parentControl.cc
    for (i = list.length - 1; i > -1; i--) {
      if (list[i] === uiObj) {
        list.splice(i, 1)
      }
    }
  }

  // !!!悲催的案例,如果将childControl放在prototype里, 这里parent.cc===uiObj.cc!!!
  var exist = false
  for (i = 0, len = parent.cc.length; i < len; i++) {
    if (parent.cc[i] === uiObj) {
      exist = true
      break
    }
  }
  if (!exist) {
    parent.cc.push(uiObj)
  }
  // 重置parentControl标识
  uiObj.parentControl = parent
  // !!!不能移动DOM，需自行解决，因为会打乱html布局
  /*var parentNode = hui.Control.getMain(parent) || null,
    main = hui.Control.getMain(uiObj)
  if (parentNode && main) {
    parentNode.appendChild(main)
  };*/
}

hui.Control.initChildControl = function(main, options, opt_propMap) {
  opt_propMap = opt_propMap || {} // 这里并不会缓存BaseModel，因此销毁空间时无须担心BaseModel

  var uiEls = []
  var elem

  // 把dom元素存储到临时数组中
  // 控件渲染的过程会导致elements的改变
  uiEls = hui.Control.findAllNodes(main, function(item) {
    // 1. 无效DOM:          nn 不收录, 不遍历其子节点
    // 2. 已经渲染过的控件: nn 不收录，不遍历其子节点. hui-type或x-tag && item.getAttribute('_rendered') === 'true'
    // 3. 未渲染过的控件:   yn 收录，  不遍历其子节点. hui-type或x-tag && item.getAttribute('_rendered') !== 'true'
    // 4. 非控件:           ny 不收录, 继续遍历子节点
    // res: 收录 y/n 遍历 y/n
    if (!item || !item.getAttribute || item.getAttribute('_rendered') === 'true') return 'nn'
    var tag = String(item.tagName).toLowerCase()
    if (item.getAttribute('hui-type') || tag === 'x-tag') return 'yn'
    if (tag.indexOf('x-') === 0 && window[tag] && window[tag].prototype && window[tag].prototype.dispose) return 'yn'
    return 'ny'
  })

  for (var j = 0, len2 = uiEls.length; j < len2; j++) {
    elem = uiEls[j]
    if (!hui.Control.isChildControl(elem, uiEls)) {
      if (!hui.isES6()) {
        var control = hui.Control.create(elem, options, opt_propMap)
      } else {
        main.cc = main.cc || []
        main.cc.push(elem)
        elem.setAttribute('_rendered', 'true')
      }
    }
  }

}

/**
 * @method hui.Control.disposeList
 * @description 销毁一组控件
 * @static
 * @param {String} list 一组控件
 */
hui.Control.disposeList = function(list) {
  if (Object.prototype.toString.call(list) === '[object Array]') {
    for (var i = 0, len = list.length; i < len; i++) {
      if (list[i] && list[i].dispose) {
        list[i].dispose()
      }
    }
  }
};

(function() {
  if (hui.isES6()) {
    eval([
      'window["x-tag"] = class extends HTMLElement {',
      '  constructor() {',
      '    /* // 必须调用父类的构造函数   */',
      '    super() ',
      '  }',
      '  /* // 相当于v0中的attributeChangedCallback,但新增一个可选的observedAttributes属性来约束所监听的属性数目 */',
      '  attributeChangedCallback(attrName, oldVal, newVal) {',
      '    console.log("attributeChangedCallback-change " + attrName + " from " + oldVal + " to " + newVal)',
      '  }',
      '  ',
      '  /* // 缺省时表示attributeChangedCallback将监听所有属性变化，若返回数组则仅监听数组中的属性变化 */',
      '  static get observedAttributes() {',
      '    return ["disabled", "value"]',
      '  }',
      '  get textContent() {',
      '    return this.querySelector(".content").textContent',
      '  }',
      '  set textContent(val) {',
      '    this.querySelector(".content").textContent = val',
      '  }',
      '  getMain() {',
      '    return this',
      '  }',
      '  ',
      '  /* // 相当于v0中的attachedCallback */',
      '  connectedCallback() {',
      '    /* // console.log("invoked connectedCallback!") */',
      '    if (super.connectedCallback) super.connectedCallback()',
      '    ',
      '    /* // 解析自定义属性和方法:value和@click */',
      '    hui.Control.parseProperty(this)',
      '    hui.Control.parseMethod(this)',
      '    ',
      '    /* // 当整个DOM都被移除时，停止执行 childrenChangedCallback (setTimeout)，childrenChangedTimer 很重要！！ */',
      '    this.childrenChangedTimer = window.requestAnimationFrame(function() {',
      '      var main = this',
      '      var ctrid = hui.Control.parseCtrId(main)',
      '      if (!ctrid) {',
      '        ctrid = hui.makeGUID("")',
      '        main.className = (main.className + " hui_ctrid" + ctrid).replace(/^(\\s+|\\s+$)/g, "")',
      '      }',
      '      ',
      '      if (main.childrenChangedCallback) {',
      '        main.childrenChangedCallback()',
      '      }',
      '      if (main.childrenRenderFinish) {',
      '        main.childrenRenderFinish()',
      '      }',
      '    }.bind(this))',
      '  }',
      '  /* // 元素DOM树上移除时触发 */',
      '  /* // 相当于v0中的detachedCallback */',
      '  disconnectedCallback() {',
      '    /* // console.log("invoked disconnectedCallback!") */',
      '    if (super.disconnectedCallback) super.disconnectedCallback()',
      '    var me = this',
      '    ',
      '    /* // 停止执行 childrenChangedCallback 非常重要！ */',
      '    if (me.childrenChangedTimer) {',
      '      window.cancelAnimationFrame(me.childrenChangedTimer)',
      '      me.childrenChangedTimer = null',
      '    }',
      '    if (me) {',
      '      /* // 从父控件的childControl中删除引用 */',
      '      if (me.parentControl) {',
      '        var cc = me.parentControl.cc',
      '        for (var i = 0, len = cc.length; i < len; i++) {',
      '          if (cc[i] === me) {',
      '            cc.splice(i, 1)',
      '            break',
      '          }',
      '        }',
      '      }',
      '    }',
      '  }',
      '}',
      'window.customElements.define("x-tag", window["x-tag"])'
    ].join('\n'))
  } else {
    var tmp = {
      'x-tag': function(options, pending, opt_propMap) {
        options = options || {}
        options.tagName = options.tagName || 'x-tag'
        hui.Control.call(this, options, pending, opt_propMap)
      }
    }
    tmp['x-tag'].prototype.render = function(opt_propMap) {
      hui.Control.prototype.render.call(this, opt_propMap)
      var me = this
      // 渲染对话框
      hui.Control.initChildControl(me.getMain(), {}, opt_propMap)
    }
    // hui.inherits(tmp['x-tag'], hui.Control);
    window['x-tag'] = tmp['x-tag']
    tmp = null
    document.createElement('x-tag');
  }
}());

/* // 相当于v0中的detachedCallback */
window['x-tag'].prototype.childrenChangedCallback = function() {
  // console.log('invoked childrenChangedCallback!')
  var me = this
  var main = me.getMain()
  if (me.onChildrenRenderFinishHandle) me.onChildrenRenderFinishHandle()

  var ctrid = hui.Control.parseCtrId(main)
  if (ctrid) {
    me.parseParentControl()

    if (me.cc && me.value) {
      me.setValueByTree(me.value)
    }
  }
}
window['x-tag'].prototype.onChildrenRenderFinish = function(fn) {
  if (this.setAttribute && this.getAttribute('_rendered') === 'true') {
    fn.call(this)
  } else {
    console.log('wait')
    this.childrenRenderFinishCallback = this.childrenRenderFinishCallback || []
    this.childrenRenderFinishCallback.push(fn)
  }
}
// 在控件子元素渲染结束后执行
window['x-tag'].prototype.onChildrenRenderFinishHandle = function() {
  // console.log('invoked onChildrenRenderFinish!')
  var me = this
  var main = me.getMain()

  var ctrid = hui.Control.parseCtrId(main)
  if (ctrid) {
    main.setAttribute('_rendered', 'true')
    hui.Control.initChildControl(main)
  }

  if (me.childrenRenderFinishCallback && me.childrenRenderFinishCallback.length) {
    window.requestAnimationFrame(function() {
      while (me.childrenRenderFinishCallback.length > 0) {
        me.childrenRenderFinishCallback.shift().call(this)
      }
    }.bind(me))
  }
}

/**
 * @method dispose
 * @description 释放控件
 * @memerberof hui.Control.prototype
 * @protected
 */
window['x-tag'].prototype.dispose = function() {
  var me = this,
    cc,
    list,
    main = hui.Control.getMain(me)

  // 从父控件的childControl中删除引用
  if (me.parentControl) {
    cc = me.parentControl.cc
    for (var i = 0, len = cc.length; i < len; i++) {
      if (cc[i] === me) {
        cc.splice(i, 1)
        break
      }
    }
  }
  if (me.disposeChild) me.disposeChild()
  if (main) {
    // 释放控件主区域的常用事件
    list = ('onmouseover|onmouseout|onmousedown|onmouseup|onkeyup|onkeydown|onkeypress|onchange|onpropertychange|' +
      'onfocus|onblur|onclick|ondblclick|ontouchstart|ontouchmove|ontouchend|ondragover|ondrop|ondragstart').split('|')
    for (var i = 0, len = list.length; i < len; i++) {
      try {
        main[list[i]] = function() {}
      } catch (e) {}
    }

    // 清空HTML内容
    if (main.innerHTML) {
      main.innerHTML = ''
    }
    main.parentNode.removeChild(main)
  }
}
window['x-tag'].prototype.disposeChild = function() {
  var me = this
  // dispose子控件
  if (me.cc) {
    for (var i = me.cc.length - 1; i > -1; i--) {
      if (me.cc[i].dispose) me.cc[i].dispose()
      else window['x-tag'].prototype.dispose.call(me.cc[i])
      me.cc[i] = null
    }
    me.cc.length = 0
  }
}

window['x-tag'].prototype.initChildControl = function(data, opt_propMap) {
  hui.Control.initChildControl(hui.Control.getMain(this), data, opt_propMap)
}

window['x-tag'].prototype.parseParentControl = function() {
  var me = this
  var main = hui.Control.getMain(me)
  // 动态生成control需手动维护me.parentControl
  // 回溯找到父控件,若要移动控件,则需手动维护parentControl属性!!
  var parentElement = main
  while (parentElement && parentElement.tagName && parentElement.parentNode) {
    parentElement = parentElement.parentNode
    if (!parentElement) break

    //label标签自带control属性!!
    var ctrid = hui.Control.parseCtrId(parentElement)
    var control = ctrid ? hui.Control.getByCtrId(ctrid) : null
    if (control) {
      hui.Control.appendControl(control, me)
      break
    }
    // 未找到直接父控件则将control从hui.window.childControl移动到action.childControl中
    else if (',html,body,'.indexOf(',' + String(parentElement.tagName).toLowerCase() + ',') != -1) {
      hui.Control.appendControl(null, me)
      break
    }
  }
}
window['x-tag'].prototype.getCtrId = function(sub) {
  return hui.Control.parseCtrId(this.getMain ? this.getMain() : this) + (sub ? '_' + sub : '')
};

(function() {
  var i, proto = hui.Control.prototype
  for (i in proto) {
    if (proto.hasOwnProperty(i) && !window['x-tag'].prototype.hasOwnProperty(i)) {
      window['x-tag'].prototype[i] = proto[i]
    }
  }
  i = proto = undefined
}());

// 工厂方法
// 用于便捷创建元素
hui.createClass = function(tagName, opt) {
  var clazz
  tagName = String(tagName).toLowerCase()
  if (hui.isES6()) {
    // 这里依赖 x-tag 的！！
    eval([
      'clazz = class extends window["x-tag"] {',
      '  constructor() {',
      '    super()',
      '  } ',
      '  connectedCallback () {',
      '    if (super.connectedCallback) super.connectedCallback()',
      '    if (opt.connectedCallback) opt.connectedCallback.call(this)',
      '  }',
      '  childrenChangedCallback () {',
      '    if (opt && opt.init) opt.init.call(this)',
      '    if (super.childrenChangedCallback) super.childrenChangedCallback()',
      '    if (opt.childrenChangedCallback) opt.childrenChangedCallback.call(this)',
      '    if (super.onChildrenRenderFinishHandle) super.onChildrenRenderFinishHandle()',
      '    if (opt.onChildrenRenderFinishHandle) opt.onChildrenRenderFinishHandle()',
      '    // 注：opt.onChildrenRenderFinish 会在 super.onChildrenRenderFinish 执行',
      '    // if (opt.onChildrenRenderFinish) opt.onChildrenRenderFinish()',
      '  }',
      '  disconnectedCallback () {',
      '    if (super.disconnectedCallback) super.disconnectedCallback()',
      '    if (opt.disconnectedCallback) opt.disconnectedCallback.call(this)',
      '  }',
      '}',
      'window.customElements.define(tagName, clazz)'
    ].join('\n'))
  } else {
    // 这里依赖 x-tag 的！！
    document.createElement(tagName)
    opt = opt || {}
    clazz = opt[tagName] || opt.init || function(options, pending, opt_propMap) {
      window['x-tag'].call(this, options, pending, opt_propMap)
    }
    clazz.prototype.constructor = clazz
    var superClass = typeof(opt.superClass) == 'function' ? opt.superClass : window['x-tag']
    hui.inherits(clazz, superClass)
  }

  for (var i in opt) {
    if (opt.hasOwnProperty(i) && !clazz.prototype.hasOwnProperty(i)) {
      // Fixit: clazz.prototype.onselect throw Error
      try {
        clazz.prototype[i] = opt[i]
      } catch (e) {
        console.error(e)
      }
    }
  }
  window[tagName] = clazz
  if (opt.css) hui.importCssString(opt.css)

  // 这里未使用闭包，因此无须担心内存回收问题
  clazz = undefined
}

/**
 * @method hui.Control.create
 * @description 创建一个控件对象，注意是对象实例不是构造函数!!
 * @public
 * @param {String} type 控件类型
 * @param {Object} options 控件初始化参数
 * @return {hui.Control} 创建的控件对象
 * @example 
 * <button hui-type="Button" id="submit">submit</button>
 * hui.Control.create(hui.bocument.getElementById('submit'))
 */
hui.Control.create = function(type, options, opt_propMap) {
  if (Object.prototype.toString.call(type) == '[object String]') {
    // if (options && options.type.getAttribute('_rendered') === 'true') return false
    options = options || {}

    // 注：创建并渲染控件，每个控件必须有id
    var objId = options.id
    if (!objId) {
      objId = hui.makeGUID(options.formname)
      options.id = objId
    }
    var existControl = hui.Control.getByCtrId(objId)
    if (existControl) existControl.dispose()

    var uiClazz = window[type]
    if (!uiClazz) {
      console.error('Need require(\'' + String(type).toLowerCase() + '\') or "' + String(type).toLowerCase() + '.js" is not loaded successfully.')
    }
    // 创建控件对象
    var uiObj = new uiClazz(options, '', opt_propMap)
    uiObj.id = uiObj.id || objId

    // 检查是否有 enterControl 方法
    if (!uiObj.enterControl) {
      var child = uiObj,
        parent = hui.Control.prototype
      for (var key in parent) {
        if (parent.hasOwnProperty(key)) {
          child[key] = parent[key]
        }
      }
    }
    if (uiObj.enterControl) uiObj.enterControl(opt_propMap)

    return uiObj
  }
  // 注：支持hui.Control.create(HTMLElement)
  if (type && type.getAttribute && (type.getAttribute('hui-type') || !String(type.tagName).toLowerCase().indexOf('x-'))) {
    if (type.getAttribute('_rendered') === 'true') return false
    options = options || {}
    if (hui.Control.parseCtrId(type)) {
      var control = hui.Control.getByCtrId(hui.Control.parseCtrId(type))
      if (control) {
        hui.Control.appendControl(options.parentControl, control)
      }
    }
    var attrs = {}
    hui.Control.parseProperty(type, attrs)
    hui.Control.parseMethod(type, attrs)

    for (var i in options) {
      if (i && options.hasOwnProperty(i)) {
        attrs[i] = attrs[i] !== undefined ? attrs[i] : options[i]
      }
    }
    // 注：每个控件必须有id
    attrs.id = attrs.id ? attrs.id : hui.makeGUID(attrs.formname)
    // 注：type即elem
    type.id = type.id || hui.makeGUID(attrs.id)
    attrs.main = type.id

    var tagName = String(type.getAttribute('hui-type') || type.tagName).toLowerCase()
    return hui.Control.create(tagName, attrs, opt_propMap)
  }
  // 注：支持hui.Control.create(HTMLElement container)
  if (type && type.getAttribute && !type.getAttribute('hui-type') && !type.getAttribute('_rendered')) {
    hui.Control.initChildControl(type, options, opt_propMap)
  }
}

// Shortkey
Object.defineProperty(window, 'cc', {
  get: function() {
    return document.cc
  },
  set: function(newValue) {
    document.cc = newValue
  }
})

// window.kk = new window['x-tag']()
// document.body.appendChild(window.kk)
// window.kk.innerHTML = 'kk'