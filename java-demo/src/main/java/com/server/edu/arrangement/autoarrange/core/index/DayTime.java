package com.server.edu.arrangement.autoarrange.core.index;


public class DayTime {

    private int value;
    public DayTime(int day, int time){
//        this.value = param.getTimes() * (day-1)+time-1;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof DayTime) {
            return value == ((DayTime)obj).value;
        }else  {
            return false;
        }
    }

    @Override
    public int hashCode() {
        return value;
    }
}
