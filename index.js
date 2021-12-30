
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database/controller')
let { MongoClient } = require('mongodb');
let url = "mongodb://localhost:27017";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


MongoClient.connect(url, { useUnifiedTopology: true })
  .then(connection => {
    console.log('Connected to Database')
    const db = connection.db('overview')

    // 1. GET /products
    // return products limit by 10
    app.get('/products', async (req, res) => {
      /* todo:
      1. page and count
      x. price should be imported as string
      x. drop _id
      4. reorder field
       */

      var results = await db.collection("product").find({}, {_id: 0}).project({_id: 0}).limit(10).toArray()
      if (results) {
        res.json(results)}

    })

    // 2. GET /products/:product_id
    app.get('/products/:product_id', (req, res) => {

      let productId = Number(req.params.product_id)
      // let res = {}
      let queries = [
        db.collection("product").findOne({id: productId}, {projection: {_id: 0}}),
        db.collection("featureAgg").findOne({_id: productId})
      ]


      Promise.all(queries)
        .then( results => {
          let product = results[0];
          let feature = results[1];
          let final = {}
          // let wantList = ["id", "campus","name", "slogan", "description", "category","default_price", "created_at", "updated_at"]
          // wantList.forEach(field => final[field] = product[field])
          // final["default_price"] = product["default_price"].toString()
          // final["features"] = feature["features"]
          product["features"] = feature["features"]
          res.json(product)
        })
        .catch(err => {
          console.log(err)
          res.sendStatus(500)
        })


    })

    // 3. GET /products/:product_id/styles

    app.get('/products/:product_id/styles', async (req, res) => {

      const productId = Number(req.params.product_id)

      const styles = await db.collection("stylesModified").find({productId: productId}).project({_id: 0, productId: 0}).map((doc) => {
        // doc["style_id"] = doc.id
        // delete doc.id
        if (doc["sale_price"] == "null") {
          doc["sale_price"] = null
        } else {
          doc["sale_price"] = doc["sale_price"].toString()
        }

        doc["original_price"] = doc["original_price"].toString()

        if (doc["default?"] == 0) {
          doc["default?"] = false
        } else {
          doc["default?"] = true
        }

        for (let sku in doc.skus) {
          if (sku) {
            delete doc.skus[sku]['_id']
            delete doc.skus[sku]['styleId']
            delete doc.skus[sku]['id']
          }
        }


        return doc
      }).toArray()


      let results = {}
      results["product_id"] = productId.toString()

      if (styles) {
        results["results"] = styles
      }

      res.json(results)

    })


  })






// 4. GET /products/:product_id/related



module.exports = app;

let port = 5000;
app.listen(port, function() {
  console.log(`listening on port ${port}`);
});

