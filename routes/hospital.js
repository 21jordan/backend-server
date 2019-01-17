var express = require("express");
var Hospital = require("../models/hospital");
var mdAuth = require("../middlewares/autenticacion");
var app = express();

//=====================================================
//	Obtener todos los hospitales
//=====================================================
app.get("/", (req, res) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({})
    .populate("usuario", "nombre email")
    .skip(desde)
    .limit(5)
    .exec((err, hospitales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "error cargando hospitales",
          errors: err
        });
      }
      if (!hospitales.length) {
        return res.status(400).json({
          ok: false,
          mensaje: "No se encontró hospitales",
          errors: err
        });
      }
      Hospital.count({}, (err, conteo) => {
        if (err) {
          res.status(500).json({
            ok: false,
            mensaje: "error en el conteo",
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          hospitales: hospitales,
          total:conteo
        });
      });
    });
});

//=====================================================
//	Agregar un hospital
//=====================================================
app.post("/", mdAuth.verificaToken, (req, res) => {
  body = req.body;
  usuarioId = req.usuario._id;
  var hospital = new Hospital({
    nombre: body.nombre,
    img: body.img,
    usuario: usuarioId
  });
  hospital.save((err, hospitalGuardado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error guardando hospital",
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      hospital: hospitalGuardado
    });
  });
});

//=====================================================
//	Actualizar un hospital
//=====================================================
app.put("/:id", mdAuth.verificaToken, (req, res) => {
  var body = req.body;
  var id = req.params.id;
  var usuarioId = req.usuario._id;
  Hospital.findById(id, (err, hospital) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error actualizando hospital",
        errors: err
      });
    }
    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: "El hospital con ese id no existe.",
        errors: err
      });
    }
    hospital.nombre = body.nombre;
    hospital.img = body.img;
    hospital.usuario = usuarioId;
    hospital.save((err, hospitalGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error Actualizando hospital",
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        hospital: hospitalGuardado
      });
    });
  });
});

//=====================================================
//	Eliminar un hospital
//=====================================================
app.delete("/:id", mdAuth.verificaToken, (req, res) => {
  var id = req.params.id;

  Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar hospital",
        errors: err
      });
    }
    if (!hospitalBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "error al borrar hospital",
        errors: { message: "No existe un hospital con ese id" }
      });
    }
    res.status(200).json({
      ok: true,
      hospital: hospitalBorrado
    });
  });
});
module.exports = app;
