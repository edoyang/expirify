import axios from "axios";
import React, { useState, useEffect } from "react";

const GetProducts = () => {
  const [products, setProducts] = useState([]); // State to store fetched products
  const [filter, setFilter] = useState("expired-products"); // Default API endpoint

  // Fetch products whenever the filter changes
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_API_BASE}/api/${filter}`)
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, [filter]);

  const handleCollect = (barcode) => {
    axios
      .patch(
        `${import.meta.env.VITE_BACKEND_API_BASE}/api/product/${barcode}`,
        { date: null }, // Explicitly set date to null
        { withCredentials: true }
      )
      .then((response) => {
        if (response.status === 200) {
          setProducts((prevProducts) =>
            prevProducts.map((product) =>
              product.barcode === barcode ? { ...product, date: null } : product
            )
          );
        }
      })
      .catch((error) => {
        console.error("Error updating product:", error);
      });
  };

  return (
    <div className="get-products">
      <div className="get-products-sort">
        {/* Update filter state on button click */}
        <button onClick={() => setFilter("expired-products/monthly")}>
          Monthly
        </button>
        <button onClick={() => setFilter("expired-products/weekly")}>
          Weekly
        </button>
        <button onClick={() => setFilter("expired-products")}>Today</button>
      </div>
      <div className="grid-items">
        {products.map((product) => (
          <div className="item" key={product.barcode}>
            <div className="item-info">
              <h3>{product.product_name}</h3>
              <p>Barcode: {product.barcode}</p>
              <p>Expiry Date: {product.date || "No Expiry Date"}</p>
            </div>
            <button
              className="collect-item"
              onClick={() => handleCollect(product.barcode)} // Pass barcode to handleCollect
            >
              Collect Item
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GetProducts;
