package com.server.edu.arrangement.autoarrangedemo.util;

public class DayTimeRoomIndexUtil {
    private final int DAYS;
    private final int TIMES;
    private final int ROOMS;

    public DayTimeRoomIndexUtil(int days, int times, int rooms){
        this.DAYS = days;
        this.TIMES = times;
        this.ROOMS = rooms;
    }

    public int getIndex(int day, int time , int roomIndex){
        return DAYS * TIMES  *roomIndex + TIMES * day + time;
    }



}
