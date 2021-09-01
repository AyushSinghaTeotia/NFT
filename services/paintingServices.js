const moment = require("moment");
const { generateCode } = require('../helper/userHelper');
const { UserInfo } = require('../models/userModel');
const crypto = require('crypto');

const { PaintingInfo } = require("../models/painting");

const addPainting = async (paintingDetail,created,created_by,image) => {
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
    available_to:paintingDetail.available_to,
    contract_type:paintingDetail.contract_type,
    created_at: created,
    created_by: created_by,
    updated_at: '',
    updated_by: '',
    status: "active"
  };
  console.log(paintingObject);
  try {
    const painting = new PaintingInfo(paintingObject);
    await painting.save();
    console.log("painting",painting);
    return paintingObject;
  } catch (error) {
      console.log(error);
  }
};

const getPainting = async (id) => {
    let paiting = await PaintingInfo.findOne({ '_id':id});
    if (paiting) {
      return paiting;
    }
  };

const paintingList = async (created_by)=>{
    let painting=await PaintingInfo.find({'created_by':created_by});
    if(painting){
      return painting;
    }
  }

  const checkPainting=async (title)=>{
      let painting=await PaintingInfo.findOne({'title':title});
      if(painting){
          return painting;
      }
  }

  const updatePainting = async (id,paintingDetail,updated_at,updated_by,image) => {
    try {
      let painting= await PaintingInfo.findOne({ '_id':id });
      console.log(painting); console.log(id);
      if (painting) 
      {
       
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
          available_to:paintingDetail.available_to,
          contract_type:paintingDetail.contract_type,
          updated_at:updated_at,
          updated_by:updated_by,
          status: "active"
        };
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


module.exports = {
    addPainting,
    getPainting,
    checkPainting,
    paintingList,
    deletePainting,
    updatePainting
  
  };