const asyncHandler = require('express-async-handler')
const Products = require('../models/productModel') 
const Users = require('../models/userModel') 
const slugify = require('slugify')
const { json } = require('express')

//Get all Products - All Users can access
getProducts = asyncHandler(async(req,res)=>{ 
    const products = await Products.find(req.query)
    if (!products) throw new Error('No Products Present')
    res.status(200).json(products)
})

//Get one Product - All Users can access
getProduct = asyncHandler(async(req,res)=>{
    const productAvailable = await Products.findById(req.params.id)
    if (!productAvailable){
        res.status(400)
        throw new Error('No Product Available')
    }
    res.status(200).json(productAvailable)
})

//Create a Product - Only Admin can access
createProduct = asyncHandler(async(req,res)=>{
    const { title, price } = req.body
    if (!title | !price){
        throw new Error('All are mandatory')
    }
    if (title) req.body.slug = slugify(title)
    const product = await Products.create(req.body)
    res.status(201).json(product)
    

})

//Update a Product - Only Admin can access
updateProduct = asyncHandler(async(req,res)=>{
    if (req.body.title) req.body.slug = slugify(req.body.title)
    const productAvailable = await Products.findById(req.params.id)
    if (!productAvailable){
        res.status(400)
        throw new Error('No Product Available')
    }
    const productUpdated = await Products.findByIdAndUpdate(req.params.id, req.body, {new: true})
    res.status(200).json(productUpdated)
    
})

//Delete a Product - Only Admin can access
deleteProduct = asyncHandler(async(req,res)=>{
    const productAvailable = await Products.findById(req.params.id)
    if (!productAvailable){
        res.status(400)
        throw new Error('No Product Available')
    }
    await Products.findByIdAndDelete(req.params.id)
    res.status(200).json(productAvailable)
})

addToWishlist = asyncHandler(async(req,res)=>{
    const userId = req.user._id
    const {productId} = req.body
    const user = await Users.findById(userId)
    if (!user) throw new Error('No such User found')
    console.log(user.wishlist);
    const productAlreadyAdded = user.wishlist.find((id) => id.toString() === productId)
    if (productAlreadyAdded){
        let user = await Users.findByIdAndUpdate(userId, {
            $pull: {wishlist: productId},  
        },
        {new: true})
        res.json(user)
    }else{
        let user = await Users.findByIdAndUpdate(userId, {
            $push: {wishlist: productId},  
        },
        {new: true})
        res.json(user)
    }
})

rating = asyncHandler(async(req,res)=>{
    const userId = req.user._id
    const {star, productId, comments} = req.body
    const user = await Users.findById(userId)
    if (!user) throw new Error('No such User found')
    const product = await Products.findById(productId)
    if (!product) throw new Error('No such product found')
    let productAlreadyRated = product.ratings.find((id)=>id.postedby.toString()===userId)
    if (productAlreadyRated){
        const updateRating = await Products.updateOne(
            {ratings: {$elemMatch: productAlreadyRated}},
            {$set: {"ratings.$.star": star, "ratings.$.comments": comments}}
        ,{new: true})
    }else{
        const rateProduct = await Products.findByIdAndUpdate(productId, {
            $push: { ratings: 
                {star: star, comments: comments, postedby: userId} 
            }
        },{new: true})
        //res.json(rateProduct)
    }

    const getAllRatings = await Products.findById(productId) 
    const totalRatings = getAllRatings.ratings.length
    const ratingSum = getAllRatings.ratings
    .map((item)=>item.star)
    .reduce((a,b)=> a+b )
    const actualRating = Math.round(ratingSum/totalRatings)
    console.log(getAllRatings, totalRatings, ratingSum ,actualRating);
    const productRating = await Products.findByIdAndUpdate(productId, 
        {totalRatings: actualRating}, {new: true} )
        res.json(productRating)
        console.log(productRating)
})

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addToWishlist, rating }