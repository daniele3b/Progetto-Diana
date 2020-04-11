const express = require('express')
//const app = express()
const router = express.Router()
const {Meteo,validate}=require('../models/meteo')


/**
 * @swagger
 * tags:
 *   name: Meteo
 *   description: Meteo management APIs
 */ 


/**
* @swagger 
* /meteo/last:
*  get:
*    tags: [Meteo]
*    description: Use to request the last update of weather forecast.
*    responses:
*       '200':
*         description: A successful response, data available
*       '404':
*         description: No data available
*/

router.get('/last' , async (req,res) => {
    
    const result = await Meteo.findOne().sort('-_id')
    if(!result) res.send("404 Not found.")
    else{
        var tosend = {
            "data": result.data,
            "orario": result.orario,
            "datastamp": result.datastamp,
            "descrizione": result.descrizione,
            "t_att": result.t_att,
            "t_min": result.t_min,
            "t_max": result.t_max,
            "humidity": result.humidity,
            "wind": result.wind  
            }

        res.send(tosend)
    }
});
/*
router.get('/7dayforecast' , async (req,res) => {
    
});*/


module.exports = router