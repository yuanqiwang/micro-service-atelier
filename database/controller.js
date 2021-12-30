const mongoose = require('mongoose');
// const MongoClient = require("mongodb");

const uri = 'mongodb://127.0.0.1/overview';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection;
const product = db.collection("product");
const features = db.collection("features");

let findProduct = (productId, cb) => {
  return product.find({id: productId}).exec(cb)
}

let findFeature = (productId, cb) => {
  return features.find({productId: productId}, cb)
}


module.exports.findProduct = findProduct
module.exports.findFeature = findFeature