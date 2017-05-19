var db = require('../modules/db.js');
var db_table = 'wars';


exports.warParser = function(command, callback) {
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
    warMessage = getHelp(callback);
    return warMessage;
  }

  switch(argsArray[1]){
    case "help":
      warMessage = getHelp(callback);
      break;
    case "schedule":
      warMessage = getSchedule(callback);
      break;
    case "new":
      warMessage = cmdSaveWar(argsArray, callback);
      break;
    default:
      warMessage = "Invalid command\n\n";
      warMessage += getHelp(callback);
      break;
  }

  return warMessage;
}

function getHelp(callback){
  var msg = "";

  msg += "**Available war commands**\n”;
  msg += "  **help** – Prints this message\n”;
  msg += "  **schedule** – Lists all upcoming wars\n”;
  msg += "  **new** – Create a new war entry\n”;
//  msg += " **";

  callback(msg);
  return msg;
}

function getSchedule(callback){
  var msg = "";

  findAllWars(function(docs){

    msg += "**All clans in DTF search for wars on Mondays, Thursdays, and Saturdays.**\n";
    msg += "**Unless otherwise specified, all war searches occur between 3pm PST (6pm EST; 10pm UTC) to 6pm PST (9pm EST; 4am UTC).**\n\n";

    // Query the database for all the wars
    msg += "**Upcoming Arranged Wars:**\n";

    for(var count = 0; count <= docs.length-1; count++){
      //console.log("Got a war \n");
      //console.log(docs[count]);
      //console.log(docs[count].host_clan);
      //console.log(docs[count].war_name);
      //console.log(docs[count].date);
      //console.log(docs[count].time);
      //msg += "  Got a war \n";
      msg += "- " + docs[count].war_name + " war hosted at " + docs[count].host_clan + " on " + docs[count].date + " at " + docs[count].time + "\n";
    }

    if (docs.length == 0){
      msg += "  none\n";
    }

    callback(msg);
    return msg;
  });
}

function saveWar(warHash, callback){
  db.addDoc(db_table, warHash, callback);
}

function findWar(id, callback){
  db.findDocs(db_table, {war_id: id}, callback);
}

function findAllWars(callback){
  db.getAllDocuments(db_table, callback);
}

function countWars(callback){
  db.countDocs(db_table, callback)
}

function cmdSaveWar(args, callback) {
  var msg = "";

  if (args.length == 7) {
    // database queries are asynchronous, forcing everything into a callback
    countWars(function(result){

      var war_id = result+1;
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
        date = month + "/" + day + "/" + year;
      }else{
        msg = "Incorrect date format.  Date must be in the format mm/dd/yyyy.";
        callback(msg);
      }

      var warHash = {
        war_id: war_id,
        host_clan: host_clan,
        war_name: war_name,
        date: date,
        time: time
      }

      saveWar(warHash, callback);
      msg = "New war entry created!  " + host_clan + " will be hosting the " + war_name + " war on " + date + " at " + time + ".  The war_id is " + war_id + ".\n";

      callback(msg);
    });

  } else {
    msg = "Failed to create a new war entry.  The proper command is \“!war new <host_clan> <opponent> <date> <time> <timezone>\”.  Date must be in the format mm/dd/yyyy.  All other arguments can be in any format, but must be one word.  For example: \“!war new mutiny EE 3/14/2017 5pm EST\” or \“!war new RT potluck 6/23/2017 5pm EST\”\n";

    callback(msg);
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
