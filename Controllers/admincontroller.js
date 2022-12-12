
var admin = require('../Helpers/Admin-helper')
var user = require('../Helpers/User-Helpers')


module.exports = {

    adminHome: async function (req, res, next) {
        let totalsalesamount = await admin.totalSalesPrice()
        // let totalsalesPayPal = await admin.totalSalesPricePayPal()
        // let totalsalesCOD = await admin.totalSalesPriceCOD()
        // let totalSalesRazorPay = await admin.totalSalesPriceRazorPay()
        let totalOrdercount = await admin.totalOrdercount()
        let totaluser = await admin.totalUsercount()
        let totalsalesByYear = await admin.totalSalesIncomeByYear()
        let totalsalesByMonth = await admin.totalSalesIncomeByMonth()
        let totalSalesByDaily = await admin.totalSalesIncomeByDaily()
        console.log(totalsalesByYear);
        res.render('Admin/admin-dashboard', { totalsalesamount, totalsalesByYear, totalsalesByMonth, totalSalesByDaily, totalOrdercount, totaluser });
    },

    adminLogin: (req, res) => {
        res.render('Admin/admin-login', { "loginErr": req.session.loginErr })
        req.session.loginErr = false

    },

    adminLogout: (req, res) => {
        req.session.admin = null
        req.session.adminloggedIn = false
        res.clearCookie('admin')
        res.clearCookie('adminloggedIn')

        if (!req.session.adminloggedIn) {
            res.redirect('/admin/adminLogin')
        } else {
            res.redirect('/admin')
        }

    },

    customerList: (req, res) => {

        admin.showUser().then((users) => {


            const user = users.filter((i, index) => {
                i.index = index + 1
                return i
            })


            res.render('Admin/customerslist', { user })
        })
    },

    productList: (req, res) => {
        admin.getProducts().then((product) => {

            const products = product.filter((i, index) => {
                i.index = index + 1
                return i
            })


            console.log(products);
            res.render('Admin/productlist', { products })
        })

    },

    categoryList: (req, res) => {
        admin.getCategory().then((categorys) => {

            const category = categorys.filter((i, index) => {
                i.index = index + 1
                return i
            })
            res.render('Admin/categorylist', { category })
        })
    },

    addProducts: (req, res,) => {
        admin.getCategory().then((category) => {
            res.render('Admin/addproduct', { category })
        })
    },

    editProducts: async (req, res) => {
        let product = await admin.getProductdetails(req.params.id)
        admin.getCategory().then((category) => {
            res.render('Admin/editproduct', { product, category })
        })
    },

    deleteProducts: (req, res) => {
        let id = req.params.id
        admin.deleteProduct(id).then((response) => {
            res.redirect('/admin/products')
        })
    },

    addCategory: (req, res) => {
        res.render('Admin/addCategory')
    },

    deleteCategory: (req, res) => {
        admin.deleteCategory(req.params.id).then((data) => {
            res.redirect('/admin/category')
        })
    },

    blockAndUnblockUser: (req, res) => {
        admin.avtiveBlockUser(req.params.id).then((response) => {
            res.redirect('/admin/customers')
        })
    },

    Orderlist: (req, res) => {
        admin.getOrderList().then((Order) => {
            const Orders = Order.filter((i, index) => {
                i.index = index + 1
                return i
            })
            res.render('Admin/Orderlist', { Orders })
        })
    },

    viewOrderedProducts: async (req, res) => {
        orderId = req.params.id
        let product = await user.getOrderProducts(orderId)
        const products = product.filter((i, index) => {
            i.index = index + 1
            return i
        })


        products.forEach((i) => {
            if (i.Status === 'Delivered' || i.Status === "Canceled" || i.Status === "Returned") {

                i.changestatus = false
            } else {
                i.changestatus = true
            }
        })


        products.forEach((i) => {
            if (i.Status === 'Return Pending') {

                i.returnpending = false
            } else {
                i.returnpending = true
            }
        })



        products.forEach((i) => {
            if (i.Status === 'Packed') {

                i.packed = true
            } else {
                i.packed = false
            }
        })

        products.forEach((i) => {
            if (i.Status === 'Shipped') {

                i.Shipped = true
            } else {
                i.Shipped = false
            }
        })


       




        res.render('Admin/viewProducts', { products })
    },

    cancelOrderedProducts: (req, res) => {
        let orderId = req.params.orderId
        let proId = req.params.proId
        admin.cancleProduct(orderId, proId).then(() => {
            res.redirect("/admin/view-products/" + orderId)
        })
    },

    shipProducts: (req, res) => {
        let orderId = req.params.orderId
        let proId = req.params.proId
        admin.shipProduct(orderId, proId).then(() => {
            res.redirect("/admin/view-products/" + orderId)
        })
    },
    packProducts: (req, res) => {
        let orderId = req.params.orderId
        let proId = req.params.proId
        admin.packProduct(orderId, proId).then(() => {
            res.redirect("/admin/view-products/" + orderId)
        })
    },
    deliverProducts: (req, res) => {
        let orderId = req.params.orderId
        let proId = req.params.proId
        admin.deliverProduct(orderId, proId).then(() => {
            res.redirect("/admin/view-products/" + orderId)
        })
    },

    salesReport: async (req, res) => {
        let totalsalesByYear = await admin.totalSalesIncomeByYear()
        let totalsalesByMonth = await admin.totalSalesIncomeByMonth()
        let totalSalesByDaily = await admin.totalSalesIncomeByDaily()
        let totalSales = await admin.totalSalesIncome()
        let salesReport = req.session.salesReport
        let Total=req.session.RevenueTotal
        console.log(salesReport);
        console.log('pppppppppppppppppppppppppppppppppppppppppppppppppp');  

        res.render('Admin/salesReport', { totalsalesByYear, totalsalesByMonth, totalSalesByDaily, totalSales, salesReport ,Total })
    },

    couponList: (req, res) => {
        admin.getCoupon().then((coupons) => {

            coupons.forEach(element => {
                element.Expdate = element.Expdate.toString().split(' ').splice(0, 4).join(' ')
            });

            const coupon = coupons.filter((i, index) => {
                i.index = index + 1
                return i
            })

            res.render('Admin/couponlist', { coupon })
        })
    },

    addcoupon: (req, res) => {
        res.render('Admin/addcoupon')
    },

    Offer: (req, res) => {
        admin.getProducts().then((product) => {

            const products = product.filter((i, index) => {
                i.index = index + 1
                return i
            })

            res.render('Admin/offermanagement', { products })

        })

    },

    categoryoffer: (req, res) => {
        admin.getCategory().then((categorys) => {

            const category = categorys.filter((i, index) => {
                i.index = index + 1
                return i
            })
            res.render('Admin/categoryoffer', { category })

        })

    },

    Banner: async (req, res) => {
        let Banner = await admin.getBanners()
        const Banner1 = Banner[0]
        const Banner2 = Banner[1]
        const Banner3 = Banner[2]
        res.render('Admin/banner', { Banner1, Banner2, Banner3 })

    },




    //--------------------------------------------------------------------------------//
    //--------------------------------------------------------------------------------//
    //--------------------------------------------------------------------------------//
    //--------------------------POST---POST---POST------------------------------------//



    adminLoginPost: (req, res) => {
        admin.adminLogin(req.body).then((response) => {
            if (response.status) {
                req.session.admin = response.admin
                req.session.adminloggedIn = true
                res.redirect('/admin')
            } else {
                req.session.loginErr = true
                res.redirect('/admin/adminLogin')
            }
        })
    },

    addProductsPost: (req, res) => {
        const files = req.files
        const file = files.map((file) => {
            return file
        })
        const fileName = file.map((file) => {
            return file.filename
        })
        const product = req.body
        product.img = fileName

        admin.addProducts(product).then((response) => {
            res.redirect('/admin/products')
        })
    },

    editProductsPost: (req, res) => {
        let id = req.params.id
        const files = req.files
        const file = files.map((file) => {
            return file
        })
        const fileName = file.map((file) => {
            return file.filename
        })
        const product = req.body
        product.img = fileName


        admin.editProduct(product, id).then((data) => {
            console.log('99999999999999999');
            res.redirect('/admin/products')
        })
    },

    addCategoryPost: (req, res) => {
        admin.addCategory(req.body).then((response) => {
            if (response.status) {
                res.redirect('/admin/addcategory')
            } else {
                req.flash('exist', 'Category Already exist')
                res.redirect('/admin/category')
            }
        })
    },

    addcouponPost: (req, res) => {
        admin.addCoupon(req.body).then((response) => {
            res.redirect('/admin/coupon')
        })
    },

    productofferPost: (req, res) => {

        admin.productOffer(req.body).then(() => {
            res.redirect('/admin/offer')


        }).catch((e) => {
            console.log(e);
        })
    },
    categoryofferpost: (req, res) => {

        admin.categoryOffer(req.body).then(async (response) => {

            let categoryProducts = await user.getCategoryproducts(response.value.category)

            admin.applyCategoryOffer(categoryProducts).then((response) => {

                res.redirect('/admin/offercategory')

            })




        })
    },


    salesReportPost: (req, res) => {

        admin.allsalesreport(req.body).then((responses) => {
            responses.forEach(element => {
                element.date = element.date.toString().split(' ').splice(0, 4).join(' ')
            });
            const response = responses.filter((i, index) => {
                i.index = index + 1
                return i
            })


            const salesreport = responses.filter((i, index) => {
                   i.Revenue=i.quantity*i.products.price
                  return i
            })


            let  allRevenue=salesreport.map((i)=>{ 

                   return i.Revenue
              
          })

         const Total = allRevenue.reduce((partialSum, a) => partialSum + a, 0);

            req.session.salesReport = salesreport

            req.session.RevenueTotal=Total
            if (response) {

                res.json({ status: true })

            }
        })
    },


    returnAccept: (req, res) => {
        let orderId = req.params.orderId
        let proId = req.params.proId
        admin.acceptReturn(orderId, proId).then(() => {
            res.redirect('/admin/view-products/' + orderId)

        })
    },

    returnDecline: (req, res) => {
        let orderId = req.params.orderId
        let proId = req.params.proId
        admin.declineReturn(orderId, proId).then(() => {
            res.redirect('/admin/view-products/' + orderId)

        })


    },

    editFirstbanner: (req, res) => {

        let BannerId = req.params.id

        console.log(req.body);
        let bannerData = req.body
        const files = req.files
        console.log(files);
        const file = files.map((file) => {
            return file
        })
        const fileName = file.map((file) => {
            return file.filename
        })
        bannerData.BannerImage = fileName
        admin.editFirstBanner(bannerData, BannerId).then((response) => {

            res.redirect('/admin/banner')
        })


    },


    editSecondbanner: (req, res) => {

        let BannerId = req.params.id

        console.log(req.body);
        let bannerData = req.body
        const files = req.files
        console.log(files);
        const file = files.map((file) => {
            return file
        })
        const fileName = file.map((file) => {
            return file.filename
        })
        bannerData.BannerImage = fileName

        admin.editSecondBanner(bannerData, BannerId).then((response) => {

            res.redirect('/admin/banner')

        })


    },

    editLastbanner: (req, res) => {

        let BannerId = req.params.id

        console.log(req.body);
        let bannerData = req.body
        const files = req.files
        console.log(files);
        const file = files.map((file) => {
            return file
        })
        const fileName = file.map((file) => {
            return file.filename
        })
        bannerData.BannerImage = fileName

        admin.editLastBanner(bannerData, BannerId).then((response) => {

            res.redirect('/admin/banner')

        })


    }







}