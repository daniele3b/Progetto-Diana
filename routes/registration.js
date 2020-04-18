const express = require('express')
const {User,validateUser}=require('../models/user')
const {calculateCF}=require('../helper/registration_helper')
const config = require('config')
const bcrypt=require('bcrypt')

const router = express.Router()



/**
 * @swagger
 * tags:
 *   name: Registration
 *   description: Registration management APIs
 */ 


/**
* @swagger 
* /registration/citizen:
*  post:
*    tags: [Chemical_Agents]
*    parameters:
*       - name: User object
*         description: object in JSON format with name,surname, birthdate(YYYY-MM-DD),birthplace,email or phone,password
*         
*    description: Use to create a new user account (type cittadino)
*    responses:
*       '200':
*         description: A successful request
*                                  
*       '404':
*         description: No data available
*/

router.post('/citizen' , async (req,res) => {
/*
    const {error} = validateUser(req.body)
    if (error)  return res.status(400).send(error.details[0].message)
*/

    
    let data=req.body.birthdate
    let array = data.split('-');
    const cf=calculateCF(req.body.name,req.body.surname,req.body.sex,array[2],array[1],array[0],req.body.birthplace)
  
    const resp=await User.find({CF:cf})
    if(resp.length==0) {
    let user=new User({
        CF:cf,
        type:'cittadino',
        name:req.body.name,
        surname:req.body.surname,
        sex:req.body.sex,
        birthdate:req.body.birthdate,
        birthplace:req.body.birthplace,
        email:req.body.email,
        phone:req.body.phone,
        password:req.body.password
    })

    const salt = await bcrypt.genSalt(config.get('pw_salt'));
    user.password = await bcrypt.hash(user.password, salt);

    

   const result= await user.save()
   res.status(200).send('User registered')
    }else
        res.status(404).send('User already registered')
  
})


/**
* @swagger 
* /registration/operator:
*  post:
*    tags: [Chemical_Agents]
*    parameters:
*       - name: User object
*         description: object in JSON format with name,surname, birthdate(YYYY-MM-DD),birthplace,email or phone,password
*         
*    description: Use to create a new user account (type operator)
*    responses:
*       '200':
*         description: A successful request
*                                  
*       '404':
*         description: No data available
*/

router.post('/operator' , async (req,res) => {
    /*
        const {error} = validateUser(req.body)
        if (error)  return res.status(400).send(error.details[0].message)
    */
    
        
        let data=req.body.birthdate
        let array = data.split('-');
        const cf=calculateCF(req.body.name,req.body.surname,req.body.sex,array[2],array[1],array[0],req.body.birthplace)
      
        const resp=await User.find({CF:cf})
        if(resp.length==0) {
        let user=new User({
            CF:cf,
            type:'operatore',
            name:req.body.name,
            surname:req.body.surname,
            sex:req.body.sex,
            birthdate:req.body.birthdate,
            birthplace:req.body.birthplace,
            email:req.body.email,
            phone:req.body.phone,
            password:req.body.password
        })
    
        const salt = await bcrypt.genSalt(config.get('pw_salt'));
        user.password = await bcrypt.hash(user.password, salt);
    
        
    
       const result= await user.save()
       res.status(200).send('User registered')
        }else
            res.status(404).send('User already registered')
      
    })

module.exports = router