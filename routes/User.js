var express = require('express');
var router = express.Router();
const userControllers=require('../Controllers/userController');





/* GET home page. */

 verifyLogin=function(req,res,next){
     if(!req.session.loggedIn){
        res.redirect('/login')
     }else{
      next()
     }
}


router.get('/',userControllers.home)
router.get('/login',userControllers.login)
router.get('/signup',userControllers.signup)
router.get('/shop',userControllers.shop)
router.get('/productdetails/:id',userControllers.productDetails)
router.get('/logout',userControllers.logout)
router.get('/otplogin',userControllers.otplogin)
router.get('/verify',userControllers.otpverify)
router.get('/shopingcart',verifyLogin,userControllers.shopingCart)
router.get('/addtocart/:id',userControllers.addToCart)
router.get('/checkout',verifyLogin,userControllers.checkout)
router.get('/orderlist',verifyLogin,userControllers.orderList)
router.get('/view-order-product/:id',userControllers.viewOrderProduct)
router.get("/cancel-order/:id",verifyLogin,userControllers.cancelOrder)
router.get('/ordersuccess',userControllers.orderSuccess)
router.get('/success/:id',userControllers.PayPalSuccess)
router.get('/cancel',userControllers.PayPalCancel)
router.get('/cancelproduct/:OrderId/:proId',verifyLogin,userControllers.cancelProducts)
router.get('/userprofile',verifyLogin,userControllers.userProfile)
router.get('/whishlist',verifyLogin,userControllers.whishList)
router.get('/addtowhishlist/:id',verifyLogin,userControllers.addTowhishList)
router.get('/removewhishlistproduct/:id',verifyLogin,userControllers.removeWhishlistProduct)
router.get('/returnlogin/:proId',userControllers.returnTologin)
router.get('/search/:input',userControllers.searchproducts)
router.get('/categoryproducts/:category',userControllers.Categoryproducts)
 




router.post('/signup',userControllers.signupPost)
router.post('/login',userControllers.loginPost)
router.post('/otplogin',userControllers.otploginPost)
router.post('/verify',userControllers.otpverifyPost)
router.post('/change-product-quantity',verifyLogin,userControllers.changeProductQuantityPost)
router.post('/checkout',verifyLogin, userControllers.checkoutPost)
router.post('/verify-payment',userControllers.verifyRzrpayPaymentPost)
router.post('/edituser',userControllers.editUser)
router.post('/applycoupon',verifyLogin,userControllers.applyCoupon)
 router.post('/search',userControllers.searchProductspost)
 router.post('/returnform',userControllers.returnproduct)



module.exports = router;
