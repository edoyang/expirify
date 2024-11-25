import React, { useState, useEffect } from "react";
import axios from "axios";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import "./style.scss";

const Product = () => {
  const [barcode, setBarcode] = useState("Please scan the barcode");
  const [prevBarcode, setPrevBarcode] = useState("Not Found");
  const [formState, setFormState] = useState("Add Product");
  const [method, setMethod] = useState("POST"); // Default method
  const [productName, setProductName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  // Handle barcode state changes
  useEffect(() => {
    if (barcode !== prevBarcode && barcode !== "Please scan the barcode") {
      // Fetch product details if barcode changes
      axios
        .get(`http://localhost:3000/api/product/${barcode}`)
        .then((response) => {
          if (response.status === 200) {
            // If product is found, update form state for PATCH
            const product = response.data;
            setProductName(product.product_name);
            setExpiryDate(product.date);
            setFormState("Update Product");
            setMethod("PATCH");
          }
        })
        .catch((error) => {
          if (error.response?.status === 404) {
            // If product is not found, reset form state for POST
            setProductName("");
            setExpiryDate("");
            setFormState("Add Product");
            setMethod("POST");
          }
        });
      setPrevBarcode(barcode);
    }
  }, [barcode, prevBarcode]);

  // Submit handler for form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      barcode: parseInt(barcode),
      product_name: productName,
      date: expiryDate,
    };

    try {
      if (method === "POST") {
        const response = await axios.post(
          "http://localhost:3000/api/products",
          payload
        );
        console.log("Product added successfully:", response.data);
      } else if (method === "PATCH") {
        const response = await axios.patch(
          `http://localhost:3000/api/product/${barcode}`,
          payload
        );
        console.log("Product updated successfully:", response.data);
      }
    } catch (error) {
      console.error(
        "Error during submission:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="product-page">
      <div className="camera">
        <BarcodeScannerComponent
          onUpdate={(err, result) => {
            if (result) {
              setBarcode(result.text);
            }
          }}
        />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="barcode">
          <p>{barcode}</p>
        </div>
        <label htmlFor="name">Product Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={productName || ""}
          placeholder="E.g. (Mur Thai) Nissin Waffer 250g"
          onChange={(e) => setProductName(e.target.value)}
        />
        <label htmlFor="date">Expiry Date:</label>
        <input
          type="date"
          id="date"
          name="date"
          required
          value={expiryDate || ""}
          onChange={(e) => setExpiryDate(e.target.value)}
        />
        <button type="submit">{formState}</button>
      </form>
    </div>
  );
};

export default Product;
