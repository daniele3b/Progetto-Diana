const express = require('express')
const router = express.Router()
const config = require('config')
const request = require('request')
const mongoose = require('mongoose')
const {Agents,Chemical_Agent,validate} = require('../models/chemical_agents')
const {search, addressOK, radiusOK, getLatLong, getSensorsInfo, getResultsAndDestinationsForDistances} = require('../helper/traffic_helper')

require('dotenv').config()

/**
 * @swagger
 * tags:
 *   name: Traffic
 *   description: Traffic management APIs
 */ 


/**
* @swagger 
* /traffic/:address:
*  get:
*    tags: [Traffic]
*    description: Used to request all current data about traffic into an area specified by a given address(latest available)
*    responses:
*       '200':
*         description: A successful response, data available
*       '400':
*         description: An invalid address has been passed
*/

router.get('/:address', async (req, res) => {
    const address = req.params.address
    if(!addressOK(address)) return res.status(400).send("Invalid address... don't use numbers!")
    
    const latLon = await getLatLong(address)
    const lat = latLon[0]
    const lon = latLon[1]
            
    // https://api.tomtom.com/traffic/services/4/flowSegmentData/
    // relative/10/json?point=41.900112%2C12.4808036&unit=KMPH&openLr=false&key=*****

    let tom_tom_end_url = config.get('tom_tom_end');
    const url_info = tom_tom_end_url+'/4/flowSegmentData/absolute/10/json?point='
            +lat+'%2C'+lon+'&unit=KMPH&key='+process.env.TRAFFIC_INFO
            
    request(url_info, function(error, response, body){
        if(error) {
            console.error('error:', error);
            return
        }
        else{
                    
            const parsed_body = JSON.parse(body)

            const resp = {
                currentSpeed: parsed_body.flowSegmentData.currentSpeed,
                freeFlowSpeed: parsed_body.flowSegmentData.freeFlowSpeed,
                confidence: parsed_body.flowSegmentData.confidence,
                currentTravelTime: parsed_body.flowSegmentData.currentTravelTime
            }

            res.status(200).send([resp])
        }
    })
})

/**
* @swagger 
* /traffic/:address/sensor:
*  get:
*    tags: [Traffic]
*    description: Used to request the nearest sensor for a specified address(latest available)
*    responses:
*       '200':
*         description: A successful response, data available
*       '400':
*         description: An invalid address has been passed
*       '404':
*         description: No chemical agents available in the database
*/

router.get('/:address/sensor', async (req, res) => {
    const address = req.params.address
    if(!addressOK(address)) return res.status(400).send("Invalid address... don't use numbers!")
    
    const latLon = await getLatLong(req.params.address)
    const lat = latLon[0]
    const lon = latLon[1]

    let result = await Chemical_Agent.find().select('sensor uid lat long -_id')
    const dim = result.length
    if(dim > 0) {

        const sensorsInfo = await getSensorsInfo(result)
                
        let sensors = sensorsInfo.sensors
        let uids = sensorsInfo.uids
        let coordinates = sensorsInfo.coordinates

        //console.log(sensors)
        //console.log(uids)
        //console.log(coordinates)

        const resDests = await getResultsAndDestinationsForDistances(coordinates, lat, lon)
        const results = resDests.results
        const destinations = resDests.destinations
        //console.log(results)
                        
        const dim = results.length
        let dist_min = 999999
        let ind_min = -1
        for(i=0;i<dim;i++) {
            if(results[i].travelDistance < dist_min) {
                dist_min = results[i].travelDistance
                ind_min = results[i].destinationIndex
            }
        }
            
        res.status(200).send([{
            sensor: sensors[ind_min],
            uid: uids[ind_min],
            coordinates: {
                lat: coordinates[ind_min].lat,
                lon: coordinates[ind_min].lon
        },
            distance: dist_min
        }])
    }

    else {
        return res.status(404).send('No data available')
    }
})



router.get('/:address/sensor/:radius', async (req, res) => {
    const address = req.params.address
    const radius = req.params.radius
    if(!addressOK(address)) return res.status(400).send("Invalid address... don't use numbers!")
    if(!radiusOK(radius)) return res.status(400).send("Invalid radius...")
    if(radius <= 0) return res.status(400).send("Invalid radius...It must be a positive number!")

    

    const latLon = await getLatLong(req.params.address)
    const lat = latLon[0]
    const lon = latLon[1]

    let result = await Chemical_Agent.find().select('sensor uid lat long -_id')
    const dim = result.length
    if(dim > 0) {

        const sensorsInfo = await getSensorsInfo(result)
                
        let sensors = sensorsInfo.sensors
        let uids = sensorsInfo.uids
        let coordinates = sensorsInfo.coordinates

        //console.log(sensors)
        //console.log(uids)
        //console.log(coordinates)

        const resDests = await getResultsAndDestinationsForDistances(coordinates, lat, lon)
        const results = resDests.results
        const destinations = resDests.destinations
        //console.log(results)
        
        const dim = results.length
        let finalArray = []
        for(i=0;i<dim;i++) {
            if(results[i].travelDistance <= radius) {
                finalArray.push({
                    sensor: sensors[i],
                    uid: uids[i],
                    coordinates: {
                        lat: coordinates[i].lat,
                        lon: coordinates[i].lon
                    },
                    distance: results[i].travelDistance
                })
            }
        }
        
        if(finalArray.length <= 0) {
            res.status(404).send('There are no sensors within the specified radius')
        }
        
        else
            res.status(200).send(finalArray)
    }

    else {
        return res.status(404).send('No data available')
    }
})

module.exports = router