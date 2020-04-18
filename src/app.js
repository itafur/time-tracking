const express = require('express')
const app = express()

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.send({
        message: 'Welcome to Time Tracking'
    })
})

// Routes
const Task = require('./routes/Task')

// Use routes
app.use('/task', Task)


module.exports = app