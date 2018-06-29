
var N_SIZE = 3,
  EMPTY = '&nbsp;',
  boxes = [],
  turn = 'X', // The oferrer starts as X
  moves;

const TURNS = ['X', 'O'];

function onMessageUpdateState(obj) {
  const data = JSON.parse(obj);
  const cell = boxes.find((cell) => cell.identifier === data.identifier);
  updateTile.call(cell);
  toggleGameLock();
}

function broadcastUpdateState(obj) {
  const data = JSON.stringify(obj);
  if (RTC.thisPeer === 'offerer') {
    Offerer.dataChannel.send(data);
  } else if (RTC.thisPeer === 'answerer') {
    Answerer.dataChannel.send(data);
  } else {
    console.error('WHO AM I');
  }
}

function startGame() {
  AAS.actions.hideItem(null, ['iBIjykYH', 'yXzVEYTG', 'ZMajWxcn', 'axOhGlJz', 'sYsZuBxP']);
  init();
}

function gameOver() {
  AAS.actions.showItem(null, ['tyBsidid']);
  AAS.actions.hideItem(null, ['game'])
}

function toggleGameLock() {
  document.getElementById('game').classList.toggle('locked');
}

// function broadcast

/**
 * Initializes the Tic Tac Toe board and starts the game.
 */
function init() {
  var board = document.createElement('table');
  board.setAttribute('border', 1);
  board.setAttribute('cellspacing', 0);

  var identifier = 1;
  for (var i = 0; i < N_SIZE; i++) {
    var row = document.createElement('tr');
    board.appendChild(row);
    for (var j = 0; j < N_SIZE; j++) {
      var cell = document.createElement('td');
      // cell.setAttribute('height', 120);
      // cell.setAttribute('width', 120);
      cell.setAttribute('align', 'center');
      cell.setAttribute('valign', 'center');
      cell.classList.add('col' + j, 'row' + i);
      if (i == j) {
        cell.classList.add('diagonal0');
      }
      if (j == N_SIZE - i - 1) {
        cell.classList.add('diagonal1');
      }
      cell.identifier = identifier;
      cell.addEventListener('click', set);
      row.appendChild(cell);
      boxes.push(cell);
      identifier += identifier;
    }
  }

  document.getElementById('game').appendChild(board);
  startNewGame();
}

/**
 * New game
 */
function startNewGame() {
  moves = 0;
  turn = 'X';
  boxes.forEach(function (square) {
    square.classList.remove(...TURNS);
  });
}

/**
 * Check if a win or not
 */
function win(clicked) {
  // Get all cell classes
  var memberOf = clicked.className.split(/\s+/);
  for (var i = 0; i < memberOf.length; i++) {
    var testClass = '.' + memberOf[i];
    var items = contains('#game ' + testClass, turn);
    // winning condition: turn == N_SIZE
    if (items.length == N_SIZE) {
      return true;
    }
  }
  return false;
}

/**
 * Helper function to check if NodeList from selector has a particular text
 */
function contains(selector, text) {
  var elements = document.querySelectorAll(selector);
  return [].filter.call(elements, function (element) {
    return element.classList.contains(text);
  });
}

/**
 * Sets clicked square and also updates the turn.
 */
function set() {
  if (this.classList.contains(...TURNS)) {
    return;
  }

  broadcastUpdateState({ identifier: this.identifier });
  updateTile.call(this);
  toggleGameLock();
}

function updateTile() {
  this.classList.toggle(turn)
  moves += 1;

  if (win(this)) { // winning
    gameOver();
    // alert('Winner: Player ' + turn);

  } else if (moves === N_SIZE * N_SIZE) { // draw
    gameOver();

  } else {
    turn = turn === 'X' ? 'O' : 'X';
  }
}
