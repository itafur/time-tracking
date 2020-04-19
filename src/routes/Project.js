const express = require('express')
const router = express.Router()

// Models
const Project = require('../model/Project')
const Task = require('../model/Task')

router.post('/create', (req, res) => {
    projectCreate(req, res)
})

router.get('/projectsAll', (req, res) => {
    getProjectsAll(req, res)
})

function getProjectsAll(req, res) {
    Project.find({}, {}, { sort: { updatedAt: 1 } }).then((projectsResults) => {

        let timeSpentTotal = 0

        let projects = projectsResults.map(p => {
            return {
                id: p._id,
                name: p.name,
                timeSpent: 0,
                users: []
            }
        })

        let tasksPromises = []
        projects.forEach((p) => {
            tasksPromises.push(Task.find({ projectId: p.id }))
        })

        Promise.all(tasksPromises).then((tasksResults) => {
            let usersMap = new Map()

            projects.forEach((p, i, ar) => {
                tasksResults[i].forEach((t) => {
                    ar[i].timeSpent += t.duration
                    timeSpentTotal += t.duration
                    let userObj = usersMap.get(p.id + '_' + t.uid)
                    let userDuration = (userObj) ? (userObj.duration + t.duration) : t.duration
                    usersMap.set(p.id + '_' + t.uid, { userId: t.uid, duration: userDuration })
                })
            })

            projects.forEach((p, i, ar) => {
                usersMap.forEach((u, k)=> {
                    if (k.indexOf(p.id) > -1) {
                        ar[i].users.push({
                            id: u.userId,
                            timeSpent: u.duration
                        })
                    }
                })
            })

            res.send({
                timeSpentTotal,
                projects
            })

        })
    })
}

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