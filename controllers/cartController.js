const asyncHandler = require('express-async-handler')
const Users = require('../models/userModel')
const Carts = require('../models/cartModel')
const Products = require('../models/productModel')

//Create your Cart
createCart = asyncHandler(async(req,res)=>{
    const userId = req.user._id
    console.log(userId)
    if (!userId){
        res.status(400)
        throw new Error('No such user Found')
    }
    const userAvailable = await Users.findById(userId)
    const {cart} = req.body
    console.log(userAvailable);
    let products = []
    const cartAvailable = await Carts.findOne({orderby: userAvailable._id})
    if (cartAvailable){
        await Carts.findOneAndDelete(cartAvailable)
    }
    for (let i=0; i<cart.length; i++){
        let object = {}
        object.productId = cart[i].productId,
        object.count = cart[i].count,
        object.color = cart[i].color
        let getPrice = await Products.findById(cart[i].productId).select('price')
        object.price = getPrice.price
        products.push(object)
    }
    let cartTotal = 0
    for (let i=0; i<products.length; i++){
        cartTotal = cartTotal + products[i].price * products[i].count
    }
    let newCart = await new Carts({
        products, cartTotal, orderby: userId
    }).save()
    res.json(newCart)
})

//Get your User Cart
getUserCart = asyncHandler(async(req,res)=>{
    userId = req.user._id
    const cartAvailable = await Carts.findOne({orderby: userId}).populate("products.productId")
    res.json(cartAvailable)
})

//Empty your User Cart
emptyUserCart = asyncHandler(async (req, res) => {
    userId = req.user._id
    const cartAvailble = await Carts.findOne({ orderby: userId })
    //console.log(cartAvailble);
    await Carts.findOneAndDelete({ orderby: userId })
    res.json(cartAvailble);
})

module.exports = { createCart, getUserCart, emptyUserCart }