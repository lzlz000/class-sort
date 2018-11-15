//一些工具
// 小写字母开头的是普通函数
// 大写字母开头的均为类 使用是请new对象


/**
 * 数组随机取值 
 * 随机获取数组中的一个值 直到数组取光为止 
 * 当为正整数时 随机返回 0~n的值直到数组取光为止
 * @param {} value number 或者 Array
 */
function RandomIndex(value){
    var _arr;
    if(value instanceof Array)
        _arr = [].concat(value); // 克隆数组
    else{
        _arr = [];
        for (let i = 0; i < value; i++) {
            _arr.push(i);
            
        }
    }
    this.next = ()=>{
        if(_arr.length>0){
            var ran = Math.floor(Math.random()*_arr.length);
            return _arr.splice(ran,1)[0]
        }
    }
}

/**
 * 根据时间空间获取索引 也可以反过来获取 注意要用room在数组中的index而不是Id
 */
function IndexUtil(days,times){
    const timeLength = days * times;
    /**
     * @param {number} day 
     * @param {number} time 
     * @param {number} roomIndex 
     */
    this.getIndex = (day,time,roomIndex)=>{
        return timeLength *roomIndex + times*day + time;
    }
    /**
     * 根据 index 获取 日期 时间 教室 的索引
     * @param {number} index 索引值
     * @return  json {day,time,room}
     */
    this.getPosition = (index)=>{
        var room= Math.floor(index/timeLength);
        var daytime = index%timeLength;
        var day = Math.floor(daytime/ times);
        var time = daytime%times;
        return {day,time,room};
    }
    /** 获取时间索引 这个值一样意味着在同一个时间点 */
    this.getDayTime = (index) =>{
        return index%timeLength;
    }
    this.getRoom = (index) =>{
        return Math.floor(index/timeLength);
    }
}

/**
 *  map 数组
 */
function MapArr(){
    var _data = {};
    this.__proto__ = {
        clear:()=>{
            _data = {};
        },
        push: (key,value) =>{
            if(!_data[key]){
                _data[key] = [];
            }
            _data[key].push(value);
        },
        get : (key1,key2,key3) =>{
            if(!_data[key1]){
                return;
            }
            if(!_data[key1][key2]){
                return;
            }
            return _data[key1][key2][key3];
        }
    } 
}

/**
 * 带跳过的轮盘赌 TODO 经测试，轮盘赌是整个算法中耗时最多的部分，看看能否优化。
 * @param {array} weight 课程概率数组 (下标: 元素编号、值: 该元素对应的概率)
 * @param {array} skip 可选参数 跳过序号的集合 若skip=[1,2]则不会选择数组中下标为1,2的元素，其他值按原概率分部
 * @param {array} skip2 可选参数 和skip 相同用途 但是有时候需要多个数组作为跳过的值 所以分为两个参数
 * @returns {number} 返回概率数组中某一元素的下标
 */
function roll(weights,skip,skip2) {
    var sum = 0;
    var length = weights.length;
    for (var i=0; i<length; i++) {
        let weight = weights[i];
        // 当在skip数组当中 ，它的概率变为0
        if(weight == 0 ||(skip && skip.includes(i)) ||
            (skip2 && skip2.includes(i))){
            continue;
        }
        sum += weight;
    }
    var rand = Math.random() * sum;
    sum = 0;
    for (var i = 0; i<length; i++) {
        let weight = weights[i];
        // 当在skip数组当中 ，它的概率变为0
        if(weight == 0 ||(skip && skip.includes(i)) ||
            (skip2 && skip2.includes(i))){
            continue;
        }
        sum += weight;
        if (sum >= rand) {
            return i;
        }
    }
    return -1;
}

/**
 * 随机整数 范围 [start,end]
 * @param {*} start
 * @param {*} end 
 */
function randomInt(start, end){
    var length = end-start+1;
    return Math.floor(Math.random() * length + start);
}

/**
 * 计时和上一次的时间间隔
 */
