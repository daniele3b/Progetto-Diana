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
* /registration:
*  get:
*    tags: [Chemical_Agents]
*    description: Use to request all current data by the sensor in the city (latest available)
*    responses:
*       '200':
*         description: A successful response, data available return an array of object
*         schema:
*           type: object
*           properties:
*               sensor:
*                   type: string
*               reg_data:
*                   type: string
*                   format: date-time
*               uid:
*                   type: string
*               types:
*                   type: string
*                   enum:
*                       O3
*                       NO
*                       NO2
*                       NOX
*                       PM10
*                       PM25
*                       BENZENE
*                       CO
*                       SO2
*               value:
*                   type: number
*                   format: float
*                   example: 70.4
*               lat:
*                   type: string
*               long:
*                   type: string
*               type: object
*                                  
*       '404':
*         description: No data available
*/

router.post('/' , async (req,res) => {
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