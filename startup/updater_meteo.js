const mongoose = require('mongoose')
var request = require('request')
const config = require('config')
require('dotenv').config()
const {Meteo,validate}=require('../models/meteo')
const logger=require('./logging')

function updateMeteo(){
    var lin = config.get('weather_report_updater') + process.env.METEO_KEY;
    request.get(lin, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body); 

            var d = new Date(info.dt*1000);
            var data = d.toISOString()
            /*
            var day = d.getDate().toString(); 
            if(day.length==1) day = '0'+day
            var month = (d.getMonth()+1).toString();
            if(month.length==1) month = '0'+month
            var data = day + "/" + month + "/" + d.getFullYear();
            
            var hh = d.getHours().toString();
            if(hh.length==1) hh = '0'+hh
            var mm = d.getMinutes().toString();
            if(mm.length==1) mm = '0'+mm
            var ss = d.getSeconds().toString();
            if(ss.length==1) ss = '0'+ss
            var orario =  hh + ":" + mm + ":" + ss;*/

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
            }catch(ex){
                console.error('error:', error);
                logger.error('M2: Impossibile to save meteo report to databse')
                console.log('M2')
                reject(error);
            }
        };

        creaMeteo();
        
        }else{
            console.error('error:', error);
            logger.error('M1: Impossibile to get meteo report data')
            console.log('M1')
            reject(error);
        }
    });
    
}

exports.updateMeteo=updateMeteo