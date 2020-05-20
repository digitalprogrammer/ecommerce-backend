const express = require('express')
const router = express.Router()

const { signup, signin, signout, requireSignin} = require('../controllers/auth')
const { userSignupValidator, userSignupValidation} = require('../validator/index')


router.post('/signup', userSignupValidator, userSignupValidation, signup)
router.post('/signin',signin)
router.get('/signout',signout)


module.exports = router     