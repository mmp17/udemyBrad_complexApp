const http = require('http')
const express = require('express')
const router = require('./router')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const markDown = require('marked')

//---------------
const myapp = express()
let sessionOpt = session({
    secret: 'JS is cool',
    store: new MongoStore({ client: require('./db') }),
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60, httpOnly: true }
})

myapp.use(flash())
myapp.use(sessionOpt)
myapp.use(express.urlencoded({ extended: true }))
myapp.use(express.json())

myapp.set('views', 'views')
myapp.set('view engine', 'ejs')

myapp.use(express.static('public'))
// enabling user object from session within each ejs pages
myapp.use(function (req, res, next) {
    res.locals.user = req.session.user
    next()
})
myapp.use('/', router)

//---------------
const server = http.createServer(myapp)

const io = require('socket.io')(server)

io.on('connection', function(socket) {
    console.log('server was ready, the connection is set')

    // user send message to every connected users
    socket.on('sentMessageByBrowser', function (data) {
        io.emit('sentByServer', {messageBack: data.message, username: data.username})
    })

})

module.exports = server