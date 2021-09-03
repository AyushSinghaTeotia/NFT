const { compareSync } = require("bcryptjs");
const moment = require('moment');
const request = require('request');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const paintingServices = require("../services/paintingServices");
const userServices = require("../services/userServices");
const blockchainServices = require("../services/blockchainServices");
const token = require('../helper/token');
const { JWT_SECRET_KEY } = require('../config/default.json');
const { mail } = require('../helper/mailer');
const { calculateHours } = require('../helper/userHelper');
const { balanceMainBNB, coinBalanceBNB } = require('../helper/bscHelper');
const { balanceMainETH } = require('../helper/ethHelper');
const { activationTokens } = require('../models/contact');
const contentCreaterServices = require("../services/contentCreaterServices");


const Storage = multer.diskStorage({
    destination:'./public/uploadFile',
    filename:(req,file,cb)=>{
      cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
    }
})

//middleware
const upload = multer({
    storage:Storage
}).single('file');



const signup= async (req,res)=> {
    res.render('users/register', { layout: 'layouts/front/layout' });

}

const kyc=async (req,res)=>{
    let user_id=req.session.re_us_id;
    let userKyc=await userServices.getKycBYId(user_id);
    if(userKyc)
      {
          console.log(userKyc);
        res.render('users/kyc/',{title:"KYC",role:req.session.role,userKyc,session:req.session});

      }else{

        res.render('users/kyc/create.ejs',{title:"KYC",role:req.session.role,session:req.session});


      }
}


const saveKyc=async (req,res)=>{
    let user_id=req.session.re_us_id;
    let image=req.file.filename;
    try
     {
        let userKyc=await userServices.saveKyc(image,user_id);
        
        req.flash('err_msg', 'Document Uploaded Successfully.');

        res.redirect('/users/do-kyc');
     }
    catch(error)
     {
        console.log(error);
     }
}

const submitSignup = async (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let mobile = req.body.mobile;
    let username = req.body.username;
    
      console.log(req.body);
        if(name && email && password && username && mobile){
            let user = await userServices.checkUser(req.body.email);
            console.log(user);
            if (user) 
             {
                req.flash('err_msg', 'Email already exists. Please enter another email.');
                res.redirect('/users/signup');
            }
            else {
                let mystr = await contentCreaterServices.createCipher(req.body.password);
                let created = await contentCreaterServices.createAtTimer();
                let newuser = await userServices.addUser(req.body, mystr, created);
                let user = await userServices.checkUser(req.body.email);
                //let activationmail = await userServices.sendActivationMail(user, req)
                console.log(user);
                req.flash('success_msg', 'Content Creater registered. Please verify to continue.');
              res.redirect('/users/login');
            }
        
        }
   
}




module.exports = {
    upload,
    kyc,
    saveKyc
};
