const path = require('path');
const os = require('os');
const CloudBagLoc = path.join(os.homedir(), 'CloudBag');
const fs = require('fs');
const express = require('express');
const parser = require('body-parser');
const formidable = require('formidable');
const users = require('../users');
const cors = require('cors');

console.log(CloudBagLoc);
const port = 3000;
let userData = {
  NickName: null,
  password: null,
  rango: null,
};
let LoggedIn;
let userNicknames;

exports.startUp = () => {
  console.log('Probando');
  if (!fs.existsSync(CloudBagLoc))
    fs.mkdir(CloudBagLoc, () => {
    });

  if (!fs.existsSync(path.join(CloudBagLoc, 'UserFiles')))
    fs.mkdir(path.join(CloudBagLoc, 'UserFiles'), () => {
    });

  if (!fs.existsSync(path.join(CloudBagLoc, 'Password.psw')))
    fs.writeFileSync(path.join(CloudBagLoc, 'Password.psw'),
        'admin;admin;admin/ge;ge;user');

  if (!fs.existsSync(path.join(CloudBagLoc, 'Sesions.psw')))
    fs.writeFileSync(path.join(CloudBagLoc, 'Sesions.psw'), '');

  StartServer();

};

function StartServer() {
  const saveLocation = path.join(CloudBagLoc, 'UserFiles');
  const app = express();
  let isPasswordIncorrect = 0;
  let clients = [];
  LoggedIn = {};
  userNicknames = {};
  app.use(express.static(saveLocation));
  app.use(parser.urlencoded({extended: false}));
  app.use(express.json());
  app.use(cors());

  // GET /////////////////////////////////////////////////////////////////////////////////////////////////////////////

  app.get('/Login', (req, res) => {
    let clientIp = CheckClient(req, clients, LoggedIn)[0];
    clients = CheckClient(req, clients, LoggedIn)[1];
    LoggedIn = CheckClient(req, clients, LoggedIn)[2];
    if (LoggedIn[clientIp] && userData.NickName != null && userData.password !=
        null) {
      res.redirect('/');
    } else {
      res.render(path.join(__dirname, '/views/pages/login'));
    }
  });

  app.get('/GetFromPC', (req, res) => {
    console.log('hola');
    let clientIp = CheckClient(req, clients, LoggedIn)[0];
    clients = CheckClient(req, clients, LoggedIn)[1];
    LoggedIn = CheckClient(req, clients, LoggedIn)[2];

    if (LoggedIn[clientIp] && userNicknames[clientIp] != null) {
      let CloudBagFiles = walk(path.join(saveLocation, userNicknames[clientIp]));
      res.send(CloudBagFiles);
    } else {
      res.status(400).json({message: 'Not logged in'});
    }
  });

  app.get('/GetFile/:file', (req, res) => {
    console.log('file: ' + req.params.file);
    console.log('logeao: ' +LoggedIn[req.ip]);
    let fileName = req.params.file;
    if (LoggedIn[req.ip] && userNicknames[req.ip] != null) {
      let file = path.join(saveLocation, 'ge', fileName)
      console.log('path: ' + file);
      res.download(file);
    }else
      res.status(400).json({message: 'Not logged in'})
  })

  app.get('/Logout', (req, res) => {

    let clientIp = req.ip;
    LoggedIn[clientIp] = false;
    console.log('logout');
    res.status(200).json({message: 'ok'});
  });

  // POST ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  app.post('/Login', (req, res) => {
    let clientIp = CheckClient(req, clients, LoggedIn)[0];
    clients = CheckClient(req, clients, LoggedIn)[1];
    LoggedIn = CheckClient(req, clients, LoggedIn)[2];
    console.log(req.body);
    let credentials = [req.body.nickName, req.body.Password];
    console.log(credentials);
    userData = users.validateUser(credentials);
    if (userData.NickName != null && userData.password != null &&
        userData.rango != null) {
      users.registSesion(userData.NickName);
      // console.log(users.extractSesions());
      isPasswordIncorrect = false;
      LoggedIn[clientIp] = true;
      userNicknames[clientIp] = userData.NickName
      console.log(userNicknames);
      res.json(userData);
    } else {
      res.status(400).json({message: 'Bad Request'});
    }
  });
  app.post('/changePassword', (req, res) => {
    let clientIp = CheckClient(req, clients, LoggedIn)[0];
    clients = CheckClient(req, clients, LoggedIn)[1];
    LoggedIn = CheckClient(req, clients, LoggedIn)[2];
    console.log(req.body);
    let credentials = [req.body.oldPassword, req.body.Password];
    console.log(credentials);
    userData = users.validateUser(credentials);
    if (userData.NickName != null && userData.password != null &&
        userData.rango != null) {
      users.registSesion(userData.NickName);
      // console.log(users.extractSesions());
      isPasswordIncorrect = false;
      LoggedIn[clientIp] = true;
      userNicknames[clientIp] = userData.NickName
      console.log(userNicknames);
      res.json(userData);
    } else {
      res.status(400).json({message: 'Bad Request'});
    }
  });

  app.post('/SendDataToCloudBag', (req, res, next) => {
    const form = formidable();
    let clientip = req.ip;
    form.parse(req, (err, fields, files) => {
      if (err) {
        next(err);
        return;
      }

      if (!fs.existsSync(path.join(saveLocation, userNicknames[clientip])))
        fs.mkdir(path.join(saveLocation, userNicknames[clientip]), () => {
        });

      fs.mkdir(path.join(saveLocation, userNicknames[clientip], fields.BatchName), () => {
      });

      console.log('\nFiles saved to CloudBag: ');

      let fileCounter = 0;
      for (let file in files) {
        fileCounter++;
      }

      let fileCounter2 = 0;
      for (let file in files) {
        fileCounter2++;
        let tempPath = files[file]['filepath'];
        let newPath = path.join(saveLocation, userNicknames[clientip], fields.BatchName,
            files[file]['originalFilename']);

        fs.rename(tempPath, newPath, () => {
        });

        if (fileCounter2 < fileCounter) {
          console.log('    ' + newPath);
        }
      }

      res.status(200).json({message: 'ok'});
    });
  });

  // SERVER //////////////////////////////////////////////////////////////////////////////////////////////////////////

  app.listen(port, () => {

    var address,
        ifaces = require('os').networkInterfaces();
    for (var dev in ifaces) {
      if (!dev.includes('v')) {
        ifaces[dev].filter(
            (details) => details.family === 'IPv4' && details.internal ===
            false ?
                address = details.address :
                undefined);
      }
    }

    console.log('Goto ' + ('http://' + address + ':' + port.toString() +
        '/') + ' in any web browser');
    console.log('in your phone or any other device to use CloudBagDrop.');
  });
}

function CheckClient(request, clients, isLoggedIn) {
  let clientIp = request.ip;

  if (!clients.includes(clientIp)) {
    clients.push(clientIp);
    isLoggedIn[clientIp] = false;
  }
  ;

  return [clientIp, clients, isLoggedIn];
}

function walk(walkPath) {
  let CloudBagContents = fs.readdirSync(walkPath);
  let BetterContents = {};
  let FileContents = [];

  CloudBagContents.forEach((Content) => {
    let ContentPath = path.join(walkPath, Content);
    let stat = fs.statSync(ContentPath);

    if (stat.isDirectory()) {
      let SubContents = walk(path.join(walkPath, Content));
      FileContents.push(SubContents);
    } else {
      FileContents.push(Content);
    }
  });

  BetterContents[walkPath.split('\\').pop().split('/').pop()] = FileContents;

  return BetterContents;
}

exports.CloudBagLoc = CloudBagLoc;