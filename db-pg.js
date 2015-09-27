var pg      = require('pg');
var logger  = require('./logger.js');

var TABLE_COLUMN_TYPES = {
  "state" : {
    "state_code" : "char (2) primary key",
    "name"       : "varchar"
  },
  "district" : {
    "id"          : "integer primary key",
    "state_code"  : "char (2) references state(state_code)",
    "district_no" : "integer"
  },
  "zip_code" : {
    "zip_code" : "char (5) primary key"
  },
  "district_zip" : {
    "district_id" : "integer references district(id)",
    "zip_code"    : "char(5) references zip_code(zip_code)"
  }
}

var __url       = undefined;//process.env.DATABASE_URL;
var __simulate  = false;

function query(q, onSuccess, onError) {
  logger.debug('Executing query \'' + q + '\'...');
  if(__simulate) {
    onSuccess();
    return;
  }
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

exports.setSimulationMode = function(simulate) {
  __simulate = simulate;
}

exports.resetDatabase = function(tableDefinitions) {
  var f = function(i) {
    drop_table(tableDefinitions[i].name, function() {
      logger.debug(' -> done');
      if(i < tableDefinitions.length - 1)
        f(i+1);
    }, 
    function(error) {
      logger.debug('Error : ' + error);
    }); 
  }
  f(0);
}

exports.initDatabase = function(tableDefinitions, initialDatasets) {
  create_tables(tableDefinitions, 
    function() {
      populate_initial_data(initialDatasets, tableDefinitions, function() {
        logger.log('Database initialization complete');
      }, 
      function(error) { 
        logger.log('Error: ' + error);
      });
    }, 
    function(error) {
      logger.log('Error: ' + error);
    }
  );
  
}

exports.importCSV = function(filename, tableName, columnOrder, onSuccess, onError) {
  import_csv(filename, tableName, columnOrder, onSuccess, onError);
}

exports.doWriteTest = function(onSuccess, onError) {
  query('INSERT INTO test_table VALUES (2, \'Bananas\');', onSuccess, onError);
}

exports.doReadTest = function(onSuccess, onError) {
	query('SELECT * FROM test_table', onSuccess, onError);
}

function drop_table(tableName, onSuccess, onError) {
  var q = 'DROP TABLE ' + tableName + ';';
  
  logger.debug("Dropping table '" + tableName + "'...");
  query(q, onSuccess, onError);
}

function create_table(tableName, columns, onSuccess, onError) {
  var q      = 'CREATE TABLE ' + tableName + '(';
  var colStr = '';
  if(!TABLE_COLUMN_TYPES.hasOwnProperty(tableName))
  {
    onError('Missing column types for table \'' + tableName + '\'');
    return;
  }
  for(var i in columns) {
    if(!TABLE_COLUMN_TYPES[tableName].hasOwnProperty(columns[i])) {
      onError('Missing column type for column \'' + columns[i] + '\'');
      return;
    }
    colStr = colStr + columns[i] + ' ' + TABLE_COLUMN_TYPES[tableName][columns[i]] + ',';
  }
  
  if(0 == colStr.length) {
    onError('No valid columns provided');
    return;
  }
  colStr = colStr.slice(0, -1);
  q      = q + colStr + ');';
  
  logger.debug("Creating table '" + tableName + "'...");
  query(q, onSuccess, onError);
} 

function import_csv(csvFilePath, tableName, columnOrder, onSuccess, onError) {
  var q = 'copy ' + tableName + '(';
  var c = '';
  
  for(var i in columnOrder)
    c = c + columnOrder[i] + ',';
  
  if(0 == c.length)
    return;
      
  c = c.slice(0,-1);
  q = q + c + ') from \'' + csvFilePath + '\' with delimiter \',\' CSV;';
  query(q, onSuccess, onError);  
}

function create_tables(tableDefinitions, onSuccess, onError) {
  var f = function(i) {
    create_table(tableDefinitions[i].name, tableDefinitions[i].columns, function() {
      logger.debug(' -> done');
      if(i < tableDefinitions.length - 1)
        f(i+1);
      else
        onSuccess();
    }, 
    onError); 
  }
  f(0);
}

function populate_initial_data(initialDataSets, tableDefinitions, onSuccess, onError) {
  var orderedDatasets = generate_ordered_dataset_array(initialDataSets, tableDefinitions);
  
  var f = function(i) {
    import_csv(orderedDatasets[i].dataset, orderedDatasets[i].table, orderedDatasets[i].columnOrder, function() {
      logger.debug(' -> done');
      if(i < orderedDatasets.length - 1)
        f(i+1);
      else
        onSuccess();
    }, 
    onError); 
  }
  f(0);
}

function generate_ordered_dataset_array(datasets, tableDefinitions) {
  var orderedDatasets = [];
  for(var i in tableDefinitions) {
    if(datasets.hasOwnProperty(tableDefinitions[i].name)) {
      for(var j in datasets[tableDefinitions[i].name]) {
        orderedDatasets.push({
          'table'       : tableDefinitions[i].name,
          'dataset'     : datasets[tableDefinitions[i].name][j],
          'columnOrder' : tableDefinitions[i].columns
        });
      }
    }
  }
  return orderedDatasets;
}