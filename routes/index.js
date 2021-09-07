var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index',{ layout: 'layouts/front/layout' });
});

router.get('/explore', function(req, res, next) {
  res.render('explore',{ layout: 'layouts/front/layout' });
});

router.get('/defi', function(req, res, next) {
  res.render('defi',{ layout: 'layouts/front/layout' });
});

router.get('/model', function(req, res, next) {
  res.render('models',{ layout: 'layouts/front/layout' });
});

router.get('/contact', function(req, res, next) {
  res.render('contactus',{ layout: 'layouts/front/layout' });
});


router.get('/nft-detail',function(req,res){
  res.render('nft-detail',{layout:'layouts/front/layout'});

});

module.exports = router;
