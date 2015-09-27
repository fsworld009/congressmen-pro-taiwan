var db = require('./db-pg.js');
db.setDatabaseUrl(process.env.DATABASE_URL);

exports.initDatabase = function() {
	db.initDatabase();
}

exports.doWriteTest = function(onSuccess, onError) {
	db.doWriteTest(onSuccess, onError);
}

exports.doReadTest = function(onSuccess, onError) {
	db.doReadTest(onSuccess, onError);
}

exports.importFromCSV = function(csvFilePath, table, columns) {
	
}