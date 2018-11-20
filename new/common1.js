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
    const timesArr = (()=>{
        let arr = [];
        for (let t = 0; t < times; t++) {
            arr.push(t);
        }
        return arr;
    })();
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
    this.getDayAndTime = (index) =>{
        var daytime = index%timeLength;
        var day = Math.floor(daytime/ times);
        var time = daytime%times;
        return {day,time};
    }
    this.getRoom = (index) =>{
        return Math.floor(index/timeLength);
    }
    this.sameHalfDay = (index) =>{
        let dayAndTime = this.getDayAndTime(index);
        let timeScopeArr;
        if(dayAndTime.time<4){
            timeScopeArr = [0,1,2,3];
        }else if(dayAndTime.time<8){
            timeScopeArr = [4,5,6,7];
        }else {
            timeScopeArr = [8,9,10,11];
        }
        return timeScopeArr.map(time=>times*dayAndTime.day + time)
    }
    this.sameDay = (index) =>{
        let day = this.getDayAndTime(index).day;
        return timesArr.map(time=>times*day + time)
    }
    this.skipDay = (index) =>{
        let day = this.getDayAndTime(index).day;
        let prevDay = day==0?days-1:day-1;
        let nextDay = day>=days-1?0:day+1;
        return timesArr.map(time=>times*day + time)
            .concat(timesArr.map(time=>times*prevDay + time))
            .concat(timesArr.map(time=>times*nextDay + time));
    }
}


/**
 * 带跳过的轮盘赌 TODO 经测试，轮盘赌是整个算法中耗时最多的部分，看看能否优化。
 * @param {array} weight 课程概率数组 (下标: 元素编号、值: 该元素对应的概率)
 * @param {array} skip 可选参数 跳过序号的集合 若skip=[1,2]则不会选择数组中下标为1,2的元素，其他值按原概率分部
 * @param {function} filter 过滤函数，接受参数时空索引 ，返回>0 则替代权重
 * @returns {object} 返回 {index,bad} 概率数组中某一元素的下标 及是否为较差选择
 */
function roll(weights,skip,filter) {
    var sum = 0;
    var length = weights.length;
    let badSet = new Set();
    for (var i=0; i<length; i++) {
        let weight = weights[i];
        // 当在skip数组当中 ，它的概率变为0
        if(weight == 0 ||(skip && skip.includes(i))){
            continue;
        }
        if (filter && filter(i)){
            weight = weight * 0.000001;
            badSet.add(i);
        }
        sum += weight;
    }
    var rand = Math.random() * sum;
    sum = 0;
    for (var i = 0; i<length; i++) {
        let weight = weights[i];
        // 当在skip数组当中 ，它的概率变为0
        if(weight == 0 ||(skip && skip.includes(i))){
            continue;
        }
        if (filter && filter(i)){
            weight = weight * 0.000001;
        }
        sum += weight;
        
        if (sum >= rand) {
            let t = badSet.has(i);
            if(t)
                console.log('11111')
            return {index:i,bad:t};
        }
    }
    return {index:-1,bad:false};
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
 *  染色体类 包括基因序列 适应度
 * @param {number[]} geneOrder 基因序列
 * @param {number} badSelect 差选择数量
 */
function Chromosome(geneOrder,badSelect){
    console.log("badSelect",badSelect);
    this.badSelect = badSelect;
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
        this.adapt -= badSelect * CONFIG.badSelectVal;
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
    this.add = (arr,scope,remark)=>{
        if(arr.length<=1)
            return;
        this._conflicts.push({arr,scope,remark});
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
     * @returns {Set} 类型 geneOrder中所有和index关联课程的dayTime
     */
    this.relatedDayTime= (index,geneOrder)=>{
        let conflicts = this._conflictMap[index];
        let set = new Set();
        if (!conflicts)
            return set;
        for (let i = 0; i < conflicts.length; i++) {
            let conflict = this._conflicts[conflicts[i]];
            let arr = conflict.arr;
            let scope = conflict.scope;
            for (let j = 0; j < arr.length; j++) {
                let lessonIndex = arr[j];
                if (lessonIndex==index)
                    continue;
                let dayTimeRoom = geneOrder[lessonIndex];
                if (dayTimeRoom>=0){
                    // set.add(indexUtil.getDayTime(dayTimeRoom))
                    switch (scope) {
                        case Conflict.Scope.time:
                            set.add(indexUtil.getDayTime(dayTimeRoom))
                            break;
                        case Conflict.Scope.halfDay:
                            indexUtil.sameHalfDay(dayTimeRoom).forEach(dayTimeRoom1 => set.add(dayTimeRoom1));
                            break;
                        case Conflict.Scope.day:
                            indexUtil.sameDay(dayTimeRoom).forEach(dayTimeRoom1 => set.add(dayTimeRoom1));
                            break;
                        case Conflict.Scope.skipDay:
                            indexUtil.skipDay(dayTimeRoom).forEach(dayTimeRoom1 => set.add(dayTimeRoom1));
                            break;
                        default:
                            throw "没有选择冲突时间范围"
                    }
                }
            }
        }
        return set;
    }
    /**
     * 返回所有与 lessonIndex时间冲突的课程index
     */
    this.getRelatedArr = (index)=>{
        let conflictIndexArr =  this._conflictMap[index];
        let result = [];// 包含所有不能与他相同时间的课程
        if (conflictIndexArr){
            for (let i = 0; i < conflictIndexArr.length; i++) {
                let conflictIndex = conflictIndexArr[i];
                let conflict = this._conflicts[conflictIndex];
                let conflictArr = conflict.arr;
                result = result.concat(conflictArr);
            }
        }
        let set = new Set(result);
        set.delete(index);
        return Array.from(set);// 去重
    }
}
/**
 * 冲突的时间占用范围，例如老师、班级的不同课程只要不在同一时间即可 选择time
 * 跨校区冲突选择 halfDay
 * 
 */
Conflict.Scope={
    time:0,
    halfDay:1,
    day:2,
    skipDay:3
}

