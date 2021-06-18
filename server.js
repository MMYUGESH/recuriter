const express = require('express');
const app = express();
const mongodb = require('mongodb');
require('dotenv').config();
const bcrypt = require('bcryptjs');
var cors = require("cors");



const mongoClient = mongodb.MongoClient;
app.use(express.json());
app.use(cors());


const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017";
const port = process.env.PORT || 4000


//get all users
app.get('/', async (req, res) => {

    try {
        let clientInfo = await mongoClient.connect(dbUrl);
        let db = clientInfo.db("recuriter");
        let data = await db.collection("users").find().project({ password: 0 }).toArray();
        res.status(200).json(data);
        clientInfo.close();
    }
    catch (error) {
        console.log(error);
    }
})

app.post('/signup', async (req, res) => {
    try {
        let clientInfo = await mongoClient.connect(dbUrl);
        let db = clientInfo.db("recuriter");

        // if (req.body.position === "recuriter") {
        let found = await db.collection("users").findOne({ email: req.body.email });
        if (found) {
            res.status(400).json({ message: "user already exists" })
        } else {
            let salt = await bcrypt.genSalt(10);
            let hash = await bcrypt.hash(req.body.password, salt);
            req.body.password = hash;
            await db.collection('users').insertOne(req.body);
            res.status(200).json({ message: "user registered" });

        }
        //} else {
        //   res.status(400).json({ message: "Signup is for recuriters" })

        // }
        clientInfo.close();
    }
    catch (error) {
        console.log(error);
    }
})

app.post('/login', async (req, res) => {
    try {
        let clientInfo = await mongoClient.connect(dbUrl);
        let db = clientInfo.db("recuriter");
        let found = await db.collection("users").findOne({ email: req.body.email });

        if (found) {
            let isValid = await bcrypt.compare(req.body.password, found.password)
            if (isValid) {
                //OK
                res.status(200).json({ message: "login successful" })
            } else {
                //401 Unauthorized
                res.status(401).json({ message: "login Unsuccessful" })
            }
        } else {

            res.status(404).json({ message: "user not registered" })
        }

        clientInfo.close();
    }
    catch (error) {
        console.log(error);
    }
})


app.listen(port, () => console.log("Apps runs with", port));