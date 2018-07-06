let {
    spider
} = require('./lib/spider');
const Concurrency  = require('./interface/Concurrency');
const Task  = require('./interface/Task');
const config = require('./config');
const utils = require('./lib/utils');
let proxyReq = require('./example/index');
const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36',
    'Accept-Encoding': 'deflate'
};

async function page(cp) {
    return await spider({
        page: {
            url: config.url+cp,
            method: 'get',
            headers,
            encoding: null,
            timeout: 6000
        },
        content: {
            info: function($) {
                const value = $('#main > table:nth-child(3) > tbody > tr > td:nth-child(1) > div > a.w70 > input[type="text"]').val();
                return {
                    currentPage: value.split('/')[0],
                    totalPage: value.split('/')[1],
                };
            },
            urls: function($) {
                const urls = []
                $('#ajaxtable > tbody:nth-child(2) h3 a').each(function(index, e) {
                    urls.push(config.url_host+ e.href)
                });
                return urls;
            }
        }
    });
}
async function get_img_url(url){
    return await spider({
        page: {
            url: url,
            method: 'get',
            headers,
            encoding: null
        },
        content: {
            urls:function($){
                const urls = []
                $('#main > div:nth-child(4) > table > tbody > tr.tr1.do_not_catch > th:nth-child(2) > table > tbody > tr > td > div.tpc_content.do_not_catch')
                .find('input').each(function(index,e){
                    if(e.src)
                        urls.push(e.src);
                });
                return urls;
            },
            info: function($){
                return {
                    title: $('#main > div:nth-child(2) > table > tbody > tr > td:nth-child(1)').text(),
                    author: $('#main > div:nth-child(4) > table > tbody > tr.tr1.do_not_catch > th.r_two > b').text(),
                }
            }
        }
    })
}

async function get_page_image(page_info){
    let image_url = [];
    const image_url_promise = page_info.urls.map(function(url,index){
        let task =  new Task({
            job: async function(){
                const image_promise = await get_img_url(url)
                image_url = image_url.concat(image_promise.urls);
            },
            error(e){
                console.log(e);
            }
        });
        task.url = url;
        return task;
    });
    const concurrency =  new Concurrency(5);
    await concurrency.reduce(image_url_promise);
    return image_url;
}

async function download_image(urls,dir='dist/'){
    const concurrency =  new Concurrency(25);
    const image_url_promise = urls.map(function(url,index){
        let task = new Task({
            job: async function(){
                // console.log(url)
                await utils.download_image(url,dir);
            },
            error(e){
                // console.log(e,22);
            }
        });
        task.url = url
        return task
    });
    await concurrency.reduce(image_url_promise);
}

async function step(cp=1) {
    console.log(cp)
    const page_info = await page(cp);
    if(page_info.urls.length === 0){
        return false;
    }
    const totalPage = page_info.info.totalPage;
    const image_urls =  await get_page_image(page_info);
    await download_image(image_urls);
    setTimeout(()=>{
        if(cp<totalPage){
            step(cp+1);
        }
    },0)
}

// step(1);
// proxyReq.setProxy('http://101.236.60.52:8866')
// proxyReq.proxyReq()

