const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

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
  barcode: { type: Number, unique: true },
  product_name: { type: String, required: true },
  date: { type: Date, default: null }, // Always stored in Australian time
});

const Product = mongoose.model("Product", productSchema, "products");

// Helper function to adjust dates to Australian time
const convertToAustralianTime = (utcDate) => {
  const AEDT_OFFSET = 11 * 60 * 60000; // UTC+11 (AEDT)
  return new Date(utcDate.getTime() + AEDT_OFFSET);
};

// POST API to Add a Product
app.post("/api/products", async (req, res) => {
  try {
    const { barcode, product_name, date } = req.body;

    if (!barcode || !product_name) {
      return res.status(400).send("Barcode and product name are required.");
    }

    const normalizedDate = date
      ? convertToAustralianTime(new Date(date))
      : null;

    const product = new Product({
      barcode,
      product_name,
      date: normalizedDate, // Convert to Australian time
    });
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
    // Convert all product dates to Australian time before sending
    const updatedProducts = products.map((product) => {
      if (product.date) {
        product.date = convertToAustralianTime(product.date);
      }
      return product;
    });

    res.status(200).send(updatedProducts);
  } catch (err) {
    res
      .status(500)
      .send({ error: "Failed to fetch products", details: err.message });
  }
});

// Expired Products (Monthly)
app.get("/api/expired-products/monthly", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight in local Australian time

    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const products = await Product.find({
      date: { $gte: today, $lte: nextMonth },
    }).sort({ date: 1 }); // Sort by date (ascending)

    const updatedProducts = products.map((product) => {
      if (product.date) {
        product.date = convertToAustralianTime(product.date);
      }
      return product;
    });

    res.status(200).send(updatedProducts);
  } catch (err) {
    res.status(500).send({
      error: "Failed to fetch products expiring within the next month",
      details: err.message,
    });
  }
});

// Expired Products (Weekly)
app.get("/api/expired-products/weekly", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight in local Australian time

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const products = await Product.find({
      date: { $gte: today, $lte: nextWeek },
    }).sort({ date: 1 }); // Sort by date (ascending)

    const updatedProducts = products.map((product) => {
      if (product.date) {
        product.date = convertToAustralianTime(product.date);
      }
      return product;
    });

    res.status(200).send(updatedProducts);
  } catch (err) {
    res.status(500).send({
      error: "Failed to fetch products expiring within the next week",
      details: err.message,
    });
  }
});

// Expired Products (General)
app.get("/api/expired-products", async (req, res) => {
  try {
    // Define the Australian timezone offset (e.g., AEDT: UTC+11)
    const australianOffset = 11 * 60 * 60000; // AEDT offset in milliseconds

    // Get the current time in UTC
    const now = new Date();

    // Adjust `now` to Australian time
    const australianNow = new Date(now.getTime() + australianOffset);

    // Calculate start of the Australian day in UTC
    const startOfDay = new Date(australianNow);
    startOfDay.setUTCHours(0, 0, 0, 0);
    startOfDay.setTime(startOfDay.getTime() - australianOffset);

    // Calculate end of the Australian day in UTC
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60000 - 1);

    // Query for products that expired up to the end of the Australian day
    const products = await Product.find({
      date: { $lte: endOfDay },
    });

    res.status(200).send(products);
  } catch (err) {
    res.status(500).send({
      error: "Failed to fetch expired products",
      details: err.message,
    });
  }
});

// GET API to Fetch a Product by Barcode
app.get("/api/product/:barcode", async (req, res) => {
  try {
    const { barcode } = req.params;

    const product = await Product.findOne({
      $or: [{ barcode: parseInt(barcode) }, { barcode: barcode }],
    });

    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }

    // Convert product date to Australian time
    if (product.date) {
      product.date = convertToAustralianTime(product.date);
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

    // If the date field is being updated, convert it to Australian time
    if (updates.date) {
      updates.date = convertToAustralianTime(new Date(updates.date));
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
