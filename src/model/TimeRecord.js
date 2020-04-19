const { Schema, model } = require('mongoose')

const TimeRecordSchema = new Schema({
    startedAt: {
        type: Object,
        required: true
    },
    stoppedAt: {
        type: Object,
        required: false
    },
    duration: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    taskId: {
        type: String,
        required: true
    }
})

module.exports = model('time_records', TimeRecordSchema)