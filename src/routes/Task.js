const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

// Models
const Task = require('../model/Task')
const TimeRecord = require('../model/TimeRecord')
const Project = require('../model/Project')

router.post('/create', (req, res) => {
    taskCreate(req, res)
})

router.put('/statusChange', (req, res) => {
    statusChange(req, res)
})

router.put('/associateProject', (req, res) => {
    associateProjectByTask(req, res)
})

router.get('/tasksAllByUser/:uid', (req, res) => {
    getTasksAllByUser(req, res)
})

router.get('/tasksGroupedPerProjectsByUser/:uid', (req, res) => {
    getTasksGroupedPerProjectsByUser(req, res)
})

function getTasksGroupedPerProjectsByUser(req, res) {
    let uid = req.params.uid
    try {
        Task.find({ uid: uid }).then((tasksResult) => {
            if (tasksResult.length === 0) {
                res.send({
                    projects: [],
                    tasksWithoutProjects: {
                        timeSpent: 0,
                        tasksQuantity: 0
                    },
                    timeSpent: {
                        total: 0,
                        onProjects: 0,
                        free: 0
                    }
                })
                return
            }

            let projectsMap = new Map()
            let projectsPromises = []
            let timeSpent = {
                total: 0,
                onProjects: 0,
                free: 0
            }

            projectsMap.set('WITHOUT_PROJECT', {
                timeSpent: 0,
                tasksQuantity: 0
            })

            tasksResult.forEach((t) => {
                let obj = projectsMap.get(t.projectId)
                if (t.projectId && !obj) {
                    projectsPromises.push(Project.findById({ _id: mongoose.Types.ObjectId(t.projectId) }))
                }
                let key = (t.projectId) ? t.projectId : 'WITHOUT_PROJECT'
                let _timeSpent = (obj) ? (obj.timeSpent + t.duration) : t.duration
                let _tasksQuantity = (obj) ? (obj.tasksQuantity + 1) : 1
                timeSpent.total += t.duration
                if (key === 'WITHOUT_PROJECT') {
                    timeSpent.free += t.duration
                } else {
                    timeSpent.onProjects += t.duration
                }
                projectsMap.set(key, {
                    timeSpent: _timeSpent,
                    tasksQuantity: _tasksQuantity
                })
            })

            if (projectsPromises.length === 0) {
                res.send({
                    projects: [],
                    tasksWithoutProjects: projectsMap.get('WITHOUT_PROJECT'),
                    timeSpent
                })
                return
            }

            Promise.all(projectsPromises).then((projectsResults) => {
                let projects = []
                
                projectsResults.forEach((p) => {
                    let obj = projectsMap.get(String(p._id))
                    projects.push({
                        id: p._id,
                        name: p.name,
                        timeSpent: (obj) ? obj.timeSpent : 0,
                        tasksQuantity: (obj) ? obj.tasksQuantity : 0
                    })
                })

                res.send({
                    projects,
                    tasksWithoutProjects: projectsMap.get('WITHOUT_PROJECT'),
                    timeSpent
                })
            })

        })
    } catch (err) {
        res.status(501).send({
            message: err
        })
    }
}

function getTasksAllByUser(req, res) {
    let uid = req.params.uid
    try {
        Task.find({ uid: uid }, {}, { sort: { updatedAt: -1 } }).then((tasksResult) => {
            if (tasksResult.length === 0) {
                res.send([])
                return
            }

            let tasks = tasksResult.map(t => {
                return {
                    id: t._id,
                    name: t.name,
                    status: t.status,
                    projectId: t.projectId,
                    duration: t.duration,
                    timeRecords: []
                }
            })

            let timeRecordsPromises = []
            tasks.forEach((t) => {
                timeRecordsPromises.push(TimeRecord.find({ taskId: t.id }, {}, { sort: { startedAt: -1 } }))
            })

            Promise.all(timeRecordsPromises).then((timeRecordsResults) => {

                tasks.forEach((t, i, ar) => {
                    let timeRecords = timeRecordsResults[i].map(tr => {
                        return {
                            id: tr._id,
                            startedAt: tr.startedAt,
                            stoppedAt: tr.stoppedAt,
                            status: tr.status,
                            duration: tr.duration
                        }
                    })

                    ar[i].timeRecords = timeRecords
                })

                res.send(tasks)
            })
        })
    } catch (err) {
        res.status(501).send({
            message: err
        })
    }
}

function statusChange(req, res) {
    // Validate parameter and field
    let validateObject = statusChangeValidate(req.body)
    if (validateObject.isInvalid) {
        res.status(401).send({
            message: validateObject.errorMessage
        })
        return
    }

    try {
        Task.findById({ _id: mongoose.Types.ObjectId(req.body.taskId) }).then((snapshot) => {
            if (!snapshot) {
                res.status(501).send({
                    message: 'Task id does not exist'
                })
                return
            }

            let data = {
                status: (snapshot.status === 'PAUSED') ? 'STARTED' : 'PAUSED',
                updatedAt: (new Date()),
                duration: snapshot.duration
            }

            if (snapshot.status === 'PAUSED') {
                let execution = getExecution(req.body)

                if (execution.action === 'MANUAL') {
                    data.status = 'PAUSED'
                }

                data.duration += execution.duration

                let newTimeRecord = new TimeRecord({
                    startedAt: execution.start,
                    stoppedAt: execution.stop,
                    duration: execution.duration,
                    status: execution.status,
                    taskId: req.body.taskId
                })

                let taskPromise = Task.updateOne({ _id: mongoose.Types.ObjectId(req.body.taskId) }, { $set: data })

                let timeRecordPromise = newTimeRecord.save()
            
                Promise.all([taskPromise, timeRecordPromise]).then(() => {
                    res.send({
                        message: 'Status change was applied'
                    })
                }).catch(err => {
                    res.status(501).send({
                        message: err
                    })
                })

            } else if (snapshot.status === 'STARTED') {
                TimeRecord.findOne({taskId: req.body.taskId, status: "CREATED" }).then((result) => {
                    let currentDate = (new Date())

                    let duration = durationCalculate((new Date(result.startedAt)), currentDate)

                    data.duration += duration

                    let taskPromise = Task.updateOne({ _id: mongoose.Types.ObjectId(req.body.taskId) }, { $set: data })

                    let timeRecordPromise = TimeRecord.updateOne({ _id: mongoose.Types.ObjectId(result._id) }, { $set: { stoppedAt: currentDate, duration: duration, status: 'FINISHED' }})
                
                    Promise.all([taskPromise, timeRecordPromise]).then(() => {
                        res.send({
                            message: 'Status change was applied'
                        })
                    }).catch(err => {
                        res.status(501).send({
                            message: err
                        })
                    })
                })
            }

        })
    } catch (err) {
        res.status(501).send({
            message: err
        })
    }
}

