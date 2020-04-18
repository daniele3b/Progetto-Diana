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
* /registration/citizen/change_pw:
*  post:
*    tags: [Chemical_Agents]
*    parameters:
*       - name: User object
*         description: object in JSON format with name,surname, birthdate(YYYY-MM-DD),birthplace,email or phone,password
*         
*    description: Use to change a pw of a citizien (type cittadino)
*    responses:
*       '200':
*         description: A successful request
*                                  
*       '404':
*         description: No data available
*/

router.post('/citizen/change_pw' , async (req,res) => {

        if(req.body.new_pw ==undefined || req.body.old_pw==undefined)
         return res.status(400).send('Bad request')
        let cf='' //DA PRENDERE DAL TOKEN

        let result=await User.find({CF:cf})
        if(result.length==0) {
            res.status(404).send('User not found')
        }
        else{
            if(result.type!='citizien'){
                return res.status(400).send('Bad request 2')
            }else
            {
                const validPassword = await bcrypt.compare(req.body.old_password, user.password);
                if(!validPassword) 
                    return res.status(400).send('Invalid password');
                else{
                    const salt = await bcrypt.genSalt(config.get('pw_salt'));
                    const np=await bcrypt.hash(req.body.new_pw, salt);
                    const user= await User.findOneAndUpdate({CF:cf},{password:np})
                    return res.status(200).send('Password updated')
                }
            }
        }
    
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