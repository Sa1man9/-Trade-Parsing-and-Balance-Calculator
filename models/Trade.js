const mongoose=require("mongoose")

const tradeSchema= new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    utc_time: {
        type: Date,
        required: true
    },
    operation: {
        type: String,
        enum: ['Buy', 'Sell'],
        required: true
    },
    market: {
        type: String,
        required: true
    },
    base_currency: {
        type: String,
        required: true
    },
    quote_currency: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }

})

module.exports=mongoose.model('Trade',tradeSchema)