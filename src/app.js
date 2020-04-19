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
const User = require('./routes/User')
const Project = require('./routes/Project')

// Use routes
app.use('/task', Task)
app.use('/user', User)
app.use('/project', Project)


module.exports = app