const winston=require('winston')

const logger = winston.createLogger({
    transports: [
      new winston.transports.Console({colorize: true,prettyPrint: true}),
      new winston.transports.File({ filename: 'logerror.log' ,level: 'error',colorize: true,prettyPrint: true})
    ]

   
  });

  winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    debug: 'green'
});

  exports.logger=logger


