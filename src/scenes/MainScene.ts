import Phaser from 'phaser';

interface Branch {
  sprite: Phaser.GameObjects.Rectangle;
  body: Phaser.Physics.Arcade.Body;
}

export class MainScene extends Phaser.Scene {
  private iris?: Phaser.Physics.Arcade.Sprite;
  private branches: Branch[] = [];
  private slingshotLine?: Phaser.GameObjects.Graphics;
  private slingshotStart?: Phaser.Math.Vector2;
  private isDragging = false;
  private deathCount = 0;
  private currentLevel = 1;
  private goalZone?: Phaser.GameObjects.Rectangle;
  private deathText?: Phaser.GameObjects.Text;
  private levelText?: Phaser.GameObjects.Text;
  private particles?: Phaser.GameObjects.Particles.ParticleEmitter;
  private spawnPoint = { x: 100, y: 300 }; // Mid-air spawn

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // No external assets needed - using primitives
  }

  create() {
    // Blood moon aesthetic background
    this.cameras.main.setBackgroundColor('#1a0a0f');
    
    // Create blood moon
    this.createBloodMoon();
    
    // Create Iris (eyeball)
    this.createIris();
    
    // Create particle effects (aura)
    this.createParticleEffects();
    
    // Setup slingshot controls
    this.setupSlingshotControls();
    
    // Create UI
    this.createUI();
    
    // Load first level
    this.loadLevel(this.currentLevel);
  }

  createBloodMoon() {
    const moon = this.add.circle(700, 100, 60, 0x8b0000);
    moon.setAlpha(0.6);
    
    // Moon glow
    const glow = this.add.circle(700, 100, 80, 0xff0000);
    glow.setAlpha(0.2);
    
    // Ambient red lighting overlay
    const lighting = this.add.rectangle(400, 300, 800, 600, 0x330000);
    lighting.setAlpha(0.15);
  }

  createIris() {
    // Create eyeball texture
    const graphics = this.add.graphics();
    
    // White of the eye
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(25, 25, 25);
    
    // Bloodshot veins
    graphics.lineStyle(2, 0xff0000, 0.6);
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const x = 25 + Math.cos(angle) * 20;
      const y = 25 + Math.sin(angle) * 20;
      graphics.lineBetween(25, 25, x, y);
    }
    
    // Iris (colored part)
    graphics.fillStyle(0x4169e1, 1);
    graphics.fillCircle(25, 25, 12);
    
    // Pupil
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(25, 25, 6);
    
    // Highlight
    graphics.fillStyle(0xffffff, 0.8);
    graphics.fillCircle(22, 22, 3);
    
    graphics.generateTexture('iris', 50, 50);
    graphics.destroy();
    
    // Create physics sprite
    this.iris = this.physics.add.sprite(this.spawnPoint.x, this.spawnPoint.y, 'iris');
    this.iris.setCircle(25); // Circular collision
    this.iris.setBounce(0.3);
    this.iris.setDrag(50); // Low friction
    this.iris.setMaxVelocity(800);
    
    // Enable world bounds collision
    this.iris.setCollideWorldBounds(true);
  }

  createParticleEffects() {
    // Create particle texture
    const particleGraphics = this.add.graphics();
    particleGraphics.fillStyle(0xff0000, 1);
    particleGraphics.fillCircle(2, 2, 2);
    particleGraphics.generateTexture('particle', 4, 4);
    particleGraphics.destroy();
    
    // Particle emitter following Iris
    this.particles = this.add.particles(0, 0, 'particle', {
      speed: { min: 10, max: 30 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 600,
      frequency: 50,
      blendMode: 'ADD'
    });
    
    if (this.iris) {
      this.particles.startFollow(this.iris);
    }
  }

  setupSlingshotControls() {
    this.slingshotLine = this.add.graphics();
    
    // Mouse/touch down
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.iris) return;
      
      // Check if clicking near Iris
      const distance = Phaser.Math.Distance.Between(
        pointer.x,
        pointer.y,
        this.iris.x,
        this.iris.y
      );
      
      if (distance < 100) {
        this.isDragging = true;
        this.slingshotStart = new Phaser.Math.Vector2(this.iris.x, this.iris.y);
        this.iris.setVelocity(0, 0); // Stop movement while aiming
      }
    });
    
    // Mouse/touch move
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging && this.slingshotStart && this.iris) {
        this.drawSlingshotLine(pointer);
      }
    });
    
    // Mouse/touch up
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging && this.slingshotStart && this.iris) {
        this.launchIris(pointer);
        this.isDragging = false;
        this.slingshotLine?.clear();
      }
    });
  }

  drawSlingshotLine(pointer: Phaser.Input.Pointer) {
    if (!this.slingshotLine || !this.slingshotStart || !this.iris) return;
    
    this.slingshotLine.clear();
    
    // Draw trajectory line
    this.slingshotLine.lineStyle(3, 0xff0000, 0.8);
    this.slingshotLine.lineBetween(
      this.iris.x,
      this.iris.y,
      pointer.x,
      pointer.y
    );
    
    // Draw power indicator
    const distance = Phaser.Math.Distance.Between(
      this.iris.x,
      this.iris.y,
      pointer.x,
      pointer.y
    );
    
    const power = Math.min(distance / 2, 300);
    this.slingshotLine.fillStyle(0xff0000, 0.3);
    this.slingshotLine.fillCircle(this.iris.x, this.iris.y, power / 5);
  }

  launchIris(pointer: Phaser.Input.Pointer) {
    if (!this.iris || !this.slingshotStart) return;
    
    // Calculate launch velocity (opposite direction of drag)
    const velocityX = (this.iris.x - pointer.x) * 3;
    const velocityY = (this.iris.y - pointer.y) * 3;
    
    // Apply velocity with max cap
    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    const maxSpeed = 800;
    
    if (speed > maxSpeed) {
      const ratio = maxSpeed / speed;
      this.iris.setVelocity(velocityX * ratio, velocityY * ratio);
    } else {
      this.iris.setVelocity(velocityX, velocityY);
    }
  }

  createUI() {
    // Death counter
    this.deathText = this.add.text(16, 16, 'Deaths: 0', {
      fontSize: '24px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    
    // Level indicator
    this.levelText = this.add.text(16, 50, 'Level: 1', {
      fontSize: '24px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    
    // Instructions
    this.add.text(400, 570, 'Drag Iris to aim and launch!', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  loadLevel(level: number) {
    // Clear existing branches
    this.branches.forEach(branch => branch.sprite.destroy());
    this.branches = [];
    
    // Remove old goal
    if (this.goalZone) {
      this.goalZone.destroy();
    }
    
    // Reset Iris position
    if (this.iris) {
      this.iris.setPosition(this.spawnPoint.x, this.spawnPoint.y);
      this.iris.setVelocity(0, 0);
    }
    
    // Create level-specific obstacles
    switch (level) {
      case 1:
        this.createLevel1();
        break;
      case 2:
        this.createLevel2();
        break;
      case 3:
        this.createLevel3();
        break;
      default:
        this.showVictoryScreen();
        return;
    }
    
    // Update UI
    if (this.levelText) {
      this.levelText.setText(`Level: ${level}`);
    }
  }

  createLevel1() {
    // Simple introductory level
    this.createBranch(300, 400, 20, 200, 45);
    this.createBranch(500, 300, 20, 180, -30);
    this.createBranch(400, 500, 150, 20, 0);
    
    // Goal zone
    this.createGoal(700, 100);
  }

  createLevel2() {
    // Medium difficulty - more obstacles
    this.createBranch(250, 450, 20, 250, 60);
    this.createBranch(400, 350, 200, 20, 0);
    this.createBranch(550, 450, 20, 250, -60);
    this.createBranch(350, 200, 150, 20, 45);
    this.createBranch(500, 250, 20, 120, 0);
    
    // Goal zone
    this.createGoal(700, 150);
  }

  createLevel3() {
    // Hard difficulty - complex maze
    this.createBranch(200, 500, 20, 150, 45);
    this.createBranch(300, 400, 180, 20, 0);
    this.createBranch(400, 450, 20, 200, -30);
    this.createBranch(500, 300, 150, 20, 60);
    this.createBranch(600, 450, 20, 180, 45);
    this.createBranch(350, 200, 120, 20, -45);
    this.createBranch(550, 150, 20, 100, 0);
    this.createBranch(450, 100, 100, 20, 0);
    
    // Goal zone
    this.createGoal(750, 80);
  }

  createBranch(x: number, y: number, width: number, height: number, angle: number) {
    // Create brown branch with rough texture
    const branch = this.add.rectangle(x, y, width, height, 0x4a2511);
    branch.setStrokeStyle(3, 0x2d1508);
    branch.setAngle(angle);
    
    // Enable physics
    this.physics.add.existing(branch, true); // true = static body
    
    const body = branch.body as Phaser.Physics.Arcade.Body;
    
    this.branches.push({ sprite: branch, body });
  }

  createGoal(x: number, y: number) {
    this.goalZone = this.add.rectangle(x, y, 60, 60, 0x00ff00);
    this.goalZone.setAlpha(0.3);
    this.goalZone.setStrokeStyle(3, 0x00ff00);
    
    // Pulsing animation
    this.tweens.add({
      targets: this.goalZone,
      alpha: { from: 0.3, to: 0.6 },
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  }

  update() {
    if (!this.iris) return;
    
    // Check collision with branches
    this.branches.forEach(branch => {
      if (this.checkCollision(this.iris!, branch.sprite)) {
        this.handleDeath();
      }
    });
    
    // Check if reached goal
    if (this.goalZone && this.checkOverlap(this.iris, this.goalZone)) {
      this.handleLevelComplete();
    }
    
    // Apply low gravity effect
    if (this.iris.body) {
      this.iris.body.gravity.y = 150; // Low gravity
    }
  }

  checkCollision(iris: Phaser.Physics.Arcade.Sprite, branch: Phaser.GameObjects.Rectangle): boolean {
    const irisBody = iris.body as Phaser.Physics.Arcade.Body;
    const branchBody = branch.body as Phaser.Physics.Arcade.Body;
    
    if (!irisBody || !branchBody) return false;
    
    // Simple AABB collision detection
    const irisRect = new Phaser.Geom.Rectangle(
      irisBody.x,
      irisBody.y,
      irisBody.width,
      irisBody.height
    );
    
    const branchRect = new Phaser.Geom.Rectangle(
      branchBody.x,
      branchBody.y,
      branchBody.width,
      branchBody.height
    );
    
    return Phaser.Geom.Intersects.RectangleToRectangle(irisRect, branchRect);
  }

  checkOverlap(iris: Phaser.Physics.Arcade.Sprite, goal: Phaser.GameObjects.Rectangle): boolean {
    const distance = Phaser.Math.Distance.Between(
      iris.x,
      iris.y,
      goal.x,
      goal.y
    );
    
    return distance < 50;
  }

  handleDeath() {
    if (!this.iris) return;
    
    // Death particle explosion
    this.createDeathEffect(this.iris.x, this.iris.y);
    
    // Increment death counter
    this.deathCount++;
    if (this.deathText) {
      this.deathText.setText(`Deaths: ${this.deathCount}`);
    }
    
    // Flash screen red
    this.cameras.main.flash(200, 255, 0, 0);
    
    // Respawn after delay
    this.time.delayedCall(500, () => {
      if (this.iris) {
        this.iris.setPosition(this.spawnPoint.x, this.spawnPoint.y);
        this.iris.setVelocity(0, 0);
      }
    });
  }

  createDeathEffect(x: number, y: number) {
    // Blood splatter particles
    const deathParticles = this.add.particles(x, y, 'particle', {
      speed: { min: 100, max: 300 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      quantity: 30,
      blendMode: 'ADD',
      tint: 0xff0000
    });
    
    // Auto-destroy after animation
    this.time.delayedCall(1000, () => {
      deathParticles.destroy();
    });
  }

  handleLevelComplete() {
    // Prevent multiple triggers
    if (!this.goalZone) return;
    this.goalZone.destroy();
    this.goalZone = undefined;
    
    // Flash screen green
    this.cameras.main.flash(300, 0, 255, 0);
    
    // Show completion text
    const completeText = this.add.text(400, 300, 'LEVEL COMPLETE!', {
      fontSize: '48px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    // Fade out and load next level
    this.tweens.add({
      targets: completeText,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        completeText.destroy();
        this.currentLevel++;
        this.loadLevel(this.currentLevel);
      }
    });
  }

  showVictoryScreen() {
    // Clear screen
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    
    this.time.delayedCall(1000, () => {
      // Victory text
      this.add.text(400, 250, 'GAME COMPLETE!', {
        fontSize: '64px',
        color: '#00ff00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 8
      }).setOrigin(0.5);
      
      this.add.text(400, 330, `Total Deaths: ${this.deathCount}`, {
        fontSize: '32px',
        color: '#ffffff'
      }).setOrigin(0.5);
      
      this.add.text(400, 400, 'Click to Restart', {
        fontSize: '24px',
        color: '#ffffff'
      }).setOrigin(0.5);
      
      // Restart on click
      this.input.once('pointerdown', () => {
        this.scene.restart();
      });
      
      this.cameras.main.fadeIn(1000);
    });
  }
}