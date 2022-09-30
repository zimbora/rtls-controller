var path = require('path');
var express = require('express');
//const session = require('express-session');
const session = require('cookie-session');
var expressValidation = require('express-validation');
var useragent = require('express-useragent');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
//var httpStatus = require('http-status-codes');
var config = require('../config/env');
var Settings = require("../config/settings");
var System = require('../src/system')
var core = require('../src/core')

const app = express();

app.use(useragent.express());
app.use(bodyParser.json());

app.use(session({
  name: 'session',
  keys: [config.jwtSecret],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
//app.use(fileUpload());

app.set('view engine', 'ejs');  // set the view engine to ejs

app.use('*/assets',express.static(config.public_path+'/assets'))
app.use('*/logo',express.static(config.public_path+'/logo'))
/*
app.use((req,res,next) => {
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  req.device = {
    publicIP : req.header('x-forwarded-for') || req.connection.remoteAddress,
    platform : req.headers['user-agent']
  }
  log.trace("web url: "+fullUrl);
  log.trace("public ip:",req.device.publicIP);
  //log.debug("platform:",req.device.platform);
  //log.debug(req.body);
  next();
});

app.post('/login',validate.body([{
    param_key: 'user',
    required: true,
    type: 'string',
    validator_functions: [(param) => {return param.length > 1}]
  },{
    param_key: 'password',
    required: true,
    type: 'string',
    validator_functions: [(param) => {return param.length > 1}]
  }]),auth.authenticate,auth.generateToken,auth.respondJWT);

app.post('/login/app',validate.body([{
    param_key: 'email',
    required: true,
    type: 'string',
    validator_functions: [(param) => {return param.length > 1}]
  },{
    param_key: 'token',
    required: true,
    type: 'number',
    validator_functions: [(param) => {return param.length > 1}]
  }]),auth.authenticate_android,auth.generateToken,auth.respondJWT);


app.use(auth.check_authentication,(req,res,next)=>{
  if(!req.user){
    log.warn("not authenticated")
    if(req.useragent.isMobile)
      res.render(config.public_path+'/views/pages/login');
    else
      res.render(config.public_path+'/views/pages/login');
      //res.render('../server/public/views/pages/login');
  }else next()
},user.getInfo);
*/
//app.use('*/js',express.static(config.public_path+'/js'))
//app.use('*/files',express.static(config.public_path+'/files'))
//app.use('*/icons',express.static(config.public_path+'/icons'))

app.get('/logout',(req,res)=>{
  //let host = req.protocol + '://' + req.get('host');
  let host = req.protocol + '://' + config.domain;
  auth.deauth(req,res,(req,res)=>{
    res.redirect(host);
  });
});

// --- HOME ---
app.get('/',(req,res)=>{
  Settings.load((data)=>{
    console.log(data);
    console.log(System)
    res.render(config.public_path+'/views/dashboard',{settings:data,system:System});
  });
});

app.use('/',(req,res,next)=>{
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  console.log(fullUrl)
  next();
})

app.put('/api/token',(req,res,next)=>{

  Settings.setAPIToken(req.body.token,()=>{
    Settings.save((err)=>{
      if(err){
        res.status(500).json({
          status: rejected,
          message: err
        });
      }else{
        core.init();
        res.status(200).json({
          status: "ok",
          message: "token replaced"
        });
      }
    })
  })
});

app.put('/api/restart',(req,res,next)=>{

  console.log("restarting service");
  process.exit(1)
});

app.use((err, req, res, next) => {

  if (err instanceof expressValidation.ValidationError) {
    res.status(err.status).json(err);
  } else {
    res.status(500)
      .json({
        status: err.status,
        message: err.message
      });
  }
});


app.use((req, res, next) => {

  res.status(200).json({
      status: "not ok",
      message: "request not found"
    });
});


module.exports = app;
