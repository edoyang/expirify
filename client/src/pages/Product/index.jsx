import React, { useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import "./style.scss";

const Product = () => {
  const [barcode, setBarcode] = useState("Not Found");
  const [formState, setFormState] = useState(true);

  return (
    <div className="add-product">
      <div className="camera">
        <BarcodeScannerComponent
          width={500}
          height={500}
          onUpdate={(err, result) => {
            if (result) {
              setBarcode(result.text);
            } else {
              setBarcode("Not Found");
            }
          }}
        />
      </div>
      <div className="barcode">
        <p>Barcode: {barcode}</p>
      </div>

      <div className="form">
        <form>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" required />
          <label htmlFor="date">Expiry Date:</label>
          <input type="date" id="date" name="date" required />
          <button type="submit">
            {formState ? "Add Product" : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Product;
