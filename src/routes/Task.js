const express = require('express')
const router = express.Router()

// Models
const Task = require('../model/Task')
const TimeRecord = require('../model/TimeRecord')

router.post('/create', (req, res) => {
    // Validate parameter and field
    let validateObject = validate(req.body)
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
        taskId: newTask._id
    })

    Promise.all([newTask.save(), newTimeRecord.save()]).then(() => {
        res.send({
            message: 'Task has been created'
        })
    }).catch(err => {
        console.error('[13994] ', err)
        res.status(501).send({
            message: '[13994] ' + err
        })
    })

})

function validate(body) {
    let obj = {
        isInvalid: false,
        errorMessage: ''
    }

    if (!body.uid) {
        obj.isInvalid = true
        obj.errorMessage = 'I must send user identification'
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
        let duration = Math.round((stop - start)/1000)

        obj.action = 'MANUAL'
        obj.start = start
        obj.stop = stop
        obj.duration = duration
        obj.status = 'FINISHED'
    }
    return obj
}

module.exports = router