// 7day * 12 timeframe
// courses {id:10001, name:'游戏设计', weekHour:4, totalHour:34, roomType:RoomType.NORMAL, onceHour:2, timeRequire:null},
// classroom {id:50001, roomType: RoomType.NORMAL, capacity:40, building:70001, floor:5, roomNO:502},
// teacher {id:20002, name:'教师2', disableTime: '30304'}
// Zone  {SP:0, JD:1}
// RoomType = {NORMAL:0, COMPUTER:1, PLAYGROUD:2, LAB:3, MEDIA:4}

// var Zone = {SP:0, JD:1};
// var RoomType = {NORMAL:0, COMPUTER:1, PLAYGROUD:2, LAB:3, MEDIA:4};
// courses {id:10001, name:'游戏设计', weekHour:4, totalHour:34, roomType:RoomType.NORMAL, onceHour:2, timeRequire:null}
// teacher {id:20002, name:'教师2', disableTime: '30304'}
// class {id:30101, course:10001, teacher:20001, studentNum:28, zone:Zone.SP},
var DataGenerator = function(){
    var Param = {
        campus:[0,1],
        buildings : [
            {
                roomTypeId :0,
                roomType : 'normal',
                zone:0,
                capacityNum:{ // 容量数量
                    50: 15,
                    100: 8,
                    150: 6,
                }
            },{
                roomTypeId :0,
                roomType : 'normal',
                zone:1,
                capacityNum:{ // 容量数量
                    50: 15,
                    100: 8,
                    150: 6,
                }
            },{
                roomTypeId :3,
                roomType : 'lab',
                zone: 0,
                capacityNum:{ // 容量数量
                    50: 2,
                }
            },{
                roomTypeId :3,
                roomType : 'lab',
                zone: 1,
                capacityNum:{ // 容量数量
                    50: 2,
                }
            },  
        ],
        // 排课类型
        courseType :{
            A:{
                roomType: 'normal',
                onceHour: 2,
                weekHour: 4,
                count: 50,
            },
            B:{
                roomType: 'normal',
                onceHour: 4,
                weekHour: 4,
                count: 40
            },
            C:{
                roomType: 'lab',
                onceHour: 2,
                weekHour: 4,
                count: 20
            }
        },
        // 教师人数
        teacher :{
            count: 100
        }
    }
    console.log(Param)
    // 0开始转换为 字母表示 
    var letterIndex = function(index){
        // ascii 65 A-90 Z
        var strIndex = '';
        while(index >= 0) {
            var mod = index % 26;
            strIndex = String.fromCharCode(mod+65)+ strIndex;
            index = (index-mod)/26-1;
        } ;
        return strIndex;
    }
    var randomStudentNum = function(){
        var ran = Math.random()*30;
        if(ran<15){
            return 45;
        }
        if (ran<25){
            return 85;
        }
        return 140;
    }
    // teacher {id:20002, name:'教师2', disableTime: '30304'}
    this.generateTeachers = function (){
        var count = Param.teacher.count;
        var teachers =[];
        for (let i = 0; i < count; i++) {
            teachers.push({
                id: 20000+teachers.length,
                name :'教师'+i,
                disableTime : null
            })
        }
        this.teachers = teachers;
    }
   
    this.generateLessons = function () {
        var lessons = [];
        for (const key in Param.courseType) {
            if (Param.courseType.hasOwnProperty(key)) {
                let course = Param.courseType[key];
                for (let i = 0; i < course.count; i++) {
                    // courses {id:10001, name:'游戏设计', weekHour:4, totalHour:34, roomType:RoomType.NORMAL, onceHour:2, timeRequire:null}
                    lessons.push({
                        id: 10000+lessons.length,
                        name: '课程'+letterIndex(lessons.length),
                        weekHour: course.weekHour,
                        roomType: course.roomTypeId,
                        onceHour: course.onceHour
                    });
                }
            }
        }
        this.lessons = lessons;
    }
     // class {id:30101, course:10001, teacher:20001, studentNum:28, zone:Zone.SP},
    this.generateClasses = function () {

        var lessons = this.lessons;
        var classes = [];
        for (const lesson of lessons) {
            var classCount = Math.ceil(Math.random()*3) //随机给每门课1-3个班级
            var teachers = this.teachers;
            var campus = Math.round(Math.random()); //随机 0和1
            var teacher =teachers[ Math.floor(Math.random()*teachers.length)]; // 随机取一个老师
            for(let i =0; i<classCount; i++){
                classes.push({
                    id:30000+classes.length,
                    name: '教学班'+lesson.id+'-'+i,
                    course: lesson.id,
                    teacher: teacher.id,
                    studentNum: lesson.roomType==='normal'?randomStudentNum():40, // 如果是normal 教室类型 给随机学生数量
                    zone: campus
                });
            }
        }
        this.classes = classes;
    }
    //building {id:70001, zone:Zone.SP, floors:20},
    //classroom {id:50001, roomType: RoomType.NORMAL, capacity:40, building:70001, floor:5, roomNO:502},
    this.generateBuildingAndRoom = function(){
        var buildings = [];
        var classrooms =[];
        this.buildings = buildings;
        this.classrooms = classrooms;
        var buildingsParam = Param.buildings;
        for (let i = 0; i < buildingsParam.length; i++) {
            const building = buildingsParam[i];
            var buildingId = 70000+buildings.length;
            buildings.push({
                id: buildingId,
                zone: building.zone,
                // floors 楼层暂时无用 不生成了
            })
            let capacityNum = building.capacityNum;
            for (const capacity in capacityNum)  {
                const num = capacityNum[capacity];
                for (let i = 0; i < num; i++) {
                    classrooms.push({
                        id:50000+classrooms.length,
                        roomTypes: building.roomTypeId,
                        capacity : capacity,
                        building: buildingId,
                        roomNo: 'room'+letterIndex(i)
                    })
                }
            }
        }
    }
    this.generate = function(){
        this.generateTeachers();
        this.generateLessons();
        this.generateClasses();
        this.generateBuildingAndRoom();
    }
}

function coverData(data){
    if(!(data instanceof DataGenerator))
        data = new DataGenerator();
    data.generate();
    buildings = data.buildings;
    lessonClasses = data.classes;
    classRooms = data.classrooms;
    teachers = data.teachers;
    courses = data.lessons;
}