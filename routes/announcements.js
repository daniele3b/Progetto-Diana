const validateObjectId = require('../middleware/validateObjectId')
const {Announcement,validate} = require('../models/announcement')
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Announcements
 *   description: Annoucements management APIs
 */ 
 
/** 
* @swagger
* /announcements:
*  post:
*    tags: [Announcements]
*    parameters:
*       - name: Announcement object
*         description: object in JSON format with CF , date_start , date_end and description as fields
*         in: formData
*         required: true
*         type: date
*    description: Use to create a new annoucement
*    responses:
*       '200':
*         description: A successful response
*       '400' :
*         description: Request is not suitable
*/
router.post('/' , async (req,res) => {
    const {error} = validate(req.body)
    if (error)  return res.status(400).send(error.details[0].message)

    let announcement = new Announcement({
        CF: req.body.CF,
        start: req.body.start,
        end: req.body.end,
        description: req.body.description
    })
    announcement = await announcement.save()

    res.send(announcement)
})

/**
* @swagger
* /announcements:
*  get:
*    tags: [Announcements]
*    description: Use to request all annoucements
*    responses:
*       '200':
*         description: A successful response
*/
router.get('/', async (req,res) => {
    const announcements = await Announcement.find().sort('-start')
    res.send(announcements)
})

/**
* @swagger 
* /announcements/CF:
*  get:
*    tags: [Announcements]
*    description: Use to request all annoucements published by the operator with the given CF
*    parameters:
*       - name: CF
*         description: CF of the operator
*         in: formData
*         required: true
*         type: date
*    responses:
*       '200':
*         description: A successful response
*       '404':
*         description: No announcements match the given criteria were found 
*/
router.get('/:CF', async (req,res) => {
    const announcements = await Announcement.find({CF: req.params.CF})
    if (!announcements.length) return res.status(404).send('No announcements match the given criteria')
    res.send(announcements)
})

/**
* @swagger 
* /announcements/date_start/date_end:
*  get:
*    tags: [Announcements]
*    description: Use to request all annoucements published in a day between date_start and date_end
*    parameters:
*       - name: date_start
*         description: upper date bound
*         in: formData
*         required: true
*         type: date
*       - name: date_end
*         description: lower date bound
*         in: formData
*         required: true
*         type: date
*    responses:
*       '200':
*         description: A successful response
*       '404':
*         description: No announcements match the given criteria were found 
*/
router.get('/:date_start/:date_end', async (req,res) => {
    const date_start = new Date(req.params.date_start)
    const date_stop = new Date(req.params.date_end)
    const announcements = await Announcement.find({start: {'$gte': date_start, '$lt': date_stop}})
    if (!announcements.length) return res.status(404).send('No announcements match the given criteria')
    res.send(announcements)
})

/**
* @swagger 
* /announcements/id:
*  put:
*    tags: [Announcements]
*    description: Use to update an annoucement 
*    parameters:
*       - name: id
*         description: id of the document to modify
*         in: formData
*         required: true
*         type: date
*    responses:
*       '200':
*         description: A successful response
*       '404':
*         description: No announcements match the given criteria were found
*       '400':
*         description: Request is not suitable
*/
router.put('/:id' , validateObjectId , async(req,res) => {
    const {error} = validate(req.body)
    if (error)  return res.status(400).send(error.details[0].message)
    const annoucement = await Announcement.findByIdAndUpdate(req.params.id, {
        CF: req.body.CF,
        start: req.body.start,
        end: req.body.end,
        description: req.body.description
    }, {new: true} )

    if (!annoucement)   return res.status(404).send('Announcement not found')
    res.send(annoucement)
})


/**
* @swagger 
* /announcements/id:
*  delete:
*    tags: [Announcements]
*    description: Use to delete an annoucement 
*    parameters:
*       - name: id
*         description: id of the document to delete
*         in: formData
*         required: true
*         type: date
*    responses:
*       '200':
*         description: A successful response
*       '404':
*         description: No announcements match the given criteria were found
*       '400':
*         description: Request is not suitable
*/
router.delete('/:id', validateObjectId, async(req,res) => {
    const annoucement = await Announcement.findByIdAndDelete(req.params.id)
    if (!annoucement) return res.status(404).send('Announcement not found')
    res.send(annoucement)
})


module.exports = router