package com.portfolio.terminal.model;

import java.util.List;

public class Project {
    private String title;
    private String description;
    private List<String> stack;
    private String githubUrl;

    public Project(String title, String description, List<String> stack, String githubUrl) {
        this.title       = title;
        this.description = description;
        this.stack       = stack;
        this.githubUrl   = githubUrl;
    }

    public String getTitle()          { return title; }
    public String getDescription()    { return description; }
    public List<String> getStack()    { return stack; }
    public String getGithubUrl()      { return githubUrl; }
}
