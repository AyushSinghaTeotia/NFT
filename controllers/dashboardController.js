const { compareSync } = require("bcryptjs");
const moment = require('moment');
const request = require('request');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const userServices = require("../services/userServices");
const blockchainServices = require("../services/blockchainServices");
const token = require('../helper/token');
const { JWT_SECRET_KEY } = require('../config/default.json');
const { mail } = require('../helper/mailer');
const { calculateHours } = require('../helper/userHelper');
const { balanceMainBNB, coinBalanceBNB } = require('../helper/bscHelper');
const { balanceMainETH } = require('../helper/ethHelper');
const { activationTokens } = require('../models/contact');



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

const createCotent=async (req,res)=>{
    
    if(req.session.is_approved=="Approved")
    {
        console.log(req.session)
        res.render('users/creaters/create',{title:"Dashboard",role:req.session.role,name:req.session.re_usr_name});
    }
    else
    {
        res.render('users/creaters/NotAllow',{title:"Deny",role:req.session.role,name:req.session.re_usr_name});
    }
   
}

const manageKYC=async (req,res)=>{
    res.render('admin/kyc/',{role:req.session.role,name:req.session.re_usr_name});

}

const manageTransaction=async (req,res)=>{
    res.render('admin/transactions/',{role:req.session.role,name:req.session.re_usr_name});
    
}

module.exports = {
    createCotent,
    manageKYC,
    manageTransaction
};
