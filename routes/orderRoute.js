const { createOrder, getOrders, getOrder, getUserOrders, deleteOrder, updateOrderStatus } = require('../controllers/orderController')
const { validateTokenAndAuth, AdminAuth, validateToken } = require('../middlewares/validateTokenHandler')
const router = require('express').Router()

router.post('/', validateToken, createOrder)

router.get('/', AdminAuth, getOrders)

router.get('/user-orders', validateToken, getOrders)

router.get('/:id', validateTokenAndAuth, getOrder)

router.delete('/:id', AdminAuth, deleteOrder)

router.put('/:id', AdminAuth, updateOrderStatus)

module.exports = router