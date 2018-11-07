/** 染色体（教室时间片）集合，对应值为教学班编号； 四维矩阵 A={ChromosomeNO, ClassRoom, Day, Time} -> ClassNO */
var chromosomeMatrix = [];
/** 教学班对应的时间片/排课结果 三维矩阵 B={ChromosomeNO, Class,Times} -> roomNO+dayNO+timeNO */
var classMatrixes = [];

/** 自适应交叉率公式常量 */
var KC1 = 0.9;
var KC2 = 0.6;
/** 自适应变异率公式常量 */
var KM1 = 0.1;
var KM2 = 0.001;

/** 一天的课时 */
var times = [1,2,3,4,5,6,7,8,9,10,11,12];
/** 一周上课日 */
var days = [1,2,3,4,5,6,7];
/** 一学期上课日 17周 （为单双周排课准备）*/
var allDays = new Array(days.length*17);
/** 联排起始小节数 2-两节联排 3-三节联排 4-四节联排 */
var unitTimeStart = {
    1: [1,2,3,4,5,6,7,8,9,10,11,12],
    2: [1,3,5,7,9,11],
    3: [1,2,5,6],       
    4: [1,5,9]
};
/** 初始排一周课时的上课日遍历顺序 */
var daySels = [1,4,3,5,2,6];

/** 校区 */
var Zone = {SP:'SP', JD:'JD'};
/** 教室类别 */
var RoomType = {NORMAL:'normal', COMPUTER:'computer', PLAYGROUD:'playgroud', LAB:'lab', MEDIA:'media'};

/** 教学楼  zone-校区 floors-楼层数（0为操场）*/
var buildings = [
    {id:70001, zone:Zone.SP, floors:20},
    {id:70002, zone:Zone.SP, floors:5},
    {id:70003, zone:Zone.SP, floors:8},
    {id:70004, zone:Zone.SP, floors:12},
    {id:70005, zone:Zone.SP, floors:0},
    {id:70006, zone:Zone.JD, floors:10},
    {id:70007, zone:Zone.JD, floors:18},
    {id:70008, zone:Zone.JD, floors:3},
    {id:70009, zone:Zone.JD, floors:0}
];
var buildingsMap = {};

/** 教室 */
var classRooms = [
    {id:50001, roomType: RoomType.NORMAL, capacity:40, building:70001, floor:5, roomNO:502},
    {id:50002, roomType: RoomType.NORMAL, capacity:120, building:70001, floor:12, roomNO:1201},
    {id:50003, roomType: RoomType.MEDIA, capacity:30, building:70002, floor:3, roomNO:302},
    {id:50004, roomType: RoomType.NORMAL, capacity:40, building:70004, floor:4, roomNO:406},
    {id:50005, roomType: RoomType.PLAYGROUD, capacity:140, building:70005, floor:0, roomNO:1},
    {id:50006, roomType: RoomType.NORMAL, capacity:60, building:70006, floor:5, roomNO:505},
    {id:50007, roomType: RoomType.PLAYGROUD, capacity:150, building:70009, floor:0, roomNO:1}
];
var classroomsMap = {};

/** 教学班
 */ 
var classes = [
    {id:30101, course:10001, teacher:20001, studentNum:28, zone:Zone.SP},
    {id:30102, course:10001, teacher:20001, studentNum:28, zone:Zone.JD},
    {id:30201, course:10002, teacher:20002, studentNum:90, zone:Zone.SP},
    {id:30301, course:10003, teacher:20001, studentNum:48, zone:Zone.SP},
    {id:30302, course:10003, teacher:20003, studentNum:52, zone:Zone.SP},
    {id:30303, course:10003, teacher:20004, studentNum:28, zone:Zone.SP},
    {id:30401, course:10004, teacher:20005, studentNum:28, zone:Zone.SP},
    {id:30402, course:10004, teacher:20005, studentNum:28, zone:Zone.JD},
    {id:30501, course:10005, teacher:20003, studentNum:24, zone:Zone.SP},
    {id:30502, course:10005, teacher:20003, studentNum:24, zone:Zone.SP},
    {id:30503, course:10005, teacher:20004, studentNum:28, zone:Zone.SP},
    {id:30504, course:10005, teacher:20004, studentNum:24, zone:Zone.SP},
    {id:30601, course:10006, teacher:20006, studentNum:28, zone:Zone.SP},
    {id:30602, course:10006, teacher:20006, studentNum:28, zone:Zone.JD},
    {id:30701, course:10007, teacher:20008, studentNum:28, zone:Zone.SP},
    {id:30702, course:10007, teacher:20008, studentNum:28, zone:Zone.SP},
    {id:30801, course:10008, teacher:20009, studentNum:28, zone:Zone.SP},
    {id:30802, course:10008, teacher:20009, studentNum:28, zone:Zone.SP},
    {id:30803, course:10008, teacher:20009, studentNum:28, zone:Zone.JD},
    {id:30901, course:10009, teacher:20012, studentNum:88, zone:Zone.SP}
];
var classesMap = {};

/** 教师  disableTime-不可排课的时间段（302-周三的第3/4课时*/
var teachers = [
    {id:20001, name:'教师1', disableTime: null},
    {id:20002, name:'教师2', disableTime: '30304'},
    {id:20003, name:'教师3'},
    {id:20004, name:'教师4'},
    {id:20005, name:'教师5'},
    {id:20006, name:'教师6'},
    {id:20007, name:'教师7'},
    {id:20008, name:'教师8'},
    {id:20009, name:'教师9'},
    {id:20010, name:'教师10'},
    {id:20011, name:'教师11'},
    {id:20012, name:'教师12'}
];
var teachersMap = {};

/** 课程 
 *     onceHour: 上一次课的课时，实际应用中根据统一规则来计算，若有例外则单独指定或手工排课
 *    timeRequire: 上课的特殊时间要求 day-周几（为null则无特殊要求）, time-课时范围（为null则无特殊要求）
 */
var courses = [
    {id:10001, name:'游戏设计', weekHour:4, totalHour:34, roomType:RoomType.NORMAL, onceHour:2, timeRequire:null},
    {id:10002, name:'计算机原理', weekHour:4, totalHour:34, roomType:RoomType.NORMAL, onceHour:2, timeRequire:null},
    {id:10003, name:'大学英语', weekHour:4, totalHour:16, roomType:RoomType.NORMAL, onceHour:2, timeRequire:null},
    {id:10004, name:'JAVA语言', weekHour:4, totalHour:34, roomType:RoomType.NORMAL, onceHour:2, timeRequire:null},
    {id:10005, name:'英语听力', weekHour:2, totalHour:14, roomType:RoomType.MEDIA, onceHour:2, timeRequire:{day:[2,4], time:[1,2,3,4]}},
    {id:10006, name:'通信原理', weekHour:4, totalHour:48, roomType:RoomType.NORMAL, onceHour:2, timeRequire:null},
    {id:10007, name:'数据结构', weekHour:2, totalHour:34, roomType:RoomType.NORMAL, onceHour:2, timeRequire:null},
    {id:10008, name:'经济学基础', weekHour:6, totalHour:34, roomType:RoomType.NORMAL, onceHour:2, timeRequire:null},
    {id:10009, name:'体育', weekHour:2, totalHour:20, roomType:RoomType.PLAYGROUD, onceHour:2, timeRequire:{day:null, time:[1,2,3,4,5,6,7,8]}}
];
var coursesMap = {};

