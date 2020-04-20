const app = require('../src/app')
const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')

const { expect } = chai

chai.use(chaiHttp)
describe('User Module', () => {
    describe('Testing endpoint /user/register', () => {
        it('Case 1: Should fail because firsname parameter is missing', (done) => {
            chai
            .request(app)
            .post('/user/register')
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body.message).to.equals('Firstname is required')
                done()
            })
        })
        
        it('Case 2: Should fail because lastname parameter is missing', (done) => {
            chai
            .request(app)
            .post('/user/register')
            .send({
                firstname: 'Carlos'
            })
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body.message).to.equals('Lastname is required')
                done()
            })
        })

        it('Case 3: Should respond successfully because user was created', (done) => {
            chai
            .request(app)
            .post('/user/register')
            .send({
                firstname: 'Usuario',
                lastname: 'Prueba'
            })
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body.message).to.equals('User successfully registered')
                done()
            })
        })
    })

    describe('Testing endpoint /user/usersAll', () => {
        it('Case 1: Should respond successfully returning array of users', (done) => {
            chai
            .request(app)
            .get('/user/usersAll')
            .end((err, res) => {
                expect(res).to.have.status(200)
                done()
            })
        })
    })

    after((done) => {
        console.log("Disconnecting to the database...")
        mongoose.disconnect().then(() => {
            console.log("Database was disconnected.")
            done()
        })
    })

})