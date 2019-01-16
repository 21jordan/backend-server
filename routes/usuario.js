var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var mdAut = require('../middlewares/autenticacion');
var seed = require("../config/config").SEED;

var app = express();

var salt = bcrypt.genSaltSync(10);
var Usuario = require("../models/usuario");

//=====================================================
//	Obtener todos los usuarios
//=====================================================
//rutas
app.get("/", (req, res) => {
  Usuario.find({}, "nombre email img role").exec((err, usuarios) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error cargando usuario",
        errors: err
      });
    }
    res.status(200).json({
      ok: true,
      usuarios: usuarios
    });
  });
});



//=====================================================
//	Actualizar usuario
//=====================================================
app.put("/:id", (req, res) => {
  var id = req.params.id;
  var body = req.body;
  Usuario.findById(id,mdAut.verificaToken, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar el usuario",
        errors: err
      });
    }
    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: "El usuario con el " + id + " no existe",
        errors: { message: "no existe ese usuario en la BD" }
      });
    }
    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;

    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar el usuario",
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        usuario: usuarioGuardado
      });
    });
  });
});

//=====================================================
//	Crear un nuevo usuario
//=====================================================
app.post("/",mdAut.verificaToken, (req, res) => {
  var body = req.body;
  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, salt),
    img: body.img,
    role: body.role
  });
  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error guardando usuario",
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      usuario: usuarioGuardado
    });
  });
});

//=====================================================
//	Borrar un usuario
//=====================================================
app.delete("/:id",mdAut.verificaToken, (req, res) => {
  var id = req.params.id;
  Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar  el usuario",
        errors: err
      });
    }
    if (!usuarioBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe ningun usuario con ese id",
        errors: { message: "no existe un usuario con ese id" }
      });
    }
    res.status(200).json({
      ok: true,
      usuario: usuarioBorrado
    });
  });
});
module.exports = app;
