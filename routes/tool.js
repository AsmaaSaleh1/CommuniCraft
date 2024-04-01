const express = require('express');
const router = express.Router();
const Tool = require('../models/Tool');
/*
const loggingMiddleware = require('../middleware/logMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const errorHandlerMiddleware = require('../middleware/errHandMiddleware');
const validationMiddleware = require('../middleware/validMiddleware');
const rateLimitingMiddleware = require('../middleware/rateLimMiddleware');

router.use(loggingMiddleware);
router.use(authMiddleware);
router.use(validationMiddleware);
router.use(rateLimitingMiddleware);*/
/**
 * @openapi
 * /api/tool/add-tool/{userID}:
 *   post:
 *     tags:
 *       - Tool Controller
 *     summary: Add a tool for a user
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to add the tool for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toolName
 *               - quantity
 *             properties:
 *               toolName:
 *                 type: string
 *                 description: The name of the tool to add.
 *               quantity:
 *                 type: integer
 *                 description: The quantity of the tool to add.
 *     responses:
 *       201:
 *         description: Tool added successfully
 *       400:
 *         description: Bad Request - Missing required fields or invalid data format.
 *       409:
 *         description: Conflict - Tool with the same name already exists for this user.
 *       500:
 *         description: Internal server error.
 */

router.route('/add-tool/:userID').post(async (req, res) => {
    try {
        const { toolName, quantity, cost } = req.body;
        const userID = req.params.userID;
        // Check if required fields are provided
        if (!toolName || !quantity) {
            return res.status(400).json({ message: "Tool name and quantity are required" });
        }

        // Check if tool with the same name already exists for the user
        const existingTool = await Tool.findOne({ where: { userID, toolName } });
        if (existingTool) {
            return res.status(409).json({ message: "Tool with the same name already exists for this user" });
        }

        // Create tool using Sequelize
        await Tool.create({ toolName, quantity, cost, userID });

        res.status(201).json({ message: "Tool added successfully" });

    } catch (err) {
        console.error("Error adding tool:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});


/**
 * @openapi
 * /api/tool/edit-tool/{toolID}:
 *   put:
 *     tags:
 *       - Tool Controller
 *     summary: Edit tool details
 *     parameters:
 *       - in: path
 *         name: toolID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tool to edit.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               toolName:
 *                 type: string
 *                 description: The new name for the tool.
 *               quantity:
 *                 type: integer
 *                 description: The new quantity for the tool.
 *     responses:
 *       201:
 *         description: Tool updated successfully
 *       400:
 *         description: Bad Request - Missing required fields or invalid data format.
 *       404:
 *         description: Not Found - Tool not found.
 *       409:
 *         description: Conflict - Tool with the new name already exists for this user.
 *       500:
 *         description: Internal server error.
 */
router.route('/edit-tool/:toolID').put(async (req, res) => {
    try {
        const { toolName, quantity, cost } = req.body;
        const toolID = req.params.toolID;

        // Fetch tool from the database using toolID
        const tool = await Tool.findByPk(toolID);
        if (!tool) {
            return res.status(404).json({ message: "Tool not found" });
        }

        // Update tool properties if provided in the request
        if (toolName) {
            // Check if tool with the new name already exists for the user
            const existingTool = await Tool.findOne({ where: { userID: tool.userID, toolName } });
            if (existingTool && existingTool.toolID != toolID) {
                return res.status(409).json({ message: "Tool with the new name already exists for this user" });
            }
            // Update tool name
            await tool.update({ toolName });
        }
        if (quantity !== undefined) {
            // Update quantity
            await tool.update({ quantity });
        }
        if (cost !== undefined) {
            // Update cost
            await tool.update({ cost });
        }

        res.status(201).json({ message: "Tool updated successfully" });

    } catch (err) {
        console.error("Error editing tool:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @openapi
 * /api/tool/get-tools/{userID}:
 *   get:
 *     tags:
 *       - Tool Controller
 *     summary: Get tools for a specific user
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve tools for.
 *     responses:
 *       201:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   toolID:
 *                     type: integer
 *                     description: The ID of the tool.
 *                   toolName:
 *                     type: string
 *                     description: The name of the tool.
 *                   quantity:
 *                     type: integer
 *                     description: The quantity of the tool.
 *       404:
 *         description: Not Found - User not found or no tools found for the user.
 *       500:
 *         description: Internal server error.
 */
router.route('/get-tools/:userID').get(async (req, res) => {
    try {
        const userID = req.params.userID;

        // Fetch tools for the specified user using Sequelize
        const tools = await Tool.findAll({ where: { userID } });
        if (tools.length === 0) {
            return res.status(404).json({ message: "No tools found for the user" });
        }

        res.status(200).json(tools);

    } catch (err) {
        console.error("Error getting tools:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @openapi
 * /api/tool/delete-tool/{userID}/{toolID}:
 *   delete:
 *     tags:
 *       - Tool Controller
 *     summary: Delete a specific tool for a user
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user who owns the tool.
 *       - in: path
 *         name: toolID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the tool to delete.
 *     responses:
 *       204:
 *         description: Tool deleted successfully
 *       404:
 *         description: Not Found - Tool not found or not owned by the user.
 *       500:
 *         description: Internal server error.
 */
router.delete('/delete-tool/:userID/:toolID', async (req, res) => {
    try {
        const userID = req.params.userID;
        const toolID = req.params.toolID;

        // Check if the tool exists and is owned by the user using Sequelize
        const tool = await Tool.findOne({ where: { toolID, userID } });
        if (!tool) {
            return res.status(404).json({ message: "Tool not found or not owned by the user" });
        }

        await tool.destroy();

        res.status(204).end(); // No content in response

    } catch (err) {
        console.error("Error deleting tool:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
//router.use(errorHandlerMiddleware);

module.exports = router;