const app = require('../src/app')
const chai = require('chai')
const chaiHttp = require('chai-http')

const { expect } = chai

chai.use(chaiHttp)
describe('Project Module', () => {
    describe('Testing endpoint /project/create', () => {
        it('Case 1: Should fail because name parameter is missing', (done) => {
            chai
            .request(app)
            .post('/project/create')
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body.message).to.equals('Name is required')
                done()
            })
        })

        it('Case 2: Should respond successfully because project was created', (done) => {
            chai
            .request(app)
            .post('/project/create')
            .send({
                name: 'Project de prueba'
            })
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body.message).to.equals('Project successfully created')
                done()
            })
        })
    })

    describe('Testing endpoint /project/projectsAll', () => {
        it('Case 1: Should respond successfully returning object as response', (done) => {
            chai
            .request(app)
            .get('/project/projectsAll')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.have.property('timeSpentTotal').to.be.greaterThan(-1)
                expect(res.body).to.have.property('projects').instanceOf(Array)
                done()
            })
        })
    })

})