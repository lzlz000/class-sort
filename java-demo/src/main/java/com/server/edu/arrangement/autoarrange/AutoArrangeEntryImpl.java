package com.server.edu.arrangement.autoarrange;

import com.server.edu.arrangement.autoarrange.core.params.Parameter;
import com.server.edu.arrangement.autoarrange.entity.ArrangeResult;
import com.server.edu.arrangement.autoarrange.entity.ClassroomA;
import com.server.edu.arrangement.autoarrange.entity.TeachingClassA;
import org.springframework.core.io.ClassPathResource;
import org.yaml.snakeyaml.Yaml;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.FutureTask;
import java.util.concurrent.Future;
import java.util.function.Consumer;


public class AutoArrangeEntryImpl implements AutoArrangeEntry{
    private final Parameter config;
    private final ExecutorService threadPool;

    public AutoArrangeEntryImpl() throws IOException {
        ClassPathResource resource = new ClassPathResource("autoarrange.yaml");
        InputStream inputStream = resource.getInputStream();
        Yaml yaml = new Yaml();
        config = yaml.loadAs(inputStream,Parameter.class);
        // TODO 从yaml获取paramter
        threadPool = Executors.newCachedThreadPool();
    }
    @Override
    public ClassroomSetter config(Consumer<Parameter> parameterConsumer) {
        parameterConsumer.accept(config);
        return new ClassroomSetter(config);
    }

    @Override
    public ClassroomSetter defaultParam() {
        return new ClassroomSetter(config);
    }

    private class ClassroomSetter implements AutoArrangeEntry.ClassroomSetter{
        private Parameter parameter;

        private ClassroomSetter(Parameter parameter){
            this.parameter = parameter;
        }

        @Override
        public TeachingClassSetter setClassrooms(Collection<ClassroomA> classrooms) {
            ClassroomA [] classroomArr;
            classroomArr = new ClassroomA[classrooms.size()];
            classrooms.toArray(classroomArr);
            parameter.setClassrooms(classroomArr);
            return new TeachingClassSetter(parameter);
        }
    }

    private class TeachingClassSetter implements AutoArrangeEntry.TeachingClassSetter{
        private Parameter parameter;

        private TeachingClassSetter(Parameter parameter) {
            this.parameter = parameter;
        }

        @Override
        public Executer setTeachingClasses(Collection<TeachingClassA> teachingClasses) {
            TeachingClassA [] teachingClassArr;
            teachingClassArr = new TeachingClassA[teachingClasses.size()];
            teachingClasses.toArray(teachingClassArr);
            parameter.setTeachingClasses(teachingClassArr);
            return null;
        }
    }

    private class Executer implements AutoArrangeEntry.Executer{
        private Parameter parameter;

        private Executer(Parameter parameter){
            this.parameter = parameter;
        }

        @Override
        public Future<Map<Long, ArrangeResult>> executeAsync() {
            FutureTask<Map<Long, ArrangeResult>> future = new FutureTask<>(this::execute);
            threadPool.execute(future);
            return future;
        }

        @Override
        public Map<Long, ArrangeResult> execute() {
            // TODO 算法正文
            return null;
        }
    }



}
