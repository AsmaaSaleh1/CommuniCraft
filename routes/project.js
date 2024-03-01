const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

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
        const { title, description, groupSize, difficulty, category, storeID, cost } = req.body;
        const creatorID = req.params.creatorID;

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
        await Project.create({ title, description, groupSize, difficulty, category, creatorID, storeID, cost });

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
module.exports = router;