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
 * @namespace hui
 * @description hui是一个简单易用的前端H5框架
 * @public
 * @author haiyang5210
 * @since 2015-06-25 10:48
 */

// 使用window.hui定义可能会导致速度下降约7倍
var hui = window.hui = window.hui ? window.hui : {}

/**
 * @method hui.showLog
 * @static
 * @description 弹出错误提示信息
 * @param {String} msg 错误提示信息
 * @example 
 * hui.showLog("Exception 'open failed: EACCES (Permission denied)'")
 */
hui.showLog = hui.showLog || function(msg, opt) {
  hui.importCssString([
    '.outputlog {position: fixed;z-index: 2000;width: 80%;height: 80%;left: 10%;top: 5%;word-break: break-all;}',
    '.outputlog .table {width: 100%;height: 100%;}',
    '.outputlog .td {vertical-align: middle;text-align: center;}',
    '.outputlog .text {font-weight:normal; display: inline-block;background-color: black;color: white;opacity: 0.75;padding: 1.5rem 1rem;border-radius: 10px;font-size: 1.3rem;}',
  ].join(''))

  opt = opt || {}
  var outputlog = document.getElementById('outputlog')
  if (!outputlog) {
    var str = '<div id="outputlog" class="outputlog"></div>'
    var node = document.createElement('DIV')
    node.innerHTML = str
    for (var i = 0, len = node.children.length; i < len; i++) {
      document.documentElement.appendChild(node.children[i])
    }
    node = undefined
    outputlog = document.getElementById('outputlog')
  }

  if (outputlog) {
    var outputlog_txt = outputlog.getElementsByTagName('strong')[0]
    if (outputlog_txt) {
      outputlog_txt.innerHTML = msg
    } else {
      outputlog.innerHTML = ['<table class="table"><tbody><tr><td class="td" style="border: 0">',
        '<strong class="text">',
        msg,
        '</strong></td></tr></tbody></table></div>'
      ].join('')
    }
    outputlog.style.display = 'block'
  }
  if (String(opt.time) !== '-1') {
    if (outputlog.timer) {
      window.clearTimeout(outputlog.timer)
    }
    outputlog.timer = window.setTimeout(function() {
      var a = document.getElementById('outputlog')
      if (a) a.style.display = 'none'
      a.timer = null
      if (opt.onclose) opt.onclose()
    }, opt.time || 3000)
  }
}
hui.importCssString = hui.importCssString || function importCssString(cssText, id) {
  var style = document.createElement('style')
  if (id) {
    var old = document.getElementById(id)
    if (old) old.parentNode.removeChild(old)

    style.id = id
  }

  var head = document.head || document.body || document.documentElement
  head.insertBefore(style, head.lastChild)
  if (head !== document.documentElement && style.nextSibling) {
    head.insertBefore(style.nextSibling, style)
  }
  style.setAttribute('type', 'text/css')
  // all browsers, except IE before version 9
  if (style.styleSheet) style.styleSheet.cssText = cssText
  // Internet Explorer before version 9
  else style.appendChild(document.createTextNode(cssText))

  return style
}

/**
 * @method hui.xhr
 * @description 发起ajax请求
 * @public
 * @param {Object} obj 请求参数
 * @example 
 * hui.xhr({
 *   url: '...', 
 *   [type: 'GET'], 
 *   [contentType: 'application/json'], 
 *   [responseType: 'json'],
 *   success: function (resDataJSON) {}
 * })
 */
hui.xhr = function(opt) {
  opt = opt ? opt : {}
  var body = opt.body || JSON.stringify(opt.data) || ''
  var ctype = opt.contentType
  var xhr = new XMLHttpRequest() // XMLHttpRequest 对象
  var method = opt.type || (body ? 'POST' : 'GET')
  xhr.open(method, opt.url, true) // POST方式，url为请求地址，true该参数表示是否异步处理
  if (ctype === false || (body && window.FormData && ctype === undefined && body instanceof FormData)) {
    /* no need ContentType */
  } else {
    xhr.setRequestHeader('Content-Type', ctype || 'application/json')
  }
  xhr.onreadystatechange = function(xhr, opt) {
    if (xhr.readyState == 4 && xhr.status == 200) {
      if (opt.success && typeof opt.success == 'function') {
        window.setTimeout(function(xhr, opt) {
          opt.success(!opt.responseType || opt.responseType == 'json' ?
            Function('return ' + xhr.responseText.replace(/^\s+/, ''))() : xhr.responseText)
        }.bind({}, xhr, opt), opt.delay || 1)
      }
    } else if (xhr.readyState == 4 && xhr.status != 200) {
      if (opt.error) opt.error(xhr.status)
    }
  }.bind({}, xhr, opt)
  xhr.send(body) // 开始上传，发送form数据
  return xhr
}

