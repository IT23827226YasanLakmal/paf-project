package com.smartcampus.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import java.util.Arrays;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class BeanListTest {

    @Autowired
    private ApplicationContext context;

    @Test
    void listBeans() {
        System.out.println("=== LIST OF BEANS ===");
        Arrays.stream(context.getBeanDefinitionNames())
                .filter(name -> name.toLowerCase().contains("client") || name.toLowerCase().contains("template"))
                .forEach(System.out::println);
        System.out.println("=====================");
    }
}
