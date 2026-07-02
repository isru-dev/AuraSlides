const express=require('express');
const cors = require("cors");
require("dotenv").config(); // Load environment keys first
const authRoutes = require("./routes/authRoutes");
const slideRoutes = require("./routes/slides.js");
const presentationRoutes=require('./routes/presentationRoutes.js')
const mongoose = require('mongoose');
const { connectDb } = require('./config/db.js');
const express = require("express");
const session = require("express-session");
const passport = require("passport");
require("./config/passport");

let app=express();
app.use(express.json());
app.use(cors());



app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
const PORT=process.env.PORT || 5000;
app.use("/api/auth", authRoutes);
app.use("/api/presentation",presentationRoutes);

app.get('/',(req,res)=>{
   res.send("hello from node js");
});
connectDb();
app.listen(PORT,()=>{
  console.log("server running on port "+ PORT);
  
});