/**
 * @method hui.jsonp
 * @description 发起jsonp请求
 * @public
 * @param {Object} obj 请求参数
 * @example 
 * hui.xhr({
 *     url: '...', 
 *     callback: 'jsonp1'
 * })
 */
hui.jsonp = (function(i) {
  return function(opt) {
    var el = document.createElement('script')
    var callback = ''
    if (typeof opt.callback == 'string') callback = opt.callback
    else {
      while (window['jsonp' + (++i)]) {}
      callback = 'jsonp' + i

      if (typeof opt.callback == 'function') {
        window[callback] = function(res) {
          opt.callback(res)
          if (opt.success) opt.success(res)
        }
      } else {
        window[callback] = function(res) {
          if (opt.success) opt.success(res)
        }
      }
    }
    el.src = opt.url + (!opt.nocallback && (opt.url.indexOf('?') > -1 ? '&' : '?') + 'callback=' + callback)
    document.documentElement.appendChild(el)
  }
})(0)

/**
 * @method hui.parseLocator
 * @description 解析url
 * @public
 * @param {String} url URL地址
 * @param {String} args 参数 lower|upper|group
 * @example 
 * hui.parseLocator(window.location.href, 'lower')
 */
hui.parseLocator = function(url, args) {
  url = url === null || url === undefined ? '' : String(url)
  var query = {},
    list,
    str

  if (url.indexOf('?') !== -1) {
    list = url.split('?')[1].split('#')[0].split('&')
    for (var i = 0, len = list.length; i < len; i++) {
      str = list[i].split('=')
      str.push('')

      var key = str[0]
      if (args && args.indexOf('lower') > -1) key = String(str[0]).toLowerCase()
      else if (args && args.indexOf('upper') > -1) key = String(str[0]).toUpperCase()

      if (args && args.indexOf('group') > -1) {
        if (query[key]) query[key].push(str[1])
        else query[key] = [str[1]]
      } else query[key] = str[1]
    }

    for (var j in query) {
      if (query[j] && query[j].length === 1) {
        query[j] = query[j][0]
      }
    }

  }
  return query
}

/**
 * @method hui.addParam
 * @description 拼接url参数
 * @public
 * @param {String} url URL地址
 * @param {Object} params 待拼接参数
 * @example 
 * hui.addParam(window.location.href, {a:123,b:456})
 * hui.addParam({a:123,b:456})
 */
hui.addParam = function(url, params) {
  params = params || {}
  params = JSON.parse(JSON.stringify(params))

  var sep = url.split('#') // ['http://www.google.com/p/?a=1&b=2?a=5&', '/login?c=123', '!/aaa']
  var a1 = sep.shift() // http://www.google.com/p/?a=1&b=2?a=5&
  var a2 = a1 + '?' // http://www.google.com/p/?a=1&b=2?a=5&??
  var b1 = a2.substring(0, a2.indexOf('?')) // http://www.google.com/p/
  var c1 = a2.substring(a2.indexOf('?') + 1, Math.max(a2.indexOf('?') + 1, a2.length - 1)) // a=1&b=2?a=5&
  var list = c1.split('&')
  var i, row, kk
  for (i = list.length - 1; i > -1; i--) {
    row = list[i]
    kk = row.split('=')[0]
    if (params.hasOwnProperty(kk)) {
      if (params[kk] !== '') {
        list[i] = kk + '=' + window.encodeURIComponent(params[kk])
      } else list.splice(i, 1)
      delete params[kk]
    }
  }
  for (kk in params) {
    if (!params.hasOwnProperty(kk)) continue;
    if (params[kk] === '') continue;
    // 注：如果直接push会导致空字符串占位问题
    if (!list[0]) list[0] = kk + '=' + window.encodeURIComponent(params[kk])
    else list.push(kk + '=' + window.encodeURIComponent(params[kk]))
  }

  var query = list.join('&')
  var hash = sep.join('#')
  var result = b1 + (query === '' ? '' : '?' + query) + (hash === '' ? '' : '#' + hash)

  return result
}

/**
 * @method hui.delegate
 * @description 事件代理
 * @public
 * @param {String} parentSelector 外层容器
 * @param {String} eventType 事件类型
 * @param {String} selector 目标元素
 * @param {Function} fn 事件处理函数
 * @example 
 * var index = hui.delegate('body', 'click', 'button', function(){alert('click');})
 * hui.undelegate('body', 'click', index)
 */
