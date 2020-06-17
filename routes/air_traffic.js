const express = require('express')
const router = express.Router()
const config = require('config')
const request = require('request')
const {logger} = require('../startup/logging')
const auth = require('../middleware/auth')
const operator = require('../middleware/operator')

require('dotenv').config()

/**
 * @swagger
 * tags:
 *   name: Air Traffic
 *   description: Air traffic management APIs
 */

/**
* @swagger 
* /air_traffic:
*  get:
*    tags: [Air Traffic]
*    description: Used to request geographical coordinates of planes in Rome's area, in real time 
*    responses:
*       '400':
*         description: Invalid token provided
*       '200':
*         description: A successful response, data available
*         schema:
*           type: array
*           items: 
*             type: object
*             properties:
*                 icao24:
*                     type: String
*                     example: "4400cd"
*                 lat:
*                     type: number
*                     format: float
*                     example: 41.01234
*                 lon:
*                     type: number
*                     format: float
*                     example: 12.23345
*       '404':
*         description: There are no flights in the specified area/Invalid token provided
*       '401':
*         description: User is not logged in... user has to authenticate himself
*       '403':
*         description: User is not an operator or admin
*       '500':
*         description: Bad gateway
*/

router.get('/', [auth, operator], async (req, res) => {

    if(process.env.PRESENTAZIONE == 'SI') return res.status(404).send("There are no flights in the specified area")

    // "https://USERNAME:PASSWORD@opensky-network.org/api/states/all" 
    const url = 'https://'+process.env.OPEN_SKY_USERNAME+':'+process.env.OPEN_SKY_PASSWORD+'@'+config.get('open_sky_end')
                +'/states/all?lamin='+config.get('LAT_MIN')+'&lomin='+config.get('LON_MIN')+'&lamax='+config.get('LAT_MAX')
                +'&lomax='+config.get('LON_MAX')
    
    request(url, function(error, response, body) {

        if(error) {
            logger.error('AT1: impossible to get info about planes in the area bounded by\n'+
               'LAT_MIN='+config.get('LAT_MIN')+'\n'+
               'LAT_MAX='+config.get('LAT_MAX')+'\n'+
               'LON_MIN='+config.get('LON_MIN')+'\n'+
               'LON_MAX='+config.get('LON_MAX')
               )
            
            console.log('AT1')
            return 
        }
        
        else {
            if(body.includes('html') || body.includes('Sorry')) return res.status(500).send("Bad gateway") // Some internal error from api call

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

module.exports = router

/*
setInterval(() => {
    const url = 'https://'+process.env.OPEN_SKY_USERNAME+':'+process.env.OPEN_SKY_PASSWORD+'@'+config.get('open_sky_end')
                +'/states/all?lamin='+config.get('LAT_MIN')+'&lomin='+config.get('LON_MIN')+'&lamax='+config.get('LAT_MAX')
                +'&lomax='+config.get('LON_MAX')
    request(url, function(error, response, body) {
        const parsed_body = JSON.parse(body)
        if(!parsed_body){
            console.log('ERRORE BODY')
            logger.error(parsed_body)
            return
        }  
        else{
            console.log('CHIAMATA AIR_TRAFFIC ANDATA A BUON FINE')
            logger.error(parsed_body)
        } 
    })
}, 5000)*/