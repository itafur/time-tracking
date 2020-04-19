const express = require('express')
const router = express.Router()

// Models
const Project = require('../model/Project')

router.post('/create', (req, res) => {
    projectCreate(req, res)
})

function projectCreate(req, res) {
    // Validate parameter and field
    let validateObject = creationValidate(req.body)
    if (validateObject.isInvalid) {
        res.status(401).send({
            message: validateObject.errorMessage
        })
        return
    }

    let currentDate = (new Date())
    
    let newProject = new Project({
        name: req.body.name,
        createdAt: currentDate,
        updatedAt: currentDate
    })

    newProject.save().then(() => {
        res.send({
            message: 'Project successfully created'
        })
    }).catch(err => {
        res.status(501).send({
            message: err
        })
    })
}

function creationValidate(body) {
    let obj = {
        isInvalid: false,
        errorMessage: ''
    }

    if (!body.name) {
        obj.isInvalid = true
        obj.errorMessage = 'Name is required'
    }

    return obj
}

module.exports = router