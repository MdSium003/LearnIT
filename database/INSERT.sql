-- Data for Table: Person
INSERT INTO "Person" ("Person_ID", "Name", "Email", "Password", "Birth_Date", "Holding", "Postal_Code", "Thana", "City", "District", "Country", "Is_Author") VALUES
(11, 'Dr. Ishaan Haque', 'ishaan.h@example.com', 'securePass1!', '1978-03-22', 'House 12, Road 8', 1205, 'Mohammadpur', 'Dhaka', 'Dhaka', 'Bangladesh', TRUE),
(12, 'Ms. Priya Rahman', 'priya.r@example.com', 'priyaPass@2024', '1985-09-10', 'Apt 5C, Concord Tower', 1215, 'Gulshan', 'Dhaka', 'Dhaka', 'Bangladesh', TRUE),
(13, 'Mr. Zayan Chowdhury', 'zayan.c@example.com', 'zChowPass77', '1990-11-05', 'Holding 30, Sector 7', 1230, 'Uttara', 'Dhaka', 'Dhaka', 'Bangladesh', TRUE),
(14, 'Prof. Laila Afroz', 'laila.a@example.com', 'profLaila#55', '1962-07-01', '25 CDA Avenue', 4000, 'Kotwali', 'Chittagong', 'Chittagong', 'Bangladesh', TRUE),
(15, 'Sameer Ahmed', 'sameer.a@example.com', 'ahmedSameerX', '1995-01-18', '10 Green Road', 1205, 'Dhanmondi', 'Dhaka', 'Dhaka', 'Bangladesh', TRUE),
(16, 'Tasnim Akter', 'tasnim.akter@student.example.com', 'tasnimStudent1', '2003-06-15', 'House 1, Lane 3', 1216, 'Mirpur', 'Dhaka', 'Dhaka', 'Bangladesh', FALSE),
(17, 'Rohan Das', 'rohan.das@student.example.com', 'rohanStudent2', '2004-02-28', 'Village Post Office, Sadar', 6000, 'Sadar', 'Sylhet', 'Sylhet', 'Bangladesh', FALSE),
(18, 'Farah Hossain', 'farah.h@student.example.com', 'farahStudent3', '2002-10-03', '33 College Road', 5000, 'Boalia', 'Rajshahi', 'Rajshahi', 'Bangladesh', FALSE),
(19, 'Imran Khan', 'imran.k@student.example.com', 'imranStudent4', '2005-04-12', 'Flat 8B, Rose View', 1000, 'Paltan', 'Dhaka', 'Dhaka', 'Bangladesh', FALSE),
(20, 'Sadia Islam', 'sadia.i@student.example.com', 'sadiaStudent5', '2003-09-25', 'Holding 11, Road 9', 1229, 'Bashundhara R/A', 'Dhaka', 'Dhaka', 'Bangladesh', FALSE);

-- Data for Table: Teacher
INSERT INTO "Teacher" ("Teacher_ID", "Working", "Teaching_Start_Date") VALUES
(11, 'Lead Data Scientist at TechSolutions Ltd.', '2010-05-15'),
(12, 'Freelance Web Developer & Instructor', '2012-08-01'),
(13, 'Senior Software Engineer at Grameenphone', '2015-01-20');

-- Data for Table: Student
INSERT INTO "Student" ("Student_ID", "Class", "Is_Banned") VALUES
(16, 'BSc in CSE - 3rd Year', FALSE),
(17, 'HSC - 2nd Year (Science)', FALSE),
(18, 'MSc in Economics - 1st Year', FALSE),
(19, 'Class 9', FALSE),
(20, 'BBA in Finance - 4th Year', TRUE);

