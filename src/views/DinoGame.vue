<template>
    <div id="gameContainer">

    </div>
</template>

<script>
import Phaser from "phaser"
import { defineComponent, onMounted, ref } from "vue"
import MainScene from "@/scene/MainScene"
import PreloadScene from "@/scene/PreloadScene"
import eventBus from "@/events/EventBus"

export default defineComponent({
    setup: function () {
        const DEFAULT_HEIGHT = 720
        const DEFAULT_WIDTH = 1280
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
            pixelArt: true,
            physics: {
                default: 'arcade',
                arcade: {
                    // gravity: { y: 200 }
                    debug: true
                }
            },
            scene: [PreloadScene, MainScene]
        }

        const title = ref("Test Integrate Phaser with vue")

        onMounted(() => {
            game.value = new Phaser.Game(config)
            eventBus.on("onGameEnd", (seconds) => {
                if (seconds >= 10) {
                    alert("call api to get point")
                } else {
                    // alert("Show popup try again")
                    const tryAgain = confirm("Try Again")
                    if (tryAgain) {
                        eventBus.emit("restartGame")
                    }
                }
            })
        })

        return {
            game,
            title
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
</style>