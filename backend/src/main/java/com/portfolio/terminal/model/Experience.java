package com.portfolio.terminal.model;

import java.util.List;

public class Experience {
    private String company;
    private String role;
    private String period;
    private List<String> points;
    private List<String> tools;

    public Experience(String company, String role, String period,
                      List<String> points, List<String> tools) {
        this.company = company;
        this.role    = role;
        this.period  = period;
        this.points  = points;
        this.tools   = tools;
    }

    public String getCompany()       { return company; }
    public String getRole()          { return role; }
    public String getPeriod()        { return period; }
    public List<String> getPoints()  { return points; }
    public List<String> getTools()   { return tools; }
}
