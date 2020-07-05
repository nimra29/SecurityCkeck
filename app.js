//jshint esversion:6
require('dotenv').config();
const express=require("express")
const bodyParser= require("body-parser")
const mongoose=require("mongoose")
const ejs=require("ejs");
const session =require("express-session")
const passport=require("passport")
const passportLocalMongoose=require("passport-local-mongoose")
//first we required 3 pakages
const app=express();
app.use(express.static("public"))
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({
  extended:true
}))

app.use(session({
  secret: "our little secret",
  resave:false,
  saveUninitialized:false
}))//setup sessions sath and hash for us
app.use(passport.initialize())//initialize passport
app.use(passport.session())//use passport to manage our sessions
mongoose.connect("mongodb://localhost:27017/angelaDB",{useNewUrlParser:true})
mongoose.set("useCreateIndex",true);
//after adding new now its an object from mongoose schema class
const userSchema=new mongoose.Schema({
  email:String,
  password:String
})
userSchema.plugin(passportLocalMongoose)//setup user schema to use at mongoose plugin

const User= new mongoose.model("User",userSchema)
passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
//create session and use serialize and deserilaize

app.get("/",function(req,res){
  res.render("home")
})
app.get("/login",function(req,res){
  res.render("login")
})
app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
      res.render("secrets")
  }
  else{
    res.redirect("/login")
  }
})
app.post("/login",function(req,res){
  const user=new User({
    username:req.body.username,
    password:req.body.password
  })
  req.login(user,function(err){
    if(err){
      console.log(err)
    }
    else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets")
      })
    }
  })
})
app.get("/register",function(req,res){
  res.render("register")
})
app.post("/register",function(req,res){
User.register({username:req.body.username}, req.body.password, function(err,user){
      if(err){
        console.log(err)
        res.redirect("/register")
      }
      else{
        passport.authenticate("local")(req,res,function(){
          res.redirect("/secrets")
        })
      }
})

})
app.get("/logout",function(req,res){
  req.logout()
  res.redirect("/")
}) 
app.listen(3000,function(){
  console.log("server started at port 3000")
})
