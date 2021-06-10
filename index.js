/**
 * sample application for cloud functions and cloud sql
 * - c.f.https://reffect.co.jp/node-js/express-js-connect-mysql
 */

const path          = require('path')
const express       = require('express')
const bodyParser    = require('body-parser')
const mysql         = require('mysql');
const ejs           = require('ejs')

const app   = express()
const port  = 3000

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

let dbhost = process.argv[2]; 
if (dbhost == undefined){
    dbhost = process.env.DBHOST;
}
let dbuser = process.argv[3];
if (dbuser == undefined){
    dbuser = process.env.DBUSER;
}
let dbpass = process.argv[4];
if (dbpass == undefined){
    dbpass = process.env.DBPASS;
}

let dbname = process.argv[5];
if (dbname == undefined){
    dbname = process.env.DBNAME;
}

let cf_root_path = process.argv[6];
if (cf_root_path == undefined){
    cf_root_path = process.env.CF_ROOTPATH;
}


let con = mysql.createConnection({
  host      : dbhost,
  user      : dbuser,
  password  : dbpass,
  database  : dbname
});

app.get(cf_root_path, (req, res) => {
	const sql = "select * from users";
	con.query(sql, function (err, result, fields) {  
	if (err) throw err;
	res.render('index',{users : result,cf_root_path : cf_root_path});
	});
});

app.post(cf_root_path+"/add", (req, res) => {
	const sql = "INSERT INTO users SET ?";
	con.query(sql,req.body,function(err, result, fields){
		if (err) throw err;
		console.log(result);
		res.redirect(cf_root_path);
	});
});

app.get(cf_root_path + '/create', (req, res) => {
    res.render('form',{cf_root_path : cf_root_path});
});

app.get(cf_root_path + '/edit/:id',(req,res)=>{
	const sql = "SELECT * FROM users WHERE id = ?";
	con.query(sql,[req.params.id],function (err, result, fields) {  
		if (err) throw err;
		res.render('edit',{user : result,cf_root_path : cf_root_path});
		});
});

app.post(cf_root_path + '/update/:id',(req,res)=>{
	const sql = "UPDATE users SET ? WHERE id = " + req.params.id;
	con.query(sql,req.body,function (err, result, fields) {  
		if (err) throw err;
		console.log(result);
		res.redirect(cf_root_path);
		});
});

app.get(cf_root_path + '/delete/:id',(req,res)=>{
	const sql = "DELETE FROM users WHERE id = ?";
	con.query(sql,[req.params.id],function(err,result,fields){
		if (err) throw err;
		console.log(result)
		res.redirect(cf_root_path);
	})
});

// - for maintenance command start -
app.get(cf_root_path + 'test', (req, res) => {
    res.send('test');
});

app.get(cf_root_path + 'createTable', (req, res) => {
    con.connect(function(err) {
        if (err) throw err;
        const sql = 'CREATE TABLE users (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL)';
        con.query(sql, function (err, result) {
            let msg = "[ERR]table users cannot created.";
            if (err) {
                res.send(msg);
                console.log(msg);
                console.log(err);
            }else{
                msg = "table users created.";
                res.send(msg);
                console.log(msg);
            }
        });
    });
});
// - for maintenance command end -

// -- for localhost debug start -
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
// -- for localhost debug end -

// -- for cloud functions start -
module.exports = {
  app
};
// -- for cloud functions start -

