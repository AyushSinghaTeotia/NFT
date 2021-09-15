var express = require('express');
var router = express.Router();
const HomeController=require('../controllers/HomeController');
/* GET home page. */

router.get('/',HomeController.index);

router.get('/explore',HomeController.explore);
router.get('/search',HomeController.exploreContent);
router.get('/defi', function(req, res, next) {
  res.render('defi',{ layout: 'layouts/front/layout',name: req.session.re_usr_name});
});

router.get('/model',HomeController.model);
router.get('/author',HomeController.author);
router.get('/contact', function(req, res, next) {
  res.render('contactus',{ layout: 'layouts/front/layout',name: req.session.re_usr_name });
});
router.get('/subscriptions',function(req,res){
  res.render('subscription',{layout:'layouts/front/layout',name: req.session.re_usr_name});
});

router.get('/subscribed',function(req,res){
   res.render('subscribed',{layout:'layouts/front/layout',name: req.session.re_usr_name});
});

router.get('/buy-plan',function(req,res){
  res.render('buy-plan',{layout:'layouts/front/layout',name: req.session.re_usr_name});
});
router.get('/item-details',HomeController.contentDetail);

module.exports = router;
