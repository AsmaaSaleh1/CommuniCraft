/*// routes/tasks.js
const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/TaskController');

router.post('/check-tasks/:projectId', async (req, res) => {
    const projectId = req.params.projectID;
    const result = await TaskController.checkTasksAndUpdateProject(projectId);
    if (result.success) {
        res.status(200).json({ message: result.message });
    } else {
        res.status(500).json({ message: result.message });
    }
});

module.exports = router;

*/
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');

/**
 * @openapi
 * /api/task/{projectID}/{username}:
 *   get:
 *     tags:
 *       - Task Controller
 *     summary: Get task information with comments for a user working on a project
 *     parameters:
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the project.
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the user.
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   taskID:
 *                     type: integer
 *                     description: The ID of the task.
 *                   description:
 *                     type: string
 *                     description: The description of the task.
 *                   comments:
 *                     type: string
 *                     description: Comments on the task.
 *                   status:
 *                     type: string
 *                     description: The status of the task.
 *                   userID:
 *                     type: integer
 *                     description: The ID of the user assigned to the task.
 *                   projectID:
 *                     type: integer
 *                     description: The ID of the project the task belongs to.
 *     security:
 *       - bearerAuth: []
 */
router.get('/task/:projectID/:username', async (req, res) => {
    try {
        const { projectID, username } = req.params;

        // Find the user by username
        const user = await User.findOne({ where: { userName: username } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find tasks for the specified project ID and assigned user ID
        const tasks = await Task.findAll({
            where: { projectID: projectID, userID: user.userID },
            attributes: ['taskID', 'description', 'comments', 'status', 'userID', 'projectID']
        });

        res.status(200).json(tasks);
    } catch (err) {
        console.error("Error getting task information:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;

