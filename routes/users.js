var express = require('express');
const flash = require('express-flash');
const authenticate = require('../middleware/authenticate');
var router = express.Router();
const userServices = require("../services/userServices");
const userControllers = require('../controllers/userControllers');
const contentCreaterControllers = require('../controllers/contentCreaterControllers')
const dashboardController = require('../controllers/dashboardController');

const authController = require('../controllers/authController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login',authController.loginPage);
router.get('/signup',authController.signup);
router.post('/submitSignup',authController.submitSignup);
router.post('/submitLogin', authController.userLogin);
router.get('/logout',authController.logout);

/* content creater  */
router.post('/contentCreater-login', contentCreaterControllers.login);
//router.post('/contentCreater-signup', contentCreaterControllers.upload, contentCreaterControllers.submitContentCreater);

router.use(authenticate);

router.get('/dashboard',dashboardController.dashboard);

router.use(flash());

module.exports = router;
