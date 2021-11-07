var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Post = require('../models/post');
const moment = require("moment")
const axios = require('axios');
const {google} = require('googleapis')
const request = require('request')
const urlParse = require('url-parse')
const queryParse = require('query-string')
const bodyParser = require("body-parser")

router.get('/recipes',isValidUser, async function(req,res,next){
    let user = await User.findOne({_id:req.user._id})
    return res.render('search',{user})
  })
  
  router.post('/recipes',isValidUser, async function(req,res,next){
    let user = await User.findOne({_id:req.user._id})
    var params = { 
      'ingredients': req.body.query,
      'number': 5, 
      'ranking': 1, 
      'ignorePantry': false 
    };
  console.log(params)
  axios.get(`https://api.spoonacular.com/recipes/findByIngredients?apiKey=${process.env.SPOONACULAR_API_KEY}`,{
    params: params
  })
    .then(response => {
      console.log(response)
      let recipes = (response.data);
      res.render("recipe-list",{user,recipes})
    })
    .catch(error => {
      console.log(error);
      res.render("search",{user})
    });
  
  })
  
  router.get('/single/:id',isValidUser, async function(req,res,next){
    let id = req.params.id
    let user = await User.findOne({_id:req.user._id})
  axios.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`)
    .then(response => {
      // let recipes = (response.data.results);
      // res.render("recipe-list",{user,recipes})
      console.log(response)
       let recipe = (response.data);
      res.render("single",{user,recipe})
    })
    .catch(error => {
      console.log(error);
      res.render("search",{user})
    });
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