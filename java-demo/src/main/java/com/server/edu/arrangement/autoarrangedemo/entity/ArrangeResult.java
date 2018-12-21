package com.server.edu.arrangement.autoarrangedemo.entity;

import com.server.edu.arrangement.autoarrangedemo.util.ArrangeDayTime;
import lombok.Data;

import java.util.Map;

@Data
public class ArrangeResult {
    long teachingClassId;
    /**  排课时间 和对应的 classroomId */
    Map<ArrangeDayTime,Long> timeRoomMap;
}
