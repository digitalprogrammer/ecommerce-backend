const express = require('express')
const router = express.Router()

const { userById, read, update, purchaseHistory } = require('../controllers/user')
const {requireSignin,isAdmin,isAuth} = require('../controllers/auth')

//when userId parameter appear on the url this will be execcuted
router.param('userId',userById)

router.get('/secret/:userId', requireSignin, isAdmin,(req,res)=>{
    res.json({
        user:req.profile
    })
})

//read the user info
router.get('/user/:userId',requireSignin,isAuth,read)
router.put('/user/:userId',requireSignin,isAuth,update)
router.get('/orders/by/user/:userId',requireSignin,isAuth,purchaseHistory)

module.exports = router     