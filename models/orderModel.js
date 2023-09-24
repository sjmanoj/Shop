const mongoose = require('mongoose')

var orderSchema = new mongoose.Schema(
    {
      products: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Products"
        },
          count: {
            type: Number
        },
          color: {
            type: String,
        },
    }],
      paymentIntent: {},
      orderStatus: {
        type: String,
        default: "Not Processed",
        enum: [
          "Not Processed",
          "Cash on Delivery",
          "Processing",
          "Dispatched",
          "Cancelled",
          "Delivered",
        ],
      },
      orderby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    },
    {
      timestamps: true,
    }
)

module.exports = mongoose.model('Orders', orderSchema)