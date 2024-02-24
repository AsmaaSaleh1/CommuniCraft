const express = require('express');
const router = express.Router();
const db = require('../modals/db');
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
        const { materialName, quantity } = req.body;
        const userID = req.params.userID;

        // Check if required fields are provided
        if (!materialName || !quantity) {
            return res.status(400).json({ message: "Material name and quantity are required" });
        }

        // Get database connection
        const connection = await db.getConnection();

        // Check if material with the same name already exists for the user
        const [existingMaterial] = await connection.execute('SELECT * FROM material WHERE userID = ? AND materialName = ?', [userID, materialName]);
        if (existingMaterial.length > 0) {
            return res.status(409).json({ message: "Material with the same name already exists for this user" });
        }

        // Insert material into the database
        await connection.execute('INSERT INTO material (materialName, quantity, userID) VALUES (?, ?, ?)', [materialName, quantity, userID]);

        res.status(201).json({ message: "Material added successfully" });

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
 *       201:
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
        const { materialName, quantity } = req.body;
        const materialID = req.params.materialID;

        // Get database connection
        const connection = await db.getConnection();

        // Fetch material from the database using materialID
        const [material] = await connection.execute('SELECT * FROM material WHERE materialID = ?', [materialID]);
        if (material.length === 0) {
            return res.status(404).json({ message: "Material not found" });
        }

        // Update material properties if provided in the request
        if (materialName) {
            // Check if material with the new name already exists for the user
            const [existingMaterial] = await connection.execute('SELECT * FROM material WHERE userID = ? AND materialName = ?', [material[0].userID, materialName]);
            if (existingMaterial.length > 0 && existingMaterial[0].materialID !== materialID) {
                return res.status(409).json({ message: "Material with the new name already exists for this user" });
            }
            // Update material name
            await connection.execute('UPDATE material SET materialName = ? WHERE materialID = ?', [materialName, materialID]);
        }
        if (quantity !== undefined) {
            // Update quantity
            await connection.execute('UPDATE material SET quantity = ? WHERE materialID = ?', [quantity, materialID]);
        }

        res.status(201).json({ message: "Material updated successfully" });

    } catch (err) {
        console.error("Error editing material:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;