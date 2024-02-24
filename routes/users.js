const express = require('express');
const router = express.Router();
const db = require('../modals/db');
const bcrypt = require('bcrypt');

// Regular expression for validating email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
 *         description: Email already exists.
 *       500:
 *         description: Internal server error.
 */
router.post('/', async (req, res) => {
  try {
    const { userName, email, password, interests, location } = req.body;
    // Check if required fields are provided
    if (!userName || !email || !password || !interests || !location) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email is a valid format
    if (!emailRegex.test(email)) {
      return res.status(401).json({ message: "Invalid email format" });
    }

    // Get database connection
    const connection = await db.getConnection();
    await connection.beginTransaction();

    // Check if email already exists
    const [existingUser] = await connection.execute('SELECT * FROM User WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      // Email already exists, return 403 Forbidden
      await connection.commit(); // Commit transaction before returning response
      return res.status(403).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const sql = `INSERT INTO User (userName, email, password, interests, location) VALUES (?, ?, ?, ?, ?)`;
    await connection.execute(sql, [userName, email, hashedPassword, interests, location]);

    // Commit transaction
    await connection.commit();

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
 *       201:
 *         description: Login successful
 *       400:
 *         description: Bad Request - Missing required fields or invalid data format.
 *       401:
 *         description: Unauthorized - Invalid email or password.
 *       404:
 *         description: User not found - The provided email does not exist.
 *       500:
 *         description: Internal server error.
 */
router.route('/login').post(async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if required fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Get database connection
    const connection = await db.getConnection();

    // Fetch user from the database using email
    const [user] = await connection.execute('SELECT * FROM User WHERE email = ?', [email]);
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user[0].password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Password is correct
    const userWithoutPassword = { ...user[0] };
    delete userWithoutPassword.password;
    res.status(201).json({ message: "Login successful", user: userWithoutPassword });

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
 *           type: string
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
 *       201:
 *         description: User information updated successfully
 *       400:
 *         description: Bad Request - At least one of userName, interests, or location must be provided.
 *       404:
 *         description: Not Found - User not found.
 *       500:
 *         description: Internal server error.
 */
router.route('/edit-user/:userID').put(async (req, res) => {
  try {
    const { userName, interests, location } = req.body;
    const userID = req.params.userID;

    // Check if at least one field is provided
    if (!userName && !interests && !location) {
      return res.status(400).json({ message: "At least one of userName, interests, or location must be provided" });
    }

    // Get database connection
    const connection = await db.getConnection();

    // Fetch user from the database using userID
    const [user] = await connection.execute('SELECT * FROM user WHERE userID = ?', [userID]);
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    let updateFields = [];
    let queryParams = [];

    // Construct the SQL query based on the provided fields
    if (userName) {
      updateFields.push('userName = ?');
      queryParams.push(userName);
    }
    if (interests) {
      updateFields.push('interests = ?');
      queryParams.push(interests);
    }
    if (location) {
      updateFields.push('location = ?');
      queryParams.push(location);
    }

    // Update user information
    const updateQuery = `UPDATE user SET ${updateFields.join(', ')} WHERE userID = ?`;
    const updateParams = [...queryParams, userID];
    await connection.execute(updateQuery, updateParams);

    res.status(201).json({ message: "User information updated successfully" });

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
 *           type: string
 *         description: The ID of the user to retrieve details for.
 *     responses:
 *       201:
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

    // Get database connection
    const connection = await db.getConnection();

    // Fetch user details from the database using userID
    const [user] = await connection.execute('SELECT userName, email, interests, location FROM user WHERE userID = ?', [userID]);
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(201).json(user[0]);

  } catch (err) {
    console.error("Error getting user details:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;
