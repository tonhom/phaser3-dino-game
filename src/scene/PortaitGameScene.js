import Phaser from 'phaser'
import { eventBus } from "../events/EventBus"

export default class PortaitGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' })
    }

    //#region lifecycle
    create() {
        this.spawnOffset = 25
        // this.physics.world.setBounds(this.spawnOffset, 0, this.sys.canvas.width - (this.spawnOffset * 2), this.sys.canvas.height)

        this.createVars()
        this.createPlayer()
        this.drawControls()
        this.drawTimer()
        this.handleInputs()
        this.initColliders()

        eventBus.on("restartGame", () => {
            this.resetGame()
        })
        eventBus.on("startGame", () => {
            this.resetGame()
        })

        // console.log(this.game.config.duration)
    }

    update(time, delta) {
        if (!this.isGameRunning) return

        Phaser.Actions.IncY(this.obstacles.getChildren(), this.gameSpeed)

        this.respawnTime += delta * this.gameSpeed * 0.08
        // console.log(this.respawnTime)
        if (this.respawnTime >= this.obstacleCondition) {
            this.createObstacles(delta)
            this.respawnTime = 0
        }

        this.obstacles.getChildren().forEach((obstacle) => {
            // console.log(obstacle.getBounds())
            let bound = obstacle.getBounds()
            if (bound.bottom > this.sys.canvas.height + bound.height) {
                // console.log("destroy")
                obstacle.destroy()
            }
        })

        // console.log(time, delta)
        // if (this.cursors.left.isDown) {
        //     this.player.setVelocityX(-500)
        // }
        // else if (this.cursors.right.isDown) {
        //     this.player.setVelocityX(500)
        // } else {
        //     this.player.setVelocityX(0)
        // }
    }
    //#endregion

    //#region utility
    createVars() {
        this.timedEvent = null
        this.obstacles = this.physics.add.group()
        this.gameSpeed = this.game.config.gameSpeed ?? 12
        this.velocity = this.game.config.velocity ?? 500
        this.obstacleCondition = this.game.config.obstacleCondition ?? 400
        this.isGameRunning = false
        this.respawnTime = 0
        this.initialTime = 0
        this.gameOver = false
        this.playerOffset = 100
        this.cursors = this.input.keyboard.createCursorKeys()

        // console.log(this.gameSpeed)
    }

    createPlayer() {
        let centerX = this.cameras.main.width / 2 - 35
        this.player = this.physics.add.sprite(centerX, this.game.config.height - this.playerOffset, 'dino-idle')
            .setCollideWorldBounds(true)
            .setOrigin(0, 1)
            .setSize(84, 84)
            .setDepth(1)
    }

    createAnimates() {
        this.anims.create({
            key: 'dino-run',
            frames: this.anims.generateFrameNumbers('dino',
                { start: 2, end: 3 }),
            frameRate: 10,
            repeat: -1
        })
    }

    /**
     * 
     * @param {'L'|'R'} direction 
     */
    moveCharacter(direction = null) {
        if (direction == "L") {
            this.player.setVelocityX(this.velocity * -1)
        } else if (direction == "R") {
            this.player.setVelocityX(this.velocity)
        } else {
            this.player.setVelocityX(0)
        }
    }

    handleInputs() {
        //#region control by UI
        this.controlLeft.on('pointerdown', (pointer, x, y, ev) => {
            ev.stopPropagation()
            console.log("move left")
            this.moveCharacter("L")
        })
        this.controlLeft.on('pointerup', (pointer, x, y, ev) => {
            ev.stopPropagation()
            this.moveCharacter()
        })
        this.controlRight.on('pointerdown', (pointer, x, y, ev) => {
            ev.stopPropagation()
            console.log("move right")
            this.moveCharacter("R")
        })
        this.controlRight.on('pointerup', (pointer, x, y, ev) => {
            ev.stopPropagation()
            this.moveCharacter()
        })
        //#endregion

        //#region pointer control (mouse)
        // fallback control by area of screen
        this.input.on('pointerdown', (pointer) => {
            if (pointer.x > this.sys.canvas.width / 2) {
                this.moveCharacter("R")
            } else {
                this.moveCharacter("L")
            }
        }, this)

        this.input.on('pointerup', () => {
            this.moveCharacter() // stop
        }, this)
        //#endregion

        //#region custom key control
        this.input.keyboard.on('keydown-A', () => {
            this.moveCharacter("L")
            // this.player.setX(this.player.x - 0.2)
        })
        this.input.keyboard.on('keyup-A', () => {
            this.moveCharacter() // stop
        })

        this.input.keyboard.on('keydown-D', () => {
            this.moveCharacter("R")
            // this.player.setX(this.player.x - 0.2)
        })
        this.input.keyboard.on('keyup-D', () => {
            this.moveCharacter() // stop
        })
        //#endregion

    }

    initColliders() {
        this.physics.add.collider(this.player, this.obstacles, () => {
            this.stopGame()
        }, null, this)
    }

    createObstacles(delta) {
        const obstacleNum = Math.floor(Math.random() * 6) + 1
        const addiotnalSpace = delta * this.gameSpeed
        // console.log(delta, this.gameSpeed, addiotnalSpace)
        let obstacleKey = `obsticle-${obstacleNum}`
        let img = this.textures.get(obstacleKey).getSourceImage()
        // console.log(img.source[0].width)
        const randomX = Phaser.Math.Between(this.spawnOffset, (this.game.config.width / 2) - img.width)
        const distance = Phaser.Math.Between(100 + addiotnalSpace, 300)

        // console.log(distance)
        /**@type {Phaser.GameObjects.Image} */
        let obstacle = this.obstacles.create(randomX, distance * -1, obstacleKey)

        // obstacle.body.offset.y = +10
        obstacle
            .setOrigin(0, 1)
            .setImmovable()
        // .setSize(obstacle.body.width * .8, obstacle.body.height * .8)

        const obstacleNum2 = Math.floor(Math.random() * 6) + 1
        let obstacleKey2 = `obsticle-${obstacleNum2}`
        let img2 = this.textures.get(obstacleKey2).getSourceImage()
        // console.log(img.source[0].width)
        const randomX2 = Phaser.Math.Between(this.game.config.width / 2, this.game.config.width - img2.width - this.spawnOffset)
        const distance2 = Phaser.Math.Between(100 + addiotnalSpace, 300)

        // console.log(distance)
        /**@type {Phaser.GameObjects.Image} */
        let obstacle2 = this.obstacles.create(randomX2, distance2 * -1, obstacleKey2)

        // obstacle.body.offset.y = +10
        obstacle2
            .setOrigin(0, 1)
            .setImmovable()
    }

    resetGame() {
        let centerX = this.cameras.main.width / 2 - 35
        this.player.setX(centerX)
        this.respawnTime = 0
        this.physics.resume()
        this.obstacles.clear(true, true)
        this.anims.resumeAll()
        this.resetTimer()

        this.isGameRunning = true
    }

    stopGame() {
        this.physics.pause()
        this.isGameRunning = false
        this.anims.pauseAll()
        this.respawnTime = 0
        this.timedEvent.remove()
        if (this.initialTime >= this.game.config.duration) {
            this.gameOver = false

        } else {
            this.gameOver = true
        }

        eventBus.emit("onGameEnd", this.gameOver)
    }

    resetTimer() {
        this.initialTime = 0
        this.txtTimeCounter.setText('Timer: ' + this.formatTime(this.initialTime))
        this.timedEvent = this.time.addEvent({ delay: 1000, callback: this.onTimeRunning, callbackScope: this, loop: true })
    }

    onTimeRunning() {
        this.initialTime++
        this.txtTimeCounter.setText('Timer: ' + this.formatTime(this.initialTime))

        // console.log(this.game.config.duration)
        if (this.initialTime >= this.game.config.duration) {
            this.stopGame()
        }
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

    drawControls() {
        this.controls = this.add.container(0, 0).setDepth(2)
        this.controlLeft = this.physics.add.sprite(50, this.sys.canvas.height - 50).setSize(100, 100).setOrigin(0, 1).setImmovable(0).setInteractive()
        this.controlRight = this.physics.add.sprite(this.sys.canvas.width - 50, this.sys.canvas.height - 50).setSize(100, 100).setOrigin(1, 1).setImmovable(0).setInteractive()
        this.controls.add([
            this.controlLeft,
            this.controlRight
        ])
    }
    //#endregion
}