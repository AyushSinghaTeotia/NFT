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

const uploadFiles = multer({ storage : Storage }).array('file',4);



const index=async (req,res)=>{
    let created_by=req.session.re_us_id;
    let painting=await paintingServices.paintingList(created_by);
    if(painting){
        res.render('users/creaters/painting-list',{role:req.session.role,painting:painting,name:req.session.re_usr_name})
    }
}
const searchContent=async(req,res)=>{
    let category=req.query.category;
    let basic_price=req.query.basic_price;

    console.log(category);
    let created_by=req.session.re_us_id;
    let painting="";
    if(req.session.role=="creater"){
        painting=await paintingServices.paintingList(created_by,category,basic_price);
    }
    else
     {
        painting=await paintingServices.allpaintingList(category,basic_price);

     }
    

    res.send(painting);

}
const savePainting = async (req, res) => {
   
    
        console.log(req.body); console.log("body",req.body.preview);
        
         if(req.body.preview=="preview")
          { console.log('uploaded files',req.files);
           let pr_image= req.files[0].filename
           req.session.preview_image=pr_image;
           req.session.files=req.files;
           req.session.fordata=req.body; 
           res.render('users/creaters/preview',{title:"preview",data:req.body,role:req.session.role,image:pr_image,name:req.session.re_usr_name,files:req.files});
            
          }
         else
         {
           
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
                    let ContentData="";
                    if(req.session.preview_image){
                       image=req.session.preview_image;
                       ContentData=req.session.fordata;

                      }else{
                        image = req.files[0].filename;
                        ContentData=req.body;
                      }
                    console.log(created_by)
                    try{
    
                        let painting = await paintingServices.addPainting(ContentData,created,created_by,image);
                         console.log("created successfully",painting);
                         
                         let files="";
                         if(req.session.files){
                             files=req.files;
                         }else
                         {
                             files=req.files;
                         }
                         
                         let content_id=painting._id;
                         files.forEach( async function(file,index)
                           {
                             let content_media=await paintingServices.saveContentMedia(content_id,file.filename);
                             console.log(content_media);
                           });


                    }catch(err){ console.log(err)}
                   // let user = await userServices.checkUser(req.body.email);
                    //let activationmail = await userServices.sendActivationMail(user, req)
                    console.log(painting);
                    req.flash('success_msg', 'Content Created Successfully.');
                  res.redirect('/users/paintings');
                }
            
            
         }
   
}

const updateContentStatus=async (req,res)=>{
    const id=req.query.id.trim();
    let status="approved";
    let content=await paintingServices.updateContentStatus(id,status);
    if(content){
         res.redirect('/users/dashboard');
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
    let files=await paintingServices.getContentMedia(painting._id);

    console.log(files);
    
    if(painting){
        res.render('users/creaters/edit-painting',{role:req.session.role,painting:painting,name:req.session.re_usr_name,files});
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
    preview,
    searchContent,
    updateContentStatus,
    uploadFiles
};
