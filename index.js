class View {

  tilesView = [];
  boardView = document.querySelector('#board');
  currentPlayerView = document.querySelector('#current-player');
  newGameBtn = document.querySelector('#new-game');
  tiles;

  constructor(tiles) {

    this.tiles = tiles;

    this.newGameBtn.addEventListener('click', () => {
      game.resetGame();
      game.startGame();
    });

    this.createBoard();
  }

  createBoard() {

    for (let i = 0; i < this.tiles; i++) {

      const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.id = i;

      this.boardView.appendChild(tile);
      this.tilesView.push(tile);
      this.prepareTile(tile);
    }
  }

  resetBoard() {

    this.tilesView.forEach((tile) => {
      
      while (tile.firstChild) {
        tile.removeChild(tile.firstChild);
      }
    });
  }

  prepareTile(tile) {

    tile.addEventListener('click', (e) => {

      if (!game.state.isGameActive || !!tile.firstChild) {
        return;
      }

      const i = document.createElement('i');
            i.classList.add('marker', game.state.currentPlayer.color, 'fas', 'fa-circle');
      
      tile.appendChild(i);

      game.state.currentPlayer.addTile(tile.id);
      game.engine.endTurn();
    });
  }

  showAlert(msg) {

    const alertBox =  document.querySelector('.alert-box');
          alertBox.classList.add('active');
          alertBox.textContent = msg;

    setTimeout(() => {
      alertBox.classList.remove('active');
    }, 2000);
  }

  updateCurrentPlayer() {

    const {name, color} = game.state.currentPlayer;

    this.currentPlayerView.textContent = `${name} (${color})`;
  }
}

class Engine {

  nextTurn() {

    if (game.state.currentPlayer === game.players.one) {
      game.state.currentPlayer = game.players.two;
    }
    else {
      game.state.currentPlayer = game.players.one;
    }

    game.view.updateCurrentPlayer();
  }

  endTurn() {

    const populatedTiles = game.state.currentPlayer.populatedTiles;

    if (populatedTiles.length < 5) {
      this.nextTurn();
    }
    else {
      this.checkForWinner();
    }
  }

  checkForWinner() {

    function check(condition) {

      let inARow = 0;

      for (let i = 0; i < 5; i++) {

        if (condition(i)) {
          inARow++;
        }
      }

      // Since i doesn't go higher than 5 we don't
      // have to do a >= 5 check here
      if (inARow === 5) {
        return true;
      }
    }

    const populatedTiles = game.state.currentPlayer.populatedTiles;

    const hasWinner = populatedTiles.some((tile) => {

      // Horizontally
      if (check((i) => populatedTiles.includes(tile + i))) {
        return true;
      }

      // Diagonally (right)
      if (check((i) => populatedTiles.includes(tile + (i * 21)))) {
        return true;
      }

      // Diagonally (left)
      if (check((i) => populatedTiles.includes(tile + (i * 19)))) {
        return true;
      }

      // Vertically
      if (check((i) => populatedTiles.includes(tile + (i * 20)))) {
        return true;
      }
    });

    if (!hasWinner && game.players.two.populatedTiles.length < 200) {
      this.nextTurn();
    }
    else {
      game.endGame(true);
    }
  }
}

class Player {

  populatedTiles = [];

  constructor(id, name, color) {
    this.id = id;
    this.name = name;
    this.color = color;
  }

  addTile(tileId) {
    this.populatedTiles.push(parseInt(tileId));
    this.populatedTiles.sort((a, b) => a - b);
  }

  reset() {
    this.populatedTiles = [];
  }
}

class State {
  isGameActive = false;
  currentPlayer;

  freeze() {
    this.isGameActive = false;
  }

  resume() {
    this.isGameActive = true;
  }
}

class Game {

  players;

  constructor() {
    this.engine = new Engine();
    this.state = new State();
    this.view = new View(400);
    this.players = {
      one: new Player(1, 'Snakeboi229', 'black'),
      two: new Player(2, '360noscopingyourmom', 'white')
    }
    this.state.currentPlayer = this.players.one;
  }

  resetGame() {
    this.view.resetBoard();
    this.players.one.reset();
    this.players.two.reset();
    this.state.currentPlayer = this.players.one;
    this.view.updateCurrentPlayer();
  }

  startGame() {
    this.state.resume();
    this.view.updateCurrentPlayer();
  }

  endGame(hasWinner) {

    if (hasWinner) {
      this.view.showAlert(`${game.state.currentPlayer.name} wins!`);
    }
    else {
      this.view.showAlert('It ends in a draw!');
    }

    game.state.freeze();
  }
}

const game = new Game();

game.startGame();