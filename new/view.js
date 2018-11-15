// GA1.js的结果集和显示所需的结果之间的转换
/** 染色体（教室时间片）集合，对应值为教学班编号； 四维矩阵 A={ChromosomeNO, ClassRoom, Day, Time} -> ClassNO */
var chromosomeMatrix ;
/** 教学班对应的时间片/排课结果 三维矩阵 B={ChromosomeNO, Class,Times} -> roomNO+dayNO+timeNO */
var classMatrixes;

function lessonToString(lessonIndex){
    let lesson = lessons[lessonIndex];
    let course = coursesMap[lessons[lessonIndex].course];
    return course.name+"/"+lesson.id+"/"+lesson.teacher+"/"+lesson.zone+"/"+course.onceHour
}
function roomToString (roomId) {
    let room = classroomsMap[roomId];
    return room?"教室:"+room.id+" 校区:"+buildingsMap[room.building].zone+" 容量:"+ room.capacity+" 类型:"+room.roomType:"";
}