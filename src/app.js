//THIS FILE IS USED FOR EXPRESS USE
import express from "express"
import bodyParser from "body-parser";


const app = express();


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


export { app }