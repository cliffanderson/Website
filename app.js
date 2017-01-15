/*
 * Dependencies
 */

var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib');

var bodyParser = require('body-parser');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var flash = require('connect-flash');

var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017/testdb";
var User = require('./models/user');
var Workout = require('./models/workout');

var mongoose = require('mongoose');

/*mongoClient.connect(url, function(err, db) {
    if (err) {
        console.log(err);
        return;
    }
    
    console.log('Connection established to ', url);
    
    User = db.collection('users');
});*/

mongoose.connect(url);



passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({username: username}, function(err, user) {
            if(err) { return done(err) };
            
            if(!user) {
                return done(null, false, { message: 'Incorrect username'} );
            }
            
            if(!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password'} );
            }
            
            return done(null, user);
        });
    }
));




passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
       done(err, user); 
    });
});

passport.use('local-signup', new LocalStrategy({
    passReqToCallback: true
    },
    function(req, username, password, done) {
        process.nextTick(function() {
            
            if(req.body.password != req.body.password_confirm) {
                return done(null, false, req.flash('message', 'Passwords do not match'));
            }
            
            User.findOne({ 'username': username}, function(err, user) {
                if (err) {
                    return done(err);
                }
                
                if(user) {
                    return done(null, false, req.flash('message', 'Username already taken'));
                } else {
                    //new user, so create it
                    var newUser = new User();
                    console.log('making a new user');
                    
                    newUser.username = username;
                    newUser.password = newUser.generateHash(password);
                    
                    //save the user
                    newUser.save(function(err) {
                        if(err) {
                            throw err;
                        }
                        
                        return done(null, newUser);
                    });
                }
            });
        });
    }
));

var app = express();
function compile(str, path) {
	return stylus(str).set('filename', path).use(nib());
}

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.configure( function() {
    
    app.use(express.cookieParser("my secret"))
    app.use(flash());

    app.use(bodyParser());

    app.use(express.logger('dev'));
    app.use(stylus.middleware( {
        src: __dirname + '/public',
        compile: compile
    }));

    app.use(express.static(__dirname + '/public'));
    
    
    app.use(express.session({ secret: 'my secret' }));
    app.use(passport.initialize());
    app.use(passport.session());
    
    app.use(express.favicon());
    
    app.use(app.router);
    
});


// Main page //
app.get('/', function(req, res) {
    res.render('index');
});

// Login GET and POST //

app.get('/login', function(req, res) {
    res.render('login', { message: req.flash('error') });
    console.log(req.flash('error'))
});

app.post('/login', passport.authenticate('local', { successRedirect: '/profile', failureRedirect: '/login', failureFlash: true }), function(req, res) {
    // If this is called then authentication was successful
    // req.user is the authenticated user
    
    //console.log(req.body);
    //res.render('login', { username: req.body.username, password: req.body.password });
});

app.get('/signup', function(req, res) {
    res.render('signup', { message: req.flash('message') });
});

app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: 'true'
}));

app.get('/drills', function(req, res) {
   res.render('drills'); 
});

app.get('/profile', isLoggedIn, function(req, res) {
    var workoutHistoy = Workout.find({}, function(err, data) { 
        if(!err) {
            return res.render('profile', { username: req.user.username, workoutHistory: data});
        } else {
                res.render('profile', { username: req.user.username, workoutHistory: "You have no workouts logged"});
        }
    });
    
    
    
});

app.post('/profile', isLoggedIn, function(req, res) {
    
    var message = '';
    if(req.body.exercise == '') {
        message = 'Error: Exercise cannot be empty';
    }
        
    var workout = new Workout();
    workout.name = req.body.exercise;
    workout.sets = req.body.sets;
    workout.reps = req.body.reps;
    workout.weight = req.body.weight;
    
    console.log(workout);
        
    workout.save(function (err) {
        console.log('saving');
        if(err) {
            message = 'Error saving workout';
            console.log(message);
        } else {
            message = 'Workout save successful';
            console.log(message);
        }
    });
    
    
    
    
   res.render('profile', { username: req.user.username, message: message }); 
});

function isLoggedIn(req, res, next) {
    
    if(req.isAuthenticated())
        return next();
    
    res.redirect('/');
}

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});


////////////
//  404s  //
////////////

app.get('*', function(req, res) {
   res.send('GTFO', 404); 
});



app.listen(3000);
