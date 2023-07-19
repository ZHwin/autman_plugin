// [author: zhouwin]
// [create_at: 2022-11-18 05:00:00]
// [version: v1.0.1]
// [title: CK有效性检测]
// [description: 饿了么CK有效性检测]
// [platform: qq]
// [public: true]
// [price: 0.00]
//================================================================
// [rule: 检查饿了]
// [priority: 66]优先级
// [cron: 1 8,12,17,21 * * *]
// [disable: false]

check();

function check() {
   let base = 1;
  var sxck = "";
   let adminMsg = "";
  let ql_json = bucketGet("qinglong", "QLS");
  let ql_data = JSON.parse(ql_json);
  let ql2=ql_data[1]
    //青龙参数
    let ql_ipport = ql2.host;
    let client_id = ql2.client_id;
    let client_secret = ql2.client_secret;
    let token = qltoken(ql_ipport,client_id,client_secret)
    let CKarray=qlselect('elmck',ql_ipport,token)
    var total = CKarray.length;
    // 管理员
    if(isAdmin()){
       if (!total) {
        notifyMasters("管理员，抱歉，ql2里没有elmck！");
        return;
      }else{
        notifyMasters("开始检测...，共有" + total + "个elmck。");
        for (var i = 0; i < total; i++) {
        var cookie = CKarray[i].value;
        var elmmsgStr= elmapi(cookie)
         var elmmsg = JSON.parse(elmmsgStr);
         if (elmmsgStr.indexOf("未登录") >= 0) {
           const user_id=CKarray[i].remarks.split('@')[0]
           const name=CKarray[i].remarks.split('&')[1]
           let msg ="您的饿了么账号: " +
                    name +
                    " ，已过期；\n为了不影响你的收益请发送’更新饿了‘来及时更新。";
                Debug(user_id);
               sxck = Number(sxck) + Number(base);
                adminMsg += sxck + "." + name + "\n";
                console.log(msg);
                //给QQ发
                if (user_id) {
                    push({
                        imType: "qq",
                        userID: user_id,
                        groupCode: "",
                        content: msg,
                    });
                }
           
         } 
       
        sleep(5000); // 5秒后检测下一个
      }  
      
    }
    
 
        if (sxck == "") {
            sendText("太棒了👏！所有eleck全部有效！");
        } else {
            sendText(
                "已经给以下饿了么账号" +
                sxck +
                "个账号\n" +
                adminMsg +
                "用户发送账号登陆提醒"
            );
        }
     
      
      
      
    
      
    }else{
    //只检测自己的elm
       for (var i = 0; i < total; i++) {
        const user_id=CKarray[i].remarks.split('@')[0]
        if(GetUserID()==user_id){
          var cookie = CKarray[i].value;
          var elmmsgStr= elmapi(cookie)
         var elmmsg = JSON.parse(elmmsgStr);
         if (elmmsgStr.indexOf("未登录") >= 0) {
           const name=CKarray[i].remarks.split('&')[1]
           let msg ="您的饿了么账号: " +
                    name +
                    " ，已过期；\n为了不影响你的收益请发送’更新饿了‘来及时更新。";
              
       
                console.log(msg);
                //给QQ发
                if (user_id) {
                    push({
                        imType: "qq",
                        userID: user_id,
                        groupCode: "",
                        content: msg,
                    });
                }
           
         } 
       
        sleep(5000); // 5秒后检测下一个
          
          
          
        }
       } 
    
    
    }
    
    
    
    
   
    
     
}
  //请求饿了么个人信息接口方法
function elmapi(ck) {
    var body = request({
        url: "https://restapi.ele.me/eus/v5/user_detail",
        method: "get",
        headers: {
            "cookie": ck,
        },
    })
    return body;
}
//请求青龙面板返回token方法
function qltoken(ql_ipport, qlclient_id, qlclient_secret) {
    var body = request({
        url: ql_ipport + "/open/auth/token?client_id=" + qlclient_id + "&client_secret=" + qlclient_secret,
        method: "get",
    });
    var fhtoken = JSON.parse(body);
    return fhtoken.data.token;
}
//请求青龙面板查询方法
function qlselect(qq,ql_ipport,qltokens) {
    var body = request({
        url: ql_ipport + "/open/envs?searchValue=" + qq,
        method: "get",
        headers: {
            "Authorization": "Bearer " + qltokens,
        }
    });
  var resDatat=JSON.parse(body)
    return resDatat.data;
}
