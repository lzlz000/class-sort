package com.server.edu.arrangement.autoarrange;

import com.server.edu.arrangement.autoarrange.core.params.Parameter;
import com.server.edu.arrangement.autoarrange.entity.ArrangeResult;
import com.server.edu.arrangement.autoarrange.entity.TeachingClassA;
import com.server.edu.arrangement.autoarrange.entity.ClassroomA;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.Future;
import java.util.function.Consumer;

public interface AutoArrangeEntry {

    ClassroomSetter config(Consumer<Parameter> parameter);
    ClassroomSetter defaultParam();

    interface ClassroomSetter {
        TeachingClassSetter setClassrooms(Collection<ClassroomA> classrooms);
    }

    interface TeachingClassSetter {
        Executer setTeachingClasses(Collection<TeachingClassA> teachingClasses);
    }

    interface Executer{
        Future<Map<Long,ArrangeResult>> executeAsync();

        Map<Long,ArrangeResult> execute();
    }

}

