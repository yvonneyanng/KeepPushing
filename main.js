import { setupScene } from "./src/sceneSetup.js";
import { initGame } from "./src/gameLoop.js";

// Initialize scene, camera, and renderer
const { scene, camera, renderer, world, ground } = setupScene();

// Start the game
initGame(scene, camera, renderer, world, ground);
