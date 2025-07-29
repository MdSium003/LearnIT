CREATE DATABASE database_project;

CREATE TABLE "Person" (
  "Person_ID" SERIAL PRIMARY KEY,
  "Name" VARCHAR(255) NOT NULL,
  "Email" VARCHAR(255) UNIQUE NOT NULL,
  "Password" VARCHAR(255) NOT NULL,
  "Birth_Date" DATE NOT NULL,
  "Holding" VARCHAR(255),
  "Postal_Code" INTEGER,
  "Thana" VARCHAR(255),
  "City" VARCHAR(255),
  "District" VARCHAR(255) NOT NULL,
  "Country" VARCHAR(255) NOT NULL,
  "Is_Author" BOOLEAN
  "IS_ADMIN" BOOLEAN DEFAULT FALSE,
);

CREATE TABLE "Teacher" (
  "Teacher_ID" INTEGER PRIMARY KEY,
  "Working" VARCHAR(255),
  "Teaching_Start_Date" DATE NOT NULL,
  FOREIGN KEY ("Teacher_ID") REFERENCES "Person" ("Person_ID")
);

CREATE TABLE "Student" (
  "Student_ID" INTEGER PRIMARY KEY,
  "Class" VARCHAR(255) NOT NULL,
  "Is_Banned" BOOLEAN,
  FOREIGN KEY ("Student_ID") REFERENCES "Person" ("Person_ID")
);

CREATE TABLE "Education_Qualification" (
  "Person_ID" INTEGER,
  "Degree" VARCHAR(255),
  "Subject" VARCHAR(255),
  "Passing_Year" DATE NOT NULL,
  "Grade" NUMERIC(4,2),
  PRIMARY KEY ("Person_ID", "Degree", "Subject"),
  FOREIGN KEY ("Person_ID") REFERENCES "Person" ("Person_ID")
);

CREATE TABLE "Resources" (
  "Resources_ID" SERIAL PRIMARY KEY,
  "Link" VARCHAR(255) NOT NULL
);

CREATE TABLE "Book" (
  "Book_ID" INTEGER PRIMARY KEY,
  "Name" VARCHAR(255) NOT NULL,
  "Main_Author" VARCHAR(255) NOT NULL,
  FOREIGN KEY ("Book_ID") REFERENCES "Resources" ("Resources_ID")
);

CREATE TABLE "Problem_Set" (
  "Problem_Set_ID" INTEGER PRIMARY KEY,
  "Number_of_problem" INTEGER,
  "Topic_Name" VARCHAR(255) NOT NULL,
  "Description" TEXT,
  FOREIGN KEY ("Problem_Set_ID") REFERENCES "Resources" ("Resources_ID")
);

CREATE TABLE "Other" (
  "Other_ID" INTEGER PRIMARY KEY,
  "Title" VARCHAR(255) NOT NULL,
  FOREIGN KEY ("Other_ID") REFERENCES "Resources" ("Resources_ID")
);

CREATE TABLE "Video" (
  "Video_ID" SERIAL PRIMARY KEY,
  "Sub_Topic_ID" INTEGER,
  "Course_ID" INTEGER NOT NULL,
  "Thumbnail" BYTEA,
  "Title" VARCHAR(255),
  "Description" TEXT,
  "Duration" INTERVAL,
  "Link" VARCHAR(255)
);

CREATE TABLE "Course" (
  "Course_ID" SERIAL PRIMARY KEY,
  "Author_ID" INTEGER NOT NULL,
  "Title" VARCHAR(255) NOT NULL,
  "Creation_Date" DATE,
  "Description" TEXT,
  "Thumbnail" BYTEA,
  "Price" INTEGER NOT NULL,
  "Head_Teacher_ID" INTEGER NOT NULL,
  "Certificate" BYTEA,
  "Discount" INTEGER,
  "Trailer_ID" INTEGER,
  FOREIGN KEY ("Author_ID") REFERENCES "Person" ("Person_ID"),
  FOREIGN KEY ("Head_Teacher_ID") REFERENCES "Teacher" ("Teacher_ID"),
  FOREIGN KEY ("Trailer_ID") REFERENCES "Video" ("Video_ID")
);

