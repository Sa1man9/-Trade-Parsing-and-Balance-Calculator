const express = require('express');
const { addTrades, getBalence } = require('../controllers/Trade');
const router= express.Router();

router.post("/addTrades",addTrades);
router.get("/getBalence/:userId",getBalence)

module.exports=router