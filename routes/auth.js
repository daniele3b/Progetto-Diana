const Joi = require('joi');
const bcrypt = require('bcrypt');
const {User} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

/**
* @swagger 
* /auth/email:
*  post:
*    tags: [Auth]
*    description: Used to authenticate a user when he is going to login with email and password
*    responses:
*       '200':
*         description: User has authenticated succesfully, and he received token
*         schema:
*           type: string
*       '400':
*         description: Invalid email or password
*/

router.post('/email', async (req, res) => {
    const { error } = validateReqEmail(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
  
    let user = await User.findOne({email: req.body.email})
    if(!user) return res.status(400).send('Invalid email or password');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).send('Invalid email or password');
    
    const token = user.generateAuthToken();
    res.status(200).send(token);
});

/**
* @swagger 
* /auth/phone:
*  post:
*    tags: [Auth]
*    description: Used to authenticate a user when he is going to login with phone and password
*    responses:
*       '200':
*         description: User has authenticated succesfully, and he received token
*         schema:
*           type: string
*       '400':
*         description: Invalid phone or password
*/

router.post('/phone', async (req, res) => {
    const { error } = validateReqPhone(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({phone: req.body.phone})
    if(!user) return res.status(400).send('Invalid phone or password');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).send('Invalid phone or password');
  
    const token = user.generateAuthToken();
    res.status(200).send(token);
});

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

module.exports = router;