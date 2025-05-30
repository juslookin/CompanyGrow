const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  addCourse,
  deleteCourse,
  modifyCourse,
  enrollCourse,
  completeModule
} = require('../controllers/course.controller');

// GET /api/course/getAllCourses
router.get('/getAllCourses', getAllCourses);

// ADMIN Routes
// POST /api/course/addCourse
router.post('/addCourse', addCourse);
// DELETE api/course/deleteCourse/:id
router.delete('/deleteCourse/:id', deleteCourse);
// PUT api/course/modifyCourse/:id
router.put('/modifyCourse/:id', modifyCourse);


// EMPLOYEE Routes
// POST /api/course/enrollCourse/:userId/:courseId
router.post('/enrollCourse/:userId/:courseId', enrollCourse);
// POST /api/course/completeModule/:userId/:courseId/:contentId
router.post('/completeModule/:userId/:courseId/:contentId', completeModule);

module.exports = router;