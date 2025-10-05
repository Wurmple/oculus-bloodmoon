import Phaser from 'phaser';
import { GameConfig } from './config';
import { MainScene } from './scenes/MainScene';

// Add scenes to config
GameConfig.scene = [MainScene];

// Initialize game
window.addEventListener('load', () => {
  new Phaser.Game(GameConfig);
});