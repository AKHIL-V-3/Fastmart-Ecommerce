
var db = require('../Config/Connection')
var bcrypt = require('bcrypt')
var Promise = require('promise')
var collection = require('../Config/Collection')
const { response } = require('express')
const { reject, resolve } = require('promise')
const { map } = require('../app')
var ObjectId = require('mongodb').ObjectId


module.exports = {

      // addAdmin:()=>{

      //   const admin={name:'Admin',email:'admin@gmail.com',password:'admin123'};
      //   return new Promise(async(resolve,reject)=>{
      //    admin.password = await bcrypt.hash(admin.password,10)           
      //       db.get().collection('Admin').insertOne(admin)
      //       resolve(admin)
      //   })
      // }

      adminLogin: (adminData) => {

            return new Promise(async (resolve, reject) => {
                  let admin = await db.get().collection(collection.Admin_Colletion).findOne({ email: adminData.email })
                  let response = {}
                  console.log(admin);
                  if (admin) {
                        bcrypt.compare(adminData.password, admin.password).then((status) => {
                              if (status) {
                                    console.log('login success');
                                    response.admin = admin
                                    response.status = true

                                    resolve(response)
                              } else {
                                    console.log('login failed');
                                    resolve({ status: false })
                              }
                        })
                  } else {
                        console.log('login failed');
                        resolve({ status: false })
                  }
            })
      },

      addProducts: async (product) => {
            product.price = parseInt(product.price)
            product.stocks = parseInt(product.stocks)
            product.offerprice = parseInt(product.price)
            product.Offerpercentage = 0

            let category = await db.get().collection(collection.Category_collection).findOne({category:product.category});

            product.categoryOfferpercentage = category.categoryOffer;

            if(category.categoryOffer !=0){
                  let offer = product.price - (product.price * category.categoryOffer)/100;
                  product.price = Math.round(offer);
            }

            return new Promise(async (resolve, reject) => {
                  let productdetail = await db.get().collection(collection.Product_Collection).insertOne(product)
                  resolve(productdetail.insertedId)
            })
      },

      showUser: () => {
            return new Promise(async (resolve, reject) => {
                  let userdetails = await db.get().collection(collection.User_Collection).find({}).toArray()
                  resolve(userdetails)
            })
      },
      getProducts: () => {
            return new Promise(async (resolve, reject) => {
                  let products = await db.get().collection(collection.Product_Collection).find({}).toArray()
                  resolve(products)
            })
      },

      getProductimages: () => {
            return new Promise(async (resolve, reject) => {
                  let products = await db.get().collection(collection.Product_Collection).find({}).limit(9).toArray()
                  resolve(products)
            })
      },

      getlimitedProducts: () => {
            return new Promise(async (resolve, reject) => {
                  let products = await db.get().collection(collection.Product_Collection).find({}).limit(4).toArray()
                  resolve(products)
            })
      },

      getProductdetails: (proId) => {
            return new Promise((resolve, reject) => {
                  db.get().collection(collection.Product_Collection).findOne({ _id: ObjectId(proId) }).then((product) => {
                        resolve(product)
                  })


            })
      },

      editProduct: (productdata, proId) => {
            return new Promise((resolve, reject) => {
                  productdata.price = parseInt(productdata.price)
                  productdata.stocks = parseInt(productdata.stocks)


                  console.log(productdata);
                  console.log(';;;;;;;;;;;;;;;;;;;;;;;');

                  if (productdata.img.length === 0) {
                        db.get().collection(collection.Product_Collection).updateOne({ _id: ObjectId(proId) }, {
                              $set: {
                                    productname: productdata.productname,
                                    price: productdata.price,
                                    stocks: productdata.stocks,
                                    category: productdata.category,
                                    description: productdata.description,

                              }
                        }).then((response) => {
                              resolve()
                        })

                  } else {
                        db.get().collection(collection.Product_Collection).updateOne({ _id: ObjectId(proId) }, {
                              $set: {
                                    productname: productdata.productname,
                                    price: productdata.price,
                                    stocks: productdata.stocks,
                                    category: productdata.category,
                                    description: productdata.description,
                                    img: productdata.img
                              }
                        }).then((response) => {
                              resolve()
                        })

                  }


            })
      },
      deleteProduct: (proId) => {

            return new Promise((resolve, reject) => {
                  db.get().collection(collection.Product_Collection).deleteOne({ _id: ObjectId(proId) }).then((response) => {
                        resolve(response)
                  })
            })
      },

      addCategory: (category) => {
            let response = {}


            category.category = category.category.toLowerCase()

            return new Promise(async (resolve, reject) => {
                  let categorystatus = await db.get().collection(collection.Category_collection).findOne(category)
                  if (categorystatus) {
                        response.status = true
                        resolve(response)
                  } else {
                        db.get().collection(collection.Category_collection).insertOne(category).then((status) => {
                              if (status) {
                                    resolve({ status: false })
                              }

                        })
                  }
            })
      },

      getCategory: () => {
            return new Promise(async (resolve, reject) => {
                  let category = await db.get().collection(collection.Category_collection).find({}).toArray()
                  resolve(category)
            })
      },

      deleteCategory: (categoryId) => {
            return new Promise((resolve, reject) => {
                  db.get().collection(collection.Category_collection).deleteOne({ _id: ObjectId(categoryId) }).then((response) => {
                        resolve(response)
                  })
            })
      },

      avtiveBlockUser: (userId) => {
            return new Promise(async (resolve, reject) => {
                  let user = await db.get().collection(collection.User_Collection).findOne({ _id: ObjectId(userId) })
                  if (user.status) {
                        db.get().collection(collection.User_Collection).updateOne(user,
                              {
                                    $set: { status: false }
                              }
                        ).then((response) => {
                              resolve(response)
                        })
                  } else {
                        db.get().collection(collection.User_Collection).updateOne(user,
                              {
                                    $set: { status: true }
                              }
                        ).then((response) => {
                              resolve(response)
                        })
                  }
            })
      },

      getOrderList: () => {
            return new Promise(async (resolve, reject) => {
                  let Orders = await db.get().collection(collection.Order_Collection).find({}).sort({date:-1}).toArray()
                  resolve(Orders)
                  console.log(Orders);
            })
      },

      CancelOrder: (orderId) => {
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

      totalSalesPrice: () => {
            return new Promise(async (resolve, reject) => {

                  let totalSales = await db.get().collection(collection.Order_Collection).aggregate([

                        {
                              $match: { "products.Status": "Placed" }
                        },

                        {
                              $group: {
                                    _id: null,
                                    total: { $sum: '$totalprice' }
                              }
                        }
                  ]
                  ).toArray()

                  console.log(totalSales);
                  if (totalSales.length == 0) {
                        resolve(0)
                  } else {
                        resolve(totalSales[0].total)
                  }

            })
      },


      totalSalesPricePayPal: () => {
            return new Promise(async (resolve, reject) => {
                  let totalsales = await db.get().collection(collection.Order_Collection).aggregate([
                        {
                              $match: { $and: [{ paymentmethod: "payPal" }, { status: "Placed" }] }

                        },

                        {
                              $group: {
                                    _id: null,
                                    total: { $sum: "$totalprice" }
                              }
                        }
                  ]).toArray()
                  console.log(totalsales);
                  if (totalsales.length == 0) {
                        resolve(0)
                  } else {
                        resolve(totalsales[0].total)
                  }
            })
      },


      totalSalesPriceCOD: () => {
            return new Promise(async (resolve, reject) => {
                  let totalsales = await db.get().collection(collection.Order_Collection).aggregate([
                        {
                              $match: { $and: [{ paymentmethod: "COD" }, { status: "Placed" }] }

                        },

                        {
                              $group: {
                                    _id: null,
                                    total: { $sum: "$totalprice" }
                              }
                        }
                  ]).toArray()
                  console.log(totalsales);

                  if (totalsales.length == 0) {
                        resolve(0)
                  } else {
                        resolve(totalsales[0].total)
                  }

            })
      },


      totalSalesPriceRazorPay: () => {
            return new Promise(async (resolve, reject) => {
                  let totalsales = await db.get().collection(collection.Order_Collection).aggregate([
                        {
                              $match: { $and: [{ paymentmethod: "Online" }, { status: "Placed" }] }

                        },

                        {
                              $group: {
                                    _id: null,
                                    total: { $sum: "$totalprice" }
                              }
                        }
                  ]).toArray()
                  console.log(totalsales);
                  if (totalsales.length == 0) {
                        resolve(0)
                  } else {
                        resolve(totalsales[0].total)
                  }
            })
      },

      totalSalesIncomeByYear: () => {
            return new Promise(async (resolve, reject) => {
                  let incomeByYear = await db.get().collection(collection.Order_Collection).aggregate([

                        {
                              $match: { "products.Status": "Delivered" }
                        },
                        {
                              $group: {
                                    _id: { $dateToString: { format: "%Y", date: "$date" } },
                                    total: { $sum: "$totalprice" },
                                    count: { $sum: 1 }

                              }
                        },
                        {
                              $sort: { _id: 1 }
                        }
                  ]).toArray()


                  console.log(incomeByYear);
                  console.log('99999999999999999999999999999999999999999999999999999');



                  resolve(incomeByYear)
            })
      },

      totalSalesIncomeByMonth: () => {
            return new Promise(async (resolve, reject) => {
                  let incomeByMonth = await db.get().collection(collection.Order_Collection).aggregate([
                        {
                              $match: { "products.Status": "Delivered" }
                        },
                        {
                              $group: {
                                    _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                                    total: { $sum: "$totalprice" },
                                    count: { $sum: 1 }
                              }
                        },
                        {
                              $sort: { _id: 1 }
                        }
                  ]).toArray()


                  resolve(incomeByMonth)
            })
      },

      totalSalesIncomeByDaily: () => {
            return new Promise(async (resolve, reject) => {
                  let incomeByDaily = await db.get().collection(collection.Order_Collection).aggregate([
                        {
                              $match: { "products.Status": "Delivered" }
                        },
                        {
                              $group:
                              {
                                    _id: { day: { $dayOfYear: "$date" }, year: { $year: "$date" } },
                                    total: { $sum: "$totalprice" },
                                    count: { $sum: 1 }
                              }
                        },
                        {
                              $sort: { _id: 1 }
                        }
                  ]).toArray()


                  resolve(incomeByDaily)
            })
      },

      totalSalesIncome: () => {
            return new Promise(async (resolve, reject) => {
                  let incomeByDaily = await db.get().collection(collection.Order_Collection).aggregate([
                        {
                              $match: {
                                    status: "Delivered"
                              }
                        },
                        {
                              $group: {
                                    _id: { $dateToString: { format: "%Y", date: "$date" } },
                                    total: { $sum: "$totalprice" },
                                    count: { $sum: 1 }
                              }
                        },
                        {
                              $sort: { _id: 1 }
                        }
                  ]).toArray()


                  resolve(incomeByDaily)
            })
      },
      totalOrdercount: () => {
            return new Promise(async (resolve, reject) => {
                  let totalorder = await db.get().collection(collection.Order_Collection).estimatedDocumentCount()

                  resolve(totalorder)

            })
      },

      totalUsercount: () => {
            return new Promise(async (resolve, reject) => {
                  let totaluser = await db.get().collection(collection.User_Collection).estimatedDocumentCount()
                  resolve(totaluser)

            })

      },
      cancleProduct: (orderId, proId) => {

            return new Promise((resolve, reject) => {
                  db.get().collection(collection.Order_Collection).updateOne({ _id: ObjectId(orderId), "products.item": ObjectId(proId) },

                        {
                              $set: {
                                    "products.$.Status": false

                              }
                        }


                  ).then(() => {
                        resolve()
                  })

            })

      },
      shipProduct: (orderId, proId) => {

            return new Promise((resolve, reject) => {
                  db.get().collection(collection.Order_Collection).updateOne({ _id: ObjectId(orderId), "products.item": ObjectId(proId) },
                        {
                              $set: {
                                    "products.$.Status": "Shipped"

                              }
                        }
                  ).then(() => {
                        resolve()
                  })

            })

      },

      packProduct: (orderId, proId) => {

            return new Promise((resolve, reject) => {
                  db.get().collection(collection.Order_Collection).updateOne({ _id: ObjectId(orderId), "products.item": ObjectId(proId) },
                        {
                              $set: {
                                    "products.$.Status": "Packed"

                              }
                        }
                  ).then(() => {
                        resolve()
                  })

            })

      },

      deliverProduct: (orderId, proId) => {

            return new Promise((resolve, reject) => {
                  db.get().collection(collection.Order_Collection).updateOne({ _id: ObjectId(orderId), "products.item": ObjectId(proId) },
                        {
                              $set: {
                                    "products.$.Status": "Delivered"

                              }
                        }
                  ).then(() => {
                        resolve()
                  })

            })

      },

      addCoupon: (coupon) => {



            const Coupon = {
                  couponcode: coupon.couponcode,
                  discountprice: parseInt(coupon.value),
                  couponname: coupon.couponname,
                  Activedate: new Date(coupon.Activedate),
                  Expdate: new Date(coupon.Expdate),
                  minorderprice: parseInt(coupon.minorderprice),
                  user: []

            }
            return new Promise((resolve, reject) => {
                  db.get().collection(collection.Coupon_Collection).insertOne(Coupon).then((response) => {
                        resolve(response)

                  })
            })
      },

      getCoupon: () => {
            return new Promise(async (resolve, reject) => {

                  let Coupon = await db.get().collection(collection.Coupon_Collection).find({}).toArray()

                  resolve(Coupon)

            })
      },

      productOffer: async (offerprice) => {

            offerprice.productoffer = parseInt(offerprice.productoffer)
            let  offerPerc = offerprice.productoffer
            let proId = offerprice.proId

            return new Promise(async (resolve, reject) => {

                  let product = await db.get().collection(collection.Product_Collection).findOne({ _id: ObjectId(proId) })

                  let productprice = product.offerprice

                  let offerprices = (productprice * offerPerc) / 100
                
                  if(product.categoryOfferpercentage > offerPerc){
                        offerprices = (productprice * product.categoryOfferpercentage) / 100
                        console.log('Less::::::::::::::::::::::::',offerprices);
                  }

                  console.log(offerprices);

                  let offer = productprice - offerprices;  
 

                 
                  offer = Math.round(offer)

                  db.get().collection(collection.Product_Collection).updateOne({ _id: ObjectId(proId) },

                        {
                              $set: { price: offer }
                        },
                  )


                  db.get().collection(collection.Product_Collection).updateOne({ _id: ObjectId(proId) },
                        {
                              $set: { Offerpercentage: offerPerc }
                        }
                  )

                  resolve()

            })
      },

      categoryOffer: (offerprice) => {

            offerprice.categoryoffer = parseInt(offerprice.categoryoffer)
            const offerpercentage = offerprice.categoryoffer
            const categorys = offerprice.category

            return new Promise(async (resolve, reject) => {


                  db.get().collection(collection.Category_collection).findOneAndUpdate({ category: categorys },

                        {
                              $set: { categoryOffer: offerpercentage }
                        }
                  ).then((response) => {

                        console.log(response);

                        resolve(response)

                  })

            })

      },


      applyCategoryOffer: (categoryproducts) => {
            return new Promise(async (resolve, reject) => {

                  categoryproducts.forEach(async i => {

                        console.log(i);

                        let productprice = i.Offerprice   

                        let offer = productprice - (productprice * i.categoryOffer) / 100

                        if(i.categoryOfferpercentage < i.Offerpercentage ){
                              offer = productprice - (productprice * i.Offerpercentage) / 100
                        }

                            offer = Math.round(offer)

                        db.get().collection(collection.Product_Collection).updateOne({ _id: ObjectId(i.proId) },

                              {
                                    $set: { price: offer }
                              },

                        )

                        db.get().collection(collection.Product_Collection).updateOne({ _id: ObjectId(i.proId) },
                              {
                                    $set: { categoryOfferpercentage: i.categoryOffer }
                              }
                        )

                  });

                  let product = await db.get().collection(collection.Product_Collection).find({ category: "Women" }).toArray()

                  resolve()
            })
      },

      getOneProduct: (proId) => {
            return new Promise((resolve, reject) => {
                  db.get().collection(collection.Product_Collection).findOne({ _id: ObjectId(proId) }).then((response) => {
                        resolve(response)
                  })
            })
      },


      allsalesreport: (dates) => {

            const d = dates.date
            let Time = new Date(d)
            var day = 60 * 60 * 24 * 1000;
            let Time2 = new Date(Time.getTime() + day);
            let salesReport = null


            let fromdate = dates.fromdate
            let Todate = dates.todate

            let fromDate = new Date(fromdate)
            let ToDate = new Date(Todate)


            return new Promise(async (resolve, reject) => {

                  if (dates.value == 'All') {
                        salesReport = await db.get().collection(collection.Order_Collection).aggregate([

                              {
                                    $project: {

                                          deliveryDetails: 1,
                                          userId: 1,
                                          paymentmethod: 1,
                                          products: 1,
                                          date: 1,
                                          totalprice: 1
                                    }
                              },

                              {
                                    $unwind: "$products"
                              },
                              {

                                    $project: {

                                          deliveryDetails: 1,
                                          userId: 1,
                                          paymentmethod: 1,
                                          date: 1,
                                          totalprice: 1,
                                          item: "$products.item",
                                          quantity: "$products.quantity",
                                          total: "$products.totalprice",
                                          status: "$products.Status",

                                    }

                              },
                              {
                                    $lookup: {
                                          from: collection.Product_Collection,
                                          localField: 'item',
                                          foreignField: '_id',
                                          as: 'Sales'
                                    }
                              },

                              {
                                    $project: {
                                          deliveryDetails: 1,
                                          userId: 1,
                                          paymentmethod: 1,
                                          date: 1,
                                          totalprice: 1,
                                          item: 1, quantity: 1, status: 1, products: { $arrayElemAt: ['$Sales', 0] }
                                    }
                              },

                              {
                                    $match:{status:"Delivered"}
                              },
                              

                        ]).toArray()

                        resolve(salesReport)


                  } else if (dates.date) {


                        salesReport = await db.get().collection(collection.Order_Collection).aggregate([

                              {
                                    $match: {
                                          $and: [{ date: { $gt: Time } }, { date: { $lt: Time2 } }]
                                    }
                              },


                              {
                                    $project: {

                                          deliveryDetails: 1,
                                          userId: 1,
                                          paymentmethod: 1,
                                          products: 1,
                                          date: 1,
                                          totalprice: 1
                                    }
                              },

                              {
                                    $unwind: "$products"
                              },
                              {

                                    $project: {

                                          deliveryDetails: 1,
                                          userId: 1,
                                          paymentmethod: 1,
                                          date: 1,
                                          totalprice: 1,
                                          item: "$products.item",
                                          quantity: "$products.quantity",
                                          total: "$products.totalprice",
                                          status: "$products.Status",

                                    }

                              },


                              {
                                    $lookup: {
                                          from: collection.Product_Collection,
                                          localField: 'item',
                                          foreignField: '_id',
                                          as: 'Sales'
                                    }
                              },

                              {
                                    $project: {
                                          deliveryDetails: 1,
                                          userId: 1,
                                          paymentmethod: 1,
                                          date: 1,
                                          totalprice: 1,
                                          item: 1, quantity: 1, status: 1, products: { $arrayElemAt: ['$Sales', 0] }
                                    }
                              },

                              {
                                    $match:{status:"Delivered"}
                              }


                        ]).toArray()


                        resolve(salesReport)

                  } else {

                        salesReport = await db.get().collection(collection.Order_Collection).aggregate([

                              {
                                    $match: {
                                          $and: [{ date: { $gte: fromDate } }, { date: { $lte: ToDate } }]
                                    }
                              },


                              {
                                    $project: {

                                          deliveryDetails: 1,
                                          userId: 1,
                                          paymentmethod: 1,
                                          products: 1,
                                          date: 1,
                                          totalprice: 1
                                    }
                              },

                              {
                                    $unwind: "$products"
                              },
                              {

                                    $project: {

                                          deliveryDetails: 1,
                                          userId: 1,
                                          paymentmethod: 1,
                                          date: 1,
                                          totalprice: 1,
                                          item: "$products.item",
                                          quantity: "$products.quantity",
                                          total: "$products.totalprice",
                                          status: "$products.Status",

                                    }

                              },


                              {
                                    $lookup: {
                                          from: collection.Product_Collection,
                                          localField: 'item',
                                          foreignField: '_id',
                                          as: 'Sales'
                                    }
                              },

                              {
                                    $project: {
                                          deliveryDetails: 1,
                                          userId: 1,
                                          paymentmethod: 1,
                                          date: 1,
                                          totalprice: 1,
                                          item: 1, quantity: 1, status: 1, products: { $arrayElemAt: ['$Sales', 0] }
                                    }
                              },

                              {
                                    $match:{status:"Delivered"}
                              }


                        ]).toArray()

                        resolve(salesReport)

                  }


            })

      },


      acceptReturn: (orderId, proId) => {

            return new Promise((resolve, reject) => {
                  db.get().collection(collection.Order_Collection).findOneAndUpdate({ _id: ObjectId(orderId), "products.item": ObjectId(proId) },

                        {
                              $set: { "products.$.Status": "Returned" }
                        }
                  ).then(async (response) => {
                        const product = response.value.products.filter((i) => {

                              if (i.item == proId) {
                                    return i
                              }

                        })
                        const quantity = product[0].quantity
                        let products = await db.get().collection(collection.Product_Collection).findOne({ _id: ObjectId(proId) })
                        const productprice = products.price
                        const updateamount = productprice * quantity

                        let userId = response.value.userId

                        db.get().collection(collection.User_Collection).updateOne({ _id: ObjectId(userId) },
                              {
                                    $inc: { Wallet: updateamount }
                              }
                        )
                        resolve()

                  })


            })

      },

      declineReturn: (orderId, proId) => {

            return new Promise((resolve, reject) => {
                  db.get().collection(collection.Order_Collection).updateOne({ _id: ObjectId(orderId), "products.item": ObjectId(proId) },

                        {
                              $set: { "products.$.Status": "Delivered" }
                        }
                  ).then(() => {

                        resolve()

                  })


            })

      },

      editFirstBanner: (bannerData, BannerId) => {         
            return new Promise((resolve, reject) => {

                  console.log(bannerData);
                  console.log('####################');

                  if (bannerData.BannerImage[0] == undefined) {
                        db.get().collection(collection.Banner_Collection).updateOne({ _id: ObjectId(BannerId) }, {
                              $set: {
                                    
                                    Heading:bannerData.Heading,
                                    Description:bannerData.Description,

                              }
                        }).then((response) => {
                              resolve()
                        })

                  } else {
                        db.get().collection(collection.Banner_Collection).updateOne({ _id: ObjectId(BannerId) }, {
                              $set: {
                                    Heading:bannerData.Heading,
                                    Description:bannerData.Description,
                                    BannerImage: bannerData.BannerImage
                              }
                        }).then((response) => {
                              resolve()
                        })

                  }
            })
      },
      editSecondBanner: (bannerData, BannerId) => {
            return new Promise((resolve, reject) => {


                  if (bannerData.BannerImage[0] == undefined) {
                        db.get().collection(collection.Banner_Collection).updateOne({ _id: ObjectId(BannerId) }, {
                              $set: {
                                    
                                    Heading:bannerData.Heading,
                                    Description:bannerData.Description,

                              }
                        }).then((response) => {
                              resolve()
                        })

                  } else {
                        db.get().collection(collection.Banner_Collection).updateOne({ _id: ObjectId(BannerId) }, {
                              $set: {
                                    Heading:bannerData.Heading,
                                    Description:bannerData.Description,
                                    BannerImage: bannerData.BannerImage
                              }
                        }).then((response) => {
                              resolve()
                        })

                  }
            })
      },
      editLastBanner: (bannerData, BannerId) => {

            
            return new Promise((resolve, reject) => {
                  if (bannerData.BannerImage[0] == undefined) {
                        db.get().collection(collection.Banner_Collection).updateOne({ _id: ObjectId(BannerId) }, {
                              $set: {
                                    
                                    Heading:bannerData.Heading,
                                    Description:bannerData.Description,

                              }
                        }).then((response) => {
                              resolve()
                        })

                  } else {
                        db.get().collection(collection.Banner_Collection).updateOne({ _id: ObjectId(BannerId) }, {
                              $set: {
                                    Heading:bannerData.Heading,
                                    Description:bannerData.Description,
                                    BannerImage: bannerData.BannerImage
                              }
                        }).then((response) => {
                              resolve()
                        })

                  }
            })
      },

      getBanners: () => {
            return new Promise(async (resolve, reject) => {
                  const Banners = await db.get().collection(collection.Banner_Collection).find({}).toArray()
                  resolve(Banners)

            })
      }











}


