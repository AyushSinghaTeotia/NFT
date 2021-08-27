const moment = require("moment");
const crypto = require('crypto');
const { hashStatus, createWalletHelper, checkWalletPrivateHelper } = require('../helper/fantomHelper');
const { hashStatusETH } = require('../helper/ethHelper');
const { Registration, Userwallet, Importwallet, Tokensettings, Tokendetails, OrderDetails, RefCode, FAQ, ContactInfo } = require('../models/contact');

const getBalance = async (account) => {
    let balance;
    try {
        balance = await balanceMainBNB(account);
    } catch (error) {
        balance = 0;
    }
    return balance;
};

const getCoinBalance = async (account) => {
    let balance;
    try {
        balance = await coinBalanceBNB(account);
    } catch (error) {
        balance = 0;
    }
    return balance;
};

const createWallet = async () => {
    let newData = await createWalletHelper();
    if(newData){
        return newData;
    }
};

const createHash = async (user_passphrase) => {
    let hash = crypto.createHash('sha256').update(user_passphrase).digest('base64');
    if(hash){
        return hash;
    }
};

const checkWalletPrivate = async (pk) => {
    let newData = await checkWalletPrivateHelper(pk);
    if(newData){
        return newData;
    }
};

const userWalletEntry = async (user_id, address, hash, created) => {
    const UserwalletDataObject = {
        user_id: user_id,
        wallet_address: address,
        passphrase: hash,
        created_at: created,
        status: 'active',
        deleted: '0'
    };
    try {
      const userwallet = new Userwallet(UserwalletDataObject);
      await userwallet.save();
      return UserwalletDataObject;
    } catch (error) {
      console.log("Error", error.message);
    }
};

const userWalletFindWallet = async (address) => {
    let userwallet = await Userwallet.findOne({'wallet_address': address});
    if(userwallet){
        return userwallet;
    }
};

const importWalletEntry = async (user_id, id, created) => {
    const importwalletDataObject = {
        user_id: user_id,
        wallet_id: id,
        login_status: 'login',
        created_at: created,
        status: 'active',
        deleted: '0'
    };
    try {
      const importwallet = new Importwallet(importwalletDataObject);
      await importwallet.save();
      return importwalletDataObject;
    } catch (error) {
      console.log("Error", error.message);
    }
};

module.exports = {
    getBalance,
    getCoinBalance,
    createWallet,
    createHash,
    checkWalletPrivate,
    userWalletEntry,
    userWalletFindWallet,
    importWalletEntry
};
  