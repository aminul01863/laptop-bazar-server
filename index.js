const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors')
const ObjectID = require('mongodb').ObjectID
const bodyParser = require('body-parser')
require('dotenv').config()
const port = process.env.PORT || 4040



app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4p4eq.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri)
app.get('/', (req, res) => {
    res.send('Hello World!')
})




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const shoppingCollection = client.db("shopping").collection("products");
    const cartProductCollection = client.db("shopping").collection("addCart");
    const orderCollection = client.db("shopping").collection("Order");


    app.get('/product', (req, res) => {
        shoppingCollection.find()
            .toArray((err, items) => {
                res.send(items)

            })
    })

    app.post('/addProduct', (req, res) => {
        const newProduct = req.body;
        console.log('add hoyce', newProduct)
        shoppingCollection.insertOne(newProduct)
            .then(result => {
                res.send(result.insertedCount > 0)
            })

    })

    app.post('/addCart', (req, res) => {
        cartProductCollection.insertOne(req.body)
            .then(result => {
                console.log(result);
            })
    })
    app.get('/cartProducts/:email', (req, res) => {
        const { email } = req.params
        cartProductCollection.find({ email })
            .toArray((error, result) => {
                res.send(result)
                // console.log(result);
            })
    })
    app.post('/productsDetailId', async (req, res) => {
        console.log(await req.body);
        const productId = await req.body
        const productDetail = productId.map(item => {
            return ObjectID(item)
        })
        shoppingCollection.find({ _id: { $in: productDetail } })
            .toArray((error, result) => {
                console.log(error);
                res.send(result)
            })
    })
    app.post('/submitOrder', (req, res) => {
        orderCollection.insertOne(req.body)
            .then(result => {
                console.log('added', result);
                cartProductCollection.deleteMany({ email: req.body.email })
                    .then(result => {
                        console.log('deleted', result);
                    })
            })

    })


    app.delete("/deleteEvent/:id", (req, res) => {
        const id = ObjectID(req.params.id);
        console.log("delete", id);
        shoppingCollection.findOneAndDelete({ _id: id })
            .then(docs => {
                res.send(!!docs.value[0])
            });
    });

    app.get('/getOrder/:email', (req, res) => {
        const { email } = req.params
        orderCollection.find({ email })
            .toArray((error, result) => {
                res.send(result)
            })
    })

});



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})