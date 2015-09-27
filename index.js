//---------------------------------------------------------------------- 
//----------------------------------------------------------------------
var express = require('express');
var dblib  = require('./dblib.js');


//----------------------------------------------------------------------
// app init
//----------------------------------------------------------------------
var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

//----------------------------------------------------------------------
// APIs
//----------------------------------------------------------------------

app.get('/api/add_voting_district', function(request, response) {
  
});

//----------------------------------------------------------------------
// DB I/O tests
//----------------------------------------------------------------------
app.get('/db_read_test', function(request, response) {
  dblib.doReadTest(function(result) {
    response.render('pages/db', {results : result.rows} ); 
  }, function(error) {
    console.error(error); response.send("Error " + error); 
  });
});

app.get('/db_write_test', function(request, response) {
  dblib.doWriteTest(function(result) {
    response.end('OK');
  }, function(error) {
    console.error(error); response.send("Error " + error); 
  });
});
