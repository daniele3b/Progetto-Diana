const express = require('express')
const router = express.Router()
const config = require('config')
const request = require('request')
const {checkDate} = require('../helper/air_traffic_helper')

require('dotenv').config()

/**
 * @swagger
 * tags:
 *   name: Air Traffic
 *   description: Air traffic management APIs
 */

router.get('/', async (req, res) => {
    // "https://USERNAME:PASSWORD@opensky-network.org/api/states/all" 
    const url = 'https://'+process.env.OPEN_SKY_USERNAME+':'+process.env.OPEN_SKY_PASSWORD+'@'+config.get('open_sky_end')
                +'/states/all?lamin='+config.get('LAT_MIN')+'&lomin='+config.get('LON_MIN')+'&lamax='+config.get('LAT_MAX')
                +'&lomax='+config.get('LON_MAX')
    
    request(url, function(error, response, body) {
        if(error) {
            console.error(error)
            return res.status(404).send('There are no flights in the specified area')
        }
        
        else {
            const parsed_body = JSON.parse(body)
            const states = parsed_body.states

            if(!states) return res.status(404).send('There are no flights in the specified area')
            
            let i
            let dim = states.length
            let result = []

            for(i=0;i<dim;i++) {
                result.push({
                    icao24: states[i][0],
                    lat: states[i][6],
                    lon: states[i][5]
                })
            }

            res.status(200).send(result)
        }
    })
})

router.get('/now/:start', async (req, res) => {
    const now = new Date()
    // WORK IN PROGRESS
})

module.exports = router