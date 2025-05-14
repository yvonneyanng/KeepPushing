# KeepPushing 🏁

A browser-based racing game built with Vite + Three.js. The player’s car automatically moves along a smooth, curved track. The player must steer left and right to avoid penalty tokens that appear randomly. Each collision adds time to their total, and the goal is to complete a lap as fast as possible.

---

## 🎯 Expected Outcome

- A procedurally generated track using `CatmullRomCurve3` and `TubeGeometry` that loops back to the origin.
- A car that follows the track and can steer left/right.
- Random penalty cubes that add time when hit.
- Countdown start, real-time timer UI, and end screen with final time.
- Restart button to replay the race.

---

## 🧠 Team Implementation Plan

| Step | Person A (Track & Car) | Person B (Logic & Tokens) | Person C (UI & Visuals) |
|------|-------------------------|-----------------------------|---------------------------|
| 1. Track Setup | Create procedural track with `CatmullRomCurve3` + `TubeGeometry` in `trackGeneration.js` | – | – |
| 2. Scene Init | Set up camera, lighting, and renderer in `sceneSetup.js` | – | – |
| 3. Dummy Car & Camera | Add cube car, place on track, and set up camera follow in `carControl.js` | – | – |
| 4. Spawn Penalty Tokens | – | Use `curve.getPointAt(t)` to spawn cubes in `penaltyTokens.js` | – |
| 5. Countdown Logic | – | Create `gameStarted` flag + countdown logic in `gameLoop.js` or `timer.js` | Style countdown overlay in `ui.js` |
| 6. Car Movement | Animate car along curve using `getPointAt(t)` in `carControl.js` | – | – |
| 7. Collision Detection | – | Check collision using `distanceTo()` or bounding box in `penaltyTokens.js` | – |
| 8. Timer Logic | – | Calculate elapsed + penalty time in `timer.js` | Display live time in `ui.js` |
| 9. Game End Detection | Detect `t >= 1` to end race in `carControl.js` | Handle end logic in `gameLoop.js` | Style result screen in `ui.js` |
| 10. Restart Flow | Reset car `t=0`, camera, and tokens in `carControl.js` | Reset flags/timers in `gameLoop.js` and `timer.js` | Reset/hide overlays in `ui.js` |

---

## 📂 Folder Structure

```
/src
  ├── carControl.js
  ├── gameLoop.js
  ├── penaltyTokens.js
  ├── sceneSetup.js
  ├── timer.js
  ├── trackGeneration.js
  ├── ui.js
index.html
main.js
```

---

## 🧪 Built With

- [Three.js](https://threejs.org/)
- [Vite](https://vitejs.dev/)
- Vanilla JS, HTML, and CSS