CREATE TABLE "Sub_Topic" (
  "Sub_Topic_ID" SERIAL PRIMARY KEY,
  "Course_ID" INTEGER,
  "Teacher_ID" INTEGER NOT NULL,
  "Problem_Set_ID" INTEGER UNIQUE,
  "Title" VARCHAR(255) NOT NULL,
  "Is_one_video" BOOLEAN,
  FOREIGN KEY ("Course_ID") REFERENCES "Course" ("Course_ID"),
  FOREIGN KEY ("Problem_Set_ID") REFERENCES "Problem_Set" ("Problem_Set_ID"),
  FOREIGN KEY ("Teacher_ID") REFERENCES "Teacher" ("Teacher_ID")
);

ALTER TABLE "Video" ADD CONSTRAINT fk_video_subtopic
  FOREIGN KEY ("Sub_Topic_ID") REFERENCES "Sub_Topic" ("Sub_Topic_ID");

ALTER TABLE "Video" ADD CONSTRAINT fk_video_course
  FOREIGN KEY ("Course_ID") REFERENCES "Course" ("Course_ID");

CREATE TABLE "Course_Teachers" (
  "Teacher_ID" INTEGER,
  "Course_ID" INTEGER,
  PRIMARY KEY ("Teacher_ID", "Course_ID"),
  FOREIGN KEY ("Teacher_ID") REFERENCES "Teacher" ("Teacher_ID"),
  FOREIGN KEY ("Course_ID") REFERENCES "Course" ("Course_ID")
);

CREATE TABLE "Notice" (
  "Notice_ID" SERIAL PRIMARY KEY,
  "Course_ID" INTEGER,
  "Title" VARCHAR(255) NOT NULL,
  "Description" TEXT,
  "Attachment_ID" INTEGER UNIQUE,
  FOREIGN KEY ("Course_ID") REFERENCES "Course" ("Course_ID"),
  FOREIGN KEY ("Attachment_ID") REFERENCES "Other" ("Other_ID")
);

CREATE TABLE "Course_Books" (
  "Book_ID" INTEGER,
  "Course_ID" INTEGER,
  PRIMARY KEY ("Book_ID", "Course_ID"),
  FOREIGN KEY ("Book_ID") REFERENCES "Book" ("Book_ID"),
  FOREIGN KEY ("Course_ID") REFERENCES "Course" ("Course_ID")
);

CREATE TABLE "Assignment" (
  "Assignment_ID" SERIAL PRIMARY KEY,
  "Sub_Topic_ID" INTEGER,
  "Assignment_Link" VARCHAR(255) NOT NULL,
  "Submission_Link" VARCHAR(255),
  FOREIGN KEY ("Sub_Topic_ID") REFERENCES "Sub_Topic" ("Sub_Topic_ID")
);

CREATE TABLE "Exam" (
  "Exam_ID" SERIAL PRIMARY KEY,
  "Sub_Topic_ID" INTEGER,
  "Exam_Link" VARCHAR(255),
  "Total_Mark" INTEGER NOT NULL,
  FOREIGN KEY ("Sub_Topic_ID") REFERENCES "Sub_Topic" ("Sub_Topic_ID")
);

CREATE TABLE "Enroll" (
  "Student_ID" INTEGER,
  "Course_ID" INTEGER,
  "Tranx_ID" INTEGER UNIQUE NOT NULL,
  PRIMARY KEY ("Student_ID", "Course_ID"),
  FOREIGN KEY ("Student_ID") REFERENCES "Student" ("Student_ID"),
  FOREIGN KEY ("Course_ID") REFERENCES "Course" ("Course_ID")
);

CREATE TABLE "Mark" (
  "Student_ID" INTEGER,
  "Course_ID" INTEGER,
  "Sub_Topic_ID" INTEGER NOT NULL,
  "Assignment" INTEGER,
  "Exam_Mark" INTEGER,
  "COMMENT" TEXT,
  PRIMARY KEY ("Student_ID", "Course_ID"),
  FOREIGN KEY ("Student_ID", "Course_ID") REFERENCES "Enroll" ("Student_ID", "Course_ID"),
  FOREIGN KEY ("Sub_Topic_ID") REFERENCES "Sub_Topic" ("Sub_Topic_ID")
);

ALTER TABLE "Mark" DROP CONSTRAINT "Mark_pkey";
ALTER TABLE "Mark" ADD PRIMARY KEY ("Student_ID", "Course_ID", "Sub_Topic_ID");

ALTER TABLE "Course"
ADD COLUMN "Status" VARCHAR(10) 
CHECK ("Status" IN ('pending', 'accepted', 'declined')) 
DEFAULT 'pending';