-- Data for Table: Education_Qualification
INSERT INTO "Education_Qualification" ("Person_ID", "Degree", "Subject", "Passing_Year", "Grade") VALUES
(11, 'PhD', 'Artificial Intelligence', '2012-05-01', 3.95),
(11, 'MSc', 'Computer Science', '2008-07-15', 3.88),
(12, 'BSc', 'Software Engineering', '2011-06-20', 3.75),
(13, 'MSc', 'Information Technology', '2014-12-10', 3.80),
(14, 'PhD', 'Bengali Literature', '1992-03-01', 4.00),
(15, 'BSc', 'Mathematics', '2017-05-01', 3.65),
(16, 'SSC', 'Science', '2019-05-20', 5.00),
(18, 'BSc', 'Economics', '2023-04-10', 3.70);

-- Data for Table: Resources
INSERT INTO "Resources" ("Resources_ID", "Link") VALUES
(11, 'https://example.com/book/ml-from-scratch'),
(12, 'https://example.com/book/fullstack-web-dev-guide'),
(13, 'https://example.com/book/bengali-poetry-anthology'),
(14, 'https://example.com/problemset/ml-regression-tasks'),
(15, 'https://example.com/problemset/js-dom-challenges'),
(16, 'https://example.com/problemset/literary-analysis-prompts'),
(17, 'https://example.com/other/datascience-cheatsheet.pdf'),
(18, 'https://example.com/other/webdev-tools-list.html'),
(19, 'https://example.com/other/academic-writing-styleguide.docx'),
(20, 'https://example.com/book/python-for-everybody');

-- Data for Table: Book
INSERT INTO "Book" ("Book_ID", "Name", "Main_Author") VALUES
(11, 'Machine Learning from Scratch', 'Dr. Ishaan Haque'),
(12, 'The Fullstack Web Developer', 'Ms. Priya Rahman'),
(13, 'Echoes of Bengal: A Poetry Anthology', 'Prof. Laila Afroz'),
(20, 'Python for Everybody: Exploring Data', 'Sameer Ahmed');

-- Data for Table: Problem_Set
INSERT INTO "Problem_Set" ("Problem_Set_ID", "Number_of_problem", "Topic_Name", "Description") VALUES
(14, 12, 'Regression Analysis Problems', 'Practical problems on linear and logistic regression.'),
(15, 20, 'JavaScript DOM Manipulation Challenges', 'Exercises to master DOM interactions.'),
(16, 8, 'Literary Analysis Prompts', 'Prompts for critical analysis of literary texts.');

-- Data for Table: Other
INSERT INTO "Other" ("Other_ID", "Title") VALUES
(17, 'Data Science Python Cheatsheet'),
(18, 'Essential Web Development Tools List'),
(19, 'Academic Writing Style Guide - University Press');

-- Data for Table: Course
-- Trailer_ID will be updated later
INSERT INTO "Course" ("Course_ID", "Author_ID", "Title", "Creation_Date", "Description", "Thumbnail", "Price", "Head_Teacher_ID", "Certificate", "Discount", "Trailer_ID") VALUES
(201, 11, 'Complete Machine Learning & Data Science Bootcamp (2025)', '2024-01-10', 'YouTube Playlist Style: Learn ML, Data Analysis, Pandas, NumPy, Scikit-learn. Real-world projects!', NULL, 5000, 11, NULL, 1000, NULL),
(202, 12, 'The Ultimate Web Development Course - Zero to Hero (2025)', '2024-02-15', 'YouTube Playlist Style: HTML, CSS, JavaScript, React, Node.js, MongoDB. Build 10+ projects.', NULL, 5500, 12, NULL, 500, NULL),
(203, 14, 'Bengali Literature: From Ancient to Modern Era - Full Course', '2024-03-20', 'YouTube Playlist Style: A comprehensive journey through Bengali literary history and analysis.', NULL, 3000, 11, NULL, 300, NULL); -- Dr. Ishaan as head teacher for variety

