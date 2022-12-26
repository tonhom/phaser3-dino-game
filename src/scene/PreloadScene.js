
import Phaser from 'phaser';

class PreloadScene extends Phaser.Scene {

  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.load.audio('jump', 'assets/jump.m4a');
    this.load.audio('hit', 'assets/hit.m4a');
    this.load.audio('reach', 'assets/reach.m4a');

    this.load.image('ground', 'assets/ground.png');
    this.load.image('dino-idle', 'assets/dino-idle.png');
    this.load.image('dino-hurt', 'assets/dino-hurt.png');
    this.load.image('restart', 'assets/restart.png');
    this.load.image('game-over', 'assets/game-over.png');
    this.load.image('cloud', 'assets/cloud.png');

    this.load.spritesheet('star', 'assets/stars.png', {
      frameWidth: 9, frameHeight: 9
    });

    this.load.spritesheet('moon', 'assets/moon.png', {
      frameWidth: 20, frameHeight: 40
    });

    this.load.spritesheet('dino', 'assets/dino-run.png', {
      frameWidth: 88,
      frameHeight: 94
    })

    this.load.spritesheet('dino-down', 'assets/dino-down.png', {
      frameWidth: 118,
      frameHeight: 94
    })

    this.load.spritesheet('enemy-bird', 'assets/enemy-bird.png', {
      frameWidth: 92,
      frameHeight: 77
    })

    this.load.image('obsticle-1', 'assets/cactuses_small_1.png')
    this.load.image('obsticle-2', 'assets/cactuses_small_2.png')
    this.load.image('obsticle-3', 'assets/cactuses_small_3.png')
    this.load.image('obsticle-4', 'assets/cactuses_big_1.png')
    this.load.image('obsticle-5', 'assets/cactuses_big_2.png')
    this.load.image('obsticle-6', 'assets/cactuses_big_3.png')

    // adjust screen
    // this.scale.lockOrientation("landscape")
    // this.adjustGameScreen(false)
  }

  create() {
    // this.game.scale.on('orientationchange', () => {
    //   this.adjustGameScreen()
    // })
    this.scene.start('MainScene');
  }

  adjustGameScreen(isRestart = true) {
    console.log(this.game.scale.isLandscape)
    if (this.game.scale.isLandscape) {
      this.screenCorrect = true
      this.game.scale.setGameSize(this.game.config.width, this.game.config.height)
    } else {
      // console.log("portait mode", this.sys.canvas.height, this.sys.canvas.width)
      this.screenCorrect = false
      // console.log("resize")
      this.game.scale.setGameSize(this.game.config.height, this.game.config.width)
    }
    if (isRestart) {
      this.restartGame()
    }
  }

  restartGame() {
    this.registry.destroy()
    this.events.off()

    this.scene.restart()
    this.scale.refresh()
  }
}

export default PreloadScene;
