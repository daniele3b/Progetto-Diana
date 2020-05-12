const {Report,validate} = require('../models/report')
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const operator = require('../middleware/operator')
const jwt = require('jsonwebtoken');
const config = require('config')

/**
 * @swagger
 * tags:
 *   name: Report
 *   description: Report management APIs
 */ 
 
/** 
* @swagger
* /report:
*  post:
*    tags: [Report]
*    parameters:
*       - name: Report object
*         description: object in JSON format with category (String) , address (String) and description (String) as fields
*    description: (Accessible by citizen & operator) Use to create a new report (Max 3 in a day)
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
*               <br>"id_number" number used as identifier,
*               <br>"CF" string which represents the user's identifier,
*               <br>"category" string which represents the report's category,
*               <br>"address" string which represents the report's address,
*               <br>"date" string which represents the time of report's pubblication (YYYY-MM-DDThh:mm:ss.xxxZ)
*               <br>"description" string which represents the report's description,
*               <br>"status" string which represents the report's status,
*               <br>"visible" boolean, true if the report is visible, else altrimenti,
*         schema:
*           type: object
*           properties:
*               id_number:
*                   type: number
*               CF:
*                   type: string
*               category:
*                   type: string
*               address:
*                   type: string
*               date:
*                   type: string
*                   format: date-time
*               description:
*                   type: string
*               status:
*                   type: string
*               visible:
*                   type: boolean
*       '400' :
*         description: Bad request or Invalid Token
*       '401' :
*         description: Access denied. No token provided
*/

router.post('/' , auth, async (req,res) => {
    const {error} = validate(req.body)
    if (error)  return res.status(400).send(error.details[0].message)

    const token=req.header('x-diana-auth-token')
    var decoded = jwt.decode(token);

    //date per controllo
    var d1 = new Date();
    var d2 = new Date();
    d1.setHours("0")
    d1.setMinutes("1")
    d2.setHours("23")
    d2.setMinutes("59")

    //Max 3 al giorno per utente
    const occurrences = await (await Report.find({CF:decoded.CF, date: {'$gte': d1, '$lt': d2}})).length
    if(occurrences>=config.get("max_daily_report")){ 
        res.status(400).send("Maximum number of daily reports reach.")
        return
    }

    //Controllo Spam
    const spam = await Report.find({CF:decoded.CF, date: {'$gte': d1, '$lt': d2}, address: req.body.address, category: req.body.category, description: req.body.description})
    if(spam.length>0){ 
        res.status(400).send("Received duplicate. No spam!")
        return
    }

    //data del giorno
    var d = new Date().toISOString();

    var numero = 1
    const lastnumber = await Report.findOne().sort('-_id')
    if(lastnumber) numero = lastnumber.id_number + 1

    let report = new Report({
        id_number: numero,
        CF: decoded.CF,
        category: req.body.category,
        address: req.body.address,
        date: d,
        description: req.body.description,
        status: "in attesa",
        visible: "true"
    })
  
    report = await report.save()

    res.send(report)
})

/**
* @swagger 
* /report/:id_number:
*  put:
*    tags: [Report]
*    description: Use to update a report
*    parameters:
*       - name: id
*         description: id of the document to modify
*         in: formData
*         required: true
*         type: date
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
*               <br>"id_number" number used as identifier,
*               <br>"CF" string which represents the user's identifier,
*               <br>"category" string which represents the report's category,
*               <br>"address" string which represents the report's address,
*               <br>"date" string which represents the time of report's pubblication (YYYY-MM-DDThh:mm:ss.xxxZ)
*               <br>"description" string which represents the report's description,
*               <br>"status" string which represents the report's status,
*               <br>"visible" will be false after this,
*         schema:
*           type: object
*           properties:
*               id_number:
*                   type: number
*               CF:
*                   type: string
*               category:
*                   type: string
*               address:
*                   type: string
*               date:
*                   type: string
*                   format: date-time
*               description:
*                   type: string
*               status:
*                   type: string
*               visible:
*                   type: boolean
*                   example: false
*       '400' :
*         description: Bad request or Invalid Token
*       '401' :
*         description: Access denied. No token provided
*       '403' :
*         description: Access denied. You're not an admin or operator!
*/

router.put('/:id_number' , [auth, operator], async(req,res) => {
    const report = await Report.findOneAndUpdate({id_number: req.params.id_number}, {status: req.body.status})
    if (!report)   return res.status(404).send('Report not found')
    return res.status(200).send('ok')
})

