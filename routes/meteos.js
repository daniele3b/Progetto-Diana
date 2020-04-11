const express = require('express')
//const app = express()
const router = express.Router()
const {Meteo,validate}=require('../models/meteo')

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


module.exports = router