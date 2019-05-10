package com.server.edu.arrangement.autoarrange.entity;

import lombok.Data;

import java.util.Map;

@Data
public class TeachingClassA {
    long id;
    int stdNumber;
    String campus;
    String roomType;
    int weekHours;
    int onceHours;
    ArrangeDayTime dayTime;
    Map<Integer,Integer> preferTime;
    Map<Integer,Integer> disableTime;
}
