const fs = require('fs');
const csvParser = require('csv-parser');
const Trade = require('../models/Trade');

exports.addTrades = async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({
                success:false,
                message:"No files were uploaded"
            });
          }
          const csvFile = req.files.file;
          if (!csvFile.name.endsWith('.csv')) {
            return res.status(400).json({
                success:false,
                message:"Please upload a CSV file."
            });
          }   

          let path=__dirname +"/files/"+Date.now()+`.${csvFile.name.split('.')[1]}`
          
          csvFile.mv(path, async (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Error moving file",
                });
            }

        const trades = [];

            fs.createReadStream(path)
                .pipe(csvParser({
                    separator: ',', 
                    headers: ['User_ID', 'UTC_Time', 'Operation', 'Market', 'Buy/Sell Amount', 'Price'],
                    skipEmptyLines: true
                }))
                .on('data', (row) => {
                    trades.push({
                        user_id: row['User_ID'],
                        utc_time: (row['UTC_Time']),
                        operation: row['Operation'],
                        market: row['Market'],
                        base_currency: row['Market'].split('/')[0], 
                        quote_currency: row['Market'].split('/')[1], 
                        quantity: parseFloat(row['Buy/Sell Amount']), 
                        price: parseFloat(row['Price']) 
                    });
                }).on("end",async()=>{
                    try {
                    trades.shift()
                    console.log(trades)
                    await Trade.insertMany(trades)
                    fs.unlinkSync(path);
                    
                    res.status(200).json({
                        success: true,
                        message: "Trade info added successfully",
                        data: trades
                    });
                } catch (dbError) {
                    console.error(dbError);
                    res.status(500).json({
                        success: false,
                        message: "Error saving trade info to database",
                    });
                }
                }).on('error', (parseError) => {
                    console.error(parseError);
                    res.status(500).json({
                        success: false,
                        message: "Error parsing CSV file",
                    });
                });
            });

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

exports.getBalence= async (req,res) => {
    try{
        const userId=req.params.userId;
        const {timestamp}=req.body;

        const endTime = new Date(timestamp);

        const trades = await Trade.find({
            user_id: userId,
             utc_time: { $lte: endTime } 
            });

        const balance = {};

        trades.forEach(trade => {
            const { base_currency, operation, quantity } = trade;

            if (!balance[base_currency]) {
                balance[base_currency] = 0;
            }

            if (operation === 'Buy') {
                balance[base_currency] += quantity;
            } else if (operation === 'Sell') {
                balance[base_currency] -= quantity;
            }
        });

        res.status(200).json({
            success: true,
            message:"Balence Fetched Successfully",
            balance
        });
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }  
};