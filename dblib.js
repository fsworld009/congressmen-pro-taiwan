var db = require('./db-pg.js');

var TABLE_DEFINITIONS = [
  {
    "name"    : "state",
    "columns" : ["state_code", "name"]
  },
  {
    "name"    : "district",
    "columns" : ["id", "state_code", "district_no"]
  },
  {
    "name"    : "zip_code",
    "columns" : ["zip_code"]
  },
  {
    "name"     : "district_zip",
    "columns" : ["district_id", "zip_code"]
  }
]

var INITIAL_DATASETS = {
  "state"     : ["./datasets/state.csv"],
  "districts" : ["./datasets/districts_test.csv"] 
}

db.setDatabaseUrl(process.env.DATABASE_URL);

exports.initDatabase = function() {
	db.initDatabase(TABLE_DEFINITIONS, INITIAL_DATASETS);
}

exports.resetDatabase = function() {
	db.resetDatabase(TABLE_DEFINITIONS);	
}

exports.doWriteTest = function(onSuccess, onError) {
	db.doWriteTest(onSuccess, onError);
}

exports.doReadTest = function(onSuccess, onError) {
	db.doReadTest(onSuccess, onError);
}

exports.importFromCSV = function(csvFilePath, table, columns) {
	
}