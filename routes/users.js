const express = require('express');
const router = express.Router();
const db = require('../modals/db');
const bcrypt = require('bcrypt');

// Regular expression for validating email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @openapi
 * /user/signup:
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
 * /user/login:
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
module.exports = router;
