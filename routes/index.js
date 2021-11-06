var express = require('express');
var router = express.Router();
var User = require('../models/user');
const passport = require('passport');

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/register', function(req, res, next) {
  res.render('register');
});


router.post('/register',function(req,res,next){
  console.log(req.body)
  if (req.body.password!==req.body.cpassword){
    return res.render('register',{"error":"Passwords dont match"})
  }
  else{
    database(req,res);
  } 
})

async function database(req,res){
  var user= new User({
    name:req.body.name,
    email:req.body.email,
    password: User.hashPassword(req.body.password),
    createdAt: Date.now(),
    bio: req.body.bio,
  });
  try{
    doc=await user.save()
    return res.redirect('/login')
  }
  catch(err){
    return res.render('register',{"error":"Error saving data! Please try again"})
  }
  
}


router.post('/login',async function(req,res,next){
  passport.authenticate('local', async function(err,user,info){
    if (err){ 
      return res.render('login',{"error":"Invalid email/password"});
    }
    if (!user){
      return res.render('login',{"error":"Invalid email/password"})
    }
    req.login(user,async function(err){
      if(err){
        return res.status(501).json(err);
      }
        console.log("HERE")
        return res.redirect('/users')  
    });
  })(req, res, next);
});

router.get('/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'] }))

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/err' }), (req, res) => {
  req.login(req.session.passport.user,async function(err){
    if(err){ return res.status(501).json(err);}
      return res.redirect('/users')
  });
})
router.get('/chat',isValidUser,async function(req,res,next){
  let user = await User.findOne({_id:req.user._id})
  res.render('chat',{user})
  //return res.status(200).json({message:'Logout Successful'});
});

router.get('/logout',isValidUser,function(req,res,next){
  req.logout();
  res.redirect('/')
  //return res.status(200).json({message:'Logout Successful'});
});

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
