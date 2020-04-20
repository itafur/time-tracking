const app = require('../src/app')
const chai = require('chai')
const chaiHttp = require('chai-http')

const { expect } = chai

chai.use(chaiHttp)
describe('Task Module', () => {

    describe('Testing endpoint /task/create', () => {
        it('Case 1: Should fail because uid parameter is missing', (done) => {
            chai
            .request(app)
            .post('/task/create')
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body.message).to.equals('You must send user identification')
                done()
            })
        })

        it('Case 2: Should fail because start parameter is greater than stop parameter', (done) => {
            chai
            .request(app)
            .post('/task/create')
            .send({
                uid: '123',
                start: '2020-04-19 18:00',
                stop: '2020-04-19 17:00'
            })
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body.message).to.equals('<Start> parameter should not be greater than <stop>')
                done()
            })
        })

        it('Case 3: Should respond successfully because task was created', (done) => {
            chai
            .request(app)
            .post('/task/create')
            .send({
                uid: '5e9ba64062bb513460f6918b',
                start: '2020-04-19 18:00',
                stop: '2020-04-19 18:40'
            })
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body.message).to.equals('Task has been created')
                done()
            })
        })
    })

    describe('Testing endpoint /task/statusChange', () => {
        it('Case 1: Should fail because taskId parameter is missing', (done) => {
            chai
            .request(app)
            .put('/task/statusChange')
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body.message).to.equals('Taskid is required')
                done()
            })
        })

        it('Case 2: Should fail because action parameter is missing', (done) => {
            chai
            .request(app)
            .put('/task/statusChange')
            .send({
                taskId: '5e9c7f8a9629bf00f857b644'
            })
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body.message).to.equals('Action is required')
                done()
            })
        })

        it('Case 3: Should fail because action parameter have a incorrect value', (done) => {
            chai
            .request(app)
            .put('/task/statusChange')
            .send({
                taskId: '5e9c7f8a9629bf00f857b644',
                action: 'INCORRECTO'
            })
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body.message).to.equals('The options of the action are: RESTART or PAUSE')
                done()
            })
        })

        it('Case 4: Should fail because start parameter is greater than stop parameter', (done) => {
            chai
            .request(app)
            .put('/task/statusChange')
            .send({
                taskId: '5e9c7f8a9629bf00f857b644',
                action: 'RESTART',
                start: '2020-04-19 18:00',
                stop: '2020-04-19 17:40'
            })
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body.message).to.equals('<Start> parameter should not be greater than <stop>')
                done()
            })
        })

        it('Case 5: Should fail because taskId does not exist in database', (done) => {
            chai
            .request(app)
            .put('/task/statusChange')
            .send({
                taskId: '5e9c7f8a9746bf00f857b698',
                action: 'RESTART',
                start: '2020-04-19 16:00',
                stop: '2020-04-19 17:40'
            })
            .end((err, res) => {
                expect(res).to.have.status(501)
                expect(res.body.message).to.equals('Task id does not exist')
                done()
            })
        })

        it('Case 6: Should respond successfully because it was done status change', (done) => {
            chai
            .request(app)
            .put('/task/statusChange')
            .send({
                taskId: '5e9c7f8a9629bf00f857b644',
                action: 'RESTART',
                start: '2020-04-19 16:00',
                stop: '2020-04-19 17:40'
            })
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body.message).to.equals('Status change was applied')
                done()
            })
        })
    })

    describe('Testing endpoint /task/associateProject', () => {
        it('Case 1: Should fail because taskId parameter is missing', (done) => {
            chai
            .request(app)
            .put('/task/associateProject')
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body.message).to.equals('TaskId is required')
                done()
            })
        })

        it('Case 2: Should fail because projectId parameter is missing', (done) => {
            chai
            .request(app)
            .put('/task/associateProject')
            .send({
                taskId: '5e9c7f8a9629bf00f857b644'
            })
            .end((err, res) => {
                expect(res).to.have.status(401)
                expect(res.body.message).to.equals('ProjectId is required')
                done()
            })
        })

        it('Case 3: Should fail because taskId does not exist in database', (done) => {
            chai
            .request(app)
            .put('/task/associateProject')
            .send({
                taskId: '5e9c7f8a9746bf00f857b698',
                projectId: '5e9c7f329629bf00f857b643'
            })
            .end((err, res) => {
                expect(res).to.have.status(501)
                expect(res.body.message).to.equals('Task id does not exist')
                done()
            })
        })

        it('Case 4: Should fail because projectId does not exist in database', (done) => {
            chai
            .request(app)
            .put('/task/associateProject')
            .send({
                taskId: '5e9c7f8a9629bf00f857b644',
                projectId: '5e9c7f8a9746bf00f857b698'
            })
            .end((err, res) => {
                expect(res).to.have.status(501)
                expect(res.body.message).to.equals('Project id does not exist')
                done()
            })
        })

        it('Case 5: Should respond successfully because field projectId was update in a task', (done) => {
            chai
            .request(app)
            .put('/task/associateProject')
            .send({
                taskId: '5e9c7f8a9629bf00f857b644',
                projectId: '5e9c7f329629bf00f857b643'
            })
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body.message).to.equals('The field projectId was updated')
                done()
            })
        })
    })

    describe('Testing endpoint /task/tasksAllByUser/:uid', () => {
        it('Case 1: Should respond successfully but an empty array because uid does not exist', (done) => {
            chai
            .request(app)
            .get('/task/tasksAllByUser/isaia64062bb513460ftafur')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).instanceOf(Array).and.have.lengthOf(0)
                done()
            })
        })

        it('Case 2: Should respond successfully and with data inside to the array because uid exist', (done) => {
            chai
            .request(app)
            .get('/task/tasksAllByUser/5e9ba64062bb513460f6918b')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).instanceOf(Array).length.to.be.greaterThan(0)
                done()
            })
        })
    })

    describe('Testing endpoint /task/tasksGroupedPerProjectsByUser/:uid', () => {
        it('Case 1: Should respond successfully but an object with initialized values, because ', (done) => {
            chai
            .request(app)
            .get('/task/tasksGroupedPerProjectsByUser/isaia64062bb513460ftafur')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body.projects).instanceOf(Array).and.have.lengthOf(0)
                expect(res.body.tasksWithoutProjects).instanceOf(Object)
                expect(res.body.tasksWithoutProjects.timeSpent).to.equals(0)
                expect(res.body.tasksWithoutProjects.tasksQuantity).to.equals(0)
                expect(res.body.timeSpent).instanceOf(Object)
                expect(res.body.timeSpent.total).to.equals(0)
                expect(res.body.timeSpent.onProjects).to.equals(0)
                expect(res.body.timeSpent.free).to.equals(0)
                done()
            })
        })

        it('Case 2: Should respond successfully and the object with values get from database', (done) => {
            chai
            .request(app)
            .get('/task/tasksGroupedPerProjectsByUser/5e9c68c951ab5404f0b50e8d')
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body.projects).instanceOf(Array)
                expect(res.body.tasksWithoutProjects).instanceOf(Object)
                expect(typeof(res.body.tasksWithoutProjects.timeSpent)).to.equals('number')
                expect(typeof(res.body.tasksWithoutProjects.tasksQuantity)).to.equals('number')
                expect(res.body.timeSpent).instanceOf(Object)
                expect(typeof(res.body.timeSpent.total)).to.equals('number')
                expect(typeof(res.body.timeSpent.onProjects)).to.equals('number')
                expect(typeof(res.body.timeSpent.free)).to.equals('number')
                done()
            })
        })
    })

})