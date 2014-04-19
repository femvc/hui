'use strict';
var hui = {};
/** 
 * @name 对目标字符串进行格式化
 * @public
 * @param {String} source 目标字符串
 * @param {Object|String...} opts 提供相应数据的对象或多个字符串
 * @return {String} 格式化后的字符串
 */
hui.format = function (source, opts) {
    source = String(source);
    var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
    if(data.length){
        data = (data.length == 1 ? 
            /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
            (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
            : data);
        return source.replace(/#\{(.+?)\}/g, function (match, key){
            var replacer = data[key];
            // chrome 下 typeof /a/ == 'function'
            if('[object Function]' == toString.call(replacer)){
                replacer = replacer(key);
            }
            return ('undefined' == typeof replacer ? '' : replacer);
        });
    }
    return source;
};

/** 
 * @name 对数组进行排序
 * @public
 * @param {Array} list 目标数组
 * @param {String} field 目标排序字段
 * @param {String} order 升序（默认）或降序
 * @return {array} 排序后的数组
 */
hui.sortBy = function(list, field, order) { 
    if (list && list.sort && list.length) { 
        list.sort(function(a,b) { 
            var m, n; 
            m = String(a[field]).toLowerCase(); 
            n = String(b[field]).toLowerCase(); 
             
            if (String(parseInt('0'+m, 10)) == m && String(parseInt('0'+n, 10)) == n){ 
                m = parseInt(m, 10); 
                n = parseInt(n, 10); 
            }
            else { 
                if (m > n) { m = 1; n = -m;} 
                else if (m < n ) { m = -1; n = -m; } 
                else {m = 1; n = m;} 
            } 
            return (order == 'desc' ?  n - m : m - n ); 
        })
    } 
    return list; 
};

/** 
 * @name 为对象绑定方法和作用域
 * @param {Function|String} handler 要绑定的函数，或者一个在作用域下可用的函数名
 * @param {Object} obj 执行运行时this，如果不传入则运行时this为函数本身
 * @param {args* 0..n} args 函数执行时附加到执行时函数前面的参数
 * @returns {Function} 封装后的函数
 */
hui.fn = function(func, scope){
    if(Object.prototype.toString.call(func)==='[object String]'){func=scope[func];}
    if(Object.prototype.toString.call(func)!=='[object Function]'){ throw 'Error "hui.fn()": "func" is null';}
    var xargs = arguments.length > 2 ? [].slice.call(arguments, 2) : null;
    return function () {
        var fn = '[object String]' == Object.prototype.toString.call(func) ? scope[func] : func,
            args = (xargs) ? xargs.concat([].slice.call(arguments, 0)) : arguments;
        return fn.apply(scope || fn, args);
    };
};

/**
 * @name 原型继承
 * @public
 * @param {Class} child 子类
 * @param {Class} parent 父类
 * @example 
    hui.ChildControl = function (options, pending) {
        //如果使用this.constructor.superClass.call将无法继续继承此子类,否则会造成死循环!!
        hui.ChildControl.superClass.call(this, options, 'pending');
        this.type = 'childcontrol';
        //进入控件处理主流程!
        if (pending != 'pending') {
            this.enterControl();
        }
    };
    hui.Form.prototype = {
        render: function () {
            hui.Form.superClass.prototype.render.call(this);
            //Todo...
        }
    };
    hui.inherits(hui.Form, hui.Control);
 */
hui.inherits = function (child, parent) {
    var clazz = new Function();
    clazz.prototype = parent.prototype;
    
    var childProperty = child.prototype;
    child.prototype = new clazz();
    
    for (var key in childProperty) {
        child.prototype[key] = childProperty[key];
    }
    
    child.prototype.constructor = child;
    
    //child是一个function
    //使用super在IE下会报错!!!
    child.superClass = parent;
};

/**
 * @name 对象扩展
 * @param {Class} child 子类
 * @param {Class} parent 父类
 * @public
 */
