const {Announcement} = require('../models/announcement')
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const operator = require('../middleware/operator')
const {Report} = require('../models/report')
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * tags:
 *   name: Token
 *   description: Token management APIs
 */ 
 
/** 
* @swagger
* /setToken/:object/:id:
*  post:
*    tags: [Token]
*    parameters:
*       - name: Object
*         description: string that represents report or announcement
*       - id : Object ID or id number
*         description: identifier for announcement ot report
*    description: (Accessible operator) Use to set token
*    responses:
*       '200':
*         description: A successful response, token has been setted 
*       '400' :
*         description: Bad request/Invalid Object ID/Invalid id number
*       '401' :
*         description: Access denied. No token provided
*       '403' :
*         description: User is not an admin or operator/Token already setted.. impossible to proceed
*       '404' :
*         description: Announcemente or report not found in the database
*/

router.post('/setToken/:object/:id' , [auth, operator], async (req,res) => {
    const tipo = req.params.object
    if(tipo != "report" && tipo != "announcement") return res.status(400).send("Bad request")

    if(tipo == "announcement" && !mongoose.Types.ObjectId.isValid(req.params.id)) 
        return res.status(400).send('Invalid ID for the announcement.');
    
    if(tipo == "report" && isNaN(parseInt(req.params.id))) 
        return res.status(400).send("Invalid id number for the report.") 

    const token = req.header('x-diana-auth-token')

    var decoded = jwt.decode(token);
      
    // get the decoded payload and header
    var decoded = jwt.decode(token, {complete: true});

    const cf = decoded.payload.CF

    if(tipo == "announcement"){
        const result = await Announcement.findById(req.params.id)
        if(!result) return res.status(404).send("Non trovato")

        const t = result.token

        if(t != "") return res.status(403).send("Non puoi accedere a tale annuncio: token già settato")

        const res1 = await Announcement.findByIdAndUpdate(req.params.id, {token: cf})

        return res.status(200).send("Token settato")
    }

    else if(tipo == "report"){
        let result = await Report.find({id_number: req.params.id})
        if(!result) return res.status(404).send("Non trovato")

        const t = result[0].token
        
        if(t != "") return res.status(403).send("Non puoi accedere a tale annuncio: token già settato")

        const res1 = await Report.findOneAndUpdate({id_number:req.params.id}, {token: cf})

        return res.status(200).send("Token settato")
    }
})

/** 
* @swagger
* /deleteToken/:object/:id:
*  delete:
*    tags: [Token]
*    parameters:
*       - name: Object
*         description: string that represents report or announcement
*       - id : Object ID or id number
*         description: identifier for announcement ot report
*    description: (Accessible operator) Use to remove token
*    responses:
*       '200':
*         description: A successful response, token has been removed 
*       '400' :
*         description: Bad request/Invalid Object ID/Invalid id number/Token already removed
*       '401' :
*         description: Access denied. No token provided
*       '403' :
*         description: User is not an admin or operator/Token cannot be reset by this user
*       '404' :
*         description: Announcemente or report not found in the database
*/

router.delete('/deleteToken/:object/:id' , [auth, operator], async (req,res) => {
    const tipo = req.params.object
    if(tipo != "report" && tipo != "announcement") return res.status(400).send("Bad request")

    if(tipo == "announcement" && !mongoose.Types.ObjectId.isValid(req.params.id)) 
        return res.status(400).send('Invalid ID for the announcement.');
    
    if(tipo == "report" && isNaN(parseInt(req.params.id))) 
        return res.status(400).send("Invalid id number for the report.") 

    const token = req.header('x-diana-auth-token')

    var decoded = jwt.decode(token);
      
    // get the decoded payload and header
    var decoded = jwt.decode(token, {complete: true});

    const cf = decoded.payload.CF

    if(tipo == "announcement"){
        const result = await Announcement.findById(req.params.id)
        if(!result) return res.status(404).send("Non trovato")

        const t = result.token

        if(t == "") return res.status(400).send("Token già resettato")

        if(result.token != cf) return res.status(403).send("Non puoi resettare il token")

        await Announcement.findByIdAndUpdate(req.params.id, {token: ""})


        return res.status(200).send("Token rimosso")
    }

    else if(tipo == "report"){
        let result = await Report.find({id_number: req.params.id})
        if(!result) return res.status(404).send("Non trovato")

        const t = result[0].token
        
        if(t == "") return res.status(400).send("Token già resettato")

        console.log(result[0].token)
        console.log(cf)

        if(result[0].token != cf) return res.status(403).send("Non puoi resettare il token")

        await Report.findOneAndUpdate({id_number:req.params.id}, {token: ""})

        return res.status(200).send("Token rimosso")
    }
})

module.exports = router