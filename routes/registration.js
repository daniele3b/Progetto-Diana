const express = require('express')
const {User,validateUser}=require('../models/user')
const {calculateCF}=require('../helper/registration_helper')
const config = require('config')
const bcrypt=require('bcrypt')
const jwt = require('jsonwebtoken');
const auth=require('../middleware/auth')
const operator=require('../middleware/operator')
const admin=require('../middleware/admin')
const Str = require('@supercharge/strings')

const {PasswordRecoveryMail}=require('../helper/email_helper')

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
*    tags: [Registration]
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

    const {error} = validateUser(req.body)
    if (error)  return res.status(400).send(error.details[0].message)


    
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

    

  await user.save()
   .then((result)=>{return res.status(200).send('User registered')})
   .catch((err)=>{ return res.status(404).send('Error something required')})
    }
    else{
            res.status(404).send('User already registered')
    }
  
})





/**
* @swagger 
* /registration/citizen/change_pw:
*  post:
*    tags: [Registration]
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
*       '400':
*         description: Bad request
*       '401':
*         description: Not authorized
*       '403':
*         description: Forbidden
*/

router.post('/citizen/change_pw' ,auth,async (req,res) => {

        if(req.body.new_pw ==undefined || req.body.old_pw==undefined)
         return res.status(400).send('Bad request')

         const token=req.header('x-diana-auth-token')

         var decoded = jwt.decode(token);
      
        // get the decoded payload and header
        var decoded = jwt.decode(token, {complete: true});

        const cf=decoded.payload.CF
        
        let result=await User.findOne({CF:cf})
        if(result==null||result.length<=0) {
            res.status(404).send('User not found')
        }
        else{
            if(result.type!='cittadino'){
                return res.status(400).send('Bad request')
            }else
            {
                const validPassword = await bcrypt.compare(req.body.old_pw, result.password);
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
* /registration/citizen/pw_forgotten:
*  post:
*    tags: [Registration]
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
*       '400':
*         description: Bad request
*       '401':
*         description: Not authorized
*       '403':
*         description: Forbidden
*/

router.post('/citizen/pw_forgotten' ,async (req,res) => {

    //il reset della pw deve richiedere ne body cf ed email
    if(req.body.CF ==undefined || req.body.email==undefined)
     return res.status(400).send('Bad request')

    //vedo se esiste l'uente
    let result=await User.findOne({CF:req.body.CF,email:req.body.email})
    if(result==null||result.length<=0) {
        //se non esiste si fotte
        res.status(404).send('User not found')
    }
    else{
        if(result.type!='cittadino'){
            //se non è un cittadino non può cambiare pw 
            return res.status(400).send('Bad request')
        }else
        {
            //genero una pw random
            const random = Str.random(15)
            //la cripto 
            const salt = await bcrypt.genSalt(config.get('pw_salt'));
            const np=await bcrypt.hash(random, salt);
            //aggiorno la pw dell'utente e setto a true il flag
            const user= await User.findOneAndUpdate({CF:req.body.CF,email:req.body.email},{password:np,password_changing:true})

             //invio email contenente la nuova pw
            PasswordRecoveryMail(req.body.email,random)
            res.status(200).send('Password temporary setted')
        }
    }
    }

)


/**
* @swagger 
* /registration/operator:
*  post:
*    tags: [Registration]
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
*       '401':
*         description: Not authorized
*       '403':
*         description: Forbidden
*/

router.post('/operator' ,[auth,admin], async (req,res) => {
    
        const {error} = validateUser(req.body)
         if (error)  return res.status(400).send(error.details[0].message)
    
    
        
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
    
        
    
        await user.save()
        .then((result)=>{return res.status(200).send('User registered')})
        .catch((err)=>{ return res.status(404).send('Error something required')})
   }
   else{
           res.status(404).send('User already registered')
        }
})




/**
* @swagger 
* /registration/operator/change_pw:
*  post:
*    tags: [Registration]
*    parameters:
*       - name: User object
*         description: object in JSON format with name,surname, birthdate(YYYY-MM-DD),birthplace,email or phone,password
*         
*    description: Use to change a pw of an operator (type operatore)
*    responses:
*       '200':
*         description: A successful request
*                                  
*       '404':
*         description: No data available
*       '400':
*         description: Bad request
*       '401':
*         description: Not authorized
*       '403':
*         description: Forbidden
*/

router.post('/operator/change_pw' ,[auth,operator], async (req,res) => {

    if(req.body.new_pw ==undefined || req.body.old_pw==undefined)
     return res.status(400).send('Bad request')

     const token=req.header('x-diana-auth-token')

     var decoded = jwt.decode(token);


  
    // get the decoded payload and header
    var decoded = jwt.decode(token, {complete: true});

    const cf=decoded.payload.CF
    
   

    let result=await User.findOne({CF:cf})
    if(result==null||result.length<=0) {
        res.status(404).send('User not found')
    }
    else{
        if(result.type!='operatore'){
            return res.status(400).send('Bad request')
        }else
        {
            const validPassword = await bcrypt.compare(req.body.old_pw, result.password);
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

module.exports = router