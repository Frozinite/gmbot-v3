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
    warMessage = getHelp();
    return warMessage;
  }

  switch(argsArray[1]){
    case "help":
      warMessage = getHelp();
      break;
    case "schedule":
      warMessage = getSchedule();
      break;
    case "new":
      cmdSaveWar(argsArray);
      break;
    default:
      warMessage = "Invalid command\n\n";
      warMessage += getHelp();
      break;
  }

  return warMessage;
}

function getHelp(){
  var msg = "";

  msg += "**Available war commands\n";
  msg += "  help\n";
  msg += "  schedule\n";
  msg += " **";

  return msg;
}

function getSchedule(){
  var msg = "";

  msg += "**All clans in DTF search for wars on Mondays, Thursdays, and Saturdays.**\n";
  msg += "**Unless otherwise specified, all war searches occur between 4pm PST (7pm EST; 11pm UTC) to 7pm PST (10pm EST; 5am UTC).**\n\n";

  msg += "**Upcoming Arranged Wars:**\n";
  msg += "  none\n";

  return msg;
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


function cmdSaveWar(args) {
//  var val = regex.exec(request.text);
  var callback;
  var msg = "";

  if (args.length == 3) {
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
    var time = date.getTime();
    date = year + "-" + month + "-" + day;

    var warHash = {
      war_id: war_id,
      war_name: war_name,
      date: date
      time: time
    }

    //saveWar(warHash, callback);
    msg = "War saved!";
    return msg;
  } else {
    return "Failed to save war.  You probably gave the wrong arguments, idiot\n";
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
