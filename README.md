# Stars

Interactive stars background with customizable settings. This project provides a beautiful animated star field with interactive features:

- Responsive star animation that reacts to cursor movement
- Custom mouse follower
- Theme toggle (dark/light mode)
- Extensive settings panel to customize the star behavior

## Features

- Interactive stars that respond to mouse movement
- Custom cursor effect
- Connections between nearby stars that create a network-like effect
- Easy theme switching between dark and light modes
- Fully customizable settings:
  - Star count, size, and opacity
  - Movement speed and behavior
  - Connection distance and appearance
  - Cursor effect radius and power

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/coolixte/stars.git
cd stars
```

2. Install dependencies:

```bash
npm install
# or
yarn
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

- Move your cursor to interact with the stars
- Click the dark mode toggle in the navbar to switch themes
- Click the "Settings" button to customize the star behavior
- Adjust parameters in the settings panel and click "Apply Changes" to see the effect
- Click "Reset to Defaults" to restore the original settings

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build artifacts will be located in the `dist/` directory.

## License

This project is open source and available for personal and commercial use.

## Acknowledgments

- Inspired by various interactive background animations
- Built with React, TypeScript, and Tailwind CSS