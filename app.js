// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//Inicializar Variables
var app = express();
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');



//conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err,res) => {
    if(err) throw err;
    console.log('Base de datos Online');
})

//Rutas
app.use('/usuario',usuarioRoutes);
app.use('/login',loginRoutes);

app.use('/',appRoutes);

//escuchar peticiones

app.listen(3000, () => {
    console.log('Express server puerto 3000 online')
})