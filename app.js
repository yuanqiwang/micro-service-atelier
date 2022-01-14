
const express = require('express');
const bodyParser = require('body-parser');
// const { MongoClient } = require('mongodb');
const { getProducts, getByProductId, getStyles, getFeature, getRelated} = require('./database/controller.js')


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 1. GET /products
app.get('/products', async (req, res) => {
  let { page, count } = req.query

  page = page? parseInt(page): 1
  count = count? parseInt(count): 5

  try {
    const products = await getProducts(page, count)
    res.status(200).json({products})
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

// 2. GET /products/:product_id
app.get('/products/:product_id', async (req, res) => {
  const productId = Number(req.params.product_id)
  try {
    const productArray = await getByProductId(productId)
    const featureArray = await getFeature(productId)

    result = productArray[0]
    result['features'] = featureArray[0]["features"]
    res.status(200).send(result)
  } catch (err) {
    console.error(err)
    res.status(500).send("This product does not exist.")
  }

})

// 3. GET /products/:product_id/styles

 app.get('/products/:product_id/styles', async (req, res) => {

  const productId = Number(req.params.product_id)

  try {
    const styles = await getStyles(productId)

    let results = {}
    results["product_id"] = productId.toString()
    if (styles) {results["results"] = styles}

    res.status(200).send(results)

  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }

})


// 4. GET /products/:product_id/related

app.get('/products/:product_id/related', async (req, res) => {

  const productId = Number(req.params.product_id)

  try {
    const related = await getRelated(productId)

    res.status(200).send(related[0]['related'])

  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }

})

// export default app
module.exports = app;
