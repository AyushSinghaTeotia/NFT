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
const { balanceMainBNB, coinBalanceBNB, BNBTransfer, CoinTransfer, AdminCoinTransfer } = require('../helper/bscHelper');
const { balanceMainETH, ETHTransfer } = require('../helper/ethHelper');

const { activationTokens } = require('../models/contact');

const signupReward =10;
const referReward = '10';
const coinFees = '1';

const adminAddress = process.env.ADMIN;


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


const wallet=async (req,res)=>{
    
    res.render('users/wallet/',{role:req.session.role});

}


const createWallet=async (req,res)=>{
    let passphrase = "";
    let is_login=req.session.is_user_logged_in;
    let user_id=req.session.re_us_id;

    let loginwallet = await blockchainServices.importWalletFindId(user_id);

    if(is_login){

        let passphraseNew = await blockchainServices.createWallet();
        if (passphraseNew) {
            console.log("system",passphrase)
            passphrase = passphraseNew.privateKey;
        }
        console.log(passphrase);

    res.render('users/wallet/create',{role:req.session.role,passphrase});


    }
    else
    {
        res.redirect('/users/login');
    }

}
const verifyWallet  =async(req,res)=>{
        let user_passphrase = req.body.passphrase;
        let err_msg = req.flash('err_msg');
        let success_msg = req.flash('success_msg');
        let test = req.session.is_user_logged_in;
        if (test != true) {
            res.redirect('/users/login');
        } else {
            res.render('users/wallet/verify-private-key', { err_msg, success_msg, user_passphrase,role: req.session.role });
        }
    }
    


const submitWallet = async (req, res) => {
        let user_id = req.session.re_us_id;
        let user_passphrase = req.body.passphrase.trim();
        let check_passphrase = req.body.check_key.trim();
        let hash = await blockchainServices.createHash(user_passphrase);
        if (user_passphrase == check_passphrase) {
            let created = await userServices.createAtTimer();
            let address = await blockchainServices.checkWalletPrivate(user_passphrase);
            let UserwalletData = await blockchainServices.userWalletEntry(user_id, address, hash, created);
            if (UserwalletData) {
                    let walletData = blockchainServices.userWalletFindWallet(address);
                    let user = await userServices.checkUserId(user_id);
                    var sendReward = parseInt(signupReward);
                    if(user.ref_from){
                        // let hashObject = await AdminCoinTransfer(address, referReward);
                        sendReward = sendReward + parseInt(referReward);
                        // let hash = hashObject.transactionHash;
                        // await blockchainServices.addTransaction(user_id, walletData._id, adminAddress, address, hash, referReward, 'ebt');
                        let userRefer = await userServices.checkUserReferCode(user.ref_from);
                        let subject = 'Referral bonus credited.'
                        let text = 'Hello '+ user.email + ',<br><br>\n\n' +
                         'Congratulations we have credited your $EBT account by 5 $EBT (worth US$5) as your friend signed up using your referral code!<br><br>\n\n' + 
                         'Earn more $EBT by referring your friends and stand a chance to win exclusive $EBT NFTs !!' + '<br><br>\n\n' + 'Regards,<br>\nTeam Abu Bakar<br>\nhttps://ebtico.com';
                        await mail(user.email, subject, text);
                        let userReferred = await userServices.checkUserWallet(userRefer._id);
                        let referAddress = userReferred.wallet_address;
                        let hashObject2 = await AdminCoinTransfer(referAddress, referReward);
                        let hash2 = hashObject2.transactionHash;
                        await blockchainServices.addTransaction(userRefer._id, userReferred._id, adminAddress, referAddress, hash2, referReward, '$EBT');
                        if(hashObject2)
                         {
                            await userServices.refUpdate(user.ref_code, user.ref_from);
                         }
                    }
                    var sendReward=parseInt(sendReward);
                    let finalSend = sendReward.toString();
                    console.log(finalSend);
                    console.log(address);
                    let hashObject3 = await AdminCoinTransfer(address, finalSend);
                    console.log(finalSend,'-------------------finalSend',typeof finalSend);
                    let hash3 = hashObject3.transactionHash;
                    await blockchainServices.addTransaction(user_id, walletData._id, adminAddress, address, hash3, finalSend, '$EBT');
                    let userwallet = await blockchainServices.userWalletFindWallet(address);
                    await blockchainServices.importWalletEntry(user_id, userwallet._id, created);
                    res.redirect('/users/wallet-success?wallet=' + Buffer.from(address).toString('base64'));
                
                }
                else {
                    req.flash('err_msg', 'Something went wrong.');
                    res.redirect('/users/create-wallet');
                }
            // }
            // else {
            //     req.flash('err_msg', 'Something went wrong.');
            //     res.redirect('/Create-wallet-dash');
            // }
        }
        else {
            res.redirect('/verify-key');
        }
    } 

const walletSuccess = async (req, res) => {
        let err_msg = req.flash('err_msg');
        let success_msg = req.flash('success_msg');
        let wallet_address = "";
        let test = req.session.is_user_logged_in;
        if (test != true) {
            res.redirect('/users/login');
        }
        else {
            if (req.query.wallet) {
                wallet_address = Buffer.from(req.query.wallet, 'base64').toString('ascii');
            }
            res.render('users/wallet/wallet-success', { err_msg, success_msg, wallet_address,role: req.session.role });
        }
    }

module.exports = {
    wallet,
    createWallet,
    verifyWallet,
    submitWallet,
    walletSuccess

};
