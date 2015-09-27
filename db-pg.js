var pg      = require('pg');

var TABLE_DEFINITIONS = [
  {
    "name"    : "state",
    "columns" : [
      {
        "name" : "state_code",
        "type" : "char (2) primary key"
      },
      {
        "name" : "name",
        "type" : "varchar"
      }
    ]
  },
  {
    "name"    : "district",
    "columns" : [
      {
        "name" : "id",
        "type" : "serial primary key"
      },
      {
        "name" : "state_code",
        "type" : "char (2) references state(state_code)"
      },
      {
        "name" : "district_no",
        "type" : "integer"
      } 
    ]
  },
  {
    "name"    : "zip_code",
    "columns" : [
      {
        "name" : "zip_code",
        "type" : "char (5) primary key"
      }
    ]
  },
  {
    "name"     : "district_zip",
    "columns" : [
      {
        "name" : "district_id",
        "type" : "serial references district(id)"
      },
      {
        "name" : "zip_code",
        "type" : "char(5) references zip_code(zip_code)"
      }
    ]
  }
]

var __url   = undefined;//process.env.DATABASE_URL;

function query(q, onSuccess, onError) {
  pg.connect(__url, function(err, client, done) {
    if(err) {
      onError(err);
      return;
    }
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

exports.initDatabase = function() {
  for(var i in TABLE_DEFINITIONS){
    create_table(TABLE_DEFINITIONS[i].name, TABLE_DEFINITIONS[i].columns, function() {
      
    }, 
    function(error) {
      console.log('error : ' + error);
    }); 
  }
}

exports.doWriteTest = function(onSuccess, onError) {
  query('INSERT INTO test_table VALUES (2, \'Bananas\');', onSuccess, onError);
}

exports.doReadTest = function(onSuccess, onError) {
	query('SELECT * FROM test_table', onSuccess, onError);
}

//columns = [{name : nameStr, type : typeStr}]
function create_table(tableName, columns, onSuccess, onError) {
  var q      = 'CREATE TABLE ' + tableName + '(';
  var colStr = '';
  
  for(var i in columns) {
    if(!columns[i].name || !columns[i].type)
      continue;
    colStr = colStr + columns[i].name + ' ' + columns[i].type + ',';
  }
  
  if(0 == colStr.length) {
    onError('No valid columns provided');
    return;
  }
  colStr = colStr.slice(0, -1);
  q      = q + colStr + ');';
  
  query(q, onSuccess, onError);
} 