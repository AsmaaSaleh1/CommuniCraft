const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const Project = require('../models/Project');
/**
 * @openapi
 * /api/task/add-task/{userID}/{projectID}:
 *   post:
 *     tags:
 *       - Task Controller
 *     summary: Add a task for a user in a project
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to add the task for.
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the project to add the task to.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - Comments
 *               - status
 *             properties:
 *               description:
 *                 type: string
 *                 description: The description of the task.
 *               Comments:
 *                 type: string
 *                 description: Comments on the task.
 *               status:
 *                 type: string
 *                 enum: ['pending', 'in progress', 'completed']
 *                 description: The status of the task.
 *     responses:
 *       201:
 *         description: Task added successfully
 *       400:
 *         description: Bad Request - Missing required fields or invalid data format.
 *       404:
 *         description: Not Found - User or project not found.
 *       500:
 *         description: Internal server error.
 */

router.route('/add-task/:userID/:projectID').post(async (req, res) => {
    try {
        const { description, Comments, status } = req.body;
        const userID = req.params.userID;
        const projectID = req.params.projectID;
        // Check if required fields are provided
        if (!description || !Comments || !status) {
            return res.status(400).json({ message: "Description, Comments, and status are required" });
        }
        // Check if user and project exist
        const user = await User.findByPk(userID);
        const project = await Project.findByPk(projectID);
        if (!user || !project) {
            return res.status(404).json({ message: "User or project not found" });
        }
        // Create task using Sequelize
        await Task.create({ description,Comments, status, userID, projectID });
        res.status(201).json({ message: "Task added successfully" });
    } catch (err) {
        console.error("Error adding task:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});


/**
 * @openapi
 * /api/task/edit-task/{taskID}:
 *   put:
 *     tags:
 *       - Task Controller
 *     summary: Edit task details
 *     parameters:
 *       - in: path
 *         name: taskID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the task to edit.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: The new description for the task.
 *               Comments:
 *                 type: string
 *                 description: The new comments for the task.
 *               status:
 *                 type: string
 *                 enum: [pending, in progress, completed]
 *                 description: The new status for the task.
 *     responses:
 *       201:
 *         description: Task updated successfully
 *       400:
 *         description: Bad Request - Missing required fields or invalid data format.
 *       404:
 *         description: Not Found - Task not found.
 *       500:
 *         description: Internal server error.
 */
router.route('/edit-task/:taskID').put(async (req, res) => {
    try {
        const { description, Comments, status } = req.body;
        const taskID = req.params.taskID;

        // Fetch task from the database using taskID
        const task = await Task.findByPk(taskID);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Update task details if provided in the request
        if (description) task.description = description;
        if (Comments) task.Comments = Comments;
        if (status) task.status = status;
        // Save the updated task
        await task.save();
        res.status(201).json({ message: "Task updated successfully" });
    } catch (err) {
        console.error("Error editing task:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @openapi
 * /api/task/get-tasks/{userID}/{projectID}:
 *   get:
 *     tags:
 *       - Task Controller
 *     summary: Get tasks for a specific user and project
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to retrieve tasks for.
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the project to retrieve tasks for.
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       404:
 *         description: Not Found - User or project not found or no tasks found for the user and project.
 *       500:
 *         description: Internal server error.
 */
router.route('/get-tasks/:userID/:projectID').get(async (req, res) => {
    try {//projectID,userID
        const { userID, projectID } = req.params;
        // Fetch tasks for the specified user and project
        const tasks = await Task.findAll({ where: { userID, projectID } });
        if (tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found for the user and project" });
        }
        res.status(200).json(tasks);
    } catch (err) {
        console.error("Error getting tasks:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * @openapi
 * /api/task/get-taskuser/{userID}:
 *   get:
 *     tags:
 *       - Task Controller
 *     summary: Get tasks for a specific user
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to retrieve tasks for.
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       404:
 *         description: Not Found - User not found or no tasks found for the user.
 *       500:
 *         description: Internal server error.
 */
router.route('/get-taskuser/:userID').get(async (req, res) => {
    try {
        const { userID } = req.params;
        // Fetch tasks for the specified user
        const tasks = await Task.findAll({ where: { userID } });
        if (tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found for the user" });
        }
        res.status(200).json(tasks);
    } catch (err) {
        console.error("Error getting tasks:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * @openapi
 * /api/task/get-taskproject/{projectID}:
 *   get:
 *     tags:
 *       - Task Controller
 *     summary: Get tasks for a specific project
 *     parameters:
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the project to retrieve tasks for.
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       404:
 *         description: Not Found - Project not found or no tasks found for the project.
 *       500:
 *         description: Internal server error.
 */
router.route('/get-taskproject/:projectID').get(async (req, res) => {
    try {
        const { projectID } = req.params;
        // Fetch tasks for the specified project
        const tasks = await Task.findAll({ where: { projectID } });
        if (tasks.length === 0) {
            return res.status(404).json({ message: "No tasks found for the project" });
        }
        res.status(200).json(tasks);
    } catch (err) {
        console.error("Error getting tasks:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @openapi
 * /api/task/delete-task/{taskID}:
 *   delete:
 *     tags:
 *       - Task Controller
 *     summary: Delete a specific task
 *     parameters:
 *       - in: path
 *         name: taskID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the task to delete.
 *     responses:
 *       204:
 *         description: Task deleted successfully
 *       404:
 *         description: Not Found - Task not found.
 *       500:
 *         description: Internal server error.
 */
router.delete('/delete-task/:taskID', async (req, res) => {
    try {
        const taskID = req.params.taskID;
        // Check if the task exists
        const task = await Task.findByPk(taskID);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        // Delete the task
        await task.destroy();

        res.status(204).end(); // No content in response

    } catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
module.exports = router;
