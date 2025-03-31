import { pgTable, serial, text, integer, boolean, timestamp, json } from 'drizzle-orm/pg-core';

// Courses table - for different courses like Crypto Trading, Forex Trading, etc.
export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  image_url: text('image_url'),
  difficulty: text('difficulty', { enum: ['beginner', 'intermediate', 'advanced'] }).notNull(),
  category: text('category', { enum: ['crypto', 'forex', 'stocks', 'futures', 'general'] }).notNull(),
  estimated_duration: integer('estimated_duration').notNull(), // in minutes
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

// Modules table - a course consists of multiple modules
export const modules = pgTable('modules', {
  id: serial('id').primaryKey(),
  course_id: integer('course_id').notNull().references(() => courses.id),
  title: text('title').notNull(),
  order: integer('order').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

// Lessons table - a module consists of multiple lessons
export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  module_id: integer('module_id').notNull().references(() => modules.id),
  title: text('title').notNull(),
  content: text('content').notNull(), // HTML content
  order: integer('order').notNull(),
  video_url: text('video_url'),
  estimated_duration: integer('estimated_duration').notNull(), // in minutes
  has_quiz: boolean('has_quiz').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

// Quiz Questions table - for questions in lesson quizzes
export const quizQuestions = pgTable('quiz_questions', {
  id: serial('id').primaryKey(),
  lesson_id: integer('lesson_id').notNull().references(() => lessons.id),
  question: text('question').notNull(),
  options: json('options').notNull(), // JSON array of options
  correct_answer: integer('correct_answer').notNull(), // Index of correct option
  explanation: text('explanation').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

// User Progress table - track user's progress through courses
export const userCourseProgress = pgTable('user_course_progress', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  course_id: integer('course_id').notNull().references(() => courses.id),
  completed_lessons: json('completed_lessons').notNull().default([]), // Array of lesson IDs
  completed_quizzes: json('completed_quizzes').notNull().default([]), // Array of lesson IDs with completed quizzes
  completed_at: timestamp('completed_at'),
  certificate_issued: boolean('certificate_issued').notNull().default(false),
  certificate_id: integer('certificate_id'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

// Certificates table - issued to users who complete courses
export const certificates = pgTable('certificates', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  course_id: integer('course_id').notNull().references(() => courses.id),
  issued_at: timestamp('issued_at').notNull().defaultNow(),
  certificate_url: text('certificate_url').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});

// Learning Journal table - for user's learning journal entries
export const userLearningJournal = pgTable('user_learning_journal', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  course_id: integer('course_id').references(() => courses.id),
  lesson_id: integer('lesson_id').references(() => lessons.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  tags: json('tags'), // JSON array of tags
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow()
});