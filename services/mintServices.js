const { hashSync } = require("bcryptjs");
const moment = require("moment");
const crypto = require('crypto');
const { generateCode, generateActivationToken } = require('../helper/userHelper');
const { Registration, Userwallet, Importwallet, Tokensettings, Tokendetails, OrderDetails, RefCode, FAQ, ContactInfo, activationTokens } = require('../models/contact');
const {  UserInfo } = require('../models/userModel');
const { OrderInfo } =require('../models/orderModel');
const { mail } = require('../helper/mailer');
const API_URL = process.env.API_URL;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(API_URL);

const abi = require("../artifacts/contracts/MyNFT.json");
const contractAddress = "0x261F36d7429AA66336D7532C23484998251a856e";
const nftContract = new web3.eth.Contract(abi, contractAddress);


 const mintNFT=async(copy_for_sale,tokenUrl,title,basic_price) =>{
    const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, 'latest'); //get latest nonce
    //the transaction
    console.log(copy_for_sale);
    console.log(basic_price);
    let for_sale=BigInt(copy_for_sale);
    let price=BigInt(basic_price);

    var tx="";
    try
     {
       tx = {
        'from': PUBLIC_KEY,
        'to': contractAddress,
        'nonce': nonce,
        'gas': 500000,
        'maxPriorityFeePerGas': 1999999987,
        'data': nftContract.methods.mintNFT(for_sale,tokenUrl,title,price).encodeABI()
      };
       
     }catch(err){
      console.log(err);
    }
   
  
    const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
    signPromise.then((signedTx) => {
  
      web3.eth.sendSignedTransaction(signedTx.rawTransaction, function(err, hash) {
        if (!err) {
          console.log("The hash of your transaction is: ", hash, "\nCheck Alchemy's Mempool to view the status of your transaction!"); 
        } else {
          console.log("Something went wrong when submitting your transaction:", err)
        }
      });
    }).catch((err) => {
      console.log("Promise failed:", err);
    });
  }



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





module.exports = {
    mintNFT,
};