hui.delegate = function(parentSelector, eventType, selector, fn, excluded) {
  //参数处理
  if (typeof parentSelector !== 'string' && !(parentSelector instanceof Object.getPrototypeOf(Object.getPrototypeOf(document.body)).constructor) && parentSelector !== window) return hui.showLog('delegate(parentSelector, eventType, selector, fn) -> [parentSelector] should be String')
  if (typeof selector !== 'string') return hui.showLog('delegate(parent, eventType, selector, fn) -> [selector] should be String')
  if (typeof fn !== 'function') return hui.showLog('delegate(parent, eventType, selector, fn) -> [fn] should be Function')
  var parent = typeof parentSelector !== 'string' ? parentSelector : document.querySelector(parentSelector)
  if (!parent) return parent

  hui.delegate.eventList = hui.delegate.eventList || {}
  hui.delegate.eventListIndex = hui.delegate.eventListIndex || 0

  var handler = function(e) {
    var evt = window.event ? window.event : e
    var target = evt.target || evt.srcElement
    var host = null

    // 获取当前正在处理的事件源
    // 标准DOM方法是用currentTarget获取当前事件源
    // IE中的this指向当前处理的事件源
    // var currentTarget = e ? e.currentTarget : this
    // 在IE 9下  window.event 与 e 不同 evt没有currentTarget属性,e才有currentTarg 
    // return console.log("src id===" + target.id + "\n\ncurent target id==" + currentTarget.id)

    var isEventTarget
    var i, j, len, len2, list
    var elem = target
    var plist = []
    while (elem) {
      plist.push(elem)
      elem = elem.parentNode
    }

    if (selector) {
      if (!excluded) {
        list = parent.querySelectorAll(selector)
        for (i = 0, len = list.length; i < len; i++) {
          isEventTarget = false
          for (j = 0, len2 = plist.length; j < len2; j++) {
            if (plist[j] == list[i]) {
              isEventTarget = true
              host = list[i]
              break
            }
          }
          if (isEventTarget) fn.call(target, evt, target, host)
        }
      } else {
        isEventTarget = false
        list = parent.querySelectorAll(selector)
        for (i = 0, len = list.length; i < len; i++) {
          for (j = 0, len2 = plist.length; j < len2; j++) {
            if (plist[j] == list[i]) {
              isEventTarget = true
              // break
              j = len2 + 1
              i = len + 1
            }
          }
        }
        if (!isEventTarget) fn.call(target, evt, target, host)
      }
    } else {
      fn.call(target, evt, target)
    }
  }

  if (parent.addEventListener) {
    parent.addEventListener(eventType, handler, false)
  } else if (parent.attachEvent) {
    parent.attachEvent('on' + eventType, handler)

    // parent.attachEvent('on' + eventType, function(){handler.call(parent)}); 
    //此处使用回调函数call()，让 this指向parent //注释掉原因：无法解绑
  }
  hui.delegate.eventList[++hui.delegate.eventListIndex] = handler
  fn.eventListIndex = hui.delegate.eventListIndex
  return hui.delegate.eventListIndex
}

hui.undelegate = function(parentSelector, eventType, eventListIndex) {
  //参数处理
  if (typeof parentSelector !== 'string' && !(parentSelector instanceof Object.getPrototypeOf(Object.getPrototypeOf(document.body)).constructor) && parentSelector !== window) return hui.showLog('delegate(parentSelector, eventType, selector, fn) -> [parentSelector] should be String')
  var parent = typeof parentSelector !== 'string' ? parentSelector : document.querySelector(parentSelector)
  if (!parent) return parent

  hui.delegate.eventList = hui.delegate.eventList || {}
  var handler = hui.delegate.eventList[eventListIndex]
  hui.delegate.eventList[eventListIndex] = null
  try {
    delete hui.delegate.eventList[eventListIndex]
  } catch (e) {}
  if (!parent || !handler) return false

  if (parent.removeEventListener) {
    return parent.removeEventListener(eventType, handler, false)
  } else if (parent.attachEvent) {
    return parent.detachEvent('on' + eventType, handler)
  }
}

/** 
 * @name 响应enter按键
 * @public
 * @param {HTMLElement} e 按键事件
 * @param {Function} fn 事件处理函数
 */
hui.onenter = function(e, fn) {
  e = e || window.event
  var keyCode = e.keyCode || e.which
  if (keyCode == 13) fn(elem)
}

/** 
 * @name 响应esc按键
 * @public
 * @param {EventObject} e 按键事件
 * @param {Function} fn 事件处理函数
 */
hui.onesc = function(e, fn) {
  e = e || window.event
  var keyCode = e.keyCode || e.which
  if (keyCode == 27) fn(elem)
}

