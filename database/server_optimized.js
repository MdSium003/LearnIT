require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/v1/courses", async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * , (SELECT ps."Name" FROM "Person" ps WHERE ps."Person_ID" = cou."Head_Teacher_ID") AS "Teacher_Name"  FROM "Course" cou WHERE "Author_ID" = 1'
    );
    res.status(200).json({
      status: "success",
      results: result.rows.length,
      data: {
        courses: result.rows,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// app.post('/api/auth/register', async (req, res) => {
//   const { fullName, email, password, birthdate, district, city, country } = req.body;

//   try {

//     const userResult = await db.query('SELECT * FROM "Person" WHERE "Email" = $1', [email]);
//     if (userResult.rows.length > 0) {
//       return res.status(400).json({ msg: 'User already exists' });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUserResult = await db.query(
//       'INSERT INTO "Person" ("Name", "Email", "Password", "Birth_Date", "District", "City", "Country") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING "Person_ID"',
//       [fullName, email, hashedPassword, birthdate, district, city, country]
//     );

//     const userId = newUserResult.rows[0].Person_ID;

//     const payload = { user: { id: userId } };
//     jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
//       if (err) throw err;      res.status(201).json({
//         token,
//         user: {
//           id: userId,
//           name: fullName,
//           email: email,
//         },
//       });
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ msg: 'Server Error' });
//   }
// });
app.post("/api/auth/register", async (req, res) => {
  const {
    fullName,
    email,
    password,
    birthdate,
    district,
    city,
    country,
    role,
  } = req.body;

  try {
    const userResult = await db.query(
      'SELECT * FROM "Person" WHERE "Email" = $1',
      [email]
    );
    if (userResult.rows.length > 0) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserResult = await db.query(
      'INSERT INTO "Person" ("Name", "Email", "Password", "Birth_Date", "District", "City", "Country") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING "Person_ID"',
      [fullName, email, hashedPassword, birthdate, district, city, country]
    );

    const userId = newUserResult.rows[0].Person_ID;

    const currentDate = new Date();
    const formattedDate = currentDate
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    // console.log(formattedDate);  // Outputs: 2025-07-01 12:34:56 (for example)

    if (role == "student") {
      const s = await db.query(
        'INSERT INTO "Student" ("Student_ID" , "Class" , "Is_Banned") VALUES ($1 , $2 , $3)',
        [userId, "N/A", false]
      );
    } else if (role == "teacher") {
      const t = await db.query(
        'INSERT INTO "Teacher" ("Teacher_ID" , "Working" , "Teaching_Start_Date") VALUES ($1 , $2 , $3)',
        [userId, "N/A", formattedDate]
      );
    }
    const payload = { user: { id: userId } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          token,
          user: {
            id: userId,
            name: fullName,
            email: email,
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// app.post("/api/v1/login", async (req, res) => {
//   const { email, pass } = req.body;

//   try {
//     const userResult = await db.query(
//       'SELECT * FROM "Person" WHERE "Email" = $1',
//       [email]
//     );

//     if (userResult.rows.length === 0 || !userResult.rows[0].Password) {
//       return res
//         .status(401)
//         .json({ status: "fail", msg: "Invalid email or password." });
//     }

//     const user = userResult.rows[0];

//     const isMatch = await bcrypt.compare(pass, user.Password);

//     const userId = userResult.rows[0].Person_ID;

//     const payload = { user: { id: userId } };

//     if (isMatch) {
//       jwt.sign(
//         payload,
//         process.env.JWT_SECRET,
//         { expiresIn: "5h" },
//         (err, token) => {
//           if (err) throw err;
//           res.status(200).json({
//             status: "success",
//             token: token,
//             user: {
//               id: user.Person_ID,
//               name: user.Name,
//               email: user.Email,
//             },
//           });
//         }
//       );
//     } else {
//       res
//         .status(401)
//         .json({ status: "fail", msg: "Invalid email or password." });
//     }
//   } catch (err) {
//     console.error("Login error:", err.message);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

app.post("/api/v1/teacherCourse", async (req, res) => {
  const { teacherId } = req.body;

  try {
    const teacherCourses = await db.query(
      `
        SELECT
          c."Course_ID",
          CASE
          WHEN c."Author_ID" = 1 THEN 'Public'
          ELSE 'Private'
          END AS "Status",
          c."Title",
          c."Creation_Date"
        FROM
          "Course" AS c
        WHERE
          c."Head_Teacher_ID" = $1
      `,
      [teacherId]
    );

    // if (teacherExists.rows.length === 0) {
    //   return res.status(400).json({ msg: "Teacher does not exist" });
    // }

    // const newCourseResult = await db.query(
    //   'INSERT INTO "Course" ("Course_Name", "Course_Description", "Teacher_ID") VALUES ($1, $2, $3) RETURNING *',
    //   [courseName, courseDescription, teacherId]
    // );

    res.status(201).json({
      status: "success",
      data: {
        course: teacherCourses.rows,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

app.get("/api/v1/studentCourse", async (req, res) => {
  const { sudentId } = req.body;

  try {
    const studentCourses = await db.query(
      `
        SELECT
          cou."Course_ID",
          cou."Title",
          cou."Creation_Date"
        FROM
          "Enroll" en
          JOIN "Course" cou ON en."Course_ID" = cou."Course_ID"
        WHERE
          en."Student_ID" = $1;
      `,
      [sudentId]
    );

    // if (teacherExists.rows.length === 0) {
    //   return res.status(400).json({ msg: "Teacher does not exist" });
    // }

    // const newCourseResult = await db.query(
    //   'INSERT INTO "Course" ("Course_Name", "Course_Description", "Teacher_ID") VALUES ($1, $2, $3) RETURNING *',
    //   [courseName, courseDescription, teacherId]
    // );

    res.status(201).json({
      status: "success",
      data: {
        course: studentCourses.rows,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

app.delete("/api/v1/teacherCourse/Delete", async (req, res) => {
  const { courseId } = req.body;
  // console.log(courseId);

  try {
    // Check if the person exists
    // const personResult = await db.query('SELECT * FROM "Person" WHERE "Person_ID" = $1', [id]);
    // if (personResult.rows.length === 0) {
    //   return res.status(404).json({ msg: "Person not found" });
    // }

    // Delete from related tables (e.g., Student or Teacher)
    await db.query('DELETE FROM "Course" WHERE "Course_ID" = $1', [courseId]);
    // await db.query('DELETE FROM "Teacher" WHERE "Teacher_ID" = $1', [id]);

    // // Delete from Person table
    // await db.query('DELETE FROM "Person" WHERE "Person_ID" = $1', [id]);

    res
      .status(200)
      .json({ status: "success", msg: "Person deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});



// app.delete("/api/v1/person", async (req, res) => {
//   const { personId } = req.body;

//   try {
//     // Check if the person exists
//     const personResult = await db.query('SELECT * FROM "Person" WHERE "Person_ID" = $1', [personId]);
//     if (personResult.rows.length === 0) {
//       return res.status(404).json({ msg: "Person not found" });
//     }

//     // Delete from related tables (e.g., Student or Teacher)
//     await db.query('DELETE FROM "Student" WHERE "Student_ID" = $1', [personId]);
//     await db.query('DELETE FROM "Teacher" WHERE "Teacher_ID" = $1', [personId]);

//     // Delete from Person table
//     await db.query('DELETE FROM "Person" WHERE "Person_ID" = $1', [personId]);

//     res.status(200).json({ status: "success", msg: "Person deleted successfully" });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ msg: "Server Error" });
//   }
// });

app.post("/api/v1/Course_Details", async (req, res) => {
  const { Course_Id , Student_Id , Enrolled } = req.body;

  try {
    // const creationDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    let Course;
    if (Enrolled == true) {
      // Course = await db.query(
      //   'SELECT cou."Course_ID", CASE WHEN cou."Author_ID" = 1 THEN \'Public\'ELSE \'Private\' END AS "Status", cou."Title", cou."Creation_Date", cou."Description", (SELECT ps."Name" FROM "Person" ps WHERE ps."Person_ID" = cou."Head_Teacher_ID") AS "Teacher_Name" ,  JSON_ARRAYAGG (JSON_OBJECT (\'Sub_Topic_Id\' VALUE TEM."Sub_Topic_ID", \'Video\' VALUE TEM."Video", \'Exam\' VALUE TEM."Exam")) "Course_Info" FROM(SELECT sub."Sub_Topic_ID", sub."Course_ID", sub."Title", JSON_ARRAYAGG (JSON_OBJECT (\'video_id\' VALUE vi."Video_ID", \'sub_topic_id\' VALUE vi."Sub_Topic_ID", \'title\' VALUE vi."Title", \'description\' VALUE vi."Description", \'duration\' VALUE vi."Duration", \'link\' VALUE vi."Link")) "Video", JSON_ARRAYAGG (JSON_OBJECT (\'sub_topic_id\' VALUE ex."Sub_Topic_ID", \'exam_id\' VALUE ex."Exam_ID", \'exam_link\' VALUE ex."Exam_Link", \'total_mark\' VALUE ex."Total_Mark")) "Exam" FROM "Sub_Topic" sub FULL JOIN "Video" vi ON sub."Sub_Topic_ID" = vi."Sub_Topic_ID" FULL JOIN "Exam" ex ON ex."Sub_Topic_ID" = sub."Sub_Topic_ID" GROUP BY sub."Sub_Topic_ID", sub."Course_ID" , sub."Title") TEM FULL JOIN "Course" cou ON TEM."Course_ID" = cou."Course_ID" GROUP BY cou."Course_ID", cou."Author_ID", cou."Title", cou."Creation_Date", cou."Description", cou."Price", cou."Head_Teacher_ID" HAVING cou."Course_ID" = $1',
      //   [Course_Id]
      // );
      Course = await db.query(
        `
        SELECT
          cou."Course_ID",
          CASE
            WHEN cou."Author_ID" = 1 THEN 'Public'
            ELSE 'Private'
          END AS "Status",
          cou."Title",
          cou."Creation_Date",
          cou."Description",
          (SELECT ps."Name" FROM "Person" ps WHERE ps."Person_ID" = cou."Head_Teacher_ID") AS "Teacher_Name",
          JSON_ARRAYAGG(
            JSON_BUILD_OBJECT(
              'Sub_Topic_Id', TEM."Sub_Topic_ID",
              'Video', TEM."Video",
              'Exam', TEM."Exam",
              'Assignment', TEM."Assignment",
              'ObtainMark', (
                SELECT
                  "Exam_Mark"
                FROM
                  "Mark"
                WHERE
                  TEM."Sub_Topic_ID" = "Sub_Topic_ID"
                  AND "Student_ID" = $2
                  AND "Course_ID" = $1
              )
            )
          ) AS "Course_Info"
        FROM
          (
            SELECT
              sub."Sub_Topic_ID",
              sub."Course_ID",
              sub."Title",
              JSON_ARRAYAGG(
                JSON_BUILD_OBJECT(
                  'video_id', vi."Video_ID",
                  'sub_topic_id', vi."Sub_Topic_ID",
                  'title', vi."Title",
                  'description', vi."Description",
                  'duration', vi."Duration",
                  'link', vi."Link"
                )
              ) AS "Video",
              JSON_ARRAYAGG(
                JSON_BUILD_OBJECT(
                  'sub_topic_id', ex."Sub_Topic_ID",
                  'exam_id', ex."Exam_ID",
                  'exam_link', ex."Exam_Link",
                  'total_mark', ex."Total_Mark"
                )
              ) AS "Exam" , 
               JSON_ARRAYAGG(
                JSON_BUILD_OBJECT(
                  'sub_topic_id', asg."Sub_Topic_ID",
                  'assignment_id', asg."Assignment_ID",
                  'assignment_link', asg."Assignment_Link",
                  'submission_link', asg."Submission_Link"
                )
              ) AS "Assignment" 
            FROM
              "Sub_Topic" sub
              FULL JOIN "Video" vi ON sub."Sub_Topic_ID" = vi."Sub_Topic_ID"
              FULL JOIN "Exam" ex ON ex."Sub_Topic_ID" = sub."Sub_Topic_ID"
              FULL JOIN "Assignment" asg ON asg."Sub_Topic_ID" = sub."Sub_Topic_ID"
            GROUP BY
              sub."Sub_Topic_ID",
              sub."Course_ID",
              sub."Title"
          ) TEM
          FULL JOIN "Course" cou ON TEM."Course_ID" = cou."Course_ID"
        WHERE
          cou."Course_ID" = $1
        GROUP BY
          cou."Course_ID",
          cou."Author_ID",
          cou."Title",
          cou."Creation_Date",
          cou."Description",
          cou."Price",
          cou."Head_Teacher_ID"
        `,
        [Course_Id, Student_Id]
      );
    } else {
      Course = await db.query(
        'SELECT cou."Course_ID", cou."Title", cou."Creation_Date", cou."Description", cou."Price", (SELECT ps."Name" FROM "Person" ps WHERE ps."Person_ID" = cou."Head_Teacher_ID") AS "Teacher_Name" , JSON_ARRAYAGG(JSON_OBJECT(\'sub_topic_title\' VALUE sub."Title", \'teacher_id\' VALUE sub."Teacher_ID")) AS sub_topic_info FROM "Course" cou JOIN "Sub_Topic" sub ON cou."Course_ID" = sub."Course_ID" GROUP BY cou."Course_ID", cou."Author_ID", cou."Title", cou."Creation_Date", cou."Description", cou."Price", cou."Head_Teacher_ID" HAVING cou."Course_ID" = $1 AND cou."Author_ID" = 1',
        [Course_Id]
      );
    }
    res.status(201).json({
      status: "success",
      data: {
        course: Course.rows[0],
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});



app.post("/api/v1/login", async (req, res) => {
  const { email, pass } = req.body;

  try {
    const userResult = await db.query(
      'SELECT * FROM "Person" WHERE "Email" = $1',
      [email]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].Password) {
      return res
        .status(401)
        .json({ status: "fail", msg: "Invalid email or password." });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(pass, user.Password);

    const userId = userResult.rows[0].Person_ID;

    const payload = { user: { id: userId } };

    if (isMatch) {
      let role;
      const roleStudent = await db.query(
        'SELECT * FROM "Student" WHERE "Student_ID" = $1',
        [userId]
      );
      const roleTeacher = await db.query(
        'SELECT * FROM "Teacher" WHERE "Teacher_ID" = $1',
        [userId]
      );
      if (roleStudent.rows.length > 0) {
        role = "student";
      } else if (roleTeacher.rows.length > 0) {
        role = "teacher";
      }

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "5h" },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            status: "success",
            token: token,
            user: {
              id: user.Person_ID,
              name: user.Name,
              email: user.Email,
              role: role,
            },
          });
        }
      );
    } else {
      res
        .status(401)
        .json({ status: "fail", msg: "Invalid email or password." });
    }
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/v1/CreateCourse
app.post("/api/v1/CreateCourse", async (req, res) => {
  const {
    title,
    creation_date,
    description,
    price,
    head_teacher_id,
    certificate,
    discount,
  } = req.body;

  // Validate required fields
  if (!title || !description || !price || !head_teacher_id) {
    return res.status(400).json({
      error:
        "Missing required fields (title, description, price, head_teacher_id)",
    });
  }

  try {
    // Get next Course_ID
    const maxIdQuery = await db.query('SELECT MAX("Course_ID") FROM "Course"');
    const nextId = maxIdQuery.rows[0].max + 1 || 1; // Default to 1 if table is empty

    // Insert new course
    const insertQuery = `
      INSERT INTO "Course" (
        "Course_ID", 
        "Title", 
        "Creation_Date", 
        "Description", 
        "Price", 
        "Head_Teacher_ID", 
        "Certificate", 
        "Discount"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      nextId,
      title,
      creation_date || new Date().toISOString().split("T")[0], // Default to today
      description,
      price,
      head_teacher_id,
      certificate || null,
      discount || null,
    ];

    const result = await db.query(insertQuery, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating course:", error);
    res
      .status(500)
      .json({ error: "Failed to create course", details: error.message });
  }
});

app.post("/api/v1/createSubTopic", async (req, res) => {
  const {
    Course_ID,
    Teacher_ID,
    // Problem_Set_ID,
    Title,
    Is_one_video,
    // Video fields
    Thumbnail,
    Video_Title,
    Video_Description,
    Duration,
    Video_Link,
    // Assignment fields
    Assignment_Link,
    Submission_Link,
    // Exam fields
    Exam_Link,
    Total_Mark,
  } = req.body;

  // Validate required fields
  if (
    !Course_ID ||
    !Teacher_ID ||
    !Title ||
    !Video_Link ||
    !Assignment_Link ||
    !Total_Mark
  ) {
    return res.status(400).json({
      error:
        "Missing required fields (Course_ID, Teacher_ID, Title, Video_Link, Assignment_Link, Total_Mark)",
    });
  }

  try {
    // Start transaction
    await db.query("BEGIN");

    // Get next IDs for all tables
    const idQueries = await Promise.all([
      db.query('SELECT MAX("Sub_Topic_ID") FROM "Sub_Topic"'),
      db.query('SELECT MAX("Video_ID") FROM "Video"'),
      db.query('SELECT MAX("Assignment_ID") FROM "Assignment"'),
      db.query('SELECT MAX("Exam_ID") FROM "Exam"'),
    ]);

    const nextSubTopicId = (idQueries[0].rows[0].max || 0) + 1;
    const nextVideoId = (idQueries[1].rows[0].max || 0) + 1;
    const nextAssignmentId = (idQueries[2].rows[0].max || 0) + 1;
    const nextExamId = (idQueries[3].rows[0].max || 0) + 1;

    // Insert Sub_Topic
    const subTopicQuery = `
      INSERT INTO "Sub_Topic" (
        "Sub_Topic_ID", "Course_ID", "Teacher_ID", 
        "Title", "Is_one_video"
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    await db.query(subTopicQuery, [
      nextSubTopicId,
      Course_ID,
      Teacher_ID,
      Title,
      Is_one_video || false,
    ]);

    // Insert Video
    const videoQuery = `
      INSERT INTO "Video" (
        "Video_ID", "Sub_Topic_ID", "Course_ID", 
        "Thumbnail", "Title", "Description", 
        "Duration", "Link"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    await db.query(videoQuery, [
      nextVideoId,
      nextSubTopicId,
      Course_ID,
      Thumbnail || null,
      Video_Title || Title,
      Video_Description || null,
      Duration || null,
      Video_Link,
    ]);

    // Insert Assignment
    const assignmentQuery = `
      INSERT INTO "Assignment" (
        "Assignment_ID", "Sub_Topic_ID", 
        "Assignment_Link", "Submission_Link"
      ) VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    await db.query(assignmentQuery, [
      nextAssignmentId,
      nextSubTopicId,
      Assignment_Link,
      Submission_Link || null,
    ]);

    // Insert Exam
    const examQuery = `
      INSERT INTO "Exam" (
        "Sub_Topic_ID", "Exam_ID", 
        "Exam_Link", "Total_Mark"
      ) VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    await db.query(examQuery, [
      nextSubTopicId,
      nextExamId,
      Exam_Link || null,
      Total_Mark,
    ]);

    // Commit transaction
    await db.query("COMMIT");

    res.status(201).json({
      message: "SubTopic created successfully with related records",
      Sub_Topic_ID: nextSubTopicId,
      Video_ID: nextVideoId,
      Assignment_ID: nextAssignmentId,
      Exam_ID: nextExamId,
    });
  } catch (error) {
    // Rollback on error
    await db.query("ROLLBACK");
    console.error("Error creating subtopic:", error);
    res
      .status(500)
      .json({ error: "Failed to create subtopic", details: error.message });
  }
});

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const { Pool } = require('pg');

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_DATABASE,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server is up and listening on port ${port}`);
});
