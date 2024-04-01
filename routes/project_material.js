const express = require('express');
const router = express.Router();
const ProjectMaterial = require('../models/project_material');
const Material = require('../models/material');
const Project = require('../models/Project');
const loggingMiddleware = require('../middleware/logMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const errorHandlerMiddleware = require('../middleware/errHandMiddleware');
const validationMiddleware = require('../middleware/validMiddleware');
const rateLimitingMiddleware = require('../middleware/rateLimMiddleware');

router.use(loggingMiddleware);
router.use(authMiddleware);
router.use(validationMiddleware);
router.use(rateLimitingMiddleware);



/**@openapi
# Add Material to Project API
paths:
  /api/projects/{projectID}/materials/add/{materialID}:
    post:
      tags:
        - Project Materials Controller
      summary: Add Material to Project
      description: Add a material to a specific project and update the material quantity.
      parameters:
        - in: path
          name: projectID
          required: true
          schema:
            type: integer
          description: The ID of the project to add the material to.
        - in: path
          name: materialID
          required: true
          schema:
            type: integer
          description: The ID of the material to add to the project.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                quantityUsed:
                  type: integer
                  minimum: 1
                  description: The quantity of the material used in the project. Must be greater than zero.
      responses:
        '200':
          description: Material added to project successfully.
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    description: The ID of the project material entry.
                  projectID:
                    type: integer
                    description: The ID of the project.
                  materialID:
                    type: integer
                    description: The ID of the material.
                  quantityUsed:
                    type: integer
                    description: The quantity of the material used in the project.
        '400':
          description: Bad Request - Invalid quantity or insufficient quantity of the material available.
        '404':
          description: Not Found - Project or material not found.
        '500':
          description: Internal Server Error - Something went wrong on the server side.

 */
router.post('/:projectID/materials/add/:materialID', async (req, res) => {
    try {
        const { projectID, materialID } = req.params;
        const { quantityUsed } = req.body;

        const project = await Project.findByPk(projectID);
        const material = await Material.findByPk(materialID);

        if (!project || !material) {
            return res.status(404).json({ message: 'Project or material not found' });
        }

        if (quantityUsed <= 0) {
            return res.status(400).json({ message: 'Quantity used must be greater than zero' });
        }

        // Check if there is an existing entry in project_material
        let projectMaterial = await ProjectMaterial.findOne({
            where: { projectID: projectID, materialID: materialID },
        });

        if (!projectMaterial) {
            // Create a new entry in project_material if it doesn't exist
            projectMaterial = await ProjectMaterial.create({
                projectID: projectID,
                materialID: materialID,
                quantityUsed: quantityUsed,
            });
        } else {
            // Update the quantity used in the existing project_material entry
            const updatedQuantity = projectMaterial.quantityUsed + quantityUsed;
            projectMaterial.quantityUsed = updatedQuantity;
            await projectMaterial.save();
        }

        // Update the quantity in the Material model
        const updatedQuantity = material.quantity - quantityUsed;
        await material.update({ quantity: updatedQuantity });

        res.status(200).json(projectMaterial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



/** @openapi
* /api/projects/{projectID}/materials/edit/{materialID}:
*   put:
    *     tags:
    *       - Project Materials
*     summary: Edit Material Quantity in Project
*     parameters:
*       - in: path
*         name: projectID
*         required: true
*         schema:
*           type: integer
*         description: The ID of the project containing the material.
*       - in: path
*         name: materialID
*         required: true
*         schema:
*           type: integer
*         description: The ID of the material to edit in the project.
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
*                 description: The new quantity of the material used in the project.
*     responses:
*       200:
*         description: Material quantity updated in project successfully.
*         content:
*           application/json:
*             schema:
    *               type: object
*               properties:
*                 id:
    *                   type: integer
*                   description: The ID of the project material entry.
*                 projectID:
*                   type: integer
*                   description: The ID of the project.
*                 materialID:
*                   type: integer
*                   description: The ID of the material.
*                 quantityUsed:
*                   type: integer
*                   description: The updated quantity of the material used in the project.
*       400:
*         description: Bad Request - Invalid quantity or insufficient quantity of the material available.
*       404:
*         description: Not Found - Project material or material not found.
*       500:
*         description: Internal Server Error - Something went wrong on the server side.
*/
// Edit Material in Project API
router.put('/:projectID/materials/edit/:materialID', async (req, res) => {
    try {
        const { projectID, materialID } = req.params;
        const { quantityUsed } = req.body;
        const projectMaterial = await ProjectMaterial.findOne({
            where: { projectID: projectID, materialID: materialID },
        });
        if (!projectMaterial) {
            return res.status(404).json({ message: 'Project material not found' });
        }
        const material = await Material.findByPk(materialID);
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }
        const quantityDifference = quantityUsed - projectMaterial.quantityUsed;
        if (quantityDifference < 0) {
            const updatedQuantity = material.quantity + Math.abs(quantityDifference);
            await material.update({ quantity: updatedQuantity });
        }
        else if (quantityDifference > 0 && quantityDifference <= material.quantity) {
            const updatedQuantity = material.quantity - quantityDifference
            await material.update({ quantity: updatedQuantity });
        }
        else {
            return res.status(400).json({ message: 'Insufficient quantity of the material available' });
        }

        await projectMaterial.update({ quantityUsed: quantityUsed });

        res.status(200).json(projectMaterial);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @openapi
 * /api/projects/{projectID}/materials/get:
 *   get:
 *     tags:
 *       - Project Materials Controller
 *     summary: Get Materials in Project
 *     description: Retrieve all materials in a specific project.
 *     parameters:
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the project to get materials from.
 *     responses:
 *       '200':
 *         description: Successful operation. Materials in the project retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   materialName:
 *                     type: string
 *                     description: The name of the material.
 *                   cost:
 *                     type: integer
 *                     description: The cost of the material.
 *                   materialID:
 *                     type: integer
 *                     description: The ID of the material.
 *                   userID:
 *                     type: integer
 *                     description: The ID of the user associated with the material.
 *                   quantityUsed:
 *                     type: integer
 *                     description: The quantity of the material used in the project.
 *       '404':
 *         description: Not Found - Project materials not found.
 *       '500':
 *         description: Internal Server Error - Failed to retrieve project materials.
 */
// Get Materials in Project API
router.get('/:projectID/materials/get', async (req, res) => {
    try {
        const projectID = req.params.projectID;
        // Find all project materials for the specified project
        const projectMaterials = await ProjectMaterial.findAll({
            where: { projectID: projectID },
        });
        const materialDetails = await Promise.all(
            projectMaterials.map(async (pm) => {
                const material = await Material.findByPk(pm.materialID, {
                    attributes: ['materialName', 'cost', 'materialID', 'userID'],
                });
                return {
                    materialName: material.materialName,
                    cost: material.cost,
                    materialID: material.materialID,
                    userID: material.userID,
                    quantityUsed: pm.quantityUsed,
                };
            })
        );
        res.status(200).json(materialDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @openapi
 * /api/projects/{projectID}/materials/delete/{materialID}:
 *   delete:
 *     tags:
 *       - Project Materials Controller
 *     summary: Delete Material from Project
 *     description: Delete a material from a specific project.
 *     parameters:
 *       - in: path
 *         name: projectID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the project from which the material will be deleted.
 *       - in: path
 *         name: materialID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the material to be deleted from the project.
 *     responses:
 *       '200':
 *         description: Successful operation. Material deleted from the project.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message indicating successful deletion.
 *       '404':
 *         description: Not Found - Project material not found.
 *       '500':
 *         description: Internal Server Error - Failed to delete project material.
 */
router.delete('/:projectID/materials/delete/:materialID', async (req, res) => {
    try {
        const { projectID, materialID } = req.params;
        const projectMaterial = await ProjectMaterial.findOne({
            where: { projectID: projectID, materialID: materialID },
        });
        if (!projectMaterial) {
            return res.status(404).json({ message: 'Project material not found' });
        }
        await projectMaterial.destroy();
        res.status(200).json({ message: 'Project material deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.use(errorHandlerMiddleware);

module.exports = router;
