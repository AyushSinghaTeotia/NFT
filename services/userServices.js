const { hashSync } = require("bcryptjs");
const moment = require("moment");
const crypto = require('crypto');
const { generateCode, generateActivationToken } = require('../helper/userHelper');
const { Registration, Userwallet, Importwallet, Tokensettings, Tokendetails, OrderDetails, RefCode, FAQ, ContactInfo, activationTokens } = require('../models/contact');
const {  UserInfo } = require('../models/userModel');
const { KycInfo } =require('../models/kycModel');
const { mail } = require('../helper/mailer');

const addUser = async (userDetails, pass, created) => {
  const userObject = {
    name: userDetails.name,
    
    email: userDetails.email,
    password: pass,
    created_at: created,
    mobile: userDetails.mobile,
    username: userDetails.username
  };
  try {
    const user = new UserInfo(userObject);
    await user.save();
    return userObject;
  } catch (error) {
    console.log(error)
    return null;
  }
};

const updateProfile = async (userDetails, updated_at, re_us_id) => {
  let user = await checkUserId(re_us_id);
  if (user) {
    user.name = userDetails.name;
    user.mobile_no = userDetails.phone;
    user.country = userDetails.country;
    user.address = userDetails.address;
    user.state = userDetails.state;
    user.city = userDetails.city;
    user.dob = userDetails.dob
    user.updated_at = updated_at
    try {
      await user.save();
      return user;
    }
    catch (error) {
      return null;
    }
  }
}


const checkUserId = async (user_id) => {
  let user = await UserInfo.findOne({ '_id': user_id });
  if (user) {
    return user;
  }
};

const checkUser = async (email) => {
  let user = await UserInfo.findOne({ 'email': email });
  if (user) {
    return user;
  }
};

const checkUserByID = async (user_id) => {
  let user = await UserInfo.findOne({ '_id':user_id });
  if (user) {
    return user;
  }
};

const checkUserPass = async (email, password) => {
  let user = await UserInfo.findOne({ 'email': email, 'password': password });
  if (user) {
    return user;
  }
};

const saveKyc=async (filename,user_id)=>{
    let kycData={user_id:user_id,image:filename};
    try{
      let kyc= new KycInfo(kycData);
      await kyc.save();
      return kycData;
    }catch(error){
      console.log(error);
       return null;
    }
    
    
}


const getKycBYKycId = async (user_id) => {
  let kycData = await KycInfo.findOne({ 'user_id':user_id });
  if (kycData) {
    return kycData;
  }
};
const getKycBYId = async (user_id) => {
  let kycData = await KycInfo.find({ 'user_id':user_id });
  if (kycData) {
    return kycData;
  }
};

const getKycList=async(req,res)=>{
 
  let users= await UserInfo.aggregate([
    { $lookup:
       {
         from: 'kycs',
         localField:'_id',
         foreignField:'user_id',
         as: 'kyc_info'
       }
     },
     {
      $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$kyc_info", 0 ] }, "$$ROOT" ] } }
   },
   { $project: { kyc_info: 0 } }
    ]);
  console.log(users);
    return users;
    
}


const getKycDetails=async(id)=>{
 
  let kyc=KycInfo.find({"user_id":id});
  console.log(kyc);
    return kyc;
    
}



const checkUserPassID = async (id, password) => {
  let user = await Registration.findOne({ '_id': id, 'password': password });
  if (user) {
    return user;
  }
};

const updateUserPassword = async (email, password) => {
  try {
    let user = await Registration.findOne({ 'email': email });
    if (user) {
      await Registration.update({ 'email': email }, { $set: { password: password } });
    }
    let userUpdated = await Registration.findOne({ 'email': email });
    return userUpdated;
  } catch (error) {
    return null;
  }
};

const updateUserPasswordID = async (id, password) => {
  try {
    let user = await Registration.findOne({ '_id': id });
    if (user) {
      await Registration.update({ '_id': id }, { $set: { password: password } });
    }
    let userUpdated = await Registration.findOne({ '_id': id });
    return userUpdated;
  } catch (error) {
    return null;
  }
};


const updateCreater = async (id,userstatus) => {
  try {
    let user = await UserInfo.findOne({ '_id': id });
    if (user) {
      await UserInfo.updateOne({ '_id': id }, { $set: { isApproved:userstatus} });
      }
    let userUpdated = await UserInfo.findOne({ '_id': id });
    return userUpdated;
  } catch (error) {
    return null;
  }
};



const createCipher = async (text) => {
  let mykey1 = crypto.createCipher('aes-128-cbc', 'mypass');
  let mystr1 = mykey1.update(text, 'utf8', 'hex')
  mystr1 += mykey1.final('hex');
  return mystr1;
};

const createAtTimer = async () => {
  let indiaTime1 = new Date().toLocaleString("en-US", { timeZone: "Europe/London" });
  let indiaTime = new Date(indiaTime1);
  let created_at = indiaTime.toLocaleString();
  return created_at;
};
const creaters=async()=>{
  let users= await UserInfo.find({user_role:"creater"}).then(users=>{
    console.log(`Successfully found ${users.length} documents.`)
    users.forEach(console.log)
    return users;
  }).catch(err => console.error(`Failed to find documents: ${err}`));
  if(users){
    return users;
  }
}



const sendActivationMail = async function (newuser, req) {
  let activationTokenId = await generateActivationToken(newuser)
  console.log(`26 userServices TokenId`, activationTokenId)
  const subject = 'JUSTyours Account Activation'
  const reciever = `${newuser.email}`
  const message = `
  <h3> Hello ${newuser.name}, </h3>
  <p>Thank you for registering on JUSTyours.</p>
  <p>To activate your account please follow this link:</p>
  <p> <a target="_" href="http://${req.headers.host}/activate/user/${activationTokenId}" </a>Click Here</p>
  <p>This link will get deactivated in 30 min</p>
  <p>Team JUSTyours</p>`;

  let sendmail = await mail(reciever, subject, message);
  if (sendmail) {
    return true;
  }
}

const updateUserStatus = async function (user_id) {
  try {
    let user = await Registration.findOne({ '_id': user_id });
    if (user) {
      await Registration.update({ '_id': user_id }, { $set: { email_verify_status: true } });
      return true;
    }
    else {
      return false;
    }
  } catch (err) {
    console.log(err)
    return false
  }
}

const sendNewPasswordMail = async function (req, otp, user_id) {
  console.log(otp)
  let user = await Registration.findOne({ '_id': user_id });

  console.log(`ForgetPassword OTP generated for ${user.name}`);
  const subject = 'JUSTyours Forget Password'
  const reciever = `${user.email}`
  const message = `
      <h3> Hello ${user.name}, </h3>
      <p>Thank you for using JUSTyours.</p>
      <p>Here is your password please don't share this with anybody</p>
      <p> <h2>${otp}</h2></p>
      <p>You can change password once you login</p>
      <p>Team JUSTyours</p>`;
  let sendmail = await mail(reciever, subject, message);
  if (sendmail) {
    return true;
  }

}

module.exports = {
  addUser,
  checkUserId,
  checkUser,
  checkUserPass,
  checkUserPassID,
  updateUserPassword,
  updateUserPasswordID,
  createCipher,
  createAtTimer,
  updateProfile,
  sendActivationMail,
  updateUserStatus,
  sendNewPasswordMail,
  creaters,
  checkUserByID,
  updateCreater,
  saveKyc,
  getKycBYId,
  getKycBYKycId,
  getKycList,
  getKycDetails
};
