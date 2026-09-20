import Phaser from "phaser";
import "./styles.css";
import { GameScene } from "./scenes/GameScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: 720,
  height: 1280,
  backgroundColor: "#10151d",
  render: { antialias: false, pixelArt: true, powerPreference: "high-performance" },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 720,
    height: 1280
  },
  input: { activePointers: 4, touch: true },
  fps: { target: 60, forceSetTimeOut: false },
  scene: [GameScene]
};

new Phaser.Game(config);
