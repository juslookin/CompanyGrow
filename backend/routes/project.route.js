const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  addProject,
  modifyProject,
  modifyUsers,
  deleteProject,
  completeProject
} = require('../controllers/project.controller');

// GET /api/project/getAllProjects
router.get('/getAllProjects', getAllProjects);

// ADMIN Routes
// POST /api/project/addProject
router.post('/addProject', addProject);
// PUT /api/project/modifyProject/:id
router.put('/modifyProject/:id', modifyProject);
// PUT /api/project/modifyUsers/:id
router.put('/modifyUsers/:id', modifyUsers);
// DELETE /api/project/deleteProject/:id
router.delete('/deleteProject/:id', deleteProject);

// MANAGER Routes
// POST /api/project/completeProject/:id
router.post('/completeProject/:id',completeProject);

module.exports = router;