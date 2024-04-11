const express=require('express');
const router =express.Router();
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const authenicate=require("../middleware/authenicate");
require('../DB/connect');

const User =require('../model/userschema');

router.get('/',(req,res)=>{
    res.send(`Hello world from server router.js`);
})
// using promises
// router.post('/register',(req,res)=>{
//     // console.log(req.body);
//     // res.json({message:req.body});
//     // res.send("My Register Page")
//     const {email,password} =req.body;
//     if(!email || !password){
//         return res.status(422).json({error:"Plz filled the required fields"});
//     }
//     User.findOne({email:email})
//     .then((userExist) =>{
//         if(userExist){
//             return res.status(422).json({error:"email already exist "})
//         }
//         const user=new User({email:email,password:password});
//         user.save().then(()=>{
//             res.status(201).json({message:"Data successfully stored in mongodb atlas"})
//             console.log("Data inserted")
//         }).catch((err)=>res.status(500).json({error:"failed to store the data"}));
//     }).catch((err)=>{console.log(`error:{$err}`)})
    
// })

// using async await
router.post('/register',async (req,res)=>{
    // console.log(req.body);
    // res.json({message:req.body});
    // res.send("My Register Page")
    const {email,password} =req.body;
    if(!email || !password){
        return res.status(422).json({error:"Plz filled the required fields"});
    }
    // console.log(req.body);
    try{

        const userExist =await User.findOne({email:email})
        if(userExist){
            return res.status(422).json({error:"email already exist "});
        }
         //if you have confirm password you can check password and
         //cpassword must be same else give a error to user
        //  else if(password!=cpassword){
        //     return res.status(422).json({message:"password are not matching"});         
        // }

        else{

            
            const user=new User({email:email,password:password})
            
            //before storing the user details in the database
            //we need to hash the password before calling save() method
    
            await user.save();

            //to checck if details are storing and what details try below or else above
            // const userRegister=await user.save();
            // console.log(`${user} user Registered succesfully`)
            // console.log(userRegister);
    
            res.status(201).json({message:"Data successfully stored in mongodb atlas"})
            // if(userRegister){
            //     res.status(201).json({message:"Data successfully stored in mongodb atlas"})
            //     console.log("Data inserted")
            // }else{
            //     res.status(500).json({message:"Failed to register"})
            // }
        }
    }catch(error){
        console.log(err)
    }
});

router.post('/login', async (req,res)=>{
    // console.log(req.body);//gives user entered details
    //con
    console.log('requested made by logining from frontend');
    console.log(req.body);
    try{
        const {email,password }=req.body;
        if(!email || !password){
            return res.status(400).json({error:"Plz fill the details"});
        }
        const userlogin=await User.findOne({email:email});
        // console.log(userlogin);
        if(userlogin){

            const isMatch=await bcrypt.compare(password,userlogin.password);
            if(!isMatch){
                console.log("password didnt match");
                res.status(400).json({error:"User error Plz enter valid Credentials pass"});
                
            }
            else{
                console.log("User Exists in DataBase");
                const token=await userlogin.generateAuthToken();
                console.log("token is "+token);
                
                res.cookie("jwtoken",token,{
                    //after how much time you want user to auto logout

                    expires: new Date(Date.now()+ 258992000000),//value in milliseconds
                    httpOnly:true
                });

                

                
                res.json({message:"User Login successfully"})
            }
        }
        else{
            res.status(422).json({error:"Invalid credentials"});
        }

    }
    catch(err){
        console.log(err)

    }




})

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

//to post grievance
router.post("/grievance",authenicate,async(req,res)=>{
    try{
       const {name,email,phone,dept,grievance}=req.body;

       if(!name || !email || !phone || !grievance) {
          console.log("Empty data in grievance portal");
          return res.status(400).json({error:"Please fill all the details"});
       }
       const userContact=await User.findOne({_id: req.userID});
       if(userContact){
          const userMsg=await userContact.addGrievance(name,email,phone,dept,grievance);
          await userContact.save();

          const message={
            to:`${email}`,
            from: 'dangerouspanditain@gmail.com',
            //name:"Grievace Portal",
            subject:'Grievance Filed!!',
            text:`${name}, Your grievance has been successfully filed`
          };

          //sending mail
          sgMail.send(message)
          .then(response => {console.log("Message sent")})
          .catch(err => {console.log(err)});
          
          return res.status(200).json({message:"Grievance Filed Successfully"});
        }
    }catch(err){
      console.log(err);
    }
})

