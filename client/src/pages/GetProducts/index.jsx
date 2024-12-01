import axios from "axios";
import React, { useState, useEffect } from "react";
import "./style.scss";

const GetProducts = () => {
  const [products, setProducts] = useState([]); // State to store fetched products
  const [loading, setLoading] = useState(false); // State to manage loading status

  const fetchProducts = async (filter) => {
    setLoading(true); // Set loading to true before fetching
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_BASE}/api/${filter}`
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching
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
        <h1>Sort By</h1>
        <div className="sort">
          <button onClick={() => fetchProducts("expired-products/monthly")}>
            Monthly
          </button>
          <button onClick={() => fetchProducts("expired-products/weekly")}>
            Weekly
          </button>
          <button onClick={() => fetchProducts("expired-products")}>
            Today
          </button>
        </div>
      </div>

      {/* Display Loading State */}
      {loading ? (
        <h1>Loading...</h1>
      ) : products.length ? (
        <div className="grid-items">
          {products.map((product) => (
            <div className="item" key={product.barcode}>
              <div className="item-info">
                <div className="item-image-container">
                  <img
                    src={product.image}
                    alt={product.product_name}
                    className="item-image"
                  />
                </div>
                <h3 className="item-name">{product.product_name}</h3>
                <p className="item-barcode">{product.barcode}</p>
                <p className="bbf">Expired: {formatDate(product.date)}</p>
              </div>
              <button
                className="collect-item"
                onClick={() => handleCollect(product.barcode)}>
                Collect this item
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
