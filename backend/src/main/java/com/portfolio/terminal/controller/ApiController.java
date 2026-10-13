package com.portfolio.terminal.controller;

import com.portfolio.terminal.model.Experience;
import com.portfolio.terminal.model.PortfolioData;
import com.portfolio.terminal.model.Project;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ApiController {

    @GetMapping("/portfolio")
    public PortfolioData portfolio() {
        PortfolioData data = new PortfolioData();

        data.setName("Amee Chhatbar");
        data.setEmail("chhatbaramee3@gmail.com");
        data.setPhone("+91 7990098163");
        data.setLinkedin("https://linkedin.com/in/amee-chhatbar-915ab525a");
        data.setDegree("B.Tech CSE — Indus University (CGPA 9.6 / 10)");

        data.setTaglines(List.of(
                "CS Engineer.", "ML Researcher.", "ISRO Research Intern.", "Java Developer.", "Problem Solver."
        ));

        data.setSkills(new PortfolioData.Skills(
                List.of("Java", "Python", "C++", "JavaScript", "HTML", "CSS", "SQL", "Shell Script", "Git"),
                List.of("Spring Boot", "Scikit-learn", "Pandas", "NumPy", "Matplotlib",
                        "MySQL", "JDBC", "VSCode", "Anaconda", "Android Studio", "Figma", "Trello")
        ));

        data.setExperiences(List.of(
                new Experience(
                        "Indian Space Research Organisation (ISRO)", "Research Intern", "Jul 2024 – Oct 2024",
                        List.of(
                                "Built convective clouds prediction model using INSAT-3DR data — 90% accuracy.",
                                "Collaborated with Abhishek Chhari at ISRO on satellite data analysis.",
                                "Presented at Tropmet Conference after national abstract selection."
                        ),
                        List.of("Python", "Machine Learning")
                ),
                new Experience(
                        "Brainybeams Technologies Pvt. Ltd.", "Data Science Intern", "Jul 2023 – Aug 2023",
                        List.of(
                                "ML model for sonar rock/mine classification — 86% accuracy.",
                                "Trained using Sonar dataset with supervised learning techniques."
                        ),
                        List.of("Python", "Scikit-learn", "Pandas", "NumPy", "Matplotlib")
                ),
                new Experience(
                        "Indus University", "Skill Development Intern", "Aug 2022 – Sep 2022",
                        List.of("Figma prototyping, Trello project management, prototype building."),
                        List.of("Figma", "Trello")
                )
        ));

        data.setProjects(List.of(
                new Project("Bookmark System",
                        "Organize articles, books, and movies with login & session management.",
                        List.of("Java", "MySQL", "JDBC", "BufferedReader"), "https://github.com/AmeeChhatbar/ShelfIt"),
                new Project("Sorting Visualiser",
                        "Step-by-step visualizer demonstrating sorting algorithms for education.",
                        List.of("Java", "Spring Framework"), "#"),
                new Project("Colour Detection",
                        "ML model to identify colour at a specified pixel position.",
                        List.of("Python", "OpenCV", "Kaggle Dataset"), "#"),
                new Project("Dance Connect",
                        "Responsive website for a dance academy — schedules, services, events.",
                        List.of("HTML", "CSS", "JavaScript"), "#")
        ));

        data.setAchievements(List.of(
                "Delivered oral presentation at Tropmet Conference (national abstract selection) — \"ML-Based Identification of Convective Clouds\".",
                "1st position at Code Storm | Techfest-2023, Indus University."
        ));

        data.setCertificates(List.of(
                "JAVA + DSA Course — Apna College",
                "JAVA In-Depth: Become a Complete Java Engineer! — Udemy",
                "Cloud Foundational Course — AWS"
        ));

        return data;
    }
}
