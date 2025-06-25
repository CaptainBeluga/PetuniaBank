const express = require("express")

const app = express()

const dotenv = require("dotenv")
dotenv.config()


const path = require("path")

app.use(express.static(path.join(__dirname, "static")))

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "templates"))


app.get("/moved", (req, res) => {
    res.render("moved")
})


//404 error handler
app.use((req, res) => {
    res.redirect("/moved")
})

app.listen(3000, () => {
    console.log(`Server running on ${process.env.BASE_URL}`)
})    