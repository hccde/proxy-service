const log = require('../lib/log');
const const_para = require('../lib/para');
let id = 1;

let _task_pool = {}

class Task {
    constructor(props){
        this.retry = 0;
        this.props = props;
        this.job = props.job;
        this.id = id;
        this.startTime = new Date().getTime();
        this.endTime = 0;
        this._status = const_para.READY;
        _task_pool[id] = this;
        id += 1;
    }

    set status(s){
        this._status = s;
        if(s === const_para.REJECTED || s === const_para.FULFILLED){
            this.endTime = new Date().getTime();
            delete _task_pool[this.id];
        }
    }

    get status(){
        return this._status;
    }
    
    async start(){
        this.status = const_para.PENDING;
        try{
            await this.job();
            // value = await this.job_promise;
            this.status = const_para.FULFILLED;
        }catch(e){
            log(e);
            if(this.retry < 3){
                this.retry = this.retry+1;
                this.status = const_para.PENDING;
                await this.start();
            }
            else{
                this.props.error?this.props.error(e):null;
                this.status = const_para.REJECTED;
            }
        }
        return this;
    }
    end(){
        if(this.status === const_para.PENDING){
            Promise.reject(this.job_promise);
            this.props.error&&this.props.error();
            this.status = const_para.REJECTED;
        }
    }
    static kill(id){
        _task_pool[id].end();
    }
    static show_tasks(){
        //todo
        return _task_pool;
    }
}

module.exports = Task;