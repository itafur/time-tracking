const { Schema, model } = require('mongoose')

const TaskSchema = new Schema({
    task: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    }
})

module.exports = model('task', TaskSchema)