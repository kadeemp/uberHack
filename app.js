var Uber = require('node-uber');
var express = require('express');
var session = require('express-session');
var info = require('./info.json');
var path = require('path');
var hbs = require('hbs');
var app = express();
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var models = require('./models');
var Gameroom = models.Gameroom;
var Rider = models.Rider;

var REQUIRED_ENV = "SECRET MONGODB_URI".split(" ");
REQUIRED_ENV.forEach(function(el) {
  if (!process.env[el])
    throw new Error("Missing required env var " + el);
});
mongoose.connect(process.env.MONGODB_URI);
var mongoStore = new MongoStore({mongooseConnection: mongoose.connection});
app.use(session({
  secret: process.env.SECRET,
  store: mongoStore
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// set the view engine to use handlebars
var picture = "";

// create new Uber instance
var uber = new Uber({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    server_token: process.env.SERVER_TOKEN,
    redirect_uri: 'http://localhost:3000/api/callback',
    name: 'nodejs uber wrapper',
    language: 'en_US',
    sandbox: true
});

// get authorization URL
app.get('/api/login', function(request, response) {
  var url = uber.getAuthorizeUrl(['history_lite', 'request', 'profile']);
  response.redirect(url);
});

// the authorizarion_code will be provided via the callback after logging in using the authURL
// app.get('/api/callback', function(request, response) {
//     console.log('code:', request.query.code);
//     console.log('uber', uber.authorizationAsync);
//    uber.authorizationAsync({authorization_code: request.query.code})
//    .spread(function(access_token, refresh_token, authorizedScopes, tokenExpiration) {
//      // store the user id and associated access_token, refresh_token, scopes and token expiration date
//      console.log('New access_token retrieved: ' + access_token);
//      console.log('... token allows access to scopes: ' + authorizedScopes);
//      console.log('... token is valid until: ' + tokenExpiration);
//      console.log('... after token expiration, re-authorize using refresh_token: ' + refresh_token);
//
//      // redirect the user back to your actual app
//     //  response.send(access_token);
//     // uber.user.getProfileAsync()
//     // .then(function(res){
//     //   var src = res.picture;
//     //   var first_name = res.first_name;
//     //   res.render('shree',{shreePic:src, first_name: first_name})
//     // })
//     uber.user.getProfileAsync()
//       .then(function(res) {
//         picture = res.picture;
//         response.render('shree', {shreePic: picture, first_name: res.first_name})
//
//       }).error(function(err) { console.error(err); });
//     }).error(function(err) {
//      console.error(err);
//    });
// });

// app.get('/shree', function(req,res){
//   uber.user.getProfileAsync()
//   .then(function(res){
//     var src = res.picture;
//     var first_name = res.first_name;
//     res.render('shree',{shreePic:src, first_name: first_name})
//   })
// })
app.get('/api/callback', function(req,res){
  console.log(info.riders);
  var riders = info.riders;
  var me= "";
  var everyone = [];
  var saveEveryone = [];

  if (riders.length >= 2){
    //start game

    riders.forEach(function(rider){
      if (rider.me){
        me = rider;
        console.log('me' + me);
        var mainRider = new Rider({first_name: me.first_name, me: me.me, rider_id: me.rider_id})
        saveEveryone.push(mainRider);
        mainRider.save(function(err){
          if (err){
            res.json(err);
          }
        })

      } else{
        everyone.push(rider)
        console.log('else '+ rider);
        var newRider = new Rider({first_name: rider.first_name, me:rider.me, rider_id: rider.rider_id})
        saveEveryone.push(newRider);
        newRider.save(function(err){
          if (err){
            res.json(err);
          }
        })
      }
    })
    var game = new Gameroom({
      gameName: "Tic Tac Toe",
      inProgress: true,
      players: saveEveryone

    })
    game.save(function(err){
      if (err){
        res.json(err);
      }
    })

    res.redirect('https://invis.io/KQAPTRKV5#/221948698_Passengerjoined_480')
  };
})

app.listen(process.env.PORT || 3000);
