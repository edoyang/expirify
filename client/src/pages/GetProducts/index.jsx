import axios from "axios";
import React, { useState, useEffect } from "react";

const GetProducts = () => {
  const [products, setProducts] = useState([]); // State to store fetched products

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_API_BASE}/api/expired-products`)
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);

  const handleCollect = (barcode) => {
    axios
      .patch(
        `${import.meta.env.VITE_BACKEND_API_BASE}/api/product/${barcode}`,
        { collected: true },
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
