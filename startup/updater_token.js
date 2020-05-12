const {Announcement} = require('../models/announcement')
const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const operator = require('../middleware/operator')
const {Report} = require('../models/report')
const jwt = require('jsonwebtoken');

async function checkToken(type, id, cf){

    console.log("INIZIATO")

    if(type == 'announcement'){
        const result = await Announcement.findById(id)
        if(!result) return

        if(result.token == "") return

        if(result.token == cf){
            await Announcement.findByIdAndUpdate(id, {token: ""})
        }
    }

    else if(type == "report"){
        const result = await Report.find({id_number: id})
        if(!result) return

        if(result[0].token == "") return

        if(result[0].token == cf){
            await Report.findOneAndUpdate({id_number: id}, {token: ""})
        }
    }
}

exports.checkToken = checkToken