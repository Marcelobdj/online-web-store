const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const Cart = require("../models/Cart");

router.get("/", authMiddleware, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.userId });
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving cart" });
    }
});

router.post("/add", authMiddleware, async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        let cart = await Cart.findOne({ userId: req.userId });
        if (!cart) {
            cart = new Cart({ userId: req.userId, items: [] });
        }

        const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
        if (itemIndex >= 0) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: "Error adding item to cart" });
    }
});

// Add routes for updating and removing items if needed

module.exports = router;