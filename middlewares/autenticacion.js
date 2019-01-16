var jwt = require("jsonwebtoken");
var seed = require("../config/config").SEED;

//=====================================================
//	verificar token
//=====================================================
exports.verificaToken = function(req, res, next) {
  var token = req.query.token;
  jwt.verify(token, seed, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        mensaje: "Token incorrecto",
        errors: err
      });
    }
    req.usuario = decoded.usuario;
    // res.status(200).json({
    //   ok: true,
    //   decode:decoded
    // });
    next();
  });
};
