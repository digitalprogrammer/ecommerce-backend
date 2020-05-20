const User = require('../models/user')
const {errorHandler} = require('../helpers/dbErrorHandler')
const {Order} = require('../models/order')

//If you want to collect the user info to display
//   in some place as dashboard, you make it by his id
exports.userById = (req,res,next,id)=>{
    User.findById(id).exec((error,user)=>{
        if(error || !user){
            return res.status(400).json({
                error:"User not found"
            })
        }
        req.profile = user
        next()
    })
}

//passes the user profile to be access
exports.read = (req,res) =>{
    req.profile.hashed_password = undefined
    req.profile.salt = undefined

    return res.json(req.profile)
}

//update the profile of the user
exports.update = (req,res) =>{
    User.findOneAndUpdate({_id:req.profile._id},{$set:req.body},{new:true},(error,user)=>{
        if(error){
            return res.status(400).json({
                error:'You ate not authorized to perform this action'
            })
        }
        user.hashed_password = undefined
        user.salt = undefined
        res.json(user)
    })
}

exports.addOrderToUserHistory = (req,res,next)=>{
    let history = []
    req.body.order.products.forEach((item) =>{
        history.push({
            _id:item._id,
            name:item.name,
            description:item.category,
            quantity:item.count,
            transaction_id:req.body.order.transaction_id,
            amount:req.body.order.amount
        })
    })

    User.findOneAndUpdate({_id:req.profile._id},{$push:{history:history}},{new:true},(error,data)=>{
        if(error){
            return res.status(400).json({
                error:'Could not update user purchase history'
            })
        }
        next()
    }
    )
}

exports.purchaseHistory = (req,res)=>{
    Order.find({user:req.profile._id})
    .populate('user','_id name')
    .sort('-created')
    .exec((error,orders)=>{
        if(error){
            return res.status(400).json({
                error: errorHandler(error)
            })
        }
        res.json(orders)
    })
}