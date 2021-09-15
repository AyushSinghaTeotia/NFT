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
    
        res.render('explore',{ layout: 'layouts/front/layout',name:req.session.re_usr_name});
}
const index=async(req,res)=>{
     let query="";
    let content = await paintingServices.getpaintingList(query);
    res.render('index',{layout:'layouts/front/layout',name: req.session.re_usr_name,content})
}
const exploreContent=async(req,res)=>{
    let query=req.query.category;
    let sortby=req.query.sortby;
    console.log(query); console.log(sortby);
    let content = await paintingServices.getpaintingList(query,sortby);

    res.send(content);

}

const model=async (req,res)=>{
     
    res.render('models',{ layout: 'layouts/front/layout',name:req.session.re_usr_name});

}
const contentDetail=async(req,res)=>{
    let id=req.query.id.trim();
    let details=await paintingServices.getContentDetail(id);
    let creater=await userServices.checkUserByID(details.created_by);
    res.render('nft-detail',{layout:'layouts/front/layout',details,creater,name:req.session.re_usr_name});
}

const author=async(req,res)=>{
    let author_id=req.query.id.trim();

    let content=await paintingServices.autherContent(author_id);
    let user=await userServices.checkUserId(author_id);
    console.log(content);
    res.render('author',{ layout: 'layouts/front/layout',name:req.session.re_usr_name,content:content,user:user});
}

module.exports = {
    explore,
    exploreContent,
    model,
    contentDetail,
    index,
    author
};
