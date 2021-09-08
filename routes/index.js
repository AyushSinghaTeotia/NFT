var express = require('express');
var router = express.Router();
const HomeController=require('../controllers/HomeController');
/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index',{ layout: 'layouts/front/layout' });
});

router.get('/explore',HomeController.explore);
router.get('/search',HomeController.exploreContent);
router.get('/defi', function(req, res, next) {
  res.render('defi',{ layout: 'layouts/front/layout' });
});

router.get('/model',HomeController.model);

router.get('/contact', function(req, res, next) {
  res.render('contactus',{ layout: 'layouts/front/layout' });
});
router.get('/subscriptions',function(req,res){
  res.render('subscription',{layout:'layouts/front/layout'});
});

router.get('/buy-plan',function(req,res){
  res.render('buy-plan',{layout:'layouts/front/layout'});
});
router.get('/item-details',HomeController.contentDetail);

module.exports = router;
