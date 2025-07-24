CREATE OR REPLACE FUNCTION delete_related_course_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete course-related subtopics
    DELETE FROM "Sub_Topic" WHERE "Course_ID" = OLD."Course_ID";
    
    -- Delete course-book associations
    DELETE FROM "Course_Books" WHERE "Course_ID" = OLD."Course_ID";
    
    -- Delete course-teacher associations
    DELETE FROM "Course_Teachers" WHERE "Course_ID" = OLD."Course_ID";
    
    -- Delete course enrollments
    DELETE FROM "Enroll" WHERE "Course_ID" = OLD."Course_ID";
    
    -- Delete course-related notices (added this line)
    DELETE FROM "Notice" WHERE "Course_ID" = OLD."Course_ID";
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;



-- Trigger declaration remains the same
CREATE OR REPLACE TRIGGER DeleteAllCourseDependencies
BEFORE DELETE ON "Course"
FOR EACH ROW
EXECUTE FUNCTION delete_related_course_data();


CREATE OR REPLACE FUNCTION delete_related_subtopic_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete related videos
    DELETE FROM "Video" WHERE "Sub_Topic_ID" = OLD."Sub_Topic_ID";
    
    -- Delete related assignments
    DELETE FROM "Assignment" WHERE "Sub_Topic_ID" = OLD."Sub_Topic_ID";
    
    -- Delete related exams
    DELETE FROM "Exam" WHERE "Sub_Topic_ID" = OLD."Sub_Topic_ID";
    
    -- Delete related marks
    DELETE FROM "Mark" WHERE "Sub_Topic_ID" = OLD."Sub_Topic_ID";
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER DeleteAllSubtopicDependencies
BEFORE DELETE ON "Sub_Topic"
FOR EACH ROW
EXECUTE FUNCTION delete_related_subtopic_data();