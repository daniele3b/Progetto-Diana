const Joi = require('joi');

function validateReqEmail(req) {
    const schema = {
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(1024).required()
    };
  
    return Joi.validate(req, schema);
}

function validateReqPhone(req) {
    const pattern = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/

    const schema = {
        phone: Joi.string().regex(pattern).required(),
        password: Joi.string().min(5).max(1024).required()
    };

    return Joi.validate(req, schema);
}

exports.validateReqEmail = validateReqEmail
exports.validateReqPhone = validateReqPhone