// 遗传算法的另一实现 by lz 与原算法主要区别 不计算强制约束
/*
时空索引：
    时间(day,time)，空间(room) 他们以确定的关系组成一个唯一的正整数（详见common1.js IndexUtil类）,
    相同的时空索引意味着占据了相同时间的相同教室,根据时空索引我们可以非常方便(详见IndexUtil，简单的加减乘除取余计算)
    的获得对应索引的 day time room在数组中的索引值,从而避免了复杂的数组嵌套
静态约束:
    一门课的教室类型、校区、老师、人数、时间需求等在排课之前就已经确定的条件,详见 fixedCondition
排课单元：
    在时间上互相有约束关系的一组课程，例如同一个老师的多门课程，同一个培养方案中的多门课程，同一门课在一周内的不同课时
动态时间约束：
    排课单元内的课程安排是动态的，他们之间的约束关系也需要动态的检查，在初始化基因组、交叉、变异时都必须考虑动态约束
    详见 common1.js-Conflict类 和其实例conflict变量的使用
交叉：
    详见 cross()函数
变异：
    详见 vary()函数

*/
// TODO 多节联排时应把联排的下一节课填满 ,也可以把联排数量不同的课程分段进行 先排4节-3节-2节这样
/*
TODO 迭代结束后可以做一些转换，例如把同一门课换到同一个教室里
比如 A课程在 教室1-教室10的权重是相同的，那么他的多节课会被随机地分配到这10个教室
在迭代过程中进行校验和交换是没有意义的，因为他不影响适应度，在交叉变异时又会趋向于分散，类似熵的增加



*/
/** 算法参数 */
const CONFIG = {
    /** 染色体数量 */
    chromosomeNum : 20,
    /** 迭代次数 */
    iteratorNum : 200,
    /** 不参加交叉直接保留给下一代的最好基因 应该小于crossRate 在小数据量下测试0.15是最佳选择 */ 
    survivalRate : 0.15,
    /** 有权繁殖下一代的比例 按照适应度排序  取值(0,1) 取值过大难以淘汰劣势基因，取值过小容易过早陷入局部最优解 */ 
    crossRate : 0.5, 
    /** 变异比例  取值[0,1) 不宜太大,较大会减少优势基因,并且影响运行效率 */
    varyRate : 0.05,
    // /** 发生冲突时 重试的次数 在减少冲突和保证效率间找到平衡 */
    // conflictRetry : 100,

    // 以下为适应度参数
    /** 初始的适应度值 一个不太大的正整数 */
    initAdaptValue : 30, 
    /** 一个绝对值较大的负数,代表完全不可用的适应度 */
    unable : -10000, 
    /** 差选择：生成基因过程中产生的冲突数量，每个冲突是一个“差选择”，每个差选择扣除一定的适应度值  */
    badSelectVal : 15
}

// start 变量定义
/** 一天的课时 */
const TIMES = 12;
/** 一周上课日 规定 0-6为周一-周日 */
const DAYS = 7;
/**
 * 不可用时段
 * 例如{ 0:[1,2],4:[4,7] } 代表不可用时间段为周1 1,2节课 周5 4,7节课 
 */
const unableDayTime = {};
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

/** 
 * 课程教学班
 * 原名 classes 改为 lessons不会引起歧义
 * 以后还要加入 班级约束 
 */ 
