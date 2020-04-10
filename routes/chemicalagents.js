const express = require('express')
const {Agents,Chemical_Agent,validate}=require('../models/chemical_agents')
const router = express.Router()


//should return all current data (latest available)
router.get('/' , async (req,res) => {

    const max_date= await Chemical_Agent.findOne()
    .sort("-reg_date")
    .select("reg_date")

    const result=await Chemical_Agent.find({reg_date:max_date.reg_date})
    .select("sensor uid -_id types value")


    res.send(result)
})

//should return all current data of a station
router.get('/current/:station_id' , async (req,res) => {
    let par=req.params.station_id

    const max_date= await Chemical_Agent.findOne()
    .sort("-reg_date")
    .select("reg_date")

    const result=await Chemical_Agent.find({reg_date:max_date.reg_date,uid:par})
    .select("sensor uid -_id types value")

    if(!result) result.status(400).send("Bad request")
    else
    res.status(200).send(result)
})

//should return history of all data
router.get('/history', async (req,res) => {
 const result=await Chemical_Agent.find()
 .sort("-reg_date")
 .select("reg_date sensor uid types value -_id")

 res.send(result)
})


//should return history of one type of chemical agent
router.get('/history/:type', async (req,res) => {
    let par=req.params.type.toUpperCase()
    let ind=Object.values(Agents).indexOf(par)
    if(ind>-1)
    {
    const result=await Chemical_Agent.find({types:par})
    .sort("-reg_date")
    .select("reg_date sensor uid types value -_id")
    res.status(200).send(result)
    }else{

        res.status(400).send("Bad request")
    }
   })


// should return history data of one station
   router.get('/history/station/:station_id', async (req,res) => {
    let par=req.params.station_id

    
    const result=await Chemical_Agent.find({uid:par})
    .sort("-reg_date")
    .select("reg_date sensor uid types value -_id")  
    if(!result)
        res.status(404).send("NOT FOUND")
    else
        res.status(200).send(result)
   })

   //return history data of an station id and of a kind of data
   router.get('/history/station/:station_id/:type', async (req,res) => {
    let par1=req.params.station_id
    let par2=req.params.type.toUpperCase()
  
    let ind=Object.values(Agents).indexOf(par2)
    if(ind>-1)
    {
        const result=await Chemical_Agent.find({uid:par1,types:par2})
        .sort("-reg_date")
        .select("reg_date sensor uid types value -_id")  
        if(!result)
            res.status(404).send("NOT FOUND")
        else
            res.status(200).send(result)
        
    }else
    
    res.status(400).send("Bad Request")
    
   
   })






module.exports = router