const moment = require("moment");
const { generateCode } = require('../helper/userHelper');
const { UserInfo } = require('../models/userModel');
const crypto = require('crypto');
const { ContentMediaInfo } = require("../models/contentMedia");

const { PaintingInfo } = require("../models/painting");
const { userInfo } = require("os");

const addPainting = async (paintingDetail,created,created_by,image,media_type) => {
  const paintingObject = {
    total_copy:paintingDetail.total_copy,
    copy_for_sale:paintingDetail.copy_for_sale,
    title:paintingDetail.title,
    category: paintingDetail.category,
    for_sale:paintingDetail.for_sale,
    basic_price:paintingDetail.basic_price,
    plateform_fees:paintingDetail.plateform_fees,
    total_taboo:paintingDetail.total_taboo,
    payment_in:paintingDetail.payment_in,
    image:image,
    media_type:media_type,
    available_to:paintingDetail.available_to,
    contract_type:paintingDetail.contract_type,
    meta_tag:paintingDetail.meta_tag,
    description:paintingDetail.description,
    created_at: created,
    created_by: created_by,
    updated_at: '',
    updated_by: '',
    status: "pending"
  };
  console.log(paintingObject);
  try {
    const painting = new PaintingInfo(paintingObject);
    await painting.save();
    console.log("painting",painting);
    return painting;
  } catch (error) {
      console.log(error);
  }
};

const saveContentMedia=async(content_id,filename,file_type)=>{

    let media={
            content_id:content_id,
            media_name:filename,
            media_type:file_type  
       }
    try{

     let  media_files= new ContentMediaInfo(media);
     await media_files.save();
     console.log(media_files);
     return media_files;
    }
    catch(err){
      console.log(err);
    }
}

const getPainting = async (id) => {
    let paiting = await PaintingInfo.findOne({ '_id':id});
    if (paiting) {
      return paiting;
    }
  };

