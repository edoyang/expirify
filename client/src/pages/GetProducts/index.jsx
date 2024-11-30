import axios from "axios";
import React, { useState, useEffect } from "react";

const GetProducts = () => {
  const [products, setProducts] = useState([]); // State to store fetched products

  const fetchProducts = async (filter) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_BASE}/api/${filter}`
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts("expired-products"); // Default to "Today" filter
  }, []);

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

  // Format the date to dd-mm-yy
  const formatDate = (dateString) => {
    if (!dateString) return "No Expiry Date";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="get-products">
      <div className="get-products-sort">
        <button onClick={() => fetchProducts("expired-products/monthly")}>
          Monthly
        </button>
        <button onClick={() => fetchProducts("expired-products/weekly")}>
          Weekly
        </button>
        <button onClick={() => fetchProducts("expired-products")}>Today</button>
      </div>

      {/* Conditionally Render Products or Message */}
      {products.length ? (
        <div className="grid-items">
          {products.map((product) => (
            <div className="item" key={product.barcode}>
              <div className="item-info">
                <h3>{product.product_name}</h3>
                <p>Barcode: {product.barcode}</p>
                <p>Expiry Date: {formatDate(product.date)}</p>
              </div>
              <button
                className="collect-item"
                onClick={() => handleCollect(product.barcode)}>
                Collect Item
              </button>
            </div>
          ))}
        </div>
      ) : (
        <h1>No product found</h1>
      )}
    </div>
  );
};

export default GetProducts;
