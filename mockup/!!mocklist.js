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
define('./mocklist', ['./hui', './hui.Mockup'], function(){

hui.Mockup.set('/user_list/all', {
    success: 'true',
    result: [
        {user_id:'unspecified',user_name:'',       user_label: '(unspecified)'},
        {user_id:'andy.wang',  user_name:'王海洋', user_label: '王海洋(andy.wang)'},
        {user_id:'jicheng.li', user_name:'李吉成', user_label: '李吉成(jicheng.li)'}
    ]
});


});