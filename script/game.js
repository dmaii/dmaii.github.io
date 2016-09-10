var WIDTH = 500;
var HEIGHT = 320;

var MOVESPEED = 1;
var keyMappings = {
  37: 'left',
  39: 'right'
};

var gameOver = false;

var player = {
  color: "#00A",
  x: 220,
  y: 300,
  width: 100,
  height: 20,
  draw: function(context) {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);

  },
  move: function(direction) {
    if (direction === "left" && this.x > 0) {
      this.x = this.x - MOVESPEED;
    } else if (direction === "right" && this.x < WIDTH - this.width) {
      this.x = this.x + MOVESPEED;
    } else if (direction === "down" && this.y < HEIGHT - this.height) {
      this.y = this.y + MOVESPEED;
    } else if (direction === "up" && this.y > 0) {
      this.y = this.y - MOVESPEED;
    }
  },
  hasCollided: function(ball) {
    var xExceedsBounds, yExceedsBounds;

    if (ball.x >= this.x && ball.x <= (this.x + this.width) && ball.y === this.y) {
      return 'horizontalCollision';
    }

    if (ball.y >= this.y && ball.x === this.x) {
      return 'verticalCollision';
    }

    return false;

  }
};

var collidables = [];

var ball = {
  color: "#000",
  x: player.x,
  y: player.y - 10,
  xVelocity: -1,
  yVelocity: 1,
  radius: 10,
  _checkCollisions: function(context) {
    if (ball.x === 0 || ball.x === WIDTH) {
      return 'verticalCollision';
    } else if (ball.y === 0 || ball.y === HEIGHT) {
      return 'horizontalCollision';
    }

    for (var i = 0; i < collidables.length; i++) {
      var collidable = collidables[i];

      var hasCollided = collidable.hasCollided(this);
      if (hasCollided !== false) {
        if (collidable.block === true) {
          collidable.block = false;
          context.clearRect(collidable.x, collidable.y, collidable.width, collidable.height);
        }
        return hasCollided;
      }
    }
    return false;
  },
  draw: function(context) {
    var checkedCollisions = this._checkCollisions(context);

    if (checkedCollisions === 'verticalCollision') {
      this.xVelocity = -this.xVelocity;
    } else if (checkedCollisions === 'horizontalCollision') {
      this.yVelocity = -this.yVelocity;
    }

    this.x = this.x + this.xVelocity;
    this.y = this.y - this.yVelocity;

    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
    context.fillStyle = 'green';
    context.fill();
  }
};

function Block(x, y) {
  this.x = x;
  this.y = y;

  this.width = 100;
  this.height = 30;

  this.block = true;
  this.color = getRandomColor();

  this.hasCollided = function(ball) {
    if (this.block === false) {
      return false;
    }

    var inXRange = ball.x >= this.x && ball.x <= this.x + this.width;
    var inYRange = ball.y >= this.y && ball.y <= this.y + this.height;

    if (inXRange && inYRange) {
      if (ball.x === this.x || ball.x === this.x + this.width) {
        return 'verticalCollision';
      } else if (ball.y === (this.y + this.height)) {
        return 'horizontalCollision';
      }
    } else {
      return false;
    }

  };

  this.draw = function(context) {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);
  };
}

function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

var blocks = [];

function spawnBlocks(context) {
  for (var i = 0; i < 2; i++) {
    for (var ii = 0; ii < 5; ii++) {
      var block = new Block(ii * 100, i * 30);
      blocks.push(block);
      collidables.push(block);
      block.draw(context);
    }
  }
}

var keydown = {};
var intervalID;

function draw(context) {
  Object.keys(keydown).forEach(function(key) {
    if (keydown[key]) {
      player.move(keyMappings[key]);
    }
  });

  ball.draw(context);
  var blockCount = 0;
  collidables.forEach(function(collidable) {
    if (collidable.block === true) {
      blockCount++;
      collidable.draw(context);
    } else if (collidable.block === undefined) {
      collidable.draw(context);
    }
  });

  if (ball.y === HEIGHT) {
    clearInterval(intervalID);
    //alert('game over :( refresh to try again!');
  }

  if (blockCount === 0) {
    clearInterval(intervalID);
    alert('you win! :)');
  }
}

$("canvas").ready(function() {
  var canvas = $("canvas")[0];
  var context = canvas.getContext("2d");

  $(document).bind("keydown", function(event) {
    keydown[event.which] = true;
  });

  $(document).bind("keyup", function(event) {
    keydown[event.which] = false;
  });

  collidables.push(player);
  spawnBlocks(context);

  var FPS = 300;
  intervalID = setInterval(function() {
    context.clearRect(0, 0, WIDTH, HEIGHT);
    draw(context);
  }, 1000/FPS);
});
