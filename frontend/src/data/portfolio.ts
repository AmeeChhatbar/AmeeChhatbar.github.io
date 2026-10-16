// Site content. Edit this file to update the portfolio — no backend needed.

export interface Experience { company: string; role: string; period: string; points: string[]; tools: string[] }
export interface Project { title: string; description: string; stack: string[]; githubUrl: string }
export interface PortfolioData {
  name: string; taglines: string[]; email: string; phone: string; linkedin: string; degree: string
  skills: { languages: string[]; tools: string[] }
  experiences: Experience[]; projects: Project[]
  achievements: string[]; certificates: string[]
}

export const portfolio: PortfolioData = {
  name: 'Amee Chhatbar',
  email: 'chhatbaramee3@gmail.com',
  phone: '+91 7990098163',
  linkedin: 'https://linkedin.com/in/amee-chhatbar-915ab525a',
  degree: 'B.Tech CSE — Indus University (CGPA 9.6 / 10)',

  taglines: ['CS Engineer.', 'ML Researcher.', 'ISRO Research Intern.', 'Java Developer.', 'Problem Solver.'],

  skills: {
    languages: ['Java', 'Python', 'C++', 'JavaScript', 'HTML', 'CSS', 'SQL', 'Shell Script', 'Git'],
    tools: ['Spring Boot', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib',
      'MySQL', 'JDBC', 'VSCode', 'Anaconda', 'Android Studio', 'Figma', 'Trello'],
  },

  experiences: [
    {
      company: 'Indian Space Research Organisation (ISRO)', role: 'Research Intern', period: 'Jul 2024 – Oct 2024',
      points: [
        'Built convective clouds prediction model using INSAT-3DR data — 90% accuracy.',
        'Collaborated with Abhishek Chhari at ISRO on satellite data analysis.',
        'Presented at Tropmet Conference after national abstract selection.',
      ],
      tools: ['Python', 'Machine Learning'],
    },
    {
      company: 'Brainybeams Technologies Pvt. Ltd.', role: 'Data Science Intern', period: 'Jul 2023 – Aug 2023',
      points: [
        'ML model for sonar rock/mine classification — 86% accuracy.',
        'Trained using Sonar dataset with supervised learning techniques.',
      ],
      tools: ['Python', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib'],
    },
    {
      company: 'Indus University', role: 'Skill Development Intern', period: 'Aug 2022 – Sep 2022',
      points: ['Figma prototyping, Trello project management, prototype building.'],
      tools: ['Figma', 'Trello'],
    },
  ],

  projects: [
    {
      title: 'Community Portal',
      description: 'Spring Boot backend for a community platform — JWT auth with email verification, posts, comments & likes, direct messages, real-time group chat over WebSockets, notifications and content reporting.',
      stack: ['Java 21', 'Spring Boot', 'Spring Security', 'JWT', 'WebSocket', 'PostgreSQL', 'JPA'],
      githubUrl: 'https://github.com/AmeeChhatbar/community_portal',
    },
    {
      title: 'ShelfIt',
      description: 'Bookmark system to organize articles, books, and movies with login & session management.',
      stack: ['Java', 'MySQL', 'JDBC', 'BufferedReader'],
      githubUrl: 'https://github.com/AmeeChhatbar/ShelfIt',
    },
    {
      title: 'Sorting Visualiser',
      description: 'Step-by-step visualizer demonstrating sorting algorithms for education.',
      stack: ['Java', 'Spring Framework'],
      githubUrl: '#',
    },
    {
      title: 'Colour Detection',
      description: 'ML model to identify colour at a specified pixel position.',
      stack: ['Python', 'OpenCV', 'Kaggle Dataset'],
      githubUrl: '#',
    },
    {
      title: 'Dance Connect',
      description: 'Responsive website for a dance academy — schedules, services, events.',
      stack: ['HTML', 'CSS', 'JavaScript'],
      githubUrl: '#',
    },
  ],

  achievements: [
    'Delivered oral presentation at Tropmet Conference (national abstract selection) — "ML-Based Identification of Convective Clouds".',
    '1st position at Code Storm | Techfest-2023, Indus University.',
  ],

  certificates: [
    'JAVA + DSA Course — Apna College',
    'JAVA In-Depth: Become a Complete Java Engineer! — Udemy',
    'Cloud Foundational Course — AWS',
  ],
}
