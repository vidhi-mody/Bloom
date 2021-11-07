var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Post = require('../models/post');
var Mood = require('../models/mood');
const moment = require("moment")
const axios = require('axios');
const {google} = require('googleapis')
const request = require('request')
const urlParse = require('url-parse')
const queryParse = require('query-string')
const bodyParser = require("body-parser")
const language = require('@google-cloud/language');
const client = new language.LanguageServiceClient();

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

router.get('/bot',isValidUser, async function(req,res,next){
  let user = await User.findOne({_id:req.user._id})
  res.render('botto',{user})
})

router.get('/blogpost',isValidUser, async function(req,res,next){
  let user = await User.findOne({_id:req.user._id})
  res.render('blogpost',{user})
})

router.post('/blogpost', async function(req,res,next){
  var sentiment = await quickstart(req.body.title+req.body.body)
  var mood= new Mood({
    userid:req.body.userid,
    title: req.body.title,
    body: req.body.body,
    date: req.body.date,
    mood: sentiment,
  });
  try{
    doc=await mood.save()
    return res.redirect(`/users/mood`)
    //return res.status(201).json(doc);
  }
  catch(err){
    console.log(err)
    return res.redirect('/users/blogpost')
    //return res.status(501).json(err);
  }
})

async function quickstart(text) {
  const document = {
    content: text,
    type: 'PLAIN_TEXT',
  };
  var mood = ""
  // Detects the sentiment of the text
  const [result] = await client.analyzeSentiment({document: document});
  const sentiment = result.documentSentiment;

  console.log(`Text: ${text}`);
  console.log(`Sentiment:`, sentiment);
  console.log(`Sentiment score: ${sentiment.score}`);
  console.log(`Sentiment magnitude: ${sentiment.magnitude}`);

  if(sentiment.score >0){
    mood = "happy"
  }
  else if(sentiment.score < 0){
    mood = "sad"
  }
  else {
    mood = "neutral"
  }
  console.log(mood);
  return mood
}

router.get('/mood',isValidUser, async(req,res,next) => {
  let user = await User.findOne({_id:req.user._id})
  let blogs = await Mood.find({userid:req.user._id}).sort({date:-1}).limit(50)
  const today = moment();
  const from_date = today.startOf('week');  
  let emotions = await Mood.find({userid:req.user._id, date: { $gte: from_date }})
  let happy =0, sad=0, neutral =0
  for (let i=0; i<blogs.length; i++){
    if(blogs[i].mood === "happy"){
      happy = happy+1
    }
    else if(blogs[i].mood === "sad"){
      sad = sad+1
    }
    else {
      neutral = neutral+1
    }

  }
  res.render('mood',{user, blogs, happy, sad, neutral})
})


module.exports = router;