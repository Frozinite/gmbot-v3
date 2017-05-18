var db = require('../modules/db.js');
var db_table = 'wars';


exports.warParser = function(command) {
  var warMessage = "";

  var argsArray = [];
  var regex = / ?(\S+) ?/ig;
  var n = 0;

  while ((tmp = regex.exec(command)) !== null){
    argsArray[n] = tmp[0].trim();
    //warMessage = "Found argument " + n + " " + regex5argsArray[n] + "\n";
    //bot.sendMessage({ to: channelID, message: warMessage });
    n++;
  }

    // No command or arguments, give list of commands
    if (argsArray.length == 1){
      warMessage = "**Available war commands\n  list\n **";
    }



  return warMessage;
}


function saveWar(warHash, callback){
  db.addDoc(db_table, warHash, callback);
}

function findWar(id, callback){
  db.findDocs(db_table, {war_id: id}, callback);
}

function countWars(callback){
  db.countDocs(db_table, callback);
}


function cmdSaveWar(request, callback) {
  var regex = /^\/quote save ([\s\S]+)/i;

  if (regex.test(request.text)){
    
    var val = regex.exec(request.text);
    var msg = "";

    if (!request.attachments[0].user_ids) {
      msg = "You have to @user for the person you're trying to quote.";
    } else if (!request.attachments[0].loci[0][1] == 12) {
      msg = "Please @the person you're quoting before their message. EX: /quote save @user this is their quote";
    } else if (request.attachments[0].user_ids.length > 1) {
      msg = "You can only quote 1 user at a time.";
    } else if (val[1].length <= request.attachments[0].loci[0][1]){
      msg = "... You want to quote their silence?";
    } else {
      var user_id = request.attachments[0].user_ids[0];

      var start = request.attachments[0].loci[0][0];
      var end = start + request.attachments[0].loci[0][1];
      var user_name = request.text.substring(start, end);

      var quote = request.text.substring(end, request.text.length);
      quote = quote.trim();


      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      date = year + "-" + month + "-" + day;
      var warHash = {
        user_id: user_id,
        user_name: user_name,
        war: war,
        date: date
      }

      saveWar(warHash);
      msg = "War saved!";
    }
    callback(msg);
    return msg;
  } else {
    return false;
  }
}

function cmdGetWar(request, callback) {
  var regex = /^\/quote (.+)/i;

  if (regex.test(request.text)){

    if (!request.attachments[0].user_ids)
      return "You have to @user for the person you're trying to quote.";

    findQuotes(request.attachments[0].user_ids[0], function(docs){
      if (docs.length > 0){
        var rnd = Math.floor(Math.random() * docs.length);
        var msg = '"' + docs[rnd].quote + '" - ' + docs[rnd].date;
        callback(msg);
      }
    });
    return true;
  } else {
    return false;
  }
}
