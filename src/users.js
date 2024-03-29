const fs = require('fs');
const path = require('path');
const {CloudBagLoc} = require('./express-server/server');

const extractUsers = () => {
  let usuarios = fs.readFileSync(path.join(CloudBagLoc, 'Password.psw')).
      toString();
  return usuarios.split('/');
};

exports.validateUser = (credentials) => {
  let userData = {
    NickName: null,
    password: null,
    rango: null,
  };
  extractUsers().forEach(
      (user) => {
        if ((user.split(';')[0] === credentials[0]) &&
            (user.split(';')[1] === credentials[1])) {
          userData.NickName = credentials[0];
          userData.password = credentials[1];
          userData.rango = user.split(';')[2];
        }

      },
  );
  return userData;
};

exports.changePassword = (credentials) => {
  let userData = {
    NickName: null,
    password: null,
    rango: null,
  };
  let usuarios = extractUsers();
  let existUser = usuarios.indexOf(
      credentials[0] + ';' + credentials[1] + ';' + credentials[2]);
  if (existUser !== -1) {
    usuarios[existUser] = credentials[0] + ';' + credentials[3] + ';' +
        credentials[2];
    userData.NickName = credentials[0];
    userData.password = credentials[3];
    userData.rango = credentials[2];
    fs.writeFileSync(path.join(CloudBagLoc, 'Password.psw'),
        usuarios.join('/'));
    return true;
  }
  return false;
};

exports.extractSesions = () => {
  let sesiones = fs.readFileSync(path.join(CloudBagLoc, 'Sesions.psw')).
      toString();
  return sesiones.split('|');
};

exports.registSesion = (name) => {
  var today = new Date();
  fs.appendFileSync(path.join(CloudBagLoc, 'Sesions.psw'),
      name + ';' + today.toLocaleString() + '|');
};

exports.createUser = (credentials) => {
  let userData = {
    NickName: credentials[0],
    password: credentials[1],
    rango: 'user',
  };
  let usuarios = extractUsers();
  for (let x in usuarios) {
    if (usuarios[x].split(';')[0] === userData.NickName) {
      return false;
    }
  }
  fs.appendFileSync(path.join(CloudBagLoc, 'Password.psw'),
      '/'+userData.NickName + ';' + userData.password + ';' + userData.rango);
  return true;
};

exports.extractUsers = () => extractUsers();

