const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

const grievanceSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    // Add other fields based on your form data
    branch: String,
    issueType: String,
    cardType: String,
    cardNumber: Number,
    cardExpirationDate: Date,
    locationCode: Number,
    description: String,
    status: {
        type: String,
        default: 'pending' // Set default status to 'pending'
    }
});

const userschema=new mongoose.Schema({
    email:{
        type: String,
        required:true,
        unique:true
        
    },
    password:{
        type:String,
        required:true
    },
    // grievances:[
    // {   
    //     type: {
    //         type: String,
    //         required: true,
    //     },
    //     branch: String,
    //     issueType: String,
    //     description: String,
    //     cardType: String,
    //     cardNumber: String, // Changed to String to maintain leading zeros
    //     cardExpirationDate: Date,
    //     locationCode: String, // Changed to String since it's a code
    //     // atmIssueDescription: String,
    //     status: {
    //         type: String,
    //         default: "Not seen"
    //     },
    //     feedback: {
    //         type: String,
    //         default: "NA"
    //     },
    //     date: {
    //         type: Date,
    //         default: Date.now
    //     }
    // }
    // ],
     // Define createdAt field to track when the grievance was created
    createdAt: {
        type: Date,
        default: Date.now // Automatically set to current timestamp when the document is created
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ],
    grievances: [grievanceSchema] // Establishing a relationship between User and Grievance
    
})

//hashing the password
userschema.pre('save',async function(next){
    // console.log(`hi from pre save`);
    if(this.isModified('password')){
        //only hash the password when user changes the password
        // console.log('in hash function');
        this.password=await bcrypt.hash(this.password,12);
        // this.cpassword=bcrypt.hash(this.cpassword,12);
    }
    next();
    
});


//we are generating the token
userschema.methods.generateAuthToken = async function(){
    try{
        let token= jwt.sign({_id:this._id},process.env.SECRET_KEY);
        this.tokens=this.tokens.concat({token:token})
        await this.save();
        return token;
    }catch(err){
        console.log(err);
    }

}

//store the grievance
// userschema.methods.addGrievance=async function(name,email,phone,grievance){
//     try{
//       this.grievances=this.grievances.concat({name,email,phone,grievance});
//       await this.save();
//       return this.messages;
//     }catch(err){
//         console.log(err);
//     }
// }

//creating a collection
const User=mongoose.model('USER',userschema);

module.exports =User;


