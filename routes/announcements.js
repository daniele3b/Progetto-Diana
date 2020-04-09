const {Announcement,validate} = require('../models/announcement')
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()

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

router.get('/', async (req,res) => {
    const announcements = await Announcement.find().sort('-start')
    res.send(announcements)
})

router.get('/:CF', async (req,res) => {
    const announcements = await Announcement.find({CF: req.params.CF})
    if (!announcements) return res.status(404).send('No announcements match the given criteria')
    res.send(announcements)
})

/*  WORK IN PROGRESS TO QUERY DB ON A DATE INTERVAL...
router.get('/:start,end', async (req,res) => {
    const announcements = await Announcement.find({start: {'$gte': new Date(req.params.start)}})
    if (!announcements) return res.status(404).send('No announcements match the given criteria')
    res.send(announcements)
})
*/


module.exports = router