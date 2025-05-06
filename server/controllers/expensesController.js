const Expenses = require("../models/Expenses");
const { generateToken } = require("../middlewares/tokenGen");

const addExpense = async(req,res)=>{
    try {
        const newExpense = await Expenses.create(req.body)
        res.status(201).json(newExpense)
    } catch (err) {
        res.status(500).json({error:err.message})
    }
}



module.exports = {
    addExpense
}