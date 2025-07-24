
DROP TABLE IF EXISTS "Notice" CASCADE;


CREATE TABLE "Notice" (
  "Notice_ID" SERIAL PRIMARY KEY,
  "Course_ID" INTEGER,
  "Title" VARCHAR(255) NOT NULL,
  "Description" TEXT,
  "Attachment_ID" INTEGER UNIQUE,
  FOREIGN KEY ("Course_ID") REFERENCES "Course" ("Course_ID"),
  FOREIGN KEY ("Attachment_ID") REFERENCES "Other" ("Other_ID")
); 