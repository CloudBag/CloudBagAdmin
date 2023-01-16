const fs = require('fs');
const path = require('path');
const {CloudBagLoc} = require('./express-server/server');

const extractUsers=()=>{
  let usuarios=fs.readFileSync(path.join(CloudBagLoc, "Password.psw")).toString()
  return usuarios.split("/")
};

exports.validateUser = (credentials) => {
  let userData={
    NickName:null,
    password:null,
    rango:null,
  };
  extractUsers().forEach(
      (user)=>{
        if((user.split(";")[0]===credentials[0]) && (user.split(";")[1]===credentials[1])){
          userData.NickName=credentials[0];
          userData.password=credentials[1];
          userData.rango=user.split(";")[2];
        }

      }
  )
  return userData;
}

exports.extractSesions=()=>{
  let sesiones=fs.readFileSync(path.join(CloudBagLoc, "Sesions.psw")).toString()
  return sesiones.split("|")
}

exports.registSesion=(name)=>{
  var today = new Date();
  fs.appendFileSync(path.join(CloudBagLoc, 'Sesions.psw'), name+";"+today.toLocaleString()+"|")
}