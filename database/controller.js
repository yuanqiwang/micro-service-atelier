const mongoose = require('mongoose');
// const MongoClient = require("mongodb");

const uri = 'mongodb://127.0.0.1/overview';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection;

const getProducts = async (page = 1, count = 5) => {

  let cursor
  let productList = []
  let start = (page - 1) * count + 1
  let end = start + count //exclusive
  for (i = start; i < end; i++) {
    productList.push(i)
  }
  const product = db.collection("product");

  try {
    cursor = await product.find({id: {$in: productList}}).project({_id: 0})
  } catch (e) {
    console.error(`Unable to issue find command, ${e}`)
    return []
  }

  return cursor.toArray()

  // return product.find({id: {$in: productList}}).project({_id: 0}).limit(limitCnt).toArray()

}

const getByProductId = (productId) => {

  const featureAgg = db.collection("featureAgg");
  const product = db.collection("product");

  let queries = [
    product.findOne({id: productId}, {projection: {_id: 0}}),
    featureAgg.findOne({_id: productId})
  ]

  return Promise.all(queries)
    .then( results => {
      let product = results[0];
      let feature = results[1];
      product["default_price"] = product["default_price"].toString()
      product["features"] = feature["features"]
      return product
    })

}

const getStyles = (productId) => {

  const stylesModified = db.collection("stylesModified");

  return stylesModified.find({productId: productId}).project({_id: 0, productId: 0}).map((doc) => {
    doc["sale_price"] = doc["sale_price"] == "null" ? null: doc["sale_price"].toString()
    doc["original_price"] = doc["original_price"].toString()
    doc["default?"] = doc["default?"] == 0 ? false: true

    for (let sku in doc.skus) {
      if (sku) {
        delete doc.skus[sku]['_id']
        delete doc.skus[sku]['styleId']
        delete doc.skus[sku]['id']
      }
    }

    return doc
  }).toArray()

}


module.exports.getProducts = getProducts
module.exports.getByProductId = getByProductId
module.exports.getStyles = getStyles

