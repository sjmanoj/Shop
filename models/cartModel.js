const mongoose = require('mongoose')

var cartSchema = new mongoose.Schema(
    {
      products: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Products",
          },
          count: Number,
          color: String,
          price: Number,
        },
      ],
      cartTotal: Number,
      orderby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    },
    {
      timestamps: true,
    }
  )

module.exports = mongoose.model('Carts', cartSchema)