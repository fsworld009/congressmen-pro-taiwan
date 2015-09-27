var pg      = require('pg');

var __url   = undefined;//process.env.DATABASE_URL;

function query(q, onSuccess, onError) {
  pg.connect(__url, function(err, client, done) {
    client.query(q, function(err, result) {
      done();
      if(err) {
        onError(err);
      } else {
        onSuccess(result);
      }
    });
  });
}
exports.setDatabaseUrl = function(url) {
  __url = url;
}
exports.doWriteTest = function(onSuccess, onError) {
  query('INSERT INTO test_table VALUES (2, \'Bananas\');', onSuccess, onError);
}

exports.doReadTest = function(onSuccess, onError) {
	query('SELECT * FROM test_table', onSuccess, onError);
}