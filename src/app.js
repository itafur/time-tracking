const express = require('express')
const app = express()
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Time Tracking API",
            description: "API Rest that contains endpoint related with the gestion of time records with tasks, creation of projects and association of tasks to them. Generation of Statistical reports to know the times per projects and by user. The user can see all their task, user can create a task, pause or restart it, but if you like you can create manually a new time record (that belongs to a specific task)",
            contact: {
                name: "Isaí Tafur"
            },
            servers: ["http://localhost:3000"]
        }
    },
    apis: ["app.js"]
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs))

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

/**
 * @swagger
 * /asda:
 * get:
 *  description: Endpoint base, use to show a welcome a who to enter here
 *  responses:
 *      '200':
 *          description: 'Welcome to Time Tracking'
 */
app.get('/asda', (req, res) => {
    res.send({
        message: 'Welcome to Time Tracking'
    })
})

// Routes
const Task = require('./routes/Task')
const User = require('./routes/User')
const Project = require('./routes/Project')

// Use routes
app.use('/task', Task)
app.use('/user', User)
app.use('/project', Project)


module.exports = app