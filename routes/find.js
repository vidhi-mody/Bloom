const geolocation = require('geolocation');
var express = require('express');
var router = express.Router();
var User = require('../models/user');
const axios = require('axios');


router.post('/doctors',isValidUser, async function(req,res,next){
    let user = await User.findOne({_id:req.user._id})
    var config = {
        method: 'get',
        url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${req.body.latitude},${req.body.longitude}&radius=15000&type=hospital&key=${process.env.API_KEY}`,
        headers: { }
      };
      
      axios(config)
      .then(function (response) {
        return res.status(201).send({hospitals: response.data});
      })
      .catch(function (error) {
        console.log(error);
      });
})

router.get('/doctors',isValidUser, async function(req,res,next){
    let user = await User.findOne({_id:req.user._id})
    return res.render('finddoctor',{user})
})

router.post('/gyms',isValidUser, async function(req,res,next){
    let user = await User.findOne({_id:req.user._id})
    var config = {
        method: 'get',
        url: `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${req.body.latitude},${req.body.longitude}&radius=5000&type=gym&key=${process.env.API_KEY}`,
        headers: { }
      };
      
      axios(config)
      .then(function (response) {
        return res.status(201).send({gyms: response.data});
      })
      .catch(function (error) {
        console.log(error);
      });
})

router.get('/gyms',isValidUser, async function(req,res,next){
    let user = await User.findOne({_id:req.user._id})
    return res.render('findgyms',{user})
})

function isValidUser(req,res,next){
    if(req.isAuthenticated()){
      next()
    }
    else{
      console.log('Unauthorized request')
      res.redirect('/login')
    //return res.status(401).json({message:'Unauthorized Request'});
    }
  }
  
  
  module.exports = router;
