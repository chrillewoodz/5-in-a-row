class View {

  tilesView = [];
  boardView = document.querySelector('#board');
  currentPlayerView = document.querySelector('#current-player');
  newGameBtn = document.querySelector('#new-game');

  constructor() {

    this.newGameBtn.addEventListener('click', () => {
      game.resetGame();
      game.startGame();
    });

    this.createBoard();
  }

  createBoard() {

    // Create a 20x20 grid
    for (let i = 1; i < 21; i++) {
      for (let j = 1; j < 21; j++) {

        const tile = document.createElement('div');
              tile.classList.add('tile');
              tile.dataset.row = i;
              tile.dataset.column = j;

        this.boardView.appendChild(tile);
        this.tilesView.push(tile);
        this.prepareTile(tile);
      }
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

      const currentPlayer = game.state.currentPlayer;
      const marker = document.createElement('img');
            marker.src = `./assets/5-in-a-row-marker-${currentPlayer.color}.svg`;
      
      tile.appendChild(marker);

      currentPlayer.addTile({
        row: parseInt(tile.dataset.row),
        column: parseInt(tile.dataset.column)
      });

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

      const horizontalCondition = check((i) => {
        return !!populatedTiles.find((o) => {
          return (o.column === tile.column + i) && o.row === tile.row;
        });
      });

      // Horizontally
      if (horizontalCondition) {
        return true;
      }

      const diagonalRightCondition = check((i) => {
        return !!populatedTiles.find((o) => {
          return (o.column === tile.column + i) && (o.row === tile.row + i);
        });
      });

      // Diagonally (right)
      if (diagonalRightCondition) {
        return true;
      }

      const diagonalLeftCondition = check((i) => {
        return !!populatedTiles.find((o) => {
          return (o.column === tile.column - i) && (o.row === tile.row + i);
        });
      });

      // Diagonally (left)
      if (diagonalLeftCondition) {
        return true;
      }

      const verticalCondition = check((i) => {
        return !!populatedTiles.find((o) => {
          return (o.column === tile.column) && (o.row === tile.row + i);
        });
      });

      // Vertically
      if (verticalCondition) {
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

  addTile(info) {
    this.populatedTiles.push(info);
    this.populatedTiles.sort((a, b) => a.column - b.column); // Asc order
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
    this.view = new View();
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