/**
 * @method hui.encodeURI
 * @description 对特殊字符和换行符编解码
 * @param {String} str 待编解码的字符串
 * @param {String} [decode] 是否是解码
 * @example
 * hui.encodeURI('%| |&|;|=|+|<|>|,')
 */
hui.encodeURI = function(str, isDecode) {
  str = String(str)
  // encodeURIComponent not deal with '
  var i, l, fr = '%| |&|;|=|+|<|>|,|"|\'|#|/|\\|\n|\r|\t'.split('|'),
    to = '%25|%20|%26|%3B|%3D|%2B|%3C|%3E|%2C|%22|%27|%23|%2F|%5C|%0A|%0D|%09'.split('|')
  if (isDecode == 'isDecode') {
    for (i = fr.length - 1; i > -1; i--) {
      str = str.replace(new RegExp('\\' + to[i], 'ig'), fr[i])
    }
  } else {
    for (i = 0, l = fr.length; i < l; i++) {
      str = str.replace(new RegExp('\\' + fr[i], 'ig'), to[i])
    }
  }
  return str
}
hui.decodeURI = function(str) {
  return hui.encodeURI(str, 'isDecode')
}

/**
 * 对HTML进行编码// .replace(/%/ig,"%-")
 */
hui.encode = function(str, isDecode) {
  str = String(str)
  // encodeURIComponent not deal with '
  var i, l, fr = '&|<|>| |\'|"|\\'.split('|'),
    to = '&amp;|&lt;|&gt;|&nbsp;|&apos;|&quot;|&#92;'.split('|')
  if (isDecode == 'isDecode') {
    for (i = fr.length - 1; i > -1; i--) {
      str = str.replace(new RegExp('\\' + to[i], 'ig'), fr[i])
    }
  } else {
    for (i = 0, l = fr.length; i < l; i++) {
      str = str.replace(new RegExp('\\' + fr[i], 'ig'), to[i])
    }
  }
  return str
}
hui.decode = function(str) {
  return hui.encode(str, 'isDecode')
}

/**
 * @method hui.format
 * @description 合并模板和数据
 * @public
 * @param {String} source 待格式化的字符串
 * @param {Object|Array} opts 要合并到字符串中的数据
 * @returns {String} 格式化之后的字符串
 * @example 
 * hui.format('Hello {{user}}', {user: 'Tom'})
 * >> Hello Tom
 */
