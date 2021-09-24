const { compareSync } = require("bcryptjs");
const moment = require('moment');
const request = require('request');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { mail } = require('../helper/mailer');
const orderServices=require('../services/orderServices');
const userServices = require('../services/userServices')
const contentCreaterServices=require('../services/contentCreaterServices');
const paintingServices = require("../services/paintingServices");
const mintServices=require('../services/mintServices');
const base_url = process.env.BASE_URL;

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

const saveOrder=async(req,res)=>{
    let address=req.body.address;
    let user=await userServices.checkUserByWallet(address);
    let content=await paintingServices.getContentDetail(req.body.content_id);
    let user_id="";
    if(user){
        user_id=user._id;
        req.session.success = true;
        req.session.re_us_id = user._id;
        req.session.re_usr_name = user.name;
        req.session.re_usr_email = user.email;
        req.session.is_user_logged_in = true;
        req.session.role=user.user_role;
      }
    else
      {
            let email=address+"@gmail.com";
            let mystr = await contentCreaterServices.createCipher("123456");
            let created = await contentCreaterServices.createAtTimer();
            userOBJ={ name:address,
                   email:email,
                   password:mystr,
                   username:"metamask",
                   mobile:"1234567898",
                   wallet_address:address,
                   user_role:"user",
                   created_at:created  
                   }

                   let newuser = await userServices.addUserByWallet(userOBJ);
                   let user=await userServices.checkUserByWallet(address);
                   user_id=user._id;
                   req.session.success = true;
                   req.session.re_us_id = user._id;
                   req.session.re_usr_name = user.name;
                   req.session.re_usr_email = user.email;
                   req.session.is_user_logged_in = true;
                   req.session.role=user.user_role;      
      }
    
    let order={
              user_id:user_id,
              content_id:req.body.content_id,
              trans_id:req.body.trans_id,
              user_wallet_address:req.body.address,
              total:req.body.amount,
              status:"success"
              } 
     try{
        let orderData=await orderServices.saveOrder(order);
        let tokenUrl=base_url+'/uploadFile/'+content.image;
        let nftDetail=await mintServices.getTokens(tokenUrl);
       
         await mintServices.transferNFT(nftDetail[1][0],req.body.address,nftDetail[0][0]);

        console.log(nftDetail);
        res.send(orderData);
     }catch(err){
         console.log(err);
     }
    

}

const confirmOrder=async(req,res)=>{
  let order_id=req.query.id.trim();
  let content=await paintingServices.getContentDetail(order.content_id);
  let creator=await orderServices.findOrder(content.created_by);
  

}


module.exports={
    saveOrder,
};
