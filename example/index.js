const request =  require('request');

let r = ''

module.exports = {
    proxyReq(url){
        if(!r){
            console.log('set proxy first');
        }
        r.get('http://www.baidu.com/',function(err,res,body){
            if(err)
                console.log(err);
            console.log(body)
        })
    },
    setProxy(url){
        r = request.defaults({'proxy':url,timeout:2000});        
    }
}