router.post("/grievances",authenicate, async (req, res) => {
    try {
        console.log("recieved data is");
        console.log(req.body);
        const {
            type,
            branch,
            issueType,
            description,
            cardType,
            cardNumber,
            cardExpirationDate,
            locationCode,
            atmIssueDescription
        } = req.body;

        // Validate incoming data

         // Backend validation based on type
         if (type === 'BANK') {
            if (!branch || !issueType || !description) {
                return res.status(400).json({
                    error: "Please fill all the required fields for BANK type"
                });
            }
            console.log("entered bank in backend")
        } else if (type === 'ATM') {
            if (!cardType || !cardNumber || !cardExpirationDate || !description) {
                return res.status(400).json({
                    error: "Please fill all the required fields for ATM type"
                });
            }
        } else if (type === 'ATM MACHINES') {
            if (!locationCode || !atmIssueDescription) {
                return res.status(400).json({
                    error: "Please fill all the required fields for ATM MACHINES type"
                });
            }
        }

        // Find the user by ID
        // const user = await User.findById(req.user.id);
        // const user = await User.findById(req.User._id);
        const user = await User.findById(req.userID);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        // Add the grievance to the user's list
        user.grievances.push({
            type,
            branch,
            issueType,
            description,
            cardType,
            cardNumber,
            cardExpirationDate,
            locationCode,
            atmIssueDescription
        });
        await user.save();
        console.log("successfully added a new greivance in the database");
       
        // // Sending email notification
        // await transporter.sendMail({
        //     from: process.env.EMAIL_USERNAME,
        //     to: user.email, // Assuming the user's email is stored in the 'email' field
        //     subject: 'Grievance Submission Notification',
        //     text: 'Your grievance has been received successfully. We will address it soon. Thank you!'
        // });

        res.status(200).json({
            message: "Grievance submitted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
});

// Route to fetch user grievances
router.get('/grievancess', async (req, res) => {
    try {
      // Fetch all users along with their grievances
      const usersWithGrievances = await User.find().populate('grievances');
      const grievances = usersWithGrievances.map(user => ({
        email: user.email,
        grievances: user.grievances
      }));
  
      // Respond with the list of grievances
      res.json(grievances);
    } catch (error) {
      // Handle errors
      console.error('Error fetching user grievances:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
// Route to update the status of a grievance
router.patch('/grievances/:grievanceId', async (req, res) => {
    console.log("update status called");
    console.log("User is "+req.User);
    const { grievanceId } = req.params;
  
    try {
      // Find the user by ID
      const user = await User.findById(req.User._id); // Assuming req.user contains the authenticated user's ID
  
      // Find the grievance by ID within the user's grievances
      const grievance = user.grievances.id(grievanceId);
      if (!grievance) {
        return res.status(404).json({ message: 'Grievance not found' });
      }
  
      // Update the status of the grievance
      grievance.status = 'solved';
  
      // Save the changes
      await user.save();
  
      // Return success response
      res.status(200).json({ message: 'Grievance status updated successfully', grievance });
    } catch (error) {
      console.error('Error updating grievance status:', error);
      res.status(500).json({ message: 'Error updating grievance status', error });
    }
});
  
//grievance list
router.get("/grievancelist",async(req,res)=>{
    try{
      //db.users.find({},{grievances:1}).pretty()
      const grievanceList=await User.find({grievances:{ "$not": { "$size": 0 } }},{grievances:1});
      tempList=grievanceList;
  
      if(!grievanceList){
        return res.status(400).send();
      }
      else{
        res.status(200).send(grievanceList);
      }
    }catch(err){
      console.log(err);
    }
})

router.get('/about',authenicate,(req,res)=>{
    console.log("Hello About us");
    // res.send("Hello About world from the server");
    res.send(req.rootUser);
})


//logout page
router.get("/logout",(req,res)=>{ 
    console.log('logout route called');
    res.clearCookie('jwtoken',{path: "/"});
    res.status(200).send("Logout Successful");
});

module.exports=router;