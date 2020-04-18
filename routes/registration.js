const express = require('express')
const {User,validateUser}=require('../models/user')
const config = require('config')
const bcrypt=require('bcrypt')
var CodiceFiscale = require('codice-fiscale-js');
const router = express.Router()



/**
 * @swagger
 * tags:
 *   name: Registration
 *   description: Registration management APIs
 */ 


/**
* @swagger 
* /registration/cittadino:
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

router.post('/cittadino' , async (req,res) => {
/*
    const {error} = validateUser(req.body)
    if (error)  return res.status(400).send(error.details[0].message)
*/

    
    let data=req.body.birthdate
    let array = data.split('-');

    var cf = new CodiceFiscale({
        name: req.body.name,
        surname: req.body.surname,
        gender: req.body.sex,
        day: array[2],
        month: array[1],
        year: array[0],
        birthplace: req.body.birthplace, 
    });

   // console.log(cf)

    const resp=await User.find({CF:cf})
    if(resp.length==0) {
    let user=new User({
        CF:cf,
        type:'cittadino',
        name:req.body.name,
        surname:req.body.surname,
        sex:req.body.sex,
        birthdate:req.body.birthdate,
        birthplace:req.body.birthdate,
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