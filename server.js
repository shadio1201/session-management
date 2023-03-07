const express = require('express');
const app = express();
const port = 3000;
const session = require('express-session');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const uuid = require('uuid');
const bodyParser = require('body-parser')
const morgan = require('morgan')

const secret = crypto.randomBytes(32).toString('hex');
console.log(secret)

app.set('view engine', 'ejs');

app.use(session({
    genid: () => {
        return uuid.v4();
    },
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 60000
    }
}));

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parsing the incoming data
app.use(bodyParser.json());

//serving public file
app.use(express.static(__dirname));

//enable cookie-parser
app.use(cookieParser());

const database = [{
    uuid: uuid.v4(),
    name: 'test',
    password: 'test1'
}]

app.get('/', (req, res, next) => {
    res.render('index')
})

app.get('/user', (req, res, next) => {
    const currentUser = database.find(user => user.uuid === req.session.uuid);
    if(!currentUser) {
        res.redirect('/');
        return
    }
    let session = req.session
    session.views++
    session.activity.push({
        views: session.views,
        date: date.now()
    })
    res.render('profile', { views: session.views });
    
})

app.post('/test', (req, res, next) => {

    const currentUser = database.find(user => user.name === req.body.login);
    
    if(!currentUser) {
        return res.send('not found');
    }

    if(req.body.password == currentUser.password) {

        req.session.uuid = currentUser.uuid;

        console.log('login success!')
        res.redirect('/user')
        return
    } else {
        console.log('login failed!')
        res.status(404).send()
    }
})







app.listen(port, () => {
    console.log(`The server is running on ${port}`)
})