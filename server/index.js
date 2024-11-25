const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(
  cors({
    origin: [process.env.VERCEL_CLIENT, process.env.LOCAL_CLIENT],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

// Connect to MongoDB
mongoose
  .connect("mongodb+srv://root:123@stocker.ftjus.mongodb.net/stocker")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Define the Product Schema
const productSchema = new mongoose.Schema({
  barcode: { type: Number, required: true, unique: true },
  product_name: { type: String, required: true },
  date: { type: String },
});

const Product = mongoose.model("Product", productSchema, "products");

// POST API to Add a Product
app.post("/api/products", async (req, res) => {
  try {
    const { barcode, product_name, date } = req.body;

    if (!barcode || !product_name || !date) {
      return res
        .status(400)
        .send("All fields are required: barcode, product_name, date (ddmmyy)");
    }

    const product = new Product({ barcode, product_name, date });
    await product.save();

    res.status(201).send({ message: "Product added successfully", product });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).send({ error: "Product already exists" });
    }
    res
      .status(500)
      .send({ error: "Failed to add product", details: err.message });
  }
});

// GET API to Fetch All Products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).send(products);
  } catch (err) {
    res
      .status(500)
      .send({ error: "Failed to fetch products", details: err.message });
  }
});

// GET API to Fetch a Product by Barcode
app.get("/api/product/:barcode", async (req, res) => {
  try {
    const { barcode } = req.params;

    // Query for both number and string representations of the barcode
    const product = await Product.findOne({
      $or: [{ barcode: parseInt(barcode) }, { barcode: barcode }],
    });

    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    res.status(200).send(product);
  } catch (err) {
    res
      .status(500)
      .send({ error: "Failed to fetch product", details: err.message });
  }
});

// PATCH API to Update a Product
app.patch("/api/product/:barcode", async (req, res) => {
  try {
    const { barcode } = req.params;
    const updates = req.body;

    // Validate that at least one field is provided for update
    if (!Object.keys(updates).length) {
      return res.status(400).send({ error: "No fields provided to update" });
    }

    const product = await Product.findOneAndUpdate(
      { barcode: parseInt(barcode) },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    res.status(200).send({ message: "Product updated successfully", product });
  } catch (err) {
    res
      .status(500)
      .send({ error: "Failed to update product", details: err.message });
  }
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
