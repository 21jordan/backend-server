var express = require("express");
var fileUpload = require("express-fileupload");
var fs = require("fs");
var app = express();

var Usuario = require("../models/usuario");
var Medico = require("../models/medico");
var Hospital = require("../models/hospital");

app.use(fileUpload());

//rutas
app.put("/:tipo/:id", (req, res) => {
  var tipo = req.params.tipo;
  var id = req.params.id;

  //tipos de colección
  var tiposValidos = ["hospitales", "medicos", "usuarios"];
  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "tipo de coleccion no valida",
      errors: { message: "tipo de coleccion no valida" }
    });
  }
  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: "no seleccionó nada",
      errors: { message: "Debe de seleccionar una imagen" }
    });
  }
  //obtener nombre del archivo
  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split(".");
  var extensionArchivo = nombreCortado[nombreCortado.length - 1];

  //solo estas extensiones aceptamos
  var extensionesValidas = ["png", "jpg", "gif", "jpeg"];
  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "extension no valida",
      errors: {
        message: "las extensiones válidas son " + extensionesValidas.join(", ")
      }
    });
  }

  //nombre de archivo personalizado
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  //mover el archivo del temporar a un path especifico
  var path = `./uploads/${tipo}/${nombreArchivo}`;
  archivo.mv(path, err => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al mover archivo",
        errors: err
      });
    }

    subirPorTipo(tipo, id, nombreArchivo, res);
  });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
  if (tipo === "usuarios") {
    Usuario.findById(id, (err, usuario) => {
        if(!usuario) {
            return res.status(400).json({
                ok:false,
                mensaje:'usuario no existe',
                errors: {message: 'usuario no existe'}
            })
        }
      var pathViejo = "./uploads/usuarios/" + usuario.img;

      //si existe, elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
      }
      usuario.img = nombreArchivo;
      usuario.save((err, usuarioActualizado) => {
          usuario.password= ':)'
        return res.status(200).json({
          ok: true,
          mensaje: "imagen de usuario actualizada",
          usuario: usuarioActualizado
        });
      });
    });
  }
  if (tipo === "hospitales") {
      Hospital.findById(id, (err,hospital) => {
        if(!hospital) {
            return res.status(400).json({
                ok:false,
                mensaje:'hospital no existe',
                errors: {message: 'hospital no existe'}
            })
        }
          var pathViejo = "./uploads/hospitales/"+hospital.img;

          if (fs.existsSync(pathViejo)) {
              fs.unlinkSync(pathViejo);
          }
          hospital.img = nombreArchivo;
          hospital.save((err,hospitalActualizado) => {
            return res.status(200).json({
                ok: true,
                mensaje: "imagen de hospital actualizada",
                medico: hospitalActualizado
              });
          })
      })
  }
  if (tipo === "medicos") {
    Medico.findById(id, (err,medico) => {
        if(!medico) {
            return res.status(400).json({
                ok:false,
                mensaje:'medico no existe',
                errors: {message: 'medico no existe'}
            })
        }
        var pathViejo = "./uploads/medicos/"+medico.img;

        if (fs.existsSync(pathViejo)) {
            fs.unlinkSync(pathViejo);
        }
        medico.img = nombreArchivo;
        medico.save((err,medicoActualizado) => {
          return res.status(200).json({
              ok: true,
              mensaje: "imagen de medico actualizada",
              medico: medicoActualizado
            });
        })
    })
  }
}

module.exports = app;
