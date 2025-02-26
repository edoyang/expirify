import "./style.scss";
import { Link } from "react-router";

const Header = () => {
  return (
    <div className="header">
      <Link to="/">Home</Link>
      <Link to="/add-product">Add Product</Link>
      <Link to="/get-products">Get Products</Link>
    </div>
  );
};

export default Header;
