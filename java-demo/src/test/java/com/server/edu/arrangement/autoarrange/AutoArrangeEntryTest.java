package com.server.edu.arrangement.autoarrange;

import org.junit.jupiter.api.Test;

import java.io.IOException;

class AutoArrangeEntryTest {
    @Test
    void main() throws IOException {
        AutoArrangeEntry entry = new AutoArrangeEntryImpl();
        entry.defaultParam().setClassrooms(null).setTeachingClasses(null).executeAsync();
    }

}