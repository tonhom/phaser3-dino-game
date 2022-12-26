<template>
    <div id="gameContainer">

    </div>
    <template v-if="popupStart">
        <div class="popup">
            <div class="popup-body">
                <div class="mb-4">
                    Welcome Screen
                </div>
                <button type="button" @click="startGame" class="btn bg-blue-700 text-white">
                    Start Game
                </button>
            </div>
        </div>
    </template>

    <template v-if="popupRetry">
        <div class="popup">
            <div class="popup-body">
                <div class="mb-4">
                    Failed
                </div>
                <button type="button" @click="restartGame" class="btn bg-blue-700 text-white">
                    Try Again
                </button>
            </div>
        </div>
    </template>

    <template v-if="popupPoint">
        <div class="popup">
            <div class="popup-body">
                <div class="mb-4">
                    You get 50 points
                </div>
            </div>
        </div>
    </template>
</template>

<script>
import { defineComponent, nextTick, onMounted, ref } from 'vue';
import Phaser from "phaser"
import eventBus from '@/events/EventBus';
import PortaitGameScene from '@/scene/PortaitGameScene';
import PreloadScene from '@/scene/PreloadScene';

export default defineComponent({
    setup: function () {
        const popupStart = ref(true)
        const popupPoint = ref(false)
        const popupRetry = ref(false)
        // aspect ratio 16:9
        const DEFAULT_HEIGHT = 1280
        const DEFAULT_WIDTH = 720
        /**@type {import("@vue/reactivity").Ref<Phaser.Game>} */
        const game = ref()
        /**@type {Phaser.Types.Core.GameConfig} */
        var config = {
            type: Phaser.AUTO,
            scale: {
                mode: Phaser.Scale.FIT,
                parent: 'gameContainer',
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: DEFAULT_WIDTH,
                height: DEFAULT_HEIGHT,
            },
            transparent: true,
            // pixelArt: true,
            physics: {
                default: 'arcade',
                arcade: {
                    debug: true,
                    gravity: {
                        // x: 0,
                        // y: 0
                    }
                }
            },
            scene: [PreloadScene, PortaitGameScene]
        }

        const title = ref("Test Integrate Phaser with vue")

        const startGame = function () {
            popupStart.value = false
            nextTick(() => {
                eventBus.emit("startGame")
            })
        }

        const restartGame = function () {
            popupRetry.value = false
            nextTick(() => {
                eventBus.emit("restartGame")
            })
        }

        onMounted(() => {
            game.value = new Phaser.Game(config)
            // console.log(game.value.config)
            game.value.config.duration = 30
            game.value.config.gameSpeed = 12
            game.value.config.velocity = 750
            eventBus.on("onGameEnd", (isGameOver) => {
                // game over mean not reach 30 sec
                if (!isGameOver) {
                    popupPoint.value = true
                } else {
                    popupRetry.value = true
                }
            })
        })

        return {
            game,
            title,
            popupStart,
            popupPoint,
            popupRetry,
            startGame,
            restartGame
        }
    }
})
</script>

<style lang="scss" scoped>
#gameContainer {
    background-color: gray;
    @apply fixed top-0 left-0 w-full h-full;

    :deep(canvas) {
        @apply bg-white;
    }
}

.btn {
    @apply px-2 py-1 outline-none appearance-none rounded;
}

.popup {
    z-index: 1000;
    @apply fixed left-0 top-0 flex flex-col justify-center items-center h-screen w-full bg-black bg-opacity-50;

    .popup-body {
        @apply max-w-xs rounded border w-full p-4 bg-white;
    }
}
</style>