function associateProjectByTask(req, res) {
    // Validate parameter and field
    let validateObject = associateProjectValidate(req.body)
    if (validateObject.isInvalid) {
        res.status(401).send({
            message: validateObject.errorMessage
        })
        return
    }

    try {
        let taskFind = Task.findById({ _id: mongoose.Types.ObjectId(req.body.taskId) })
        let projectFind = Project.findById({ _id: mongoose.Types.ObjectId(req.body.projectId) })

        Promise.all([taskFind, projectFind]).then((callback) => {
            let task = callback[0]
            let project = callback[1]
            if (!task) {
                res.status(501).send({
                    message: 'Task id does not exist'
                })
                return
            }
            if (!project) {
                res.status(501).send({
                    message: 'Project id does not exist'
                })
                return
            }

            Task.updateOne({ _id: mongoose.Types.ObjectId(req.body.taskId) }, { $set: { projectId: req.body.projectId }}).then(() => {
                res.send({
                    message: 'The field projectId was updated'
                })
            })
        }).catch(err => {
            res.status(501).send({
                message: err
            })
        })
    } catch (err) {
        res.status(501).send({
            message: err
        })
    }
}

function taskCreate(req, res) {
    // Validate parameter and field
    let validateObject = creationValidate(req.body)
    if (validateObject.isInvalid) {
        res.status(401).send({
            message: validateObject.errorMessage
        })
        return
    }

    let execution = getExecution(req.body)
    let currentDate = (new Date())
    
    let newTask = new Task({
        name: (req.body.name) ? req.body.name : '',
        status: (execution.action === 'TIMER') ? 'STARTED' : 'PAUSED',
        uid: req.body.uid,
        projectId: (req.body.projectId) ? req.body.projectId : '',
        createdAt: currentDate,
        updatedAt: currentDate,
        duration: execution.duration
    })

    let newTimeRecord = new TimeRecord({
        startedAt: execution.start,
        stoppedAt: execution.stop,
        duration: execution.duration,
        status: execution.status,
        taskId: newTask._id
    })

    Promise.all([newTask.save(), newTimeRecord.save()]).then(() => {
        res.send({
            message: 'Task has been created'
        })
    }).catch(err => {
        res.status(501).send({
            message: err
        })
    })
}

function statusChangeValidate(body) {
    let obj = {
        isInvalid: false,
        errorMessage: ''
    }

    if (!body.taskId) {
        obj.isInvalid = true
        obj.errorMessage = 'Taskid is required'
    } else if (!body.action) {
        obj.isInvalid = true
        obj.errorMessage = 'Action is required'
    } else if (body.action !== 'RESTART' && body.action !== 'PAUSE') {
        obj.isInvalid = true
        obj.errorMessage = 'The options of the action are: RESTART or PAUSE'
    } else if (body.action === 'RESTART' && body.start && body.stop) {
        let start = (new Date(body.start)).getTime()
        let stop = (new Date(body.stop)).getTime()
        if (start > stop) {
            obj.isInvalid = true
            obj.errorMessage = '<Start> parameter should not be greater than <stop>'
        }
    }

    return obj
}

function associateProjectValidate(body) {
    let obj = {
        isInvalid: false,
        errorMessage: ''
    }

    if (!body.taskId) {
        obj.isInvalid = true
        obj.errorMessage = 'TaskId is required'
    } else if (!body.hasOwnProperty('projectId')) {
        obj.isInvalid = true
        obj.errorMessage = 'ProjectId is required'
    }

    return obj
}

function creationValidate(body) {
    let obj = {
        isInvalid: false,
        errorMessage: ''
    }

    if (!body.uid) {
        obj.isInvalid = true
        obj.errorMessage = 'You must send user identification'
    } else if (body.start && body.stop) {
        let start = (new Date(body.start)).getTime()
        let stop = (new Date(body.stop)).getTime()
        if (start > stop) {
            obj.isInvalid = true
            obj.errorMessage = '<Start> parameter should not be greater than <stop>'
        }
    }

    return obj
}

function getExecution(body) {
    let obj = {
        action: 'TIMER',
        duration: 0,
        start: (new Date()),
        stop: null,
        status: 'CREATED'
    }
    if (body.start && body.stop) {
        let start = (new Date(body.start))
        let stop = (new Date(body.stop))
        obj.action = 'MANUAL'
        obj.start = start
        obj.stop = stop
        obj.duration = durationCalculate(start, stop)
        obj.status = 'FINISHED'
    }
    return obj
}

function durationCalculate(start, stop) {
    return Math.round((stop - start)/1000)
}

module.exports = router