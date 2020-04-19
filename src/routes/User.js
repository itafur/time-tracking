const express = require('express')
const router = express.Router()

// Models
const User = require('../model/User')

router.post('/register', (req, res) => {
    userCreate(req, res)
})

router.get('/usersAll', (req, res) => {
    getUsersAll(req, res)
})

function getUsersAll(req, res) {
    User.find({}, {}, { sort: { updatedAt: -1 } }).then((usersResults) => {
        let users = usersResults.map(u => {
            return {
                id: u._id,
                fullname: u.firstname + ' ' + u.lastname,
                createdAt: u.createdAt,
                updatedAt: u.updatedAt
            }
        })

        res.send(users)
    })
}

function userCreate(req, res) {
    // Validate parameter and field
    let validateObject = creationValidate(req.body)
    if (validateObject.isInvalid) {
        res.status(401).send({
            message: validateObject.errorMessage
        })
        return
    }

    let currentDate = (new Date())
    
    let newUser = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        createdAt: currentDate,
        updatedAt: currentDate
    })

    newUser.save().then(() => {
        res.send({
            message: 'User successfully registered'
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

    if (!body.firstname) {
        obj.isInvalid = true
        obj.errorMessage = 'Firstname is required'
    } else if (!body.lastname) {
        obj.isInvalid = true
        obj.errorMessage = 'Lastname is required'
    }

    return obj
}

module.exports = router