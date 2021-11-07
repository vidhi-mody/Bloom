var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Favourites = require('../models/favourites');
const axios = require('axios');


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
  axios.get(`https://api.spoonacular.com/recipes/findByIngredients?apiKey=${process.env.SPOONACULAR_API_KEY}`,{
    params: params
  })
    .then(response => {
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
       let recipe = (response.data);
      res.render("single",{user,recipe})
    })
    .catch(error => {
      console.log(error);
      res.render("search",{user})
    });
  })

  router.get('/favourite',isValidUser, async function(req,res,next){
    let user = await User.findOne({_id:req.user._id})
    let recipes = await Favourites.find({userid:req.user._id}).sort({_id:-1})
    return res.render('favourites',{user, recipes})
  })
  
  router.post('/list', async function(req,res,next){
    let favourited = await Favourites.findOne({id:req.body.id})
    if (favourited)
    res.redirect('/recipe/favourite')
  
    var favourites= new Favourites({
      id:req.body.id,
      title:req.body.title,
      userid:req.user._id,
      image: req.body.image,
    });
    try{
      doc=await favourites.save()
      res.redirect('/recipe/favourite')
    }
    catch(err){
      console.log(err)
      res.redirect('/recipe/favourite')
    }
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