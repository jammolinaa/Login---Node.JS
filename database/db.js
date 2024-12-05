const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: '3306',
    password: "",
    database: 'login_node',
});

connection.connect((error) => {
    if (error){
        console.log('Error MySQL:'+error);
        return;
    }
    console.log('Connected to the MySQL database!');
});
module.exports = connection;