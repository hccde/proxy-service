const _request = require('request');
const jsdom = require('jsdom');
const jquery = require('jquery')
const log = require('./log')
const {
    JSDOM
} = jsdom;
let iconv = require('iconv-lite');
const get_jquery = wrap_get_jquery()
module.exports = {
    /**
    {
    page:{
        option
    }
    content: {
        urls:[css-selector]
        info:[css-selector]
    }    
    }
    **/
    async spider(conf) {
        let response,body;
        try{
        let result = await request(conf.page);
        body = result.body;
        response = result.response
        }catch(e){
            log(e)
            return {
                urls:[],
                info:[]
            }
        }
        const [$,dom] = get_jquery(response, body);
        const urls = conf.content.urls($,dom);
        const info = conf.content.info($,dom);
        return {
            urls,
            info
        }
    }
}

function wrap_get_jquery() {
    let Encoding = null;
    return function(res, body) {
        let charsetStr;
        let $;
        let dom;
        if (Encoding) {
            const bodyConv = iconv.decode(body, Encoding);
            dom = new JSDOM(bodyConv);
            $ = jquery(dom.window);
            return [$,dom];
        }
        charsetStr = res['headers']['content-type'].toLowerCase();
        if (charsetStr.indexOf('charset') === -1) {
            dom = new JSDOM(body);
            $ = jquery(dom.window);
            charsetStr = ($('meta').attr('charset')) || ($('meta').attr('content'));
        }
        let charset = charsetStr.split(';').find(function(e) {
            return e.indexOf('charset') > -1;
        });
        let encoding = charset.split('=').pop().toLowerCase().replace('-', '');
        encoding = encoding?encoding:'utf8';
        Encoding = encoding;
        if (encoding !== 'utf8') {
            const bodyConv = iconv.decode(body, encoding);
            dom = new JSDOM(bodyConv);
            $ = jquery(dom.window);
        }else{
            const bodyConv = iconv.decode(body, Encoding);
            dom = new JSDOM(bodyConv);
            $ = jquery(dom.window);
        }
        return [$,dom];
    }
}

async function request(option) {
    return await new Promise(function(reslove, reject) {
        _request(option, function(error, response, body) {
            if (error) {
                reject(error);
            }
            reslove({
                response,
                body,
            })
        })
    })
}