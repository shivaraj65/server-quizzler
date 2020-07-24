//jshint esversion:6
//QUIZZLER APP SERVER
const express=require("express");
const http = require('http');
const bodyParser = require('body-parser');
const path= require("path");
const mongoose = require("mongoose");
const  cors = require('cors');

const app=express();
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));

// configuration of cors
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};

//code by maximillian
// app.use((req,res,next)=>{
//   res.header('Access-Control-Allow-Origin','*');
//   res.header('Access-control-Allow-Headers','*');
//   if(req.method==="OPTIONS"){
//     res.header('Access-control-Allow-Methods','PUT,POST,PATCH,DELETE,GET');
//     return res.status(200).json({});
//   }
//   next();
// });

//connect to the database Server
mongoose.connect("mongodb+srv://warfreak:backspace90-=@cluster0-vsfo0.mongodb.net/quizzler", {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true});
// mongoose.connect("mongodb://localhost:27017/quizzler", {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true});

//schema for the user set
const usersSchema = {
  name: String,
  email:String,
  mobile_number:Number,
  rollno:String,
  college:String,
  password: String
};

//schema for quiz data
const content =new mongoose.Schema({
  name:String,
  pass_percentage:Number,
  questions:[
    {
      question:String,
      op1:String,
      op2:String,
      op3:String,
      op4:String,
      ans:String
    }
  ],
});

//schema for the quiz score keeper..
const score=new mongoose.Schema({
  quizID:String,
  userID:String,
  score:Number
});

const User = mongoose.model("User", usersSchema);
const Content=mongoose.model("Content",content);
const Score=mongoose.model("Score",score);

//this the home route for the application...
app.options('/login', cors());
app.post("/login",function(req,res){
  console.log("testing from remote app");
  console.log(req);
  console.log(req.body);
  // const email=req.body.Email;
  // const pwd=req.body.Password+"";
  // console.log(email);
  // console.log(pwd);
  console.log("ping");
  // console.log("body"+req.body);
  // console.log("email:"+req.querry.Email);
  // console.log("password:"+req.querry.password);
  User.findOne({email: req.body.Email, password:req.body.Password+""}, function (err, docs) {
    if (err) {
      // console.log(docs);
    } else {
      // console.log(docs);
      //docs is the data from the database of the entered name and password
      if(docs === null){
        console.log("invalid user!!!!");
        res.send(docs);
      }else{
         console.log("valid user!!!!");
         res.send(docs);
      }
      }
  });
});

app.options('/signup', cors());
app.post("/signup",function(req,res){
  const newUser ={
    name : req.body.Name,
    email : req.body.Email,
    rollno : req.body.Rollno,
    college : req.body.College,
    mobile_number : req.body.MobileNumber,
    password : req.body.Password
  };
  console.log(newUser);
  const dataPromiseChain = new Promise(function(resolve,reject){
    const flag=true;
      //checking th user already exist or not
      User.findOne({email: req.body.Email}, function (err, docs){
        if (err) {
          console.log("oh snap db error!!!");
          res.send("DBError");
          reject({ reason: 'cancelled' });
        } else {
          // console.log(docs);
          if(docs === null){
            console.log("user not exist proceed");
            resolve(flag);
          }else{
             console.log("user already registered!!! login");
             res.send("UserExist");
             reject({ reason: 'cancelled' });
          }
          }
      });
  })
  .then(function(payload){
    User.create(newUser, function(err, result) {
        if (err) {
          // res.send(err);
          console.log("oh snap db error!!!");
          res.send("DBError");
        } else {
          console.log("user registrtion successful");
          res.send("success");
        }
      });
  })
  .catch(function(err){
    console.log("error detected at the login chains ");
  });
});

//route to quizzler questions
app.options('/quizData', cors());
app.get("/quizData",function(req,res){

  Content.find({}, function(err, result) {
        if (err) {
              res.send("DBError");
        } else {
          if(result.length ===0){
            res.send("noData");
          }else{
            res.send(result);
          }
          }
  });
});

//route to submit the users quiz score to the database
app.options('/scoreSave', cors());
app.post("/scoreSave",function(req,res){
  // console.log("ping score saver!!!");
  // console.log(req.body);
  // console.log(req.body.quizID);
  // console.log(req.body.userID);
  newScore={
    quizID:req.body.quizID,
    userID:req.body.userID,
    score:req.body.Score
  };
  Score.create(newScore, function(err, result) {
      if (err) {
        // console.log("oh snap db error!!!");
        res.send("DBError");
      } else {
        // console.log("data save success!!");
        res.send("success");
      }
    });
});

app.listen(process.env.PORT ||3001, function(){
  console.log("Server started on port 3001");
});
