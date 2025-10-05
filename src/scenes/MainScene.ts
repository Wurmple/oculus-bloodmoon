import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // Load assets here
    console.log('Preloading assets...');
  }

  create() {
    // Initialize game objects here
    this.add.text(400, 300, 'Eyeball Game - Ready!', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    console.log('Game scene created!');
  }

  update() {
    // Game loop logic here
  }
}