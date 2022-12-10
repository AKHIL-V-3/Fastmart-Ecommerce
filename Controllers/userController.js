var express = require('express');
var router = express.Router();
var user = require('../Helpers/User-Helpers')
var admin = require('../Helpers/Admin-helper')
var config = require('../Config/otp')

const { Db } = require('mongodb');
const { response } = require('express');

const client = require('twilio')(config.accountSID, config.authToken)

/* GET home page. */

verifyLogin = function (req, res, next) {
  if (!req.session.loggedIn) {
    res.redirect('/login')
  } else {
    next()
  }
}



module.exports = {

  home: async (req, res, next) => {
    let cartCount = 0
    if (req.session.user) {
      cartCount = await user.getCartCount(req.session.user._id)
      console.log(cartCount);
    }

    let listCount = 0
    if (req.session.user) {
      listCount = await user.getWhisListCount(req.session.user._id)
      console.log(listCount);
    }

    let cartItems = null
    if (req.session.user) {
      cartItems = await user.getCartProducts(req.session.user._id)
    }

    let whishlist = null
    if (req.session.user) {
      whishlist = await user.getwhishlistproducts(req.session.user._id)
    }

let productimages= await admin.getProductimages()


    let Banners= await admin.getBanners()



    admin.getProducts().then((product) => {
      admin.getCategory().then(async (category) => {

       
        let user = req.session.user

       product.forEach((i)=>{
        if(i.stocks===0){
              i.stockErr=true
         }else{
          i.stockErr=false
         }
       })


       product.forEach((i)=>{
         if(i.Offerpercentage !== 0 && i.Offerpercentage > i.categoryOfferpercentage){
             i.offerErr=true
             i.categoryoffer=false
         }else if(i.Offerpercentage !== 0 && i.Offerpercentage < i.categoryOfferpercentage){
            i.categoryoffer=true
            i.offerErr=false
         }else{
          i.offerErr=false
          i.categoryoffer=false
         }
       })

       

        res.render('User/userHome', { user, category, product, cartCount, cartItems, listCount, whishlist, productimages, Banners });
      })
    })
  },

  login: (req, res) => {

    res.render('User/user-login', { "userloginErr": req.session.userloginErr, "blockErr": req.session.blockErr })
    req.session.userloginErr = false
    req.session.blockErr = false
  },

  signup: (req, res) => {
    let emailexist = req.session.emailexist
    res.render('User/user-signup', { "emailOrphoneErr": req.session.emailOrphoneErr })
    req.session.emailexist = false
  },

  shop: async (req, res) => {

      

    let users
    if(req.session.user){
       
       users=req.session.user
    }
   
    let whishlist = null
    if (req.session.user) {
      whishlist = await user.getwhishlistproducts(req.session.user._id)
    }


    let cartItems = null
    if (req.session.user) {
      cartItems = await user.getCartProducts(req.session.user._id)
    }

    let cartCount = null
    if (req.session.user) {
      cartCount = await user.getCartCount(req.session.user._id)
      console.log(cartCount);
    }else{
      cartCount=0
    }

    let listCount = null
    if (req.session.user) {
      listCount = await user.getWhisListCount(req.session.user._id)
      console.log(listCount);
    }else{
      listCount=0
    }



    admin.getProducts().then((product) => {

      admin.getCategory().then((category)=>{


        product.forEach((i)=>{
          if(i.stocks===0){
                i.stockErr=true
           }else{
            i.stockErr=false
           }
         })
  
  
         product.forEach((i)=>{
           if(i.Offerpercentage !== 0 && i.Offerpercentage > i.categoryOfferpercentage){
               i.offerErr=true
               i.categoryoffer=false
           }else if(i.Offerpercentage !== 0 && i.Offerpercentage < i.categoryOfferpercentage){
              i.categoryoffer=true
              i.offerErr=false
           }else{
            i.offerErr=false
            i.categoryoffer=false
           }
         })

        res.render('User/products', { product, users, cartItems, whishlist, listCount , cartCount,category})

      })

      
    })
  },

  productDetails: async (req, res) => {
    let cartItems = null
    if (req.session.user) {
      cartItems = await user.getCartProducts(req.session.user._id)
    }

    let cartCount = null
    if (req.session.user) {
      cartCount = await user.getCartCount(req.session.user._id)
      console.log(cartCount);
    }else{
      cartCount=0
    }

    let listCount = null
    if (req.session.user) {
      listCount = await user.getWhisListCount(req.session.user._id)
      console.log(listCount);
    }else{
      listCount=0
    }

    let whishlist = null
    if (req.session.user) {
      whishlist = await user.getwhishlistproducts(req.session.user._id)
    }

    
    admin.getProductdetails(req.params.id).then((productdetail) => {
      req.session.paramsId = req.params.id


      if(productdetail.Offerpercentage!==0){
        productdetail.offerErr=true
      }else{
        productdetail.offerErr=false
      }

      admin.getlimitedProducts().then((products) => {


        products.forEach((i)=>{
          if(i.stocks===0){
                i.stockErr=true
           }else{
            i.stockErr=false
           }
         })
    
    
         products.forEach((i)=>{
           if(i.Offerpercentage !== 0 && i.Offerpercentage > i.categoryOfferpercentage){
               i.offerErr=true
               i.categoryoffer=false
           }else if(i.Offerpercentage !== 0 && i.Offerpercentage < i.categoryOfferpercentage){
              i.categoryoffer=true
              i.offerErr=false
           }else{
            i.offerErr=false
            i.categoryoffer=false
           }
         })


         console.log(productdetail);
         console.log('))))))))))))))))))))))))))');


        if(productdetail.stocks === 0){

          productdetail.outofstock=true
        }else{
          productdetail.outofstock=false
        }

        console.log(productdetail);



        res.render('User/product-details', { products, productdetail, user: req.session.user, cartCount ,whishlist ,listCount, cartItems })
      })
    })
  },

  logout: (req, res) => {
    req.session.user = null
    req.session.loggedIn = false
    res.clearCookie('user')
    res.clearCookie('loggedIn')
    res.redirect('/')
  },

  otplogin: (req, res) => {
    res.render('User/Otpmobile', { "phoneErr": req.session.phoneErr, "otpblockErr": req.session.otpblockErr })
    req.session.phoneErr = false
    req.session.otpblockErr = false
  },

  otpverify: (req, res) => {
    res.render('User/userOtpverify')
  },

  shopingCart: async (req, res) => {
    let coupondiscount = req.session.discountprice

     let  cartItems = await user.getCartProducts(req.session.user._id)

     console.log(cartItems);
     console.log('0000000000000000000000000000000');

       if(cartItems.length === 0){
        cartItems=null
       }
    
   
    let totalValue = await user.getTotalAmount(req.session.user._id, coupondiscount)
    let cartCount = await user.getCartCount(req.session.user._id)
    let listCount = null
    if (req.session.user) {
      listCount = await user.getWhisListCount(req.session.user._id)
      console.log(listCount);
    }else{
      listCount=0
    }

    res.render('User/shoping-cart', { cartItems, user: req.session.user, totalValue, cartCount ,listCount })
  },

  addToCart: async (req, res) => {
    req.session.proId=req.params.id
    proId=req.params.id

    let productqnt=0
   
    if(req.session.user){

       productqnt=await user.getCartProductQuantity(req.session.user._id,proId)

    }
   
   const product =await admin.getOneProduct(proId)
   console.log(productqnt);
   let quantity=null
   if(productqnt==undefined){
        quantity=0
   }else{
      quantity=productqnt.quantity
   }
     

   let totalValue=0
  
     if(product.stocks === 0 || quantity === product.stocks){
      res.json({stock:true})
     }else{

      if(req.session.user){
         totalValue = await user.getTotalAmount(req.session.user._id)

      }

      

    if(req.session.user){

      user.addToCart(req.params.id, req.session.user._id, totalValue)
    res.json({ status: true })

    }else{
      req.session.redirect=proId
      res.json({redirect:true})
    }

     }


  },

  addTowhishList: (req, res) => {
    user.addToWhishList(req.params.id, req.session.user._id)
    res.json({ status: true })
  },


  checkout: async (req, res) => {
    let coupondiscount = req.session.discountprice

    let cartItems = null
    if (req.session.user) {
      cartItems = await user.getCartProducts(req.session.user._id)
    }

    let cartCount = null
    if (req.session.user) {
      cartCount = await user.getCartCount(req.session.user._id)
      console.log(cartCount);
    }else{
      cartCount=0
    }

    let listCount = null
    if (req.session.user) {
      listCount = await user.getWhisListCount(req.session.user._id)
      console.log(listCount);
    }else{
      listCount=0
    }

    let total = await user.getTotalAmount(req.session.user._id, coupondiscount)
    let address = await user.getUserAddress(req.session.user._id)
    res.render('User/user-checkout', { total, user: req.session.user, address ,cartCount,cartItems,listCount })
  },

  orderList: async (req, res) => {
    let Order = await user.getOrders(req.session.user._id)


    const Orders = Order.filter((i, index) => {
      i.index = index + 1
      return i
  })


    let cartItems = null
    if (req.session.user) {
      cartItems = await user.getCartProducts(req.session.user._id)
    }

    let cartCount = null
    if (req.session.user) {
      cartCount = await user.getCartCount(req.session.user._id)
      console.log(cartCount);
    }else{
      cartCount=0
    }

    let listCount = null
    if (req.session.user) {
      listCount = await user.getWhisListCount(req.session.user._id)
      console.log(listCount);
    }else{
      listCount=0
    }


    let Products=await user.getOrderProducts(req.session.orderId)

    console.log(Products);

    Orders.forEach(element => {
      element.date=element.date.toString().split(' ').splice(0, 4).join(' ')       
    });


    Orders.forEach(element => {
      console.log(element.products); 

      console.log('============================');
    });


   

   
    let users = req.session.user
    res.render('User/orderlist', { Orders, users,Products ,cartCount, cartItems, listCount })
  },

  viewOrderProduct: async (req, res) => {
    req.session.OrderId=req.params.id

    let cartItems = null
    if (req.session.user) {
      cartItems = await user.getCartProducts(req.session.user._id)
    }

    let cartCount = null
    if (req.session.user) {
      cartCount = await user.getCartCount(req.session.user._id)
      console.log(cartCount);
    }else{
      cartCount=0
    }

    let listCount = null
    if (req.session.user) {
      listCount = await user.getWhisListCount(req.session.user._id)
      console.log(listCount);
    }else{
      listCount=0
    }


    let products = await user.getOrderProducts(req.params.id)


    products.forEach((i)=>{
      if(i.Status ==='Delivered'){
           
          i.button=false
      }else{
          i.button=true
      }
 })

 products.forEach((i)=>{
  if(i.Status ==='Return Pending' ||i.Status === "Returned"){
       
      i.returnpending=false
  }else{
      i.returnpending=true
  }
})


    res.render('User/view-order-product', { user: req.session.user, products ,cartCount,cartItems,listCount })
  },

  cancelOrder: (req, res) => {
    user.cancelOrder(req.params.id).then((response) => {
      res.redirect('/orderlist')
    })
  },

  orderSuccess: (req, res) => {
    res.render('User/Orderplaced')
  },

  PayPalSuccess: (req, res) => {
    let orderId = req.params.id
    user.changePaymentStatus(orderId)
    res.render('User/Paypalsuccess')
  },

  PayPalCancel: (req, res) => {
    res.render('User/Paypalfailed')
  },



  cancelProducts: (req, res) => {
    let OrderId = req.params.OrderId
    let proId = req.params.proId
    user.cancleProduct(OrderId, proId).then((product) => {

      let userId=req.session.user._id

      user.updateWallet(product,userId).then((response)=>{

        
        res.redirect("/view-order-product/" + OrderId)

      })
      
    })
  },

  userProfile: async (req, res) => {
    const userdetails = await user.findUser(req.session.user._id)
    const userAddress = await user.getUserAddress(req.session.user._id)

    let cartItems = null
    if (req.session.user) {
      cartItems = await user.getCartProducts(req.session.user._id)
    }

    let cartCount = null
    if (req.session.user) {
      cartCount = await user.getCartCount(req.session.user._id)
      console.log(cartCount);
    }else{
      cartCount=0
    }

    let listCount = null
    if (req.session.user) {
      listCount = await user.getWhisListCount(req.session.user._id)
      console.log(listCount);
    }else{
      listCount=0
    }

    res.render('User/userProfile', { userdetails, userAddress ,cartCount, listCount })
  },

  whishList: async (req, res) => {

    let cartItems = null
    if (req.session.user) {
      cartItems = await user.getCartProducts(req.session.user._id)
    }

    let cartCount = null
    if (req.session.user) {
      cartCount = await user.getCartCount(req.session.user._id)
      console.log(cartCount);
    }else{
      cartCount=0
    }

    let listCount = null
    if (req.session.user) {
      listCount = await user.getWhisListCount(req.session.user._id)
      console.log(listCount);
    }else{
      listCount=0
    }

    const whishlist = await user.getwhishlistproducts(req.session.user._id)


    res.render('User/whishlist', { whishlist, cartCount, listCount,cartItems })
  },

  removeWhishlistProduct: (req, res) => {
    user.removeWhishListProduct(req.session.user._id, req.params.id).then((response) => {
      res.redirect('/whishlist')
    })
  },

  returnTologin:(req,res)=>{
       req.session.productdetailId= req.params.proId
       res.redirect('/login')
  },

searchproducts:async(req,res)=>{

     let input= req.params.input 


     let users
     if(req.session.user){
        
        users=req.session.user
     }
    
     let whishlist = null
     if (req.session.user) {
       whishlist = await user.getwhishlistproducts(req.session.user._id)
     }
 
 
     let cartItems = null
     if (req.session.user) {
       cartItems = await user.getCartProducts(req.session.user._id)
     }
 
     let cartCount = null
     if (req.session.user) {
       cartCount = await user.getCartCount(req.session.user._id)
       console.log(cartCount);
     }else{
       cartCount=0
     }
 
     let listCount = null
     if (req.session.user) {
       listCount = await user.getWhisListCount(req.session.user._id)
       console.log(listCount);
     }else{
       listCount=0
     }


    user.searchProducts(input).then((product)=>{


      product.forEach((i)=>{
        if(i.stocks===0){
              i.stockErr=true
         }else{
          i.stockErr=false
         }
       })


       product.forEach((i)=>{
         if(i.Offerpercentage !== 0 && i.Offerpercentage > i.categoryOfferpercentage){
             i.offerErr=true
             i.categoryoffer=false
         }else if(i.Offerpercentage !== 0 && i.Offerpercentage < i.categoryOfferpercentage){
            i.categoryoffer=true
            i.offerErr=false
         }else{
          i.offerErr=false
          i.categoryoffer=false
         }
       })

     

        res.render('User/searchproducts',{product ,listCount,cartCount,cartItems,users})
      
    })

      
  },

  Categoryproducts:async (req,res)=>{

     const category = req.params.category

     let users
     if(req.session.user){
        
        users=req.session.user
     }
    
     let whishlist = null
     if (req.session.user) {
       whishlist = await user.getwhishlistproducts(req.session.user._id)
     }
 
 
     let cartItems = null
     if (req.session.user) {
       cartItems = await user.getCartProducts(req.session.user._id)
     }
 
     let cartCount = null
     if (req.session.user) {
       cartCount = await user.getCartCount(req.session.user._id)
       console.log(cartCount);
     }else{
       cartCount=0
     }
 
     let listCount = null
     if (req.session.user) {
       listCount = await user.getWhisListCount(req.session.user._id)
       console.log(listCount);
     }else{
       listCount=0
     }


     user.getCategoryproduct(category).then((CategoryProducts)=>{


      CategoryProducts.forEach((i)=>{
        if(i.stocks===0){
              i.stockErr=true
         }else{
          i.stockErr=false
         }
       })


       CategoryProducts.forEach((i)=>{
         if(i.Offerpercentage !== 0 && i.Offerpercentage > i.categoryOfferpercentage){
             i.offerErr=true
             i.categoryoffer=false
         }else if(i.Offerpercentage !== 0 && i.Offerpercentage < i.categoryOfferpercentage){
            i.categoryoffer=true
            i.offerErr=false
         }else{
          i.offerErr=false
          i.categoryoffer=false
         }
       })

       res.render('User/categoryproducts',{CategoryProducts,users,listCount,cartCount,cartItems,whishlist,category})

      })



      
  },

  //--------------------------------------------------------------------------------//
  //--------------------------------------------------------------------------------//
  //--------------------------------------------------------------------------------//
  //--------------------------POST---POST---POST------------------------------------//


  signupPost: (req, res) => {
    user.doSignUp(req.body).then((response) => {
      if (response.status) {
        res.redirect('/signup')
        req.sesssion.emailOrphoneErr = true
      } else {
        req.session.user = req.body
        req.session.loggedIn = true
        res.redirect('/')
      }
    })
  },

  loginPost: (req, res) => {

    let proId=req.session.productdetailId

    user.doLogin(req.body).then((response) => {
      if (response.status) {


        if(req.session.redirect){

          let proId=req.session.redirect

          req.session.user = response.user
          req.session.loggedIn = true
          res.redirect('/productdetails/'+ proId)
          req.session.redirect=null

        }else{

          req.session.user = response.user
          req.session.loggedIn = true
          res.redirect('/')

        }
        
      
      }
      if (response.statuss) {
        req.session.blockErr = true
        res.redirect('/login')
      } else {
        req.session.userloginErr = true
        res.redirect('/login')
      }

     
    })
  },

  otploginPost: (req, res) => {
    user.checkMobilenumber(req.body.phone).then((response)=>{
      if (response.status) {
        req.session.phone = response.phone
        req.session.userwithphone = response
        console.log('otp send successfully');
        client
          .verify
          .services(config.serviceID)
          .verifications
          .create({
            to: `+91${response.phone}`,
            channel: "sms"
          }).then((data) => {
            res.redirect('/verify')
          })
      } else if (response.statuss) {
        req.session.phoneErr = true
        res.redirect('/otplogin')
      } else if (!response.status) {
        req.session.otpblockErr = true
        res.redirect('/otplogin')
      }
    })
  },

  otpverifyPost: (req, res) => {
    let phone = req.session.phone
    const otp = req.body.otp
    client
      .verify
      .services(config.serviceID)
      .verificationChecks
      .create({
        to: `+91${phone}`,
        code: otp
      }).then((response) => {
        console.log("otp:", response);
        if (response.valid) {
          req.session.loggedIn = true
          let userwithphone = req.session.userwithphone
          req.session.user = userwithphone
          res.redirect('/')
          console.log("otp verification completed");
        } else {
          res.redirect('/otplogin')
        }
      })
  },

  changeProductQuantityPost: (req, res, next) => {
    console.log(req.body);
    user.changeProductQuantity(req.body).then(async (response) => {
      response.total = await user.getTotalAmount(req.body.user)
      res.json(response)
    })
  },

  checkoutPost: async (req, res) => {
    let discountprice = req.session.discountprice
    let products = await user.getCartProductList(req.session.user._id)
    let totalAmount = await user.getTotalAmount(req.body.userId, discountprice)
    req.session.discountprice = null

    user.placeOrder(req.body, products, totalAmount).then((orderId) => {
      if (req.body['paymentmethod'] == 'COD') {
        res.json({ success: true })
      } else if (req.body['paymentmethod'] == 'RazorPay') {
        user.generateRazorpay(orderId, totalAmount).then((response) => {
          console.log(response);
          console.log('response gene above');
          res.json(response)
        })
      } else {
        user.generatePayPal(orderId, totalAmount).then((response) => {
          res.json(response)

        })
      }
    })

  },

  verifyRzrpayPaymentPost: (req, res) => {
    console.log(req.body);
    console.log('response body above');

    user.verifyPayment(req.body).then(() => {
      user.changePaymentStatus(req.body['order[receipt]']).then((response) => {
        res.json({ status: true })
      })
    }).catch((err) => {
      console.log('error above');
      res.json({ status: false })
    })
  },

  editUser: (req, res) => {

    user.editUserData(req.body, req.session.user._id).then((response) => {
      if (response.status) {
        res.json({ status: true })
      } else {
        res.json({ status: false })
      }
    })

  },

  applyCoupon: async (req, res) => {

    let userId = req.session.user._id
    let cartTotal = await user.getTotalAmount(userId)

    user.applyCoupons(req.body, cartTotal, userId).then((response) => {

      if (response.status) {
        req.session.discountprice = response.discountprice
        res.json(response)

      } else {
        res.json(response)
      }


    })
  },

  searchProductspost:(req,res)=>{

    console.log(req.body);

    let input =req.body.Input

    user.searchProducts(input).then((product)=>{

        res.json({status:true})

    })

     

  },

  returnproduct:(req,res)=>{

    user.returnProduct(req.body).then(()=>{

      let orderId =req.body.orderId
         

      res.redirect('/view-order-product/'+ orderId)
           
    })
      

      
  }


}
