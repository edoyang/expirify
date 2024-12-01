import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router";
import "./style.scss";

const Home = () => {
  const [todayExpired, setTodayExpired] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpiredProducts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API_BASE}/api/expired-products`
        );
        setTodayExpired(response.data.length); // Assuming the API returns an array of expired products
      } catch (error) {
        console.error("Error fetching expired products:", error);
        setTodayExpired(0);
      } finally {
        setLoading(false);
      }
    };

    fetchExpiredProducts();
  }, []);

  return (
    <div className="home-page">
      {loading ? (
        <h1>Loading...</h1>
      ) : todayExpired && todayExpired > 0 ? (
        <>
          <h1>Today's expired products: {todayExpired}</h1>
          <Link className="link" to="/get-products">
            View Expired Products
          </Link>
        </>
      ) : (
        <h1>No products are expiring today</h1>
      )}
    </div>
  );
};

export default Home;
