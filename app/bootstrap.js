
const logger = require('morgan');
const Sentry = require('@sentry/node');
const helmet = require('helmet');
const express = require("express");
const noCache = require('nocache');

const jsonRenderer = require("./../response/json");

module.exports = routing => {
  const app = express();
  app.use(Sentry.Handlers.requestHandler());
  
  app.use(express.json())
  app.use(require('compression')())

  app.use(helmet.xssFilter())
  app.use(helmet.frameguard())
  app.use(noCache())
  app.use(require('cors')());

  app.use(logger('dev'));
  app.use(require( 'hpp' )());

  app.use(i18n.init);

  app.use((req, res, next) => {
    res.jsonRenderer = new jsonRenderer(res);
    next();
  });

  app.use(routing);

  app.use(function (req, res) {
    process.traceLog("warning", "Response path not found", __filename, __linenumber);
    res.jsonRenderer.renderNotFound();
  });

  app.use((err, req, res, next) => {
    if (res.headersSent) {
      process.traceLog("warning", "Response error but header already sent", __filename, __linenumber);
      return next(err)
    }
    const getRenderer = res => {
      if(res.jsonRenderer){
        return res.jsonRenderer;
      }
      return new jsonRenderer(res);
    }
    if(err.code == "EBADCSRFTOKEN"){
      process.traceLog("warning", "Bad CSRF token", err, __filename, __linenumber);      
      getRenderer(res).renderForbidden(err.message);
    }else{
      process.traceLog("warning", "System error", __filename, __linenumber, err, scene);
      getRenderer(res).renderError();
    }
  });

  process.traceLog("info", "API bootstrapping finish", __filename, __linenumber);  
  app.listen(process.env.APP_PORT, () => console.log(`Listening on port ${process.env.APP_PORT}!`));
}