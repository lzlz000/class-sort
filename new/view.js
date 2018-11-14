// GA1.js的结果集和显示所需的结果之间的转换
/** 染色体（教室时间片）集合，对应值为教学班编号； 四维矩阵 A={ChromosomeNO, ClassRoom, Day, Time} -> ClassNO */
var chromosomeMatrix ;
/** 教学班对应的时间片/排课结果 三维矩阵 B={ChromosomeNO, Class,Times} -> roomNO+dayNO+timeNO */
var classMatrixes;

function buildMatrix(){
    chromosomeMatrix = [];
    classMatrixes = [];
    for (let i = 0; i < chromosomeSet.length; i++) {
        const chromosome = chromosomeSet[i];
        chromosomeMatrix[i] = [];
        // 初始化
        for (let r = 0; r < classRooms.length; r++) {
            chromosomeMatrix[i][r]=[];
            for (let d = 0; d < DAYS; d++) {
                chromosomeMatrix[i][r][d]=[];
                for (let t = 0; t < TIMES; t++) {
                    chromosomeMatrix[i][r][d][t]=-1;
                }
            }
            
        }
        let gene = chromosome.geneOrder;
        for (let lessonIndex = 0; lessonIndex < gene.length; lessonIndex++) {
            let pos = indexUtil.getPosition(gene[lessonIndex]);
            chromosomeMatrix[i][pos.room][pos.day][pos.time]=lessonIndex;
        }
    }
}