hui.extend = function (child, parent) {
    for (var key in parent) {
        child[key] = parent[key];
    }
};
/** 
 * @name 对象派生(不推荐!!!)
 * @param {Object} obj 派生对象
 * @param {Class} clazz 派生父类
 * @public
 */
hui.derive = function(obj, clazz){    
    var me = new clazz();
    
    for(var i in me){
        if(obj[i] == undefined) obj[i] = me[i];
    }
};

/** 
 * @name对一个object进行深度拷贝
 * @param {Any} source 需要进行拷贝的对象.
 * @param {Array} oldArr 源对象树索引.
 * @param {Array} newArr 目标对象树索引.
 * @return {Any} 拷贝后的新对象.
 */
hui.clone = function(source, oldArr, newArr) {
    if (typeof source === 'undefined') {
        return undefined;
    }
    if (typeof JSON !== 'undefined') {
        return JSON.parse(JSON.stringify(source));
    }

    var result = source, 
        i, 
        len,
        j,
        len2,
        exist = -1;
    oldArr = oldArr || [];
    newArr = newArr || [];
    
    if (source instanceof Date) {
        result = new Date(source.getTime());
    } 
    else if ((source instanceof Array) || (Object.prototype.toString.call(source) == '[object Object]')) {
        for (j=0,len2=oldArr.length; j<len2; j++) {
            if (oldArr[j] == source) {
                exist = j;
                break;
            }
        }
        if (exist != -1) {
            result = newArr[exist];
            exist = -1;
        }
        else {
            if (source instanceof Array) {
                result = [];
                oldArr.push(source);
                newArr.push(result);
                var resultLen = 0;
                for (i = 0, len = source.length; i < len; i++) {
                    result[resultLen++] = hui.clone(source[i], oldArr, newArr);
                }
            }
            else if (!!source && Object.prototype.toString.call(source) == '[object Object]') {
                result = {};
                oldArr.push(source);
                newArr.push(result);
                for (i in source) {
                    if (source.hasOwnProperty(i)) {
                        result[i] = hui.clone(source[i], oldArr, newArr);
                    }
                }
            }
        }
    }

    return result;
};

// link from Undercore.js 
// Internal recursive comparison function for `isEqual`.
hui.isEqual = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b){return a !== 0 || 1 / a == 1 / b;}
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) {return a === b;}
    if (aStack == undefined || bStack == undefined ) {
        aStack = [];
        bStack = [];
    }
    // Compare `[[Class]]` names.
    var className = Object.prototype.toString.call(a);
    if (className != Object.prototype.toString.call(b)){return false;}
    switch (className) {
        // Strings, numbers, dates, and booleans are compared by value.
        case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
        case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
        case '[object Date]':
        case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
        // RegExps are compared by their source patterns and flags.
        case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
        // Linear search. Performance is inversely proportional to the number of
        // unique nested structures.
        if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    
    var size = 0, 
        result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
        // Compare array lengths to determine if a deep comparison is necessary.
        size = a.length;
        result = size == b.length;
        if (result) {
            // Deep compare the contents, ignoring non-numeric properties.
            while (size--) {
                if (!(result = hui.isEqual(a[size], b[size], aStack, bStack))) break;
            }
        }
    } 
    else {
        // Objects with different constructors are not equivalent, but `Object`s
        // from different frames are.
        var aCtor = a.constructor, 
            bCtor = b.constructor;
        if (aCtor !== bCtor && !(Object.prototype.toString.call(aCtor) == '[object Function]' && (aCtor instanceof aCtor) &&
                               Object.prototype.toString.call(bCtor) == '[object Function]' && (bCtor instanceof bCtor))) {
            return false;
        }
        // Deep compare objects.
        for (var key in a) {
            if (Object.prototype.hasOwnProperty.call(a, key)) {
                // Count the expected number of properties.
                size++;
                // Deep compare each member.
                if (!(result = Object.prototype.hasOwnProperty.call(b, key) && hui.isEqual(a[key], b[key], aStack, bStack))) break;
            }
        }
        // Ensure that both objects contain the same number of properties.
        if (result) {
            for (key in b) {
                if (Object.prototype.hasOwnProperty.call(b, key) && !(size--)) break;
            }
            result = !size;
        }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    
    return result;
};

