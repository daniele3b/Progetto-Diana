const express = require('express')
const router = express.Router()
const config = require('config')
const request = require('request')
const mongoose = require('mongoose')
//const {ChemicalAgent} = require('../models/chemical_agents')
const {Agents,Chemical_Agent,validate}=require('../models/chemical_agents')

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
*/

let pick_point_end_url = config.get('pick_point_end');

router.get('/:address', (req, res) => {

    const address = req.params.address
    const size = address.length
    let parsed = ''
    for(let i=0;i<size;i++){
        if(address[i] == ' ') parsed += "%20"
        else parsed += address[i]
    }
    
    // https://api.pickpoint.io/v1/forward/?key=process.env.ADDRESS&q=parsed&limit=1&format=json
    
    // I used 'limit=1' because this API call returns an array of options for my request: so, in this case,
    // i'll take an array of one element

    const url_addr = pick_point_end_url+'/?key='+process.env.ADDRESS+'&q='+parsed+"&limit=1&format=json"

    request(url_addr, function(error, response, body) {
        if(error){
            console.error('error:', error);
            return
        }
        else{

            const parsed_body = JSON.parse(body)
            const lat = parsed_body[0].lat
            const lon = parsed_body[0].lon
            
            // https://api.tomtom.com/traffic/services/4/flowSegmentData/
            // relative/10/json?point=41.900112%2C12.4808036&unit=KMPH&openLr=false&key=*****

            let tom_tom_end_url = config.get('tom_tom_end');
            const url_info = tom_tom_end_url+'/4/flowSegmentData/absolute/10/json?point='
                +lat+'%2C'+lon+'&unit=KMPH&key='+process.env.TRAFFIC_INFO
            
            request(url_info, function(error, response, body){
                if(error){
                    
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
*       '404':
*         description: No data available
*/

router.get('/:address/sensor', (req, res) => {
    
    const address = req.params.address
    const size = address.length
    let parsed = ''
    for(let i=0;i<size;i++){
        if(address[i] == ' ') parsed += "%20"
        else parsed += address[i]
    }

    const url_addr = pick_point_end_url+'/?key='+process.env.ADDRESS+'&q='+parsed+"&limit=1&format=json"

    request(url_addr, async function(error, response, body) {
        if(error) {
            console.error('error:', error);
            return
        }

        else {
            const parsed_body = JSON.parse(body)
            const lat = parsed_body[0].lat
            const lon = parsed_body[0].lon
            //console.log('lat='+lat+'lon='+lon)
            

            let result = await Chemical_Agent.find().select('sensor uid lat long -_id')
            const dim = result.length
            if(dim > 0) {
                
                let sensors = []
                let uids = []
                let coordinates = []

                let i
                for(i=0;i<dim;i++){
                    if(!search(uids, result[i].uid)){
                        uids.push(result[i].uid)
                        sensors.push(result[i].sensor)
                        coordinates.push({lat : result[i].lat, lon : result[i].long})
                    }
                }

                //console.log(sensors)
                //console.log(uids)
                //console.log(coordinates)

//https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?origins=lat,lon8&destinations=DEST_LIST
//&travelMode=driving&distanceUnit=km&key=process.env.DISTANCE
                const bing_maps_end = config.get('bing_maps_end')
                let bing_maps_end_url = bing_maps_end+'?origins='+lat+','+lon+'&destinations='

                const size = coordinates.length
                for(i=0;i<size;i++) {
                    bing_maps_end_url += coordinates[i].lat+','+coordinates[i].lon
                    if(i != size - 1) bing_maps_end_url += ';'
                }
                
                bing_maps_end_url += '&travelMode=driving&distanceUnit=km&key='+process.env.DISTANCE

                request(bing_maps_end_url, function(error, response, body) {
                    if(error) {
                        console.error(error)
                        return
                    }

                    else {
                        const parsed_body = JSON.parse(body)
                        const results = parsed_body.resourceSets[0].resources[0].results
                        const destinations = parsed_body.resourceSets[0].resources[0].destinations
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
                })
            }

            else {
                return res.status(404).send('No data available')
            }
        }
    })

})

function search (arr, elem) {
    let i
    const dim = arr.length
    for(i=0;i<dim;i++){
        if(arr[i] == elem) return true
    }
    return false
}


module.exports = router