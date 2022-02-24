
const express = require('express');
const bodyParser = require('body-parser');
const { getProducts, getByProductId, getStyles, getFeature, getRelated} = require('./database/controller.js')
const redis = require('redis')
const compression = require('compression')

const app = express();
app.use(compression())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const client = redis.createClient(6379);
const DEFAULT_EXPIRATION = 3600;
client.on('connect', () => {
  console.log('[*] Redis connected.');
});

client.on('error', (err) => {
  if (err) {console.log(err)}
});

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
app.get('/products/:product_id', (req, res) => {
  const productId = Number(req.params.product_id)

  try {
    client.get(`product:${productId}`, async (error, product) => {
      if (error) { console.log(error)}
      if (product) {
        return res.status(200).send(JSON.parse(product))
      } else {
        const productArray = await getByProductId(productId)
        const featureArray = await getFeature(productId)
        result = productArray[0]
        result['features'] = featureArray[0]["features"]

        client.set(`product:${productId}`, JSON.stringify(result))
        return res.status(200).send(result)
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).send("This product does not exist.")
  }

})

// 3. GET /products/:product_id/styles

 app.get('/products/:product_id/styles', async (req, res) => {

  const productId = Number(req.params.product_id)

  try {
    client.get(`product:${productId}:styles`, async (err, result) => {
      if (err) {console.log(err)}
      if (result) {
        return res.status(200).send(result)
      }
      else {
        const style = await getStyles(productId)
        let result = {}
        result["product_id"] = productId.toString()
        if (style) {
          result["results"] = style
        }
        client.setex(`product:${productId}:styles`, DEFAULT_EXPIRATION, JSON.stringify(result))
        res.status(200).send(result)
      }
    })

  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }

})


// 4. GET /products/:product_id/related

app.get('/products/:product_id/related', async (req, res) => {

  const productId = Number(req.params.product_id)

  try {
    client.get(`product:${productId}:related`, async (err, result) => {
      if (err) {console.log(err)}
      if (result) {
        return res.status(200).send(result)
      }
      else {
        const related = await getRelated(productId)
        client.setex(`product:${productId}:related`, DEFAULT_EXPIRATION, JSON.stringify(related[0]['related']))
        res.status(200).send(related[0]['related'])
      }
    })
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }

})

// 5. LOADER IO setup
app.get('/loaderio-2613513a0f739518f82e2adcb7bfbca6', (req, res) => {
  res.send('loaderio-2613513a0f739518f82e2adcb7bfbca6')
})

app.get('/loaderio-b009c8df6e04527549b850f8d6c24fa1', (req, res) => {
  res.send('loaderio-b009c8df6e04527549b850f8d6c24fa1')
})

// export default app
module.exports = app;
