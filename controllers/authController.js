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

const loginPage = async (req, res) => {
       let err_msg = req.flash('err_msg');
    //let success_msg = req.flash('success_msg');

        res.render('users/login', { layout: 'layouts/front/layout',err_msg:err_msg });
    
}

const signup= async (req,res)=> {
    res.render('users/register', { layout: 'layouts/front/layout' });

}



const userLogin = async (req, res) => {
    //console.log(req.body)
    let user = await userServices.checkUser(req.body.email);
    let password = req.body.password.trim();
    let mystr = await userServices.createCipher(password);
    if (user) {
        if (user.email_verified == true) {
            let wallet = { success: 0, msg: "Account not activated please activate account before login" };
            let wallet_details = JSON.stringify(wallet);
            return res.send(wallet_details);
        }
        userObject = {
            name: user.name,
            email: user.email,
            created_at: user.created_at,
            mobile: user.mobile,
            role: user.user_role,
            status: user.status,
        }
        let userLogin = await userServices.checkUserPass(req.body.email.trim(), mystr);
        if (userLogin) {
            if (userLogin.status == 'active' ) 
             {
                req.session.success = true;
                req.session.re_us_id = userLogin._id;
                req.session.re_usr_name = userLogin.name;
                req.session.re_usr_email = userLogin.email;
                req.session.is_user_logged_in = true;
                req.session.role=userLogin.user_role;
                req.session.is_approved=userLogin.isApproved;
                console.log(req.session);
                res.redirect('/users/dashboard');
            } 
            else 
            {
                req.flash('err_msg', 'Your account is not verified.');
                res.redirect('/login')
            }
        }
        else {
            req.flash('err_msg', 'The username or password is incorrect.');
            res.redirect('/login');
           
        }
    }
    else {
        //let message = { success: 0, msg: "Email address does not exist." };
        req.flash('err_msg', 'Email does not exist.');
        res.redirect('users/login');
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


const logout = async (req, res) => {
    req.session.destroy();
    res.redirect('/users/login');
}





const activateAccount = async (req, res) => {
    let email = req.body.email;
    let user = await userServices.checkUser(email)
    if (user) {
        let mail = await userServices.sendActivationMail(user, req)
        let wallet = { success: 1, msg: "We have sent an activation mail to your registered mail." };
        let wallet_details = JSON.stringify(wallet);
        res.send(wallet_details);
    }
    else {
        let wallet = { success: 0, msg: "Email address does not exist." };
        let wallet_details = JSON.stringify(wallet);
        res.send(wallet_details);
    }
}

const activateUser = async function (req, res) {
    const tokenId = req.params.id
    console.log(tokenId)
    let token = await activationTokens.findOne({ '_id': tokenId });
    if (token) {
        let activate = await userServices.updateUserStatus(token._userId)
        if (activate) {
            let wallet = { success: 1, msg: "Account activted successfully" };
            let wallet_details = JSON.stringify(wallet);
            res.send(wallet_details);
        }
        else {
            let wallet = { success: 0, msg: "Something went wrong please try later" };
            let wallet_details = JSON.stringify(wallet);
            res.send(wallet_details);
        }
    }
    else {
        let wallet = { success: 0, msg: "Activation link deactivated Please resend detials to get activation mail." };
        let wallet_details = JSON.stringify(wallet);
        res.send(wallet_details);
    }
}

const dashboard=async (req,res)=>{
    let user_id=req.session.re_us_id;
    let role=req.session.role;
    let loginwallet = await blockchainServices.importWalletFindId(user_id);
     console.log("login wallet",loginwallet)
    console.log(req.session)
    if(role=="admin"){
        res.render('admin/dashboard/',{title:"Dashboard",role:req.session.role,session:req.session});
     }
     else
     {
        if(loginwallet){

            let contents=await paintingServices.paintingList(user_id);

            res.render('users/dashboard',{title:"Dashboard",role:req.session.role,contents,session:req.session});

        }else{
            res.redirect('/users/create-wallet');
        }
     }
}
const getCreaters=async(req,res)=>{
    let users= await userServices.creaters();
    console.log(users);
    res.render('users/creaters/',{title:"Creaters",role:req.session.role,users:users,session:req.session});
}
const acceptUser=async (req,res)=>{
     let id=req.query.id.trim();
     console.log("user id",id);
     let status="Approved";
     let user=await userServices.checkUserByID(id);
     console.log(user);
     if(user){
        let user= await userServices.updateCreater(id,status);
        res.redirect('/users/creaters');
     }
     else
     {
         console.log("record not found");
     }

}


const rejectUser=async (req,res)=>{
    let id=req.query.id.trim();
    console.log("user id",id);
    let status="Rejected";
    let user=await userServices.checkUserByID(id);
    console.log(user);
    if(user){
       let user= await userServices.updateCreater(id,status);
       res.redirect('/users/creaters');
    }
    else
    {
        console.log("record not found");
    }

}

const forgetPassword = async (req, res) => {
    let user = await userServices.checkUser(req.body.email);
    if (!user) {
        let wallet = { success: 0, msg: "Email address does not exist." };
        let wallet_details = JSON.stringify(wallet);
        res.send(wallet_details);
    }
    else {
        let new_pass = Math.random().toString(36).slice(-6);
        console.log(new_pass, '----------new_pass');
        let mystr1 = await userServices.createCipher(new_pass);
        let userUpdated = await userServices.updateUserPassword(req.body.email, mystr1);
        if (userUpdated) {
            let passwordmail = await userServices.sendNewPasswordMail(req, new_pass, userUpdated._id)
            let wallet = { success: 1, msg: "Password mail sent to registered email" };
            let wallet_details = JSON.stringify(wallet);
            res.send(wallet_details);
        }
        else {
            let wallet = { success: 0, msg: "An error occured." };
            let wallet_details = JSON.stringify(wallet);
            res.send(wallet_details);
        }
    }
}

module.exports = {
    upload,
    userLogin,
    activateAccount,
    activateUser,
    loginPage,
    forgetPassword,
    logout,
    signup,
    dashboard,
    submitSignup,
    getCreaters,
    acceptUser,
    rejectUser
};
