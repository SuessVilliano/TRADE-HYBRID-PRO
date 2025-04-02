import express from 'express';
import { eq, and, desc, sql, isNull, isNotNull } from 'drizzle-orm';
import { db } from '../db';
import {
  courses,
  modules,
  lessons,
  quizzes,
  userProgress,
  certificates,
  userLearningJournal,
  quizAttempts
} from '../../shared/schema';

const router = express.Router();

// Get all courses
router.get('/courses', async (req, res) => {
  try {
    const courseList = await db.select().from(courses).orderBy(courses.createdAt);
    res.json(courseList);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get a specific course with its modules and lessons
router.get('/courses/:id', async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    
    // Get the course
    const course = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
    
    if (!course || course.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Get the modules for this course
    const courseModules = await db
      .select()
      .from(modules)
      .where(eq(modules.courseId, courseId))
      .orderBy(modules.orderNum);
    
    // For each module, get the lessons
    const result = { ...course[0], modules: [] };
    
    for (const module of courseModules) {
      const moduleLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.moduleId, module.id))
        .orderBy(lessons.orderNum);
      
      // @ts-ignore - TypeScript doesn't understand we're creating a new object shape
      result.modules.push({ ...module, lessons: moduleLessons });
    }
    
    res.json(result);
  } catch (error) {
    console.error(`Error fetching course ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

// Get all lessons for a module
router.get('/modules/:id/lessons', async (req, res) => {
  try {
    const moduleId = parseInt(req.params.id);
    
    const lessonList = await db
      .select()
      .from(lessons)
      .where(eq(lessons.moduleId, moduleId))
      .orderBy(lessons.orderNum);
    
    res.json(lessonList);
  } catch (error) {
    console.error(`Error fetching lessons for module ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Get a specific lesson with its quiz questions
router.get('/lessons/:id', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);
    
    // Get the lesson
    const lesson = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1);
    
    if (!lesson || lesson.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    // Try to get the quiz for this lesson
    let quiz = null;
    try {
      const quizResult = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.lessonId, lessonId))
        .limit(1);
        
      if (quizResult && quizResult.length > 0) {
        quiz = quizResult[0];
      }
    } catch (error) {
      console.error(`Error fetching quiz for lesson ${lessonId}:`, error);
    }
    
    res.json({ ...lesson[0], quiz });
  } catch (error) {
    console.error(`Error fetching lesson ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch lesson details' });
  }
});

// Get user's progress for all courses
router.get('/progress', async (req, res) => {
  // TEMP MOCK ENDPOINT - Auth to be fixed later
  // if (!req.user) {
  //   return res.status(401).json({ error: 'Authentication required' });
  // }
  
  try {
    // Mock user ID for development
    const userId = "1"; // Using string as per schema definition
    
    const progress = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch learning progress' });
  }
});

// Mark a lesson as complete
router.post('/progress/lesson-complete', async (req, res) => {
  // TEMP MOCK ENDPOINT - Auth to be fixed later
  // if (!req.user) {
  //   return res.status(401).json({ error: 'Authentication required' });
  // }
  
  const { lessonId, courseId, moduleId } = req.body;
  
  if (!lessonId || !courseId) {
    return res.status(400).json({ error: 'Lesson ID and Course ID are required' });
  }
  
  try {
    // Mock user ID for development - using string as per schema
    const userId = "1";
    
    // Check if progress record exists for this course
    let progress = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.courseId, courseId)
        )
      )
      .limit(1);
    
    // Get total lessons count for this course to calculate percentage complete
    const totalLessonsResult = await db
      .select({ count: sql`count(*)` })
      .from(lessons)
      .innerJoin(modules, eq(lessons.moduleId, modules.id))
      .where(eq(modules.courseId, courseId));
    
    const totalLessons = parseInt(totalLessonsResult[0]?.count?.toString() || '0');
    
    if (!progress || progress.length === 0) {
      // Create new progress record
      await db.insert(userProgress).values({
        userId,
        courseId,
        moduleId: moduleId || null,
        lessonId,
        completed: false, // Not yet completed the whole course
        percentageComplete: totalLessons > 0 ? Math.round((1 / totalLessons) * 100) : 0, 
        lastAccessedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      // Update existing record
      // Get all completed lessons for this user and course
      const completedLessonsResult = await db
        .select({ lessonId: sql`DISTINCT ${lessons.id}` })
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.courseId, courseId),
            isNotNull(userProgress.lessonId)
          )
        );
      
      const completedLessonIds = completedLessonsResult.map(row => row.lessonId);
      
      // Check if this lesson is already completed
      if (!completedLessonIds.includes(lessonId)) {
        // Add new record for this specific lesson completion
        await db.insert(userProgress).values({
          userId,
          courseId,
          moduleId: moduleId || null,
          lessonId,
          completed: false,
          percentageComplete: totalLessons > 0 ? 
            Math.round(((completedLessonIds.length + 1) / totalLessons) * 100) : 0,
          lastAccessedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        // Update the main course progress record
        await db
          .update(userProgress)
          .set({
            percentageComplete: totalLessons > 0 ? 
              Math.round(((completedLessonIds.length + 1) / totalLessons) * 100) : 0,
            completed: (completedLessonIds.length + 1) >= totalLessons,
            lastAccessedAt: new Date(),
            updatedAt: new Date()
          })
          .where(
            and(
              eq(userProgress.userId, userId),
              eq(userProgress.courseId, courseId),
              isNull(userProgress.lessonId)
            )
          );
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    res.status(500).json({ error: 'Failed to update lesson progress' });
  }
});

// Submit a quiz
router.post('/quiz/submit', async (req, res) => {
  // TEMP MOCK ENDPOINT - Auth to be fixed later
  // if (!req.user) {
  //   return res.status(401).json({ error: 'Authentication required' });
  // }
  
  const { quizId, lessonId, answers } = req.body;
  
  if (!quizId || !answers) {
    return res.status(400).json({ error: 'Quiz ID and answers are required' });
  }
  
  try {
    // Mock user ID for development
    const userId = "1";
    
    // Get the quiz
    const quiz = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);
    
    if (!quiz || quiz.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    // Calculate score based on the questions in the quiz
    const questions = quiz[0].questions as any[] || [];
    
    if (questions.length === 0) {
      return res.status(404).json({ error: 'Quiz has no questions' });
    }
    
    let correctAnswers = 0;
    const totalQuestions = questions.length;
    
    for (const question of questions) {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    }
    
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= quiz[0].passingScore;
    
    // If passed, update progress and record quiz attempt
    if (passed) {
      // First, get the lesson to find the module ID if not provided
      let moduleId = null;
      if (lessonId) {
        const lesson = await db
          .select({ moduleId: lessons.moduleId })
          .from(lessons)
          .where(eq(lessons.id, lessonId))
          .limit(1);
          
        if (lesson && lesson.length > 0) {
          moduleId = lesson[0].moduleId;
        }
      }
      
      // Get module to find course ID
      let courseId = null;
      if (moduleId) {
        const module = await db
          .select({ courseId: modules.courseId })
          .from(modules)
          .where(eq(modules.id, moduleId))
          .limit(1);
          
        if (module && module.length > 0) {
          courseId = module[0].courseId;
        }
      }
      
      try {
        // Record the quiz attempt if quizAttempts table exists
        const result = await db.insert(quizAttempts).values({
          userId,
          quizId,
          score,
          passed,
          answers: answers,
          timeSpent: req.body.timeSpent || null,
          completedAt: new Date(),
          createdAt: new Date()
        });
      } catch (error) {
        console.error('Error recording quiz attempt:', error);
        // Continue if this fails - the quizAttempts table might not exist yet
      }
      
      // Update user progress if course ID is available
      if (courseId) {
        let progress = await db
          .select()
          .from(userProgress)
          .where(
            and(
              eq(userProgress.userId, userId),
              eq(userProgress.courseId, courseId)
            )
          )
          .limit(1);
        
        if (!progress || progress.length === 0) {
          // Create new progress record
          await db.insert(userProgress).values({
            userId,
            courseId,
            moduleId: moduleId || null,
            lessonId: lessonId || null,
            completed: false,
            percentageComplete: 0,
            lastAccessedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } else {
          // Update existing record
          await db
            .update(userProgress)
            .set({
              lastAccessedAt: new Date(),
              updatedAt: new Date()
            })
            .where(
              and(
                eq(userProgress.userId, userId),
                eq(userProgress.courseId, courseId)
              )
            );
        }
      }
    }
    
    res.json({
      passed,
      score,
      correctAnswers,
      totalQuestions,
      passingScore: quiz[0].passingScore
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to process quiz submission' });
  }
});

// Get user's certificates
router.get('/certificates', async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    // Use req.user.id as a string
    const userId = String(req.user.id);
    
    const userCertificates = await db
      .select()
      .from(certificates)
      .where(eq(certificates.userId, userId))
      .orderBy(desc(certificates.issueDate));
    
    res.json(userCertificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// Get user's learning journal entries
router.get('/journal', async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const entries = await db
      .select()
      .from(userLearningJournal)
      .where(eq(userLearningJournal.userId, req.user.id))
      .orderBy(desc(userLearningJournal.createdAt));
    
    res.json(entries);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// Create a new journal entry
router.post('/journal', async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const { title, content, course_id, lesson_id, tags } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  
  try {
    const result = await db.insert(userLearningJournal).values({
      userId: req.user.id,
      title: title,
      content: content,
      courseId: course_id || null,
      lessonId: lesson_id || null,
      tags: tags || null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Return the ID from the result or fallback
    const id = result.insertId ?? -1;
    res.status(201).json({ id, success: true });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

// Update a journal entry
router.put('/journal/:id', async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const entryId = parseInt(req.params.id);
  const { title, content, tags } = req.body;
  
  try {
    // Verify ownership
    const entry = await db
      .select()
      .from(userLearningJournal)
      .where(
        and(
          eq(userLearningJournal.id, entryId),
          eq(userLearningJournal.userId, req.user.id)
        )
      )
      .limit(1);
    
    if (!entry || entry.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found or unauthorized' });
    }
    
    // Update using a properly typed object
    await db
      .update(userLearningJournal)
      .set({
        title: title || entry[0].title,
        content: content || entry[0].content,
        tags: tags || entry[0].tags,
        updatedAt: new Date()
      })
      .where(eq(userLearningJournal.id, entryId));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
});

// Delete a journal entry
router.delete('/journal/:id', async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const entryId = parseInt(req.params.id);
  
  try {
    // Verify ownership
    const entry = await db
      .select()
      .from(userLearningJournal)
      .where(
        and(
          eq(userLearningJournal.id, entryId),
          eq(userLearningJournal.userId, req.user.id)
        )
      )
      .limit(1);
    
    if (!entry || entry.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found or unauthorized' });
    }
    
    await db
      .delete(userLearningJournal)
      .where(eq(userLearningJournal.id, entryId));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

export default router;