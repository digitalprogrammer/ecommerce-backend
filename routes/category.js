const express = require('express')
const router = express.Router()

const { create, categoyById, read, list,update,remove} = require('../controllers/category')
const {requireSignin,isAuth,isAdmin} = require('../controllers/auth')
const { userById } = require('../controllers/user')

//when userId parameter appear on the url this will be execcuted
router.param('userId', userById)
router.param('categoryId',categoyById)

router.post('/category/create/:userId',requireSignin,isAuth,isAdmin, create)
router.put('/category/:categoryId/:userId',requireSignin,isAuth,isAdmin, update)
router.delete('/category/:categoryId/:userId',requireSignin,isAuth,isAdmin, remove)
//get a single category
router.get('/category/:categoryId',read)
//get all categiries
router.get('/categories',list)

module.exports = router  