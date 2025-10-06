import Phaser from 'phaser';
import { GameConfig } from './config';
import { MainScene } from './scenes/MainScene';
import { TestScene } from './scenes/TestScene';

// Add scenes to config
GameConfig.scene = [TestScene];

// Initialize game
window.addEventListener('load', () => {
  new Phaser.Game(GameConfig);
});