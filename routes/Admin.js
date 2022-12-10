var express = require('express');
var router = express.Router();
const { upload, upload2 } = require('../public/js/multer');
const adminController=require('../Controllers/admincontroller')



/* GET users listing. */


verifyadminLogIn = function (req, res, next) {
  if (!req.session.adminloggedIn) {
    res.redirect('/admin/adminLogin')
  } else {
    next()
  }
}


router.get('/', verifyadminLogIn,adminController.adminHome)
router.get('/adminLogin',adminController.adminLogin)
router.get('/logout',adminController.adminLogout)
router.get('/customers',verifyadminLogIn,adminController.customerList)
router.get('/products', verifyadminLogIn,adminController.productList)
router.get('/category', verifyadminLogIn,adminController.categoryList)
router.get('/addproduct', verifyadminLogIn,adminController.addProducts)
router.get('/editproduct/:id', verifyadminLogIn,adminController.editProducts)
router.get('/deleteproduct/:id', verifyadminLogIn,adminController.deleteProducts)
router.get('/addcategory', verifyadminLogIn,adminController.addCategory)
router.get('/deletecategory/:id', verifyadminLogIn,adminController.deleteCategory)
router.get('/blockuseractive/:id', verifyadminLogIn,adminController.blockAndUnblockUser)
router.get('/userorderlist', verifyadminLogIn,adminController.Orderlist)
router.get("/view-products/:id", verifyadminLogIn,adminController.viewOrderedProducts)
router.get('/cancelProduct/:orderId/:proId', verifyadminLogIn,adminController.cancelOrderedProducts)
router.get('/shipProduct/:orderId/:proId', verifyadminLogIn,adminController.shipProducts)
router.get('/packProduct/:orderId/:proId', verifyadminLogIn,adminController.packProducts)
router.get('/deliverProduct/:orderId/:proId', verifyadminLogIn,adminController.deliverProducts)
router.get("/salesreport", verifyadminLogIn,adminController.salesReport)
router.get('/coupon',verifyadminLogIn,adminController.couponList)
router.get('/addcoupon',verifyadminLogIn,adminController.addcoupon)
router.get('/offer',verifyadminLogIn,adminController.Offer)
router.get('/offercategory',verifyadminLogIn,adminController.categoryoffer)
router.get('/returnaccept/:orderId/:proId',adminController.returnAccept)
router.get('/returndecline/:orderId/:proId',adminController.returnDecline)
router.get('/banner',verifyadminLogIn,adminController.Banner)




router.get("/test",(req,res)=>{
   res.render('Admin/AddProducts')
})




router.post('/login',adminController.adminLoginPost)
router.post('/addproduct', upload.array('image'),adminController.addProductsPost)
router.post('/editproduct/:id', upload.array('image'), verifyadminLogIn,adminController.editProductsPost)
router.post('/addcategory', verifyadminLogIn,adminController.addCategoryPost)
router.post('/addcoupon',verifyadminLogIn,adminController.addcouponPost)
router.post('/productoffer',verifyadminLogIn,adminController.productofferPost)
router.post('/offercategory',verifyadminLogIn,adminController.categoryofferpost)
router.post('/salesreport',adminController.salesReportPost)
router.post('/editfirstbanner/:id',upload2.any('bannerImage1'),adminController.editFirstbanner)
router.post('/editsecondbanner/:id',upload2.any('bannerImage2'),adminController.editSecondbanner)
router.post('/editlastbanner/:id',upload2.any('bannerImage3'),adminController.editLastbanner)






module.exports = router;
