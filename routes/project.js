const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const { Op } = require('sequelize');

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
            if (existingProject && existingProject.projectID !== projectID) {
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
 * /api/project/{projectID}/users/{userID}:
 *   get:
 *     tags:
 *       - Project Controller
 *     summary: Get usernames and emails of users working on a specific project
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
 *         description: The ID of the user who must work on the project.
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
 *                   userID:
 *                     type: integer
 *                     description: The ID of the user.
 *                   userName:
 *                     type: string
 *                     description: The username of the user.
 *                   email:
 *                     type: string
 *                     description: The email of the user.
 *     security:
 *       - bearerAuth: []
 */
router.get('/project/:projectID/users/:userID', async (req, res) => {
    try {
        const projectID = parseInt(req.params.projectID, 10); // Parse projectID as integer
        const userID = parseInt(req.params.userID, 10); // Parse userID as integer

        // Check if the specified user ID is assigned to the specified project
        const project = await Project.findOne({
            where: { projectID, creatorID: userID }
        });

        if (!project) {
            return res.status(404).json({ message: 'User is not assigned to this project' });
        }

        // Find all users working on the specified project except the specified user ID
        const users = await User.findAll({
            include: [
                {
                    model: Task,
                    where: { projectID },
                    attributes: [],
                    required: true
                }
            ],
            attributes: ['userID', 'userName', 'email'],
            where: {
                userID: { [Op.ne]: userID } // Exclude the specified user ID using Op.ne
            },
            raw: true
        });

        return res.status(200).json(users);
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

module.exports = router;