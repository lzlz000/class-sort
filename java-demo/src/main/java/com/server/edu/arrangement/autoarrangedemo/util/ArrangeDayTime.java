package com.server.edu.arrangement.autoarrangedemo.util;

import java.util.ArrayList;

public class ArrangeDayTime {
    private int dayOfWeek;
    private int startTimeUnit;
    private int endTimeUnit;

    public int getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(int dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public int getStartTimeUnit() {
        return startTimeUnit;
    }

    public void setStartTimeUnit(int startTimeUnit) {
        this.startTimeUnit = startTimeUnit;
    }

    public int getEndTimeUnit() {
        return endTimeUnit;
    }

    public void setEndTimeUnit(int endTimeUnit) {
        this.endTimeUnit = endTimeUnit;
    }

    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof ArrangeDayTime)) {
             return  false;
        }
        ArrangeDayTime dayTime = (ArrangeDayTime) obj;
        return this.dayOfWeek == dayTime.dayOfWeek && this.startTimeUnit == dayTime.startTimeUnit
                && this.endTimeUnit == dayTime.endTimeUnit;
    }

    @Override
    public int hashCode() {
        // dayOfWeek 的取值一般为1-7 给二进制3位， timeunit取值一般为1-12给二进制4位
        return startTimeUnit<<7 + endTimeUnit <<3+ dayOfWeek;
    }
}
