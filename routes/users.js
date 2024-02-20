const express = require('express');
const router = express.Router();
const db = require('../modals/db');
const bcrypt = require('bcrypt');

// Regular expression for validating email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* POST user signup. */
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

    res.status(200).json({ message: "User signed up successfully" });
  } catch (err) {
    console.error("Error signing up user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
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
    res.status(200).json({ message: "Login successful", user: user[0] });

  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;
