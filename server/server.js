require('dotenv').config();
const express = require("express")
const cors = require('cors')

const users = require("./models/Users")
const app = express()
const PORT = 3001


const { sequelize } = require('./models');
app.use(express.json())
app.use(cors());

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



app.get('/',(req,res)=>{
    res.send("expense app is running ..")
})


//routers
const usersRouter = require("./routes/Users")
app.use("/users",usersRouter)




