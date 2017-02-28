/*global init*/

//load modules
var sysCommands  = require('./modules/sys-commands.js');
var db           = require('./modules/db.js');
var mods         = require('./modules/mods.js');
var commandList  = require('./modules/command-list.js');
var rooms        = require('./modules/rooms.js');
var Discord      = require('discord.io');

//commands with custom actions
var userCmds     = require('./custom_commands/user-commands.js');
var userMentions = require('./custom_commands/user-mentions.js');
var sysTriggers  = require('./custom_commands/system-triggers.js');
var quotes       = require('./custom_commands/quotes.js');
var atEveryone   = require('./custom_commands/at-everyone.js');
var funCommands  = require('./custom_commands/fun-commands.js');
var gif          = require('./custom_commands/giphy-api.js');
var catFact      = require('./custom_commands/cat-fact.js');
var urbanDict    = require('./custom_commands/urban-dictionary.js');

//load config
var config       = require('./config/config.js');
var HTTPS        = require('https');

//Temporarily just an array of the commands functions. Make an object with configuration values.
var checkCommandsHSH = [mods, sysTriggers, userCmds, userMentions, sysCommands, atEveryone, funCommands, quotes, rooms, gif, catFact, urbanDict];
var bot = new Discord.Client({
    token: "MjgzNDcwNzg2MjM1NDY1NzI4.C46wXQ.X4gBZONwMVf06Xk1OgJ9iUg7b6g",
    autorun: true
});


exports.init = function() {
  var req = this.req;
  init.initPage(req, function(body){
    this.res.writeHead(200, {"Content-Type": "text/html"});
    this.res.end(body);
  });
}

exports.respond = function(botRoom) {
  var request = JSON.parse(this.req.chunks[0]);

  var dataHash = {
    request:      request,
    currentBot:   rooms.getRoom(botRoom),
    isMod:        mods.isMod(request.user_id),
    bots:         rooms.getRooms(),
    funMode:      sysCommands.fun_mode(),
    owner:        config.env().owner
  };

  this.res.writeHead(200);
  this.res.end();

  if (dataHash.request.sender_type == 'bot') return;
  dataHash.request.text = dataHash.request.text.trim();

  if (!rooms.getRoom(botRoom).id && botRoom != 'config')
    return;

  for(var lib in checkCommandsHSH) {
    checkCommandsHSH[lib].checkCommands(dataHash, function(check, result, attachments){
      if (check) sendDelayedMessage(result, attachments, rooms.getRoom(botRoom).id);
    });
  }
}

exports.commands = function() {
  var cmdArr = [];

  console.log('displaying commands at /commands');

  for(var lib in checkCommandsHSH){
    var newCmds = checkCommandsHSH[lib].getCmdListDescription();
    if (newCmds)
      cmdArr = cmdArr.concat(newCmds);
  }

  var output = commandList.buildHTML(cmdArr, config.bot_name);

  this.res.writeHead(200, {"Content-Type": "text/html"});
  this.res.end(output);
}

function sendDelayedMessage(msg, attachments, botID) {
  setTimeout(function() {
    postMessage(msg, attachments, botID);
  }, config.delay_time);
}

function postMessage(botResponse, attachments, botID) {
  var options, body, botReq;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "attachments" : attachments,
    "bot_id"      : botID,
    "text"        : botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if (res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

bot.on('ready', function() {
    console.log('Logged in as %s - %s\n', bot.username, bot.id);
});

bot.on('disconnect', function(errMsg, code) {
    console.log('Got disconnected, reconnecting\n');
    bot.connect();
});


bot.on('message', function(user, userID, channelID, message, event) {

// Function for !gif command
  var regex = /^\!gif (.+)/i;
  var temp_message = message;

  if (regex.test(temp_message)){
    var val = regex.exec(temp_message);

    //console.log('Received gif search for %s\n', val[1]);
    //bot.sendMessage({ to: channelID, message: val[1] });

    var options = {
      hostname: "api.giphy.com",
      path: "/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=" + encodeURIComponent(val[1])
    };
  
    var callbackGif = function(response) {
      var str = '';

      response.on('data', function(chunk) {
        str += chunk;
      });

      response.on('end', function() {
        str = JSON.parse(str);

        var msg = '';
        if (typeof(str.data.image_original_url) !== 'undefined'){
          msg = str.data.image_original_url;
        } else {
          msg = "No such GIF silly.";
        }

        var debug1 = "User requested ";
        var debug2 = " and I found this url: ";
        var debug = debug1.concat(val[1], debug2, msg);

        //bot.sendMessage({ to: channelID, message: debug });
        bot.sendMessage({ to: channelID, message: msg });
      });
    };

    HTTPS.request(options, callbackGif).end();
    return true;
  }


// Function for !quote command - just gets a random quote from the database
// There is no functionality in this bot to @ someone in discord yet
  var regex2 = /^\!quote (.+)/i;
  var temp_message2 = message;

  if (regex2.test(temp_message2)){
    var val2 = regex2.exec(temp_message2);

    bot.sendMessage({ to: channelID, message: "quote" });
    var quote = discordRandomQuote();
    bot.sendMessage({ to: channelID, message: quote });
    return true;
  }


// Basic bot response template
//    if (message === "ping") {
//        bot.sendMessage({
//            to: channelID,
//            message: "pong"
//        });
//    }


});