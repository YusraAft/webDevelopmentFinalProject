if (process.env.NODE_ENV !== 'prduction'){
    require('dotenv').config()
}

//const { request } = require('express')
const express = require ('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const User = require('./src/schema/User')

const initializePassport = require('./passport-config')
const { request } = require('express')
initializePassport(
    passport, 
    async email => await User.find({'email': {'$eq' : email}}),
    async id => await User.find({'id': {'$eq' : id}}))


app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, //should not resave session varaibles if norhign changes
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


app.get('/', checkAuthenticated, (req,res) => {
    res.render('index.ejs', {name: 'Kyle'})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/', 
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async(req, res) => {
    //try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        console.log(req.body)
        req.body.password = hashedPassword
        //how to make .password = hashedPassword
        User.create(req.body)
        res.redirect('/login')

 /*} catch{
    res.redirect('/register')
    }*/
    console.log("Post /register");
   
})

app.delete('/logout', (req, res) =>{
    req.logOut() //passport sets up for us automatically
    res.redirect('/login')
})

function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
    if(request.isAuthenticated()){
        return res.redirect('/')
    
    }
    next()
}
app.listen(3000)