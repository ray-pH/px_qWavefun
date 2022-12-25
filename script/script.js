import { QParticle, QRenderer } from "./quantumMech.js";
var canvas = document.getElementById("canvas");
var n = 100;
var dt = 1e-6;
// approximately dψ_re <= 2Δt/Δx^2 = 2Δt n^2
// to make it stable set at most Δt < δψ/n^2
//
var qparticle = new QParticle(n, dt);
var qrenderer = new QRenderer(qparticle, canvas);
var realArr = new Float64Array(n);
for (let i = 0; i < n - 25; i++) {
    realArr[i] = i / 100;
}
qparticle.Psi.setReal(realArr);
var paused = false;
var n_iter = 10;
function loop() {
    if (!paused) {
        for (let i = 0; i < n_iter; i++)
            qparticle.stepSchrodinger();
        qrenderer.draw();
    }
    requestAnimationFrame(loop);
}
var button_ppause = document.getElementById("button_toggle_play");
button_ppause.onclick = () => {
    paused = !paused;
    button_ppause.innerHTML = paused ? "play" : "pause";
};
loop();
