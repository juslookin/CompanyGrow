// routes/user.route.js
const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getProfile,
  modifyProfile,
  getUserPerf,
  addUser,
  deleteUser,
  getUserCourses,
  getCourseStatus,
  getUserProjects
} = require('../controllers/user.controller');

// GET /api/user/getAllUsers
router.get('/getAllUsers', getAllUsers);
// GET /api/user/getProfile/:id
router.get('/getProfile/:id', getProfile);
// PUT /api/user/modifyProfile/:id
router.put('/modifyProfile/:id', modifyProfile);
// GET /api/user/getUserPerf/:id
router.get('/getUserPerf/:id', getUserPerf);

// ADMIN Routes
// POST /api/user/addUser
router.post('/addUser', addUser);
// DELETE /api/user/deleteUser/:id
router.delete('/deleteUser/:id', deleteUser);

// EMPLOYEE Routes
// GET /api/user/getUserCourses/:id
router.get('/getUserCourses/:id', getUserCourses);
// GET /api/user/getCourseStatus/:userId/:courseId
router.get('/getCourseStatus/:userId/:courseId', getCourseStatus);
// GET /api/user/getUserProjects/:id
router.get('/getUserProjects/:id', getUserProjects);

module.exports = router;