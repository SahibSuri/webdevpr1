const express = require("express")
const app = express()
const mongoose = require("mongoose")
const Listing = require("./models/listing.js")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")


const port = 5000
const path = require("path")

const mongo_url = "mongodb://127.0.0.1:27017/wanderlust"
main().then(()=>{
    console.log("connected to db")
}).catch((err)=>{
    console.log(err)
})

async function  main(){
    await mongoose.connect(mongo_url)
}

app.set("view engine" , "ejs")
app.set("views" , path.join(__dirname , "views"))
app.use(express.urlencoded({extended : true}))
app.use(methodOverride("_method"))
app.engine('ejs', ejsMate)
app.use(express.static(path.join(__dirname , "/public")))


//simple route to check
app.get("/" , (req,res) =>{
    res.send("Hi i am working")
})


//index route
app.get("/listing" , async (req,res) =>{
    const allListings = await Listing.find({})
    res.render("./listings/index.ejs" , {allListings})
})

//NEW ROUTE
//new route get req to /listing/new jisme hume form milega ek new listing create karne ke liye uske baad jab submit karenge toh jo second req jayegi voh create route par jayegi aur jo create route hoga voh post req lega
app.get("/listing/new" , (req,res)=>{
    res.render("listings/new.ejs")
})

//SHOW Route
//show route kisi bhi individual listing ka pura data print karwana will use CRUD /listing/:id
app.get("/listing/:id" , async (req,res)=>{
    let {id} = req.params
    const listing = await Listing.findById(id)
    res.render("listings/show.ejs" , {listing})
})
//CREATE  ROUTE
app.post("/listing" , async (req,res) => {
    const newListing = new Listing(req.body.listing)
    await newListing.save()
    res.redirect("/listing")
})


//Update => edit and update routs, edit ke andar get route hoga listing/:id/edit hame edit karne ke liye ek for ko render karna hai aur jaise hi form ko submit karenge viase hi humwe next req jayenge that will be a put req /listing/:id ke paas jane wali hai
//edit route
app.get("/listing/:id/edit" , async(req,res) =>{
    let {id} = req.params
    const listing = await Listing.findById(id)
    res.render("listings/edit.ejs" , {listing})
})
//Update route
app.put("/listing/:id", async (req,res) =>{
    let { id } = req.params
    const listing = await Listing.findById(id)
    
    // If image not present in form, retain old image
    if (!req.body.listing.image) {
        req.body.listing.image = listing.image
    }
    
    await Listing.findByIdAndUpdate(id , {...req.body.listing})
    res.redirect("/listing")
})


//DELETE route
//delete route mai hhumare paas del req aayegi /listing/:id ke paas jis bhi id ke paas ayegi use delete kar denge
app.delete("/listing/:id" , async(req,res) =>{
    let { id } = req.params
    let deletedListing = await Listing.findByIdAndDelete(id)
    console.log(deletedListing)
    res.redirect("/listing")
})




app.listen(port , ()=>{
    console.log(`app is listening on ${port}`)
})