const config = require('config')
const request=require('request')
const {Agents,Chemical_Agent,validate}=require('../models/chemical_agents')
require('dotenv').config()

let aqi_url=config.get('aqi_end');
let stations_id=[] //used to req data from stations
let timedata;



function getStationsName()
{
    timedata=Date.now()
    return new Promise(function(resolve,reject){

    request(aqi_url+"/search/?keyword="+config.get('aqi_loc')+"&token="+process.env.AQI_TOKEN, function (error, response, body) {
    if(error){  
        console.error('error:', error);
        reject(error);
    }else
    {
        let stations_name=[];
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        let json= JSON.parse(body);
        let stations=json.data;

        for(var i = 0; i < stations.length; i++) {
            var obj = stations[i];
            let n=obj.station.name
            
            if(n.indexOf("Roma")!=-1)
            {
                stations_name.push(obj.station.name);
                stations_id.push(obj.uid)
            }
         
          
            
        }
        resolve(stations_name);
       }
      });
});
}

function getData(id,nameStation)
{
    return new Promise(function(resolve,reject){

    request(aqi_url+"/feed/@"+id+"/?token="+process.env.AQI_TOKEN, async function (error, response, body) {
        if(error){ 
            console.error('error:', error);
            reject(error)
           
        }else
        {
            console.log("UID:"+id+" NAME:"+nameStation)
            let json= JSON.parse(body);
            let chemical_comp=json.data.iaqi
            //if there isn't a value the field is undefined 
            if(chemical_comp.so2!=undefined)
                saveData(nameStation,Agents.SO2,chemical_comp.so2.v,id)
            if(chemical_comp.pm10!=undefined)
                saveData(nameStation,Agents.PM10,chemical_comp.pm10.v,id)
            if(chemical_comp.pm25!=undefined)
                saveData(nameStation,Agents.PM25,chemical_comp.pm25.v,id)
            if(chemical_comp.o3!=undefined)
                saveData(nameStation,Agents.O3,chemical_comp.o3.v,id)
            if(chemical_comp.so2!=undefined)
                saveData(nameStation,Agents.SO2,chemical_comp.so2.v,id)
            resolve(true)
           }
});
});
}

async function saveData (names,agents,values,ids)
{
   let chemical_agent=new Chemical_Agent({
        reg_date: timedata,
        value: values,
        types: agents,
        sensor:names,
        uid:ids
   });

   await chemical_agent.save()

}




function getDataFromStations(stations){
    console.log(stations)
    console.log(stations_id)

    for(var i=0;i<stations_id.length;i++)
    {
        getData(stations_id[i],stations[i])
        .then(function(res){console.log("DATA OK")})
        .catch(function(error){console.log(error)})


    }


}


function LogError(errore){
    console.log(errore)
}

//https://api.waqi.info/search/?keyword=Rome, Lazio&token=x
function  updateChemicalAgents()
{
    getStationsName()
    .then(function(result){getDataFromStations(result)})
    .catch(function(errore){LogError(errore)})
    
      

}


exports.updateChemicalAgents=updateChemicalAgents