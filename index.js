'use strict';
/**
 * author: Hun VIkran
 * version: 1.0.0
 */
// using dotEnv
require('dotenv').config();

// import cronjob
const CronJob = require('cron').CronJob;

// initialize board_ID
const BOARD_ID = process.env.BOARD_ID;

// import nedb
const DataStore = require('nedb'); const db = new DataStore();
// import trello
const Trello = require('trello');
// put Application key and user token of trello
const trello = new Trello(process.env.APP_KEY, process.env.USR_TOKEN);

// global initialization
let CARDS;

async function requestCardStatus () {
  // Settings: check specific board every 1 minute
  const BOARDS = await trello.getBoards(process.env.MB_ID).catch(err => {
    console.log('An Error Occured:', err);
  });

  const BOARD = BOARDS.filter(board => {
    return board.shortLink === BOARD_ID;
  })[0];

  if (!BOARD) {
    console.log("The specified board isn't found!");
  }

  // get all cards inside specified board
  await trello.getCardsOnBoard(BOARD.id)
    .then(cards => {
      CARDS = cards;
    }).catch(err => {
      console.log('An error occured:', err);
    });
}

// all the function that i use
Array.prototype.diff = function (arr) {
  return this.filter(x => !arr.includes(x));
};
// creating promoise
function getAllCurrentCard (filter) {
  return new Promise(function (resolve, reject) {
    db.find(filter, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function compareReqData () {
  let CURRENT_CARD = []; let REQ_CARD = []; let CARD_DB; let cardToCheckLabel = [];
  let CARD_ADD = []; let CARD_REMOVE = [];

  // main function : compareReqData
  await checkCard();
  checkLabel();

  // Check Card function and Add or Remove Card to DB
  async function checkCard () {
    // get all current card info in DB
    await getAllCurrentCard({}).then(data => {
      CARD_DB = data;
      CURRENT_CARD = data.map(card => {
        return card.shortLink;
      });

      REQ_CARD = CARDS.map(card => {
        return card.shortLink;
      });
    }
    ).catch(err => {
      console.log('An error occured:', err);
    });

    // find card to add
    CARD_ADD = REQ_CARD.diff(CURRENT_CARD);
    // find card to remove
    CARD_REMOVE = CURRENT_CARD.diff(REQ_CARD);

    // find all added card's url
    const newCard = function () {
      return CARD_ADD.map(shortLink => {
        return CARDS.filter(card => {
          return card.shortLink === shortLink;
        })[0];
      });
    };

    // find all removed card's url
    const removeCard = function () {
      return CARD_REMOVE.map(shortLink => {
        return CARD_DB.filter(card => {
          return card.shortLink === shortLink;
        })[0];
      });
    };

    // check if there is any card to add
    if (CARD_ADD.length) {
      db.insert(newCard(), function (err, added) {
        if (err) {
          console.log('An error occured:', err);
        } else {
          console.log('Added Card:');
          added.forEach(card => {
            console.log(card.url);
          });
        }
      });
    }

    // check if there is any card to remove
    if (CARD_REMOVE.length) {
      let errorCard;
      CARD_REMOVE.forEach(link => {
        db.remove({ shortLink: link }, function (err) {
          if (err) {
            console.log('An error occured:', err);
            errorCard = err;
          }
        });
      });
      if (!errorCard) {
        console.log('Removed Card:');
        removeCard().forEach(card => {
          console.log('   ', card.name);
        });
      }
    }
  }

  async function checkLabel () {
    // get all the cards again after adding cards & removing cards
    await getAllCurrentCard({}).then(data => {
      CURRENT_CARD = data.map(card => {
        return card.shortLink;
      });
      // filter for the card that need to check for any label changes only
      cardToCheckLabel = CURRENT_CARD.diff(CARD_ADD).map(shortLink => {
        return [
          data.filter(card => {
            return card.shortLink === shortLink;
          })[0],
          CARDS.filter(card => {
            return card.shortLink === shortLink;
          })[0]
        ];
      });
    }).catch(err => {
      console.log('An error occured:', err);
    });

    function checkLabelOnCard (cards) {
      const CURRENT_LABEL = cards[0].labels.map(label => {
        return label.name;
      });

      const REQ_LABEL = cards[1].labels.map(label => {
        return label.name;
      });

      const LABEL_ADD = REQ_LABEL.diff(CURRENT_LABEL);
      const LABEL_REMOVE = CURRENT_LABEL.diff(REQ_LABEL);

      const LABEL_TO_ADD = LABEL_ADD.map(labelName => {
        return cards[1].labels.filter(label => {
          return label.name === labelName;
        })[0];
      });

      const LABEL_TO_REMOVE = LABEL_REMOVE.map(labelName => {
        return cards[0].labels.filter(label => {
          return label.name === labelName;
        })[0];
      });

      if (LABEL_REMOVE.length) {
        let errorLabel;
        LABEL_TO_REMOVE.forEach(label => {
          db.update({ shortLink: cards[0].shortLink }, { $pull: { labels: label } }, {}, function (err) {
            if (err) {
              console.log('An error occured:', err);
              errorLabel = err;
            }
          });
        });
        if (!errorLabel) {
          console.log('Removed Label:', LABEL_REMOVE, ' from card: ', cards[0].name);
        }
      }

      if (LABEL_ADD.length) {
        db.update({ shortLink: cards[0].shortLink }, { $push: { labels: { $each: LABEL_TO_ADD } } }, {}, function (err) {
          if (err) {
            console.log('An error occured:', err);
          } else {
            console.log('New Label:', LABEL_ADD, ' to card: ', cards[0].name);
          }
        });
      }
    }

    cardToCheckLabel.forEach(cards => {
      checkLabelOnCard(cards);
    });
  }
}

// main function of this whole program
async function start () {
  await requestCardStatus();
  compareReqData();
}

const job = new CronJob('* */1 * * * *', function () {
  start();
});

job.start();
