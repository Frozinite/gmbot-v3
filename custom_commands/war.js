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
      warMessage = cmdSaveWar(argsArray);
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

  if (args.length == 7) {
    var war_id = 1;
    var host_clan = args[2]
    var war_name = args[3];
    var date = args[4];
    var time = args[5];
    var timezone = args[6];

    var d = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if(d){
      date = new Date(d[3], d[1]-1, d[2]);

      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      date = month + "-" + day + "-" + year;
    }else{
      msg = "Incorrect date format.  Date must be in the format mm/dd/yyyy.";
      return msg;
    }

    var warHash = {
      war_id: war_id,
      host_clan: host_clan,
      war_name: war_name,
      date: date,
      time: time
    }

    //saveWar(warHash, callback);
    msg = "New war entry created!  " + host_clan + " will be hosting the " + war_name + " war on " + date + " at " + time + "\n";
    return msg;
  } else {
    return "Failed to create a new war entry.  The proper command is \“!war new <host_clan> <opponent> <date> <time> <timezone>\”.  Date must be in the format mm/dd/yyyy.  All other arguments can be in any format, but must be one word.  For example: \“!war new mutiny EE 3/14/2017 5pm EST\” or \“!war new RT potluck 6/23/2017 5pm EST\”\n";
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
