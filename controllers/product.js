const Product = require('../models/product')
const formidable = require('formidable')
const _ = require('lodash')
//access to the file system
const fs = require('fs')


const { errorHandler } = require('../helpers/dbErrorHandler')

//send the from database to the frontend by the id
//When the product id appear on the URL then it 
//   provide the product info in the req.product
exports.productById =(req,res,next,id)=>{
    Product.findById(id)
    .populate('category')
    .exec((error,product)=>{
        if(error || !product){
            return res.status(400).json({
                error:'Product not found'
            })
        }
        req.product = product
        next()
    })
}

//allow just the content to frontend,
//   letting the photo to another operation
//   This make the application more fast
exports.read = (req,res)=>{
    req.product.photo = undefined 
    return res.json(req.product)
}

//create a product
exports.create = (req, res) => {
   let form = new formidable.IncomingForm()
   form.keepExtensions = true
   form.parse(req,(error,fields,files)=>{
       if(error){
           return res.status(400).json({
               error:'Image could not be uploaded'
           })
       }

       //verify if all the product fields are present
       const {name,description,price,category,quantity,shipping} = fields
       if(!name || !description || !price || !category || !quantity || !shipping ){
           return res.status(400).json({
               error:"All fields are required!"
           })
       }

       let product = new Product(fields)

       //verify the photo size, photos bigger then 1MB are refused
       if(files.photo){
           if(files.photo.size > 1000000){
               return res.status(400).json({
                   error:"Image should be less then 1MB in size"
               })
           }
           product.photo.data = fs.readFileSync(files.photo.path)
           //photo extension ex: png
           product.photo.contentType = files.photo.type
       }

       product.save((error,result)=>{
           if(error){
               return res.status(400).json({
                   error:errorHandler(error)
               })
           }
           res.json(result)
       })
   })
}

//remove the product from DB
exports.remove = (req,res)=>{
     let product = req.product
     product.remove((error,deletedProduct)=>{
         if(error){
             return res.status(400).json({
                 error:errorHandler(error)
             })
         }
         res.json({            
             "message":'Product deleted successfully'
         })
     })
}

//Update the product
exports.update = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req, (error, fields, files) => {
        if (error) {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            })
        }       

        let product = req.product
        product = _.extend(product,fields)

        //verify the photo size, photos bigger then 1MB are refused
        if (files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less then 1MB in size"
                })
            }
            product.photo.data = fs.readFileSync(files.photo.path)
            //photo extension ex: png
            product.photo.contentType = files.photo.type
        }

        product.save((error, result) => {
            if (error) {
                return res.status(400).json({
                    error: errorHandler(error)
                })
            }
            res.json(result)
        })
    })
}

//return a list of products based on some queries
exports.list = (req,res)=>{
    let order = req.query.order ? req.query.order : 'asc'
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
    let limit = req.query.limit ? parseInt(req.query.limit) : 6

    Product.find()
    .select("-photo")
    .populate('category')
    .sort([[sortBy,order]])
    .limit(limit)
    .exec((error,data)=>{
        if(error){
            console.log(error)
            return res.status(400).json({                
                error:'Products not found'
            })
        }
        res.json(data)
    })
}

//return a list of all the related products based on the category
exports.listRelated = (req,res)=>{
    let limit = req.query.limit ? parseInt(req.query.limit) : 6
//find all the products related in the same category 
//   letting out the main search product itself
    Product.find({_id:{$ne:req.product},category:req.product.category})
    .limit(limit)
    .populate('category','_id name')
    .exec((error,products)=>{
        if(error){
            return res.status(400).json({
                error: "Products not found"
            })
        }
        res.json(products)
    })
}

//return a list of categories based on a product
exports.listCategories = (req,res) =>{
    Product.distinct('category',{},(error,categories)=>{
        if (error) {
            return res.status(400).json({
                error: "Categories not found"
            })
        }
        res.json(categories)
    })
}


/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */
exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};

    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);

    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    Product.find(findArgs)
        .select("-photo")
        .populate("category")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};

//return product photo
exports.photo = (req,res) =>{
    if(req.product.photo.data){
        res.set('Content-Type',req.product.photo.contentType)
        return res.send(req.product.photo.data)
    }
    next()
}

exports.listSearch = (req,res)=>{
    //create query object to hold search value and category value
    const query = {}
    if(req.query.search){
        query.name = {$regex:req.query.search,$options:'i'}
        //assign category value to  query.category
        if(req.query.category && req.query.category != 'All'){
            query.category = req.query.category
        }
        //find the product based on query object with 2 properties
        //search and category
        Product.find(query,(error,products)=>{
            if(error){
                return res.status(400).json({
                    error:errorHandler(error)
                })
            }
            res.json(products)
        })
        .select('-photo')
    }
}

//decrease the product quantity and increase the sold quantity
exports.decreaseQuantity = (req,res,next) =>{
    let bulkOps = req.body.order.products.map((item)=>{
        return {
            updateOne:{
                filter:{
                    _id:item._id
                },
                update:{$inc:{quantity:-item.count,sold:+item.count}}
            }
        }
    })

    Product.bulkWrite(bulkOps,{},(error,products)=>{
        if(error){
            return res.status(400).json({
                error:'Could not update product'
            })
        }
        next()
    })
}