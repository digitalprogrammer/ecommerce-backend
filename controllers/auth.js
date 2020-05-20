const User = require('../models/user')
const {errorHandler} = require('../helpers/dbErrorHandler')
const jwt = require('jsonwebtoken')//generate signed token
const expressJwt = require('express-jwt')//for auhorization check


exports.signup = (req,res)=>{    
    const user = new User(req.body)
    user.save((error,user)=>{
        if(error){
            return res.status(400).json({
                error:errorHandler(error)
            })
        }
        user.salt = undefined
        user.hashed_password = undefined
        res.json({user})
    })
}

exports.signin = (req,res)=>{

    //find user based on email
    const {email,password} = req.body 
    User.findOne({email},(error,user)=>{
        if(error||!user){
            return res.status(400).json({
                error:"User with that email does not exist"
            })
        }
        //if user is found then check if the email and password match        
        //create authenticate method in user model
        if(!user.authenticate(password)){
            return res.status(401).json({
                error:"Email and password do not match"
            })
        }

        //generate a signed token with user id and secret
        const token = jwt.sign({_id:user._id},process.env.JWT_SECRET)

        //persist the token as 't' in cookie with expiry date
        res.cookie('t',token,{expire:new Date() + 9999})

        //return response with user and token to frontend client
        const {_id,name,email,role} = user
        return res.json({token,user:{_id,email,name,role}})
    })
}

exports.signout = (req,res)=>{

    //remove the token from cookie
    res.clearCookie('t')
    res.json({message:"Signout success"})
} 

exports.requireSignin = expressJwt({
    secret:process.env.JWT_SECRET,
    userProperty:"auth"
})


//allows user make changes to their own properties.
//   They could not make change to another user properties
exports.isAuth = (req,res,next)=>{
    let user = req.profile && req.auth && req.profile._id == req.auth._id
    
    if(!user){
        return res.status(403).json({
            error:"Access denied, you do not have authorization"
        })
    }
    next()
}

exports.isAdmin = (req,res,next)=>{
    if(req.profile.role === 0)
    {
        return res.status(403).json({
            error:"Access denied, you are not a admin"
        })
    }
    next()
}