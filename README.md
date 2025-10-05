# 👁️ Oculus: Bloodmoon

A physics-based endless runner where you control **Iris**, a sentient eyeball navigating through a treacherous forest under a blood-red moon. Dodge branches, collect power-ups, and survive as long as you can in this fast-paced arcade experience.

![Game Status](https://img.shields.io/badge/status-in%20development-yellow)
![Phaser](https://img.shields.io/badge/Phaser-3.80.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎮 Game Concept

**Oculus: Bloodmoon** is an endless runner with realistic physics. Play as Iris, an eyeball bouncing through a dark forest filled with deadly branches. The longer you survive, the faster the game becomes.

### Core Mechanics
- **Physics-Based Movement**: Iris responds to gravity, momentum, and air resistance
- **Touch/Mouse Controls**: Tap or click to make Iris jump and navigate
- **Procedural Generation**: Endless, randomly generated branch obstacles
- **Progressive Difficulty**: Game speed increases as you survive longer
- **Score System**: Earn points for every second survived and obstacle cleared

## 🚀 Quick Start

### Prerequisites
- **Node.js 20.x LTS** - [Download here](https://nodejs.org/)
- **Git** - For cloning the repository

### Installation

```bash
# Clone the repository
git clone git@github.com:Wurmple/oculus-bloodmoon.git
cd oculus-bloodmoon

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will automatically open at `http://localhost:3000` 🎯

## 📦 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Phaser 3** | 3.80.1 | Game engine with Arcade Physics |
| **TypeScript** | 5.3.3 | Type-safe game development |
| **Vite** | 5.0.11 | Lightning-fast dev server & builds |
| **Node.js** | 20.x LTS | JavaScript runtime |

### Why This Stack?
- **Phaser 3**: Industry-standard 2D game engine with excellent TypeScript support
- **Arcade Physics**: Perfect for circular collision detection (Iris) and simple 2D physics
- **TypeScript**: Catch bugs early with type checking
- **Vite**: Instant hot-reload makes development incredibly fast

## 🛠️ Development Commands

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build optimized production bundle
npm run serve    # Preview production build locally
```

## 📁 Project Structure

```
oculus-bloodmoon/
├── src/
│   ├── index.ts              # Game initialization & entry point
│   ├── config.ts             # Phaser configuration (physics, screen size)
│   └── scenes/
│       └── MainScene.ts      # Main game scene (gameplay loop)
├── public/
│   └── assets/               # Game assets (sprites, sounds, fonts)
│       ├── sprites/          # Character and object images
│       ├── sounds/           # Sound effects and music
│       └── fonts/            # Custom fonts
├── dist/                     # Production build output (auto-generated)
├── index.html                # HTML entry point
├── vite.config.ts            # Vite build configuration
├── tsconfig.json             # TypeScript compiler settings
└── package.json              # Project dependencies
```

## 🎯 Roadmap

### Phase 1: Core Gameplay ⏳
- [ ] Iris character sprite and physics
- [ ] Basic jumping/movement controls
- [ ] Branch obstacle generation
- [ ] Collision detection
- [ ] Score tracking system
- [ ] Game over screen

### Phase 2: Polish 🎨
- [ ] Particle effects (blood splatters, dust)
- [ ] Background parallax scrolling
- [ ] Sound effects (jump, collision, ambient)
- [ ] Background music
- [ ] Visual polish (shaders, lighting effects)

### Phase 3: Features 🚀
- [ ] Power-ups (shields, slow-mo, double points)
- [ ] High score persistence
- [ ] Multiple difficulty modes
- [ ] Achievements system

### Phase 4: Mobile Deployment 📱
- [ ] Capacitor integration
- [ ] Touch controls optimization
- [ ] Android APK build
- [ ] iOS build (if needed)
- [ ] AdMob integration for monetization

## 🎨 Game Design

### Visual Style
- **Theme**: Dark, atmospheric horror with retro arcade vibes
- **Color Palette**: Deep reds, blacks, and eerie moonlight blues
- **Art Style**: Stylized 2D sprites with smooth animations

### Character: Iris
- **Appearance**: Detailed eyeball with bloodshot veins
- **Physics**: Circular collision body with realistic bounce
- **Animation States**: Idle, jumping, damaged, death

### Environment
- **Setting**: Dense forest under a blood-red moon
- **Obstacles**: Procedurally generated tree branches
- **Atmosphere**: Fog effects, particle systems, dynamic lighting

## 👥 Team Setup

New team members should follow these steps:

1. **Install Node.js 20.x LTS**: https://nodejs.org/
2. **Set up SSH keys for GitHub**: [GitHub SSH Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
3. **Clone the repository**:
   ```bash
   git clone git@github.com:Wurmple/oculus-bloodmoon.git
   cd oculus-bloodmoon
   ```
4. **Install dependencies**: `npm install`
5. **Start development**: `npm run dev`

For detailed setup instructions, see [SETUP.md](SETUP.md)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and commit: `git commit -m "Add your feature"`
3. Push to your branch: `git push origin feature/your-feature-name`
4. Open a Pull Request on GitHub

### Code Style
- Use TypeScript strict mode
- Follow existing file structure
- Comment complex physics calculations
- Keep functions small and focused

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Port 3000 already in use
Change the port in `vite.config.ts`:
```typescript
server: {
  port: 3001, // Change to any available port
  open: true
}
```

### TypeScript errors after pulling
```bash
npm install  # Reinstall dependencies
```

### Hot reload not working
Restart the dev server: `Ctrl+C` then `npm run dev`

### Build warnings about chunk size
This is normal - Phaser is a large library. The warning can be safely ignored during development.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Wurmple/oculus-bloodmoon/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Wurmple/oculus-bloodmoon/discussions)

---

**Current Status**: 🚧 Active Development  
**Version**: 1.0.0  
**Last Updated**: October 2025

Built with ❤️ using Phaser 3, TypeScript, and Vite