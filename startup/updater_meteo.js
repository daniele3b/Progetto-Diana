const mongoose = require('mongoose')
var request = require('request')
const config = require('config')
require('dotenv').config()
const {Meteo,validate}=require('../models/meteo')
const {logger}=require('./logging')
const dns = require('dns');



function updateMeteo(){
    var lin = config.get('weather_report_updater') + process.env.METEO_KEY;

    dns.resolve('api.openweathermap.org', 'ANY', (err, records) => {
        if (err) {
          console.log("Error: ", err);
          return;
        }else
        console.log('OK')
      });


    request.get(lin, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body); 

            var d = new Date(info.dt*1000);
            var data = d.toISOString()
            

            var datastamp = info.dt;
            var descrizione = info.weather[0].main + ", " + info.weather[0].description;
            var temp = Math.trunc(info.main.temp-273.15);
            var umidita = info.main.humidity;
            var wind = info.wind.speed;
        
        
            async function creaMeteo(){           
                var meteo = new Meteo({
                    data: data,
                    datastamp: datastamp,
                    descrizione: descrizione,
                    t_att: temp,
                    humidity: umidita,
                    wind: wind  
                });

            try{
                let res=await Meteo.findOneAndDelete({datastamp: datastamp})
                const result = await meteo.save();
                console.log("aggiunto "+meteo)
            }catch(ex){
                console.error('error:', error);
                logger.error('M2: Impossibile to save meteo report to databse')
                console.log('M2')
                return
            }
        };

        creaMeteo();
        
        }else{
            console.error('error:', error);
            logger.error('M1: Impossibile to get meteo report data')
            console.log('M1')
           return
        }
    });
    
}

exports.updateMeteo=updateMeteo