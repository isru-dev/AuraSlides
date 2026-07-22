const express=require('express');
const cors = require("cors");
require("dotenv").config(); // Load environment keys first
const authRoutes = require("./routes/authRoutes");
const presentationRoutes=require('./routes/presentationRoutes.js')
const gogleauthRoutes=require('./routes/gogleauthRoutes.js');
const aiRoutes=require('./routes/aiRoutes.js');
const mongoose = require('mongoose');
const { connectDb } = require('./config/db.js');

let app=express();
app.use(express.json());
app.use(cors());

const PORT=process.env.PORT || 5000;
app.use("/api/auth", authRoutes);
app.use("/api/presentation",presentationRoutes);
app.use("/api/auth/google",gogleauthRoutes);
app.use("/api/ai",aiRoutes);
connectDb();
app.listen(PORT,()=>{
  console.log("server running on port "+ PORT);
  
});
