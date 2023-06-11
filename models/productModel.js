const mongoose = require('mongoose');
// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim: true,
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lovercase:true,
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type: Number,
        required:true,
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",

    },
    brand: {type: String,
        enum: ["Bloomy"],},
    quantity:{ 
        type: Number,
        required: true,
},
    sold: {
        type: Number,
        default: 0,
    },
    images: {
        type:Array
    },
    
    ratings: [{
        star: Number,
        postedby:{type:mongoose.Schema.Types.ObjectId, ref: "User"},
    }],
},
{timestamps: true,}
);
module.exports = mongoose.model('Product', productSchema); //Export the model