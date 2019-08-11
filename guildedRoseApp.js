"use strict";

// Add in required 3rd party libraries
let express = require('express')
let bodyParser = require('body-parser')
let path = require('path');
const logger = require('morgan');
let readline = require('readline');

// Add in required product js libraries
let ChatResponse = require('./includes/ChatResponse.js');
let InventoryManager = require('./includes/InventoryManager.js');

// Pull in the inventory at startup
InventoryManager.uploadInventory();

let promtpOutput = "";
let patronbuy = false;
let patronsell = false;
let showitem = false;

// Begin to setup web server
let app = express();

// Set webserver configuration
global.appRoot = path.resolve(__dirname);
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(logger('dev'));
// Handle intercept OPTIONS method
app.use(function(req, res, next) {
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        res.send(200);
    }
    else {
        next();
    }
});
app.use(bodyParser.json({ limit: '5mb' }));
app.use(express.cookieParser());
app.use(express.static(__dirname + '/www'));
app.use(app.router);

app.use(function (error, req, res, next) {
    if (!error) {
        next();
    } else {
        console.error('My stack error:  ', error.stack);
        res.send(500);
    }
});

// Define REST API
const inventoryApi = require('./routes/inventory-api');

// Link data connectors to REST API routes
inventoryApi.linkInventoryData(InventoryManager);
inventoryApi.linkCharResponder(ChatResponse);

// Initialize REST API routes to the webserver
inventoryApi.router(app);

app.get('/test', function(req, res){
   res.end('got a connection');
});

// Set and initalize only one webpage
app.get('/', function(req, res, next){
    res.status(200).render('inventory-main');
});

module.exports = app;

// Turn on webserver to listen on desired port
if (require.main === module) {
  app.listen(4000, () => console.log('Listening in dev mode on port 4000'));
  app.on('error', e => console.error("Webserver error:  ",e));
}

// ================================================
// Create a menu prompt for commandline interaction
let rl = readline.createInterface(process.stdin, process.stdout);

promtpOutput = ChatResponse.getIntroduction() + '\n' + ChatResponse.displayMenuOptions();
rl.setPrompt(promtpOutput);
rl.prompt();

//const menu = [ "0. Tell me some local gossip",
//   "1. Ask for the entire list of inventory",
//	"2. Ask for the details of a single item by name",
//	"3. Progress to the next day",
//	"4. List of trash we should throw away (Quality = 0)",
//	"5. Buy",
//	"6. Sell",
//	"7. Restart inventory",
//   "8. Never Come Back"]
   
rl.on('line', function(line) {
   if (line === "0" ) { 
      // Get local drama
      promtpOutput = ChatResponse.getRandomGossip() + '\n' + '\n' + ChatResponse.displayMenuOptions();
   }
   else if ( line === "1" ) {
      // 1. Ask for the entire list of inventory
      promtpOutput = InventoryManager.showInventory() + '\n' + '\n' + ChatResponse.displayMenuOptions();
   }
   else if ( line === "2" ) {
      // 2. Ask for the details of a single item by name
	  showitem = true;
	  promtpOutput = ChatResponse.displayShowInfo();
   }
   else if ( line === "3" ) {
      // 3. Progress to the next day
      InventoryManager.incrementDay();
      promtpOutput = ChatResponse.displayMenuOptions();
   }
   else if ( line === "4" ) {
      // 4. List of trash we should throw away (Quality = 0)
      promtpOutput = InventoryManager.showTrashInventory() + '\n' + '\n' +  ChatResponse.displayMenuOptions();
   }
   else if ( line === "5" ) {
      // 5. Patron Buy"
      patronbuy = true;
      promtpOutput = ChatResponse.displayStoreSellsInfo();
   }
   else if ( line === "6" ) {
      // 6 Patron Sell
      patronsell = true;
      promtpOutput = ChatResponse.displayStoreBuysInfo();
   }
   else if ( line === "7" ) {
      // 7. Restart program
      InventoryManager.restartInventory();
      promtpOutput = InventoryManager.showInventory() + '\n' + ChatResponse.displayMenuOptions();
   }
   else if ( line === "8" ) {
      // 8. Never Come Back
      // Store inventory for next time
      InventoryManager.packUpInventory();
      rl.close();
   }
   else if (showitem) {
      promtpOutput = InventoryManager.showItem(line) + '\n' + '\n' +  ChatResponse.displayMenuOptions();
      showitem =  false;
   }   
   else if (patronbuy) {
      if (InventoryManager.removeItem(line)) {
         promtpOutput = ChatResponse.patronBoughtDisplayMenuOptions(line);
      }
      else {
         promtpOutput = ChatResponse.errorDisplayMenuOptions();
      }
      patronbuy =  false;
   }
   else if (patronsell) {
      if (InventoryManager.addItem(line)) {
         promtpOutput = ChatResponse.patronSoldDisplayMenuOptions(line) ;
       }
      else {
         promtpOutput = ChatResponse.errorDisplayMenuOptions();
      }
      patronsell =  false;
   }
   else {
      promtpOutput = ChatResponse.warningDisplayMenuOptions();
   }

   rl.setPrompt(promtpOutput);
   rl.prompt();

}).on('close',function(){
    process.exit(0);
});


