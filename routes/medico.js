var express = require("express");
var mdAuth = require("../middlewares/autenticacion");
var Medico = require("../models/medico");

var app = express();

//=====================================================
//	Obtener todos los medicos
//=====================================================
app.get("/", (req, res) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({})
    .populate("usuario", "nombre email")
    .populate("hospital")
    .skip(desde)
    .limit(5)
    .exec((err, medicos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al cargar usuarios",
          errors: err
        });
      }
      if (!medicos.length) {
        return res.status(500).json({
          ok: false,
          mensaje: "No se encontraron médicos",
          errors: err
        });
      }
      Medico.count({}, (err, conteo) => {
        if (err) {
          res.status(500).json({
            ok: false,
            mensaje: "error en el conteo",
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          medicos: medicos,
          total: conteo
        });
      });
    });
});

//=====================================================
//	Guardar un medico
//=====================================================
app.post("/", mdAuth.verificaToken, (req, res) => {
  var body = req.body;
  var usuarioId = req.usuario._id;

  var medico = new Medico({
    nombre: body.nombre,
    img: body.img,
    usuario: usuarioId,
    hospital: body.hospitalId
  });
  medico.save((err, medicoGuardado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "No se pudo guardar médico",
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      medico: medicoGuardado
    });
  });
});

//=====================================================
//	Actualizzar medico
//=====================================================
app.put("/:id", mdAuth.verificaToken, (req, res) => {
  var body = req.body;
  var id = req.params.id;
  var usuarioId = req.usuario._id;

  Medico.findById(id, (err, medico) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "No se pudo actualizar médico",
        errors: err
      });
    }
    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: "El medico con ese id no existe",
        errors: err
      });
    }
    medico.nombre = body.nombre;
    medico.img = body.img;
    medico.hospital = body.hospitalId;
    medico.usuario = usuarioId;

    medico.save((err, medicoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "No se pudo actualizar al médico",
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        medico: medicoGuardado
      });
    });
  });
});

//=====================================================
//	Eliminar un medico
//=====================================================
app.delete("/:id", mdAuth.verificaToken, (req, res) => {
  var id = req.params.id;

  Medico.findByIdAndRemove(id, (err, medicoEliminado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "No se pudo eliminar el médico",
        errors: err
      });
    }
    if (!medicoEliminado) {
      return res.status(400).json({
        ok: false,
        mensaje: "El medico con ese id no existe",
        errors: err
      });
    }
    res.status(200).json({
      ok: true,
      medico: medicoEliminado
    });
  });
});
module.exports = app;
