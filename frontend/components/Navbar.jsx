import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: "10px", background: "#333", color: "#fff" }}>
      <Link to="/" style={{ margin: "0 10px", color: "#fff" }}>Home</Link>
      <Link to="/login" style={{ margin: "0 10px", color: "#fff" }}>Login</Link>
    </nav>
  );
}
