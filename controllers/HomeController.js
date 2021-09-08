const { compareSync } = require("bcryptjs");
const moment = require('moment');
const request = require('request');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const paintingServices = require("../services/paintingServices");
const blockchainServices = require("../services/blockchainServices");
const userServices = require("../services/userServices");
const token = require('../helper/token');
const { JWT_SECRET_KEY } = require('../config/default.json');
const { mail } = require('../helper/mailer');
const { calculateHours } = require('../helper/userHelper');
const { balanceMainBNB, coinBalanceBNB } = require('../helper/bscHelper');
const { balanceMainETH } = require('../helper/ethHelper');
const { UserInfo } = require("../models/userModel");


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

const explore=async (req,res)=>{
    
        res.render('explore',{ layout: 'layouts/front/layout'});
}
const exploreContent=async(req,res)=>{
    let query=req.query.category;
    console.log(query);
    let content = await paintingServices.allpaintingList(query);

    res.send(content);

}

const model=async (req,res)=>{
     
    res.render('models',{ layout: 'layouts/front/layout' });

}
const contentDetail=async(req,res)=>{
    let id=req.query.id.trim();
    let details=await paintingServices.getContentDetail(id);
    let creater=await userServices.checkUserByID(details.created_by);
    res.render('nft-detail',{layout:'layouts/front/layout',details,creater});
}

module.exports = {
    explore,
    exploreContent,
    model,
    contentDetail
};
