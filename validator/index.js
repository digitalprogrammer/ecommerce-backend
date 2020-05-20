const { check, validationResult } = require('express-validator');
exports.userSignupValidator =
    [
        check('name', 'Name must have more than 5 characters').not().isEmpty().isLength({ min: 5 }),   
        check('email', 'Your email is not valid').not().isEmpty(),
        check('password', 'Your password must be at least 5 characters').not().isEmpty().isLength({ min: 5 })
 
    ]

exports.userSignupValidation = (req,res,next)=>{
    const errors = validationResult(req);     

    if(errors){
        let error = errors.errors[0].msg       
        return res.status(400).json({error})
    }
    next()
}
