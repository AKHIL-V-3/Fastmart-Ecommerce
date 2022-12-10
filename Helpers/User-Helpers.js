var db = require('../Config/Connection')
var Promise = require('promise')
var bcrypt = require('bcrypt')
var collection = require('../Config/Collection')
const { reject, resolve } = require('promise')
const { response } = require('express')
var ObjectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const paypal = require('paypal-node-sdk');
var { Convert } = require("easy-currencies");
const router = require('../routes/User')
const { on } = require('events')
const { cancelProducts } = require('../Controllers/userController')

var instance = new Razorpay({
   key_id: process.env.RAZORPAY_KEYID,
   key_secret: process.env.RAZORPAY_KEYSECRET
});

paypal.configure({
   mode: 'sandbox', //sandbox or live
   client_id: process.env.PAYPAL_CLIENTID,
   client_secret: process.env.PAYPAL_SECRET
});

module.exports = {

   doSignUp: (userData) => {
      userData.status = true
      userData.Wallet=0
      return new Promise(async (resolve, reject) => {
         let response = {}
         userData.password = await bcrypt.hash(userData.password, 10)
         let Email = await db.get().collection(collection.User_Collection).findOne({ email: userData.email })
         let phone = await db.get().collection(collection.User_Collection).findOne({ phone: userData.phone })
         if (Email || phone) {
            response.status = true
            resolve(response)
         } else {
            db.get().collection(collection.User_Collection).insertOne(userData).then((data) => {

               response.user = data
               response.status = false
               resolve(response)
            })
         }

      })
   },

   doLogin: (userData) => {
      let response = {}
      let userblocked = {}
      return new Promise(async (resolve, reject) => {
         let user = await db.get().collection(collection.User_Collection).findOne({ email: userData.email })

         if (user) {
            bcrypt.compare(userData.password, user.password).then((status) => {
               if (status && user.status) {
                  response.user = user
                  response.status = true
                  resolve(response)
               } else if (!user.status && status) {

                  userblocked.statuss = true
                  resolve(userblocked)

               } else {
                  resolve({ status: false })
               }
            })
         } else {
            resolve({ status: false })
         }
      })
   },

   checkMobilenumber: (mobile) => {
      let response = {}
      return new Promise(async (resolve, reject) => {
         let user = await db.get().collection(collection.User_Collection).findOne({ phone: mobile })
         if (user) {
            resolve(user)
         } else {
            response.statuss = true
            resolve(response)
         }
      })
   },
   addToCart: (proId, userId, totalprice) => {
      let proObj = {
         item: ObjectId(proId),
         quantity: 1,
         totalprice: totalprice

      }
      return new Promise(async (resolve, reject) => {
         let userCart = await db.get().collection(collection.Cart_Collection).findOne({ user: ObjectId(userId) })

         if (userCart) {
            let proExist = userCart.products.findIndex(product => product.item == proId)
            console.log(proExist);

            if (proExist != -1) {
               db.get().collection(collection.Cart_Collection).updateOne({ 'products.item': ObjectId(proId) },
                  {
                     $inc: { 'products.$.quantity': 1 }
                  }
               ).then(() => {
                  resolve()
               })
            } else {
               db.get().collection(collection.Cart_Collection).updateOne({ user: ObjectId(userId) },

                  {
                     $push: { products: proObj }
                  }

               ).then((response) => {
                  resolve()
               })
            }

         } else {
            let cartObj = {
               user: ObjectId(userId),
               products: [proObj],
            }
            db.get().collection(collection.Cart_Collection).insertOne(cartObj).then((response) => {
               resolve()
            })

         }
      })
   },

   addToWhishList: (proId, userId) => {

      let proObj = {
         item: ObjectId(proId),

      }
      return new Promise(async (resolve, reject) => {

         let whishList = await db.get().collection(collection.Whishlist_Collection).findOne({ user: ObjectId(userId) })

         if (whishList) {

            let proExist = whishList.products.findIndex(product => product.item == proId)

            if (proExist === -1) {
               db.get().collection(collection.Whishlist_Collection).updateOne({ user: ObjectId(userId) },

                  {
                     $push: { products: proObj }
                  }

               ).then((response) => {
                  resolve()
               })


               // db.get().collection(collection.Whishlist_Collection).updateOne({ 'products.item': ObjectId(proId) },
               //    {
               //       $inc: { 'products.$.quantity': 1 }
               //    }
               // ).then(() => {
               //    resolve()
               // })
            } else {
               resolve({ proexist: true })
            }
         } else {

            let whisListItem = {
               user: ObjectId(userId),
               products: [proObj],
            }
            db.get().collection(collection.Whishlist_Collection).insertOne(whisListItem).then((response) => {
               resolve()
            })

         }
      })
   },

   getWhisListCount: (userId) => {

      return new Promise(async (resolve, reject) => {
         let listCount = 0
         let count = await db.get().collection(collection.Whishlist_Collection).findOne({ user: ObjectId(userId) })
         if (count) {
            listCount = count.products.length
         }
         resolve(listCount)
      })

   },

   getwhishlistproducts: (userId) => {

      return new Promise(async (resolve, reject) => {
         let whishlistItems = await db.get().collection(collection.Whishlist_Collection).aggregate([
            {
               $match: { user: ObjectId(userId) }
            },
            {
               $unwind: "$products"
            },
            {
               $project: {
                  item: "$products.item"
               }
            },
            {
               $lookup: {
                  from: collection.Product_Collection,
                  localField: 'item',
                  foreignField: '_id',
                  as: 'product'
               }
            },
            {
               $project: {
                  item: 1, products: { $arrayElemAt: ['$product', 0] }
               }
            }


         ]).toArray()
         resolve(whishlistItems)
      })

   },

   removeWhishListProduct: (userId, proId) => {

      return new Promise((resolve, reject) => {

         db.get().collection(collection.Whishlist_Collection).updateOne({ user: ObjectId(userId) },
            {
               $pull: {
                  products: { item: ObjectId(proId) }
               }
            }
         ).then((response) => {
            resolve(response)
         })

      })

   },

   getCartProducts: (userId) => {
      return new Promise(async (resolve, reject) => {
         let cartItems = await db.get().collection(collection.Cart_Collection).aggregate([
            {
               $match: { user: ObjectId(userId) }
            },
            {
               $unwind: "$products"
            },
            {
               $project: {
                  item: "$products.item",
                  quantity: '$products.quantity',

               }
            },
            {
               $lookup: {
                  from: collection.Product_Collection,
                  localField: 'item',
                  foreignField: '_id',
                  as: 'product'
               }
            },
            {
               $project: {
                  item: 1, quantity: 1, products: { $arrayElemAt: ['$product', 0] }
               }
            }

         ]).toArray()


         console.log(cartItems);
         console.log('+++++++++++++++++++++');



         resolve(cartItems)
      })

   },
   getCartCount: (userId) => {

      return new Promise(async (resolve, reject) => {
         let cartCount = 0
         let count = await db.get().collection(collection.Cart_Collection).findOne({ user: ObjectId(userId) })
         if (count) {
            cartCount = count.products.length
         }

         resolve(cartCount)
      })

   },

   getCartProductQuantity:(userId,proId)=>{

      return new Promise(async(resolve,reject)=>{
        const productquantity=await db.get().collection(collection.Cart_Collection).aggregate([
            {
               $match:{user:ObjectId(userId)}
            },
            {
               $unwind:"$products" 
            },
           {
            $project:{
               quantity:'$products.quantity',
               item:"$products.item"
            }
           }
         ]).toArray()

        let quantity= productquantity.filter(i=>(i.item == proId ))

         resolve(quantity[0])
      })

   },


   changeProductQuantity: (details) => {

      details.quantity = parseInt(details.quantity)
      details.count = parseInt(details.count)

      return new Promise((resolve, reject) => {

         if (details.count == -1 && details.quantity == 1) {

         

               db.get().collection(collection.Cart_Collection).updateOne({ _id: ObjectId(details.cart) },
               {
                  $pull: { products: { item: ObjectId(details.product) } }
               }
            ).then((response) => {
               resolve({ removeProduct: true })

            })

            

            
         } else {

            db.get().collection(collection.Cart_Collection).updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.product) },
               {
                  $inc: { 'products.$.quantity': details.count }
               }
            ).then((response) => {
               resolve({ status: true })
            })

         }


      })
   },

   getTotalAmount: (userId, coupondiscount) => {
      return new Promise(async (resolve, reject) => {
         let totalAmount = await db.get().collection(collection.Cart_Collection).aggregate([
            {
               $match: { user: ObjectId(userId) }
            },
            {
               $unwind: "$products"
            },
            {
               $project: {
                  item: "$products.item",
                  quantity: '$products.quantity'
               }
            },
            {
               $lookup: {
                  from: collection.Product_Collection,
                  localField: 'item',
                  foreignField: '_id',
                  as: 'product'
               }
            },
            {
               $project: {
                  item: 1, quantity: 1, products: { $arrayElemAt: ['$product', 0] }
               }
            },
            {
               $group: {
                  _id: null,
                  total: { $sum: { $multiply: ["$quantity", "$products.price"] } }
               }
            }

         ]).toArray()
        
         if (totalAmount[0] === undefined) {
            resolve(0)
         } else {

            

            if (coupondiscount) {
               totalAmount[0].total = totalAmount[0].total - coupondiscount
               resolve(totalAmount[0].total)
            } else {
               resolve(totalAmount[0].total)
            }

         }

      })
   },

   placeOrder: (order, products, totalPrice) => {
      return new Promise(async (resolve, reject) => {

          let status = order.paymentmethod === "COD" ? 'Placed' : 'Pending'

         let orderObj = {
            deliveryDetails: {
               name: order.name,
               mobile: order.phone,
               address: order.streetaddress,
               pincode: order.postcode,
               landmark: order.landmark
            },
            userId: ObjectId(order.userId),
            paymentmethod: order.paymentmethod,
            products: products.products,
            totalprice: totalPrice,
            date: new Date(),
            status: status
         }
         let address = {
            userId: ObjectId(order.userId),
            name: order.name,
            mobile: order.phone,
            address: order.streetaddress,
            pincode: order.postcode,
            landmark: order.landmark,
            email: order.email
         }

         let useraddress = await db.get().collection(collection.Address_Collection).find({ userId: ObjectId(order.userId) }).toArray()

         const useradrs = useraddress.map((file) => {
            return file

         });

         const addressvalue = useradrs.map((file) => {
            return file.address

         });


         const userpin = useraddress.map((file) => {
            return file

         });

         const pincode = useradrs.map((file) => {
            return file.pincode

         });

        

         if(addressvalue[0]!==address.address || pincode[0]!==address.pincode){

            db.get().collection(collection.Address_Collection).insertOne(address)

         }

         db.get().collection(collection.Order_Collection).insertOne(orderObj).then((data) => {
            let orderId = data.insertedId
            db.get().collection(collection.Order_Collection).updateOne({ _id: ObjectId(orderId) },
               {
                  $set: {
                     "products.$[].Status": "Placed"
                  }
               }
            )

           products.products.forEach(element => {
                 console.log(element);

                 let quantity=element.quantity
                 let proId=element.item


                 db.get().collection(collection.Product_Collection).updateOne({_id:ObjectId(proId)},
                       
                       {
                        $inc:{stocks:-quantity}
                       }
                 )
           });
            db.get().collection(collection.Cart_Collection).deleteOne({ user: ObjectId(order.userId) })
            resolve(data.insertedId)
         })
      })

   },

   getUserAddress: (userId) => {
      return new Promise(async (resolve, reject) => {
         const address = await db.get().collection(collection.Address_Collection).find({ userId: ObjectId(userId) }).toArray()

        
         resolve(address[0])
      })

   },

   getCartProductList: (userId) => {
      return new Promise(async (resolve, reject) => {
         let cart = await db.get().collection(collection.Cart_Collection).findOne({ user: ObjectId(userId) })

         resolve(cart)
      })
   },
   //  removeCartProduct:(details)=>{
   //      return new Promise ((resolve,reject)=>{
   //       db.get().collection(collection.Cart_Collection).updateOne({_id:ObjectId(details.cart)},
   //       {
   //           $pull:{products:{item:ObjectId(details.product)}}
   //       }
   //    ).then((response)=>{
   //       resolve({removeProduct:true})

   //    })

   //      })
   //  },
   getOrders: (userId) => {
      return new Promise(async (resolve, reject) => {
         let order = await db.get().collection(collection.Order_Collection).find({ userId: ObjectId(userId) }).sort({date:-1}).toArray()
         resolve(order)
      })
   },

   getOrderProducts: (orderId) => {
      return new Promise(async (resolve, reject) => {
         let orderItems = await db.get().collection(collection.Order_Collection).aggregate([
            {
               $match: { _id: ObjectId(orderId) }
            },
            {
               $unwind: "$products"
            },
            {
               $project: {
                  item: "$products.item",
                  quantity: "$products.quantity",
                  Status: "$products.Status",
                  
               }
            },
            {
               $lookup: {
                  from: collection.Product_Collection,
                  localField: 'item',
                  foreignField: '_id',
                  as: 'product'
               }
            },
            {
               $project: {
                  item: 1, quantity: 1, Status: 1, products: { $arrayElemAt: ['$product', 0] }
               }
            }

         ]).toArray()
         resolve(orderItems)
      })
   },
   cancelOrder: (orderId) => {
      return new Promise(async (resolve, reject) => {
         let order = await db.get().collection(collection.Order_Collection).findOne({ _id: ObjectId(orderId) })
         if (order.status) {
            db.get().collection(collection.Order_Collection).updateOne({ _id: ObjectId(orderId) },
               {
                  $set: { status: false }
               }
            ).then((response) => {
               resolve(response)
            })
         }

      })
   },

   generateRazorpay: (orderId, total) => {
      return new Promise((resolve, reject) => {
         var options = {
            amount: total * 100,
            currency: "INR",
            receipt: "" + orderId
         };
         instance.orders.create(options, function (err, order) {
            console.log(order);
            if (err) {
               console.log(err);
            } else {
               resolve(order)
            }

         });
      })

   },

   verifyPayment: (details) => {
      return new Promise((resolve, reject) => {

         console.log(details['payment[razorpay_order_id]']);
         console.log(details['order[id]']);
         console.log('orderId abv');
         const crypto = require('crypto');
         let hmac = crypto.createHmac('sha256', 'ht3Baduw0ohvEsfccZh3ZqHg')
         hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
         hmac = hmac.digest('hex')

         if (hmac == details['payment[razorpay_signature]']) {
            resolve()
         } else {
            reject()
         }
      })
   },

   changePaymentStatus: (orderId) => {
      return new Promise((resolve, reject) => {
         db.get().collection(collection.Order_Collection).updateOne({ _id: ObjectId(orderId) },

            {
               $set: {
                  status: "Placed"
               }
            }

         ).then((err, data) => {

            if (err) {
               console.log("..." + err);
            } else {
               console.log(data);
            }
            resolve()
         })
      })

   },

   generatePayPal: async (orderId, total) => {
      let value = await Convert(total).from("INR").to("USD");
      return new Promise((resolve, reject) => {

         const create_payment_json = {
            intent: "sale",
            payer: {
               payment_method: "paypal"
            },
            redirect_urls: {
               return_url: "http://localhost:3000/success/" + orderId,
               cancel_url: "http://localhost:3000/cancel"
            },
            transactions: [{
               item_list: {
                  items: [{
                     name: "Red Sox Hat",
                     sku: "001",
                     price: Math.round(value),
                     currency: "USD",
                     quantity: 1
                  }]
               },
               amount: {
                  currency: "USD",
                  total: Math.round(value)
               },
               description: "Hat for the best team ever"
            }]
         };

         paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
               throw error;
            } else {
               //  for(let i = 0;i < payment.links.length;i++){
               //    if(payment.links[i].rel === 'approval_url'){
               //      res.redirect(payment.links[i].href);
               //    }
               //  }
               resolve(payment)
            }


         })

      })


   },



   cancleProduct: (orderId, proId) => {

      return new Promise((resolve, reject) => {
         db.get().collection(collection.Order_Collection).findOneAndUpdate({ _id: ObjectId(orderId), "products.item": ObjectId(proId) },

            {
               $set: {
                  "products.$.Status": false

               }
            }


         ).then(async (response) => {

         
          let Quantity= response.value.products.filter((i)=>{
               if(i.item == proId ){               
                  return i.quantity
               }
           })

           let quantity=Quantity[0].quantity

           db.get().collection(collection.Product_Collection).updateOne({_id:ObjectId(proId)},

              {
               $inc:{stocks:quantity}
              }
           )


        const productdetails=await db.get().collection(collection.Order_Collection).findOne({ _id: ObjectId(orderId), "products.item": ObjectId(proId)})

           if(productdetails.paymentmethod !== 'COD'){


            let CanceledProduct=productdetails.products.filter((i)=>{

               if(i.item == proId ){

                return i

           }
             
        })

        resolve(CanceledProduct)


       }else{
         resolve()
       }

            
         })




      })

   },

   // findAddress: async (userId) => {
   //    let address = await db.get().collection(collection.Address_Collection).find({ userId: ObjectId(userId) }).toArray()

   // },

   findUser: (userId) => {

      return new Promise((resolve, reject) => {
         db.get().collection(collection.User_Collection).findOne({ _id: ObjectId(userId) }).then((response) => {
            resolve(response)
         })
      })

   },


   editUserData: (user, userId) => {
      user.status = true
      return new Promise(async (resolve, reject) => {
         let response = {}
         let userdata = await db.get().collection(collection.User_Collection).findOne({ _id: ObjectId(userId) })
         if (userdata) {
            bcrypt.compare(user.password, userdata.password).then(async (status) => {
               if (status) {
                  user.newpassword = await bcrypt.hash(user.newpassword, 10)
                  db.get().collection(collection.User_Collection).updateOne({ _id: ObjectId(userId) },
                     {
                        $set: {
                           username: user.username,
                           email: user.email,
                           phone: user.phone,
                           password: user.newpassword,
                           status: user.status
                        }
                     }
                  )
                  response.status = true
                  resolve(response)
               } else {
                  resolve({ status: false })
               }
            })
         } else {
            resolve({ status: false })
         }

      })
   },


   applyCoupons: (coupons, cartTotal, userId) => {
      return new Promise(async (resolve, reject) => {

         const coupon = await db.get().collection(collection.Coupon_Collection).find({ couponcode: coupons.coupondata }).toArray()

         let usercoupon = await db.get().collection(collection.Coupon_Collection).findOne(
            {
               $and:[

                  { couponcode: coupons.coupondata },

                  {
                     user: {
                        "$elemMatch": { userId: ObjectId(userId) }
                     }
                  }

               ]
            }        
         )

         let obj = {}

         let date = new Date()

         if (coupon[0]) {

            if (cartTotal > coupon[0].minorderprice) {

               if (date > coupon[0].Activedate && date < coupon[0].Expdate) {

                  if (!usercoupon) {

                     db.get().collection(collection.Coupon_Collection).updateOne({ couponcode: coupons.coupondata },
                        {
                           "$addToSet": {
                              user: { userId: ObjectId(userId) }
                           }
                        }
                     )
                     coupon[0].status = true
                     resolve(coupon[0])

                  } else {

                     obj.status = false
                     obj.message = "You are already use this coupon"
                     resolve(obj)
                  }

               } else {

                  obj.status = false
                  obj.message = "Your coupon is expired"
                  resolve(obj)

               }

            } else {

               obj.status = false
               obj.message = "Sorry The order total should be the minimum of " + coupon[0].minorderprice
               resolve(obj)

            }

         } else {

            obj.status = false
            obj.message = "Invalid coupon"
            resolve(obj)

         }


      })
   },



   getCategoryoffers:()=>{
      let response={}
      return new Promise (async(resolve,reject)=>{
         let category=await db.get().collection(collection.Category_collection).find({}).toArray()

              console.log(category);
               console.log('00000000000000000000000000000000000000');

               category.forEach((i)=>{

                   if(i.categoryOffer === 0){
                      response.category=false
                      resolve(response)
                   }else{
                     response.category=true
                     response.categoryOffer=i.categoryOffer
                     resolve(response)
                   }
               })

               
      })
   },


   getCategoryproducts:(category)=>{
        return new Promise (async(resolve,reject)=>{
       
           let productdetails= await db.get().collection(collection.Category_collection).aggregate([

            {
               $lookup:{
                  from:collection.Product_Collection,
                  localField:'category',
                  foreignField:'category',
                  as:'Category'
               }
            },

            {
               $unwind:"$Category"
            },

            {
               $match:{category:category}
            },
            {
               $project:{
                  _id:1,
                  category:1,
                  categoryOffer:1,
                  proId:"$Category._id",
                  price:"$Category.price",
                  Offerprice:"$Category.offerprice",
                  

               }
            }

           ]).toArray()

             console.log(')))))))))))');
           console.log(productdetails);

           resolve(productdetails)




        })
   },



   getCategoryproduct:(category)=>{
      return new Promise (async(resolve,reject)=>{
     
         let productdetails= await db.get().collection(collection.Product_Collection).find({category:category}).toArray()

         resolve(productdetails)

      })
 },






   searchProducts:(input)=>{
   
      return new Promise (async (resolve,reject)=>{

       let product=await db.get().collection(collection.Product_Collection).find({}).toArray()

       let searchProducts=product.filter(function(i){

         if(i.productname.includes(input)){
               return i;
         }

       })
                  
           resolve(searchProducts)

      })

   },
   updateWallet:(product,userId)=>{

      return new Promise (async (resolve,reject)=>{
         console.log(product);

         let products=await db.get().collection(collection.Product_Collection).findOne({_id:ObjectId(product[0].item)})
        let productQuantity=product[0].quantity      
         let productprice=products.price
         let updateAmount=productprice*productQuantity


         db.get().collection(collection.User_Collection).updateOne({_id:ObjectId(userId)},

            {
               $inc:{Wallet:updateAmount}
            }
         )

        let user=await db.get().collection(collection.User_Collection).findOne({_id:ObjectId(userId)})

      
         resolve(user)
      })

   },

   // findOneuserforWalletamount:(userId)=>{
   //     return new Promise (async (resolve, reject)=>{

   //      let user=await db.get().collection(collection.User_Collection).findOne({_id:ObjectId(userId)})
          
   //         resolve(user)
   //     })
   // }


   returnProduct:(Returnreson)=>{

      let proId=Returnreson.proId
      let orderId=Returnreson.orderId
      let returnReason=Returnreson.Reason

      return new Promise((resolve,reject)=>{


         db.get().collection(collection.Order_Collection).findOneAndUpdate({_id:ObjectId(orderId),"products.item":ObjectId(proId)},
           {
            $set:{"products.$.Status":"Return Pending",
                    
                   "products.$.ReturnReason":returnReason
                   
               }
           }
         ).then((response)=>{

            console.log(response);
            console.log('#####################');
            console.log(response.value.products);

            // db.get().collection(collection.User_Collection).updateOne()

         })

        

         

        resolve()
          
      })

   }


}