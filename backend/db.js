//Author: Gabriel Bullerman
//gbulle@iastate.edu
//Date :  April 27, 2024

const mysql = require('mysql2/promise')

const db = mysql. createPool({
    host: "127.0.0.1",
    port: 4000,
    user: "root",
    password: "FinalProjectPassword1!",
    database: "final_project"
})

module.exports = db;