hui.format = function(source, opts) {
  function handler(match, key) {
    var type = String(key).indexOf('!!') === 0 ? 'isDecode' : String(key).indexOf('!') === 0 ? '' : 'isEncode',
      parts = key.replace(/^!!?/, '').split('.'),
      part = parts.shift(),
      cur = data,
      variable
    while (part) {
      if (cur[part] !== undefined) cur = cur[part]
      else {
        cur = undefined
        break
      }
      part = parts.shift()
    }

    variable = cur
    if (undefined !== variable) {
      variable = String(variable)
      // encodeURIComponent not deal with '
      var i, l, fr = '&|<|>| |\'|"|\\'.split('|'),
        to = '&amp;|&lt;|&gt;|&nbsp;|&apos;|&quot;|&#92;'.split('|')
      if (type === 'isDecode') {
        for (i = fr.length - 1; i > -1; i--) {
          variable = variable.replace(new RegExp('\\' + to[i], 'ig'), fr[i])
        }
      } else if (type === 'isEncode') {
        for (i = 0, l = fr.length; i < l; i++) {
          variable = variable.replace(new RegExp('\\' + fr[i], 'ig'), to[i])
        }
      }
    }

    return (undefined === variable ? '' : variable)
  }

  source = String(source)
  var data = Array.prototype.slice.call(arguments, 1),
    toString = Object.prototype.toString
  if (data.length) {
    data = (data.length == 1 ?
      /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
      (opts !== null && (/\[object (Array|Object)\]/.test(toString.call(opts))) ? opts : data) : data)

    return source.replace(/#\{(.+?)\}/g, handler).replace(/\$\{(.+?)\}/g, handler).replace(/\{\{(.+?)\}\}/g, handler)
  }
  return source
}

/**
 * @method hui.formatDate
 * @description 将Date类型解析为String类型. 
 * @param {Date} date 输入的日期
 * @param {String} fmt 输出日期格式
 * @example
 * hui.formatDate(new Date(2006,0,1), 'yyyy-MM-dd HH:mm')
 */
hui.formatDate = function(date, fmt) {
  if (!date) date = new Date()
  fmt = fmt || 'yyyy-MM-dd HH:mm:ss'
  var o = {
    'M+': date.getMonth() + 1, //月份      
    'd+': date.getDate(), //日      
    'h+': date.getHours() % 12 === 0 ? 12 : date.getHours() % 12, //小时      
    'H+': date.getHours(), //小时      
    'm+': date.getMinutes(), //分      
    's+': date.getSeconds(), //秒      
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度      
    'S': date.getMilliseconds() //毫秒      
  }
  var week = {
    '0': '/u65e5',
    '1': '/u4e00',
    '2': '/u4e8c',
    '3': '/u4e09',
    '4': '/u56db',
    '5': '/u4e94',
    '6': '/u516d'
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  if (/(E+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '/u661f/u671f' : '/u5468') : '') + week[date.getDay() + ''])
  }
  for (var k in o) {
    if (o.hasOwnProperty(k) && new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}

/**
 * @method hui.parseDate
 * @description 将String类型解析为Date类型.  
 * @param {String} fmt 输入的字符串格式的日期
 * @example
 * parseDate('2006-1-1') return new Date(2006,0,1)  
 * parseDate(' 2006-1-1 ') return new Date(2006,0,1)  
 * parseDate('2006-1-1 15:14:16') return new Date(2006,0,1,15,14,16)  
 * parseDate(' 2006-1-1 15:14:16 ') return new Date(2006,0,1,15,14,16);  
 * parseDate('不正确的格式') retrun null  
 */
hui.parseDate = function(str) {
  str = String(str).replace(/^[\s\xa0]+|[\s\xa0]+$/ig, '')
  var results = null

  //秒数 #9744242680 
  results = str.match(/^ *(\d{10}) *$/)
  if (results && results.length > 0)
    return new Date(parseInt(str, 10) * 1000)

  //毫秒数 #9744242682765 
  results = str.match(/^ *(\d{13}) *$/)
  if (results && results.length > 0)
    return new Date(parseInt(str, 10))

  //20110608 
  results = str.match(/^ *(\d{4})(\d{2})(\d{2}) *$/)
  if (results && results.length > 3)
    return new Date(parseInt(results[1], 10), parseInt(results[2], 10) - 1, parseInt(results[3], 10))

  //20110608 1010 
  results = str.match(/^ *(\d{4})(\d{2})(\d{2}) +(\d{2})(\d{2}) *$/)
  if (results && results.length > 5)
    return new Date(parseInt(results[1], 10), parseInt(results[2], 10) - 1, parseInt(results[3], 10), parseInt(results[4], 10), parseInt(results[5], 10))

  //2011-06-08 
  results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) *$/)
  if (results && results.length > 3)
    return new Date(parseInt(results[1], 10), parseInt(results[2], 10) - 1, parseInt(results[3], 10))

  //2011-06-08 10:10 
  results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) +(\d{1,2}):(\d{1,2}) *$/)
  if (results && results.length > 5)
    return new Date(parseInt(results[1], 10), parseInt(results[2], 10) - 1, parseInt(results[3], 10), parseInt(results[4], 10), parseInt(results[5], 10))

  //2011/06\\08 10:10:10 
  results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2}) *$/)
  if (results && results.length > 6)
    return new Date(parseInt(results[1], 10), parseInt(results[2], 10) - 1, parseInt(results[3], 10), parseInt(results[4], 10), parseInt(results[5], 10), parseInt(results[6], 10))

  return (new Date(str))
}

/**
 * @method hui.parseTimeline
 * @description 时间轴：刚刚 2-59分钟前 1-23小时前 1-3天前 4月5日 2017年11月03日
 * @param {String} tt 目标时间
 * @param {String} now 当前时间
 */
hui.parseTimeline = function(tt, now) {
  if (!tt || !tt.getTime) tt = hui.parseDate(tt)
  if (!now) now = new Date()
  else if (!now.getTime) now = hui.parseDate(now)

  var dd = now.getTime() - tt.getTime()
  if (dd < 0) return ''
  if (dd < 2 * 60 * 1000) return '刚刚'
  if (dd < 60 * 60 * 1000) return parseInt(dd / 60 / 1000) + '分钟前'
  if (dd < 24 * 60 * 60 * 1000) return parseInt(dd / 60 / 60 / 1000) + '小时前'
  if (dd < 4 * 24 * 60 * 60 * 1000) return parseInt(dd / 24 / 60 / 60 / 1000) + '天前'
  if (now.getFullYear() == tt.getFullYear()) return hui.formatDate(tt, 'M月d日')
  return hui.formatDate(tt, 'yyyy年MM月dd日')
}

