// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class HelloWorldScene extends Phaser.Scene {
  constructor() {
    super("hello-world");
  }

  preload() {
    // no external assets required; we'll generate textures at runtime
  }

  create() {
    // background sky-blue
    this.cameras.main.setBackgroundColor('#87CEEB');

    // create a green ground platform split into three parts
    // revert the previous desnivel: center is higher, sides slightly lower
    const groundLeft = this.add.rectangle(200, 580, 400, 48, 0x2ecc40);
    const groundCenter = this.add.rectangle(400, 580, 200, 48, 0x27ae36);
    const groundRight = this.add.rectangle(600, 580, 400, 48, 0x2ecc40);
    this.physics.add.existing(groundLeft, true);
    this.physics.add.existing(groundCenter, true);
    this.physics.add.existing(groundRight, true);

    // create textures for player and falling objects
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // player square texture (black)
    g.fillStyle(0x000000, 1);
    g.fillRect(0, 0, 40, 40);
    g.generateTexture('player-square', 40, 40);
    g.clear();

    // triangle texture (yellow, pointing down)
    g.fillStyle(0xFFD400, 1);
    g.fillTriangle(12, 0, 24, 24, 0, 24);
    g.generateTexture('triangle-yellow', 24, 24);
    g.clear();

    // red circle texture
    g.fillStyle(0xFF2D2D, 1);
    g.fillCircle(12, 12, 12);
    g.generateTexture('circle-red', 24, 24);
    g.clear();

    // blue square (different from player)
    g.fillStyle(0x1f8ef1, 1);
    g.fillRect(0, 0, 32, 32);
    g.generateTexture('square-blue', 32, 32);
    g.clear();

    // green diamond (rombo)
    g.fillStyle(0x27ae60, 1);
    const dw = 28;
    g.fillTriangle(dw / 2, 0, dw, dw / 2, dw / 2, dw);
    g.fillTriangle(dw / 2, 0, 0, dw / 2, dw / 2, dw);
    g.generateTexture('diamond-green', dw, dw);
    g.destroy();

    // player setup
    this.player = this.physics.add.sprite(400, 480, 'player-square');
    this.player.setCollideWorldBounds(true);
    this.player.setDisplaySize(60, 60);
    this.player.body.setSize(60, 60);
    this.player.body.setGravityY(400);
    this.player.setBounce(0);

    // collide player with all ground parts
    this.physics.add.collider(this.player, groundLeft);
    this.physics.add.collider(this.player, groundCenter);
    this.physics.add.collider(this.player, groundRight);

    // invisible side walls to keep falling objects inside the screen
    const wallThickness = 20;
    const leftWall = this.add.rectangle(-wallThickness / 2, 300, wallThickness, 600, 0x000000, 0);
    const rightWall = this.add.rectangle(800 + wallThickness / 2, 300, wallThickness, 600, 0x000000, 0);
    this.physics.add.existing(leftWall, true);
    this.physics.add.existing(rightWall, true);

    // create two small platforms (same height and 1/3 thickness) placed above the main
    const smallHeight = Math.round(64 / 2); // approx one third of center thickness
    const smallWidth = 200;
    const centerTopY = groundCenter.y - (64 / 2);
    const smallY = centerTopY - (smallHeight / 2) - 6; // sit slightly above

    const smallLeft = this.add.rectangle(smallWidth / 2, smallY, smallWidth, smallHeight, 0x1f8ef1);
    const smallRight = this.add.rectangle(800 - smallWidth / 2, smallY, smallWidth, smallHeight, 0x1f8ef1);
    this.physics.add.existing(smallLeft, true);
    this.physics.add.existing(smallRight, true);
    this.physics.add.collider(this.player, smallLeft);
    this.physics.add.collider(this.player, smallRight);

    // group for falling objects (triangles, circles, squares, diamonds)
    this.fallers = this.physics.add.group();

    // collider: fallers vs each ground part -> handle bounce then destroy on second hit
    const fallingGroundCollider = (objA, objB) => {
      let f = null;
      if (objA && objA.getData && objA.getData('isFalling')) f = objA;
      else if (objB && objB.getData && objB.getData('isFalling')) f = objB;
      if (!f) return;
      if (!f.getData('hasBounced')) {
        f.setData('hasBounced', true);
        const kind = f.getData('kind');
        if (kind !== 'circle') {
          f.setData('scoreOnCatch', 2);
        }
      } else {
        f.destroy();
      }
    };

    this.physics.add.collider(this.fallers, groundLeft, fallingGroundCollider);
    this.physics.add.collider(this.fallers, groundCenter, fallingGroundCollider);
    this.physics.add.collider(this.fallers, groundRight, fallingGroundCollider);
    this.physics.add.collider(this.fallers, smallLeft, fallingGroundCollider);
    this.physics.add.collider(this.fallers, smallRight, fallingGroundCollider);
    this.physics.add.collider(this.fallers, leftWall, this.handleSideWallCollision, null, this);
    this.physics.add.collider(this.fallers, rightWall, this.handleSideWallCollision, null, this);

    // overlap: player catches any faller
    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Puntaje: 0', { fontSize: '24px', fill: '#000' });
    this.timeLeft = 60;
    this.timeText = this.add.text(784, 16, '60', { fontSize: '24px', fill: '#000' }).setOrigin(1, 0);
    this.gameEnded = false;

    this.physics.add.overlap(this.player, this.fallers, (player, f) => {
      const scoreOnCatch = f.getData('scoreOnCatch') || 0;
      this.score += scoreOnCatch;
      this.scoreText.setText('Puntaje: ' + this.score);
      f.destroy();
    });

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // spawn objects with an enforced delay between each appearance
    this.spawnTypes = ['triangle', 'circle', 'square', 'diamond'];
    this.lastSpawnType = null;
    this.consecutiveSameCount = 0;
    this.waitingTypes = new Set();
    this.waitingDiffs = {
      triangle: 0,
      circle: 0,
      square: 0,
      diamond: 0,
    };
    this.time.delayedCall(3500, this.spawnFaller, [], this);

    // input
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  spawnFaller() {
    const availableTypes = this.spawnTypes.filter((type) => !this.waitingTypes.has(type));
    let pool = availableTypes.length > 0 ? availableTypes.slice() : this.spawnTypes.slice();

    // if the last spawned type has not yet reached its max repeat, keep it in the random pool
    if (this.lastSpawnType && this.consecutiveSameCount >= 5) {
      pool = pool.filter((type) => type !== this.lastSpawnType);
      if (pool.length === 0) {
        pool = this.spawnTypes.slice();
      }
    }

    const type = pool[Phaser.Math.Between(0, pool.length - 1)];
    const x = Phaser.Math.Between(12, 788);
    let f;
    if (type === 'triangle') {
      f = this.fallers.create(x, 0, 'triangle-yellow');
    } else if (type === 'circle') {
      f = this.fallers.create(x, 0, 'circle-red');
    } else if (type === 'square') {
      f = this.fallers.create(x, 0, 'square-blue');
    } else if (type === 'diamond') {
      f = this.fallers.create(x, 0, 'diamond-green');
    }

    if (type === this.lastSpawnType) {
      this.consecutiveSameCount += 1;
    } else {
      this.consecutiveSameCount = 1;
    }
    this.lastSpawnType = type;

    if (this.consecutiveSameCount >= 5) {
      this.waitingTypes.add(type);
      this.waitingDiffs[type] = 0;
    }

    // update waiting counters for other types
    this.waitingTypes.forEach((waitType) => {
      if (waitType !== type) {
        this.waitingDiffs[waitType] += 1;
        if (this.waitingDiffs[waitType] >= 2) {
          this.waitingTypes.delete(waitType);
          this.waitingDiffs[waitType] = 0;
        }
      }
    });

    f.setData('isFalling', true);
    f.setData('kind', type);
    f.setData('scoreOnCatch', type === 'circle' ? -5 : 5);
    f.setVelocity(Phaser.Math.Between(-20, 20), Phaser.Math.Between(50, 140));
    f.setBounce(0, 0.6);
    f.setCollideWorldBounds(false);
    f.setData('hasBounced', false);
    f.body.setAllowGravity(true);

    // schedule next object after a half second delay from this appearance
    this.time.delayedCall(1000, this.spawnFaller, [], this);
  }

  updateTimer() {
    if (this.gameEnded) {
      return;
    }

    this.timeLeft -= 1;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.timeText.setText('0');
      this.endGame();
    } else {
      this.timeText.setText(this.timeLeft.toString());
    }
  }

  endGame() {
    if (this.gameEnded) {
      return;
    }
    this.gameEnded = true;
    if (this.timerEvent) {
      this.timerEvent.remove(false);
    }
    this.physics.pause();
    this.scene.start('end', { score: this.score });
  }

  handleSideWallCollision(faller) {
    if (!faller || !faller.getData || !faller.getData('isFalling')) {
      return;
    }
    faller.setVelocityX(0);
    const halfWidth = faller.displayWidth / 2;
    if (faller.x < halfWidth) {
      faller.x = halfWidth;
    } else if (faller.x > 800 - halfWidth) {
      faller.x = 800 - halfWidth;
    }
  }

  update() {
    // player movement with arrow keys
    const speed = 375;
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    // up to jump if touching ground
    if (this.cursors.up.isDown && this.player.body.blocked.down) {
      this.player.setVelocityY(-350);
    }
  }
}
