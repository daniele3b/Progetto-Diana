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
*               <br>"categoria" string which represents the report's type,
*               <br>"indirizzo" string which represents the report's address,
*               <br>"data" string which represents the time of report's pubblication (YYYY-MM-DDThh:mm:ss.xxxZ)
*               <br>"descrizione" string which represents the report's description,
*               <br>"stato" string which represents the report's status,
*               <br>"visibile" boolean, true if the report is visible, else altrimenti,
*         schema:
*           type: object
*           properties:
*               CF:
*                   type: string
*               categoria:
*                   type: string
*               indirizzo:
*                   type: string
*               data:
*                   type: string
*                   format: date-time
*               descrizione:
*                   type: string
*               stato:
*                   type: string
*               visibile:
*                   type: boolean
*       '400' :
*         description: Bad request
*/

router.post('/' , async (req,res) => {
    const {error} = validate(req.body)
    if (error)  return res.status(400).send(error.details[0].message)

    var d = new Date().toISOString();

    let report = new Report({
        CF: req.body.CF,
        categoria: req.body.categoria,
        indirizzo: req.body.indirizzo,
        data: d,
        descrizione: req.body.descrizione,
        stato: "in attesa",
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
*               <br>"categoria" string which represents the report's type,
*               <br>"indirizzo" string which represents the report's address,
*               <br>"data" string which represents the time of report's pubblication (YYYY-MM-DDThh:mm:ss.xxxZ)
*               <br>"descrizione" string which represents the report's description,
*               <br>"stato" string which represents the report's status,
*               <br>"visibile" boolean, true if the report is visible, else altrimenti,
*         schema:
*           type: object
*           properties:
*               CF:
*                   type: string
*               categoria:
*                   type: string
*               indirizzo:
*                   type: string
*               data:
*                   type: string
*                   format: date-time
*               descrizione:
*                   type: string
*               stato:
*                   type: string
*               visibile:
*                   type: boolean
*       '400' :
*         description: Bad request
*/

router.get('/', async (req,res) => {
    const report = await Report.find().sort('-_id')
    res.send(report)
})

module.exports = router