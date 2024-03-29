const express = require('express');
const router = express.Router();
const ProjectTool = require('../models/project_tool');
const Tool = require('../models/tool');
const Project = require('../models/project');
/**
 * @openapi
 * /api/projects/{projectID}/tools/add/{toolID}:
 *   post:
 *     tags:
 *       - Project Tools
 *     summary: Add Tool to Project
 *     parameters:
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the project to add the tool to.
 *       - in: path
 *         name: toolID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the tool to add to the project.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantityUsed:
 *                 type: integer
 *                 minimum: 1
 *                 description: The quantity of the tool used in the project. Must be greater than zero.
 *     responses:
 *       200:
 *         description: Tool added to project successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the project tool entry.
 *                 projectID:
 *                   type: integer
 *                   description: The ID of the project.
 *                 toolID:
 *                   type: integer
 *                   description: The ID of the tool.
 *                 quantityUsed:
 *                   type: integer
 *                   description: The quantity of the tool used in the project.
 *       400:
 *         description: Bad Request - Invalid quantity or insufficient quantity of the tool available.
 *       404:
 *         description: Not Found - Project or tool not found.
 *       500:
 *         description: Internal Server Error - Something went wrong on the server side.
 */
// Add Tool to Project
router.post('/:projectID/tools/add/:toolID', async (req, res) => {
    try {
        const { projectID, toolID } = req.params;
        const { quantityUsed } = req.body;
        const project = await Project.findByPk(projectID);
        const tool = await Tool.findByPk(toolID);
        if (!project || !tool) {
            return res.status(404).json({ message: 'Project or tool not found' });
        }
        if (quantityUsed <= 0) {
            return res.status(400).json({ message: 'Quantity used must be greater than zero' });
        }
        if (quantityUsed > tool.quantity) {
            return res.status(400).json({ message: 'Insufficient quantity of the tool available' });
        }
        // Update the quantity in the Tool model
        const updatedQuantity = tool.quantity - quantityUsed;
        await tool.update({ quantity: updatedQuantity });
        // Create the ProjectTool entry
        const projectTool = await ProjectTool.create({
            projectID: projectID,
            toolID: toolID,
            quantityUsed: quantityUsed,
        });
        res.status(200).json(projectTool);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @openapi
 * /api/projects/{projectID}/tools/edit/{toolID}:
 *   put:
 *     tags:
 *       - Project Tools
 *     summary: Edit Tool Quantity in Project
 *     parameters:
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the project containing the tool.
 *       - in: path
 *         name: toolID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the tool to edit in the project.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantityUsed:
 *                 type: integer
 *                 minimum: 1
 *                 description: The new quantity of the tool used in the project.
 *     responses:
 *       200:
 *         description: Tool quantity updated in project successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the project tool entry.
 *                 projectID:
 *                   type: integer
 *                   description: The ID of the project.
 *                 toolID:
 *                   type: integer
 *                   description: The ID of the tool.
 *                 quantityUsed:
 *                   type: integer
 *                   description: The updated quantity of the tool used in the project.
 *       400:
 *         description: Bad Request - Invalid quantity or insufficient quantity of the tool available.
 *       404:
 *         description: Not Found - Project tool or tool not found.
 *       500:
 *         description: Internal Server Error - Something went wrong on the server side.
 */

// Edit Tool in Project API
router.put('/:projectID/tools/edit/:toolID', async (req, res) => {
    try {
        const { projectID, toolID } = req.params;
        const { quantityUsed } = req.body;

        // Find the project tool
        const projectTool = await ProjectTool.findOne({
            where: { projectID: projectID, toolID: toolID },
        });

        if (!projectTool) {
            return res.status(404).json({ message: 'Project tool not found' });
        }

        // Get the associated tool
        const tool = await Tool.findByPk(toolID);

        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }

        // Calculate the difference in quantity
        const quantityDifference = quantityUsed - projectTool.quantityUsed;

        // Check if the new quantity used is less than the previous one
        if (quantityDifference < 0) {
            const updatedQuantity = tool.quantity + Math.abs(quantityDifference);
            await tool.update({ quantity: updatedQuantity });
        } else if (quantityDifference > 0 && quantityDifference <= tool.quantity) {
            // Check if the new quantity used is more than the previous one but within the available quantity of the tool
            const updatedQuantity = tool.quantity - quantityDifference;
            await tool.update({ quantity: updatedQuantity });
        } else {
            return res.status(400).json({ message: 'Insufficient quantity of the tool available' });
        }

        // Update the quantity used in the project tool
        await projectTool.update({ quantityUsed: quantityUsed });

        res.status(200).json(projectTool);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
/**
 * @openapi
 * /api/projects/{projectID}/tools/delete/{toolID}:
 *   delete:
 *     tags:
 *       - Project Tools Controller
 *     summary: Delete Tool from Project
 *     description: Delete a tool from a specific project.
 *     parameters:
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the project from which the tool will be deleted.
 *       - in: path
 *         name: toolID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the tool to be deleted from the project.
 *     responses:
 *       '200':
 *         description: Successful operation. Tool deleted from the project.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message indicating successful deletion.
 *       '404':
 *         description: Not Found - Project tool not found.
 *       '500':
 *         description: Internal Server Error - Failed to delete project tool.
 */

// Delete Tool from Project API
router.delete('/:projectID/tools/delete/:toolID', async (req, res) => {
    try {
        const { projectID, toolID } = req.params;
        const projectTool = await ProjectTool.findOne({
            where: { projectID: projectID, toolID: toolID },
        });
        if (!projectTool) {
            return res.status(404).json({ message: 'Project tool not found' });
        }
        await projectTool.destroy();
        res.status(200).json({ message: 'Project tool deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @openapi
 * /api/projects/{projectID}/tools/get:
 *   get:
 *     tags:
 *       - Project Tools Controller
 *     summary: Get Tools in Project
 *     description: Retrieve tool details for a specific project, including tool name, cost, tool ID, user ID, and quantity used.
 *     parameters:
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the project to fetch tools for.
 *     responses:
 *       '200':
 *         description: Successful operation. Returns an array of tool objects.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   toolName:
 *                     type: string
 *                     description: The name of the tool.
 *                   cost:
 *                     type: integer
 *                     description: The cost of the tool.
 *                   toolID:
 *                     type: integer
 *                     description: The ID of the tool.
 *                   userID:
 *                     type: integer
 *                     description: The ID of the user associated with the tool.
 *                   quantityUsed:
 *                     type: integer
 *                     description: The quantity of the tool used in the project.
 *       '400':
 *         description: Bad Request - Missing project ID or invalid data format.
 *       '404':
 *         description: Not Found - Project not found or no tools found for the project.
 *       '500':
 *         description: Internal Server Error - Failed to fetch tool details.
 */

router.get('/:projectID/tools/get', async (req, res) => {
    try {
        const projectID = req.params.projectID;

        // Find all project tools for the specified project
        const projectTools = await ProjectTool.findAll({
            where: { projectID: projectID },
        });

        const toolDetails = await Promise.all(
            projectTools.map(async (pt) => {
                const tool = await Tool.findByPk(pt.toolID, {
                    attributes: ['toolName', 'cost', 'toolID', 'userID'],
                });
                return {
                    toolName: tool.toolName,
                    cost: tool.cost,
                    toolID: tool.toolID,
                    userID: tool.userID,
                    quantityUsed: pt.quantityUsed,
                };
            })
        );

        res.status(200).json(toolDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
