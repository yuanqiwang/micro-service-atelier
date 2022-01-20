const dotenv = require('dotenv')
dotenv.config()

const mongoose = require('mongoose');
const {MongoClient} = require("mongodb");

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@54.175.13.113/overview?authSource=admin`
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
    // cursor = await product.find({id: {$gte: start, $lt: end} }).project({_id: 0})

  } catch (e) {
    console.error(`Unable to issue find command, ${e}`)
    return []
  }

  return cursor.toArray()

}


const getByProductId = async (productId) => {

  const product = db.collection("product");

  try {
    cursor = await product.find({id: productId}).project({_id: 0}).limit(1) //limit 1 is not necessary but just in case
    return cursor.toArray()
  } catch (e) {
    console.error(`Unable to issue find command, ${e}`)
    return []
  }


}


const getFeature = async (productId) => {

  const featureAgg = db.collection("featureAgg");

  try {
    cursor = await featureAgg.find({_id: productId}).limit(1)
    return cursor.toArray()
  } catch (e) {
    console.error(`Unable to issue find command, ${e}`)
    return []
  }

}


const getStyles = (productId) => {

  const stylesModified = db.collection("stylesModified");

  return stylesModified.find({productId: productId}).project({_id: 0, productId: 0}).map((doc) => {

    doc["default?"] = doc["default?"] == 0 ? false: true
    doc["sale_price"] = doc["sale_price"] = "null"? null: doc["sale_price"]

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

const getRelated = async (productId) => {

  const relatedAgg = db.collection("relatedAgg");

  try {
    cursor = await relatedAgg.find({_id: productId}).project({_id: 0})
    return cursor.toArray()
  } catch (e) {
    console.error(`Unable to issue find command, ${e}`)
    return []
  }

}

module.exports = {getProducts, getByProductId, getStyles, getFeature, getRelated}
