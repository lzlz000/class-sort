package com.server.edu.arrangement.autoarrange;

import com.server.edu.arrangement.autoarrange.core.params.Parameter;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.springframework.core.io.ClassPathResource;
import org.yaml.snakeyaml.Yaml;

import java.io.IOException;
import java.io.InputStream;

public class Test1 {
    public static void main(String[] args) throws IOException {
        ClassPathResource resource = new ClassPathResource("autoarrange.yaml");
        InputStream inputStream = resource.getInputStream();
        Yaml yaml = new Yaml();
        Parameter config = yaml.loadAs(inputStream,Parameter.class);
        System.out.println(ToStringBuilder.reflectionToString(config));

    }
}
