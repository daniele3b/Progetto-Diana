const {Announcement} = require('../models/announcement')
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const operator = require('../middleware/operator')
const {Report} = require('../models/report')
const jwt = require('jsonwebtoken');
const {checkToken} = require('../startup/updater_token')
const config = require('config')
let timerObjects=[]

/**
 * @swagger
 * tags:
 *   name: Token
 *   description: Token management APIs
 */ 
 
/**
* @swagger 
* /token/setToken/:object/:id:
*  post:
*    tags: [Token]
*    parameters:
*       - name: object
*         description: String which value must be 'announcement' or 'report'
*         in: formData
*         required: true
*         type: String
*       - name: id
*         description: String that represents announcement's or report's id
*         in: formData
*         required: true
*         type: String
*    description: Used to set the token for gaining the authorization to modify or delete an announcement or a report
*    responses:
*       '200':
*         description: A successful response, token setted successfully            
*       '400':
*         description: Invalid token provided/Bad request/Invalid ID for the announcement/Invalid id number for the report
*       '404':
*         description: Announcement or report not found in the database
*       '401':
*         description: User is not logged in... user has to authenticate himself
*       '403':
*         description: Token already setted... you can't access the announcement or report
*/

router.post('/setToken/:object/:id' , auth, async (req,res) => {
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

        let tobject=setTimeout(() => {checkToken(tipo, req.params.id, cf)}, config.get('token_time'))
        
        timerObjects.push({timer:tobject,id:req.params.id,cf:cf})
       // console.log(timerObjects)
        return res.status(200).send("Token settato")
    }

    else if(tipo == "report"){
        let result = await Report.find({id_number: req.params.id})
        if(!result) return res.status(404).send("Non trovato")

        const t = result[0].token
        
        if(t != "") return res.status(403).send("Non puoi accedere a tale segnalazione: token già settato")

        const res1 = await Report.findOneAndUpdate({id_number:req.params.id}, {token: cf})

        let tobject=setTimeout(() => {checkToken(tipo, req.params.id, cf)}, config.get('token_time'))

        timerObjects.push({timer:tobject,id:req.params.id,cf:cf})
      //  console.log(timerObjects)

        return res.status(200).send("Token settato")
    }
})

/**
* @swagger 
* /token/deleteToken/:object/:id:
*  delete:
*    tags: [Token]
*    parameters:
*       - name: object
*         description: String which value must be 'announcement' or 'report'
*         in: formData
*         required: true
*         type: String
*       - name: id
*         description: String that represents announcement's or report's id
*         in: formData
*         required: true
*         type: String
*    description: Used to delete the token when the operator stops updating or removing an announcement or a report 
*    responses:
*       '200':
*         description: A successful response, token removed successfully            
*       '400':
*         description: Invalid token provided/Bad request/Invalid ID for the announcement/Invalid id number for the report/Token already removed
*       '404':
*         description: Announcement or report not found in the database
*       '401':
*         description: User is not logged in... user has to authenticate himself
*       '403':
*         description: You're not the operator who setted this token
*/

router.delete('/deleteToken/:object/:id' , auth, async (req,res) => {
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

        var ind = timerObjects.findIndex(x => (x.id ==req.params.id&& x.cf==cf));

        let timeobject=timerObjects[ind]

        clearTimeout(timeobject.timer)

        timerObjects.splice(ind,1)

       // console.log("DOPO CLEAR: "+timerObjects)


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


        var ind = timerObjects.findIndex(x => (x.id ==req.params.id&& x.cf==cf));

        let timeobject=timerObjects[ind]

        clearTimeout(timeobject.timer)

        timerObjects.splice(ind,1)

        //console.log("DOPO CLEAR: "+timerObjects)


        return res.status(200).send("Token rimosso")
    }
})

/**
* @swagger 
* /token/refreshToken/:object/:id:
*  put:
*    tags: [Token]
*    parameters:
*       - name: object
*         description: String which value must be 'announcement' or 'report'
*         in: formData
*         required: true
*         type: String
*       - name: id
*         description: String that represents announcement's or report's id
*         in: formData
*         required: true
*         type: String
*    description: Used to refresh the token after the operator modified an announcement
*    responses:
*       '200':
*         description: A successful response, token refreshed successfully            
*       '400':
*         description: Invalid token provided/Bad request/Invalid ID for the announcement/Invalid id number for the report/Token already removed
*       '404':
*         description: Announcement or report not found in the database
*       '401':
*         description: User is not logged in... user has to authenticate himself
*       '403':
*         description: You're not the operator who setted this token
*/

router.put('/refreshToken/:object/:id' , auth, async (req,res) => {
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

    if(tipo == 'announcement'){
        const result = await Announcement.findById(req.params.id)
        if(!result) return res.status(404).send("Non trovato")

        const t = result.token

        if(t == "") return res.status(400).send("Token già resettato")

        if(result.token != cf) return res.status(403).send("Non puoi resettare il token")

        var ind = timerObjects.findIndex(x => (x.id ==req.params.id&& x.cf==cf));

        let timeobject=timerObjects[ind]

        clearTimeout(timeobject.timer)

        timerObjects.splice(ind,1)

        let tobject=setTimeout(() => {checkToken(tipo, req.params.id, cf)}, config.get('token_time'))

        timerObjects.push({timer:tobject,id:req.params.id,cf:cf})
    }

    else if(tipo == 'report'){
        let result = await Report.find({id_number: req.params.id})
        if(!result) return res.status(404).send("Non trovato")

        const t = result[0].token
        
        if(t == "") return res.status(400).send("Token già resettato")

        console.log(result[0].token)
        console.log(cf)

        if(result[0].token != cf) return res.status(403).send("Non puoi resettare il token")

        var ind = timerObjects.findIndex(x => (x.id ==req.params.id&& x.cf==cf));

        let timeobject=timerObjects[ind]

        clearTimeout(timeobject.timer)

        timerObjects.splice(ind,1)

        let tobject=setTimeout(() => {checkToken(tipo, req.params.id, cf)}, config.get('token_time'))

        timerObjects.push({timer:tobject,id:req.params.id,cf:cf})
    }
})

module.exports = router