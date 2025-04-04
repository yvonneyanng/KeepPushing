import { setupScene } from "./setup.js";
import { buildWorld } from "./build.js";
import { animateLoop } from "./animate.js";

const { scene, camera, renderer } = setupScene();
buildWorld(scene);
animateLoop(renderer, scene, camera);
