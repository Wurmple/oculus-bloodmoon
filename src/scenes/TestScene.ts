import Phaser from "phaser";

export class TestScene extends Phaser.Scene {
    private iris?: Phaser.Physics.Arcade.Sprite;
    private hurtButton?: Phaser.GameObjects.Text;
    private dragStartPos?: Phaser.Math.Vector2;
    private dragLine?: Phaser.GameObjects.Graphics;
    private isDragging: boolean = false;
    private joystickBase?: Phaser.GameObjects.Image;
    private joystickNub?: Phaser.GameObjects.Image;

    constructor() {
        super({key : "TestScene"});
    }

    preload() {
        // Load the idle animation spritesheet
        this.load.spritesheet('iris_idle', 'assets/IdleNoShadow.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        // Load the hurt animation spritesheet
        this.load.spritesheet('iris_hurt', 'assets/HurtNoShadow.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        // Load joystick assets
        this.load.image('joystick_nub', 'assets/joystick_circle_nub_b.png');
    }

    create() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const leftMiddleX = 100; // Left side of screen
        const centerY = height / 2;

        // Create the iris sprite at left middle
        this.iris = this.physics.add.sprite(leftMiddleX, centerY, 'iris_idle');
        this.iris.setScale(2);

        // Enable physics properties
        this.iris.setCollideWorldBounds(true);
        this.iris.setBounce(0.8, 0.8); // Bounce off walls
        this.physics.world.gravity.y = 200; // Slight gravity

        // Create idle animation
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('iris_idle', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1 // Loop forever
        });

        // Create hurt animation
        this.anims.create({
            key: 'hurt',
            frames: this.anims.generateFrameNumbers('iris_hurt', { start: 0, end: 5 }),
            frameRate: 12,
            repeat: 0 // Play once
        });

        // Play the idle animation
        this.iris.play('idle');

        // Listen for hurt animation completion to return to idle
        this.iris.on('animationcomplete', (anim: Phaser.Animations.Animation) => {
            if (anim.key === 'hurt') {
                this.iris?.play('idle');
            }
        });

        // Create graphics for drag line visualization
        this.dragLine = this.add.graphics();

        // Create joystick visuals (hidden initially)
        this.joystickBase = this.add.image(0, 0, 'joystick_nub');
        this.joystickBase.setAlpha(0.3);
        this.joystickBase.setScale(1.5);
        this.joystickBase.setVisible(false);
        this.joystickBase.setDepth(10);

        this.joystickNub = this.add.image(0, 0, 'joystick_nub');
        this.joystickNub.setAlpha(0.8);
        this.joystickNub.setScale(0.8);
        this.joystickNub.setVisible(false);
        this.joystickNub.setDepth(11);

        // Pointer down anywhere - start drag
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Don't start drag if clicking on the hurt button
            if (this.hurtButton?.getBounds().contains(pointer.x, pointer.y)) {
                return;
            }
            
            this.isDragging = true;
            this.dragStartPos = new Phaser.Math.Vector2(pointer.x, pointer.y);
            
            // Show joystick at press location
            if (this.joystickBase && this.joystickNub) {
                this.joystickBase.setPosition(pointer.x, pointer.y);
                this.joystickBase.setVisible(true);
                this.joystickBase.setAlpha(0.3);
                this.joystickBase.setScale(1.5);
                
                this.joystickNub.setPosition(pointer.x, pointer.y);
                this.joystickNub.setVisible(true);
                this.joystickNub.setAlpha(0.8);
                this.joystickNub.setScale(0.8);
            }
        });

        // Pointer move - show drag direction
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (this.isDragging && this.dragStartPos && this.iris) {
                // Update joystick nub position
                if (this.joystickNub) {
                    this.joystickNub.setPosition(pointer.x, pointer.y);
                }
                
                // Calculate drag delta (from start to current pointer)
                const dragDeltaX = pointer.x - this.dragStartPos.x;
                const dragDeltaY = pointer.y - this.dragStartPos.y;

                // Calculate end point relative to iris position
                const endX = this.iris.x + dragDeltaX;
                const endY = this.iris.y + dragDeltaY;

                this.dragLine?.clear();
                this.dragLine?.lineStyle(4, 0xffffff, 0.6);
                
                // Draw line from iris to the relative end point
                this.dragLine?.lineBetween(
                    this.iris.x,
                    this.iris.y,
                    endX,
                    endY
                );
            }
        });

        // Pointer up - launch iris
        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (this.isDragging && this.dragStartPos && this.iris) {
                this.isDragging = false;
                this.dragLine?.clear();

                // Hide joystick
                if (this.joystickBase && this.joystickNub) {
                    this.joystickBase.setVisible(false);
                    this.joystickNub.setVisible(false);
                }

                // Calculate the drag vector from start to end point
                const dragDeltaX = pointer.x - this.dragStartPos.x;
                const dragDeltaY = pointer.y - this.dragStartPos.y;

                // Apply the same vector from iris position (opposite direction)
                const force = 5; // Adjust this value to change launch strength
                this.iris.setVelocity(-dragDeltaX * force, -dragDeltaY * force);

                this.dragStartPos = undefined;
            }
        });

        // Create hurt button
        this.hurtButton = this.add.text(width / 2, 50, 'Hurt', {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#ff0000',
            padding: { x: 20, y: 10 }
        });
        this.hurtButton.setOrigin(0.5);
        this.hurtButton.setInteractive({ useHandCursor: true });

        // Button click handler
        this.hurtButton.on('pointerdown', () => {
            if (this.iris) {
                this.iris.play('hurt');
            }
        });

        // Button hover effects
        this.hurtButton.on('pointerover', () => {
            this.hurtButton?.setStyle({ backgroundColor: '#cc0000' });
        });

        this.hurtButton.on('pointerout', () => {
            this.hurtButton?.setStyle({ backgroundColor: '#ff0000' });
        });
    }

    update() {
        // Update drag line position as iris moves
        if (this.isDragging && this.dragStartPos && this.iris) {
            const pointer = this.input.activePointer;
            
            // Calculate drag delta (from start to current pointer)
            const dragDeltaX = pointer.x - this.dragStartPos.x;
            const dragDeltaY = pointer.y - this.dragStartPos.y;

            // Calculate end point relative to iris position
            const endX = this.iris.x + dragDeltaX;
            const endY = this.iris.y + dragDeltaY;

            this.dragLine?.clear();
            this.dragLine?.lineStyle(4, 0xffffff, 0.6);
            
            // Draw line from iris to the relative end point
            this.dragLine?.lineBetween(
                this.iris.x,
                this.iris.y,
                endX,
                endY
            );

            // Add a glow effect at the end point
            this.dragLine?.fillStyle(0xffffff, 0.3);
            this.dragLine?.fillCircle(endX, endY, 8);
        }
        
        // Rotate sprite to face direction of movement
        if (this.iris && this.iris.body) {
            const body = this.iris.body as Phaser.Physics.Arcade.Body;
            const velocityX = body.velocity.x;
            const velocityY = body.velocity.y;

            // Only rotate if moving significantly
            if (Math.abs(velocityX) > 10 || Math.abs(velocityY) > 10) {
                const angle = Math.atan2(velocityY, velocityX);
                this.iris.setRotation(angle);
            }
        }
    }
}