function Timer(){
    var _time = new Date().getTime();
    this.__proto__={
        get: ()=>{
            let time = new Date().getTime();
            let interval =  time-_time;
            _time = time;
            return interval;
        }
    }
}
function Logger(level){
    this.level = level;

    this.debug = (... args)=>{
        if(this.level <= Logger.LEVEL.DEBUG)
            console.log(args.reduce((a,b)=>a+" "+b))
    }
    this.info = (... args)=>{
        if(this.level <= Logger.LEVEL.INFO)
            console.log(args.reduce((a,b)=>a+" "+b))
    }
}
Logger.LEVEL={DEBUG:0,INFO:1,NONE:2}

/**
 * 
 * @param {number} days 
 * @param {number} times 
 * @param {object} available 可选 不填代表 days*times的所有时段
 * 形如 { 1:[1,2],5:[4,7] } 代表可用时间段为周1 1,2节课 周5 4,7节课
 * @return {array} [{day:1,time:12},...] 
 */
function dayTimeUtil(days,times,available){
    const result = []; 
    if (available){
        for (const day in available) {
            let timeArr = available[day];
            for (let i = 0; i < timeArr.length; i++) {
                let time = timeArr[i];
                result.push({day,time});
            }
        }
    }else{
        for (let day = 0; day < days; day++) {
            for (let time = 0; time < times; time++) {
                result.push({day,time});
            }
        }
    }
    return result
}


/**
 *  染色体类 包括基因序列 适应度
 * @param {number[]} geneOrder 基因序列
 */
function Chromosome(geneOrder){
    this.setGeneOrder=(geneOrder)=>{
        _setGeneOrder(geneOrder);
    }
    var _setGeneOrder = (geneOrder) => {
        this.geneOrder = geneOrder;
        this.adapt = 0;
        for (let lessonIndex = 0; lessonIndex < geneOrder.length; lessonIndex++) {
            // 此时 i 代表课程序列 val 代表时空序列
            const spaceTimeIndex = geneOrder[lessonIndex];
            this.adapt += adaptability[lessonIndex][spaceTimeIndex];
        }
    }
    _setGeneOrder(geneOrder);
}

/**
 * 动态时间冲突检测
 * 动态时间冲突
 */
function Conflict(){
    this._conflicts = [];
    this._conflictMap = {};
    /**
     * 添加冲突数组，代表一个冲突所关联的所有课程下标，
     * 例如 老师A需要上的课程对应下标为 1,3,45,123,333 则这些下表代表一个冲突
     * @param {number[]} arr arr.length<=1会被忽略,1个元素不存在冲突
     */
    this.add = (arr)=>{
        if(arr.length<=1)
            return;
        this._conflicts.push(arr);
        var conflictIndex = this._conflicts.length-1;
        for (let i = 0; i < arr.length; i++) {
            let index = arr[i];
            if (!this._conflictMap[index]){
                this._conflictMap[index] = [];
            }
            this._conflictMap[index].push(conflictIndex)
        }
    }
    /**
     * 
     * @param {number} index 检查冲突的课程索引
     * @param {number[]} geneOrder 所属的基因序列
     * @returns -1 没有冲突 >=0 第一个冲突所在的位置
     */
    this.check= (index,geneOrder)=>{
        let daytime = indexUtil.getDayTime(geneOrder[index]);
        let conflictArr = this.getRelatedArr(index);
        for (let i = 0; i < conflictArr.length; i++) {
            const lessonIndex = conflictArr[i];
            let lessonDaytime = geneOrder[lessonIndex];
            if (lessonDaytime>=0 && daytime == indexUtil.getDayTime(lessonDaytime)){
                return lessonIndex;
            }
        }
        return -1;
    }
    this.getRelatedArr = (index)=>{
        let conflictIndexArr =  this._conflictMap[index];
        let result = [];// 包含所有不能与他相同时间的课程
        if (conflictIndexArr){
            for (let i = 0; i < conflictIndexArr.length; i++) {
                let conflictIndex = conflictIndexArr[i];
                let conflictArr = this._conflicts[conflictIndex];
                result = result.concat(conflictArr);
            }
        }
        let set = new Set(result);
        set.delete(index);
        return Array.from(set);// 去重
    }
}
