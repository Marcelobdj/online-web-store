const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const productRoutes = require("./routes/products");
app.use("/api/products", productRoutes);

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

const cartRoutes = require("./routes/carts");
app.use("/api/carts", cartRoutes);

const orderRoutes = require("./routes/orders");
app.use("/api/orders", orderRoutes);

const mongoURI = "mongodb://206.189.200.26:27018/web-store-database";
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDB connection established successfully");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});