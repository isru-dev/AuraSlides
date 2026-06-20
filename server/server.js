const express=require('express');
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");


let app=express();
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);


app.listen(5000,()=>{
  console.log("server running on port 5000");
  
});