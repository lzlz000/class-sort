package com.server.edu.arrangement.autoarrange.core.params;

import lombok.Data;

@Data
public class GAParameter {
    private int chromosomeNum;
    private int iteratorNum;
    private float survivalRate;
    private float crossRate;
    private float varyRate;
    private int initAdaptValue;
    private int unable;
    private int badSelectVal;
}
