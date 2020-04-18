const express = require('express')
const app = express()

// Models
const Task = require('./model/Task')

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.send({
        message: 'Welcome to Time Tracking'
    })
})

app.post('/task/create', (req, res) => {
    if (!req.body.task) {
        res.status(401).send({
            message: 'No se envío el parámetro task ó se envío sin ningún valor'
        })
        return
    }
    const newTask = new Task({
        task: req.body.task,
        description: req.body.description
    })
    newTask.save().then(() => {
        res.send({
            message: 'Task has been saved'
        })
    }).catch(err => {
        console.error('[13994] ', err)
        res.status(501).send({
            message: '[13994] ' + err
        })
    })
})

module.exports = app