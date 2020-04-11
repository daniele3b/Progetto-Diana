const mongoose = require('mongoose')
var request = require('request')
require('dotenv').config()
const {Meteo,validate}=require('../models/meteo')

function updateMeteo(){
    var lin = 'http://api.openweathermap.org/data/2.5/weather?q=rome,it&appid='+ process.env.METEO_KEY;
    request.get(lin, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body); 
            var now = new Date();
            var data = now.getDate() + "/" + (now.getMonth() + 1) + "/" + now.getFullYear();
            var orario = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
            var datastamp = info.dt;
            var descrizione = info.weather[0].main + ", " + info.weather[0].description;
            var temp = Math.trunc(info.main.temp-273.15);
            var temp_min = Math.trunc(info.main.temp_min-273.15);
            var temp_max = Math.trunc(info.main.temp_max-273.15);
            var umidita = info.main.humidity;
            var wind = info.wind.speed;
        
            //const Meteo = mongoose.model('Meteo', meteoSchema);
        
            async function creaMeteo(){           
                var meteo = new Meteo({
                    data: data,
                    orario: orario,
                    datastamp: datastamp,
                    descrizione: descrizione,
                    t_att: temp,
                    t_min: temp_min,
                    t_max: temp_max,
                    humidity: umidita,
                    wind: wind  
                });


            try{
                const result = await meteo.save();
            }catch(ex){
                console.log(ex);
            }
        };

        creaMeteo();
        
        }
    });
    
}

exports.updateMeteo=updateMeteo