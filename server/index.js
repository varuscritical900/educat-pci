//import
//old way to import
// const express = require('express');

//new way to import
import express from "express";
import cors from 'cors';
import mongoose from 'mongoose';
import { userRouter } from "./routes/User.js";
import cookieParser from 'cookie-parser';

mongoose.connect('mongodb+srv://varuscritical900:Password123@educatdata.abuoxfo.mongodb.net/educatUsers', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

const app = express();

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: ['http://localhost:3000', 'http://localhost:8080']
}));

//routes
app.use('/api', userRouter);


//connection
let port = 8000;
app.listen(port, ()=> console.log(`SERVER STARTED at port ${port}`));

//**************** */

// Sample data for products
const Product = mongoose.model('Product', {
    id: Number,
    name: String,
    availableStock: Number,
  });
  
  // Order model
  const Order = mongoose.model('Order', {
    productId: Number,
    quantity: Number,
    userId: String,
  });

  // Middleware to verify token for authenticated requests
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).send('Unauthorized request');
    }
  
    try {
      const decoded = jwt.verify(token, 'secret_key');
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(400).send('Invalid token');
    }
  };

  // Seed products data on server start
const seedProducts = () => {
    Product.insertMany([
      { id: 1, name: 'Product 1', availableStock: 10 },
      { id: 2, name: 'Product 2', availableStock: 20 },
      { id: 3, name: 'Product 3', availableStock: 30 },
    ]);
  };

  // Get products
app.get('/api/products', verifyToken, async (req, res) => {
    try {
      const products = await Product.find({});
      res.status(200).send(products);
    } catch (error) {
      res.status(500).send('Internal server error');
    }
  });
  
  // Place order
  app.post('/api/orders', verifyToken, async (req, res) => {
    const { productId, quantity } = req.body;
    const product = await Product.findOne({ id: productId });
  
    if (!product) {
      return res.status(404).send('Product not found');
    }
  
    if (product.availableStock < quantity) {
      return res.status(400).send('Failed to order this product due to unavailability of the stock');
    }
  
    product.availableStock -= quantity;
    await product.save();
  
    const order = new Order({
      productId,
      quantity,
      userId: req.user.id,
    });
  
    await order.save();
  
    return res.status(200).send('You have successfully ordered this product');
  });
  
  // Get orders for current user
  app.get('/api/orders', verifyToken, async (req, res) => {
    try {
      const orders = await Order.find({ userId: req.user.id });
      res.status(200).send(orders);
    } catch (error) {
      res.status(500).send('Internal server error');
    }
  });