/** 迭代次数 */
var iteratorNum = 200;

/** 染色体数量 */
var chromosomeNum = 20;

/** 适应度矩阵(下标：染色体编号、值：该染色体的适应度) */
var adaptability = [];
/** 自然选择的概率矩阵(下标：染色体编号、值：该染色体被选择的概率) */
var selectionProbability = [];

/** 染色体复制的比例(每代中保留适应度较高的染色体直接成为下一代) */
var cp = 0.2;
/** 参与交叉变异的染色体数量 */
var crossoverMutationNum;

/** 任务处理适应度结果集([迭代次数][染色体编号] = 适应度) */
var logGenData = [];

/** 必须满足的约束（冲突） */
var neceReq = [
    function(roomMatrix, classMatrix, classRoomNO, dayNO, timeNO, classNO) {
        //log('nece-func-1: 同一时间片一个教师只能上一门课程: ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        var matchable = true;
        for(var c = 0; c < classRooms.length; c++) {
            var existClassNO = roomMatrix[c][dayNO][timeNO];
            if (!existClassNO || existClassNO == classNO) {
                continue;
            }
            if (!classes[existClassNO] || !classes[classNO]) {
                continue;
            }
            
            if (classes[existClassNO].teacher == classes[classNO].teacher) {
                matchable = false;
                break;
            }
        }
        if (!matchable) {
            log('[UnMatch]nece-func-1: 同一时间片一个教师只能上一门课程: ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        }
        return matchable;
    },
    function(roomMatrix, classMatrix, classRoomNO, dayNO, timeNO, classNO) {
        //log('nece-func-2: 某一教室的某一时间片只能被一门课程占用: ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        var matchable = true;
        var existClassNO = roomMatrix[classRoomNO][dayNO][timeNO];
        if(existClassNO && classes[existClassNO] && existClassNO != classNO) {
            matchable = false;
        }
        if (!matchable) {
            log('[UnMatch]nece-func-2: 某一教室的某一时间片只能被一门课程占用: ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        }
        return matchable;
    },
    function(roomMatrix, classMatrix, classRoomNO, dayNO, timeNO, classNO) {
        //log('nece-func-3: 某班学生在某一时间片只能被安排在一个教室上课: ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        var matchable = true;
        for(var c = 0; c < classRooms.length; c++) {
            var existClassNO = roomMatrix[classRoomNO][dayNO][timeNO];
            if (!existClassNO || existClassNO == classNO) {
                continue;
            }
            if (!classes[existClassNO] || !classes[classNO]) {
                continue;
            }
            
            if (classNO == existClassNO) {
                matchable = false;
                break;
            }
        }
        if (!matchable) {
            log('[UnMatch]nece-func-3: 某班学生在某一时间片只能被安排在一个教室上课: ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        }
        return matchable;
    },
    function(roomMatrix, classMatrix, classRoomNO, dayNO, timeNO, classNO) {
        //log('nece-func-4: 某课程m必须安排在预定的时间片n上: ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        var matchable = true;
        var classSel = classes[classNO];
        if (classSel && classSel.timeRequire) {
            if (classSel.timeRequire.day) {
                var dayFilter = classSel.timeRequire.day.filter(function (day) {
                    return (dayNO+1) == day;
                });
                if (!dayFilter || dayFilter.length <= 0) {
                    matchable = false;
                }
            }
            if (classSel.timeRequire.time && matchable) {
                var timeFilter = classSel.timeRequire.time.filter(function (time) {
                    return (timeNO+1) == time;
                });
                if (!timeFilter || timeFilter.length <= 0) {
                    matchable = false;
                }
            }
        }
        if (!matchable) {
            log('[UnMatch]nece-func-4: 某课程m必须安排在预定的时间片n上: ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        }
        return matchable;
    },
    function(roomMatrix, classMatrix, classRoomNO, dayNO, timeNO, classNO) {
        var matchable = true;
        if (!matchable) {
            log('[UnMatch]nece-func-5: 某教师m在时间片n时不能上课: ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        }
        return matchable;
    },
    function(roomMatrix, classMatrix, classRoomNO, dayNO, timeNO, classNO) {
        //log('nece-func-6: 同一教学班任务不要在同一天内连续的开课: ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        var matchable = true;
        var dayHourCnt = 0;
        var classResult = classMatrix[classNO];
        if (classResult && classResult.length > 0) {
            for(var c = 0; c < classResult.length; c++) {
                var timeObj = decodeTimeCode(classResult[c]);
                if (timeObj.dayNO == dayNO) {
                    dayHourCnt++;
                }
            }
        }
        matchable = (dayHourCnt < coursesMap[classes[classNO].course].onceHour);
        if (!matchable) {
            log('[UnMatch]nece-func-6: 同一教学班任务不要在同一天内连续的开课: ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        }
        return matchable;
    },
    function(roomMatrix, classMatrix, classRoomNO, dayNO, timeNO, classNO) {
        //log('nece-func-7: 课程对教室的要求: ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        var matchable = true;
        var classRoom = classRooms[classRoomNO];
        var course = coursesMap[classes[classNO].course];
        // 匹配教室类型，容量，校区
        matchable = (classRoom.roomType == course.roomType) 
            && (classes[classNO].studentNum <= classRoom.capacity)
            && (buildingsMap[classRoom.building].zone == classes[classNO].zone);
        if (!matchable) {
            log('[UnMatch]nece-func-7: 课程对教室的要求: ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        }
        return matchable;
    },
    function(roomMatrix, classMatrix, classRoomNO, dayNO, timeNO, classNO) {
        //log('nece-func-8: 同一课程的一次课分配在同一时段（上午/下午/晚上）: ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        var matchable = true;
        var classResult = classMatrix[classNO];
        if (classResult && classResult.length > 0) {
            for(var c = 0; c < classResult.length; c++) {
                var timeObj = decodeTimeCode(classResult[c]);
                if (timeObj.dayNO == dayNO && !isSameTimeSlot(timeObj.timeNO, timeNO)) {
                    matchable = false;
                    break;
                }
            }
        }
        if (!matchable) {
            log('[UnMatch]nece-func-8: 同一课程的一次课分配在同一时段（上午/下午/晚上）: ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        }
        return matchable;
    }
];

/** 尽可能满足的约束（适应能力） */
var possReq = [
    function(roomMatrix, classMatrix, classRoomNO, dayNO, timeNO, classNO) {
        var suitVal = 0;
        var rate = classes[classNO].studentNum / classRooms[classRoomNO].capacity;
        
        // 比值越接近1，适应度越高: rate*100
        suitVal = rate * 100;

        log('poss-func-1: 较高的教室利用率（上课人数/教室的座位数）: ' + suitVal + ' | ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        return suitVal;
    },
    function(roomMatrix, classMatrix, classRoomNO, dayNO, timeNO, classNO) {
        var suitVal = 0;

        // 周二下午排课 -10
        if (dayNO == 2-1) {
            suitVal -= 10;
        }
        // 晚上排课 -15
        if (timeNO >8) {
            suitVal -= 15;
        }
        // 周六排课 -20
        if (dayNO == 6-1) {
            suitVal -= 20;
        }

        log('poss-func-2: 晚上/周二下午/周六尽量不排课: ' + suitVal + ' | ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        return suitVal;
    },
    function(roomMatrix, classMatrix, classRoomNO, dayNO, timeNO, classNO) {
        var suitVal = 0;
        var classNO = roomMatrix[classRoomNO][dayNO][timeNO];
        if (classNO) {
            // 计算最大间隔天数
            var interMax = calcPreDayInterval(classMatrix[classNO]);
            // 间隔一天+5
            if (interMax == 1) {
                suitVal += 5;
            }
            // 间隔两天+10
            if (interMax == 2) {
                suitVal += 10;
            }
            // 其他情况不加分
        }

        log('poss-func-3: 一周内同一门课程均匀分布: ' + suitVal + ' | ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        return suitVal;
    },
    function(roomMatrix, classMatrix, classRoomNO, dayNO, timeNO, classNO) {
        var suitVal = 0;
        var classNO = roomMatrix[classRoomNO][dayNO][timeNO];
        var classObj = classes[classNO];
        var classRoom = classRooms[classRoomNO];
        
        // 遍历课程所属老师
        for (var c=0; c<classMatrix.length; c++) {
            if (classes[c].teacher && classes[c].teacher == classObj.teacher && c!=classNO) {
                var classTimeArr = classMatrix[c];
                for (var i=0; i<classTimeArr.length; i++) {
                    var timeObj = decodeTimeCode(classTimeArr[i]);
                    var buildingObj = buildingsMap[classRooms[timeObj.classRoomNO].building];
                    var buildingCur = buildingsMap[classRoom.building];
                    
                    // 只比较比当前晚的课时，避免重复计算
                    if (timeObj && timeObj.dayNO==dayNO && timeNO > timeObj.timeNO
                        && isSameTimeSlot(timeObj.timeNO, timeNO)
                        && buildingObj.id==buildingCur.id) {
                        suitVal += 10;
                    }
                        
                    // 教师同一天的课程尽量在同一校区
                    if (timeObj && timeObj.dayNO==dayNO && timeNO > timeObj.timeNO
                        && buildingObj.zone == buildingCur.zone) {
                        suitVal += 5;
                    }
                }
            }
        }

        log('poss-func-4: 教师同一时段（上午/下午/晚上）的课程尽量在同一教学楼/同一天的课程尽量在同一校区: ' + suitVal + ' | ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        return suitVal;
    },
    function(roomMatrix, classMatrix, classRoomNO, dayNO, timeNO, classNO) {
        var suitVal = 0;
        // todo: 需要查教学班对应的具体学生，根据学生的不同课程所属教学楼来计算比例，计算量很大

        log('poss-func-5: 学生同一时段（上午/下午/晚上）的课程尽量在同一教学楼/同一天的课程尽量在同一校区: ' + suitVal + ' | ' + classRoomNO + ',' + dayNO + ',' + timeNO + ',' + classNO);
        return suitVal;
    }
];

/** 拆分一个课程的周课时规则 
 *     偶数：按一次课2个课时分配；
 *    奇数：>3 一次课2个课时分配，最后一次1课时；=3 一次课3个课时； =1 一次课1个课时
 */
var splitWeekHours = function(_class) {
    courses.forEach(function(course, index) {
        if (course.weekHour % 2 == 0) {
            course.onceHour = 2;
        } else if (course.weekHour == 3) {
            course.onceHour = 3;
        } else if (course.weekHour == 1) {
            course.onceHour = 1;
        } else {
            course.onceHour = 2;
        }
    });
};

/** 适应度计算 */
var calcSuitVal = function(roomMatrix, classMatrix, classRoomNO, dayNO, timeNO, classNO) {
    var suitVal = 0;
    for (var i=0; i<possReq.length; i++) {
        if (possReq[i]) {
            suitVal += possReq[i](roomMatrix, classMatrix, classRoomNO, dayNO, timeNO, classNO);
        }
    }
    return suitVal;
};

/** 交叉率计算 */
var calcCrossRate = function() {
    
};

/** 变异率计算 */
var calcMutationRate = function() {
    
};

/** 染色体（教室时间片）集合 四维矩阵 A={chromosomeNO, ClassRoom, Day, Time} */
/** 填值为教学班编码: classNO，5字符 */
function initChromosomeMatrix() {
    for (var cms=0; cms<chromosomeNum; cms++) {
        chromosomeMatrix[cms] = [];
        for (var c=0; c<classRooms.length; c++) {
            chromosomeMatrix[cms][c] = [];
            for (var d=0; d<days.length; d++) {
                chromosomeMatrix[cms][c][d] = [];
                for (var t=0; t<times.length; t++) {
                    chromosomeMatrix[cms][c][d][t] = -1;
                }
            }
        }
    }
}

/** 教学班对应的时间片/排课结果 三维矩阵 B={chromosomeNO, Class, Times} */
/** 填值为时间片编码: roomNO+dayNO+timeNO，5字符+1字符+2字符=8字符 */
function initclassMatrixes() {
    for (var cms=0; cms<chromosomeNum; cms++) {
        classMatrixes[cms] = [];
        for (var c=0; c<classes.length; c++) {
            classMatrixes[cms][c] = [];
        }
    }
}

/** 初始化相关索引Map */
function initMapCaches() {
    courses.forEach(function(course, index) {
        coursesMap[course.id] = course;
    });
    classes.forEach(function(_class, index) {
        classesMap[_class.id] = _class;
    });
    teachers.forEach(function (teacher, index) {
        teachersMap[teacher.id] = teacher;
    });
    buildings.forEach(function(building, index) {
        buildingsMap[building.id] = building;
    });
    classRooms.forEach(function(classroom, index) {
        classroomsMap[classroom.id] = classroom;
        
//      for (var cms=0; cms<chromosomeNum; cms++) {
//          if (!classroomCache[cms]) {
//              classroomCache[cms] = [];
//          }
//          classroomCache[cms][index] = {
//              useTimeCnt: 0, 
//              eveningUseTimeCnt: 0,
//              weekendUseTimeCnt: 0
//          };
//      }
    });
}

/**
 * 初始化遗传算法
 * @param _taskNum 任务数量
 * @param _nodeNum 节点数量
 * @param _iteratorNum 迭代次数
 * @param _chromosomeNum 染色体数量
 * @param _cp 染色体复制的比例
 */
var startGA = function() {

    initMapCaches();
    
    initChromosomeMatrix();
    
    initclassMatrixes();
    
    // 执行遗传算法
    ga();

    // 渲染视图
    draw();
}
//startGA(100, 10, 100, 100, 0.2);

/**
 * 遗传算法
 */
function ga() {
    crossoverMutationNum = chromosomeNum - chromosomeNum*cp;

    // 初始化原始染色体（首次迭代的结果集）
    for (var cms=0; cms<chromosomeNum; cms++) {
        initGeneration(chromosomeMatrix[cms], classMatrixes[cms]);
    }

    // 迭代搜索
    gaSearch(iteratorNum);
}

/**
 * 初始化结果集，为进入GA迭代作准备
 */
function initGeneration(roomMatrix, classMatrix) {
    // 遍历的是教学班，随机选择教室
    for (var classNO=0; classNO<classes.length; classNO++) {
        var classObj = classes[classNO];
        var course = coursesMap[classObj.course];
        
        // 联排起始节次
        var timeStarts = unitTimeStart[course.onceHour];
        
        // 随机选择一个教室
        var roomRandArr = initRandomArray(roomMatrix.length, [1, roomMatrix.length]);
        for (var cIndex=0; cIndex<roomRandArr.length; cIndex++) {
            var c = roomRandArr[cIndex] - 1;
            
            // todo：教室类型冲突可以放出来提高效率
        
            for (var dIndex=0; dIndex<daySels.length; dIndex++) {
                var d = daySels[dIndex] - 1;
                
                for (var tIndex=0; tIndex<timeStarts.length; tIndex++) {
                    var t = timeStarts[tIndex] - 1;
                
                    // 是否已占用
                    if (roomMatrix[c][d][t] != -1) {
                        continue;
                    }
                    
                    // 该教学班本周内是否还有待排课时
                    var leftHour = course.weekHour - classMatrix[classNO].length;
                    if (leftHour <= 0) {
                        break;
                    }
                    
                    // 当天是否还有足够剩余课时
                    if ((roomMatrix[c][d].length-t) < leftHour) {
                        break;
                    }
                    
                    // 待排课时的一次课课时长度
                    var onceHour = course.onceHour;
                    if (leftHour < course.onceHour) {
                        onceHour = leftHour;
                    }
                    
                    // 一次课课时内检测是否有冲突
                    var bConflict = false;
                    for (var i=0; i<onceHour; i++) {
                        if (checkConflict(roomMatrix, classMatrix, c, d, t+i, classNO) == false) {
                            // 冲突则先恢复该次课的标记
                            for (var j=0; j<i; j++) {
                                roomMatrix[c][d][t+j] = 0;
                                classMatrix[classNO].pop();
                            }
                            bConflict = true;
                            break;
                        }
                    
                        roomMatrix[c][d][t+i] = classNO;
                        classMatrix[classNO].push(encodeTimeCode(c, d, t+i));
                    }
                    
                    // 当天的一次课顺利排出，跳出到另一天
                    if (!bConflict) {
                        break;
                    }
                }
                    
                // 该教学班本周内是否还有待排课时
                var leftHour = course.weekHour - classMatrix[classNO].length;
                if (leftHour <= 0) {
                    break;
                }
            }
                    
            // 该教学班本周内是否还有待排课时
            var leftHour = course.weekHour - classMatrix[classNO].length;
            if (leftHour <= 0) {
                break;
            }
        }
    }
}

/** 冲突检测 */
function checkConflict(roomMatrix, classMatrix, classRoomNO, dayNO, timeNO, classNO) {
    if (classNO < 0) {
        return true;
    }
    
    for (var i=0; i<neceReq.length; i++) {
        if (neceReq[i] && neceReq[i](roomMatrix, classMatrix, classRoomNO, dayNO, timeNO, classNO) == false) {
            return false;
        }
    }
    return true;
}

/**
 * 打印染色体适应度
 */
function logAdaptResult(iterNum) {
    logGenData[iterNum] = [];
    adaptability.forEach(function (val, index) {
        logGenData[iterNum].push(val);
        log("chromosomeNum: " + index + ", adaptVal: " + val);
    });
}
/**
 * 迭代搜索
 * @param iteratorNum 迭代次数
 * @param chromosomeNum 染色体数量
 */
function gaSearch(iteratorNum) {
    var itIndex=0;

    // 迭代繁衍
    for (; itIndex<iteratorNum; itIndex++) {
        log("start iterate: " + itIndex,true);

        // 计算上一代各条染色体的适应度
        calAdaptability(chromosomeMatrix);
        logAdaptResult(itIndex);

        // 计算自然选择概率
        calSelectionProbability(adaptability);

        // 生成新一代染色体
        createGeneration();
    }

    // 最终适应度
    log("finish iterate. ");
    calAdaptability(chromosomeMatrix);
    logAdaptResult(itIndex);
}

/**
 * 繁衍新一代染色体
 */
function createGeneration() {
    // 复制（得到直接复制的优异染色体下标
    var goodRoomMatrixes = [];
    var goodClassMatrixes = [];
    copy(goodRoomMatrixes, goodClassMatrixes);

    // 交叉生成{crossoverMutationNum}条染色体
    var crossRoomMatrixes = [];
    var crossClassMatrixes = [];
    cross(crossRoomMatrixes, crossClassMatrixes);

    // 变异
    mutation(crossRoomMatrixes, crossClassMatrixes);

    // 拼接下一代种群
    chromosomeMatrix = goodRoomMatrixes.concat(crossRoomMatrixes);
    classMatrixes = goodClassMatrixes.concat(crossClassMatrixes);
}

/**
 * 计算 染色体适应度
 * @param chromosomeMatrix
 */
function calAdaptability(chromosomeMatrix) {
    adaptability = [];

    // 计算每条染色体的适应度
    for (var cms=0; cms<chromosomeNum; cms++) {
        var suitVal = 0;
        var roomMatrix = chromosomeMatrix[cms];
        var classMatrix = classMatrixes[cms];
        
        for(var c = 0; c < roomMatrix.length; c++) {
            for(var d = 0; d < roomMatrix[c].length; d++) {
                var preClassNO = roomMatrix[c][d][0];
                for(var t = 0; t < roomMatrix[c][d].length; t++) {
                    // 同一课程的连续课时不再计算
                    if ((roomMatrix[c][d][t]==-1) || (t>0 && preClassNO==roomMatrix[c][d][t])) {
                        preClassNO = roomMatrix[c][d][t];
                        continue;
                    }
                    
                    suitVal += calcSuitVal(roomMatrix, classMatrix, c, d, t, roomMatrix[c][d][t]);
                    preClassNO = roomMatrix[c][d][t];
                }
            }
        }

        adaptability.push(suitVal);
    }
}

/**
 * 计算自然选择概率
 * @param adaptability
 */
function calSelectionProbability(adaptability) {
    selectionProbability = [];

    // 计算适应度总和
    var sumAdaptability = 0;
    for (var i=0; i<chromosomeNum; i++) {
        sumAdaptability += adaptability[i];
    }

    // 计算每条染色体的选择概率
    for (var i=0; i<chromosomeNum; i++) {
        selectionProbability.push(adaptability[i] / sumAdaptability);
    }
}

/**
 * 是否本次课开始的课时
 * @param roomMatrix
 * @param roomNO
 * @param dayNO
 * @param timeNO
 * @param classNO
 * @returns {boolean}
 */
function isStartClassTime(roomMatrix, roomNO, dayNO, timeNO, classNO) {
    return !(classNO>0 && timeNO>0
        && classNO == roomMatrix[roomNO][dayNO][timeNO-1]);
}

/**
 * 按天索引教学班的排课课时
 * @param classMatrix
 * @param classNO
 */
function collectTimesMap(classMatrix, classNO) {
    var timeObjMap = {};
    for (var to=0; to<classMatrix[classNO].length; to++) {
        var timeObj = decodeTimeCode(classMatrix[classNO][to]);
        timeObj.classNO = classNO;
        var dayIndex = prefixInteger(timeObj.classRoomNO, 5) + timeObj.dayNO.toString();
        if (!timeObjMap[dayIndex]) {
            timeObjMap[dayIndex] = [];
        }
        timeObjMap[dayIndex].push(timeObj);
    }
    return timeObjMap;
}

/**
 * 收集目标位置资源
 */
function collectDstTimes(roomMatrix, classMatrix, resTimes, roomNODst, dayNODst, timeNODst, classNODst) {
    var timeObjArrDst = [];
    if (classNODst > -1) {
        for (var to=0; to<classMatrix[classNODst].length; to++) {
            var timeObj = decodeTimeCode(classMatrix[classNODst][to]);
            if (timeObj.classRoomNO != roomNODst || timeObj.dayNO != dayNODst) {
                continue;
            }
            timeObjArrDst.push(timeObj);
        }
    } else {
        resTimes.forEach(function(timeObj, index) {
            if (roomMatrix[roomNODst][dayNODst][timeNODst+index] == -1) {
                timeObjArrDst.push(timeObj);
            }
        });
    }
    return timeObjArrDst;
}

/**
 * 重置一次课的课时
 * @param classMatrix
 * @param classNO
 * @param roomNO
 * @param dayNO
 */
function resetOnceTimes(roomMatrix, classMatrix, classNO, roomNO, dayNO) {
    if (classNO <= -1) {
        return;
    }

    classMatrix[classNO] = classMatrix[classNO].filter(function(timeCode) {
        if (timeCode.substr(0, 6) == (prefixInteger(roomNO, 5) + dayNO.toString())) {
            var tmpObj = decodeTimeCode(timeCode);
            roomMatrix[tmpObj.classRoomNO][tmpObj.dayNO][tmpObj.timeNO] = -1;
            return false;
        }
        return true;
    });
}

/**
 * 提交填值两个交换的一次课
 * @param roomMatrix
 * @param classMatrix
 * @param timeObjArr
 * @param timeObjArrDst
 * @param classNO
 * @param classNODst
 */
function commitExchOnceTimes(roomMatrix, classMatrix, timeObjArr, timeObjArrDst, classNO, classNODst) {
    for (var exchIndex=0; exchIndex<timeObjArr.length; exchIndex++) {
        var timeObj = timeObjArr[exchIndex];
        var timeObjDst = timeObjArrDst[exchIndex];

        classNO>-1 && classMatrix[classNO].push(encodeTimeCode(timeObjDst.classRoomNO, timeObjDst.dayNO, timeObjDst.timeNO));
        roomMatrix[timeObjDst.classRoomNO][timeObjDst.dayNO][timeObjDst.timeNO] = classNO;
        classNODst>-1 && classMatrix[classNODst].push(encodeTimeCode(timeObj.classRoomNO, timeObj.dayNO, timeObj.timeNO));
        roomMatrix[timeObj.classRoomNO][timeObj.dayNO][timeObj.timeNO] = classNODst;
    }
}

/**
 * 交叉生成{crossoverMutationNum}条染色体
 * @param copyIndexArr 上一代直接复制的下标
 */
function cross(crossRoomMatrixes, crossClassMatrixes) {
    var crossIndexArr = [];

    for (var chromosomeIndex=0; chromosomeIndex<crossoverMutationNum; chromosomeIndex++) {
        var rwsBaba = RWS(selectionProbability);
        var rwsMama = RWS(selectionProbability);
        
        // 不参与交叉变异的优异染色体
        while (rwsBaba == rwsMama) {
            // 采用轮盘赌选择父母染色体
            rwsMama = RWS(selectionProbability);
        }

        var chromosomeBaba = deepCopyRoomMatrix(chromosomeMatrix[rwsBaba]);
        var classMatrixBaba = deepCopyClassMatrix(classMatrixes[rwsBaba]);
        var chromosomeMama = chromosomeMatrix[rwsMama];
        var classMatrixMama = classMatrixes[rwsMama];

        crossRoomMatrixes.push(chromosomeBaba);
        crossClassMatrixes.push(classMatrixBaba);
        crossIndexArr.push(rwsBaba);
        
        // todo: 自适应交叉率计算 
        var crossRate = 0;
        var crossNum = 10;
        
        // 累计交叉成功的个数
        var crossAllCnt = 0;
        // 随机遍历教学班
        var classRandArr = initRandomArray(classMatrixBaba.length, [1, classMatrixBaba.length]);
        for (var cIndex=0; cIndex<classRandArr.length; cIndex++) {
            var classNOBaba = classRandArr[cIndex] - 1;
            if (crossAllCnt >= crossNum) {
                break;
            }
            
            // 查找baba中该教学班的排课
            var timeObjMapBaba = collectTimesMap(classMatrixBaba, classNOBaba);

            // 查找mama中该教学班的排课
            var timeObjMapMama = collectTimesMap(classMatrixMama, classNOBaba);

            for (var dayIndex in timeObjMapMama) {
                // 找到相同课时的上课日
                var dayIndexBaba = -1;
                for (dayIndexBaba in timeObjMapBaba) {
                    if (timeObjMapBaba[dayIndexBaba].length == timeObjMapMama[dayIndex].length) {
                        break;
                    }
                }
                if (dayIndexBaba == -1) {
                    continue;
                }
                var timeObjBabaArr = timeObjMapBaba[dayIndexBaba];
                timeObjMapBaba[dayIndexBaba] = [];
                
                var roomNOMama = parseInt(dayIndex.substr(0, 5));
                var dayNOMama = parseInt(dayIndex.substr(5, 1));
                var timeNOMama = timeObjMapMama[dayIndex][0].timeNO;
                
                var roomNOBaba = parseInt(dayIndexBaba.substr(0, 5));
                var dayNOBaba = parseInt(dayIndexBaba.substr(5, 1));
                var timeNOBaba = timeObjBabaArr[0].timeNO;
                
                // Baba目标位置是否有排课
                var classNOBabaDst = chromosomeBaba[roomNOMama][dayNOMama][timeNOMama];
                // 目标教学班要不相同才有交换的意义
                if (classNOBabaDst == classNOBaba) {
                    continue;
                }
                // 需要为本次课开始的课时
                if (!isStartClassTime(chromosomeBaba, roomNOMama, dayNOMama, timeNOMama, classNOBabaDst)) {
                    continue;
                }

                // 收集目标位置资源
                var timeObjBabaArrDst = collectDstTimes(chromosomeBaba, classMatrixBaba,
                    timeObjMapMama[dayIndex], roomNOMama, dayNOMama, timeNOMama, classNOBabaDst);

                // 课时相同才交换
                if (timeObjMapMama[dayIndex].length == timeObjBabaArr.length
                    && timeObjBabaArrDst.length == timeObjBabaArr.length) {
                    
                    // 先将该排课信息置空以便冲突检测
                    resetOnceTimes(chromosomeBaba, classMatrixBaba, classNOBaba, roomNOBaba, dayNOBaba);
                    resetOnceTimes(chromosomeBaba, classMatrixBaba, classNOBabaDst, roomNOMama, dayNOMama);

                    // 满足冲突检测则交换
                    if (checkConflict(chromosomeBaba, classMatrixBaba, roomNOMama, dayNOMama, timeNOMama, classNOBaba)
                        && checkConflict(chromosomeBaba, classMatrixBaba, roomNOBaba, dayNOBaba, timeNOBaba, classNOBabaDst))
                    {
                        commitExchOnceTimes(chromosomeBaba, classMatrixBaba, timeObjBabaArr, timeObjMapMama[dayIndex], classNOBaba, classNOBabaDst);
                        log("交换成功+1，累计成功：" + (++crossAllCnt));
                        continue;
                    } else {
                        // 还原
                        commitExchOnceTimes(chromosomeBaba, classMatrixBaba, timeObjBabaArr, timeObjMapMama[dayIndex], classNOBabaDst, classNOBaba);
                    }
                }
            }
            
        }
    }

    return crossIndexArr;
}

/**
 * 从数组中寻找最大的n个元素
 * @param array
 * @param n
 */
function maxNIndex(array, n) {
    var sortArr = array.slice(0);
    sortArr.sort(compareNumDesc);
    
    // 取最大的n个元素
    var maxIndex = [];
    for (var i=0; i<n; i++) {
        for (var j=0; j<array.length; j++) {
            if (sortArr[i] == array[j]) {
                maxIndex[i] = j;
                break;
            }
        }
    }
    
    return maxIndex;
}

/**
 * 深度拷贝资源染色体
 * @param roomMatrix
 */
function deepCopyRoomMatrix(roomMatrix) {
    var newRoomMatrix = roomMatrix.slice(0);
    for (var r=0; r<newRoomMatrix.length; r++) {
        newRoomMatrix[r] = roomMatrix[r].slice(0);
        for (var d=0; d<newRoomMatrix[r].length; d++) {
            newRoomMatrix[r][d] = roomMatrix[r][d].slice(0);
        }
    }
    return newRoomMatrix;
}

/**
 * 深度拷贝排课结果
 * @param classMatrix
 */
function deepCopyClassMatrix(classMatrix) {
    var newClassMatrix = classMatrix.slice(0);
    for (var c=0; c<newClassMatrix.length; c++) {
        newClassMatrix[c] = classMatrix[c].slice(0);
    }
    return newClassMatrix;
}

/**
 * 复制(保留上一代中优良的染色体)
 * 此函数只计算保留的下标
 */
function copy(goodRoomMatrixes, goodClassMatrixes) {
    // 寻找适应度最高的N条染色体的下标(N=染色体数量*复制比例)
    var copyIndexArr = maxNIndex(adaptability, chromosomeNum*cp);

    for (var i=0; i<copyIndexArr.length; i++) {
        var index = copyIndexArr[i];

        goodRoomMatrixes[i] = deepCopyRoomMatrix(chromosomeMatrix[index]);
        goodClassMatrixes[i] = deepCopyClassMatrix(classMatrixes[index]);
    }
    return copyIndexArr;
}

/**
 * 轮盘赌算法
 * @param selectionProbability 概率数组(下标: 元素编号、值: 该元素对应的概率)
 * @returns {number} 返回概率数组中某一元素的下标
 */
function RWS(selectionProbability) {
    var sum = 0;
    var rand = Math.random();
    for (var i=0; i<selectionProbability.length; i++) {
        sum += selectionProbability[i];
        if (sum >= rand) {
            return i;
        }
    }
}

/**
 * 获取随机课时资源位置及其教学班
 * @param roomMatrix
 * @param timeStarts
 * @param resClassNO
 * @returns {TimeUnit}
 */
function getRandDstTimes(roomMatrix, timeStarts, resClassNO) {
    // 随机获取目标位置
    var roomNODst = random(0, classRooms.length-1);
    var dayNODst = random(0, days.length-1);
    var timeNODstIndex = random(0, timeStarts.length-1);
    var timeNODst = timeStarts[timeNODstIndex] - 1;

    // 目标位置是否有排课
    var classNODst = roomMatrix[roomNODst][dayNODst][timeNODst];

    // 目标教学班要不相同才有交换的意义
    // 需要为本次课开始的课时
    while ((classNODst == resClassNO) || !isStartClassTime(roomMatrix, roomNODst, dayNODst, timeNODst, classNODst)) {
        roomNODst = random(0, classRooms.length-1);
        dayNODst = random(0, days.length-1);
        timeNODstIndex = random(0, timeStarts.length-1);
        timeNODst = timeStarts[timeNODstIndex] - 1;
        classNODst = roomMatrix[roomNODst][dayNODst][timeNODst];
    }

    var timeDst = new TimeUnit(roomNODst, dayNODst, timeNODst);
    timeDst.classNO = classNODst;

    return timeDst;
}

/**
 * 变异
 * @param crossRoomMatrixes 参与交叉之后的种群
 */
function mutation(crossRoomMatrixes, crossClassMatrixes) {
    var mutationIndexArr = [];

    // 随机选择一条染色体让其变异
    var chromosomeIndex = random(0, crossRoomMatrixes.length-1);
    mutationIndexArr.push(mutationIndexArr);

    var roomMatrix = crossRoomMatrixes[chromosomeIndex];
    var classMatrix = crossClassMatrixes[chromosomeIndex];

    // todo: 自适应变异率计算
    var mutationRate = 0;
    var mutationNum = 10;

    // 累计变异成功的个数
    var mutationAllCnt = 0;

    // 随机遍历教学班
    var classRandArr = initRandomArray(classMatrix.length, [1, classMatrix.length]);
    for (var cIndex=0; cIndex<classRandArr.length; cIndex++) {
        if (mutationAllCnt >= mutationNum) {
            break;
        }
        var classNO = classRandArr[cIndex] - 1;
        var classObj = classes[classNO];
        var course = coursesMap[classObj.course];

        // 联排起始节次
        var timeStarts = unitTimeStart[course.onceHour];

        // 查找该教学班的排课
        var timeObjMap = collectTimesMap(classMatrix, classNO);

        for (var dayIndex in timeObjMap) {
            var timeObjArr = timeObjMap[dayIndex];

            var roomNO = parseInt(dayIndex.substr(0, 5));
            var dayNO = parseInt(dayIndex.substr(5, 1));
            var timeNO = timeObjMap[dayIndex][0].timeNO;

            // 随机获取目标位置
            var timeUnitDst = getRandDstTimes(roomMatrix, timeStarts, classNO);
            var roomNODst = timeUnitDst.classRoomNO;
            var dayNODst = timeUnitDst.dayNO;
            var timeNODst = timeUnitDst.timeNO;
            var classNODst = timeUnitDst.classNO;

            // 收集目标位置资源
            var timeObjArrDst = collectDstTimes(roomMatrix, classMatrix,
                timeObjArr, roomNODst, dayNODst, timeNODst, classNODst);

            // 课时相同才交换
            if (timeObjArrDst.length == timeObjArr.length) {

                // 先将该排课信息置空以便冲突检测
                resetOnceTimes(roomMatrix, classMatrix, classNO, roomNO, dayNO);
                resetOnceTimes(roomMatrix, classMatrix, classNODst, roomNODst, dayNODst);

                // 满足冲突检测则交换
                if (checkConflict(roomMatrix, classMatrix, roomNODst, dayNODst, timeNODst, classNO)
                    && checkConflict(roomMatrix, classMatrix, roomNO, dayNO, timeNO, classNODst))
                {
                    commitExchOnceTimes(roomMatrix, classMatrix, timeObjArr, timeObjArrDst, classNO, classNODst);
                    log("变异成功+1，累计成功：" + (++mutationAllCnt));
                    continue;
                } else {
                    // 还原
                    commitExchOnceTimes(roomMatrix, classMatrix, timeObjArr, timeObjArrDst, classNODst, classNO);
                }
            }
        }
    }

    return mutationIndexArr;
}

/**
 * 渲染视图
 * @param resultData
 */
function draw() {
// 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'));

    // 指定图表的配置项和数据
    var option = {
        title: {
            text: '基于遗传算法的自动排课'
        },
        tooltip : {
            trigger: 'axis',
            showDelay : 0,
            axisPointer:{
                show: true,
                type : 'cross',
                lineStyle: {
                    type : 'dashed',
                    width : 1
                }
            },
            zlevel: 1
        },
        legend: {
            data:['遗传算法']
        },
        toolbox: {
            show : true,
            feature : {
                mark : {show: true},
                dataZoom : {show: true},
                dataView : {show: true, readOnly: false},
                restore : {show: true},
                saveAsImage : {show: true}
            }
        },
        xAxis : [
            {
                type : 'value',
                scale:true,
                name: '迭代次数'
            }
        ],
        yAxis : [
            {
                type : 'value',
                scale:true,
                name: '适应度'
            }
        ],
        series : [
            {
                name:'遗传算法',
                type:'scatter',
                large: true,
                symbolSize: 3,
                data: (function () {
                    var d = [];
                    for (var itIndex=0; itIndex<iteratorNum; itIndex++) {
                        for (var chromosomeIndex=0; chromosomeIndex<chromosomeNum; chromosomeIndex++) {
                            d.push([itIndex, parseInt(logGenData[itIndex][chromosomeIndex])]);
                        }
                    }
                    return d;
                })()
            }
        ]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);

    // 绘制迭代数据表
    drawIterTable();
}

var iterSel = {iterIndex:0, chromosomeIndex:0};
function drawIterTable() {
    var tableData = [];
    for (var itIndex=0; itIndex<iteratorNum; itIndex++) {
        var rowData = {iterNO: itIndex+1};
        for (var chromosomeIndex=0; chromosomeIndex<chromosomeNum; chromosomeIndex++) {
            rowData[(chromosomeIndex+1).toString()] = parseInt(logGenData[itIndex][chromosomeIndex]);
        }
        tableData.push(rowData);
    }
    var colNames = ["迭代次数"];
    var colModel = [{name:'iterNO',index:'iterNO'}];
    for (var chromosomeIndex=0; chromosomeIndex<chromosomeNum; chromosomeIndex++) {
        colNames[chromosomeIndex+1] = "染"+(chromosomeIndex+1);
        colModel.push({
            name: (chromosomeIndex+1).toString(),
            index: (chromosomeIndex+1).toString()
        });
    }

    $("#iterTable").jqGrid({
        data: tableData,//当 datatype 为"local" 时需填写
        datatype: "local", //数据来源，本地数据（local，json,jsonp,xml等）
        height: 250,//高度，表格高度。可为数值、百分比或'auto'
        colNames: colNames,
        colModel : colModel,
        viewrecords: true,//是否在浏览导航栏显示记录总数
        rowNum: 20,//每页显示记录数
        rowList: [10, 20, 30],//用于改变显示行数的下拉列表框的元素数组。
        pager: "#iterNav",//分页、按钮所在的浏览导航栏
        altRows: true,//设置为交替行表格,默认为false
        //toppager: true,//是否在上面显示浏览导航栏
        //multiselect: true,//是否多选
        //multikey: "ctrlKey",//是否只能用Ctrl按键多选
        //multiboxonly: true,//是否只能点击复选框多选
        //subGrid : true,
        //sortname:'id',//默认的排序列名
        //sortorder:'asc',//默认的排序方式（asc升序，desc降序）
        caption: "迭代数据一览",//表名
        autowidth: true, //自动宽
        cellEdit: true,
        onSelectRow: function(id){
        },
        onCellSelect: function (rowid, iCol, cellcontent, e) {
            iterSel.iterIndex = rowid - 1;
            iterSel.chromosomeIndex = iCol -1;
            console.log(rowid + "," + iCol + "," + cellcontent);

            drawClassRoomTable(iterSel.iterIndex, iterSel.chromosomeIndex);
            drawClassTable(iterSel.iterIndex, iterSel.chromosomeIndex);
        }
    });

    drawClassRoomTable(iterSel.iterIndex, iterSel.chromosomeIndex);
    drawClassTable(iterSel.iterIndex, iterSel.chromosomeIndex);
}

$("#classRoomSel").change(function () {
    drawClassRoomTable(iterSel.iterIndex, iterSel.chromosomeIndex);
});
$("#classSel").change(function () {
    drawClassTable(iterSel.iterIndex, iterSel.chromosomeIndex);
});

function drawClassRoomTable(iterIntex, chromosomeIndex) {
    var classRoomIndex = $("#classRoomSel").val();
    var room = classRooms[classRoomIndex];
    var build = buildingsMap[room.building];
    var caption = "教室课表 " + room.id + ":" + room.roomNO + "/" + room.capacity + "/" + room.roomType + "/" + build.zone;

    var roomData = [];

    for (var t=0; t<times.length; t++) {
        var row = {secNO: t+1};
        for (var d=0; d<days.length; d++) {
            var classNO = chromosomeMatrix[chromosomeIndex][classRoomIndex][d][t];
            if (classNO > -1) {
                row[d+1] = classes[classNO].id + ":" + coursesMap[classes[classNO].course].name;
            } else {
                row[d+1] = "";
            }
        }
        roomData.push(row);
    }

    $("#classRoomTable").jqGrid("clearGridData");
    $("#classRoomTable").jqGrid("setCaption", caption);
    $("#classRoomTable").jqGrid('setGridParam', {
        data: roomData,//当 datatype 为"local" 时需填写
        datatype: "local", //数据来源，本地数据（local，json,jsonp,xml等）
        page:1
    }).trigger("reloadGrid");
}

function drawClassTable(iterIntex, chromosomeIndex) {
    var classIndex = $("#classSel").val();
    var classObj = classes[classIndex];
    var course = coursesMap[classObj.course];
    var teacher = teachersMap[classObj.teacher];
    var caption = "教学班课表 " + classObj.id + ":" + course.name + "/" + teacher.name + "/" + classObj.studentNum;

    var classData = [];

    var timeObjArr = [];
    var classTimesArr = classMatrixes[chromosomeIndex][classIndex];
    classTimesArr.forEach(function (timeStr, index) {
        timeObjArr.push(decodeTimeCode(timeStr));
    });

    for (var t=0; t<times.length; t++) {
        var row = {secNO: t+1};
        for (var d=0; d<days.length; d++) {
            var timeObj = timeObjArr.filter(function (obj) {
                return (obj.timeNO == t) && (obj.dayNO == d);
            });
            if (timeObj && timeObj.length > 0) {
                var room = classRooms[timeObj[0].classRoomNO];
                var build = buildingsMap[room.building];
                row[d+1] = room.id + ":" + room.roomNO + "/" + room.capacity + "/" + room.roomType + "/" + build.zone;
            } else {
                row[d+1] = "";
            }
        }
        classData.push(row);
    }

    $("#classTable").jqGrid("clearGridData");
    $("#classTable").jqGrid("setCaption", caption);
    $("#classTable").jqGrid('setGridParam', {
        data: classData,//当 datatype 为"local" 时需填写
        datatype: "local", //数据来源，本地数据（local，json,jsonp,xml等）
        page:1
    }).trigger("reloadGrid");
}

function initSelectText() {
    for (var c=0; c<classRooms.length; c++) {
        $("#classRoomSel").append("<option value=" + c + ">" + classRooms[c].id + "</option>");
    }
    var roomData = [];
    for (var t=0; t<times.length; t++) {
        var row = {secNO: t+1};
        for (var d=0; d<days.length; d++) {
            row[d+1] = "";
        }
        roomData.push(row);
    }
    var colNames = ["节次"];
    var colModel = [{name:'secNO',index:'secNO'}];
    for (var d=0; d<days.length; d++) {
        colNames[d+1] = "星期"+(d+1);
        colModel.push({
            name: (d+1).toString(),
            index: (d+1).toString()
        });
    }
    $("#classRoomTable").jqGrid({
        data: roomData,//当 datatype 为"local" 时需填写
        datatype: "local", //数据来源，本地数据（local，json,jsonp,xml等）
        height: 300,//高度，表格高度。可为数值、百分比或'auto'
        colNames: colNames,
        colModel: colModel,
        viewrecords: true,//是否在浏览导航栏显示记录总数
        rowNum: 20,//每页显示记录数
        rowList: [10, 20, 30],//用于改变显示行数的下拉列表框的元素数组。
        pager: "#classRoomNav",//分页、按钮所在的浏览导航栏
        altRows: true,//设置为交替行表格,默认为false
        //toppager: true,//是否在上面显示浏览导航栏
        //multiselect: true,//是否多选
        //multikey: "ctrlKey",//是否只能用Ctrl按键多选
        //multiboxonly: true,//是否只能点击复选框多选
        //subGrid : true,
        //sortname:'id',//默认的排序列名
        //sortorder:'asc',//默认的排序方式（asc升序，desc降序）
        caption: "教室课表",//表名
        autowidth: true//自动宽
    });


    for (var d=0; d<classes.length; d++) {
        $("#classSel").append("<option value=" + d + ">" + classes[d].id + "</option>");
    }
    var classData = [];
    for (var t=0; t<times.length; t++) {
        var row = {secNO: t+1};
        for (var d=0; d<days.length; d++) {
            row[d+1] = "";
        }
        classData.push(row);
    }
    $("#classTable").jqGrid({
        data: classData,//当 datatype 为"local" 时需填写
        datatype: "local", //数据来源，本地数据（local，json,jsonp,xml等）
        height: 300,//高度，表格高度。可为数值、百分比或'auto'
        colNames: colNames,
        colModel: colModel,
        viewrecords: true,//是否在浏览导航栏显示记录总数
        rowNum: 20,//每页显示记录数
        rowList: [10, 20, 30],//用于改变显示行数的下拉列表框的元素数组。
        pager: "#classNav",//分页、按钮所在的浏览导航栏
        altRows: true,//设置为交替行表格,默认为false
        //toppager: true,//是否在上面显示浏览导航栏
        //multiselect: true,//是否多选
        //multikey: "ctrlKey",//是否只能用Ctrl按键多选
        //multiboxonly: true,//是否只能点击复选框多选
        //subGrid : true,
        //sortname:'id',//默认的排序列名
        //sortorder:'asc',//默认的排序方式（asc升序，desc降序）
        caption: "教学班课表",//表名
        autowidth: true//自动宽
    });
}

window.onload = function () {
    initSelectText();
};
