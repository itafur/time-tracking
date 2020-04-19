const { Schema, model } = require('mongoose')

const UserSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
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

module.exports = model('users', UserSchema)