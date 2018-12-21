package com.server.edu.arrangement.autoarrangedemo.util;

import java.util.Set;
import java.util.function.Predicate;

/**
 * 轮盘赌
 * @author liuzheng 2018/12/20 15:14
 */
public class Roulette {

    public static int roll(double[] weights){
        double sum = 0;
        for (double weight : weights) {
            sum += weight;
        }
        double rand = Math.random() * sum;
        sum = 0;
        for (int i=0; i< weights.length; i++) {
            sum += weights[i];
            if (sum >= rand) {
                return i;
            }
        }
        return -1;
    }

    public static int roll(double[] weights, Set<Integer> skipSet, Predicate<Integer> negativeFilter){
        double sum = 0;
        int length = weights.length;
        for (int i=0; i<length; i++) {
            double weight = weights[i];
            // 当在skip数组当中 ，它的概率变为0
            if(weight <= 0 ||(skipSet != null && skipSet.contains(i))){
                continue;
            }
            if (negativeFilter != null && negativeFilter.test(i)){
                weight = weight * 0.000001;
            }
            sum += weight;
        }
        double rand = Math.random() * sum;
        sum = 0;
        for (int i = 0; i < length; i++) {
            double weight = weights[i];
            // 当在skip数组当中 ，它的概率变为0
            if(weight <= 0 ||(skipSet != null && skipSet.contains(i))){
                continue;
            }
            if (negativeFilter != null && negativeFilter.test(i)){
                weight = weight * 0.000001;
            }
            sum += weight;

            if (sum >= rand) {
                return i;
            }
        }
        return -1;

    }

    public static int roll(double[] weights, Set<Integer> skipSet){
        double sum = 0;
        int length = weights.length;
        for (int i=0; i<length; i++) {
            double weight = weights[i];
            // 当在skip数组当中 ，它的概率变为0
            if(weight <= 0 ||(skipSet != null && skipSet.contains(i))){
                continue;
            }
            sum += weight;
        }
        double rand = Math.random() * sum;
        sum = 0;
        for (int i = 0; i < length; i++) {
            double weight = weights[i];
            // 当在skip数组当中 ，它的概率变为0
            if(weight <= 0 ||(skipSet != null && skipSet.contains(i))){
                continue;
            }
            sum += weight;

            if (sum >= rand) {
                return i;
            }
        }
        return -1;

    }
}
