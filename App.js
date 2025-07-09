import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [products, setProducts] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [cart, setCart] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/products").then(res => setProducts(res.data));
  }, []);

  const login = () => {
    axios.post("http://localhost:5000/api/login", { username, password })
      .then(res => {
        setToken(res.data.token);
        alert("Logged in!");
      })
      .catch(() => alert("Login failed"));
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>ShopNest</h1>
      <div>
        <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
        <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
        <button onClick={login}>Login</button>
      </div>
      <h2>Products</h2>
      {products.map(p => (
        <div key={p._id} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
          <h3>{p.name}</h3>
          <p>{p.description}</p>
          <p>₹{p.price}</p>
          <button onClick={() => addToCart(p)}>Add to Cart</button>
        </div>
      ))}
      <h2>Cart</h2>
      {cart.map((c, i) => (
        <div key={i}>{c.name} - ₹{c.price}</div>
      ))}
    </div>
  );
}

export default App;
