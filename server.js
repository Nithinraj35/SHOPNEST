const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/shopnest", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = mongoose.model("User", new mongoose.Schema({
  username: String,
  password: String,
  isAdmin: Boolean
}));

const Product = mongoose.model("Product", new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String
}));

// Auth routes
app.post("/api/register", async (req, res) => {
  const { username, password, isAdmin } = req.body;
  const user = new User({ username, password, isAdmin: !!isAdmin });
  await user.save();
  res.send({ message: "User registered" });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.status(401).send({ message: "Invalid credentials" });
  const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, "secret");
  res.send({ token, isAdmin: user.isAdmin });
});

// Middleware to check token
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send("Access Denied");
  try {
    const verified = jwt.verify(token, "secret");
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
}

// Product routes
app.get("/api/products", async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

app.post("/api/products", auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).send("Access denied");
  const product = new Product(req.body);
  await product.save();
  res.send(product);
});

app.put("/api/products/:id", auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).send("Access denied");
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.send(product);
});

app.delete("/api/products/:id", auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).send("Access denied");
  await Product.findByIdAndDelete(req.params.id);
  res.send({ message: "Product deleted" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
