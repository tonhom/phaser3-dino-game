import Phaser from 'phaser'
import { eventBus } from "../events/EventBus"

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' })
  }

  /**@type {Phaser.Sound.BaseSound} */
  thud = null
  /**@type {Phaser.Time.TimerEvent} */
  timedEvent = null
  initialTime = 0
  /**@type {Phaser.GameObjects.Text} */
  txtTimeCounter = null

  //#region dino game
  floorOffset = 100
  triggerYOffset = 225
  /**@type {Phaser.Physics.Arcade.StaticGroup} */
  platforms = null
  /**@type {Phaser.Physics.Arcade.Group} */
  obstacles = null
  respawnTime = 0
  /**@type {Phaser.Types.Physics.Arcade.SpriteWithDynamicBody} */
  dino = null
  baseGameSpeed = 9
  gameSpeed = 9
  ground = null
  /**@type {Phaser.Sound.BaseSound} */
  jumpSound = null
  /**@type {Phaser.GameObjects.Particles.ParticleEmitter} */
  particleEmitter = null
  isGameRunning = false
  //#endregion

  //#region life-cycle
  create() {
    // var spaceKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE)
    // spaceKey.on('down', () => {
    //   this.thud.play()
    // })
    // console.log(this.scale.orientation, !this.sys.game.device.os.desktop)

    this.startTrigger = this.physics.add.sprite(0, this.sys.canvas.height - this.triggerYOffset).setOrigin(0, 1).setImmovable(0)

    this.createSound()
    this.drawBg()
    this.drawTimer()
    this.drawUI()

    this.createEnvironment()
    this.createPlayer()
    this.handleInputs()
    this.initStartTrigger()
    this.initColliders()

    // this.drawHelloWorld()

    eventBus.on("restartGame", () => {
      this.resetGame()
    })
  }

  update(time, delta) {
    if (!this.isGameRunning) return

    this.ground.tilePositionX += this.gameSpeed

    Phaser.Actions.IncX(this.obstacles.getChildren(), -this.gameSpeed)
    Phaser.Actions.IncX(this.environtment.getChildren(), -0.5)

    // place obstacles
    this.respawnTime += delta * this.gameSpeed * 0.08
    // console.log(this.respawnTime)
    if (this.respawnTime >= 1000) {
      this.createObstacles(delta)
      this.respawnTime = 0
    }

    // performance tune
    this.obstacles.getChildren().forEach((obstacle) => {
      if (obstacle.getBounds().right < 0) {
        obstacle.destroy()
      }
    })

    this.environtment.getChildren().forEach((env) => {
      if (env.getBounds().right < 0) {
        env.x = this.sys.canvas.width + 30
      }
    })

    if (this.dino.body.deltaAbsY() > 0) {
      this.dino.anims.stop();
      this.dino.setTexture('dino', 0);
    } else {
      this.dino.play('dino-run', true);
    }

    // increase difficult
    // if (this.initialTime > 30 && this.initialTime % 10 == 0 && this.gameSpeed < 15) {
    //   this.gameSpeed += 0.05
    //   // increase game speed every 5 second after 30 sec
    // }
  }
  //#endregion

  //#region dino game
  resetGame() {
    this.dino.setVelocityY(0)

    this.physics.resume()
    this.obstacles.clear(true, true)
    this.gameOverScreen.setAlpha(0)
    this.anims.resumeAll()
    this.resetTimer()

    this.isGameRunning = true
  }
  handleInputs() {
    this.restart.on('pointerdown', (pointer, x, y, ev) => {
      // console.log(pointer, x, y, ev)
      ev.stopPropagation()
      this.resetGame()
    })

    this.input.on('pointerdown', () => {
      this.playerJump()
    })
  }

  initStartTrigger() {
    this.physics.add.overlap(this.startTrigger, this.dino, () => {
      if (this.startTrigger.y === this.sys.canvas.height - this.triggerYOffset) {
        this.startTrigger.body.reset(0, this.sys.canvas.height - this.floorOffset)

        return
      }

      // console.log('hit the box')
      this.startTrigger.disableBody(true, true)
      this.dino.setVelocityX(40)
      this.dino.play('dino-run', 1)

      const startEvent = this.time.addEvent({
        delay: 500,
        loop: true,
        callbackScope: this,
        callback: () => {
          this.isGameRunning = true
          this.resetTimer()
          this.dino.setVelocity(0)
          this.environtment.setAlpha(1)
          startEvent.remove()
        }
      })
    }, null, this)
  }

  createSound() {
    this.jumpSound = this.sound.add("jump")
    this.hitSound = this.sound.add("hit")
  }
  createEnvironment() {
    this.obstacles = this.physics.add.group()
    this.physics.world.setBounds(0, 0, this.sys.canvas.width, this.sys.canvas.height - this.floorOffset)
    // this.platforms.create(this.sys.canvas.width, this.sys.canvas.height - this.floorOffset, 'ground').refreshBody()
    const { height, width } = this.sys.canvas;
    this.ground = this.add.tileSprite(0, height - this.floorOffset, width, 26, 'ground').setOrigin(0, 1)

    // sky
    this.environtment = this.add.group()
    this.environtment.addMultiple([
      this.add.image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'cloud'),
      this.add.image(this.sys.canvas.width / 2 - 80, this.sys.canvas.height / 3, 'cloud'),
      this.add.image(this.sys.canvas.width / 2 + 100, this.sys.canvas.height / 4, 'cloud')
    ])
    this.environtment.setAlpha(0)
  }
  createPlayer() {
    const { height } = this.sys.canvas;
    this.dino = this.physics.add.sprite(0, height - this.floorOffset, 'dino-idle')
      .setCollideWorldBounds(true)
      .setGravityY(5000) // easy = 2k, medium = 3.5k, hard = 5k
      .setOrigin(0, 1)
      .setSize(60, 60)
      .setDepth(1)
    // .setTint(100, 100)

    // this.platforms.add(this.dino)
    this.initAnims()
    this.createControl()
  }
  initAnims() {
    this.anims.create({
      key: 'dino-run',
      frames: this.anims.generateFrameNumbers('dino',
        { start: 2, end: 3 }),
      frameRate: 10,
      repeat: -1
    })
  }
  createControl() {
    this.input.keyboard.on('keydown-SPACE', () => {
      this.playerJump()
    })
  }
  playerJump() {
    if (this.physics.world.isPaused) return
    if (!this.dino.body.onFloor() || this.dino.body.velocity.x > 0) { return; }
    this.dino.setTexture('dino', 0);
    this.dino.setVelocityY(-1600);

    this.jumpSound.play()
  }
  createObstacles(delta) {
    const obstacleNum = Math.floor(Math.random() * 6) + 1
    const addiotnalSpace = delta * this.gameSpeed
    // console.log(delta, this.gameSpeed, addiotnalSpace)
    const distance = Phaser.Math.Between(500 + addiotnalSpace, 900)

    // console.log(distance)
    /**@type {Phaser.GameObjects.Image} */
    let obstacle = this.obstacles.create(this.sys.canvas.width + distance, this.sys.canvas.height - this.floorOffset, `obsticle-${obstacleNum}`)

    // obstacle.body.offset.y = +10
    obstacle
      .setOrigin(0, 1)
      .setImmovable()
      .setSize(obstacle.body.width * .9, obstacle.body.height * .8)

    // console.log(obstacleNum, distance)
  }
  initColliders() {
    this.physics.add.collider(this.dino, this.obstacles, () => {
      this.hitSound.play()
      this.physics.pause()
      this.isGameRunning = false
      this.anims.pauseAll()
      this.dino.setTexture('dino-hurt')
      this.respawnTime = 0
      this.gameSpeed = this.baseGameSpeed
      this.timedEvent.remove()
      this.gameOverScreen.setAlpha(1)
      eventBus.emit("onGameEnd", this.initialTime)

    }, null, this)
  }
  //#endregion

  //#region utility
  drawHelloWorld() {
    var particles = this.add.particles('red');
    this.thud = this.sound.add("thud")

    var emitter = particles.createEmitter({
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD'
    });

    var logo = this.physics.add.image(400, 100, 'logo');

    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);

    emitter.startFollow(logo);
  }

  drawBg() {
    // this.add.image(0, 0, 'sky').setOrigin(0).setDisplaySize(this.sys.canvas.width, this.sys.canvas.height)
    // bg.displayWidth = this.cameras.main.width
    // bg.displayHeight = this.cameras.main.height
  }

  drawTimer() {
    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2
    // const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
    this.txtTimeCounter = this.add.text(screenCenterX, 30, 'Timer: ' + this.formatTime(this.initialTime))
      .setOrigin(0.5)
      .setFontSize(30)
      .setFontStyle("bold")
      .setStroke("#000", 4)
      .setDepth(3)
  }

  resetTimer() {
    this.initialTime = 0
    this.txtTimeCounter.setText('Timer: ' + this.formatTime(this.initialTime))
    this.timedEvent = this.time.addEvent({ delay: 1000, callback: this.onTimeRunning, callbackScope: this, loop: true })
  }

  onTimeRunning() {
    this.initialTime++
    this.txtTimeCounter.setText('Timer: ' + this.formatTime(this.initialTime))
  }

  formatTime(seconds) {
    // Minutes
    var minutes = Math.floor(seconds / 60);
    let partInMinute = minutes.toString().padStart(2, '0')
    // Seconds
    var partInSeconds = seconds % 60;
    // Adds left zeros to seconds
    partInSeconds = partInSeconds.toString().padStart(2, '0');
    // Returns formated time
    return `${partInMinute}:${partInSeconds}`;
  }
  drawUI() {
    this.gameOverScreen = this.add.container(this.sys.canvas.width / 2, this.sys.canvas.height / 2 - 50).setAlpha(0).setDepth(2)
    this.gameOverText = this.add.image(0, 0, 'game-over')
    this.restart = this.add.image(0, 80, 'restart').setInteractive()
    this.gameOverScreen.add([
      this.gameOverText,
      this.restart
    ])
  }
  //#endregion
}