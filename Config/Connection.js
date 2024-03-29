const mongoClient=require('mongodb').MongoClient

const state ={
    db:null
}

module.exports.connect=function(done){
const url="mongodb://localhost:27017"
const dbName="FirstProject"

mongoClient.connect(process.env.DATABASE_URL || url,(err,data)=>{

    if(err){ return done(err)}
   
   state.db=data.db(dbName)
   done()
})

}

module.exports.get=function(){
    return state.db
}