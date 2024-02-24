const express = require('express');
const router = express.Router();
const db = require('../modals/db');
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
        const { toolName, quantity } = req.body;
        const userID = req.params.userID;

        // Check if required fields are provided
        if (!toolName || !quantity) {
            return res.status(400).json({ message: "Tool name and quantity are required" });
        }

        // Get database connection
        const connection = await db.getConnection();

        // Check if tool with the same name already exists for the user
        const [existingTool] = await connection.execute('SELECT * FROM tool WHERE userID = ? AND toolName = ?', [userID, toolName]);
        if (existingTool.length > 0) {
            return res.status(409).json({ message: "Tool with the same name already exists for this user" });
        }

        // Insert tool into the database
        await connection.execute('INSERT INTO tool (toolName, quantity, userID) VALUES (?, ?, ?)', [toolName, quantity, userID]);

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
        const { toolName, quantity } = req.body;
        const toolID = req.params.toolID;

        // Get database connection
        const connection = await db.getConnection();

        // Fetch tool from the database using toolID
        const [tool] = await connection.execute('SELECT * FROM tool WHERE toolID = ?', [toolID]);
        if (tool.length === 0) {
            return res.status(404).json({ message: "Tool not found" });
        }

        // Update tool properties if provided in the request
        if (toolName) {
            // Check if tool with the new name already exists for the user
            const [existingTool] = await connection.execute('SELECT * FROM tool WHERE userID = ? AND toolName = ?', [tool[0].userID, toolName]);
            if (existingTool.length > 0 && existingTool[0].toolID !== toolID) {
                return res.status(409).json({ message: "Tool with the new name already exists for this user" });
            }
            // Update tool name
            await connection.execute('UPDATE tool SET toolName = ? WHERE toolID = ?', [toolName, toolID]);
        }
        if (quantity !== undefined) {
            // Update quantity
            await connection.execute('UPDATE tool SET quantity = ? WHERE toolID = ?', [quantity, toolID]);
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

        // Get database connection
        const connection = await db.getConnection();

        // Fetch tools for the specified user
        const [tools] = await connection.execute('SELECT * FROM tool WHERE userID = ?', [userID]);
        if (tools.length === 0) {
            return res.status(404).json({ message: "No tools found for the user" });
        }

        res.status(201).json(tools);

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

        // Get database connection
        const connection = await db.getConnection();

        // Check if the tool exists and is owned by the user
        const [tool] = await connection.execute('SELECT * FROM tool WHERE toolID = ? AND userID = ?', [toolID, userID]);
        if (tool.length === 0) {
            return res.status(404).json({ message: "Tool not found or not owned by the user" });
        }

        // Delete the tool
        await connection.execute('DELETE FROM tool WHERE toolID = ?', [toolID]);

        res.status(204).end(); // No content in response

    } catch (err) {
        console.error("Error deleting tool:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
module.exports = router;