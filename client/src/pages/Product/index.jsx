import React, { useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import "./style.scss";

const Product = () => {
  const [barcode, setBarcode] = useState("Not Found");
  const [formState, setFormState] = useState(true);

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

      <form>
        <div className="barcode">
          <p>{barcode}</p>
        </div>
        <label htmlFor="name">Product Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="E.g. (Mur Thai) Nissin Waffer 250g"
        />
        <label htmlFor="date">Expiry Date:</label>
        <input type="date" id="date" name="date" required />
        <button type="submit">
          {formState ? "Add Product" : "Update Product"}
        </button>
      </form>
    </div>
  );
};

export default Product;