-- Data for Table: Sub_Topic
INSERT INTO "Sub_Topic" ("Sub_Topic_ID", "Course_ID", "Teacher_ID", "Problem_Set_ID", "Title", "Is_one_video") VALUES
(2011, 201, 11, 14, 'Module 1: Introduction to Data Science & Python Basics', FALSE),
(2012, 201, 11, NULL, 'Module 2: Data Wrangling with Pandas', FALSE),
(2013, 201, 13, NULL, 'Module 5: Deep Learning Fundamentals (Guest Lecture)', TRUE), -- Mr. Zayan as guest
(2021, 202, 12, 15, 'Section 1: HTML & CSS Deep Dive', FALSE),
(2022, 202, 12, NULL, 'Section 3: JavaScript for Beginners to Advanced', FALSE),
(2031, 203, 11, 16, 'Part 1: Ancient and Medieval Bengali Literature', FALSE); -- Dr. Ishaan teaches this

-- Data for Table: Video
INSERT INTO "Video" ("Video_ID", "Sub_Topic_ID", "Course_ID", "Thumbnail", "Title", "Description", "Duration", "Link") VALUES
(11, 2011, 201, NULL, 'Ep 1: What is Data Science? Your Career Path!', 'Introduction to the field and course overview.', '00:12:35', 'https://www.youtube.com/watch?v=vid011&list=PL_MLDS_Bootcamp'),
(12, 2011, 201, NULL, 'Ep 2: Setting up Your Python Environment (Anaconda)', 'Step-by-step guide for installation.', '00:08:10', 'https://www.youtube.com/watch?v=vid012&list=PL_MLDS_Bootcamp'),
(13, 2012, 201, NULL, 'Ep 5: Pandas DataFrame Basics - Part 1', 'Creating and manipulating DataFrames.', '00:25:40', 'https://www.youtube.com/watch?v=vid013&list=PL_MLDS_Bootcamp'),
(14, 2013, 201, NULL, 'Guest Lecture: Intro to Neural Networks', 'A quick dive into deep learning concepts.', '00:45:00', 'https://www.youtube.com/watch?v=vid014&list=PL_MLDS_Bootcamp'),
(15, 2021, 202, NULL, 'Lec 1: HTML Fundamentals - Tags, Attributes, Structure', 'Building your first webpage.', '00:18:50', 'https://www.youtube.com/watch?v=vid015&list=PL_WebDev_Hero'),
(16, 2021, 202, NULL, 'Lec 3: Advanced CSS - Flexbox & Grid Layouts', 'Master responsive design techniques.', '00:33:15', 'https://www.youtube.com/watch?v=vid016&list=PL_WebDev_Hero'),
(17, 2031, 203, NULL, 'Session 1: The Charjapad - Earliest Bengali Texts', 'Analysis and historical context.', '00:28:00', 'https://www.youtube.com/watch?v=vid017&list=PL_BengaliLit_Full'),
(18, NULL, 201, NULL, 'Course Trailer: ML & Data Science Bootcamp!', 'What you will learn in this comprehensive bootcamp.', '00:02:45', 'https://www.youtube.com/watch?v=trailer201'),
(19, NULL, 202, NULL, 'Course Trailer: Ultimate Web Development!', 'Become a full-stack developer with this course.', '00:03:10', 'https://www.youtube.com/watch?v=trailer202'),
(20, NULL, 203, NULL, 'Course Trailer: Journey Through Bengali Literature', 'Explore the rich heritage of Bengali literary works.', '00:02:55', 'https://www.youtube.com/watch?v=trailer203');

-- Update Course Table with Trailer_ID
UPDATE "Course" SET "Trailer_ID" = 18 WHERE "Course_ID" = 201;
UPDATE "Course" SET "Trailer_ID" = 19 WHERE "Course_ID" = 202;
UPDATE "Course" SET "Trailer_ID" = 20 WHERE "Course_ID" = 203;

-- Data for Table: Course_Teachers
INSERT INTO "Course_Teachers" ("Teacher_ID", "Course_ID") VALUES
(11, 201),
(13, 201), -- Mr. Zayan also co-teaches/guest lectures in ML course
(12, 202),
(11, 203); -- Dr. Ishaan teaches Bengali Lit course

