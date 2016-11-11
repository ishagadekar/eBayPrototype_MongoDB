var winston = require( 'winston'); 
var logger = new winston. Logger({ 
	transports: [
            new winston.transports.File({ 
            	level: 'info',
            	timestamp: function() {
            		var time = new Date()
            		var timestamp = time.getFullYear() + "-" + (time.getMonth()+1) + "-"
					+ time.getDate() + " " + time.getHours() + ":" + time.getMinutes()
					+ ":" + time.getSeconds();
            		return timestamp;
            		}, 
            		formatter: function(options) {
            	        // Return string will be passed to logger.
            	        return options.timestamp() +' '+ options.level.toUpperCase() +' '+ (undefined !== options.message ? options.message : '') +
            	          (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
            	      },
            	filename: './logs/ebayLog.log', 
            	logstash: true, 
            	tailable: true, 
            	zippedArchive: true, 
            	json: true, 
            	stringify: true, 
            	prettyPrint: true, 
            	depth: 5, 
            	humanReadabIeUnhand1edException: true, 
            	showLeveI: true, 
            	stderrLeve1s: [ 'error' , 'debug'] 
            }),
            
            new winston. transports . Console({ 
            	level : 'debug' , 
            	handleExceptions: true, 
            	json: false, 
            	colorize: true
            })
          ],
exitOnError: false
});

module.exports = logger; 
module.exports.stream = {
		write: function(message, encoding) {
			logger.info(message);
		}
};