import Phaser from "phaser";

export class TestScene extends Phaser.Scene {
    private iris?: Phaser.Physics.Arcade.Sprite;
    private portal?: Phaser.Physics.Arcade.Sprite;
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

        // Load the idle animation spritesheet
        this.load.spritesheet('portal', 'assets/Portal.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        // Load joystick assets
        this.load.image('joystick_nub', 'assets/joystick_circle.png');

        this.load.image('background', '/assets/background.png');
    }

    create() {
        // Add background and scale to cover the entire screen
        const background = this.add.image(0, 0, 'background');
        background.setOrigin(0, 0); // Align top-left initially
        background.setDepth(-1); // Behind all other objects

        // Calculate scale to cover the canvas (use the larger scale factor)
        const scaleX = this.cameras.main.width / background.width; // 800 / 576 ≈ 1.388
        const scaleY = this.cameras.main.height / background.height; // 600 / 324 ≈ 1.851
        const scale = Math.max(scaleX, scaleY); // ≈ 1.851 (based on height)

        background.setScale(scale);

        // Center the background after scaling (to crop evenly on sides)
        background.setPosition(
            (this.cameras.main.width - background.width * scale) / 2,  // ≈ (800 - 1066) / 2 ≈ -133
            (this.cameras.main.height - background.height * scale) / 2  // ≈ (600 - 600) / 2 ≈ 0
        );
        
        background.setTint(0xeeeeee); // Lighter gray tint (subtle dimming)
        background.setAlpha(1); // Full opacity to avoid faded look

        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const leftMiddleX = 100; // Left side of screen
        const centerY = height / 2;

        // Create portal
        const portalX = width-100;
        const portalY = 100;
        this.portal = this.physics.add.sprite(portalX, portalY, 'portal');
        this.portal.setScale(3); // play around with this value

        const portalBody = this.portal.body as Phaser.Physics.Arcade.Body;
        portalBody.allowGravity = false;

        this.anims.create({
            key: 'portal_idle',
            frames: this.anims.generateFrameNumbers('portal'),
            frameRate: 10,
            repeat: -1
        });
        this.portal.play('portal_idle');

        // Create the iris sprite at left middle
        this.iris = this.physics.add.sprite(leftMiddleX, centerY, 'iris_idle');
        this.iris.setScale(2);

        // Enable physics properties
        this.iris.setCollideWorldBounds(true);
        this.iris.setBounce(0.8, 0.8); // Bounce off walls
        this.iris.setMaxVelocity(500);
        this.physics.world.gravity.y = 300; // Slight gravity

        // Create idle animation
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('iris_idle', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1 // Loop forever
        });

        // Play the idle animation
        this.iris.play('idle');

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
                const force = 3; // Adjust this value to change launch strength
                this.iris.setVelocity(-dragDeltaX * force, -dragDeltaY * force);

                this.dragStartPos = undefined;
            }
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