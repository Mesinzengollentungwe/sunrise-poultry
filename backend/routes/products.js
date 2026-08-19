import { Router } from "express";
import { products } from "../data/products.js";

const router = Router();

// GET /api/products — list all products, optional ?category= filter
router.get("/", (req, res) => {
  const { category } = req.query;
  const list = category
    ? products.filter((p) => p.category.toLowerCase() === category.toLowerCase())
    : products;
  res.json({ products: list });
});

// GET /api/products/:id — single product
router.get("/:id", (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ product });
});

export default router;
