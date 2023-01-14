const path = require('path');
const os = require('os');
const CloudBagLoc = path.join(os.homedir(), 'CloudBag');
const fs = require('fs');
const express = require('express');
const parser = require('body-parser');
const formidable = require('formidable');
const users = require('../users');

console.log(CloudBagLoc);
const port = 3000;
let userData = {
  NickName: null,
  password: null,
  rango: null,
};
let LoggedIn;
let UserWish;

exports.startUp = () => {
  console.log("Probando")
  if (!fs.existsSync(CloudBagLoc))
    fs.mkdir(CloudBagLoc, () => {
    });

  if (!fs.existsSync(path.join(CloudBagLoc, 'usersFiles')))
    fs.mkdir(path.join(CloudBagLoc, 'usersFiles'), () => {
    });

  if (!fs.existsSync(path.join(CloudBagLoc, 'Password.psw')))
    fs.writeFileSync(path.join(CloudBagLoc, 'Password.psw'),
        'admin;admin;admin/ge;ge;admin');

  if (!fs.existsSync(path.join(CloudBagLoc, 'Sesions.psw')))
    fs.writeFileSync(path.join(CloudBagLoc, 'Sesions.psw'), '');

  StartServer();

};

function StartServer() {
  const saveLocation = CloudBagLoc;
  const app = express();
  let isPasswordIncorrect = 0;
  let clients = [];
  LoggedIn = {};
  app.use(express.static(path.join(CloudBagLoc, 'userFiles')));
  app.use(parser.urlencoded({extended: false}));
  app.set('view engine', 'ejs');
  // GET /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  app.get('/', (req, res) => {
    let clientIp = CheckClient(req, clients, LoggedIn)[0];
    clients = CheckClient(req, clients, LoggedIn)[1];
    LoggedIn = CheckClient(req, clients, LoggedIn)[2]

    if (LoggedIn[clientIp] && userData.NickName != null && userData.password !=
        null) {
      switch (userData.rango) {
        case 'admin':
          res.render(path.join(__dirname, '/views/pages/Admin/HomeAdmin'));
          break;
        case 'user':
          res.render(path.join(__dirname, '/views/pages/User/HomeUser'));
          break;

      }
    } else {
      res.redirect('/Login');
    }
  });
  app.get('/test', (req, res) =>{
    console.log("Gay el que le de request")
    res.send("Pendejo el que lo lea")

  })
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
    let clientIp = CheckClient(req, clients, LoggedIn)[0];
    clients = CheckClient(req, clients, LoggedIn)[1];
    LoggedIn = CheckClient(req, clients, LoggedIn)[2];

    if (LoggedIn[clientIp] && userData.NickName != null && userData.password !=
        null) {
      let CloudBagFiles = walk(path.join(CloudBagLoc, 'CloudBag'));
      res.render(path.join(__dirname, '/views/pages/GetFromPC'), {
        CloudBagFiles: CloudBagFiles,
      });
    } else {
      res.redirect('/Login');
    }
  });
  app.get('/SendToCloudBag', (req, res) => {
    let clientIp = CheckClient(req, clients, LoggedIn)[0];
    clients = CheckClient(req, clients, LoggedIn)[1];
    LoggedIn = CheckClient(req, clients, LoggedIn)[2];

    if (LoggedIn[clientIp] && userData.NickName != null && userData.password !=
        null) {
      res.render(path.join(__dirname, '/views/pages/SendToCloudBag'));
    } else {
      res.redirect('/Login');
    }
  });
  app.get('/Logout', (req, res) => {

    let clientIp = req.ip;
    LoggedIn[clientIp] = false;

    res.redirect('/');
  });
  // POST ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  app.post('/Login', (req, res) => {
    let clientIp = CheckClient(req, clients, LoggedIn)[0];
    clients = CheckClient(req, clients, LoggedIn)[1];
    LoggedIn = CheckClient(req, clients, LoggedIn)[2];
    let nickName = req.body.nickName;
    let EnteredPassword = req.body.Password;
    users.validateUser([nickName, EnteredPassword]);
    if (userData.NickName != null && userData.password != null &&
        userData.rango != null) {

      users.registSesion(userData.NickName);
      console.log(users.extractSesions());
      isPasswordIncorrect = false;
      LoggedIn[clientIp] = true;
      res.redirect('/');
    } else {
      res.redirect('/Login');
      isPasswordIncorrect = true;
    }
  });
  app.post('/SendData', (req, res, next) => {
    const form = formidable();
    form.parse(req, (err, fields, files) => {
      if (err) {
        next(err);
        return;
      }
      fs.mkdir(path.join(saveLocation, fields.BatchName), () => {
      });
      console.log('\nFiles saved at:');
      let fileCounter = 0;
      for (let file in files) {
        fileCounter++;
      }
      let fileCounter2 = 0;
      for (let file in files) {
        fileCounter2++;
        let tempPath = files[file]['filepath'];
        let newPath = path.join(saveLocation, fields.BatchName,
            files[file]['originalFilename']);

        fs.rename(tempPath, newPath, () => {
        });

        if (fileCounter2 < fileCounter) {
          console.log('    ' + newPath);
        }
      }

      res.redirect('/');
    });
  });
  app.post('/SendDataToCloudBag', (req, res, next) => {
    const CloudBagLocation = path.join(CloudBagLoc, 'CloudBag');

    const form = formidable();

    form.parse(req, (err, fields, files) => {
      if (err) {
        next(err);
        return;
      }

      fs.mkdir(path.join(CloudBagLocation, fields.BatchName), () => {
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
        let newPath = path.join(CloudBagLocation, fields.BatchName,
            files[file]['originalFilename']);

        fs.rename(tempPath, newPath, () => {
        });

        if (fileCounter2 < fileCounter) {
          console.log('    ' + newPath.green.bold);
        }
      }

      res.redirect('/');
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
        '/')+' in any web browser');
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