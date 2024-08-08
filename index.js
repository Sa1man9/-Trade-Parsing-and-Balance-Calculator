const express=require("express");
const app=express();

const database = require("./config/database");
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT||4000
database.connect();

app.use(express.json());
const fileUpload = require("express-fileupload");
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

const tradeRoutes=require("./routes/Trade")

app.use("/api/v1/trade",tradeRoutes);

app.get("/", (req,res)=>{
    return res.json({
        success:true,
        message:"server is running"
    });
});

app.listen(PORT, ()=>{
    console.log(`app is running on ${PORT}`)
});