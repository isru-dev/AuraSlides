const express = require("express");

const router = express.Router();
router.get("/reg", (req, res) => {
  res.send("yes sir");
});
router.get("/", (req, res) => {
  res.send("hello from /");
});
router.post("/register", (req, res) => {
  const { email, password, confirmPassword } = req.body;
  // Check if all fields are provided
  if (!email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match.",
    });
  }

  // Check password length
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters.",
    });
  }

  // Simple email validation
  if (!email.includes("@")) {
    return res.status(400).json({
      success: false,
      message: "Invalid email address.",
    });
  }

  // Everything is valid
  res.status(200).json({
    success: true,
    message: "Registration request received.",
    data: {
      email,
    },
  });
});
router.post("/login", (req, res) => {
  const {email,password}=req.body;
    if (!email || !password ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }
   if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters.",
    });
  }

  // Simple email validation
  if (!email.includes("@")) {
    return res.status(400).json({
      success: false,
      message: "Invalid email address.",
    });
  }
  if(email==="isru@gmail.com" && password==="12345678"){
   // res.redirect('');
   console.log("login successfully");
   
  }
res.status(200).json({
    success: true,
    message: "login successfully. wellcome"+" "+email,
    data: {
      email,
    },
  });

});
module.exports = router;
