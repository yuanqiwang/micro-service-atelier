// const mongoose = require('mongoose');
const { MongoClient } = require("mongodb");
const uri = 'mongodb://127.0.0.1';
const client = new MongoClient(uri)

async function run () {
  try {
    await client.connect();
    const db = client.db("overview")

    // const product = db.collection("product");
    // const features = db.collection("features");
    // const photos = db.collection("photos");
    // const skus = db.collection("skus");
    // // const styles = db.collection("styles");

    // /******  Add Index ******/

    // // const resProduct = await product.createIndex({id: 1}, {unique: true});
    // // const resFeature = await features.createIndex({productId: 1})
    // // const resStyles = await styles.createIndex({productId: 1})
    // // const resPhotos = await photos.createIndex({styleId: 1})
    // const resSkus = await skus.createIndex({styleId: 1})
    // // const resSkus = await skus.createIndex({styleId: 1, id: 1})
    // // console.log('index created:', resProduct, resFeature, resStyles, resPhotos, resSkus)
    // console.log('index created:', resSkus)
    // /***** Modify Tables *****/

    // // 1. product: add dates and campus
    // // await product.updateMany({}, {$set:{"campus": "hr-rpp", created_at: new Date(), updated_at: new Date()}}, upsert=false)

    // // 2. features: group by product id
    // // await groupFeature(client)
    // // 3. Styles: add photos and skus

    // // await modifyStyle(client)
    // const resStylesPhoto = await db.collection("stylesPhoto").createIndex({id: 1})
    // console.log('index created:', resStylesPhoto)

    // await modifyStyleSku(client)

    // const style1 = await db.collection("stylesModified").createIndex({style_id: 1})
    // console.log('index created:', style1)

    // const style2 = await db.collection("stylesModified").createIndex({productId: 1})
    // console.log('index created:', style2)

    // 4. clean up value type
    // await cleanProduct(client)
    // await cleanStyle(client)

  } finally {
    await client.close();
  }

}

run().catch(console.error);

async function groupFeature(client) {
  const pipeline = [
    {$group:
      {
        _id: "$productId",
        features: {
          $push: { feature: "$feature", value: "$value" }
        }
      }
    },
    {$out: "featureAgg"}
  ];

  // See https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#aggregate for the aggregate() docs
  const aggCursor = client.db("overview").collection("features").aggregate(pipeline, { allowDiskUse: true });

  await aggCursor.forEach(feature => {
      // console.log(`${feature._id}: grouped`);
  });
}

async function modifyStyle(client) {
  const pipeline = [
    {
      '$lookup': {
        'from': 'photos',
        'localField': 'id',
        'foreignField': 'styleId',
        'as': 'photos'
      }
    }, {
      '$project': {
        '_id': 0,
        'photos._id': 0,
        'photos.id': 0,
        'photos.styleId': 0
      }
    },
    {$out: "stylesPhoto"}
  ]

  const aggCursor = client.db("overview").collection("styles").aggregate(pipeline, { allowDiskUse: true });

  await aggCursor.forEach(feature => {
      // console.log(`${feature._id}: grouped`);
  });
}

async function modifyStyleSku(client) {
  const pipeline = [

    {
      '$lookup': {
        'from': 'skus',
        'localField': 'id',
        'foreignField': 'styleId',
        'as': 'skus'
      }
    },
    {
      '$project': {
        'productId': 1,
        'style_id': '$id',
        'name': 1,
        'original_price': 1,
        'sale_price': 1,
        'default?': '$default_style',
        'photos': 1,
        'skus': {
          '$arrayToObject': {
            '$map': {
              'input': '$skus',
              'as': 'el',
              'in': {
                'k': '$$el.id',
                'v': '$$el'
              }
            }
          }
        }
      }
    },
    {$out: "stylesModified"}
  ]

  const aggCursor = client.db("overview").collection("stylesPhoto").aggregate(pipeline, { allowDiskUse: true });

  await aggCursor.forEach(feature => {
      // console.log(`${feature._id}: grouped`);
  });
}

async function cleanStyle(client) {
  const stylesModified = client.db("overview").collection("stylesModified")

  await stylesModified.find({}).forEach( (doc) => {
      if (doc.skus) {
        for (let sku in doc.skus) {
          if (sku) {
            delete doc.skus.sku['_id']
            delete doc.skus.sku['styleId']
            delete doc.skus.sku['id']
          }
        }
      }


  });
}



