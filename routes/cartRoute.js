const { createCart, getUserCart, emptyUserCart } = require('../controllers/cartController')
const { validateTokenAndAuth, AdminAuth, validateToken } = require('../middlewares/validateTokenHandler')
const router = require('express').Router()

router.post('/', validateToken, createCart)

router.get('/get-user-cart', validateToken, getUserCart)

router.delete('/empty-user-cart', validateToken, emptyUserCart)

module.exports = router