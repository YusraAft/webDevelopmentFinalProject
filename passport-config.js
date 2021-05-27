//const { authenticate } = require("passport")
const bcrypt = require('bcrypt')

const LocalStarategy = require('passport-local').Strategy


function initialize(passport, getUserByEmail, getUserById){
    const authenticateUser = async (email, password, done) => {

        const user = getUserByEmail(email) //either returns user or null
        if (user == null){
            return done(null, false, {message: "No user with that email exists"}) //nothing went wrong so no err just null

        }
        try{
            if(bcrypt.compareSync(passport, user.password)){
                return done(null, user)
            } else{
                return done(null, false, { message: "Password is incorrect"})
            }
        }
        catch(err){
            return done(err)
        }

    }
    passport.use(new LocalStarategy ({ usernameField: 'email' }, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => {
        return done(null, getUserById)
    })

}

module.exports = initialize;