const paintingList = async (created_by,category,basic_price)=>{
  let painting="";
  
    if(category){
      painting=await PaintingInfo.find({'created_by':created_by,'category':{$in:category }});
    }
    else if(basic_price){
      painting=await PaintingInfo.find({'created_by':created_by,'basic_price':{$in:basic_price }});

    }
    else
    {
       painting=await PaintingInfo.find({'created_by':created_by});
     }
    if(painting){
      return painting;
    }
  }

  const allpaintingList = async (category,basic_price)=>{
    let painting="";
      if(category){

        painting=await PaintingInfo.find({'category':{$in:category }}).sort( {_id:-1 } );

      }
      else if(basic_price){
        painting=await PaintingInfo.find({'basic_price':{$in:basic_price }}).sort( {_id:-1 } );
       }
      else
      {

         painting=await PaintingInfo.find({}).sort( {_id:-1 } );

       }
      if(painting){
        return painting;
      }
    }

  const getContentMedia=async(id)=>{
     let media=await ContentMediaInfo.find({'content_id':id});
     return media;

  }

    const getpaintingList = async (query,sortby)=>{
      let painting="";
        if(query){
             
          if(sortby=="lh")
            {

           // painting=await PaintingInfo.find({'status':'approved',$or:[{'category':{$in:query }},{'basic_price':{$in:query }},{'title':{$regex:query }},{'meta_tag':{$regex:query }}]}).sort( {basic_price:1 } );
           
             painting=await PaintingInfo.aggregate([
              { "$match": {'status':'approved', $or: [ {'category':query},{'basic_price':query},{'title':{$regex:query }},{'meta_tag':{$regex:query }} ] } },
              { "$sort": { "basic_price": 1 } },
              { "$limit": 20 }, 
              { "$lookup": {
                "localField": "created_by",
                "from": "users",
                "foreignField": "_id",
                "as": "userinfo"
              } },
              { "$unwind": "$userinfo" },
              { "$project": {
                "title":1,
                "image":1,
                 "media_type":1,
                "_id":1,
                "userinfo._id": 1,
                "userinfo.name": 1,
                "userinfo.image": 1
              } }
            ]);  

           }
           else
            {

              //painting=await PaintingInfo.find({'status':'approved',$or:[{'category':{$in:query }},{'basic_price':{$in:query }},{'title':{$regex:query }},{'meta_tag':{$regex:query }}]}).sort( {basic_price:-1 } );
                 
              painting=await PaintingInfo.aggregate([
                { "$match": {'status':'approved', $or: [ {'category':query},{'basic_price':query},{'title':{$regex:query }},{'meta_tag':{$regex:query }} ] } },
                { "$sort": { "basic_price": -1 } },
                { "$limit": 20 }, 
                { "$lookup": {
                  "localField": "created_by",
                  "from": "users",
                  "foreignField": "_id",
                  "as": "userinfo"
                } },
                { "$unwind": "$userinfo" },
                { "$project": {
                  "title":1,
                  "image":1,
                  "media_type":1,
                  "_id":1,
                  "userinfo._id": 1,
                  "userinfo.name": 1,
                  "userinfo.image": 1
                } }
               
              ]);  


           }
  
        }
        else
        {
  
          if(sortby=="lh")
           {
            //painting=await PaintingInfo.find({'status':'approved'}).sort( {basic_price:1 } );


            painting=await PaintingInfo.aggregate([
              { "$match": {'status':'approved' } },
              { "$sort": { "basic_price": 1 } },
              { "$limit": 20 }, 
              { "$lookup": {
                "localField": "created_by",
                "from": "users",
                "foreignField": "_id",
                "as": "userinfo"
              } },
              { "$unwind": "$userinfo" },
              { "$project": {
                "title":1,
                "image":1,
                "media_type":1,
                "_id":1,
                "userinfo._id": 1,
                "userinfo.name": 1,
                "userinfo.image": 1
              } }
            ]);  

           }else
             {
              //painting=await PaintingInfo.find({'status':'approved'}).sort( {basic_price:-1 } );
               
              painting=await PaintingInfo.aggregate([
                { "$match": {'status':'approved' } },
                { "$sort": { "basic_price": -1 } },
                { "$limit": 20 }, 
                { "$lookup": {
                  "localField": "created_by",
                  "from": "users",
                  "foreignField": "_id",
                  "as": "userinfo"
                } },
                { "$unwind": "$userinfo" },
                { "$project": {
                  "title":1,
                  "image":1,
                  "media_type":1,
                  "_id":1,
                  "userinfo._id": 1,
                  "userinfo.name": 1,
                  "userinfo.image": 1
                } }
              ]);  


             }
  
         }
        if(painting)
         {
           return painting;
         }
      }

  const search=(query)=>{

    let content="";
     if(query)
      {
        content=PaintingInfo.find({$or:[{title:{$regex:query}},{meta_tag:{$regex:query}},{basic_price:query},{status:query}]});
      }
      else
      {
       
        content=PaintingInfo.find({});

      }

  }  
  
  

  const autherContent=async (author_id)=>{
     console.log(author_id)
    let painting=await PaintingInfo.find({'status':'approved','created_by':author_id});
      
    
    console.log(painting)
      return painting;
  } 

  const checkPainting=async (title)=>{
      let painting=await PaintingInfo.findOne({'title':title});
      if(painting){
          return painting;
      }
  }

  const updatePainting = async (id,paintingDetail,updated_at,updated_by,image,media_type) => {
    try {
      let painting= await PaintingInfo.findOne({ '_id':id });
      console.log(painting); console.log(id);
      if (painting) 
      {  
        let paintingObject="";
       
        if(media_type==""){
           paintingObject = {
            total_copy:paintingDetail.total_copy,
            copy_for_sale:paintingDetail.copy_for_sale,
            title:paintingDetail.title,
            category: paintingDetail.category,
            for_sale:paintingDetail.for_sale,
            basic_price:paintingDetail.basic_price,
            plateform_fees:paintingDetail.plateform_fees,
            total_taboo:paintingDetail.total_taboo,
            payment_in:paintingDetail.payment_in,
            image:image,
            available_to:paintingDetail.available_to,
            contract_type:paintingDetail.contract_type,
            meta_tag:paintingDetail.meta_tag,
            description:paintingDetail.description,
            updated_at:updated_at,
            updated_by:updated_by,
            status: "pending"
          };
        }else
         {
           paintingObject = {
            total_copy:paintingDetail.total_copy,
            copy_for_sale:paintingDetail.copy_for_sale,
            title:paintingDetail.title,
            category: paintingDetail.category,
            for_sale:paintingDetail.for_sale,
            basic_price:paintingDetail.basic_price,
            plateform_fees:paintingDetail.plateform_fees,
            total_taboo:paintingDetail.total_taboo,
            payment_in:paintingDetail.payment_in,
            image:image,
            media_type:media_type,
            available_to:paintingDetail.available_to,
            contract_type:paintingDetail.contract_type,
            meta_tag:paintingDetail.meta_tag,
            description:paintingDetail.description,
            updated_at:updated_at,
            updated_by:updated_by,
            status: "pending"
          };
         }
       
       console.log('before updating',paintingObject);
        await PaintingInfo.updateOne({ '_id': id }, { $set:paintingObject });
      }
      let paintingResult = await PaintingInfo.findOne({ '_id':id });

      console.log('After Updating',paintingResult);
      return paintingResult;
    } catch (error) {
      console.log(error);
    }
  };

  const deletePainting=async(id)=>{

      try{

        let res= await  PaintingInfo.deleteOne({'_id':id});
        if(res){
              console.log("Painting Deleted Successfully!");
          }
      }catch(error){
        console.log(error);
      }
      
        
  }
  
  const createAtTimer = async () => {
    let indiaTime1 = new Date().toLocaleString("en-US", { timeZone: "Europe/London" });
    let indiaTime = new Date(indiaTime1);
    let created_at = indiaTime.toLocaleString();
    return created_at;
  };

  const updateEmailStatus = async (id) => {
    try {
      let user = await PaintingInfo.findOne({ '_id': id });
      if (user) {
        await PaintingInfo.update({ '_id': id }, { $set: { email_verify: 'verified', otp: null } });
      }
      let userUpdated = await PaintingInfo.findOne({ '_id': id });
      return userUpdated;
    } catch (error) {
      return null;
    }
  };


 
  const referData = async (ref_code, ref_link, id, created) => {
    const referObject = {
      my_ref_code: ref_code,
      reg_ref_code: ref_link,
      created_at: created,
      user_id: id
    };
    try {
      const refData = new RefCode(referObject);
      await refData.save();
      return referObject;
    } catch (error) {
      console.log("Error", error.message);
    }
  };
  
  const checkUserReferCode = async (code) => {
    let user = await PaintingInfo.findOne({ 'ref_code': code });
    if (user) {
      return user;
    }
  };

  const totalContent=async (id,role)=>{
    let total;
    if(role=="admin"){
       total=await PaintingInfo.count();

    }else
    {
     total=await PaintingInfo.find({'created_by':id}).count();

    }
    return total;
  }

  const totalContentForSale=async (id,role)=>{
    let total;
    if(role=="admin"){
       total=await PaintingInfo.count({'for_sale':'Yes'});

    }else
    {
     total=await PaintingInfo.find({'created_by':id,'for_sale':'Yes'}).count();

    }
    return total;
  } 


  const totalPendingContent=async (id,role)=>{
    let total;
    if(role=="admin"){
       total=await PaintingInfo.count({'status':'pending'});

    }else
    {
     total=await PaintingInfo.find({'created_by':id,'status':'pending'}).count();

    }
    return total;
  }




  const updateContentStatus=async(id,status)=>{
    let content=await PaintingInfo.updateOne({ '_id': id }, { $set: { 'status':status} });
    return content;
  }

  const getContentDetail=async(id)=>{
    let details=await PaintingInfo.findOne({'_id':id});
    return details;
  }

module.exports = {
    addPainting,
    getPainting,
    checkPainting,
    paintingList,
    deletePainting,
    updatePainting,
    allpaintingList,
    totalContent,
    updateContentStatus,
    totalPendingContent,
    totalContentForSale,
    getContentDetail,
    getpaintingList,
    saveContentMedia,
    getContentMedia,
    autherContent

  
  };