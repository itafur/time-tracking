const { Schema, model } = require('mongoose')

const TaskSchema = new Schema({
    name: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: true
    },
    uid: {
        type: String,
        required: true
    },
    projectId: {
        type: String,
        required: false
    },
    createdAt: {
        type: Object,
        required: true
    },
    updatedAt: {
        type: Object,
        required: true
    },
    duration: {
        type: Number,
        required: false
    }
})

module.exports = model('tasks', TaskSchema)