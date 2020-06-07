const config = require('config')
const request=require('request')
const moment=require('moment')
const {Agents,Chemical_Agent,validate}=require('../models/chemical_agents')
const {logger}=require('./logging')
const {sendByAmqp}=require('../amqp/producer')
const dns = require('dns');

require('dotenv').config()

let aqi_url=config.get('aqi_end');
let stations_id=[] //used to req data from stations
let timedata;
let stations_geo=[];
let data2send=[];



function getStationsName()
{
   
    return new Promise(function(resolve,reject){

    request(aqi_url+"/search/?keyword="+config.get('aqi_loc')+"&token="+process.env.AQI_TOKEN, function (error, response, body) {
    if(error){  
        console.error('error:', error);
        logger.error('U2: Impossible to obtain data about stations of the zone: '+config.get('aqi_loc'))
        console.log('U2')
        if(error=='ECONNRESET'||error.code=='ECONNRESET')
        {
            console.log("ECONNRESET")
            return
        }
        reject(error);
    }else
    {
        let stations_name=[];
       // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        let json= JSON.parse(body);
        let stations=json.data;
        let len_s=stations.length

        for(var i = 0; i <len_s ; i++) {
            var obj = stations[i];
            let n=obj.station.name
            
            if(n.indexOf(config.get("aqi_prov"))!=-1)
            {
                stations_name.push(obj.station.name);
                stations_id.push(obj.uid)
                stations_geo.push(obj.station.geo)
                
            }
         
          
            
        }
        resolve(stations_name);
       }
      });
});
}


//https://api.waqi.info/feed/@idx/?token=x
function getData(id,nameStation,coords)
{
    return new Promise( function(resolve,reject){

    request(aqi_url+"/feed/@"+id+"/?token="+process.env.AQI_TOKEN, async function (error, response, body) {
        if(error){ 
            console.error('error:', error);
            logger.error('U4: Impossbile to contact api endpoint about the station '+id);
            console.log('U4')
            if(error=='ECONNRESET'||error.code=='ECONNRESET'){
                console.log("ECONNRESET")
                return
            }
            reject(error)
           
        }else
        {
           // console.log("UID:"+id+" NAME:"+nameStation)
            let json= JSON.parse(body);
            let chemical_comp=json.data.iaqi
            //if there isn't a value the field is undefined 
            if(chemical_comp.so2!=undefined)
                await saveData(nameStation,Agents.SO2,chemical_comp.so2.v,id,coords)
            if(chemical_comp.pm10!=undefined)
                await saveData(nameStation,Agents.PM10,chemical_comp.pm10.v,id,coords)
            if(chemical_comp.pm25!=undefined)
                await saveData(nameStation,Agents.PM25,chemical_comp.pm25.v,id,coords)
            if(chemical_comp.o3!=undefined)
                await saveData(nameStation,Agents.O3,chemical_comp.o3.v,id,coords)
              
            //sendByAmqp(data2send)

            resolve(true)
           }
});
});
}

async function saveData (names,agents,values,ids,coords)
{


return new Promise(async function(resolve,reject){
    let arr=[]
   let chemical_agent=new Chemical_Agent({
        reg_date: timedata,
        value: values,
        types: agents,
        sensor:names,
        uid:ids,
        lat:coords[0],
        long:coords[1]
   });

   await chemical_agent.save()
  

   
   data2send.push({
            reg_date: timedata,
            value: values,
            types: agents,
            sensor:names,
            uid:ids,
            lat:coords[0],
            long:coords[1]
   })

   resolve(1)
})
 

}




function getDataFromStations(stations,callback){
    //console.log(stations)
    //console.log(stations_id)

    let len_sd=stations_id.length
    for(var i=0;i<len_sd;i++)
    {
        getData(stations_id[i],stations[i],stations_geo[i])
        .then(function(res){  const arr=data2send; callback(arr);data2send=[]})
        .catch(function(error){logger.error('U3:Impossible get data from a specific station, watch station state');console.log('U3');})
    }


   


}


function LogError(errore){
    console.log(errore)
}
//T14:12:34.000+00:00
//https://api.waqi.info/search/?keyword=Rome,Lazio&token=x
function  updateChemicalAgents()
{
    stations_id=[]
    stations_geo=[]
    data2send=[]
    timedata=moment().format();


    dns.resolve('api.waqi.info', 'ANY', (err, records) => {
        if (err) {
          console.log("Error: ", err);
          return;
        }else
        console.log('OK')
      });

    getStationsName()
    .then(function(result){getDataFromStations(result,sendByAmqp)})
    .catch(function(errore){console.log(errore); logger.error('U1: Impossible to update data about chemical agents, service not available, watch endpoint state');console.log('U1');})
    
    
}


exports.updateChemicalAgents=updateChemicalAgents
