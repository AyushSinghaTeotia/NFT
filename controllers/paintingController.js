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

const index=async (req,res)=>{
    let created_by=req.session.re_us_id;
    let painting=await paintingServices.paintingList(created_by);
    if(painting){
        res.render('users/creaters/painting-list',{role:req.session.role,painting:painting,name:req.session.re_usr_name})
    }
}
const savePainting = async (req, res) => {
   
    
        console.log(req.body); console.log("body",req.body.preview);
        
         if(req.body.preview=="preview")
         { let pr_image= req.file.filename
           req.session.preview_image=pr_image; 
           res.render('users/creaters/preview',{title:"preview",data:req.body,role:req.session.role,image:pr_image,name:req.session.re_usr_name});
            
         }
         else
         {
            if(req.body.title && req.body.total_copy){
                //let painting = await paintingServices.checkPainting(req.body.title);
                console.log(req.body);
                let painting=false;
                if (painting) 
                 {
                    req.flash('err_msg', 'Title already exists');
                    res.redirect('/users/create');
                }
                else {
    
                    let created="30-08-2021";
                    let created_by=req.session.re_us_id;
                    let image="";
                    if(req.session.preview_image){
                       image=req.session.preview_image;

                      }else{
                        image = req.file.filename;
                      }
                    console.log(created_by)
                    try{
    
                        let painting = await paintingServices.addPainting(req.body,created,created_by,image);
    
                    }catch(err){ console.log(err)}
                   // let user = await userServices.checkUser(req.body.email);
                    //let activationmail = await userServices.sendActivationMail(user, req)
                    console.log(painting);
                    req.flash('success_msg', 'Content Created Successfully.');
                  res.redirect('/users/paintings');
                }
            
            }
         }
   
}

const preview=(req,res)=>{

     res.render('users/creaters/preview',{title:"preview",data:req.body,name:req.session.re_usr_name});

}
const deletePainting=async (req,res)=>{
    let id=req.query.id.trim();
     
    try{

      await paintingServices.deletePainting(id);
    
       res.redirect('/users/paintings')
    

    }catch(error){
        console.log(error);
    }
     
}

const editPainting=async (req,res)=>{
    let id=req.query.id.trim();
    let painting=await paintingServices.getPainting(id);
    if(painting){
        res.render('users/creaters/edit-painting',{role:req.session.role,painting:painting,name:req.session.re_usr_name});
    }else
    {
        console.log("There is no such record");
    }
}

const updatePainting=async (req,res)=>{
    let id=req.body.id;
    //let { id } = req.payload;
    console.log(id);
    console.log(req.body);
    if(req.body.title){
        let updated_at=new Date();
        let updated_by=req.session.re_us_id;
        if(!req.file){
            

          var image=req.body.old_image;

        }else
        {
            var image= req.file.filename;
        }
        let painting=await paintingServices.updatePainting(id,req.body,updated_at,updated_by,image);
        console.log(painting);
        res.redirect('/users/paintings');
    }
   
}

module.exports = {
    savePainting,
    upload,
    index,
    deletePainting,
    editPainting,
    updatePainting,
    preview
};
