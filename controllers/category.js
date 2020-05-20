const Category = require('../models/category')
const {errorHandler} = require('../helpers/dbErrorHandler')


//create a category
exports.create = (req,res)=>{
    const category = new Category(req.body)
    category.save((error,data)=>{
        if(error){
            return res.status(400).json({
                error: errorHandler(error)
            })
        }
        res.json({data})
    })
}

//take the category by its id from the DB
exports.categoyById = (req,res,next,id)=>{
    Category.findById(id).exec((error,category)=>{
        if(error || !category){
            return res.status(400).json({
                error:"Category does not exist"
            })
        }
        req.category = category
        next()
    })
}

//serves the category type as a json
exports.read = (req,res)=>{
    return res.json(req.category)
}

//update a category from DB
exports.update = (req,res)=>{
    const category = req.category
    category.name = req.body.name
    category.save((error,data)=>{
        if(error){
            return res.satus(400).json({
                error:errorHandler(error)
            })
        }
        res.json(data)
    })
}

//remove a category from DB
exports.remove = (req, res) => {
    const category = req.category   
    category.remove((error, data) => {
        if (error) {
            return res.satus(400).json({
                error: errorHandler(error)
            })
        }
        res.json({
            message:'Category was deleted'
        })
    })
}

//take all the categories from DB
exports.list = (req, res) => {
    Category.find().exec((error,data)=>{
        if(error){
            return res.status(400).json({
                error:errorHandler(error)
            })
        }
        res.json(data)
    })
}