-- Data for Table: Notice
INSERT INTO "Notice" ("Notice_ID", "Course_ID", "Title", "Description", "Attachment_ID") VALUES
(11, 201, 'Project 1 Deadline Extended!', 'The deadline for Project 1 (Titanic Survival Prediction) has been extended by one week.', NULL),
(12, 201, 'New Dataset for Module 3 Available', 'Please download the new dataset for the upcoming module on classification.', 17), -- Attaching cheatsheet
(13, 202, 'Live Q&A Session for JavaScript Section', 'Join us for a live Q&A on Saturday at 8 PM BST.', 18); -- Attaching tools list

-- Data for Table: Course_Books
INSERT INTO "Course_Books" ("Book_ID", "Course_ID") VALUES
(11, 201), -- ML from Scratch for ML course
(20, 201), -- Python for Everybody for ML course
(12, 202), -- Fullstack Web Dev for Web Dev course
(13, 203); -- Bengali Poetry for Lit course

-- Data for Table: Assignment
INSERT INTO "Assignment" ("Assignment_ID", "Sub_Topic_ID", "Assignment_Link", "Submission_Link") VALUES
(11, 2011, 'https://classroom.google.com/c/ASSIGNMENT_ML_INTRO/details', 'https://classroom.google.com/c/ASSIGNMENT_ML_INTRO/submit'),
(12, 2012, 'https://github.com/course-assignments/pandas-data-cleaning-task', 'https://github.com/course-assignments/pandas-data-cleaning-task/pulls'),
(13, 2021, 'https://codepen.io/challenges/weekly/XYZ_HTML_CSS_LAYOUT', 'https://codepen.io/your-profile/pens/SUBMISSION_ID'),
(14, 2022, 'https://www.hackerrank.com/contests/javascript-problem-solving-batch1/challenges', 'https://www.hackerrank.com/contests/javascript-problem-solving-batch1/submissions'),
(15, 2031, 'https://docs.google.com/document/d/ASSIGNMENT_LIT_ANALYSIS/edit', 'https://docs.google.com/forms/d/e/SUBMIT_LIT_ANALYSIS/viewform');

-- Data for Table: Exam
INSERT INTO "Exam" ("Sub_Topic_ID", "Exam_ID", "Exam_Link", "Total_Mark") VALUES
(2012, 11, 'https://forms.office.com/r/EXAM_PANDAS_MODULE_TEST', 100),
(2013, 12, 'https://www.proprofs.com/quiz-school/story.php?title=deep-learning-quiz-final', 50),
(2022, 13, 'https://testmoz.com/q/EXAM_JS_FINAL_PROJECT', 150);

-- Data for Table: Enroll
INSERT INTO "Enroll" ("Student_ID", "Course_ID", "Tranx_ID") VALUES
(16, 201, 2001), -- Tasnim in ML Course
(18, 201, 2002), -- Farah in ML Course
(16, 202, 2003), -- Tasnim in Web Dev Course
(17, 203, 2004), -- Rohan in Bengali Lit Course
(19, 201, 2005), -- Imran in ML Course
(18, 202, 2006); -- Farah in Web Dev Course

-- Data for Table: Mark
INSERT INTO "Mark" ("Student_ID", "Course_ID", "Sub_Topic_ID", "Assignment_Avarage", "Exam_Mark") VALUES
(16, 201, 2012, 88, 82), -- Tasnim, ML Course, Pandas subtopic
(18, 201, 2012, 92, 90), -- Farah, ML Course, Pandas subtopic
(16, 202, 2021, 78, 85), -- Tasnim, Web Dev Course, HTML/CSS subtopic
(17, 203, 2031, 85, NULL), -- Rohan, Lit Course, Ancient Lit (maybe assignment only)
(19, 201, 2013, 90, 48); -- Imran, ML Course, Deep Learning subtopic
