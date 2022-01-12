// const mongoose = require('mongoose');
const { MongoClient } = require("mongodb");
const uri = 'mongodb://127.0.0.1';
const client = new MongoClient(uri)

async function run () {
  try {
    await client.connect();
    const db = client.db("overview")


    /******  Add Index ******/

    const resProduct = await db.collection("product").createIndex({id: 1}, {unique: true});
    const resFeature = await db.collection("features").createIndex({productId: 1})
    const resStyles = await db.collection("styles").createIndex({productId: 1})
    const resPhotos = await db.collection("photos").createIndex({styleId: 1})
    const resSkus = await db.collection("skus").createIndex({styleId: 1})
    const resRelated = await db.collection("related").createIndex({current_product_id: 1})
    console.log('index created:', resProduct, resFeature, resStyles, resPhotos, resSkus, resRelated)
    console.log('index created:', resRelated)


    /***** Modify Tables *****/

    // // 1. product: add dates and campus
    await db.collection("product").updateMany({}, {$set:{"campus": "hr-rpp", created_at: new Date(), updated_at: new Date()}}, upsert=false)

    // // 2. features: group by product id
    await groupFeature(client)
    // 2.1. Related: group related
    await groupRelated(client)
    console.log('done')
    //no need to create index as _id or product id is already the index

    // // 3. Styles: add photos and skus
    await stylesPhoto(client)
    const resStylesPhoto = await db.collection("stylesPhoto").createIndex({id: 1})
    console.log('index created:', resStylesPhoto)

    await stylesSku(client)
    const style1 = await db.collection("stylesModified").createIndex({style_id: 1})
    console.log('style id index created:', style1)
    const style2 = await db.collection("stylesModified").createIndex({productId: 1})
    console.log('product id index created:', style2)

  } finally {
    await client.close();
  }

}

run().catch(console.error);

async function groupFeature(client) {
  const pipeline = [
    {$group:{
        _id: "$productId",
        features: {
          $push: { feature: "$feature", value: "$value" }
        }
      }
    },
    {$out: "featureAgg"}
  ];

  const aggCursor = client.db("overview").collection("features").aggregate(pipeline, { allowDiskUse: true });

  await aggCursor.forEach(() => {
  });
}

async function groupRelated(client) {
  const pipeline = [
    {$group: {
        _id: '$current_product_id',
        related: {
          $push:"$related_product_id"
        }
      }
    },
    {$out: "relatedAgg"}
  ]

  const aggCursor = client.db("overview").collection("related").aggregate(pipeline, { allowDiskUse: true });
  await aggCursor.forEach(() => {
  });
}



async function stylesPhoto(client) {
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

async function stylesSku(client) {
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



