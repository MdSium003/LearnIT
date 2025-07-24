require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
//const userRoutes = require('./routes/userRoutes');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
//app.use('/api/users', userRoutes);


// --- API ROUTES ---

// Get all courses (for the main page)
app.get('/api/v1/courses', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "Course"');
    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        courses: result.rows,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// **NEW** Get a single course's full details
app.get('/api/v1/courses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Get main course details and author name
        const courseResult = await db.query(
            `SELECT c."Title", c."Description", c."Price", p."Name" as "instructorName"
             FROM "Course" c
             JOIN "Person" p ON c."Author_ID" = p."Person_ID"
             WHERE c."Course_ID" = $1`,
            [id]
        );

        if (courseResult.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        const course = courseResult.rows[0];

        // Get all subtopics for the course
        const subtopicsResult = await db.query(
            'SELECT "Sub_Topic_ID", "Title" FROM "Sub_Topic" WHERE "Course_ID" = $1 ORDER BY "Sub_Topic_ID"',
            [id]
        );
        const subtopics = subtopicsResult.rows;

        // For each subtopic, get its videos and exams
        const subtopicsData = await Promise.all(subtopics.map(async (sub) => {
            const videosResult = await db.query(
                'SELECT "Title" FROM "Video" WHERE "Sub_Topic_ID" = $1 ORDER BY "Video_ID"',
                [sub.Sub_Topic_ID]
            );
            const examsResult = await db.query(
                'SELECT "Exam_Link" FROM "Exam" WHERE "Sub_Topic_ID" = $1 ORDER BY "Exam_ID"',
                [sub.Sub_Topic_ID]
            );
            return {
                id: sub.Sub_Topic_ID,
                title: sub.Title,
                videos: videosResult.rows.map(v => v.Title),
                exams: examsResult.rows.map((e, index) => `Quiz ${index + 1}`), // Using generic names for exams
            };
        }));

        res.json({
            id: parseInt(id),
            title: course.Title,
            description: course.Description,
            price: course.Price,
            instructor: course.instructorName,
            structure: subtopicsData,
            // You can add more static data here if needed, e.g., rating
            rating: 4.7,
            reviews: (Math.random() * 2000).toFixed(0),
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});


// --- AUTH ROUTES ---

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, password, birthdate, district, city, country } = req.body;

  try {
    // Check if user already exists
    const userResult = await db.query('SELECT * FROM "Person" WHERE "Email" = $1', [email]);
    if (userResult.rows.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user to database
    const newUserResult = await db.query(
      'INSERT INTO "Person" ("Name", "Email", "Password", "Birth_Date", "District", "City", "Country") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING "Person_ID"',
      [fullName, email, hashedPassword, birthdate, district, city, country]
    );

    const userId = newUserResult.rows[0].Person_ID;


    await db.query(
      'INSERT INTO "Student" ("Student_ID", "Class", "Is_Banned") VALUES ($1, $2, $3)',
      [userId, 'General', false]
    );


    const payload = { user: { id: userId } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;      res.status(201).json({
        token,
        user: {
          id: userId,
          name: fullName,
          email: email,
        },
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});


app.post('/api/v1/login', async (req, res) => {
  const { email, password } = req.body; 

  try {
    const userResult = await db.query('SELECT * FROM "Person" WHERE "Email" = $1', [email]); 
    if (userResult.rows.length === 0 || !userResult.rows[0].Password) { 
      return res.status(401).json({ status: 'fail', msg: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.Password);
    const userId = user.Person_ID;
    const payload = { user: { id: userId } };

    if (isMatch) {
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
        if (err) throw err;
        res.status(200).json({
          status: 'success',
          token: token,
          user: {
            id: user.Person_ID,
            name: user.Name,
            email: user.Email,
            isAuthor: user.Is_Author, 
          },
          role: user.Role || 'student', 
        });
      });
    } else {
      res.status(401).json({ status: 'fail', msg: 'Invalid email or password.' });
    }
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// --- BECOME TEACHER ROUTE ---
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ msg: 'Token is not valid' });
    req.user = decoded.user;
    next();
  });
};

// --- PROFILE ROUTES ---
app.get('/api/profile', authenticateJWT, async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Fetch Person and Teacher data using a LEFT JOIN
    const personResult = await db.query(
      `SELECT 
        p."Name" as name,
        p."Email" as email,
        p."Is_Author" as "isAuthor",
        p."Birth_Date" as "birthDate",
        p."Holding" as holding,
        p."Thana" as thana,
        p."City" as city,
        p."Postal_Code" as "postalCode",
        p."District" as district,
        p."Country" as country,
        t."Working" as working,
        t."Teaching_Start_Date" as "teachingStartDate"
      FROM "Person" p
      LEFT JOIN "Teacher" t ON p."Person_ID" = t."Teacher_ID"
      WHERE p."Person_ID" = $1`,
      [userId]
    );

    if (personResult.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const userData = personResult.rows[0];

    // 2. Fetch Education Qualification data
    const eduResult = await db.query(
      'SELECT "Degree" as degree, "Subject" as subject, "Passing_Year" as "passingYear", "Grade" as grade FROM "Education_Qualification" WHERE "Person_ID" = $1',
      [userId]
    );

    // 3. Construct the final user profile object
    const userProfile = {
      name: userData.name,
      email: userData.email,
      isAuthor: userData.isAuthor,
      avatarUrl: `https://placehold.co/150x150/a78bfa/ffffff?text=${(userData.name || 'U').charAt(0)}`, // Dynamic placeholder
      personalInfo: {
        birthDate: userData.birthDate,
      },
      address: {
        holding: userData.holding,
        thana: userData.thana,
        city: userData.city,
        postalCode: userData.postalCode,
        district: userData.district,
        country: userData.country,
      },
      professional: userData.working ? { // Only add professional info if they are a teacher
        working: userData.working,
        teachingStartDate: userData.teachingStartDate,
      } : null,
      education: eduResult.rows.map(edu => ({
          ...edu,
          // NOTE: Your schema doesn't have an 'institution' column. Adding a placeholder.
          institution: 'University Name', 
          grade: edu.grade ? parseFloat(edu.grade).toFixed(2) : 'N/A',
          passingYear: new Date(edu.passingYear).getFullYear().toString()
      })),
    };

    res.json(userProfile);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// **FIXED** PUT /api/profile route
app.put('/api/profile', authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const { name, address, professional, education } = req.body;

  if (!name || !address || !education) {
    return res.status(400).json({ msg: 'Missing required profile data.' });
  }

  try {
    // Use db.query for transaction management
    await db.query('BEGIN');

    // 1. Update Person table
    await db.query(
      `UPDATE "Person" SET 
        "Name" = $1, 
        "Holding" = $2, 
        "Thana" = $3, 
        "City" = $4, 
        "Postal_Code" = $5, 
        "District" = $6, 
        "Country" = $7
      WHERE "Person_ID" = $8`,
      [
        name,
        address.holding,
        address.thana,
        address.city,
        address.postalCode,
        address.district,
        address.country,
        userId,
      ]
    );

    // 2. Update Teacher table (if professional info is provided)
    if (professional && professional.working) {
      await db.query(
        `INSERT INTO "Teacher" ("Teacher_ID", "Working", "Teaching_Start_Date")
         VALUES ($1, $2, NOW())
         ON CONFLICT ("Teacher_ID") DO UPDATE SET "Working" = $2`,
        [userId, professional.working]
      );
    }

    // 3. Update Education Qualifications (delete and re-insert)
    await db.query('DELETE FROM "Education_Qualification" WHERE "Person_ID" = $1', [userId]);

    for (const edu of education) {
      if (edu.degree && edu.subject && edu.passingYear) {
          const passingYearDate = `${edu.passingYear}-01-01`;
          const gradeValue = edu.grade === 'N/A' || edu.grade === '' ? null : edu.grade;
          await db.query(
            'INSERT INTO "Education_Qualification" ("Person_ID", "Degree", "Subject", "Passing_Year", "Grade") VALUES ($1, $2, $3, $4, $5)',
            [userId, edu.degree, edu.subject, passingYearDate, gradeValue]
          );
      }
    }

    await db.query('COMMIT'); // Commit transaction
    res.json({ success: true, msg: 'Profile updated successfully.' });

  } catch (err) {
    await db.query('ROLLBACK'); // Rollback on error
    console.error('Profile update error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});


app.post('/api/become-teacher', authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  try {
    // Insert into Teacher table if not already present
    await db.query(
      'INSERT INTO "Teacher" ("Teacher_ID", "Teaching_Start_Date") VALUES ($1, $2) ON CONFLICT ("Teacher_ID") DO NOTHING',
      [userId, new Date().toISOString().split('T')[0]]
    );
    // Update Person.Is_Author
    await db.query('UPDATE "Person" SET "Is_Author" = TRUE WHERE "Person_ID" = $1', [userId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/enroll', authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.body;
  if (!courseId) return res.status(400).json({ error: 'Missing courseId' });
  try {
    // Generate a random Tranx_ID (in production, use a proper sequence or UUID)
    const tranxId = Math.floor(Math.random() * 1000000000);
    await db.query(
      'INSERT INTO "Enroll" ("Student_ID", "Course_ID", "Tranx_ID") VALUES ($1, $2, $3) ON CONFLICT ("Student_ID", "Course_ID") DO NOTHING',
      [userId, courseId, tranxId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/enrollments/:courseId', authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;
  try {
    const result = await db.query(
      'SELECT 1 FROM "Enroll" WHERE "Student_ID" = $1 AND "Course_ID" = $2',
      [userId, courseId]
    );
    res.json({ enrolled: result.rows.length > 0 });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/my-courses', authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      `SELECT c.* FROM "Enroll" e
       JOIN "Course" c ON e."Course_ID" = c."Course_ID"
       WHERE e."Student_ID" = $1
       ORDER BY c."Title" ASC`,
      [userId]
    );
    res.json({ courses: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/teacher/my-courses', authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      'SELECT "Course_ID", "Title", "Description" FROM "Course" WHERE "Author_ID" = $1 ORDER BY "Title" ASC',
      [userId]
    );
    res.json({ courses: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/teacher/courses', authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const { title, description, price, subtopics } = req.body;
  if (!title || !price || !Array.isArray(subtopics)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    // Insert course
    const courseResult = await db.query(
      'INSERT INTO "Course" ("Author_ID", "Title", "Description", "Price", "Head_Teacher_ID") VALUES ($1, $2, $3, $4, $1) RETURNING "Course_ID"',
      [userId, title, description, price]
    );
    const courseId = courseResult.rows[0].Course_ID;
    // Insert subtopics, videos, assignments, exams
    for (const sub of subtopics) {
      const subtopicResult = await db.query(
        'INSERT INTO "Sub_Topic" ("Course_ID", "Teacher_ID", "Title", "Is_one_video") VALUES ($1, $2, $3, $4) RETURNING "Sub_Topic_ID"',
        [courseId, userId, sub.title, sub.videos.length === 1]
      );
      const subTopicId = subtopicResult.rows[0].Sub_Topic_ID;
      // Videos
      for (const v of sub.videos) {
        await db.query(
          'INSERT INTO "Video" ("Sub_Topic_ID", "Course_ID", "Title", "Link") VALUES ($1, $2, $3, $4)',
          [subTopicId, courseId, v.title, v.link]
        );
      }
      // Assignments
      for (const a of sub.assignments) {
        await db.query(
          'INSERT INTO "Assignment" ("Sub_Topic_ID", "Assignment_Link") VALUES ($1, $2)',
          [subTopicId, a.link]
        );
      }
      // Exams
      for (const e of sub.exams) {
        await db.query(
          'INSERT INTO "Exam" ("Sub_Topic_ID", "Exam_Link", "Total_Mark") VALUES ($1, $2, $3)',
          [subTopicId, e.link, 100]
        );
      }
    }
    res.status(201).json({ courseId });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/courses/:courseId/doing', authenticateJWT, async (req, res) => {
  const { courseId } = req.params;
  try {
    // Get all subtopics for the course
    const subtopicsResult = await db.query(
      'SELECT "Sub_Topic_ID", "Title" FROM "Sub_Topic" WHERE "Course_ID" = $1 ORDER BY "Title" ASC',
      [courseId]
    );
    const subtopics = subtopicsResult.rows;
    // For each subtopic, get videos, assignments, and exams
    const data = await Promise.all(subtopics.map(async (sub) => {
      const [videos, assignments, exams] = await Promise.all([
        db.query('SELECT "Video_ID", "Title", "Link" FROM "Video" WHERE "Sub_Topic_ID" = $1 AND "Course_ID" = $2', [sub.Sub_Topic_ID, courseId]),
        db.query('SELECT "Assignment_ID", "Assignment_Link" FROM "Assignment" WHERE "Sub_Topic_ID" = $1', [sub.Sub_Topic_ID]),
        db.query('SELECT "Exam_ID", "Exam_Link" FROM "Exam" WHERE "Sub_Topic_ID" = $1', [sub.Sub_Topic_ID]),
      ]);
      return {
        subTopicId: sub.Sub_Topic_ID,
        title: sub.Title,
        videos: videos.rows,
        assignments: assignments.rows,
        exams: exams.rows,
      };
    }));
    
    res.json({ subtopics: data });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/courses/:courseId/notices', authenticateJWT, async (req, res) => {
  const { courseId } = req.params;
  try {
    const result = await db.query(
      `SELECT n."Notice_ID", n."Title", n."Description", o."Title" as attachment_title, o."Other_ID" as attachment_id
       FROM "Notice" n
       LEFT JOIN "Other" o ON n."Attachment_ID" = o."Other_ID"
       WHERE n."Course_ID" = $1
       ORDER BY n."Notice_ID" DESC`,
      [courseId]
    );
    res.json({ notices: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get course details for editing
app.get('/api/teacher/courses/:courseId', authenticateJWT, async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;
  try {
    // Check if user is the author of this course
    const courseResult = await db.query(
      'SELECT "Course_ID", "Title", "Description", "Price" FROM "Course" WHERE "Course_ID" = $1 AND "Author_ID" = $2',
      [courseId, userId]
    );
    if (courseResult.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized or course not found' });
    }
    const course = courseResult.rows[0];
    
    // Get all subtopics for the course
    const subtopicsResult = await db.query(
      'SELECT "Sub_Topic_ID", "Title" FROM "Sub_Topic" WHERE "Course_ID" = $1 ORDER BY "Title" ASC',
      [courseId]
    );
    const subtopics = subtopicsResult.rows;
    
    // For each subtopic, get videos, assignments, and exams
    const subtopicsData = await Promise.all(subtopics.map(async (sub) => {
      const [videos, assignments, exams] = await Promise.all([
        db.query('SELECT "Video_ID", "Title", "Link" FROM "Video" WHERE "Sub_Topic_ID" = $1 AND "Course_ID" = $2', [sub.Sub_Topic_ID, courseId]),
        db.query('SELECT "Assignment_ID", "Assignment_Link" FROM "Assignment" WHERE "Sub_Topic_ID" = $1', [sub.Sub_Topic_ID]),
        db.query('SELECT "Exam_ID", "Exam_Link" FROM "Exam" WHERE "Sub_Topic_ID" = $1', [sub.Sub_Topic_ID]),
      ]);
      return {
        subTopicId: sub.Sub_Topic_ID,
        title: sub.Title,
        videos: videos.rows.map(v => ({ title: v.Title, link: v.Link })),
        assignments: assignments.rows.map(a => ({ link: a.Assignment_Link })),
        exams: exams.rows.map(e => ({ link: e.Exam_Link })),
      };
    }));
    
    res.json({ 
      course: {
        id: course.Course_ID,
        title: course.Title,
        description: course.Description,
        price: course.Price,
        subtopics: subtopicsData
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Update course
app.put('/api/teacher/courses/:courseId', authenticateJWT, async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;
  const { title, description, price, subtopics } = req.body;
  

  
  if (!title || price === undefined || price === null || price === '' || !Array.isArray(subtopics)) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      received: { title, price, subtopics: Array.isArray(subtopics) }
    });
  }
  
  // Convert price to number if it's a string
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) {
    return res.status(400).json({ error: 'Price must be a valid number' });
  }
  
  try {
    // Check if user is the author of this course
    const courseCheck = await db.query(
      'SELECT "Course_ID" FROM "Course" WHERE "Course_ID" = $1 AND "Author_ID" = $2',
      [courseId, userId]
    );
    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized or course not found' });
    }
    
    // Update course basic info
    await db.query(
      'UPDATE "Course" SET "Title" = $1, "Description" = $2, "Price" = $3 WHERE "Course_ID" = $4',
      [title, description, numericPrice, courseId]
    );
    
    // Delete all existing subtopics and related data
    const subtopics = await db.query('SELECT "Sub_Topic_ID" FROM "Sub_Topic" WHERE "Course_ID" = $1', [courseId]);
    for (const row of subtopics.rows) {
      const subTopicId = row.Sub_Topic_ID;
      await db.query('DELETE FROM "Assignment" WHERE "Sub_Topic_ID" = $1', [subTopicId]);
      await db.query('DELETE FROM "Exam" WHERE "Sub_Topic_ID" = $1', [subTopicId]);
      await db.query('DELETE FROM "Video" WHERE "Sub_Topic_ID" = $1', [subTopicId]);
    }
    await db.query('DELETE FROM "Sub_Topic" WHERE "Course_ID" = $1', [courseId]);
    
    // Insert new subtopics, videos, assignments, exams
    for (const sub of req.body.subtopics) {
      const subtopicResult = await db.query(
        'INSERT INTO "Sub_Topic" ("Course_ID", "Teacher_ID", "Title", "Is_one_video") VALUES ($1, $2, $3, $4) RETURNING "Sub_Topic_ID"',
        [courseId, userId, sub.title, sub.videos.length === 1]
      );
      const subTopicId = subtopicResult.rows[0].Sub_Topic_ID;
      
      // Videos
      for (const v of sub.videos) {
        await db.query(
          'INSERT INTO "Video" ("Sub_Topic_ID", "Course_ID", "Title", "Link") VALUES ($1, $2, $3, $4)',
          [subTopicId, courseId, v.title, v.link]
        );
      }
      
      // Assignments
      for (const a of sub.assignments) {
        await db.query(
          'INSERT INTO "Assignment" ("Sub_Topic_ID", "Assignment_Link") VALUES ($1, $2)',
          [subTopicId, a.link]
        );
      }
      
      // Exams
      for (const e of sub.exams) {
        await db.query(
          'INSERT INTO "Exam" ("Sub_Topic_ID", "Exam_Link", "Total_Mark") VALUES ($1, $2, $3)',
          [subTopicId, e.link, 100]
        );
      }
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get notices for a course (teacher only)
app.get('/api/teacher/courses/:courseId/notices', authenticateJWT, async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;
  try {
    // Check if user is the author of this course
    const courseCheck = await db.query(
      'SELECT "Course_ID" FROM "Course" WHERE "Course_ID" = $1 AND "Author_ID" = $2',
      [courseId, userId]
    );
    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized or course not found' });
    }
    
    const result = await db.query(
      `SELECT n."Notice_ID", n."Title", n."Description", o."Title" as attachment_title, o."Other_ID" as attachment_id
       FROM "Notice" n
       LEFT JOIN "Other" o ON n."Attachment_ID" = o."Other_ID"
       WHERE n."Course_ID" = $1
       ORDER BY n."Notice_ID" DESC`,
      [courseId]
    );
    res.json({ notices: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Add a new notice
app.post('/api/teacher/courses/:courseId/notices', authenticateJWT, async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;
  const { title, description, attachmentId } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  
  try {
    // Check if user is the author of this course
    const courseCheck = await db.query(
      'SELECT "Course_ID" FROM "Course" WHERE "Course_ID" = $1 AND "Author_ID" = $2',
      [courseId, userId]
    );
    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized or course not found' });
    }
    
    // Insert new notice (Notice_ID will auto-increment)
    const result = await db.query(
      'INSERT INTO "Notice" ("Course_ID", "Title", "Description", "Attachment_ID") VALUES ($1, $2, $3, $4) RETURNING "Notice_ID"',
      [courseId, title, description, attachmentId || null]
    );
    
    res.status(201).json({ 
      success: true, 
      noticeId: result.rows[0].Notice_ID 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Delete a notice
app.delete('/api/teacher/notices/:noticeId', authenticateJWT, async (req, res) => {
  const { noticeId } = req.params;
  const userId = req.user.id;
  
  try {
    // Check if user is the author of the course that contains this notice
    const noticeCheck = await db.query(
      `SELECT n."Notice_ID" FROM "Notice" n
       JOIN "Course" c ON n."Course_ID" = c."Course_ID"
       WHERE n."Notice_ID" = $1 AND c."Author_ID" = $2`,
      [noticeId, userId]
    );
    if (noticeCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized or notice not found' });
    }
    
    // Delete the notice
    await db.query('DELETE FROM "Notice" WHERE "Notice_ID" = $1', [noticeId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/courses/:courseId', authenticateJWT, async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;
  try {
    // Manually delete all related rows to avoid foreign key constraint errors
    await db.query('DELETE FROM "Mark" WHERE "Course_ID" = $1', [courseId]);
    await db.query('DELETE FROM "Enroll" WHERE "Course_ID" = $1', [courseId]);
    await db.query('DELETE FROM "Notice" WHERE "Course_ID" = $1', [courseId]);
    await db.query('DELETE FROM "Course_Books" WHERE "Course_ID" = $1', [courseId]);
    await db.query('DELETE FROM "Course_Teachers" WHERE "Course_ID" = $1', [courseId]);
    // Delete assignments, exams, and videos for all subtopics
    const subtopics = await db.query('SELECT "Sub_Topic_ID" FROM "Sub_Topic" WHERE "Course_ID" = $1', [courseId]);
    for (const row of subtopics.rows) {
      const subTopicId = row.Sub_Topic_ID;
      await db.query('DELETE FROM "Assignment" WHERE "Sub_Topic_ID" = $1', [subTopicId]);
      await db.query('DELETE FROM "Exam" WHERE "Sub_Topic_ID" = $1', [subTopicId]);
      await db.query('DELETE FROM "Video" WHERE "Sub_Topic_ID" = $1', [subTopicId]);
    }
    await db.query('DELETE FROM "Sub_Topic" WHERE "Course_ID" = $1', [courseId]);
    // Only allow the author to delete their course
    const result = await db.query(
      'DELETE FROM "Course" WHERE "Course_ID" = $1 AND "Author_ID" = $2 RETURNING *',
      [courseId, userId]
    );
    if (result.rowCount === 0) {
      return res.status(403).json({ error: 'Not authorized or course not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server is up and listening on port ${port}`);
});
