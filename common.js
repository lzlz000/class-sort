/** 打印log */
var gEnableLog = false;

/** 课时资源对象 */
function TimeUnit(classRoomNO, dayNO, timeNO) {
    this.classRoomNO = classRoomNO;
    this.dayNO = dayNO;
    this.timeNO = timeNO;
    this.classNO = -1;
}
TimeUnit.prototype.toString = function () {
    return '(' + this.classRoomNO + ', ' + this.dayNO + ', ' + this.timeNO + ', ' + this.classNO + ')';
};


function log(msg) {
    if (gEnableLog) {
        console.log(msg);
    }
}

/**
 * 获取指定范围内的随机数
 * @param start 起点
 * @param end 终点
 * @returns {number}
 */
function random(start, end){
    var length = end-start+1;
    return Math.floor(Math.random() * length + start);
}

/**
 * 得到随机的课时开始时间点（奇数课时）
 */
function randomClassTime(){
    var tmp = random(1, 12);
    return (tmp%2>0) ? tmp : tmp-1;
}


/**
 * 创建随机数组
 * @param length 数组长度
 * @param range 数组取值范围
 */
function initRandomArray(length, range) {
    var randomArray = [];
    var existed = {};
    for (var i=0; i<length; i++) {
        var val = random(range[0], range[1]);
        while (existed[val]) {
            val = random(range[0], range[1]);
        }
        randomArray.push(val);
        existed[val] = 1; 
    }
    return randomArray;
}

/**
 * 初始化任务处理时间矩阵
 * @param tasks 任务(长度)列表
 * @param nodes 节点(处理速度)列表
 */
function initTimeMatrix(tasks, nodes, timeMatrix) {
    for (var i=0; i<tasks.length; i++) {
        // 分别计算任务i分配给所有节点的处理时间
        var timeMatrix_i = [];
        for (var j=0; j<nodes.length; j++) {
            timeMatrix_i.push(tasks[i] / nodes[j]);
        }
        timeMatrix.push(timeMatrix_i);
    }
}

/**
 * 如果数字为123，则输出0000000123，不够位数就在之前补足0
 * @param {Object} num
 * @param {Object} length
 */
function prefixInteger(num, length) {
	return (Array(length).join('0') + num).slice(-length);
}

/**
 * 是否同一时段（上午/下午/晚上）
 */
var morning = [1,2,3,4];
var afternoon = [5,6,7,8];
var night = [9,10,11,12];
function isSameTimeSlot(timeNOa, timeNOb) {
	return (timeNOa < 4 && timeNOb < 4) 
		|| ((timeNOa >= 4 && timeNOa < 8) && (timeNOb >=4 && timeNOb < 8))
		|| ((timeNOa >= 8) && (timeNOb >=8));
}


/** 填值为时间片编码: roomNO+dayNO+timeNO，5字符+1字符+2字符=8字符 */
function encodeTimeCode(classRoomNO, dayNO, timeNO) {
    return prefixInteger(classRoomNO, 5) + dayNO.toString() + prefixInteger(timeNO, 2);
}

/** 填值为时间片解码: roomNO+dayNO+timeNO，5字符+1字符+2字符=8字符 */
function decodeTimeCode(timeCode) {
    if (!timeCode) {
        return null;
    }
    return new TimeUnit(parseInt(timeCode.substr(0, 5)),
        parseInt(timeCode.substr(5, 1)), parseInt(timeCode.substr(6)));
}

function isExistClassInDay(day, _class) {
    var filter = day.forEach(function(time) {
        return time == _class;
    })
    return filter && filter.length>0;
}

function isExistClassInRoom(room, _class) {
    for (var d=0; d<room.length; d++) {
        for (var t=0; t<room[d].length; t++) {
            if (room[d][t] == _class) {
                return true;
            }
        }
    }
    return false;
}

/** 计算前一个上课日的间隔 */
function calcPreDayInterval(classTimeArr, dayNO) {
    var interval = 0;
    for (var i=0; i<classTimeArr.length; i++) {
            var timeObj = decodeTimeCode(classTimeArr[i]);
            if (timeObj) {
                var tmp = dayNO - timeObj.dayNO;
                if (tmp > interval) {
                    interval = tmp;
                }
            }
    }
    return interval;
}

/** 数组升序 */ 
function compareNumAsc(a, b) {
    return a - b;
}

/** 数组降序 */
function compareNumDesc(a, b) {
    return b - a;
}
