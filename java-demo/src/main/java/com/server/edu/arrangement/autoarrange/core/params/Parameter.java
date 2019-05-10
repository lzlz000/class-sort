package com.server.edu.arrangement.autoarrange.core.params;

import com.server.edu.arrangement.autoarrange.entity.ClassroomA;
import com.server.edu.arrangement.autoarrange.entity.TeachingClassA;
import lombok.Data;

import java.util.Map;

@Data
public class Parameter {
    int days;

    int times;

    /** 不可用的时段 */
    Map<Integer,Integer> diableDayTimeMap;
    /** 不可用天*/
    int[] disableDay;

    /** 不可用时段*/
    int[] disableTime;

    /** 消极的时段 （迫不得已才使用） */
    Map<Integer,Integer> passiveDayTimeMap;

    /** 消极用天 （迫不得已才使用）*/
    int[] passiveDay;

    /** 消极时段*/
    int[] passiveTime;

    /** 偏好的时段 */
    Map<Integer,Integer> preferDayTimeMap;

    /** 偏好天*/
    int[] preferDay;

    /** 偏好时段*/
    int[] preferTime;

    ClassroomA[] classrooms;

    TeachingClassA[] teachingClasses;

    Map<Integer, Integer[]> onceHourStarTimeMap;

    GAParameter ga;

}
