//import
import express from "express";
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
//middleware
app.use(express.json());
app.use(cors());

//routes

//connection

let port = 3001;

app.listen(port, ()=> console.log(`Server is Running ${port}`));