CREATE SEQUENCE IF NOT EXISTS course_course_id_seq;

ALTER TABLE "Course" ALTER COLUMN "Course_ID" SET DEFAULT nextval('course_course_id_seq');


DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'video_video_id_seq') THEN
        CREATE SEQUENCE video_video_id_seq;
    END IF;
END$$;

ALTER TABLE "Video" ALTER COLUMN "Video_ID" SET DEFAULT nextval('video_video_id_seq');

UPDATE "Video" SET "Video_ID" = nextval('video_video_id_seq') WHERE "Video_ID" IS NULL;

SELECT setval('video_video_id_seq', (SELECT MAX("Video_ID") FROM "Video"));


DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'assignment_assignment_id_seq') THEN
        CREATE SEQUENCE assignment_assignment_id_seq;
    END IF;
END$$;

ALTER TABLE "Assignment" ALTER COLUMN "Assignment_ID" SET DEFAULT nextval('assignment_assignment_id_seq');

UPDATE "Assignment" SET "Assignment_ID" = nextval('assignment_assignment_id_seq') WHERE "Assignment_ID" IS NULL;

SELECT setval('assignment_assignment_id_seq', (SELECT MAX("Assignment_ID") FROM "Assignment"));


DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'exam_exam_id_seq') THEN
        CREATE SEQUENCE exam_exam_id_seq;
    END IF;
END$$;

ALTER TABLE "Exam" ALTER COLUMN "Exam_ID" SET DEFAULT nextval('exam_exam_id_seq');

UPDATE "Exam" SET "Exam_ID" = nextval('exam_exam_id_seq') WHERE "Exam_ID" IS NULL;

SELECT setval('exam_exam_id_seq', (SELECT MAX("Exam_ID") FROM "Exam"));