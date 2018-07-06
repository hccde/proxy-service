const para = require('../lib/para');
let id = 0;
let _concurrency_pool = {};
let fs = require('fs');
class Concurrency {
    constructor(capacity = 2) {
        this.id = id++;
        this.capacity = capacity;
        this.length = 0;
        this.container = [];
        this.task_container = [];
        this.waiter = null; //lock
        _concurrency_pool[this.id] = this;
    }
    async push(task) {
        if (this.length <= this.capacity) {
            await this.container.push(task.start());
            this.task_container.push(task);
            this.length += 1;
        } else {
            let tmp_container = [];
            let flag = false
            let tmp_task_container = this.task_container.filter((e,index)=>{
                let current = new Date().getTime()
                if(!(current - e.startTime > 60*1000)){
                    tmp_container.push(this.container[index]);
                    return e;
                }else{
                    flag = true
                }
            });
            this.container = tmp_container;
            this.task_container = tmp_task_container;
            if(flag){                
                await this.push(task);
            }else{
                this.waiter = task; // block push
                await this._run();                
            }
        }
    }
    // wait to test
    async reduce(arr,index=0){
        if(!arr.length){
            await false;
            return false;
        }
        await this.push(arr[index]);
        if(index < arr.length-1){
            await this.reduce(arr,index+1);
        }
    }

    async _run() {
        if(this.container.length === 0){
            await true;
            return;
        }
        fs.appendFileSync('./log.txt',JSON.stringify(this.task_container))
        await Promise.race(this.container);
        let new_container = []
        let new_task_container = this.task_container.filter((t,index) => {
            if(t.status === para.REJECTED || t.status === para.FULFILLED){
                return false;
            }else{
                new_container.push(this.container[index]);
                return true;
            }
        });
        if (this.waiter && new_container.length<this.capacity) {
            new_container.push(this.waiter.start());
            new_task_container.push(this.waiter);
            this.waiter = null;
        }else if(!this.waiter){//欠饱和
            await Promise.all(this.container);
            this.container = [];
            this.task_container = [];
        }

        this.container = new_container;
        this.task_container = new_task_container;
        this.length = this.container.length;
    }
    static show_concurrency() {
        return _concurrency_pool;
    }
}
module.exports = Concurrency;