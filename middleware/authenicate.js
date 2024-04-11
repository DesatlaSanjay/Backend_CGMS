const jwt=require("jsonwebtoken");
const User = require("../model/userschema");

const Authenicate= async(req,res,next)=>{
    try{
        const token=req.cookies.jwtoken;
        const verifyToken=jwt.verify(token,process.env.SECRET_KEY);
        
        console.log('Decoded Token:', verifyToken); // Log decoded token

        if (!verifyToken) {
            throw new Error('Invalid token');
        }

        // Extract user ID from the token payload
        // const userID = verifyToken.userID; // Update this according to the structure of your token payload

        //Find User
        const rootUser=await User.findOne({_id:verifyToken._id,"tokens.token":token});
        console.log('Found User:', rootUser); // Log user found

        if(!rootUser){
            throw new Error('User not found')
        }

        //Assign User ID
        req.token=token;
        req.rootUser=rootUser;
        req.userID=rootUser._id;
        // req.userID=verifyToken.userID;
        next();

    }catch(err){
        res.status(401).send('Unauthorized:No token provided'+err.message);
        console.log("no token is avaible user is not logged");
        
    }

}

module.exports =Authenicate;