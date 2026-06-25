const express=require('express');
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const mongoose = require('mongoose');


let app=express();
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);

app.get('/',(req,res)=>{
   res.send("hello from node js");
});
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
  console.log("database connected");
})
.catch((err)=>{
  console.error(err);

});
app.listen(5000,()=>{
  console.log("server running on port 5000");
  
});
