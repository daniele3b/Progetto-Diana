const express = require('express')
var request = require('request')
const router = express.Router()
const {Meteo, Meteo7days, validate}=require('../models/meteo')


/**
 * @swagger
 * tags:
 *   name: Weather
 *   description: Weather management APIs
 */ 


/**
* @swagger 
* /meteo/last:
*  get:
*    tags: [Weather]
*    description: Use to request the last report of weather forecast.
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


/**
* @swagger 
* /meteo/7daysforecast:
*  get:
*    tags: [Weather]
*    description: Use to request up to 7 days weather forecast.
*    responses:
*       '200':
*         description: A successful response, data available
*       '404':
*         description: No data available
*/
router.get('/7daysforecast' , async (req,res) => {
    var lin = 'https://api.openweathermap.org/data/2.5/onecall?lat=41.89&lon=12.48&appid='+ process.env.METEO_KEY;
    request.get(lin, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body); 
            var datastamp = [];
            var descrizione = [];
            var temp_min = [];
            var temp_max = [];
            var umidita = [];
            var wind = [];
            var data = [];
            for (i = 0; i < 7; i++) {
                datastamp[i] = info.daily[i+1].dt;
                descrizione[i] = info.daily[i+1].weather[0].main + ", " + info.daily[i].weather[0].description;
                temp_min[i] = Math.trunc(info.daily[i+1].temp.min-273.15);
                temp_max[i] = Math.trunc(info.daily[i+1].temp.max-273.15);
                umidita[i] = info.daily[i+1].humidity;
                wind[i] = info.daily[i+1].wind_speed;
                
                
                var d = new Date(datastamp[i]*1000);
                data[i] = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear(); 
            }   
            
            //const Meteo = mongoose.model('Meteo', meteoSchema);
        
            async function creaMeteo(){           
                var meteo7days = new Meteo7days({
                    array: [{
                        data: data[0],
                        datastamp: datastamp[0],
                        descrizione: descrizione[0],
                        t_min: temp_min[0],
                        t_max: temp_max[0],
                        humidity: umidita[0],
                        wind: wind[0]  
                    },{
                        data: data[1],
                        datastamp: datastamp[1],
                        descrizione: descrizione[1],
                        t_min: temp_min[1],
                        t_max: temp_max[1],
                        humidity: umidita[1],
                        wind: wind[1]  
                    },{
                        data: data[2],
                        datastamp: datastamp[2],
                        descrizione: descrizione[2],
                        t_min: temp_min[2],
                        t_max: temp_max[2],
                        humidity: umidita[2],
                        wind: wind[2]  
                    },{
                        data: data[3],
                        datastamp: datastamp[3],
                        descrizione: descrizione[3],
                        t_min: temp_min[3],
                        t_max: temp_max[3],
                        humidity: umidita[3],
                        wind: wind[3]  
                    },{
                        data: data[4],
                        datastamp: datastamp[4],
                        descrizione: descrizione[4],
                        t_min: temp_min[4],
                        t_max: temp_max[4],
                        humidity: umidita[4],
                        wind: wind[4]  
                    },{
                        data: data[5],
                        datastamp: datastamp[5],
                        descrizione: descrizione[5],
                        t_min: temp_min[5],
                        t_max: temp_max[5],
                        humidity: umidita[5],
                        wind: wind[5]  
                    },{
                        data: data[6],
                        datastamp: datastamp[6],
                        descrizione: descrizione[6],
                        t_min: temp_min[6],
                        t_max: temp_max[6],
                        humidity: umidita[6],
                        wind: wind[6]  
                    }]
                });


            //REMINDER: devo decidere se è necessario salvare sul database
            try{
                const result = await meteo7days.save();
                res.send(meteo7days)
            }catch(ex){
                console.log(ex);
            }
            };

        creaMeteo();
        
        }else console.log("fallito")
    });
});


module.exports = router