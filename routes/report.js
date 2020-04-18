const {Report,validate} = require('../models/report')
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

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
*         description: object in JSON format with CF (String) , categoria (String) , indirizzo (String) and description (String) as fields
*    description: Use to create a new report
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
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
*         description: Bad request
*/

router.post('/' , async (req,res) => {
    const {error} = validate(req.body)
    if (error)  return res.status(400).send(error.details[0].message)

    var d = new Date().toISOString();
    var numero = 1
    const lastnumber = await Report.findOne().sort('-_id')
    if(lastnumber) numero = lastnumber.id_number + 1

    let report = new Report({
        id_number: numero,
        CF: req.body.CF,
        category: req.body.category,
        address: req.body.address,
        date: d,
        description: req.body.description,
        status: "in attesa",
        visible: "true"
    })
  
    report = await report.save()

    res.send("Ok")
})

/** 
* @swagger
* /report:
*  get:
*    tags: [Report]
*    description: Show a list of all reports
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
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
*         description: Bad request
*/

router.get('/', async (req,res) => {
    const report = await Report.find().sort('-_id')
    res.send(report)
})

/** 
* @swagger
* /report/filter/rifiuti:
*  get:
*    tags: [Report]
*    description: Show a list of all reports of 'Rifiuti' category
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
*               <br>"CF" string which represents the user's identifier,
*               <br>"category" here "Rifiuti",
*               <br>"address" string which represents the report's address,
*               <br>"date" string which represents the time of report's pubblication (YYYY-MM-DDThh:mm:ss.xxxZ)
*               <br>"description" string which represents the report's description,
*               <br>"status" string which represents the report's status,
*               <br>"visible" boolean, true if the report is visible, else altrimenti,
*         schema:
*           type: object
*           properties:
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
*       '404' :
*         description: Not Found
*/

router.get('/filter/rifiuti', async (req,res) => {
    const report = await Report.find({category: 'Rifiuti'}).sort('-_id')
    if(report.length>0) res.status(200).send(report)
    else res.status(404).send('Not Found.')
})

/** 
* @swagger
* /report/filter/incendio:
*  get:
*    tags: [Report]
*    description: Show a list of all reports of 'Incendio' category
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
*               <br>"CF" string which represents the user's identifier,
*               <br>"category" here "Incendio",
*               <br>"address" string which represents the report's address,
*               <br>"date" string which represents the time of report's pubblication (YYYY-MM-DDThh:mm:ss.xxxZ)
*               <br>"description" string which represents the report's description,
*               <br>"status" string which represents the report's status,
*               <br>"visible" boolean, true if the report is visible, else altrimenti,
*         schema:
*           type: object
*           properties:
*               CF:
*                   type: string
*               category:
*                   type: string
*                   example: Incendio
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
*       '404' :
*         description: Not Found
*/

router.get('/filter/incendio', async (req,res) => {
    const report = await Report.find({category: 'Incendio'}).sort('-_id')
    if(report.length>0) res.status(200).send(report)
    else res.status(404).send('Not Found.')
})

/** 
* @swagger
* /report/filter/urbanistica:
*  get:
*    tags: [Report]
*    description: Show a list of all reports of 'Urbanistica' category
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
*               <br>"CF" string which represents the user's identifier,
*               <br>"category" here "Urbanistica",
*               <br>"address" string which represents the report's address,
*               <br>"date" string which represents the time of report's pubblication (YYYY-MM-DDThh:mm:ss.xxxZ)
*               <br>"description" string which represents the report's description,
*               <br>"status" string which represents the report's status,
*               <br>"visible" boolean, true if the report is visible, else altrimenti,
*         schema:
*           type: object
*           properties:
*               CF:
*                   type: string
*               category:
*                   type: string
*                   example: Urbanistica
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
*       '404' :
*         description: Not Found
*/

router.get('/filter/urbanistica', async (req,res) => {
    const report = await Report.find({category: 'Urbanistica'}).sort('-_id')
    if(report.length>0) res.status(200).send(report)
    else res.status(404).send('Not Found.')
})

/** 
* @swagger
* /report/filter/idrogeologia:
*  get:
*    tags: [Report]
*    description: Show a list of all reports of 'Idrogeologia' category
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
*               <br>"CF" string which represents the user's identifier,
*               <br>"category" here "Idrogeologia",
*               <br>"address" string which represents the report's address,
*               <br>"date" string which represents the time of report's pubblication (YYYY-MM-DDThh:mm:ss.xxxZ)
*               <br>"description" string which represents the report's description,
*               <br>"status" string which represents the report's status,
*               <br>"visible" boolean, true if the report is visible, else altrimenti,
*         schema:
*           type: object
*           properties:
*               CF:
*                   type: string
*               category:
*                   type: string
*                   example: Idrogeologia
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
*       '404' :
*         description: Not Found
*/

router.get('/filter/idrogeologia', async (req,res) => {
    const report = await Report.find({category: 'Idrogeologia'}).sort('-_id')
    if(report.length>0) res.status(200).send(report)
    else res.status(404).send('Not Found.')
})

/** 
* @swagger
* /report/filter/altro:
*  get:
*    tags: [Report]
*    description: Show a list of all reports of 'Altro' category
*    responses:
*       '200':
*         description: A successful response, data available in JSON format, 
*               <br>"CF" string which represents the user's identifier,
*               <br>"category" here "Altro",
*               <br>"address" string which represents the report's address,
*               <br>"date" string which represents the time of report's pubblication (YYYY-MM-DDThh:mm:ss.xxxZ)
*               <br>"description" string which represents the report's description,
*               <br>"status" string which represents the report's status,
*               <br>"visible" boolean, true if the report is visible, else altrimenti,
*         schema:
*           type: object
*           properties:
*               CF:
*                   type: string
*               category:
*                   type: string
*                   example: Altro
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
*       '404' :
*         description: Not Found
*/

router.get('/filter/altro', async (req,res) => {
    const report = await Report.find({category: 'Altro'}).sort('-_id')
    if(report.length>0) res.status(200).send(report)
    else res.status(404).send('Not Found.')
})


module.exports = router