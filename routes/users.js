const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const {isEmail} = require("validator");
/**
 * @openapi
 * /api/user/signup:
 *   post:
 *     tags:
 *       - User Controller
 *     summary: Sign up as a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - email
 *               - password
 *               - interests
 *               - location
 *             properties:
 *               userName:
 *                 type: string
 *                 description: The username of the user.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The password of the user.
 *               interests:
 *                 type: string
 *                 description: The interests of the user.
 *               location:
 *                 type: string
 *                 description: The location of the user.
 *     responses:
 *       201:
 *         description: User signed up successfully
 *       400:
 *         description: Bad Request - Missing required fields or invalid data format.
 *       401:
 *         description: Unauthorized - Invalid email format.
 *       403:
 *         description: Forbidden - Email already exists.
 *       500:
 *         description: Internal server error.
 */
router.post('/signup', async (req, res) => {
  try {
    const { userName, email, password, interests, location } = req.body;

    // Check if required fields are provided
    if (!userName || !email || !password || !interests || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email is a valid format using validator
    if (!isEmail(email)) {
      return res.status(401).json({ message: "Invalid email format" });
    }

    // Check if email already exists in the database
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(403).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user using Sequelize model
    await User.create({
      userName,
      email,
      password: hashedPassword,
      interests,
      location
    });

    res.status(201).json({ message: "User signed up successfully" });
  } catch (err) {
    console.error("Error signing up user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @openapi
 * /api/user/login:
 *   post:
 *     tags:
 *       - User Controller
 *     summary: Login as a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The password of the user.
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Bad Request - Missing required fields or invalid data format.
 *       401:
 *         description: Unauthorized - Invalid email or password.
 *       404:
 *         description: Not Found - User not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if required fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email using Sequelize model
    const user = await User.findOne({
      where: { email: email }
    });

    // If user not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Password is correct
    // Omitting the password field from the user object before sending it in the response
    const userWithoutPassword = { ...user.toJSON() };
    delete userWithoutPassword.password;
    res.status(200).json({ message: "Login successful", user: userWithoutPassword });

  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @openapi
 * /api/user/edit-user/{userID}:
 *   put:
 *     tags:
 *       - User Controller
 *     summary: Edit user information
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to edit.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 description: The new username for the user.
 *               interests:
 *                 type: string
 *                 description: The new interests in the user.
 *               location:
 *                 type: string
 *                 description: The new location for the user.
 *     responses:
 *       200:
 *         description: User information updated successfully
 *       400:
 *         description: Bad Request - At least one of userName, interests, or location must be provided.
 *       404:
 *         description: Not Found - User not found.
 *       500:
 *         description: Internal server error.
 */
router.put('/edit-user/:userID', async (req, res) => {
  try {
    const { userName, interests, location } = req.body;
    const userID = req.params.userID;

    // Check if at least one field is provided
    if (!userName && !interests && !location) {
      return res.status(400).json({ message: "At least one of userName, interests, or location must be provided" });
    }

    // Find user by userID using Sequelize model
    const user = await User.findByPk(userID);

    // If user not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user attributes
    if (userName) user.userName = userName;
    if (interests) user.interests = interests;
    if (location) user.location = location;

    // Save the updated user
    await user.save();

    res.status(200).json({ message: "User information updated successfully" });

  } catch (err) {
    console.error("Error editing user information:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
/**
 * @openapi
 * /api/user/get-user/{userID}:
 *   get:
 *     tags:
 *       - User Controller
 *     summary: Get user details
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to retrieve details for.
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userName:
 *                   type: string
 *                   description: The username of the user.
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: The email address of the user.
 *                 interests:
 *                   type: string
 *                   description: The interests of the user.
 *                 location:
 *                   type: string
 *                   description: The location of the user.
 *       404:
 *         description: Not Found - User not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/get-user/:userID', async (req, res) => {
  try {
    const userID = req.params.userID;

    // Find user by userID using Sequelize model
    const user = await User.findByPk(userID, {
      attributes: ['userName', 'email', 'interests', 'location']
    });

    // If user not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);

  } catch (err) {
    console.error("Error getting user details:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @openapi
 * /api/user/delete-user/{userID}:
 *   delete:
 *     tags:
 *       - User Controller
 *     summary: Delete a user and all related tools, materials, and skills
 *     parameters:
 *       - in: path
 *         name: userID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to delete.
 *     responses:
 *       204:
 *         description: User and related data deleted successfully
 *       404:
 *         description: Not Found - User not found.
 *       500:
 *         description: Internal server error.
 */
router.delete('/delete-user/:userID', async (req, res) => {
  try {
    const userID = req.params.userID;

    // Find user by userID using Sequelize model
    const user = await User.findByPk(userID);

    // If user not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    await user.destroy();

    res.status(204).end(); // No content in response

  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
