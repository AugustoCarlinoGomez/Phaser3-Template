import StartScene from "./scenes/StartScene.js";
import ControlsScene from "./scenes/ControlsScene.js";
import HelloWorldScene from "./scenes/HelloWorldScene.js";
import WinScene from "./scenes/WinScene.js";
import EndScene from "./scenes/EndScene.js";

// Create a new Phaser config object (moved here so `game.js` arranca el juego)
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 800,
      height: 600,
    },
    max: {
      width: 1600,
      height: 1200,
    },
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
      debug: false,
    },
  },
  scene: [StartScene, ControlsScene, HelloWorldScene, WinScene, EndScene],
};

// Start the game
window.game = new Phaser.Game(config);
