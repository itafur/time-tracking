const { Schema, model } = require('mongoose')

const TimeRecordSchema = new Schema({
    startedAt: {
        type: Object,
        required: true
    },
    stoppedAt: {
        type: Object,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    taskId: {
        type: String,
        required: true
    }
})

module.exports = model('timeRecords', TimeRecordSchema)