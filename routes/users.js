var express = require('express');
const flash = require('express-flash');
var session = require('express-session');
const authenticate = require('../middleware/authenticate');
var router = express.Router();
const userServices = require("../services/userServices");
const userControllers = require('../controllers/userControllers');
const contentCreaterControllers = require('../controllers/contentCreaterControllers')
const dashboardController = require('../controllers/dashboardController');
const paintingController=require('../controllers/paintingController');
const authController = require('../controllers/authController');
const walletController=require('../controllers/walletController');
router.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login',authController.loginPage);
router.get('/signup',authController.signup);
router.post('/submitSignup',authController.submitSignup);
router.post('/login', authController.userLogin);
router.get('/logout',authController.logout);

/* content creater  */
router.post('/contentCreater-login', contentCreaterControllers.login);
//router.post('/contentCreater-signup', contentCreaterControllers.upload, contentCreaterControllers.submitContentCreater);

router.use(authenticate);

router.get('/dashboard',authController.dashboard);
router.get('/creaters',authController.getCreaters);
router.get('/accept',authController.acceptUser);
router.get('/reject',authController.rejectUser);
router.get('/create',dashboardController.createCotent);
router.post('/add-painting',paintingController.upload,paintingController.savePainting);
router.get('/paintings',paintingController.index);
router.post('/preview-content',paintingController.preview);

router.get('/edit-painting',paintingController.editPainting);
router.post('/update-painting',paintingController.upload,paintingController.updatePainting);
router.get('/delete-painting',paintingController.deletePainting);
router.get('/manage-kyc',dashboardController.manageKYC);
router.get('/manage-transactions',dashboardController.manageTransaction);


/*  wallet routes*/
router.get('/wallet',walletController.wallet);
router.get('/create-wallet',walletController.createWallet);
router.post('/verify-wallet',walletController.verifyWallet);
router.post('/submit-wallet',walletController.submitWallet);
router.get('/wallet-success',walletController.walletSuccess);
router.use(flash());

module.exports = router;
