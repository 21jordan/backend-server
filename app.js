// Requires
var express = require('express');
var mongoose = require('mongoose');

//Inicializar Variables
var app = express();

//conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err,res) => {
    if(err) throw err;
    console.log('Base de datos Online');
})

//rutas 
app.get('/', (req, res) => {
    res.status(200).json({
        ok: true,
        mensaje: 'peticion realizada correctamente'
    })
});
//escuchar peticiones

app.listen(3000, () => {
    console.log('Express server puerto 3000 online')
})