/** 
* @swagger
* /report/:id_number:
*  delete:
*    tags: [Report]
*    parameters:
*       - id_number: Report object
*         description: id_number of the report
*    description: (Accessible only by operator) Use to delete a report, setting the visibility to false
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
*               <br>"id_number" number used as identifier,
*               <br>"CF" string which represents the user's identifier,
*               <br>"category" string which represents the report's category,
*               <br>"address" string which represents the report's address,
*               <br>"date" string which represents the time of report's pubblication (YYYY-MM-DDThh:mm:ss.xxxZ)
*               <br>"description" string which represents the report's description,
*               <br>"status" string which represents the report's status,
*               <br>"visible" will be false after this,
*         schema:
*           type: object
*           properties:
*               id_number:
*                   type: number
*               CF:
*                   type: string
*               category:
*                   type: string
*               address:
*                   type: string
*               date:
*                   type: string
*                   format: date-time
*               description:
*                   type: string
*               status:
*                   type: string
*               visible:
*                   type: boolean
*                   example: false
*       '400' :
*         description: Bad request or Invalid Token
*       '401' :
*         description: Access denied. No token provided
*       '403' :
*         description: Access denied. You're not an admin or operator!
*/

router.delete('/:id_number' ,auth, async (req,res) => {
    const report = await Report.findOneAndUpdate({id_number: req.params.id_number}, {visible: false})
    if (!report) return res.status(404).send('Not found') 
    else res.status(200).send("Ok")
})

/** 
* @swagger
* /report:
*  get:
*    tags: [Report]
*    description: Show a list of all reports, citizen can see only his reports, operators all
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
*               <br>"id_number" number used as identifier,
*               <br>"CF" string which represents the user's identifier,
*               <br>"category" string which represents the report's type,
*               <br>"address" string which represents the report's address,
*               <br>"date" string which represents the time of report's pubblication (YYYY-MM-DDThh:mm:ss.xxxZ)
*               <br>"description" string which represents the report's description,
*               <br>"status" string which represents the report's status,
*               <br>"visible" boolean, true if the report is visible, else altrimenti,
*         schema:
*           type: object
*           properties:
*               id_number:
*                   type: number
*               CF:
*                   type: string
*               category:
*                   type: string
*               address:
*                   type: string
*               date:
*                   type: string
*                   format: date-time
*               description:
*                   type: string
*               status:
*                   type: string
*               visible:
*                   type: boolean
*       '400' :
*         description: Bad request or Invalid Token
*       '401' :
*         description: Access denied. No token provided
*/

router.get('/', auth, async (req,res) => {
    const token=req.header('x-diana-auth-token')
    var decoded = jwt.decode(token);
    var chisei = decoded.type
    if(chisei == "cittadino"){
        const report = await Report.find({CF:decoded.CF, visible: true}).sort('-_id')
        res.send(report)
    }
    else{
        const report = await Report.find({visible:true}).sort('-_id')
        res.send(report)
    }
})

/** 
* @swagger
* /report/filter/id/:id:
*  get:
*    tags: [Report]
*    description: (Accessible only by operator) Show the report with the given id_number
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
*               <br>"id_number" number used as identifier,
*               <br>"CF" string which represents the user's identifier,
*               <br>"category" string which represents the report's type,
*               <br>"address" string which represents the report's address,
*               <br>"date" string which represents the time of report's pubblication (YYYY-MM-DDThh:mm:ss.xxxZ)
*               <br>"description" string which represents the report's description,
*               <br>"status" string which represents the report's status,
*               <br>"visible" boolean, true if the report is visible, else altrimenti,
*         schema:
*           type: object
*           properties:
*               id_number:
*                   type: number
*               CF:
*                   type: string
*               category:
*                   type: string
*               address:
*                   type: string
*               date:
*                   type: string
*                   format: date-time
*               description:
*                   type: string
*               status:
*                   type: string
*               visible:
*                   type: boolean
*       '400' :
*         description: Bad request or Invalid Token
*       '401' :
*         description: Access denied. No token provided
*       '403' :
*         description: Access denied. You're not an admin or operator!
*       '404' :
*         description: Not Found.
*    parameters:
*       - name: id
*         description: number identifier
*         required: true
*         type: Number
*/

router.get('/filter/id/:id', [auth, operator], async (req,res) => { 
    const result = await Report.find({id_number: req.params.id}).sort('-_id')
    if(!result || result[0]===undefined) res.status(404).send("Not found.")
    else {
        res.status(200).send(result)
    }
})

