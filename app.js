
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const { getProducts, getByProductId, getStyles} = require('./database/controller.js')


const url = "mongodb://localhost:27017";
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
    const product = await getByProductId(productId)
    res.status(200).send(product)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
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


// export default app
module.exports = app;
