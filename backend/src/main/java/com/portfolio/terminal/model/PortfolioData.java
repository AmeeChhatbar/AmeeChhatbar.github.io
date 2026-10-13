package com.portfolio.terminal.model;

import java.util.List;

public class PortfolioData {
    private String name;
    private String email;
    private String phone;
    private String linkedin;
    private String degree;
    private List<String> taglines;
    private Skills skills;
    private List<Experience> experiences;
    private List<Project> projects;
    private List<String> achievements;
    private List<String> certificates;

    public static class Skills {
        private List<String> languages;
        private List<String> tools;

        public Skills(List<String> languages, List<String> tools) {
            this.languages = languages;
            this.tools     = tools;
        }

        public List<String> getLanguages() { return languages; }
        public List<String> getTools()     { return tools; }
    }

    public String getName()                    { return name; }
    public void setName(String name)           { this.name = name; }

    public String getEmail()                   { return email; }
    public void setEmail(String email)         { this.email = email; }

    public String getPhone()                   { return phone; }
    public void setPhone(String phone)         { this.phone = phone; }

    public String getLinkedin()                { return linkedin; }
    public void setLinkedin(String linkedin)   { this.linkedin = linkedin; }

    public String getDegree()                  { return degree; }
    public void setDegree(String degree)       { this.degree = degree; }

    public List<String> getTaglines()               { return taglines; }
    public void setTaglines(List<String> taglines)  { this.taglines = taglines; }

    public Skills getSkills()                  { return skills; }
    public void setSkills(Skills skills)       { this.skills = skills; }

    public List<Experience> getExperiences()                    { return experiences; }
    public void setExperiences(List<Experience> experiences)    { this.experiences = experiences; }

    public List<Project> getProjects()                 { return projects; }
    public void setProjects(List<Project> projects)    { this.projects = projects; }

    public List<String> getAchievements()                    { return achievements; }
    public void setAchievements(List<String> achievements)   { this.achievements = achievements; }

    public List<String> getCertificates()                    { return certificates; }
    public void setCertificates(List<String> certificates)   { this.certificates = certificates; }
}
