var Uber = require('node-uber');
var express = require('express');
var info = require('./info.json');

var app = express();


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
  var url = uber.getAuthorizeUrl(['history_lite', 'request']);
  response.redirect(url);
});

// the authorizarion_code will be provided via the callback after logging in using the authURL
app.get('/api/callback', function(request, response) {
    console.log('code:', request.query.code);
    console.log('uber', uber.authorizationAsync);
   uber.authorizationAsync({authorization_code: request.query.code})
   .spread(function(access_token, refresh_token, authorizedScopes, tokenExpiration) {
     // store the user id and associated access_token, refresh_token, scopes and token expiration date
     console.log('New access_token retrieved: ' + access_token);
     console.log('... token allows access to scopes: ' + authorizedScopes);
     console.log('... token is valid until: ' + tokenExpiration);
     console.log('... after token expiration, re-authorize using refresh_token: ' + refresh_token);

     // redirect the user back to your actual app
     response.send(access_token);
   })
   .error(function(err) {
     console.error(err);
   });
});

app.get('/api/start', function(req,res){
  console.log(info.riders);
  var riders = info.riders;
  if (riders.length >= 2){
    //start game
    res.send("start game");
  }
  res.send('asuh');
})

app.listen(process.env.PORT || 3000);
