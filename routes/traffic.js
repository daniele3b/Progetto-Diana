const express = require('express')
const router = express.Router()
const config = require('config')
const request = require('request')

require('dotenv').config()

/**
 * @swagger
 * tags:
 *   name: Traffic
 *   description: Traffic management APIs
 */ 


/**
* @swagger 
* /traffic/address:
*  get:
*    tags: [Traffic]
*    description: Use to request all current data about traffic into an area specified by a given address(latest available)
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

                    res.send(resp)
                }   
            })
        }
    })
})

module.exports = router