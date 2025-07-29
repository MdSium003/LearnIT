require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Import multer for file uploads
const multer = require('multer');

// Configure multer to store files in memory as buffers
const upload = multer({ storage: multer.memoryStorage() });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// --- AUTH MIDDLEWARE ---

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ msg: 'Token is not valid' });
    req.user = decoded.user;
    next();
  });
};

// NEW: Admin authentication middleware
const isAdmin = async (req, res, next) => {
    const userId = req.user.id;
    try {
        const userResult = await db.query('SELECT "IS_ADMIN" FROM "Person" WHERE "Person_ID" = $1', [userId]);
        if (userResult.rows.length === 0 || !userResult.rows[0].IS_ADMIN) {
            return res.status(403).json({ msg: 'Access denied. Administrator privileges required.' });
        }
        next();
    } catch (err) {
        console.error('Admin check failed:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};


// --- API ROUTES ---

// Get all courses (for the main page)
app.get('/api/v1/courses', async (req, res) => {
  try {
    // UPDATED: Joined with Person table to get instructor name and filter by status = 'accepted'
    const result = await db.query(
        `SELECT 
            c."Course_ID", 
            c."Title", 
            c."Description", 
            c."Price", 
            p."Name" as instructor,
            encode(c."Thumbnail", 'base64') as thumbnail_base64 
         FROM "Course" c
         JOIN "Person" p ON c."Author_ID" = p."Person_ID"
         WHERE c."Status" = 'accepted'`
    );
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

// NEW: Search for courses
app.get('/api/v1/courses/search', async (req, res) => {
  try {
    const { query } = req.query; // Get search term from query parameter

    if (!query) {
      return res.status(400).json({ msg: 'Search query is required' });
    }

    // SQL query to search in Title, Description, and Instructor Name (by joining Person table)
    // ILIKE is used for case-insensitive searching
    const result = await db.query(
      `SELECT 
         c."Course_ID", 
         c."Title", 
         c."Description", 
         c."Price", 
         p."Name" as instructor,
         encode(c."Thumbnail", 'base64') as thumbnail_base64 
       FROM "Course" c
       JOIN "Person" p ON c."Author_ID" = p."Person_ID"
       WHERE 
         (c."Title" ILIKE $1 OR 
         c."Description" ILIKE $1 OR
         p."Name" ILIKE $1) AND c."Status" = 'accepted'`,
      [`%${query}%`] // '%' wildcards match any sequence of characters
    );

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


// Endpoint to serve a course's thumbnail image
app.get('/api/courses/:courseId/thumbnail', async (req, res) => {
    const { courseId } = req.params;
    try {
        const result = await db.query('SELECT "Thumbnail" FROM "Course" WHERE "Course_ID" = $1', [courseId]);
        if (result.rows.length > 0 && result.rows[0].Thumbnail) {
            res.set('Content-Type', 'image/png'); // Assuming PNG, adjust if you allow other types
            res.send(result.rows[0].Thumbnail);
        } else {
            res.status(404).json({ error: 'Thumbnail not found' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});


// **UPDATED** Get a single course's full details, now includes trailer and thumbnail
app.get('/api/v1/courses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const courseResult = await db.query(
            `SELECT 
                c."Title", 
                c."Description", 
                c."Price", 
                p."Name" as "instructorName",
                v."Link" as "trailerLink",
                encode(c."Thumbnail", 'base64') as "thumbnail_base64"
             FROM "Course" c
             JOIN "Person" p ON c."Author_ID" = p."Person_ID"
             LEFT JOIN "Video" v ON c."Trailer_ID" = v."Video_ID"
             WHERE c."Course_ID" = $1 AND c."Status" = 'accepted'`,
            [id]
        );

        if (courseResult.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found or not approved' });
        }
        const course = courseResult.rows[0];

        const subtopicsResult = await db.query(
            'SELECT "Sub_Topic_ID", "Title" FROM "Sub_Topic" WHERE "Course_ID" = $1 ORDER BY "Sub_Topic_ID"',
            [id]
        );
        const subtopics = subtopicsResult.rows;

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
                exams: examsResult.rows.map((e, index) => `Quiz ${index + 1}`),
            };
        }));

        res.json({
            id: parseInt(id),
            title: course.Title,
            description: course.Description,
            price: course.Price,
            instructor: course.instructorName,
            trailerLink: course.trailerLink,
            thumbnail_base64: course.thumbnail_base64,
            structure: subtopicsData,
            rating: 4.7,
            reviews: (Math.random() * 2000).toFixed(0),
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});


// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, password, birthdate, district, city, country } = req.body;
  try {
    const userResult = await db.query('SELECT * FROM "Person" WHERE "Email" = $1', [email]);
    if (userResult.rows.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
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

// --- UPDATED LOGIN ROUTE ---
app.post('/api/v1/login', async (req, res) => {
  // Destructure email, password, and the new role field from the request body
  const { email, password, role } = req.body; 

  try {
    // Fetch user from the database. Note the addition of "IS_ADMIN" to the SELECT statement
    const userResult = await db.query('SELECT *, "IS_ADMIN" FROM "Person" WHERE "Email" = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ status: 'fail', msg: 'Invalid email or password.' });
    }

    const user = userResult.rows[0];

    // --- NEW: Admin Role Verification ---
    // If login is attempted as 'admin', check if the IS_ADMIN flag is true in the database
    if (role === 'admin' && user.IS_ADMIN !== true) {
        return res.status(403).json({ status: 'fail', msg: 'Access denied. Not an administrator.' });
    }
    // --- END: Admin Role Verification ---

    // Check if a password exists for the user before comparing
    if (!user.Password) {
        return res.status(401).json({ status: 'fail', msg: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.Password);
    
    if (!isMatch) {
      return res.status(401).json({ status: 'fail', msg: 'Invalid email or password.' });
    }
    
    const userId = user.Person_ID;
    const payload = { user: { id: userId } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;

      // Determine the role to send back in the response based on database flags
      let userRole = 'student'; // Default role
      if (user.IS_ADMIN === true) {
          userRole = 'admin';
      } else if (user.Is_Author === true) {
          userRole = 'teacher';
      }

      res.status(200).json({
        status: 'success',
        token: token,
        user: {
          id: user.Person_ID,
          name: user.Name,
          email: user.Email,
          isAdmin: user.IS_ADMIN, // Explicitly send admin status
          isAuthor: user.Is_Author,
        },
        role: userRole, // Send the determined role to the frontend
      });
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});


// --- NEW: ADMIN ROUTES ---

// GET courses for admin dashboard (by status)
app.get('/api/v1/admin/courses', authenticateJWT, isAdmin, async (req, res) => {
    const { status } = req.query; // e.g., 'pending' or 'accepted,declined'
    
    if (!status) {
        return res.status(400).json({ msg: 'Status query parameter is required.' });
    }

    const statusList = status.split(','); // Handle multiple statuses

    try {
        const result = await db.query(
            `SELECT 
                c."Course_ID", 
                c."Title", 
                c."Description", 
                c."Price", 
                c."Status",
                p."Name" as "instructorName"
             FROM "Course" c
             JOIN "Person" p ON c."Author_ID" = p."Person_ID"
             WHERE c."Status" = ANY($1::varchar[])
             ORDER BY c."Creation_Date" DESC`,
            [statusList]
        );
        
        res.status(200).json({
            status: 'success',
            data: {
                courses: result.rows,
            },
        });
    } catch (err) {
        console.error('Error fetching admin courses:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// NEW: GET a single course's full details for admin view
app.get('/api/v1/admin/courses/:courseId', authenticateJWT, isAdmin, async (req, res) => {
    const { courseId } = req.params;

    try {
        const courseResult = await db.query(
            `SELECT 
                c."Title", 
                c."Description", 
                c."Price", 
                p."Name" as "instructorName",
                v."Link" as "trailerLink",
                encode(c."Thumbnail", 'base64') as "thumbnail_base64"
             FROM "Course" c
             JOIN "Person" p ON c."Author_ID" = p."Person_ID"
             LEFT JOIN "Video" v ON c."Trailer_ID" = v."Video_ID"
             WHERE c."Course_ID" = $1`,
            [courseId]
        );

        if (courseResult.rows.length === 0) {
            return res.status(404).json({ msg: 'Course not found' });
        }
        const course = courseResult.rows[0];

        const subtopicsResult = await db.query(
            'SELECT "Sub_Topic_ID", "Title" FROM "Sub_Topic" WHERE "Course_ID" = $1 ORDER BY "Sub_Topic_ID"',
            [courseId]
        );
        
        const subtopicsData = await Promise.all(subtopicsResult.rows.map(async (sub) => {
            const videosResult = await db.query('SELECT "Title", "Link" FROM "Video" WHERE "Sub_Topic_ID" = $1 AND "Course_ID" = $2', [sub.Sub_Topic_ID, courseId]);
            const assignmentsResult = await db.query('SELECT "Assignment_Link" FROM "Assignment" WHERE "Sub_Topic_ID" = $1', [sub.Sub_Topic_ID]);
            const examsResult = await db.query('SELECT "Exam_Link" FROM "Exam" WHERE "Sub_Topic_ID" = $1', [sub.Sub_Topic_ID]);
            
            return {
                title: sub.Title,
                videos: videosResult.rows,
                assignments: assignmentsResult.rows,
                exams: examsResult.rows
            };
        }));

        res.status(200).json({
            status: 'success',
            data: {
                course: {
                    ...course,
                    subtopics: subtopicsData
                }
            }
        });

    } catch (err) {
        console.error('Error fetching course details for admin:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});


// PUT (update) course status
app.put('/api/v1/admin/courses/:courseId/status', authenticateJWT, isAdmin, async (req, res) => {
    const { courseId } = req.params;
    const { status } = req.body; // 'accepted' or 'declined'

    if (!status || !['accepted', 'declined'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status provided.' });
    }

    try {
        const result = await db.query(
            'UPDATE "Course" SET "Status" = $1 WHERE "Course_ID" = $2 RETURNING "Course_ID"',
            [status, courseId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Course not found.' });
        }

        res.status(200).json({
            status: 'success',
            msg: `Course status updated to ${status}.`,
        });
    } catch (err) {
        console.error('Error updating course status:', err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});


// --- PROFILE ROUTES ---
app.get('/api/profile', authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  try {
    const personResult = await db.query(
      `SELECT 
        p."Name" as name, p."Email" as email, p."Is_Author" as "isAuthor", p."Birth_Date" as "birthDate",
        p."Holding" as holding, p."Thana" as thana, p."City" as city, p."Postal_Code" as "postalCode",
        p."District" as district, p."Country" as country, t."Working" as working, t."Teaching_Start_Date" as "teachingStartDate"
      FROM "Person" p
      LEFT JOIN "Teacher" t ON p."Person_ID" = t."Teacher_ID"
      WHERE p."Person_ID" = $1`,
      [userId]
    );
    if (personResult.rows.length === 0) return res.status(404).json({ msg: 'User not found' });
    const userData = personResult.rows[0];
    const eduResult = await db.query(
      'SELECT "Degree" as degree, "Subject" as subject, "Passing_Year" as "passingYear", "Grade" as grade FROM "Education_Qualification" WHERE "Person_ID" = $1',
      [userId]
    );
    const userProfile = {
      name: userData.name, email: userData.email, isAuthor: userData.isAuthor,
      avatarUrl: `https://placehold.co/150x150/a78bfa/ffffff?text=${(userData.name || 'U').charAt(0)}`,
      personalInfo: { birthDate: userData.birthDate },
      address: {
        holding: userData.holding, thana: userData.thana, city: userData.city,
        postalCode: userData.postalCode, district: userData.district, country: userData.country,
      },
      professional: userData.working ? { working: userData.working, teachingStartDate: userData.teachingStartDate } : null,
      education: eduResult.rows.map(edu => ({
          ...edu, institution: 'University Name', 
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

app.put('/api/profile', authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const { name, address, professional, education } = req.body;
  if (!name || !address || !education) return res.status(400).json({ msg: 'Missing required profile data.' });
  try {
    await db.query('BEGIN');
    await db.query(
      `UPDATE "Person" SET "Name" = $1, "Holding" = $2, "Thana" = $3, "City" = $4, "Postal_Code" = $5, "District" = $6, "Country" = $7 WHERE "Person_ID" = $8`,
      [name, address.holding, address.thana, address.city, address.postalCode, address.district, address.country, userId]
    );
    if (professional && professional.working) {
      await db.query(
        `INSERT INTO "Teacher" ("Teacher_ID", "Working", "Teaching_Start_Date") VALUES ($1, $2, NOW()) ON CONFLICT ("Teacher_ID") DO UPDATE SET "Working" = $2`,
        [userId, professional.working]
      );
    }
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
    await db.query('COMMIT');
    res.json({ success: true, msg: 'Profile updated successfully.' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Profile update error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

app.post('/api/become-teacher', authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  try {
    await db.query(
      'INSERT INTO "Teacher" ("Teacher_ID", "Teaching_Start_Date") VALUES ($1, $2) ON CONFLICT ("Teacher_ID") DO NOTHING',
      [userId, new Date().toISOString().split('T')[0]]
    );
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
      `SELECT c.*, encode(c."Thumbnail", 'base64') as thumbnail_base64 FROM "Enroll" e
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
      'SELECT "Course_ID", "Title", "Description", encode("Thumbnail", \'base64\') as thumbnail_base64 FROM "Course" WHERE "Author_ID" = $1 ORDER BY "Title" ASC',
      [userId]
    );
    res.json({ courses: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// Create course route
app.post('/api/teacher/courses', authenticateJWT, upload.single('thumbnail'), async (req, res) => {
  const userId = req.user.id;
  const { title, description, price, trailerLink } = req.body;
  const subtopics = JSON.parse(req.body.subtopics);

  if (!title || !price || !req.file || !Array.isArray(subtopics)) {
    return res.status(400).json({ error: 'Missing required fields: title, price, thumbnail, and subtopics are required.' });
  }

  try {
    await db.query('BEGIN');

    const courseResult = await db.query(
      'INSERT INTO "Course" ("Author_ID", "Title", "Description", "Price", "Thumbnail", "Head_Teacher_ID", "Creation_Date") VALUES ($1, $2, $3, $4, $5, $1, NOW()) RETURNING "Course_ID"',
      [userId, title, description, price, req.file.buffer]
    );
    const courseId = courseResult.rows[0].Course_ID;

    // Automatically enroll the creator in their own course
    const tranxId = Math.floor(Math.random() * 1000000000);
    await db.query(
        'INSERT INTO "Enroll" ("Student_ID", "Course_ID", "Tranx_ID") VALUES ($1, $2, $3) ON CONFLICT ("Student_ID", "Course_ID") DO NOTHING',
        [userId, courseId, tranxId]
    );

    if (trailerLink) {
      const videoResult = await db.query(
        'INSERT INTO "Video" ("Course_ID", "Title", "Link") VALUES ($1, $2, $3) RETURNING "Video_ID"',
        [courseId, `${title} - Trailer`, trailerLink]
      );
      const trailerId = videoResult.rows[0].Video_ID;
      await db.query('UPDATE "Course" SET "Trailer_ID" = $1 WHERE "Course_ID" = $2', [trailerId, courseId]);
    }
    
    for (const sub of subtopics) {
      const subtopicResult = await db.query(
        'INSERT INTO "Sub_Topic" ("Course_ID", "Teacher_ID", "Title", "Is_one_video") VALUES ($1, $2, $3, $4) RETURNING "Sub_Topic_ID"',
        [courseId, userId, sub.title, Array.isArray(sub.videos) && sub.videos.length === 1]
      );
      const subTopicId = subtopicResult.rows[0].Sub_Topic_ID;
      if (Array.isArray(sub.videos)) {
          for (const v of sub.videos) {
            if(v.title && v.link) await db.query(
              'INSERT INTO "Video" ("Sub_Topic_ID", "Course_ID", "Title", "Link") VALUES ($1, $2, $3, $4)',
              [subTopicId, courseId, v.title, v.link]
            );
          }
      }
      if (Array.isArray(sub.assignments)) {
          for (const a of sub.assignments) {
            if(a.link) await db.query(
              'INSERT INTO "Assignment" ("Sub_Topic_ID", "Assignment_Link") VALUES ($1, $2)',
              [subTopicId, a.link]
            );
          }
      }
      if (Array.isArray(sub.exams)) {
          for (const e of sub.exams) {
            if(e.link) await db.query(
              'INSERT INTO "Exam" ("Sub_Topic_ID", "Exam_Link", "Total_Mark") VALUES ($1, $2, $3)',
              [subTopicId, e.link, 100]
            );
          }
      }
    }
    await db.query('COMMIT');
    res.status(201).json({ courseId });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/courses/:courseId/doing', authenticateJWT, async (req, res) => {
  const { courseId } = req.params;
  try {
    const subtopicsResult = await db.query(
      'SELECT "Sub_Topic_ID", "Title" FROM "Sub_Topic" WHERE "Course_ID" = $1 ORDER BY "Title" ASC',
      [courseId]
    );
    const subtopics = subtopicsResult.rows;
    const data = await Promise.all(subtopics.map(async (sub) => {
      const [videos, assignments, exams] = await Promise.all([
        db.query('SELECT "Video_ID", "Title", "Link" FROM "Video" WHERE "Sub_Topic_ID" = $1 AND "Course_ID" = $2', [sub.Sub_Topic_ID, courseId]),
        db.query('SELECT "Assignment_ID", "Assignment_Link" FROM "Assignment" WHERE "Sub_Topic_ID" = $1', [sub.Sub_Topic_ID]),
        db.query('SELECT "Exam_ID", "Exam_Link" FROM "Exam" WHERE "Sub_Topic_ID" = $1', [sub.Sub_Topic_ID]),
      ]);
      return {
        subTopicId: sub.Sub_Topic_ID, title: sub.Title,
        videos: videos.rows, assignments: assignments.rows, exams: exams.rows,
      };
    }));
    res.json({ subtopics: data });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// **UPDATED** Get notices for a course (student view)
app.get('/api/courses/:courseId/notices', authenticateJWT, async (req, res) => {
  const { courseId } = req.params;
  try {
    const result = await db.query(
      `SELECT 
         n."Notice_ID", 
         n."Title", 
         n."Description", 
         o."Title" as attachment_title,
         r."Link" as attachment_link
       FROM "Notice" n 
       LEFT JOIN "Other" o ON n."Attachment_ID" = o."Other_ID"
       LEFT JOIN "Resources" r ON o."Other_ID" = r."Resources_ID"
       WHERE n."Course_ID" = $1 ORDER BY n."Notice_ID" DESC`,
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
    const courseResult = await db.query(
      `SELECT c."Course_ID", c."Title", c."Description", c."Price", v."Link" as "trailerLink"
       FROM "Course" c
       LEFT JOIN "Video" v ON c."Trailer_ID" = v."Video_ID"
       WHERE c."Course_ID" = $1 AND c."Author_ID" = $2`,
      [courseId, userId]
    );
    if (courseResult.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized or course not found' });
    }
    const course = courseResult.rows[0];
    
    const subtopicsResult = await db.query(
      'SELECT "Sub_Topic_ID", "Title" FROM "Sub_Topic" WHERE "Course_ID" = $1 ORDER BY "Title" ASC',
      [courseId]
    );
    const subtopics = subtopicsResult.rows;
    
    const subtopicsData = await Promise.all(subtopics.map(async (sub) => {
      const [videos, assignments, exams] = await Promise.all([
        db.query('SELECT "Video_ID", "Title", "Link" FROM "Video" WHERE "Sub_Topic_ID" = $1 AND "Course_ID" = $2', [sub.Sub_Topic_ID, courseId]),
        db.query('SELECT "Assignment_ID", "Assignment_Link" FROM "Assignment" WHERE "Sub_Topic_ID" = $1', [sub.Sub_Topic_ID]),
        db.query('SELECT "Exam_ID", "Exam_Link" FROM "Exam" WHERE "Sub_Topic_ID" = $1', [sub.Sub_Topic_ID]),
      ]);
      return {
        subTopicId: sub.Sub_Topic_ID, title: sub.Title,
        videos: videos.rows.map(v => ({ title: v.Title, link: v.Link })),
        assignments: assignments.rows.map(a => ({ link: a.Assignment_Link })),
        exams: exams.rows.map(e => ({ link: e.Exam_Link })),
      };
    }));
    
    res.json({ 
      course: {
        id: course.Course_ID, title: course.Title, description: course.Description,
        price: course.Price, trailerLink: course.trailerLink,
        subtopics: subtopicsData
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// **FIXED** Update course route
app.put('/api/teacher/courses/:courseId', authenticateJWT, upload.single('thumbnail'), async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;
  const { title, description, price, trailerLink } = req.body;
  // **FIX:** Parse the subtopics string into a JavaScript array.
  const subtopics = JSON.parse(req.body.subtopics);
  
  if (!title || price === undefined || !Array.isArray(subtopics)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    await db.query('BEGIN');

    const courseCheck = await db.query(
      'SELECT "Trailer_ID" FROM "Course" WHERE "Course_ID" = $1 AND "Author_ID" = $2',
      [courseId, userId]
    );
    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized or course not found' });
    }
    const currentTrailerId = courseCheck.rows[0].Trailer_ID;
    
    await db.query(
      'UPDATE "Course" SET "Title" = $1, "Description" = $2, "Price" = $3 WHERE "Course_ID" = $4',
      [title, description, Number(price), courseId]
    );

    if (req.file) {
        await db.query('UPDATE "Course" SET "Thumbnail" = $1 WHERE "Course_ID" = $2', [req.file.buffer, courseId]);
    }

    if (trailerLink) {
        if (currentTrailerId) {
            await db.query('UPDATE "Video" SET "Link" = $1 WHERE "Video_ID" = $2', [trailerLink, currentTrailerId]);
        } else {
            const videoResult = await db.query(
              'INSERT INTO "Video" ("Course_ID", "Title", "Link") VALUES ($1, $2, $3) RETURNING "Video_ID"',
              [courseId, `${title} - Trailer`, trailerLink]
            );
            const newTrailerId = videoResult.rows[0].Video_ID;
            await db.query('UPDATE "Course" SET "Trailer_ID" = $1 WHERE "Course_ID" = $2', [newTrailerId, courseId]);
        }
    } else if (currentTrailerId) {
        await db.query('UPDATE "Course" SET "Trailer_ID" = NULL WHERE "Course_ID" = $1', [courseId]);
        await db.query('DELETE FROM "Video" WHERE "Video_ID" = $1', [currentTrailerId]);
    }
    
    const existingSubtopics = await db.query('SELECT "Sub_Topic_ID" FROM "Sub_Topic" WHERE "Course_ID" = $1', [courseId]);
    for (const row of existingSubtopics.rows) {
      const subTopicId = row.Sub_Topic_ID;
      await db.query('DELETE FROM "Assignment" WHERE "Sub_Topic_ID" = $1', [subTopicId]);
      await db.query('DELETE FROM "Exam" WHERE "Sub_Topic_ID" = $1', [subTopicId]);
      await db.query('DELETE FROM "Video" WHERE "Sub_Topic_ID" = $1', [subTopicId]);
    }
    await db.query('DELETE FROM "Sub_Topic" WHERE "Course_ID" = $1', [courseId]);
    
    // **FIX:** Use the parsed `subtopics` array for the loop.
    for (const sub of subtopics) {
      const subtopicResult = await db.query(
        'INSERT INTO "Sub_Topic" ("Course_ID", "Teacher_ID", "Title", "Is_one_video") VALUES ($1, $2, $3, $4) RETURNING "Sub_Topic_ID"',
        [courseId, userId, sub.title, Array.isArray(sub.videos) && sub.videos.length === 1]
      );
      const subTopicId = subtopicResult.rows[0].Sub_Topic_ID;
      if (Array.isArray(sub.videos)) {
          for (const v of sub.videos) {
            if(v.title && v.link) await db.query('INSERT INTO "Video" ("Sub_Topic_ID", "Course_ID", "Title", "Link") VALUES ($1, $2, $3, $4)', [subTopicId, courseId, v.title, v.link]);
          }
      }
      if (Array.isArray(sub.assignments)) {
          for (const a of sub.assignments) {
            if(a.link) await db.query('INSERT INTO "Assignment" ("Sub_Topic_ID", "Assignment_Link") VALUES ($1, $2)', [subTopicId, a.link]);
          }
      }
      if (Array.isArray(sub.exams)) {
          for (const e of sub.exams) {
            if(e.link) await db.query('INSERT INTO "Exam" ("Sub_Topic_ID", "Exam_Link", "Total_Mark") VALUES ($1, $2, $3)', [subTopicId, e.link, 100]);
          }
      }
    }
    
    await db.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// **UPDATED** Get notices for a course (teacher only)
app.get('/api/teacher/courses/:courseId/notices', authenticateJWT, async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;
  try {
    const courseCheck = await db.query('SELECT "Course_ID" FROM "Course" WHERE "Course_ID" = $1 AND "Author_ID" = $2', [courseId, userId]);
    if (courseCheck.rows.length === 0) return res.status(403).json({ error: 'Not authorized or course not found' });
    const result = await db.query(
      `SELECT 
         n."Notice_ID", 
         n."Title", 
         n."Description", 
         o."Title" as attachment_title,
         r."Link" as attachment_link
       FROM "Notice" n 
       LEFT JOIN "Other" o ON n."Attachment_ID" = o."Other_ID"
       LEFT JOIN "Resources" r ON o."Other_ID" = r."Resources_ID"
       WHERE n."Course_ID" = $1 ORDER BY n."Notice_ID" DESC`,
      [courseId]
    );
    res.json({ notices: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// **UPDATED** Add a new notice
app.post('/api/teacher/courses/:courseId/notices', authenticateJWT, async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;
  const { title, description, attachmentLink } = req.body; // Changed from attachmentId to attachmentLink
  
  if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
  }

  try {
    // Authorize user
    const courseCheck = await db.query('SELECT "Course_ID" FROM "Course" WHERE "Course_ID" = $1 AND "Author_ID" = $2', [courseId, userId]);
    if (courseCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Not authorized or course not found' });
    }

    let attachmentId = null;

    // If an attachment link is provided, create the resources in the database
    if (attachmentLink && attachmentLink.trim() !== '') {
      await db.query('BEGIN');
      try {
        // 1. Insert into Resources and get the new ID
        const resourceResult = await db.query(
          'INSERT INTO "Resources" ("Link") VALUES ($1) RETURNING "Resources_ID"',
          [attachmentLink.trim()]
        );
        const resourceId = resourceResult.rows[0].Resources_ID;

        // 2. Insert into "Other" using the new resource ID and the notice title
        await db.query(
          'INSERT INTO "Other" ("Other_ID", "Title") VALUES ($1, $2)',
          [resourceId, title]
        );
        
        attachmentId = resourceId;
        await db.query('COMMIT');
      } catch (transactionError) {
        await db.query('ROLLBACK');
        console.error('Transaction error creating attachment:', transactionError.message);
        return res.status(500).json({ error: 'Failed to create attachment resource.' });
      }
    }

    // 3. Insert the notice with the new attachment ID (or null if no link was provided)
    const result = await db.query(
      'INSERT INTO "Notice" ("Course_ID", "Title", "Description", "Attachment_ID") VALUES ($1, $2, $3, $4) RETURNING "Notice_ID"',
      [courseId, title, description, attachmentId]
    );

    res.status(201).json({ success: true, noticeId: result.rows[0].Notice_ID });
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
    const noticeCheck = await db.query(
      `SELECT n."Notice_ID" FROM "Notice" n JOIN "Course" c ON n."Course_ID" = c."Course_ID"
       WHERE n."Notice_ID" = $1 AND c."Author_ID" = $2`,
      [noticeId, userId]
    );
    if (noticeCheck.rows.length === 0) return res.status(403).json({ error: 'Not authorized or notice not found' });
    await db.query('DELETE FROM "Notice" WHERE "Notice_ID" = $1', [noticeId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- NEW: MARKS MANAGEMENT ROUTES ---

// GET marks data for a course
app.get('/api/teacher/courses/:courseId/marks', authenticateJWT, async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user.id;

    try {
        // 1. Authorize: Check if the current user is the author of the course
        const courseCheck = await db.query('SELECT "Title" FROM "Course" WHERE "Course_ID" = $1 AND "Author_ID" = $2', [courseId, userId]);
        if (courseCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Not authorized or course not found' });
        }
        const courseTitle = courseCheck.rows[0].Title;

        // 2. Get all sub-topics for the course
        const subTopicsResult = await db.query('SELECT "Sub_Topic_ID", "Title" FROM "Sub_Topic" WHERE "Course_ID" = $1 ORDER BY "Sub_Topic_ID"', [courseId]);
        const subTopics = subTopicsResult.rows.map(st => ({ sub_topic_id: st.Sub_Topic_ID, title: st.Title }));

        // 3. Get all enrolled students, excluding the author
        const studentsResult = await db.query(
            `SELECT p."Person_ID" as student_id, p."Name" as name, p."Email" as email
             FROM "Enroll" e
             JOIN "Person" p ON e."Student_ID" = p."Person_ID"
             WHERE e."Course_ID" = $1 AND e."Student_ID" != $2
             ORDER BY p."Name"`,
            [courseId, userId]
        );
        const students = studentsResult.rows;

        // 4. Get all existing marks for this course
        const marksResult = await db.query('SELECT "Student_ID", "Sub_Topic_ID", "Exam_Mark", "COMMENT" FROM "Mark" WHERE "Course_ID" = $1', [courseId]);
        const allMarks = marksResult.rows;

        // 5. Structure the data for the frontend
        const studentsWithMarks = students.map(student => {
            const studentMarks = allMarks
                .filter(mark => mark.Student_ID === student.student_id)
                .map(mark => ({
                    sub_topic_id: mark.Sub_Topic_ID,
                    exam_mark: mark.Exam_Mark,
                    comment: mark.COMMENT,
                }));
            return { ...student, marks: studentMarks };
        });

        res.json({
            courseTitle,
            subTopics,
            students: studentsWithMarks,
        });

    } catch (err) {
        console.error("Failed to fetch marks data:", err.message);
        res.status(500).json({ error: 'Server error while fetching marks data.' });
    }
});

// POST (save/update) marks for a course
app.post('/api/teacher/courses/:courseId/marks', authenticateJWT, async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user.id;
    const { marks } = req.body; // Expects an array of mark objects

    if (!Array.isArray(marks)) {
        return res.status(400).json({ error: 'Invalid data format. "marks" should be an array.' });
    }

    try {
        // 1. Authorize: Check if the current user is the author of the course
        const courseCheck = await db.query('SELECT "Course_ID" FROM "Course" WHERE "Course_ID" = $1 AND "Author_ID" = $2', [courseId, userId]);
        if (courseCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Not authorized or course not found' });
        }

        // 2. Use a transaction to save all marks
        await db.query('BEGIN');

        for (const markData of marks) {
            const { studentId, subTopicId, mark, comment } = markData;
            
            // Use ON CONFLICT to either INSERT a new mark or UPDATE an existing one
            await db.query(
                `INSERT INTO "Mark" ("Student_ID", "Course_ID", "Sub_Topic_ID", "Exam_Mark", "COMMENT")
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT ("Student_ID", "Course_ID", "Sub_Topic_ID")
                 DO UPDATE SET
                   "Exam_Mark" = EXCLUDED."Exam_Mark",
                   "COMMENT" = EXCLUDED."COMMENT"`,
                [studentId, courseId, subTopicId, mark, comment]
            );
        }

        await db.query('COMMIT');
        res.json({ success: true, message: 'Marks saved successfully.' });

    } catch (err) {
        await db.query('ROLLBACK');
        console.error("Failed to save marks:", err.message);
        res.status(500).json({ error: 'Server error while saving marks.' });
    }
});


// --- END OF MARKS MANAGEMENT ROUTES ---


app.delete('/api/courses/:courseId', authenticateJWT, async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;
  try {
    await db.query('BEGIN');
    await db.query('DELETE FROM "Mark" WHERE "Course_ID" = $1', [courseId]);
    await db.query('DELETE FROM "Enroll" WHERE "Course_ID" = $1', [courseId]);
    await db.query('DELETE FROM "Notice" WHERE "Course_ID" = $1', [courseId]);
    await db.query('DELETE FROM "Course_Books" WHERE "Course_ID" = $1', [courseId]);
    await db.query('DELETE FROM "Course_Teachers" WHERE "Course_ID" = $1', [courseId]);
    const subtopics = await db.query('SELECT "Sub_Topic_ID" FROM "Sub_Topic" WHERE "Course_ID" = $1', [courseId]);
    for (const row of subtopics.rows) {
      const subTopicId = row.Sub_Topic_ID;
      await db.query('DELETE FROM "Assignment" WHERE "Sub_Topic_ID" = $1', [subTopicId]);
      await db.query('DELETE FROM "Exam" WHERE "Sub_Topic_ID" = $1', [subTopicId]);
      await db.query('DELETE FROM "Video" WHERE "Sub_Topic_ID" = $1', [subTopicId]);
    }
    await db.query('DELETE FROM "Sub_Topic" WHERE "Course_ID" = $1', [courseId]);
    const result = await db.query(
      'DELETE FROM "Course" WHERE "Course_ID" = $1 AND "Author_ID" = $2 RETURNING *',
      [courseId, userId]
    );
    if (result.rowCount === 0) {
      await db.query('ROLLBACK');
      return res.status(403).json({ error: 'Not authorized or course not found' });
    }
    await db.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server is up and listening on port ${port}`);
});
