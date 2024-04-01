const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const { Op } = require('sequelize');

const loggingMiddleware = require('../middleware/logMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const errorHandlerMiddleware = require('../middleware/errHandMiddleware');
const validationMiddleware = require('../middleware/validMiddleware');
const rateLimitingMiddleware = require('../middleware/rateLimMiddleware');

router.use(loggingMiddleware);
router.use(authMiddleware);
router.use(validationMiddleware);
router.use(rateLimitingMiddleware);
/**
 * @openapi
 * /api/project/add-project/{creatorID}:
 *   post:
 *     tags:
 *       - Project Controller
 *     summary: Add a project for a user
 *     parameters:
 *       - in: path
 *         name: creatorID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user who created the project.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - groupSize
 *               - difficulty
 *               - category
 *               - creatorID
 *               - cost
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the project.
 *               description:
 *                 type: string
 *                 description: The description of the project.
 *               groupSize:
 *                 type: integer
 *                 description: The size of the group for the project.
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *                 description: The difficulty level of the project.
 *               category:
 *                 type: string
 *                 enum: [textile crafts, paper crafts, wood crafts, metal crafts, ceramics and pottery, glass crafts, jewelry making, mixed media crafts]
 *                 description: The category of the project.
 *               creatorID:
 *                 type: integer
 *                 description: The ID of the user who created the project.
 *               storeID:
 *                 type: integer
 *                 nullable: true
 *                 description: The ID of the store where materials for the project can be found. (Optional)
 *               cost:
 *                 type: integer
 *                 description: The cost of the project.
 *     responses:
 *       201:
 *         description: Project added successfully
 *       400:
 *         description: Bad Request - Missing required fields or invalid data format.
 *       409:
 *         description: Conflict - Project with the same title already exists for this user.
 *       500:
 *         description: Internal server error.
 */
router.route('/add-project/:creatorID').post(async (req, res) => {
    try {
        const { title, description, groupSize, difficulty, category, cost,isCompleted } = req.body;
        const creatorID = req.params.creatorID;
        // Check if storeID is provided, if not, consider it as null
        const projectData = {
            title,
            description,
            groupSize,
            difficulty,
            category,
            creatorID,
           // storeID: storeID !== undefined ? storeID : null, // Set storeID to null if not provided
            cost,
            isCompleted
        };
        // Check if required fields are provided
        if (!title || !description || !groupSize || !difficulty || !category || !creatorID || !cost) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        // Check if project with the same title already exists for the user
        const existingProject = await Project.findOne({ where: { creatorID, title } });
        if (existingProject) {
            return res.status(409).json({ message: "Project with the same title already exists for this user" });
        }

        // Create project using Sequelize
        await Project.create(projectData);

        res.status(201).json({ message: "Project added successfully" });

    } catch (err) {
        console.error("Error adding project:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @openapi
 * /api/project/edit-project/{projectID}:
 *   put:
 *     tags:
 *       - Project Controller
 *     summary: Edit project details
 *     parameters:
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project to edit.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The new title for the project.
 *               description:
 *                 type: string
 *                 description: The new description for the project.
 *               groupSize:
 *                 type: integer
 *                 description: The new group size for the project.
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *                 description: The new difficulty level for the project.
 *               category:
 *                 type: string
 *                 enum: [textile crafts, paper crafts, wood crafts, metal crafts, ceramics and pottery, glass crafts, jewelry making, mixed media crafts]
 *                 description: The new category for the project.
 *               cost:
 *                 type: integer
 *                 description: The new cost for the project.
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Bad Request - Missing required fields or invalid data format.
 *       404:
 *         description: Not Found - Project not found.
 *       409:
 *         description: Conflict - Another project with the same title already exists.
 *       500:
 *         description: Internal server error.
 */
router.put('/edit-project/:projectID', async (req, res) => {
    try {
        const { title, description, groupSize, difficulty, category, cost } = req.body;
        const projectID = req.params.projectID;

        // Fetch project from the database using projectID
        const project = await Project.findByPk(projectID);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Update project properties if provided in the request
        if (title) {
            // Check if another project with the same title already exists
            const existingProject = await Project.findOne({ where: { title } });
            if (existingProject && (existingProject.projectID != projectID)) {
                return res.status(409).json({ message: "Another project with the same title already exists" });
            }
            // Update project title
            await project.update({ title });
        }
        if (description) {
            // Update project description
            await project.update({ description });
        }
        if (groupSize !== undefined) {
            // Update group size
            await project.update({ groupSize });
        }
        if (difficulty) {
            // Update difficulty
            await project.update({ difficulty });
        }
        if (category) {
            // Update category
            await project.update({ category });
        }
        if (cost !== undefined) {
            // Update cost
            await project.update({ cost });
        }

        res.status(200).json({ message: "Project updated successfully" });

    } catch (err) {
        console.error("Error editing project:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @openapi
 * /api/project/get-project/{projectID}:
 *   get:
 *     tags:
 *       - Project Controller
 *     summary: Get specific project details
 *     parameters:
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project to retrieve details for.
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Not Found - Project not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/get-project/:projectID', async (req, res) => {
    try {//TO get specific project information
        const projectID = req.params.projectID;

        // Fetch project details from the database using projectID
        const project = await Project.findByPk(projectID);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.status(200).json(project);

    } catch (err) {
        console.error("Error getting project:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * @openapi
 * /api/project/get-projects/{creatorID}:
 *   get:
 *     tags:
 *       - Project Controller
 *     summary: Get projects by creator ID
 *     parameters:
 *       - in: path
 *         name: creatorID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the creator to retrieve projects for.
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       404:
 *         description: Not Found - No projects found for the specified creator.
 *       500:
 *         description: Internal server error.
 */
router.get('/get-projects/:creatorID', async (req, res) => {
    try {
        const creatorID = req.params.creatorID;

        // Fetch projects for the specified creator using Sequelize
        const projects = await Project.findAll({ where: { creatorID } });
        if (projects.length === 0) {
            return res.status(404).json({ message: "No projects found for the specified creator" });
        }

        res.status(200).json(projects);

    } catch (err) {
        console.error("Error getting projects:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
/**
 * @openapi
 * /api/project/delete-project/{creatorID}/{projectID}:
 *   delete:
 *     tags:
 *       - Project Controller
 *     summary: Delete a specific project for a creator
 *     parameters:
 *       - in: path
 *         name: creatorID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the creator who owns the project.
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the project to delete.
 *     responses:
 *       204:
 *         description: Project deleted successfully
 *       404:
 *         description: Not Found - Project not found or not owned by the specified creator.
 *       500:
 *         description: Internal server error.
 */
router.delete('/delete-project/:creatorID/:projectID', async (req, res) => {
    try {
        const creatorID = req.params.creatorID;
        const projectID = req.params.projectID;

        // Check if the project exists and is owned by the specified creator using Sequelize
        const project = await Project.findOne({ where: { projectID, creatorID } });
        if (!project) {
            return res.status(404).json({ message: "Project not found or not owned by the specified creator" });
        }

        // Delete the project using Sequelize
        await project.destroy();

        res.status(204).end(); // No content in response

    } catch (err) {
        console.error("Error deleting project:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});


/**
 * @openapi
 * /projectuser/{projectID}/creater/{userID}:
 *   get:
 *     tags:
 *       - Project Controller
 *     summary: Get all workers in a project owned by the specified user
 *     parameters:
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the project.
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user who owns the project.
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   task:
 *                     type: object
 *                     properties:
 *                       taskID:
 *                         type: integer
 *                         description: The ID of the task.
 *                       description:
 *                         type: string
 *                         description: The description of the task.
 *                       comments:
 *                         type: string
 *                         description: Comments related to the task.
 *                       status:
 *                         type: string
 *                         description: The status of the task.
 *                   user:
 *                     type: object
 *                     properties:
 *                       userID:
 *                         type: integer
 *                         description: The ID of the user.
 *                       userName:
 *                         type: string
 *                         description: The username of the user.
 *                       email:
 *                         type: string
 *                         description: The email of the user.
 *                       location:
 *                         type: string
 *                         description: The location of the user.
 *       '404':
 *         description: Project not found or user is not the creator of the project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the specified project was not found or the user is not the creator of the project.
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating an internal server error.
 */
//project owner can see all worker in his/her project
router.get('/projectuser/:projectID/creater/:userID', async (req, res) => {
    try {
        const projectID = parseInt(req.params.projectID, 10); // Parse projectID as integer
        const userID = parseInt(req.params.userID, 10); // Parse userID as integer

        const assignedUser = await Project.findOne({
            where: { projectID, creatorID: userID }
        });
        if (!assignedUser) {
            return res.status(404).json({ message: 'You are not the creator of the project or project not found' });
        }
        // Find tasks for the specified project
        const tasks = await Task.findAll({
            where: { projectID },
            attributes: ['taskID', 'userID', 'description', 'comments', 'status']
        });

        // Extract user IDs from the tasks
        const userIDs = tasks.map(task => task.userID);

        // Find user details for the extracted user IDs
        const users = await User.findAll({
            where: { userID: { [Op.in]: userIDs } },
            attributes: ['userID', 'userName', 'email', 'location']
        });

        // Map user details to tasks
        const usersTasksInfo = tasks.map(task => {
            const user = users.find(u => u.userID === task.userID);
            return {
                task: {
                    taskID: task.taskID,
                    description: task.description,
                    comments: task.comments,
                    status: task.status
                },
                user: {
                    userID: user.userID,
                    userName: user.userName,
                    email: user.email,
                    location: user.location
                }
            };
        });

        return res.status(200).json(usersTasksInfo);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


/**
 * @openapi
 * /userinproject/{projectID}/users/{userID}:
 *   get:
 *     tags:
 *       - Project Controller
 *     summary: Get users with tasks in the same project as the specified user
 *     parameters:
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the project.
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to check for tasks in the project.
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userID:
 *                     type: integer
 *                     description: The ID of the user.
 *                   userName:
 *                     type: string
 *                     description: The username of the user.
 *                   email:
 *                     type: string
 *                     description: The email of the user.
 *       '403':
 *         description: You are not authorized to access this information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating unauthorized access.
 *       '404':
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the specified project was not found.
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating an internal server error.
 */
//worker can see some information about other workers with them in same project to easly communicate
router.get('/userinproject/:projectID/users/:userID', async (req, res) => {
    try {
        const projectID = parseInt(req.params.projectID, 10); // Parse projectID as integer
        const userID = parseInt(req.params.userID, 10); // Parse userID as integer

        // Check if the specified projectID exists
        const projectExists = await Project.findOne({
            where: { projectID }
        });

        if (!projectExists) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if the specified user has a task in the specified project
        const userHasTask = await Task.findOne({
            where: { projectID, userID }
        });

        if (!userHasTask) {
            return res.status(403).json({ message: 'You are not authorized to access this information' });
        }

        // Find tasks for the specified project
        const tasks = await Task.findAll({
            where: { projectID }
        });
        // Extract user IDs from the tasks
        const userIDs = tasks.map(task => task.userID);
        // Find user details for the extracted user IDs
        const users = await User.findAll({
            where: { userID: { [Op.in]: userIDs } },
            attributes: ['userID', 'userName', 'email', 'location']
        });
        // Map user details to tasks
        const usersTasksInfo = tasks.map(task => {
            const user = users.find(u => u.userID === task.userID);
            return {
                user: {
                    userName: user.userName,
                    email: user.email,
                    location: user.location
                },
                task: {
                    description: task.description,
                    comments: task.comments,
                    status: task.status
                }
            };
        });

        return res.status(200).json(usersTasksInfo);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @openapi
 * /api/project/update-status/{projectID}:
 *   put:
 *     tags:
 *       - Project Controller
 *     summary: Update project status based on task completion
 *     parameters:
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the project to update.
 *     responses:
 *       200:
 *         description: Project status updated successfully
 *       404:
 *         description: Not Found - Project not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/update-status/:projectID', async (req, res) => {
    try {
        const projectID = req.params.projectID;
        // Find project by ID
        const project = await Project.findByPk(projectID);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Fetch tasks for the project
        const tasks = await Task.findAll({ where: { projectID } });
        // Update project status based on task completion
        project.isCompleted = tasks.every(task => task.status === 'completed');
        await project.save();
        res.status(200).json({ message: "Project status updated successfully" });
    } catch (err) {
        console.error("Error updating project status:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @openapi
 * /api/project/completed-projects:
 *   get:
 *     tags:
 *       - Project Controller
 *     summary: Get all completed projects
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       500:
 *         description: Internal server error.
 */
router.get('/completed-projects', async (req, res) => {
    try {
        // Find all projects where isCompleted is true (completed projects)
        const completedProjects = await Project.findAll({ where: { isCompleted: true } });
        res.status(200).json(completedProjects);
    } catch (err) {
        console.error("Error getting completed projects:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.use(errorHandlerMiddleware);

module.exports = router;