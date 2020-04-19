const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://itafur:itafur@cluster0-4avrn.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Database is connected.')
}).catch(err => {
    console.error(err)
})