/** 
* @swagger
* /report/filter/CF/:cf:
*  get:
*    tags: [Report]
*    description: (Accessible only by operator) Show a list of all reports made by an user
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
*               <br>"id_number" number used as identifier,
*               <br>"CF" string which represents the user's identifier,
*               <br>"category" string which represents the report's type,
*               <br>"address" string which represents the report's address,
*               <br>"date" string which represents the time of report's pubblication (YYYY-MM-DDThh:mm:ss.xxxZ)
*               <br>"description" string which represents the report's description,
*               <br>"status" string which represents the report's status,
*               <br>"visible" boolean, true if the report is visible, else altrimenti,
*         schema:
*           type: object
*           properties:
*               id_number:
*                   type: number
*               CF:
*                   type: string
*               category:
*                   type: string
*               address:
*                   type: string
*               date:
*                   type: string
*                   format: date-time
*               description:
*                   type: string
*               status:
*                   type: string
*               visible:
*                   type: boolean
*       '400' :
*         description: Bad request or Invalid Token
*       '401' :
*         description: Access denied. No token provided
*       '403' :
*         description: Access denied. You're not an admin or operator!
*       '404' :
*         description: Not Found.
*    parameters:
*       - name: cf
*         description: User's CF, regex pattern= '[A-Z][A-Z][A-Z][A-Z][A-Z][A-Z][0-9][0-9][A-Z][0-9][0-9][A-Z][0-9][0-9][0-9][A-Z]'
*         required: true
*         type: String
*/

router.get('/filter/CF/:cf',[auth, operator], async (req,res) => {
    const result = await Report.find({CF: req.params.cf})
    if(!result || result[0]===undefined) res.status(404).send("Not found.")
    else {
        res.status(200).send(result)
    }
})

/** 
* @swagger
* /report/filter/date/:date:
*  get:
*    tags: [Report]
*    description: (Accessible only by operator) Show a list of all reports in a given date
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
*               <br>"id_number" number used as identifier,
*               <br>"CF" string which represents the user's identifier,
*               <br>"category" string which represents the report's type,
*               <br>"address" string which represents the report's address,
*               <br>"date" string which represents the time of report's pubblication (YYYY-MM-DDThh:mm:ss.xxxZ)
*               <br>"description" string which represents the report's description,
*               <br>"status" string which represents the report's status,
*               <br>"visible" boolean, true if the report is visible, else altrimenti,
*         schema:
*           type: object
*           properties:
*               id_number:
*                   type: number
*               CF:
*                   type: string
*               category:
*                   type: string
*               address:
*                   type: string
*               date:
*                   type: string
*                   format: date-time
*               description:
*                   type: string
*               status:
*                   type: string
*               visible:
*                   type: boolean
*       '400' :
*         description: Bad request or Invalid Token
*       '401' :
*         description: Access denied. No token provided
*       '403' :
*         description: Access denied. You're not an admin or operator!
*       '404' :
*         description: Not Found.
*    parameters:
*       - name: date
*         description: date choosen, 'YYYY-MM-DD'
*               <br>regex pattern = '{2020}-[0-1][0-9]-[0-3][0-9]'
*         required: true
*         type: String
*         pattern: '^{2020}-[0-1][0-9]-[0-3][0-9]$'  
*/

router.get('/filter/date/:date', [auth, operator], async (req,res) => {
    if(!req.params.date.match('[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]')){ 
        res.status(400).send('Bad request.')
        return
    }
    const d1 = new Date(req.params.date)
    const d2 = new Date(req.params.date)
    d1.setHours("0")
    d1.setMinutes("1")
    d2.setHours("23")
    d2.setMinutes("59")
    const result = await Report.find({date: {'$gte': d1, '$lt': d2},visible:true})
    if(!result || result[0]===undefined) res.status(404).send("Not found.")
    else {
        res.status(200).send(result)
    }
})

/** 
* @swagger
* /report/filter/date/:date_start/:date_end:
*  get:
*    tags: [Report]
*    description: (Accessible only by operator) Show a list of all reports in a givan days' range
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
*               <br>"id_number" number used as identifier,
*               <br>"CF" string which represents the user's identifier,
*               <br>"category" string which represents the report's type,
*               <br>"address" string which represents the report's address,
*               <br>"date" string which represents the time of report's pubblication (YYYY-MM-DDThh:mm:ss.xxxZ)
*               <br>"description" string which represents the report's description,
*               <br>"status" string which represents the report's status,
*               <br>"visible" boolean, true if the report is visible, else altrimenti,
*         schema:
*           type: object
*           properties:
*               id_number:
*                   type: number
*               CF:
*                   type: string
*               category:
*                   type: string
*               address:
*                   type: string
*               date:
*                   type: string
*                   format: date-time
*               description:
*                   type: string
*               status:
*                   type: string
*               visible:
*                   type: boolean
*       '400' :
*         description: Bad request or Invalid Token
*       '401' :
*         description: Access denied. No token provided
*       '403' :
*         description: Access denied. You're not an admin or operator!
*       '404' :
*         description: Not Found.
*    parameters:
*       - name: date_start
*         description: date choosen, 'YYYY-MM-DD'
*               <br>regex pattern = '{2020}-[0-1][0-9]-[0-3][0-9]'
*         required: true
*         type: String
*         pattern: '^{2020}-[0-1][0-9]-[0-3][0-9]$'  
*       - name: date_end
*         description: date choosen, 'YYYY-MM-DD'
*               <br>regex pattern = '{2020}-[0-1][0-9]-[0-3][0-9]'
*         required: true
*         type: String
*         pattern: '^{2020}-[0-1][0-9]-[0-3][0-9]$' 
*/