/**
 * @method hui.inherits
 * @description 原型继承
 * @public
 * @param {Class} child 子类
 * @param {Class} parent 父类
 * @example 
 * hui.Form = function (options, pending) {
 *     //如果使用this.constructor.superClass.call将无法继续继承此子类,否则会造成死循环!!
 *     hui.Form.superClass.call(this, options, 'pending')
 *     //进入控件处理主流程!
 *     if (pending != 'pending') {
 *         this.enterControl()
 *     }
 * }
 * hui.Form.prototype = {
 *     render: function () {
 *         hui.Form.superClass.prototype.render.call(this)
 *         //Todo...
 *     }
 * }
 * hui.inherits(hui.Form, hui.Control)
 */
hui.inherits = function(child, parent) {
  var clazz = new Function()
  clazz.prototype = parent.prototype

  var childProperty = child.prototype
  child.prototype = new clazz()

  for (var key in childProperty) {
    if (childProperty.hasOwnProperty(key)) {
      child.prototype[key] = childProperty[key]
    }
  }

  child.prototype.constructor = child

  //child是一个function
  //使用super在IE下会报错!!!
  child.superClass = parent
}

/** 
 * @method hui.fn
 * @description 绑定方法执行时的this指向的对象
 * @param {Function|String} func 要绑定的函数，或者一个在作用域下可用的函数名
 * @param {Object} obj 执行运行时this，如果不传入则运行时this为函数本身
 * @param {} args 函数执行时附加到执行时函数前面的参数
 * @returns {Function} 封装后的函数
 * @example 
 * var a = {name:'Tom',age:16,say: function(){console.log('Tom aged ' + this.age)}}
 * a.say()
 * >> Tom aged 16
 * var b = {name:'Nancy',age:40}
 * b.say = a.say
 * b.say()
 * >> Tom aged 40
 * b.say = hui.fn(a.say, a)
 * b.say()
 * >> Tom aged 16
 */
hui.fn = function(func, scope) {
  if (Object.prototype.toString.call(func) === '[object String]') {
    func = scope[func]
  }
  if (Object.prototype.toString.call(func) !== '[object Function]') {
    throw 'Error "hui.fn()": "func" is null'
  }
  var xargs = arguments.length > 2 ? [].slice.call(arguments, 2) : null
  return function() {
    var fn = '[object String]' == Object.prototype.toString.call(func) ? scope[func] : func,
      args = (xargs) ? xargs.concat([].slice.call(arguments, 0)) : arguments
    return fn.apply(scope || fn, args)
  }
}

/**
 * @method hasClass,addClass,removeClass
 * @description 操作目标元素的className
 * @public
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {String} className 如' aa bb ', 要添加的className，允许同时添加多个class，中间使用空白符分隔
 * @remark
 * 使用者应保证提供的className合法性，不应包含不合法字符，className合法字符参考：http://www.w3.org/TR/CSS2/syndata.html。
 * @returns {HTMLElement} 目标元素
 */
hui.addClass = function(element, className) {
  if (typeof element === 'string') element = document.querySelectorAll(element)

  if ('[object Array][object NodeList]'.indexOf(Object.prototype.toString.call(element)) != -1) {
    for (var i = 0, len = element.length; i < len; i++) {
      hui.addClass(element[i], className)
    }
  } else if (element) {
    hui.removeClass(element, className)
    element.className = (element.className + ' ' + className).replace(/(\s)+/ig, ' ').replace(/(^\s+|\s+$)/ig, '')
  }
  return element
}

// Support * and ?, like hui.removeClass(elem, 'daneden-*')
hui.removeClass = function(element, className, className2) {
  if (typeof element === 'string') element = document.querySelectorAll(element)

  if ('[object Array][object NodeList]'.indexOf(Object.prototype.toString.call(element)) != -1) {
    for (var i = 0, len = element.length; i < len; i++) {
      hui.removeClass(element[i], className, className2)
    }
  } else if (element) {
    var list = className.replace(/\s+/ig, ' ').split(' '),
      /* Attention: str need two spaces!! */
      str = (' ' + (element.className || '').replace(/(\s)/ig, '  ') + ' '),
      name,
      rex

    // 用list[j]移除str
    for (var j = 0, len2 = list.length; j < len2; j++) {
      name = list[j]
      name = name.replace(/(\*)/g, '\\S*').replace(/(\?)/g, '\\S?')
      rex = new RegExp(' ' + name + ' ', 'ig')
      str = str.replace(rex, ' ')
    }
    str += ' ' + (className2 || '')
    str = str.replace(/(\s)+/ig, ' ').replace(/(^\s+|\s+$)/ig, '')
    element.className = str
  }
  return element
}

/**
 * @method hui.makeGUID
 * @description 获取唯一id
 * @private
 * @return {String}
 */
