const express = require("express");

const router = express.Router();

router.post("/register", (req, res) => {
    console.log(req.body);

    res.json({
        success: true,
        message: "Registration request received",
        data: req.body
    });
});
module.exports = router;