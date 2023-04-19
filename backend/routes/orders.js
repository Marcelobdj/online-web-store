const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.get("/my-orders", authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.userId }).populate({
            path: "items.product",
            model: "Product",
        });

        res.json(orders);
    } catch (error) {
        console.error("Error fetching user's orders:", error);
        res.status(500).json({ message: "Error fetching user's orders" });
    }
});

module.exports = router;