import { QParticle, QRenderer } from "./quantumMech.js";
var canvas = document.getElementById("canvas");
var n = 100;
var dt = 1e-6;
var qparticle = new QParticle(n, dt);
var qrenderer = new QRenderer(qparticle, canvas);
var realArr = new Float64Array(n);
for (let i = 0; i < n - 25; i++) {
    realArr[i] = i / 100;
}
qparticle.Psi.setReal(realArr);
var paused = false;
function loop() {
    if (!paused) {
        qparticle.stepSchrodinger();
        qrenderer.drawProb();
    }
    requestAnimationFrame(loop);
}
var button_ppause = document.getElementById("button_toggle_play");
button_ppause.onclick = () => {
    paused = !paused;
    button_ppause.innerHTML = paused ? "play" : "pause";
};
loop();