var lessonClasses = [
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
/** 课程教学班 每一个连续开设的课程都是一个lesson 包括一个教学班一周内的多次开课 */
var lessons = [];

/** 教师  disableTime-不可排课的时间段（302-周三的第3/4课时*/
var teachers = [
    {id:20001, name:'教师1', disableTime: null},
    {id:20002, name:'教师2', disableTime: {day:[2,4], time:[1,2,3,4]}},
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

/** 任务处理适应度结果集([迭代次数][染色体编号] = 适应度) */
var logGenData = [];

/**
 * 结果集 即 染色体合集 即 种群. 
 * 例如 8门课 排2天*8段*2教室=32个时空位置 则每个染色体的长度为8 按课程数组的顺序排列 每门课的的时空位置在0-31中取值，不可重复. 
形如：
[
    [1,3,2,20,15,13,6,7], // chromosomeSet 中存的是 Chromosome 对象 其中包含了这个基因序列
    [32,3,2,12,1,5,4,7],
    ...
]
 */
var chromosomeSet;

/** 适应度矩阵(下标：染色体编号、值：该染色体的适应度) 
 * 下表为课程编号，内部数组为该课程对于每个时空编号的适应度
 * 例如 8门课 排2天*8段*2教室=32个时空位置 则每个染色体的长度为8 按课程数组的顺序排列 每个内部数组长度为32 
形如：
[
    [1,1,1,1,2,3,4,5....,0,12,344,12],  //长度为32 classes[0]
    [32,1,1,11,2,3,4,5....,0,12,344,12], //长度为32 classes[1]
    ... 一共8个数组
]
*/
var adaptability;
// end 变量定义

const indexUtil = new IndexUtil(DAYS,TIMES);indexUtil.hh
const logger = new Logger(Logger.LEVEL.INFO);
const conflict = new Conflict();
// 算法入口
function gaMain(){
    chromosomeSet = [];
    adaptability = [];
    logGenData = [];
    var timer = new Timer();
    // 初始化map缓存
    initCaches();
    logger.info("初始化map完成\tcost:",timer.get());
    // 初始化课程 包括动态冲突关联
    initLessons();
    logger.info("初始化课程完成\tcost:",timer.get());
    // 初始化适应度
    initAdapt();
    logger.info("初始化适应度完成\tcost:",timer.get());
    initChromosome();
    logger.info("初始化基因完成\tcost:",timer.get());
    gaIterate(CONFIG.iteratorNum);
    logger.info("迭代完成\t\t\tcost:",timer.get());
}
/**
 * 父母基因交叉获得下一代染色体
 * @param {*} father Chromosome对象
 * @param {*} mother Chromosome对象
 */
function cross(fatherGene,motherGene){
    /*
    交叉时 有一个棘手的问题
    例如
    父基因 [1,2,9,4,7,6,8,5]
    母基因 [1,3,2,4,5,6,7,8]
    子基因随机从两边获取
    子基因 [1,2,2,4,7,6,7,8]
    则获得了不可用的基因序列 因为(时间*教室)的序号重复了 即 选择了同一时间的同一教室 得到了冲突的解
    因此我们引入一个“相关基因”的概念：
    在上述例子中
    父母基因存在两对相关基因 2,9--3,2 7,8,5--5,7,8 相关基因必须当做一个基因做整体的调整
    对应数组中的索引位置为 (2,3) (4,6,8)
    上述父母基因可以表示为关联基因的形式,数组中存储的是下标
    relatedGene = [[0],[1,2],[3],[4,6,8],[5]] 相关基因作为一个数组当做一个单独的基因进行选择

    */
    var childGene = [];// 以父基因为基础添加母基因来实现交叉
    var set = new Set(); // 用于保存已经关联的基因
    var relatedGenes = []; //关联基因的索引
    // 遍历寻找关联基因
    for (let i = 0; i < fatherGene.length; i++) {
        if(set.has(i))
            continue;
        let gene = motherGene[i];
        let point = fatherGene.indexOf(gene);
        let related = [i];
        // 当父基因组中存相同的基因且不是初始索引位置
        // 关联基因寻找完成的标志为：
        // 1 形成闭环  例如 [1,2,3] 和 [2,3,1]
        // 2 不再存在相同的基因  例如 [1,2,3] 和 [2,3,5]
        while (point >=0 && point!=i) { 
            gene = motherGene[point];
            set.add(point);
            related.push(point);
            point = fatherGene.indexOf(gene);
        }
        relatedGenes.push(related);
    }
    for (let i = 0; i < relatedGenes.length; i++) {
        let releted = relatedGenes[i];
        let fromFather = Math.random()<0.5?true:false;

        for (let j = 0; j < releted.length; j++) {
            let index = releted[j];
            childGene[index] = fromFather? fatherGene[index]: motherGene[index];
        }
    }
    // 检查子代基因的动态冲突并计数
    let badSelect = 0;
    for (let i = 0; i < childGene.length; i++) {
        // let adapt = adaptability[i];
        let check= conflict.relatedDayTime(i,childGene);
        if(check.has(indexUtil.getDayTime(childGene[i]))){
            badSelect ++;
        }
    }
    
    return {childGene,badSelect};
}
/**
 * 变异
 * @param {number[]} geneOrder 基因序列
 */
function vary(geneOrder){
    for (let i = 0; i < geneOrder.length; i++) {
        if(Math.random()<CONFIG.varyRate){
            let adapt = adaptability[i];
            let conflictSet = conflict.relatedDayTime(i,geneOrder);
            let result = roll(adapt,geneOrder,dayTimeRoom => conflictSet.has(indexUtil.getDayTime(dayTimeRoom)));
            if (result.index>=0 && !result.bad){
                geneOrder[i] = result.index;
            }
        }
    }
}
/**
 * 遗传迭代
 * @param {number} num 迭代的次数
 */
function gaIterate(num){
    var timer = new Timer()
    logger.info("---开始迭代---");
    for (let i = 0; i < num; i++) {
        logger.info("---第"+i+"代\tcost:",timer.get(),"---");
        let nextGen = []; // 下一代染色体集合
        chromosomeSet.sort((a,b) => b.adapt-a.adapt); //染色体根据适应度由大到小排序
        logGenData.push(chromosomeSet.map(chromosome => chromosome.adapt));

        //保留最好的基因直接传给下一代
        var survivalCount = chromosomeSet.length *CONFIG.survivalRate;
        for (let i = 0; i < survivalCount && nextGen.length < CONFIG.chromosomeNum; i++) {
            nextGen.push(chromosomeSet[i])
        }
        // 有权参与交叉的基因数量
        var crossCount = (chromosomeSet.length-1)*CONFIG.crossRate; // randomInt函数是包括末尾的 所以 length-1
        // survival==1会导致程序死循环 虽然一般不会这么设置这么小的值
        if (crossCount<=1)
            throw "PARAM.crossRate 的值过小 没有足够的父代够供交叉配对"
        while(nextGen.length < CONFIG.chromosomeNum ){
            let fatherIndex = randomInt(0,crossCount);
            let motherIndex = randomInt(0,crossCount);
            if (fatherIndex == motherIndex){ // 不可自交
                continue;
            }
            let father = chromosomeSet[fatherIndex];
            let mother = chromosomeSet[motherIndex];
            let badSelect = 0;
            let result = cross(father.geneOrder,mother.geneOrder);
            badSelect+=result.badSelect;
            // 变异
            vary(result.childGene);
            nextGen.push(new Chromosome(result.childGene,badSelect))
        }
        chromosomeSet = nextGen;
    }
}
function initLessons(){
    lessons = [];
    // TODO 动态时间冲突检测如果多起来，可写成类似静态条件的工厂方法
    /** 教师冲突 */
    let teacherConflict = {};
    lessonClasses.forEach(function(lesson, index) {
        let course = coursesMap[lesson.course];
        let timesPerWeek = course.weekHour/course.onceHour;
        let conflictArr = []; // 同一课程的不同课时不能在同一时间 需要检查冲突
        for (let i = 0; i < timesPerWeek; i++) {
            lessons.push(lesson);
            if (!teacherConflict[lesson.teacher]){
                teacherConflict[lesson.teacher] = [];
            }
            teacherConflict[lesson.teacher].push(lessons.length-1);
            conflictArr.push(lessons.length-1);
        }
        conflict.add(conflictArr,Conflict.Scope.day,"同门课程"+lesson.id);// 同门课程不会安排在同一天
    });
    for (const key in teacherConflict) {
        const conflictArr = teacherConflict[key];
        conflict.add(conflictArr ,Conflict.Scope.time,"教师"+key);
        //TODO 老师的校区冲突 不能在同一个半天在不同校区开课
        // const campusConflict = {};
        // conflictArr.forEach(lessonIndex =>{
        //     let lesson = lessons[lessonIndex];
        //     if (!campusConflict[lesson.zone]){
        //         campusConflict[lesson.zone] = [];
        //     }
        //     campusConflict [lesson.zone].push(lessonIndex);
        // });
        // for (const campus in campusConflict) {
        //     conflict.add(campusConflict[campus] ,Conflict.Scope.halfDay,"教师"+key+" 校区"+campus);
        // }
        
    }
}
function initCaches() {
    courses.forEach(function(course, index) {
        coursesMap[course.id] = course;
    });
    teachers.forEach(function (teacher, index) {
        teachersMap[teacher.id] = teacher;
    });
    buildings.forEach(function(building, index) {
        buildingsMap[building.id] = building;
    });
    classRooms.forEach(function(classroom, index) {
        classroomsMap[classroom.id] = classroom;
        
    });
}
/**
 * 初始化染色体
 */
function initChromosome (){
    var timer = new Timer();
    for (let i = 0; i < CONFIG.chromosomeNum; i++) {
        chromosomeSet.push(generateChromosome());
        logger.info("初始化基因",i,timer.get())
    }
}
/**
 * 随机生成一组染色体 轮盘赌
 */
function generateChromosome(){

    var result = [];
    // 从所有课程中随机取值 而不是从第一个开始 避免每次都是排在数组最开始位置的课程有最优先的选择，使种群的基因更丰富
    var randomIndex = new RandomIndex(adaptability.length); 
    var lessonIndex;
    var badSelect = 0;
    while((lessonIndex=randomIndex.next())>=0){
        let adapt = adaptability[lessonIndex]
        let conflictSet = conflict.relatedDayTime(lessonIndex,result);
        let solution =  roll(adapt,result,roomTime => conflictSet.has(indexUtil.getDayTime(roomTime)));
        if (solution.bad)
            badSelect ++;
        let dayTimeRoom = solution.index;
        result[lessonIndex] = dayTimeRoom;
    }
    var chromosome = new Chromosome(result,badSelect);

    return chromosome;
}

/**
 * 根据约束条件初始化适应度
 */
function initAdapt(){
    adaptability = [];
    for (let i = 0; i < lessons.length; i++) {
        adaptability[i] = []; 
        for (let d = 0; d < DAYS; d++) {
            for (let t = 0; t < TIMES; t++) {
                for (let r = 0; r < classRooms.length; r++) {
                    // 判断不可用时段
                    if (unableDayTime[d] && unableDayTime[d].includes(t)){
                        adaptability[i][index] = 0;
                        continue;
                    }
                    var index = indexUtil.getIndex(d,t,r); 
                    adaptability[i][index] = adapt(i,d,t,r);
                }
            }
        }
    }
}
// start 适应度条件
/**
 * 根据condition数组中的所有条件来改变适应度的值
 * @param {number} lessonIndex 课程数组中的下标
 * @param {number} day 排课周期中的第几天 
 * @param {number} time 一天的第几个课时
 * @param {number} roomIndex 教室数组中的下标
 */
function adapt(lessonIndex,day,time,roomIndex){
    // lesson {id:30101, course:10001, teacher:20001, studentNum:28, zone:Zone.SP}
    // course {id:10001, name:'高等数学', weekHour:4, totalHour:34, roomType:RoomType.NORMAL, onceHour:2, timeRequire:null},
    var lesson = lessons[lessonIndex];
    var value = CONFIG.initAdaptValue;

    for (let i = 0; i < fixedCondition.length; i++) {
        if (value == 0) // 不可用时段
            continue;
        const conditionFunction = fixedCondition[i];
        value +=conditionFunction(lesson,day,time,roomIndex,value)
        if( value<0 ) {
            value = 0;
        }
    }
    return value;
}

/*
 * 满足的约束（冲突）  
 * 该如何解决这些问题？
 * 
 * √ 同一时间片一个教师只能上一门课程
 * √ 某一教室的某一时间片只能被一门课程占用
 * √ 某班学生在某一时间片只能被安排在一个教室上课
 * √ 某课程m必须安排在预定的时间片n上
 * √ 某教师m在时间片n时不能上课
 * √ 课程对教室的要求 
 * √ 同一课程的一次课分配在同一时段（上午/下午/晚上）
 * √ 较高的教室利用率（上课人数
 * √ 晚上/周二下午/周六尽量不排课 （这个应该是动态设置的）
 * 一周内同一门课程均匀分布
 * 同一教学班任务不要在同一天内连续的开课
 * 老师不能在同一个半天上跨校区课
*/
//TODO 适应度参数调整是算法的关键
/**
 * 此处为固定条件 动态条件需要每次迭代修改适应度 
 * 例如 课程的时间教室类型选择属于固定条件
 * 老师或学生的时间冲突属于动态条件
 * 
 */
var fixedCondition = [
    // 注意适用性越普遍的条件放在数组的越前方 可增加效率
    // 单节时间需求
    function(lesson,day,time,roomIndex,value){
        /** 联排不可用的时间段 2-两节联排 3-三节联排 4-四节联排 从0开始 */
        var unitUnableTime = {
            1: [],
            2: [1,3,5,7,9,11],
            3: [2,3,6,7,8,9,10,11],       
            4: [1,2,3,5,6,7,8,9,10,11]
        };
        // lesson {id:30101, course:10001, teacher:20001, studentNum:28, zone:Zone.SP}
        // {id:10001, name:'游戏设计', weekHour:4, totalHour:34, roomType:RoomType.NORMAL, onceHour:2, timeRequire:null}
        var course = coursesMap[lesson.course];
        var unable = unitUnableTime[course.onceHour];
        if(unable.includes(time)){
            return CONFIG.unable;
        }
        return 0;
    },
    // 公共不可用时间 此例中为周日不排课 晚上/周二下午/周六尽量不排课 早上排课更优先
    function (lesson, day, time, roomIndex, value) {
        if (day == 6) { // 周日不排课
            return CONFIG.unable;
        }
        let val = 0;
        if (day == 5){
            val += -5;
        }
        if (time >= 8 || (day == 1 && time >= 4)) { // 晚上/周6/周二下午尽量不排课 因此降低优先级
            val += -10;
        }
        if (time < 4) { // 早上更优先
            val += 4;
        }
        if (time < 6) { // 下午前两节优先
            val += 1;
        }
        return val;
    },
    // 课程时间需求 course timeRequire
    function(lesson,day,time,roomIndex,value){
        // timeRequire:{day:[2,4], time:[1,2,3,4]}
        // timeRequire:{day:null, time:[1,2,3,4]}
        // timeRequire:{day:[1,3], time:[1,2,3,4]}
        var timeRequire = coursesMap[lesson.course].timeRequire;
        if (timeRequire){
            if (timeRequire.day &&timeRequire.time ){
                if(timeRequire.day.includes(day)     && timeRequire.time.includes(time)){
                    logger.debug('满足课程 day time:',timeRequire.day,timeRequire.time);
                    return 10;
                }
            }else if(timeRequire.day){
                if(timeRequire.day.includes(day)){
                    logger.debug('满足课程 day:',timeRequire.time);
                    return 5;
                }
            }else if(timeRequire.time){
                if(timeRequire.time.includes(time)){
                    logger.debug('满足课程 time:',timeRequire.time);
                    return 5;
                }
            }else{
                logger.debug('不满足课程 timeRequire:',timeRequire.time);
                return CONFIG.unable;
            }
        }
        return 0;
    },
    // 教室类型
    function(lesson,day,time,roomIndex,value){
        var course = coursesMap[lesson.course];
        var room = classRooms[roomIndex];
        if(buildingsMap[room.building].zone != lesson.zone){
            logger.debug('不满足校区要求 lesson:',lesson.id);
            return CONFIG.unable;
        }
        if(course.roomType != room.roomType){
            logger.debug('不满足教室类型 lesson:',lesson.id,'roomtype',room.roomType);
            return CONFIG.unable;
        }
        var ratio = lesson.studentNum/room.capacity;
        if (ratio > 1) {
            logger.debug('教室容量不足 lesson:',lesson.id,'studentNum',lesson.studentNum,'capacity',room.capacity);
            return CONFIG.unable;
        }
        if (ratio > 0.8) {
            return 5;
        }
        if (ratio < 0.5) {
            return -5;
        }
        
        return 0;
    }
];
// end 适应度条件


