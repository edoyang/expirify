import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Quagga from "quagga";
import "./style.scss";

const Product = () => {
  const [barcode, setBarcode] = useState("Please scan the barcode");
  const [prevBarcode, setPrevBarcode] = useState("Not Found");
  const [formState, setFormState] = useState("Add Product");
  const [method, setMethod] = useState("POST"); // Default method
  const [productName, setProductName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const scannerRef = useRef(null);

  const handleRemoveBarcode = () => {
    setBarcode(null);
  };

  useEffect(() => {
    if (
      barcode !== prevBarcode &&
      barcode !== "Please scan the barcode" &&
      barcode !== null
    ) {
      axios
        .get(
          `${import.meta.env.VITE_BACKEND_API_BASE}/api/product/${barcode}`,
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          if (response.status === 200) {
            const product = response.data;
            setProductName(product.product_name);
            setExpiryDate(product.date);
            setFormState("Update Product");
            setMethod("PATCH");
            setMessage("Product found. Update details if needed.");
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 3000);
          }
        })
        .catch((error) => {
          if (error.response?.status === 404) {
            setProductName("");
            setExpiryDate("");
            setFormState("Add Product");
            setMethod("POST");
            setMessage("Product not found. Add details below.");
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 3000);
          } else {
            setMessage("Error fetching product. Please try again.");
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 3000);
          }
        });
      setPrevBarcode(barcode);
    }
  }, [barcode, prevBarcode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      barcode: parseInt(barcode),
      product_name: productName,
      date: expiryDate,
    };

    try {
      if (method === "POST") {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_API_BASE}/api/products`,
          payload,
          {
            withCredentials: true,
          }
        );
        setMessage("Product added successfully.");
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      } else if (method === "PATCH") {
        await axios.patch(
          `${import.meta.env.VITE_BACKEND_API_BASE}/api/product/${barcode}`,
          payload,
          {
            withCredentials: true,
          }
        );
        setMessage("Product updated successfully.");
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(error.response.data.error);
      } else {
        console.log(error);
      }
    }
  };

  const startScanner = () => {
    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current, // Use a reference to the scanner container
        },
        decoder: {
          readers: ["ean_reader", "code_128_reader"], // Add or modify readers based on your requirements
        },
      },
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        Quagga.start();
      }
    );

    Quagga.onDetected((data) => {
      if (data && data.codeResult && data.codeResult.code) {
        setBarcode(data.codeResult.code);
        Quagga.stop(); // Stop the scanner after detecting a barcode
      }
    });
  };

  useEffect(() => {
    startScanner();
    return () => {
      Quagga.stop(); // Clean up the scanner when the component unmounts
    };
  }, []);

  return (
    <div className="product-page">
      <div className={`alert ${showMessage ? "visible" : ""}`}>
        <p>{message}</p>
      </div>
      <div className="camera" ref={scannerRef}></div>
      <div className="barcode">
        <p>{barcode}</p>
        <button onClick={handleRemoveBarcode}>Remove Barcode</button>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Product Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={productName || ""}
          placeholder="E.g. (Mur Thai) Rotary Fish Cracker 250g"
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
