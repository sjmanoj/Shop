const asyncHandler = require('express-async-handler')
const Users = require('../models/userModel')
const Carts = require('../models/cartModel')
const Products = require('../models/productModel')
const Orders = require('../models/orderModel')
const uniqid = require('uniqid')

createOrder = asyncHandler(async(req,res)=>{
    const COD = req.body
    const userId = req.user._id
    if (!COD) throw new Error('Cash Order is Mandatory')
    const user = await Users.findById(userId)
    const userCart = await Carts.findOne({orderby: user._id})
    const finalAmount = userCart.cartTotal
    const newOrder = await new Orders({
        products: userCart.products,
        paymentIntent: {
            id: uniqid(),
            method: 'COD',
            amount: finalAmount,
            status: 'Cash on Delivery',
            created: Date.now(),
            currency: 'INR'
        },
        orderby: user._id,
        orderStatus: 'Cash on Delivery'
    }).save()
    let update = userCart.products.map((item)=>{
        return {
            updateOne: {
                filter: { _id: item.productId._id},
                update: {$inc: {quantity: -item.count, sold: +item.count}}
            }
        }
    })
    let updated = await Products.bulkWrite(update, {})
    res.json({message: 'Success'})
})

getOrders = asyncHandler(async(req,res)=>{
    userId = req.user._id
    const userOrders = await Orders.find()
    res.json(userOrders)
})

getOrder = asyncHandler(async(req,res)=>{
    const userOrder = await Orders.findById(req.params.id)
    res.json(userOrder)
})

getUserOrders = asyncHandler(async (req, res) => {
    const userId= req.user
    const userOrders = await Orders.findOne({ orderby: userId })
        .populate("products.productId")
        .populate("orderby")
        .exec()
    res.json(userOrders)
})

deleteOrder = asyncHandler(async(req,res)=>{
    const userOrderAvailable = await Orders.findById(req.params.id)
    await Orders.findByIdAndDelete(req.params.id)
    res.json(userOrderAvailable)
})

updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body
    const updateOrderStatus = await Orders.findByIdAndUpdate(
        req.params.id,
        {
          orderStatus: status,
          paymentIntent: {status: status}
        },
        { new: true }
      )
      res.json(updateOrderStatus);
    
})
module.exports = { createOrder, getOrders, getOrder, getUserOrders, deleteOrder, updateOrderStatus }