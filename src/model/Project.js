const { Schema, model } = require('mongoose')

const ProjectSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    createdAt: {
        type: Object,
        required: true
    },
    updatedAt: {
        type: Object,
        required: true
    }
})

module.exports = model('projects', ProjectSchema)