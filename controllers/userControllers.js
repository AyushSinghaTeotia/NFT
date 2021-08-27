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

const sessionHeader = async (req, res, next) => {
    res.locals.session = req.session;
    let user_id = res.locals.session.re_us_id;
    let result = userServices.checkUserId(user_id);
    if (result) {
        res.locals.greet = function () {
            return result;
        }
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        next();
    }
    else {
        return null;
    }
}

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

const submitUser = async (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let country = req.body.country;
    let username = req.body.username;
    if(req.file){
        let fileName= req.file.filename;
        if(fileName && name && email && password && country && username){
            let user = await userServices.checkUser(req.body.email);
            if (user) {
                let wallet = { success: 0, msg: "Email already exists." };
                let wallet_details = JSON.stringify(wallet);
                res.send(wallet_details);
            }
            else {
                let mystr = await userServices.createCipher(req.body.password);
                let created = await userServices.createAtTimer();
                let newuser = await userServices.addUser(req.body, mystr, created, fileName);
                let user = await userServices.checkUser(req.body.email);
                let activationmail = await userServices.sendActivationMail(user, req)
                let wallet = { success: 1, msg: "Email registered, please check your inbox for activation mail." };
                let wallet_details = JSON.stringify(wallet);
                res.send(wallet_details);
            }
        }
        else{
            let wallet = { success: 0, msg: "Name, Email, Password, Country, Username and Profile Image are mandatory fields." };
            let wallet_details = JSON.stringify(wallet);
            res.send(wallet_details);
        }
    }
    else{
        let wallet = { success: 0, msg: "Profile Image not found." };
        let wallet_details = JSON.stringify(wallet);
        res.send(wallet_details);
    }
}

const userLogin = async (req, res) => {
    //console.log(req.body)
    let user = await userServices.checkUser(req.body.email);
    let password = req.body.password.trim();
    let mystr = await userServices.createCipher(password);
    if (user) {
        if (user.email_verify_status != true) {
            let wallet = { success: 0, msg: "Account not activated please activate account before login" };
            let wallet_details = JSON.stringify(wallet);
            return res.send(wallet_details);
        }
        userObject = {
            name: user.name,
            email: user.email,
            created_at: user.created_at,
            email_verify_status: user.email_verify_status,
            mobile_no: user.mobile_no,
            address: user.address,
            user_address: user.user_address,
            country: user.country,
            state: user.state,
            city: user.city,
            status: user.status,
        }
        let userLogin = await userServices.checkUserPass(req.body.email.trim(), mystr);
        if (userLogin) {
            const _token = jwt.sign({
                success: true,
                re_us_id: userLogin._id,
                re_usr_name: userLogin.name,
                re_usr_email: userLogin.email,
                is_user_logged_in: true
            }, JWT_SECRET_KEY, { expiresIn: '1h' });
            let wallet = { success: 1, msg: "Login successful.", token: _token, user: userObject };
            let wallet_details = JSON.stringify(wallet);
            res.send(wallet_details);
        }
        else {
            let wallet = { success: 0, msg: "Incorrect credentials." };
            let wallet_details = JSON.stringify(wallet);
            res.send(wallet_details);
        }
    }
    else {
        let wallet = { success: 0, msg: "Email address does not exist." };
        let wallet_details = JSON.stringify(wallet);
        res.send(wallet_details);
    }
}

const submitChange = async (req, res) => {
    const { re_us_id } = req.payload;
    const user_id = re_us_id;
    const old_pass = req.body.password;
    const new_pass = req.body.new_password;
    let user = await userServices.checkUserId(user_id);
    if (!user) {
        let wallet = { success: 0, msg: "Email address does not exist." };
        let wallet_details = JSON.stringify(wallet);
        res.send(wallet_details);
    }
    else {
        let mystr = await userServices.createCipher(old_pass);
        let user = await userServices.checkUserPassID(re_us_id, mystr);
        if (user) {
            let mystr2 = await userServices.createCipher(new_pass);
            if (mystr != mystr2) {
                let userUpdated = await userServices.updateUserPasswordID(user_id, mystr2);
                if (userUpdated) {
                    let wallet = { success: 1, msg: "Password updated successfully.", password: new_pass };
                    let wallet_details = JSON.stringify(wallet);
                    res.send(wallet_details);
                }
                else {
                    let wallet = { success: 0, msg: "An error occured." };
                    let wallet_details = JSON.stringify(wallet);
                    res.send(wallet_details);
                }
            }
            else {
                let wallet = { success: 0, msg: "New password cannot be same as previous password." };
                let wallet_details = JSON.stringify(wallet);
                res.send(wallet_details);
            }
        }
        else {
            let wallet = { success: 0, msg: "Incorrect Password." };
            let wallet_details = JSON.stringify(wallet);
            res.send(wallet_details);
        }
    }
}

const updateProfile = async (req, res) => {
    const { is_user_logged_in, re_us_id } = req.payload;
    if (is_user_logged_in) {
        let updated_at = await userServices.createAtTimer();
        let updateUser = await userServices.updateProfile(req.body, updated_at, re_us_id)
        if (updateUser) {
            console.log('updateUser...', updateUser)
            let wallet = { success: 1, msg: "User updated successfully.", user: updateUser };
            let wallet_details = JSON.stringify(wallet);
            res.send(wallet_details);
        }
        else {
            let wallet = { success: 0, msg: "Something went wrong." };
            let wallet_details = JSON.stringify(wallet);
            res.send(wallet_details);
        }
    }
    else {
        let wallet = { success: 0, msg: "Invalid Token." };
        let wallet_details = JSON.stringify(wallet);
        res.send(wallet_details);
    }
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
    sessionHeader,
    upload,
    submitUser,
    userLogin,
    submitChange,
    updateProfile,
    activateAccount,
    activateUser,
    forgetPassword
};
