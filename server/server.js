const express=require('express');
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const mongoose = require('mongoose');
const { connectDb } = require('./config/db.js');


let app=express();
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);

app.get('/',(req,res)=>{
   res.send("hello from node js");
});
connectDb();
app.listen(5000,()=>{
  console.log("server running on port 5000");
  
});