hui.formatDate = function(date,fmt) {      
    if(!date) date = new Date(); 
    fmt = fmt||'yyyy-MM-dd HH:mm'; 
    var o = {      
    "M+" : date.getMonth()+1, //月份      
    "d+" : date.getDate(), //日      
    "h+" : date.getHours()%12 == 0 ? 12 : date.getHours()%12, //小时      
    "H+" : date.getHours(), //小时      
    "m+" : date.getMinutes(), //分      
    "s+" : date.getSeconds(), //秒      
    "q+" : Math.floor((date.getMonth()+3)/3), //季度      
    "S" : date.getMilliseconds() //毫秒      
    };      
    var week = {      
    "0" : "/u65e5",      
    "1" : "/u4e00",      
    "2" : "/u4e8c",      
    "3" : "/u4e09",      
    "4" : "/u56db",      
    "5" : "/u4e94",      
    "6" : "/u516d"     
    };      
    if(/(y+)/.test(fmt)){      
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));      
    }      
    if(/(E+)/.test(fmt)){      
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[date.getDay()+""]);      
    }      
    for(var k in o){      
        if(new RegExp("("+ k +")").test(fmt)){      
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));      
        }      
    }      
    return fmt;      
};  
/*  
  将String类型解析为Date类型.  
  parseDate('2006-1-1') return new Date(2006,0,1)  
  parseDate(' 2006-1-1 ') return new Date(2006,0,1)  
  parseDate('2006-1-1 15:14:16') return new Date(2006,0,1,15,14,16)  
  parseDate(' 2006-1-1 15:14:16 ') return new Date(2006,0,1,15,14,16);  
  parseDate('不正确的格式') retrun null  
*/   
hui.parseDate = function(str){   
    str = String(str).replace(/^[\s\xa0]+|[\s\xa0]+$/ig, ''); 
    var results = null; 
     
    //秒数 #9744242680 
    results = str.match(/^ *(\d{10}) *$/);   
    if(results && results.length>0)   
      return new Date(parseInt(str)*1000);    
     
    //毫秒数 #9744242682765 
    results = str.match(/^ *(\d{13}) *$/);   
    if(results && results.length>0)   
      return new Date(parseInt(str));    
     
    //20110608 
    results = str.match(/^ *(\d{4})(\d{2})(\d{2}) *$/);   
    if(results && results.length>3)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]));    
     
    //20110608 1010 
    results = str.match(/^ *(\d{4})(\d{2})(\d{2}) +(\d{2})(\d{2}) *$/);   
    if(results && results.length>6)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]),parseInt(results[4]),parseInt(results[5]));    
     
    //2011-06-08 
    results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) *$/);   
    if(results && results.length>3)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]));    
     
    //2011-06-08 10:10 
    results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) +(\d{1,2}):(\d{1,2}) *$/);   
    if(results && results.length>6)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]),parseInt(results[4]),parseInt(results[5]));    
     
    //2011-06-08 10:10:10 
    results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2}) *$/);   
    if(results && results.length>6)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]),parseInt(results[4]),parseInt(results[5]),parseInt(results[6]));    
     
    return (new Date(str));   
}; 


exports.format     = hui.format;
exports.sortBy     = hui.sortBy;
exports.fn         = hui.fn;
exports.inherits   = hui.inherits;
exports.extend     = hui.extend;
exports.derive     = hui.derive;
exports.clone      = hui.clone;
exports.isEqual    = hui.isEqual;
exports.formatDate = hui.formatDate;
exports.parseDate  = hui.parseDate;


