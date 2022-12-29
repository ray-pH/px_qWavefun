import { QParticle, QRenderer } from "./quantumMech.js";
import { scene_set, strScene_toFun, strScene_Parabola, strScene_Tunneling } from "./scenes.js";
var canvas = document.getElementById("canvas");
var n = 200;
var ny = 300; // for canvas
var dt = 1e-6;
// approximately dψ_re <= 2Δt/Δx^2 = 2Δt n^2
// to make it stable set at most Δt < δψ/n^2
var qparticle = new QParticle(n, dt);
var qrenderer = new QRenderer(qparticle, canvas, ny);
// scene_set(qparticle, scene_Parabola);
scene_set(qparticle, strScene_toFun(strScene_Parabola));
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
    // let f : scenefun = new Function('potentArr', 'realArr', 'imagArr', "\"use strict\";\n" + s) as scenefun;
    let f = strScene_toFun(s);
    scene_set(qparticle, f);
    qparticle.Psi.setPeak(0.8);
    qrenderer.setVjmax(0.8);
};
var strScenes = [strScene_Parabola, strScene_Tunneling];
var select_scene = document.getElementById("select_scene");
select_scene.onchange = () => {
    let scene = parseInt(select_scene.value);
    let f = strScene_toFun(strScenes[scene]);
    scene_set(qparticle, f);
    qparticle.Psi.setPeak(0.8);
    qrenderer.setVjmax(0.8);
};
var button_ppause = document.getElementById("button_toggle_play");
button_ppause.onclick = () => {
    paused = !paused;
    button_ppause.innerHTML = paused ? "play" : "pause";
};
loop();
