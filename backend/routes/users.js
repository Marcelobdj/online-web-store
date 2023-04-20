const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middlewares/auth");
const crypto = require("crypto");
const sendEmail = require("../mailer");


const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Access is denied" });
    }
    next();
};

router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching user profile" });
    }
});

router.put("/profile", authMiddleware, async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        await user.save();
        res.json({ message: "Profile updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating user profile" });
    }
});

router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "E-mail already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            emailConfirmationToken,
        });

        await user.save();
        // Send confirmation email
        const emailConfirmationUrl = `http://localhost:3000/email-confirmation/${emailConfirmationToken}`;
        await sendEmail({
            to: user.email,
            subject: "Email Confirmation - Online Web Store",
            text: `Please click the following link to confirm your email address: ${emailConfirmationUrl}`,
            html: `<p>Please click the following link to confirm your email address: <a href="${emailConfirmationUrl}">${emailConfirmationUrl}</a></p>`,
        });
        res.status(201).json({ message: "E-mail registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error during registration" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Generate JWT
        const token = jwt.sign({ id: user._id, role: user.role }, "your_jwt_secret", {
            expiresIn: "1h",
        });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: "Error logging in" });
    }
});

router.get("/", authMiddleware, isAdmin, async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ message: "Error fetching all users" });
    }
});

module.exports = router;