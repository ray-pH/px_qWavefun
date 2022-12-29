import { QParticle, QRenderer } from "./quantumMech.js";
import { scene_Parabola, scene_Tunneling, scene_set } from "./scenes.js";
var canvas = document.getElementById("canvas");
var n = 200;
var ny = 300; // for canvas
var dt = 1e-6;
// approximately dψ_re <= 2Δt/Δx^2 = 2Δt n^2
// to make it stable set at most Δt < δψ/n^2
var qparticle = new QParticle(n, dt);
var qrenderer = new QRenderer(qparticle, canvas, ny);
// var potentArr = new Float64Array(n);
// var realArr = new Float64Array(n);
// var imagArr = new Float64Array(n);
// scene_Parabola(potentArr, realArr, imagArr);
// qparticle.setPotential(potentArr);
// qparticle.Psi.setReal(realArr);
// qparticle.Psi.setImag(imagArr);
scene_set(qparticle, scene_Tunneling);
qparticle.Psi.setPeak(0.8);
qrenderer.setVjmax(0.8);
qrenderer.option_drawBottomPot = false;
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
var textarea_scene = document.getElementById("textarea_scene");
var button_applyScene = document.getElementById("button_applyScene");
button_applyScene.onclick = () => {
    let s = textarea_scene.value;
    eval("\"use strict\";\n" + s);
};
var scene_gen = [scene_Parabola, scene_Tunneling];
var select_scene = document.getElementById("select_scene");
select_scene.onchange = () => {
    let scene = parseInt(select_scene.value);
};
var button_ppause = document.getElementById("button_toggle_play");
button_ppause.onclick = () => {
    paused = !paused;
    button_ppause.innerHTML = paused ? "play" : "pause";
};
loop();