hui.makeGUID = (function() {
  var guid = 1001
  return function(formname) {
    return (formname ? formname : '') + (guid++)
  }
})()

hui.getHashCode = function(str) {
  var hash = 0
  if (str.length === 0) return hash
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + c
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash
}

/**
 * @method hui.getCookie,hui.setCookie,hui.removeCookie
 * @description 操作cookie
 * @private
 * @return void
 */
hui.getCookie = hui.getCookie || function(name) {
  var start = document.cookie.indexOf(name + '=')
  var len = start + name.length + 1
  if ((!start) && (name != document.cookie.substring(0, name.length))) {
    return undefined
  }
  if (start == -1) return undefined
  var end = document.cookie.indexOf(';', len)
  if (end == -1) end = document.cookie.length
  return window.unescape(document.cookie.substring(len, end))
}
hui.setCookie = hui.setCookie || function(name, value, expires, path, domain, secure) {
  expires = expires === undefined ? 100 * 360 * 24 * 60 * 60 * 1000 : (expires || 0)
  var expires_date = new Date((new Date()).getTime() + expires)
  document.cookie = name + '=' + window.escape(value) + ';expires=' + expires_date.toGMTString() +
    (path ? ';path=' + path : '') + (domain ? ';domain=' + domain : '') + (secure ? ';secure' : '')
}
hui.removeCookie = hui.removeCookie || function(name, path, domain) {
  hui.setCookie(name, '', 10, path || '/')
}

// hui.sortBy(list, [['id', -1],['name', 1]])
hui.sortBy = function(list, field, order) {
  if (!list || !list.sort || !list.length) return list
  var sort = []
  if (typeof field === 'string') {
    sort.push([field, order === undefined ? 'asc' : String(order)])
  } else if (Object.prototype.toString.call(field) === '[object Array]') {
    sort = field
  }

  for (var i = sort.length - 1; i > -1; i--) {
    if (typeof sort[i] === 'string') {
      sort[i] = [sort[i], 'asc']
    } else if (Object.prototype.toString.call(sort[i]) === '[object Array]') {
      if (typeof sort[i][0] !== 'string') sort[i][0] = String(sort[i][0])
      if (String(sort[i][1]) === '-1' || String(sort[i][1]).toLowerCase() === 'desc') {
        sort[i][1] = 'desc'
      } else if (String(sort[i][1]) === '0') {
        sort[i][1] = '0'
      } else sort[i][1] = 'asc'
    }
  }
  // console.log(sort)
  list.sort(function(a, b) {
    var m, n, result = 0
    for (var i = 0, len = sort.length; i < len; i++) {
      if (sort[i][1] === '0') continue

      if (String(a[sort[i][0]]).replace(/^(\-|\+)?\d+/g, '') + String(b[sort[i][0]]).replace(/^(\-|\+)?\d+/g, '')) {
        m = String(a[sort[i][0]]).toLowerCase()
        n = String(b[sort[i][0]]).toLowerCase()
      } else {
        m = Number(a[sort[i][0]])
        n = Number(b[sort[i][0]])
      }
      result = (m > n ? 1 : m < n ? -1 : 0) * (sort[i][1] === 'desc' ? -1 : 1)

      if (result) break
    }
    return result
  })
  return list
}

