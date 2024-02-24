const express = require('express');
const router = express.Router();
const db = require('../modals/db');

/**
 * @openapi
 * /api/skill/add-skill/{userID}:
 *   post:
 *     tags:
 *       - Skill Controller
 *     summary: Add a skill for a user
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to add the skill for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - skillName
 *             properties:
 *               skillName:
 *                 type: string
 *                 description: The name of the skill to add.
 *     responses:
 *       201:
 *         description: Skill added successfully
 *       400:
 *         description: Bad Request - Missing required fields or invalid data format.
 *       409:
 *         description: Conflict - Skill with the same name already exists for this user.
 *       500:
 *         description: Internal server error.
 */
router.route('/add-skill/:userID').post(async (req, res) => {
    try {
        const { skillName } = req.body;
        const userID = req.params.userID;

        // Check if required fields are provided
        if (!skillName) {
            return res.status(400).json({ message: "Skill name is required" });
        }

        // Get database connection
        const connection = await db.getConnection();

        // Check if skill with the same name already exists for the user
        const [existingSkill] = await connection.execute('SELECT * FROM skill WHERE userID = ? AND skillName = ?', [userID, skillName]);
        if (existingSkill.length > 0) {
            return res.status(409).json({ message: "Skill with the same name already exists for this user" });
        }

        // Insert skill into the database
        await connection.execute('INSERT INTO skill (skillName, userID) VALUES (?, ?)', [skillName, userID]);

        res.status(201).json({ message: "Skill added successfully" });

    } catch (err) {
        console.error("Error adding skill:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @openapi
 * /api/skill/edit-skill/{skillID}:
 *   put:
 *     tags:
 *       - Skill Controller
 *     summary: Edit skill details
 *     parameters:
 *       - in: path
 *         name: skillID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the skill to edit.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skillName:
 *                 type: string
 *                 description: The new name for the skill.
 *     responses:
 *       201:
 *         description: Skill updated successfully
 *       400:
 *         description: Bad Request - Missing required fields or invalid data format.
 *       404:
 *         description: Not Found - Skill not found.
 *       409:
 *         description: Conflict - Skill with the new name already exists for this user.
 *       500:
 *         description: Internal server error.
 */
router.route('/edit-skill/:skillID').put(async (req, res) => {
    try {
        const { skillName } = req.body;
        const skillID = req.params.skillID;

        // Get database connection
        const connection = await db.getConnection();

        // Fetch skill from the database using skillID
        const [skill] = await connection.execute('SELECT * FROM skill WHERE skillID = ?', [skillID]);
        if (skill.length === 0) {
            return res.status(404).json({ message: "Skill not found" });
        }

        // Update skill name if provided in the request
        if (skillName) {
            // Check if skill with the new name already exists for the user
            const [existingSkill] = await connection.execute('SELECT * FROM skill WHERE userID = ? AND skillName = ?', [skill[0].userID, skillName]);
            if (existingSkill.length > 0 && existingSkill[0].skillID !== skillID) {
                return res.status(409).json({ message: "Skill with the new name already exists for this user" });
            }
            // Update skill name
            await connection.execute('UPDATE skill SET skillName = ? WHERE skillID = ?', [skillName, skillID]);
        }

        res.status(201).json({ message: "Skill updated successfully" });

    } catch (err) {
        console.error("Error editing skill:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
