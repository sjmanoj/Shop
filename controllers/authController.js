const asyncHandler = require('express-async-handler')
const Users = require('../models/userModel')
const CryptoJS = require('crypto-js')
const jwt = require('jsonwebtoken')
const { generateRefreshAccessToken } = require('../config/refreshToken')

//To Register a User
userRegister = asyncHandler(async(req,res)=>{
    const { username, email, password } = req.body
    if (!username | !email | !password){
        res.status(400)
        throw new Error('All fields are mandatory')
    }

    const userAvailable = await Users.findOne({username})
    if (userAvailable){
        throw new Error('UserName Taken')
    }
    else{
        const hashedPassword = CryptoJS.AES.encrypt(password, process.env.PASSWORD_KEY).toString()
        const user = await Users.create({
        username, email, password:hashedPassword
    })
    if (user){
        const { password, ...others} = user._doc
        res.status(201).json(others)
    }
    else{
        res.status(400)
        throw new Error('Data not valid')
    }
    }
    
})

//To Login using existing Users
loginUser = asyncHandler(async(req,res)=>{
    const { username, password } = req.body
    if (!username | !password){
        res.status(400)
        throw new Error('All fields are mandatory')
    }
    const user = await Users.findOne({username})
    
    if (!user){
        res.status(400)
        throw new Error('No such User')
    }
    const decryptedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASSWORD_KEY).toString(CryptoJS.enc.Utf8)
    if (decryptedPassword!=password){
        res.status(400)
        throw new Error('Invalid Password')
    }
    const accessToken = jwt.sign({
        _id: user._id,
        isAdmin: user.isAdmin,
    }, process.env.JWT_KEY,{expiresIn: '1d'})

    //handle refresh token
    // const refreshToken = await generateRefreshAccessToken(user._id)
    // const userUpdated = await Users.findByIdAndUpdate(user._id, {
    //     refreshToken: refreshToken
    // }, {new: true})
    // res.cookie('refreshToken', refreshToken, {
    //     httpOnly: true,
    //     maxAge: 72 * 60 * 60 * 1000
    // })

    res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email, 
        accessToken
    })
})



module.exports = { userRegister, loginUser }





//logoutUser = asyncHandler(async(req,res)=>{})

//handle refresh Token
// handleRefreshToken = asyncHandler(async(req,res)=>{
//     const cookie = req.cookies
//     console.log(cookie)
//     if (!cookie.refreshToken) throw new Error('No Refresh Token in Cookies')
//     const refreshToken = cookie.refreshToken
//     console.log(refreshToken)
//     const user = await Users.findOne({refreshToken})
//     if (!user) throw new Error('No Refresh Token present in the DB')
//     jwt.verify(refreshToken, process.env.JWT_KEY, (err,decoded)=>{
//         if (err || user._id == decoded._id) throw new Error('There is something wrong with the Refresh Token')
//         const accessToken = jwt.sign({
//             _id: user._id,
//             isAdmin: user.isAdmin,
//         }, process.env.JWT_KEY,{expiresIn: '60m'}) 
//         res.json({accessToken})
//     })
// })
