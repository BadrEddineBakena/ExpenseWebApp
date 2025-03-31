const express = require("express")
const sequelize = require("./config/database")
const users = require("./models/users")
const app = express()
const PORT = 3000

app.use(express.json())


sequelize.sync()
    .then(()=>{
        console.log('database synced and tables created  ')
        app.listen(PORT , ()=>{
            console.log(`Server running on port ${PORT}`); 
        })      
    })
    .catch((err)=>{
        console.error('Error syncing the database : ', err)
    })

app.use(express.json())


app.get('/',(req,res)=>{
    res.send("expense app is running ..")
})



