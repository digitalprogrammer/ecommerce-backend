const express = require('express')
const router = express.Router()

const { listSearch,create, photo, listBySearch, listCategories, productById, read, remove, update, list, listRelated } = require('../controllers/product')
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth')
const { userById } = require('../controllers/user')

//when userId parameter appear on the url this will be execcuted
router.param('userId', userById)
router.param('productId', productById)

router.get('/product/:productId',read)
router.post('/product/create/:userId', requireSignin, isAuth, isAdmin, create)
router.delete('/product/:productId/:userId', requireSignin, isAuth, isAdmin,remove)
router.put('/product/:productId/:userId', requireSignin, isAuth, isAdmin, update)
router.get('/products',list)
router.get('/products/search',listSearch)
router.get('/products/related/:productId',listRelated)
router.get('/products/categories',listCategories)
// route - make sure its post
router.post("/products/by/search", listBySearch);
router.get('/product/photo/:productId',photo)
module.exports = router  