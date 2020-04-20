const app = require('../src/app')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')

const { expect } = chai

chai.use(chaiHttp)

before((done) => {
    console.log("Connecting to the database...")
    mongoose.connect('mongodb+srv://itafur:itafur@cluster0-4avrn.mongodb.net/test?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log("Database is connected.")
        done()
    }).catch(err => {
        console.error(err)
    })
})

describe('Units Test of API Time Tracking', () => {

    it('Testing / welcome to the API Time Tracking', (done) => {
        chai
        .request(app)
        .get('/')
        .end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body.message).to.equals('Welcome to Time Tracking')
            done()
        })
    })

})