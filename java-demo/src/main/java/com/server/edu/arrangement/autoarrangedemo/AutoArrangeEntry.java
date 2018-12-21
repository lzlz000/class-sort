package com.server.edu.arrangement.autoarrangedemo;

import com.server.edu.arrangement.autoarrangedemo.entity.TeachingClassR;
import com.server.edu.arrangement.autoarrangedemo.entity.ClassroomR;
import java.util.Collection;


public interface AutoArrangeEntry {

    TeachingClassSetter addClassrooms(Collection<ClassroomR> classrooms);

    AutoArrangeEntry addTeachingClasses(Collection<TeachingClassR> teachingClasses);

    AutoArrangeConfig config();

    void Execute();

    interface AutoArrangeConfig {
        ClassroomSetter args(int days, int times, int );
        ClassroomSetter defaultConfig();
    }

    interface ClassroomSetter {
        AutoArrangeEntry setClassrooms(Collection<ClassroomR> classrooms);
    }

    interface TeachingClassSetter {
        AutoArrangeEntry setTeachingClasses(Collection<TeachingClassR> teachingClasses);
    }


}