router.get('/filter/date/:date_start/:date_end', [auth,operator], async (req,res) => {
    if(!req.params.date_start.match('[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]')){ 
        res.status(400).send('Bad request.')
        return
    }
    if(!req.params.date_end.match('[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]')){ 
        res.status(400).send('Bad request.')
        return
    }
    const d1 = new Date(req.params.date_start)
    const d2 = new Date(req.params.date_end)
    d1.setHours("0")
    d1.setMinutes("1")
    d2.setHours("23")
    d2.setMinutes("59")
    const result = await Report.find({date: {'$gte': d1, '$lt': d2}})
    if(!result || result[0]===undefined) res.status(404).send("Not found.")
    else {
        res.status(200).send(result)
    }
})


/** 
* @swagger
* /report/filter/category/:type:
*  get:
*    tags: [Report]
*    description: Show a list of all reports filters by type category
*    responses:
*       '200':
*         description: (Accessible only by operator) A successful response, data available in JSON format, 
*               <br>"id_number" number used as identifier,
*               <br>"CF" string which represents the user's identifier,
*               <br>"category" string which represents the report's category,
*               <br>"address" string which represents the report's address,
*               <br>"date" string which represents the time of report's pubblication (YYYY-MM-DDThh:mm:ss.xxxZ)
*               <br>"description" string which represents the report's description,
*               <br>"status" string which represents the report's status,
*               <br>"visible" boolean, true if the report is visible, else altrimenti,
*         schema:
*           type: object
*           properties:
*               id_number:
*                   type: number
*               CF:
*                   type: string
*               category:
*                   type: string
*                   example: Rifiuti
*               address:
*                   type: string
*               date:
*                   type: string
*                   format: date-time
*               description:
*                   type: string
*               status:
*                   type: string
*               visible:
*                   type: boolean
*       '400' :
*         description: Bad request or Invalid Token
*       '401' :
*         description: Access denied. No token provided
*       '403' :
*         description: Access denied. You're not an admin or operator!
*       '404' :
*         description: Not Found.
*    parameters:
*       - name: type
*         description: it must be in ['rifiuti', 'incendio', 'urbanistica', 'idrogeologia', 'altro'] 
*         required: true
*         type: String  
*/

router.get('/filter/category/:type', [auth,operator], async (req,res) => {
    var t = req.params.type.toLowerCase();
    if(t!='rifiuti' && t !='incendio' && t !='urbanistica' && t !='idrogeologia' && t !='altro'){
        res.status(400).send('Bad request.')
        return
    }

    const report = await Report.find({category: t}).sort('-_id')
    if(report.length>0) res.status(200).send(report)
    else res.status(404).send('Not Found.')
})

/** 
* @swagger
* /report/filter/category/:type/date/:date:
*  get:
*    tags: [Report]
*    description: (Accessible only by operator) Show a list of all reports by type category and by date
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
*               <br>"id_number" number used as identifier,
*               <br>"CF" string which represents the user's identifier,
*               <br>"category" string which represents the report's category,
*               <br>"address" string which represents the report's address,
*               <br>"date" string which represents the time of report's pubblication (YYYY-MM-DDThh:mm:ss.xxxZ)
*               <br>"description" string which represents the report's description,
*               <br>"status" string which represents the report's status,
*               <br>"visible" boolean, true if the report is visible, else altrimenti,
*         schema:
*           type: object
*           properties:
*               id_number:
*                   type: number
*               CF:
*                   type: string
*               category:
*                   type: string
*                   example: Rifiuti
*               address:
*                   type: string
*               date:
*                   type: string
*                   format: date-time
*               description:
*                   type: string
*               status:
*                   type: string
*               visible:
*                   type: boolean
*       '400' :
*         description: Bad request or Invalid Token
*       '401' :
*         description: Access denied. No token provided
*       '403' :
*         description: Access denied. You're not an admin or operator!
*       '404' :
*         description: Not Found.
*    parameters:
*       - name: type
*         description: it must be in ['rifiuti', 'incendio', 'urbanistica', 'idrogeologia', 'altro'] 
*         required: true
*         type: String  
*       - name: date
*         description: date choosen, 'YYYY-MM-DD'
*               <br>regex pattern = '{2020}-[0-1][0-9]-[0-3][0-9]'
*         required: true
*         type: String
*         pattern: '^{2020}-[0-1][0-9]-[0-3][0-9]$' 
*/

