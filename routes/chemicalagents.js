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

    console.log(result)
    res.send(result)
})

//should return history of all data
router.get('/history', async (req,res) => {
 
})




module.exports = router