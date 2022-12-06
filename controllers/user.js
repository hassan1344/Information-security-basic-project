import User from "../models/user.js";
import aes from 'crypto-js/aes.js'
import CryptoJS from 'crypto-js';
import nodemailer from 'nodemailer';
import pdf from 'pdfkit';
import fs from 'fs';
import path  from "path";
var forgetPassToken = null
import{
  dirname
} from 'path';

import {
  fileURLToPath
} from 'url';

const __dirname = dirname(fileURLToPath (import.meta.url));

const getRandomCode = () => {
  var text = "";
  var possible = "ABCDEHIJKLMNOPQRSTUVWXYZ0123456789";

  for (var i = 0; i < 8; i++)
    text +=  possible.charAt(Math.floor(Math.random() * possible.length));

 

  return text;
}



const verifyUser = async(req,res) => {
  const {id,code} = req.body;
  if(!id || !code || id == '' || code == '')
  return res.status(400).send({message : 'Incomplete fields!'});

  const userDetails = await User.findById(id);

  if(userDetails.verify_code != code)
  return res.status(403).send({message : 'Incorrect code entered!'});

await User.findByIdAndUpdate(id, {
  isVerified : true
})
res.status(200).send({message : 'You have been successfully verified. Please login again'});


}


const login = async (req, res, next) => {

  if ((!req.body.emailId) || !req.body.password) {
    return res.status(400).send({
       message: 'All fields are required!'
    });
 }

 const user = await User.findOne({emailId : req.body.emailId});


 if (!user)
 return res.status(200).send({
    message: "User doesn't exists!"
 });

 if(!user.isVerified){
  const code = getRandomCode();
  const html = 
`
<html>

<body>
<p> Enter the following code to verify yourself : ${code}</p>
<body>
</html>

`

var transporter = nodemailer.createTransport({  //u can use your own mailing server credentials
  host : '',
  port : '', //will be an integer value
  auth : {
    user : '',
    pass : ''
  }
});

let info = await transporter.sendMail({
  from: '', 
  to: '', 
  subject: "User verification", 
  html : html,
});
  
  await User.updateOne({emailId  : req.body.emailId},{
    verify_code : code
  })

  res.render(__dirname + '/html pages/verify_user',{emailId : user.emailId, id : user._id});
 }

 else {


  const decryptedPass = aes.decrypt(user.password,'secretKEY54321').toString(CryptoJS.enc.Utf8)
  
  const validPassword = req.body.password == decryptedPass ? true : false;
  if (!validPassword)
     return res.status(200).send(
      {message : 'Invalid Credentials!'}     
      );
  else {
    res.render(__dirname + '/html pages/apis',{emailId : user.emailId, id : user._id});
   

    //  return res.status(200).send(
    //   "<html> <body><h1> Successfully Logged in! </h1></body></html>"
    //  );
  }
}

};

const signup = async (req, res, next) => {
  const user = await User.findOne({ emailId: req.body.emailId });

  if(user){
    res.status(400).send({message : 'User Already associated with this account'});
  }

  else{
    const encryptedPass  = aes.encrypt(req.body.password, 'secretKEY54321').toString()
    const newUser = new User({
      emailId : req.body.emailId,
      password : encryptedPass,
      Role : req.body.Role,
      phone : req.body.phone,
    });
     
    await newUser.save();
    res.status(200).send({message : 'User has been successfully registered'});


  }
}
 

const previewAll = async(req,res) => {
  let userid = req.url.split('=')[2]
  
  const getuser = await User.findById(userid)

  if(getuser.Role == 'Admin'){
    const allusers = await User.find({Role : 'User'})
    let real_data = []

    for(let i=0 ; i<allusers.length; i++){
      real_data.push({
        id : allusers[i]._id,
        email : allusers[i].emailId,
        password : aes.decrypt(allusers[i].password,'secretKEY54321' ).toString(CryptoJS.enc.Utf8),
        role_in_system : allusers[i].Role
      })
    }
    res.status(200).json({'All Users Registered in system' : real_data})
    

  }

  else{
    res.status(403).json({message : 'you must be an admin to access this API'})
  }
}

const previewLoggedin = async(req,res) => {
  let userid = req.url.split('=')[2]

  const getusr  = await User.findById(userid)

  if(getusr.Role == 'User'){
  res.status(200).json({'Your Data' : {
    id : getusr._id,
    email : getusr.emailId,
    password : aes.decrypt(getusr.password,'secretKEY54321' ).toString(CryptoJS.enc.Utf8),
    role_in_system : getusr.Role
  }
  })
  }
  else{
    res.status(403).json({message : 'you must be a User to access this API'})

  }

}

const resetAnyUserPass = async(req,res) => {
  let userid = req.url.split('=')[2]

  const getusr  = await User.findById(userid)
  if(getusr.Role == 'Admin'){
    res.render(__dirname + '/html pages/reset_any')
  }
  else{
    res.status(403).json({message : 'you must be an Admin to access this API'})

  }

}

const resetPassByADmin = async(req,res) =>{
const {userID, password} = req.body

if(!userID || !password || password == '' || userID == '')
return res.status(400).json({message : 'Missing fields'});


let encryptedPass = aes.encrypt(password, 'secretKEY54321').toString()
const searchedUser = await User.findByIdAndUpdate(userID,{
  password : encryptedPass
});
const userDetails = await User.findById(userID);

const pdfPass = userDetails.phone.substring(userDetails.phone.length - 4);
generatePDF(pdfPass,password);

const html = 
`
<html>

<body>
<p> Your password has been successfully changed by the admin of the system. If you want to open this pdf, use the last 4 digits of your phone number registered within the system</p>
<body>
</html>

`

var transporter = nodemailer.createTransport({ ////u can use your own mailing server credentials
  host : '',
  port : '', //will be an integer value
  auth : {
    user : '',
    pass : ''
  }
});

let info = await transporter.sendMail({
  from: '', 
  to: '' ,
  subject: "Your new password", 
  html : html,
  attachments: [{
    filename : 'password.pdf',
    path : path.join(__dirname , '..' + '/password.pdf'),
    contentType : 'application/pdf'
  }]
  
});

return res.status(200).json({message : `Password of this user with email ID ${searchedUser.emailId} has been successfully updated and user has been notified`})

};


const resetLoggedInpass = async(req,res) =>{

  let userid = req.url.split('=')[2]
  const getusr  = await User.findById(userid)
  if(getusr.Role == 'User'){
    res.render(__dirname + '/html pages/reset_user_pass', {id : getusr._id, email : getusr.emailId})
  }
  else{
    res.status(403).json({message : 'you must be a User to access this API'})

  }
  
}
const resetPassByuser = async(req,res) =>{
  const {id, password} = req.body
  if(!id || !password || password == '' || id == '')
  return res.status(400).json({message : 'Missing fields'});

  let encryptedPass = aes.encrypt(password, 'secretKEY54321').toString()
  const searchedUser = await User.findByIdAndUpdate(id,{
    password : encryptedPass
  });
  return res.status(200).json({message : 'Your password has been updated'})
}

const generatePDF = (pass,password) => {
const options = {
  userPassword : pass,
}
const doc = new pdf(options);
doc.text(`Your new password is ${password}`,23,23)
doc.pipe(fs.createWriteStream('password.pdf'))
doc.end();
}

export { login, signup,previewAll,previewLoggedin,resetAnyUserPass,resetPassByADmin,resetLoggedInpass,resetPassByuser,verifyUser};