router.get('/filter/category/:type/date/:date', [auth,operator], async (req,res) => {
    var t = req.params.type.toLowerCase();
    if(t!='rifiuti' && t !='incendio' && t !='urbanistica' && t !='idrogeologia' && t !='altro'){
        res.status(400).send('Bad request.')
        return
    }

    if(!req.params.date.match('[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]')){ 
        res.status(400).send('Bad request.')
        return
    }
    const d1 = new Date(req.params.date)
    const d2 = new Date(req.params.date)
    d1.setHours("0")
    d1.setMinutes("1")
    d2.setHours("23")
    d2.setMinutes("59")

    const report = await Report.find({category: t}).find({date: {'$gte': d1, '$lt': d2}}).sort('-_id')
    if(report.length>0) res.status(200).send(report)
    else res.status(404).send('Not Found.')
})

/** 
* @swagger
* /report/filter/category/:type/date/:date_start/:date_end:
*  get:
*    tags: [Report]
*    description: (Accessible only by operator) Show a list of all reports by type category and by days' range
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
*               <br>"id_number" number used as identifier,
*               <br>"CF" string which represents the user's identifier,
*               <br>"category" string which represents the report's category,
*               <br>"address" string which represents the report's address,
*               <br>"date" string which represents the time of report's pubblication (YYYY-MM-DDThh:mm:ss.xxxZ)
*               <br>"description" string which represents the report's description,
*               <br>"status" string which represents the report's status,
*               <br>"visible" boolean, true if the report is visible, else altrimenti,
*         schema:
*           type: object
*           properties:
*               id_number:
*                   type: number
*               CF:
*                   type: string
*               category:
*                   type: string
*                   example: Rifiuti
*               address:
*                   type: string
*               date:
*                   type: string
*                   format: date-time
*               description:
*                   type: string
*               status:
*                   type: string
*               visible:
*                   type: boolean
*       '400' :
*         description: Bad request or Invalid Token
*       '401' :
*         description: Access denied. No token provided
*       '403' :
*         description: Access denied. You're not an admin or operator!
*       '404' :
*         description: Not Found.
*    parameters:
*       - name: type
*         description: it must be in ['rifiuti', 'incendio', 'urbanistica', 'idrogeologia', 'altro'] 
*         required: true
*         type: String  
*       - name: date_start
*         description: date choosen, 'YYYY-MM-DD'
*               <br>regex pattern = '{2020}-[0-1][0-9]-[0-3][0-9]'
*         required: true
*         type: String
*         pattern: '^{2020}-[0-1][0-9]-[0-3][0-9]$'  
*       - name: date_start
*         description: date choosen, 'YYYY-MM-DD'
*               <br>regex pattern = '{2020}-[0-1][0-9]-[0-3][0-9]'
*         required: true
*         type: String
*         pattern: '^{2020}-[0-1][0-9]-[0-3][0-9]$'
*/

router.get('/filter/category/:type/date/:date_start/:date_end', [auth,operator], async (req,res) => {
    var t = req.params.type.toLowerCase();
    if(t!='rifiuti' && t !='incendio' && t !='urbanistica' && t !='idrogeologia' && t !='altro'){
        res.status(400).send('Bad request.')
        return
    }

    if(!req.params.date_start.match('[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]')){ 
        res.status(400).send('Bad request.')
        return
    }
    if(!req.params.date_end.match('[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]')){ 
        res.status(400).send('Bad request.')
        return
    }
    const d1 = new Date(req.params.date_start)
    const d2 = new Date(req.params.date_end)
    d1.setHours("0")
    d1.setMinutes("1")
    d2.setHours("23")
    d2.setMinutes("59")

    const report = await Report.find({category: t}).find({date: {'$gte': d1, '$lt': d2}}).sort('-_id')
    if(report.length>0) res.status(200).send(report)
    else res.status(404).send('Not Found.')
})



module.exports = router