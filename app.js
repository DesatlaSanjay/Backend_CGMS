const dotenv=require('dotenv');
const express = require('express');
const cors = require('cors');
const cookieParser=require('cookie-parser')
// const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// require('dotenv').config();
const app = express();

dotenv.config({path:'./config.env'})
require('./DB/connect');
const User=require('./model/userschema')

app.use(express.json())
app.use(cors());
app.use(cookieParser());

app.use(require('./router/auth'));//we link the router files to make our route easy


app.get('/',(req,res)=>{
    res.send(`Hello World from server`);
})

app.get('/history',(req,res)=>{
  res.cookie("Greivence","CGMS");
  res.send("Hello from History Page");
})

// app.get('/register',(req,res)=>{
//   res.send(`THis is register Page`)
// })
// console.log("Subscribe");
const port = process.env.PORT;
// 
// app.use(cors());
// app.use(bodyParser.json());
// app.use(express.json());
// useUnifiedTopology: true
// const uri = process.env.ATLAS_URI;

const connection = mongoose.connection;
// console.log('hi')
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});


