const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
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
 * /api/material/add-material/{userID}:
 *   post:
 *     tags:
 *       - Material Controller
 *     summary: Add material for a user
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to add material for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - materialName
 *               - quantity
 *             properties:
 *               materialName:
 *                 type: string
 *                 description: The name of the material to add.
 *               quantity:
 *                 type: integer
 *                 description: The quantity of the material to add.
 *     responses:
 *       201:
 *         description: Material added successfully
 *       400:
 *         description: Bad Request - Missing required fields or invalid data format.
 *       409:
 *         description: Conflict - Material with the same name already exists for this user.
 *       500:
 *         description: Internal server error.
 */
router.route('/add-material/:userID').post(async (req, res) => {
    try {
        const { materialName, quantity, cost } = req.body;
        const userID = req.params.userID;

        // Check if required fields are provided
        if (!materialName || !quantity || !cost) {
            return res.status(400).json({ message: "Material name, quantity, and cost are required" });
        }

        // Create material
        const material = await Material.create({
            materialName,
            quantity,
            cost,
            userID
        });

        res.status(201).json({ message: "Material added successfully", material });

    } catch (err) {
        console.error("Error adding material:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @openapi
 * /api/material/edit-material/{materialID}:
 *   put:
 *     tags:
 *       - Material Controller
 *     summary: Edit material details
 *     parameters:
 *       - in: path
 *         name: materialID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the material to edit.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               materialName:
 *                 type: string
 *                 description: The new name for the material.
 *               quantity:
 *                 type: integer
 *                 description: The new quantity for the material.
 *     responses:
 *       200:
 *         description: Material updated successfully
 *       400:
 *         description: Bad Request - Missing required fields or invalid data format.
 *       404:
 *         description: Not Found - Material not found.
 *       409:
 *         description: Conflict - Material with the new name already exists for this user.
 *       500:
 *         description: Internal server error.
 */
router.route('/edit-material/:materialID').put(async (req, res) => {
    try {
        const { materialName, quantity, cost } = req.body;
        const materialID = req.params.materialID;

        // Find material by ID
        const material = await Material.findByPk(materialID);
        if (!material) {
            return res.status(404).json({ message: "Material not found" });
        }

        if (materialName) {
            // Check if material with the new name already exists for the user
            const existingMaterial = await Material.findOne({ where: { userID: material.userID, materialName } });
            if (existingMaterial && existingMaterial.materialID !== materialID) {
                return res.status(409).json({ message: "Material with the new name already exists for this user" });
            }
            // Update material name
            material.materialName = materialName;
        }
        if (quantity !== undefined) {
            // Update quantity
            material.quantity = quantity;
        }
        if (cost !== undefined) {
            // Update cost
            material.cost = cost;
        }

        // Save changes
        await material.save();

        res.status(200).json({ message: "Material updated successfully", material });

    } catch (err) {
        console.error("Error editing material:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});


/**
 * @openapi
 * /api/material/get-materials/{userID}:
 *   get:
 *     tags:
 *       - Material Controller
 *     summary: Get materials for a specific user
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve materials for.
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Material'
 *       404:
 *         description: Not Found - User not found or no materials found for the user.
 *       500:
 *         description: Internal server error.
 */
router.route('/get-materials/:userID').get(async (req, res) => {
    try {
        const userID = req.params.userID;

        // Find materials for the specified user
        const materials = await Material.findAll({ where: { userID } });
        if (materials.length === 0) {
            return res.status(404).json({ message: "No materials found for the user" });
        }

        res.status(200).json(materials);

    } catch (err) {
        console.error("Error getting materials:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @openapi
 * /api/material/delete-material/{userID}/{materialID}:
 *   delete:
 *     tags:
 *       - Material Controller
 *     summary: Delete a specific material for a user
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user who owns the material.
 *       - in: path
 *         name: materialID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the material to delete.
 *     responses:
 *       204:
 *         description: Material deleted successfully
 *       404:
 *         description: Not Found - Material not found or not owned by the user.
 *       500:
 *         description: Internal server error.
 */
router.delete('/delete-material/:userID/:materialID', async (req, res) => {
    try {
        const userID = req.params.userID;
        const materialID = req.params.materialID;

        // Find material by ID and user ID
        const material = await Material.findOne({ where: { materialID, userID } });
        if (!material) {
            return res.status(404).json({ message: "Material not found or not owned by the user" });
        }
        // Delete the material
        await material.destroy();

        res.status(204).end(); // No content in response

    } catch (err) {
        console.error("Error deleting material:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
//router.use(errorHandlerMiddleware);

module.exports = router;