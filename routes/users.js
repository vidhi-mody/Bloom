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

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

router.get('/',isValidUser, async(req,res,next) => {
  let user = await User.findOne({_id:req.user._id})
  let post = await Post.find().sort({_id:-1}).limit(50)
  res.render('landing',{user, post})
})


router.get('/profile/:id',isValidUser, async function(req,res,next){
  let id = req.params.id
  let user = await User.findOne({_id:id})
  let post= await Post.find({userid:id}).sort({_id:-1})
  return res.render('profile',{user, post})
})


router.get('/post',isValidUser, async function(req,res,next){
  let user = await User.findOne({_id:req.user._id})
  res.render('post',{user})
})

router.post('/post', async function(req,res,next){
  var post= new Post({
    username:req.body.username,
    title:req.body.title,
    userid:req.body.userid,
    type: req.body.type,
    date: Date.now()
  });
  try{
    doc = await post.save()
    return res.redirect(`/users`)
  }
  catch(err){
    console.log(err)
    return res.redirect('/users/post')
  }
})

function isValidUser(req,res,next){
  if(req.isAuthenticated()){
    next()
  }
  else{
    console.log('Unauthorized request')
    res.redirect('/login')
  }
}



module.exports = router;