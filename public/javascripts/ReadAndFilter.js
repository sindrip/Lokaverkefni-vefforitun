let change = 0;
let stopdot = false;
// animates dot, replace with better later
function move() {
  if (stopdot) {
    return;
  }
  if (change === 0) {
    document.getElementById('loadingdots1').className = 'loadingdots hide';
    document.getElementById('loadingdots2').className = 'loadingdots hide';
    document.getElementById('loadingdots3').className = 'loadingdots hide';
    change = 1;
  } else if (change === 1) {
    document.getElementById('loadingdots1').className = 'loadingdots';
    change = 2;
  } else if (change === 2) {
    document.getElementById('loadingdots2').className = 'loadingdots';
    change = 3;
  } else {
    document.getElementById('loadingdots3').className = 'loadingdots';
    change = 0;
  }
  setTimeout(move, 1000);
}
// give user the 'tip'
function showTheTip() {
  let elementVis = document.getElementById('tooltiptext');
  if (elementVis.style.visibility === 'visible') {
    elementVis.style.visibility = 'hidden';
  } else {
    elementVis.style.visibility = 'visible';
  }
}
// on file hover make green
function allowDrop(event) {
  event.preventDefault();
  document.getElementById('input').style.transitionDuration = '0.4s';
  document.getElementById('input').style.backgroundColor = '#5DFC0A';
}
// on file !hover make default
function noDrop(event) {
  event.preventDefault();
  document.getElementById('input').style.backgroundColor = '#f1f1f1';
}
// on file drop start the party
function drop(event) {
  event.preventDefault();
  // console.log(event.dataTransfer.items.webkitGetAsEntry().isDirectory());
  dataMinifyParser(event.dataTransfer.items);
}
let numOfFiles = 0;
let counter = 0;
// gets info from files
function dataMinifyParser(fileEvent) {
  document.getElementById('input').className = 'input hide';
  document.getElementById('process').className = 'process';
  move();
  if (fileEvent.length < 15) {
    document.getElementById('input').className = 'input';
    document.getElementById('process').className = 'process hide';
    document.getElementById('input').style.backgroundColor = '#f1f1f1';
    if (document.getElementById('inputText').childNodes.length > 2) {
      return;
    }
    const itp = document.createElement('p');
    itp.innerHTML = 'You need to drop more files!';
    document.getElementById('inputText').appendChild(itp);
    return;
  }
  for (let i = 0; i < fileEvent.length; i += 1) {
    fileEvent[i].webkitGetAsEntry().file(
      (file) => {
        if (file.size < 10000000) {
          numOfFiles += 1;
          dataMinify(file);
        }
      });
  }
}
// gets info from files part 2
function dataMinify(file) {
  let reader = new FileReader();
  reader.onload = () => {
    let text = reader.result;
    reader = null;
    let textArray = text.split('\n');
    let reducedArray = textArray.filter(input =>
      (input.includes('GAMESTATE_GAMELOOP Begin') ||
              input.includes('"exit_code":"EXITCODE') ||
              input.includes('Spawning champion') ||
              input.includes('Build Version: Version') ||
              input.includes('The Killer was'))
    );
    const dateIndex = textArray[0].indexOf('started at') + 11;
    const date = stringToDate(textArray[0].substring(dateIndex, dateIndex + 19));
    reducedArray.unshift(date);
    procTest(reducedArray);
    text = null;
    textArray = null;
    reducedArray = null;
    counter += 1;
    if (counter === numOfFiles) {
      // why is timeout here?
      setTimeout(() => {
        stopdot = true;
        urvinnsla();
      }, 2000);
    }
  };
  reader.readAsText(file);
}

// makes date object from string date object
function stringToDate(stringDate) {
  return new Date(stringDate.replace('T', ' ').replace(/-/g, '/'));
}
// parses info from files
function procTest(textFile) {
  try {
    (() => {
      const infoArray = {
        date: textFile.shift(),
        patch: null,
        players: [],
        bot_count: 0,
        loading_time: null,
        game_time: null,
        deaths: [],
        game_result: null,
      };
      const patchLine = textFile.shift();
      const patchStart = patchLine.substring(patchLine.indexOf('Build Version: Version') + 23);
      const patchString = patchStart.substring(0, patchStart.indexOf('.', 3));
      const patchSplit = patchString.split('.');
      infoArray.patch = patchString;
      if (patchSplit[0] > 3 || (patchSplit[0] * 1 === 3 && patchSplit[1] * 1 > 9)) {
        const gameEndLine = textFile.filter(input => input.includes('"exit_code":"EXITCODE'))[0];
        const gameResultCarNr = gameEndLine.indexOf('"Game exited","exit_code":"');
        infoArray.game_result = gameEndLine.substring(gameResultCarNr + 36, gameResultCarNr + 37);
        // if abandoned game, throw away
        if (infoArray.game_result !== 'A') {
          const summonerArray = textFile.filter(input => input.includes('Spawning champion'));
          summonerArray.forEach((itemIn) => {
            let item = itemIn;
            const tempChamp = item.substring(item.indexOf('(') + 1, item.indexOf(')'));
            item = item.substring(item.indexOf(')') + 1);
            const tempSkin = item.substring(item.indexOf('skinID') + 7, item.indexOf('skinID') + 8);
            const tempTeam = item.substring(item.indexOf('team') + 5, item.indexOf('team') + 6);
            const tempName = item.substring(item.indexOf('(') + 1, item.indexOf(')'));
            item = item.substring(item.indexOf(')') + 1);
            const tempType = item.substring(item.indexOf('(') + 1, item.indexOf(')'));
            if (tempType === 'is BOT AI') {
              infoArray.bot_count += 1;
            } else {
              const playerArray = {
                // k
                champion: null,
                skin: null,
                team: null,
                summonername: null,
                playertype: null,
              };
              playerArray.champion = tempChamp;
              playerArray.skin = tempSkin;
              playerArray.team = tempTeam;
              playerArray.summonername = tempName;
              playerArray.playertype = tempType;
              if (infoArray.players.length < 11) {
                infoArray.players.push(playerArray);
              }
            }
          });
          infoArray.loading_time = textFile.filter(input => input.includes('GAMESTATE_GAMELOOP Begin'))[0].substring(0, 10) - 0;
          infoArray.game_time = gameEndLine.substring(0, 10) - infoArray.loading_time;
          const deathArray = textFile.filter(input => input.includes('The Killer was'));
          deathArray.forEach((item) => {
            const deathTime = item.substring(0, 10) - infoArray.loading_time;
            infoArray.deaths.push(deathTime);
          });
          filteredDB.push(infoArray);
        }
      }
    })();
  } catch (err) {
    errorCount += 1;
  }
}
let errorCount;
