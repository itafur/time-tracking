const express = require('express')
const app = express()
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Time Tracking API",
            version: "1.0.0",
            description: "API Rest that contains endpoint related with the gestion of time records with tasks, creation of projects and association of tasks to them. Generation of Statistical reports to know the times per projects and by user. The user can see all their task, user can create a task, pause or restart it, but if you like you can create manually a new time record (that belongs to a specific task).",
            contact: {
                name: "Isaí Tafur"
            },
            servers: ["http://localhost:3000"]
        },
        paths: {
            "/": {
                "get": {
                    "tags": [
                        "Endpoint Base"
                    ],
                    summary: "Endpoint base to show a welcome message to the user.",
                    responses: {
                        "200": {
                            "description": "Welcomo to Timer Tracking."
                        }
                    }
                }
            },
            "/user/register": {
                "post": {
                    "tags": [
                        "Endpoints of User Module"
                    ],
                    summary: "Use to register a new user.",
                    parameters: [{
                        in: "body",
                        name: "firstname",
                        description: "Firstname of the user.",
                        required: true
                    }, {
                        in: "body",
                        name: "lastname",
                        description: "Lastname of the user.",
                        required: true
                    }],
                    responses: {
                        "200": {
                            "description": "User successfully registered."
                        },
                        "401": {
                            "description": "Firstname is required or Lastname is required."
                        }
                    }
                }
            },
            "/user/usersAll": {
                "get": {
                    "tags": [
                        "Endpoints of User Module"
                    ],
                    summary: "Use to get list of users all.",
                    responses: {
                        "200": {
                            "description": "Array with registered users all."
                        }
                    }
                }
            },
            "/project/create": {
                "post": {
                    "tags": [
                        "Endpoints of Project Module"
                    ],
                    summary: "Use to create a new project.",
                    parameters: [{
                        in: "body",
                        name: "name",
                        description: "Name of the project.",
                        required: true
                    }],
                    responses: {
                        "200": {
                            "description": "Project successfully created."
                        },
                        "401": {
                            "description": "Name is required."
                        }
                    }
                }
            },
            "/project/projectsAll": {
                "get": {
                    "tags": [
                        "Endpoints of Project Module"
                    ],
                    summary: "Use to get general information about projects all, the response returns time spent total by all project, also information of each project with its time spent and inside of the each project the users with theirs times.",
                    responses: {
                        "200": {
                            "description": "Object with two field, timeSpentTotal: Time spent total per all projects, projects: Array of objects, that has time spent per each project and the users with theirs time as well."
                        }
                    }
                }
            },
            "/task/create": {
                "post": {
                    "tags": [
                        "Endpoints of Task Module"
                    ],
                    summary: "Use to create a new task, may create it through of TIMER or MANUALLY.",
                    parameters: [{
                        in: "body",
                        name: "uid",
                        description: "User id (identification of user in database).",
                        required: true
                    }, {
                        in: "body",
                        name: "projectId",
                        description: "Project id (identification of project in database).",
                        required: false
                    }, {
                        in: "body",
                        name: "start",
                        description: "Initial timestamp, date and time, thereby 'yyyy-mm-dd HH:MM', used for manual mode.",
                        required: false
                    }, {
                        in: "body",
                        name: "stort",
                        description: "Final timestamp, date and time, thereby 'yyyy-mm-dd HH:MM', used for manual mode.",
                        required: false
                    }],
                    responses: {
                        "200": {
                            "description": "Task has been created."
                        },
                        "401": {
                            "description": "You must send user identification | <Start> parameter should not be greater than <stop>."
                        }
                    }
                }
            },
            "/task/statusChange": {
                "put": {
                    "tags": [
                        "Endpoints of Task Module"
                    ],
                    summary: "Use to register a time record manually, also can use to pause or restart it a task.",
                    parameters: [{
                        in: "body",
                        name: "taskId",
                        description: "Task id (identification of task in database).",
                        required: true
                    }, {
                        in: "body",
                        name: "action",
                        description: "Indicates the action to execute, may be RESTART or PAUSE, this is for when use TIMER.",
                        required: true
                    }, {
                        in: "body",
                        name: "start",
                        description: "Initial timestamp, date and time, thereby 'yyyy-mm-dd HH:MM', used for manual mode.",
                        required: false
                    }, {
                        in: "body",
                        name: "stort",
                        description: "Final timestamp, date and time, thereby 'yyyy-mm-dd HH:MM', used for manual mode.",
                        required: false
                    }],
                    responses: {
                        "200": {
                            "description": "Status change was applied."
                        },
                        "401": {
                            "description": "Taskid is required | Action is required | The options of the action are: RESTART or PAUSE | <Start> parameter should not be greater than <stop>."
                        },
                        "501": {
                            "description": "Task id does not exist."
                        }
                    }
                }
            },
            "/task/associateProject": {
                "put": {
                    "tags": [
                        "Endpoints of Task Module"
                    ],
                    summary: "Use to update a task associating it to a project, it's possible disassociate sending projectId parameter empty.",
                    parameters: [{
                        in: "body",
                        name: "taskId",
                        description: "Task id (identification of task in database).",
                        required: true
                    }, {
                        in: "body",
                        name: "projectId",
                        description: "Project id (identification of project in database), if you send this parameter empty, the task lose the link with the project.",
                        required: true
                    }],
                    responses: {
                        "200": {
                            "description": "The field projectId was updated."
                        },
                        "401": {
                            "description": "TaskId is required | ProjectId is required."
                        },
                        "501": {
                            "description": "Task id does not exist | Project id does not exist."
                        }
                    }
                }
            },
            "/task/tasksAllByUser/:userId": {
                "get": {
                    "tags": [
                        "Endpoints of Task Module"
                    ],
                    summary: "Use to get list all created tasks by user.",
                    parameters: [{
                        in: "url parameter",
                        name: "userId",
                        description: "User id (identification of user in database).",
                        required: true
                    }],
                    responses: {
                        "200": {
                            "description": "Array of objects with the information task, data such as dates (start | stop), status (STARTED or PAUSED), duration spent and respectively its id."
                        }
                    }
                }
            },
            "/task/tasksGroupedPerProjectsByUser/:userId": {
                "get": {
                    "tags": [
                        "Endpoints of Task Module"
                    ],
                    summary: "Use to get general information of how the user has distributed the times in each project, also the times of the tasks that are not associated to a project. A totalizer is displayed with the summed times of all projects, individual tasks and the time spent by everything.",
                    parameters: [{
                        in: "url parameter",
                        name: "userId",
                        description: "User id (identification of user in database).",
                        required: true
                    }],
                    responses: {
                        "200": {
                            "description": "Object with fields bellow: projects (Array of objects with information about project, id, name, time spent per user and tasks quantity), tasksWithoutProjects (it is a simple object, where it's found the tasks that it's not associates to a project, here there is information such as time spent and task quantity), timeSpent (basically it's the totalizator of everyone times spent, here there is time total, time on projects and free time)"
                        }
                    }
                }
            }
        }
    },
    apis: ["app.js"]
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs))

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
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