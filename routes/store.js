const express = require('express');
const router = express.Router();
const Store = require('../models/Store');

/**
 * @openapi
 * /api/store/add-store/{ownerID}:
 *   post:
 *     tags:
 *       - Store Controller
 *     summary: Add a store for a user
 *     parameters:
 *       - in: path
 *         name: ownerID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the owner to add the store for.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the store to add.
 *               location:
 *                 type: string
 *                 description: The location of the store to add.
 *     responses:
 *       201:
 *         description: Store added successfully
 *       400:
 *         description: Bad Request - Missing required fields or invalid data format.
 *       409:
 *         description: Conflict - A store with the same name already exists for this owner.
 *       500:
 *         description: Internal server error.
 */
router.route('/add-store/:ownerID').post(async (req, res) => {
    try {
        const { name, location } = req.body;
        const ownerID = req.params.ownerID;

        // Check if required fields are provided
        if (!name || !location) {
            return res.status(400).json({ message: "Name and location are required for the store" });
        }

        // Check if a store with the same name already exists for the owner
        const existingStore = await Store.findOne({ where: { ownerID, name } });
        if (existingStore) {
            return res.status(409).json({ message: "A store with the same name already exists for this owner" });
        }

        // Create store using Sequelize
        await Store.create({ name, location, ownerID });

        res.status(201).json({ message: "Store added successfully" });

    } catch (err) {
        console.error("Error adding store:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @openapi
 * /api/store/edit-store/{storeID}:
 *   put:
 *     tags:
 *       - Store Controller
 *     summary: Edit store details
 *     parameters:
 *       - in: path
 *         name: storeID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the store to edit.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name for the store.
 *               location:
 *                 type: string
 *                 description: The new location for the store.
 *     responses:
 *       201:
 *         description: Store updated successfully
 *       400:
 *         description: Bad Request - Missing required fields or invalid data format.
 *       404:
 *         description: Not Found - Store not found.
 *       409:
 *         description: Conflict - A store with the new name already exists for this owner.
 *       500:
 *         description: Internal server error.
 */
router.route('/edit-store/:storeID').put(async (req, res) => {
    try {
        const { name, location } = req.body;
        const storeID = req.params.storeID;

        // Fetch store from the database using storeID
        const store = await Store.findByPk(storeID);
        if (!store) {
            return res.status(404).json({ message: "Store not found" });
        }

        // Update store properties if provided in the request
        if (name) {
            // Check if a store with the new name already exists for the owner
            const existingStore = await Store.findOne({ where: { ownerID: store.ownerID, name } });
            if (existingStore && existingStore.storeID !== storeID) {
                return res.status(409).json({ message: "A store with the new name already exists for this owner" });
            }
            // Update store name
            await store.update({ name });
        }
        if (location) {
            // Update location
            await store.update({ location });
        }

        res.status(201).json({ message: "Store updated successfully" });

    } catch (err) {
        console.error("Error editing store:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @openapi
 * /api/store/get-stores/{ownerID}:
 *   get:
 *     tags:
 *       - Store Controller
 *     summary: Get stores for a specific owner
 *     parameters:
 *       - in: path
 *         name: ownerID
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the owner to retrieve stores for.
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Store'
 *       404:
 *         description: Not Found - Owner not found or no stores found for the owner.
 *       500:
 *         description: Internal server error.
 */
router.route('/get-stores/:ownerID').get(async (req, res) => {
    try {
        const ownerID = req.params.ownerID;

        // Fetch stores for the specified owner using Sequelize
        const stores = await Store.findAll({ where: { ownerID } });
        if (stores.length === 0) {
            return res.status(404).json({ message: "No stores found for the owner" });
        }

        res.status(200).json(stores);

    } catch (err) {
        console.error("Error getting stores:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @openapi
 * /api/store/delete-store/{ownerID}/{storeID}:
 *   delete:
 *     tags:
 *       - Store Controller
 *     summary: Delete a specific store for an owner
 *     parameters:
 *       - in: path
 *         name: ownerID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the owner who owns the store.
 *       - in: path
 *         name: storeID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the store to delete.
 *     responses:
 *       204:
 *         description: Store deleted successfully
 *       404:
 *         description: Not Found - Store not found or not owned by the owner.
 *       500:
 *         description: Internal server error.
 */
router.delete('/delete-store/:ownerID/:storeID', async (req, res) => {
    try {
        const ownerID = req.params.ownerID;
        const storeID = req.params.storeID;

        // Check if the store exists and is owned by the owner using Sequelize
        const store = await Store.findOne({ where: { storeID, ownerID } });
        if (!store) {
            return res.status(404).json({ message: "Store not found or not owned by the owner" });
        }

        // Delete the store using Sequelize
        await store.destroy();

        res.status(204).end(); // No content in response

    } catch (err) {
        console.error("Error deleting store:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
module.exports = router;