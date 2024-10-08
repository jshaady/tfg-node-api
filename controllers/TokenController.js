// TokenController.js

var jwt = require('jsonwebtoken');

/**
 * Verify the client token and set in req the username and the rol.
 */
exports.verify = (req, res, next) => {
    if ( !req.headers.authorization ){
      return res.status(401).json({error: 'Unauthorized request'})
    }
    let token = req.headers.authorization.split(' ')[1];
    if( token == 'null' ){
      return res.status(401).json({error: 'Unauthorized request'})
    }
    try{
      let payload = jwt.verify(token, 'secret');
      if( !payload ){
        return res.status(401).json({error: 'Unauthorized request'})
      }
      req.username = payload.username;
      req.rol = payload.rol;
    }
    catch{  
      return res.status(401).json({error: 'Unauthorized request'})
    }
    next();
}