hui.isEqual = function(a, b, aStack, bStack) {
  // Identical objects are equal. `0 === -0`, but they aren't identical.
  // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
  if (a === b) {
    return a !== 0 || 1 / a == 1 / b
  }
  // A strict comparison is necessary because `null == undefined`.
  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b
  }
  if (aStack === undefined || bStack === undefined) {
    aStack = []
    bStack = []
  }
  // Compare `[[Class]]` names.
  var className = Object.prototype.toString.call(a)
  if (className != Object.prototype.toString.call(b)) {
    return false
  }
  switch (className) {
    // Strings, numbers, dates, and booleans are compared by value.
    case '[object String]':
      // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
      // equivalent to `new String("5")`.
      return a == String(b)
    case '[object Number]':
      // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
      // other numeric values.
      return a != +a ? b != +b : (a === 0 ? 1 / a === 1 / b : a === +b)
    case '[object Date]':
    case '[object Boolean]':
      // Coerce dates and booleans to numeric primitive values. Dates are compared by their
      // millisecond representations. Note that invalid dates with millisecond representations
      // of `NaN` are not equivalent.
      return +a == +b
      // RegExps are compared by their source patterns and flags.
    case '[object RegExp]':
      return a.source == b.source &&
        a.global == b.global &&
        a.multiline == b.multiline &&
        a.ignoreCase == b.ignoreCase
  }
  if (typeof a != 'object' || typeof b != 'object') return false
  // Assume equality for cyclic structures. The algorithm for detecting cyclic
  // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
  var length = aStack.length
  while (length--) {
    // Linear search. Performance is inversely proportional to the number of
    // unique nested structures.
    if (aStack[length] == a) return bStack[length] == b
  }
  // Add the first object to the stack of traversed objects.
  aStack.push(a)
  bStack.push(b)

  var size = 0,
    result = true
  // Recursively compare objects and arrays.
  if (className == '[object Array]') {
    // Compare array lengths to determine if a deep comparison is necessary.
    size = a.length
    result = size == b.length
    if (result) {
      // Deep compare the contents, ignoring non-numeric properties.
      while (size--) {
        if (!(result = hui.isEqual(a[size], b[size], aStack, bStack))) break
      }
    }
  } else {
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor,
      bCtor = b.constructor
    if (aCtor !== bCtor && !(Object.prototype.toString.call(aCtor) == '[object Function]' && (aCtor instanceof aCtor) &&
        Object.prototype.toString.call(bCtor) == '[object Function]' && (bCtor instanceof bCtor))) {
      return false
    }
    // Deep compare objects.
    for (var key in a) {
      if (Object.prototype.hasOwnProperty.call(a, key)) {
        // Count the expected number of properties.
        size++
        // Deep compare each member.
        if (!(result = Object.prototype.hasOwnProperty.call(b, key) && hui.isEqual(a[key], b[key], aStack, bStack))) break
      }
    }
    // Ensure that both objects contain the same number of properties.
    if (result) {
      for (key in b) {
        if (Object.prototype.hasOwnProperty.call(b, key) && !(size--)) break
      }
      result = !size
    }
  }
  // Remove the first object from the stack of traversed objects.
  aStack.pop()
  bStack.pop()

  return result
}

/*///////////////// polyfill for ES6 ////////////////////////////*/

if (typeof Proxy === 'undefined') window['Proxy'] = function() {}
if (!Object.assign) {
  // 定义assign方法
  Object.assign = function(target) { // assign方法的第一个参数
    // 第一个参数为空，则抛错
    if (target === undefined || target === null) {
      throw new TypeError('Cannot convert first argument to object');
    }

    var to = Object(target);
    // 遍历剩余所有参数
    for (var i = 1; i < arguments.length; i++) {
      var nextSource = arguments[i];
      // 参数为空，则跳过，继续下一个
      if (nextSource === undefined || nextSource === null) {
        continue;
      }
      nextSource = Object(nextSource);

      // 获取改参数的所有key值，并遍历
      var keysArray = Object.keys(nextSource);
      for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
        var nextKey = keysArray[nextIndex];
        var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
        // 如果不为空且可枚举，则直接浅拷贝赋值
        if (desc !== undefined && desc.enumerable) {
          to[nextKey] = nextSource[nextKey];
        }
      }
    }
    return to;
  }
}
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(fn) {
    if (typeof fn !== 'function') return;
    for (var i = 0, len = this.length; i < len; i++) {
      fn(this[i])
    }
  }
}
if (typeof NodeList !== 'undefined' && NodeList.prototype && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach
}

if (!Function.prototype.bind) {
  Function.prototype.bind = function(scope) {
    var fn = this
    var xargs = arguments.length > 2 ? [].slice.call(arguments, 2) : null
    return function() {
      var args = (xargs) ? xargs.concat([].slice.call(arguments, 0)) : arguments
      return fn.apply(scope, args)
    }
  }
}

if (typeof Object.getPrototypeOf !== 'function') {
  if (typeof 'test'.__proto__ === 'object') {
    Object.getPrototypeOf = function(object) {
      return object.__proto__;
    }
  } else {
    Object.getPrototypeOf = function(object) {
      // May break if the constructor has been tampered with
      return object.constructor.prototype;
    }
  }
}

/*///////////////// polyfill for Sizzle ////////////////////////////*/

// Object.prototype.queryParent = function (clazz) {
//   var list = String(clazz || '').replace(/(^\s+|\s+$)/, '').replace(/\s+/, ' ').split(' ')
//   var result = null
//   var parent = this.parentNode
//   while (parent) {
//     if (parent.className && parent.className) {
//       var str = ' ' + String(parent.className) + ' '
//       var sign = true
//       for (var i=list.length - 1; i > -1; i--) {
//         if (str.indexOf(' ' + list[i] + ' ') == -1) {
//           sign = false
//           i = -1
//         }
//       }
//       if (sign) return parent
//     }
//     parent = parent.parentNode
//   }
//   return result
// }