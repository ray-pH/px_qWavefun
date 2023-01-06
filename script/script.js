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
var ro = {
    showReal: true,
    showImag: true,
    showProb: true,
    showPotential: true,
    showPotentialBottom: false,
    scalePotential: 8e-5,
    scaleWave: 0.8,
};
var paused = false;
var n_iter = 10;
function setup() {
    let containerIds = ["container_sceneInput", "container_renderOption", "container_simulOption"];
    containerIds.forEach((id) => { document.getElementById(id).style.display = 'none'; });
    let initScene = strScene_Parabola;
    scene_set(qparticle, strScene_toFun(initScene));
    textarea_scene.value = initScene;
    qrenderer.setWavescale(ro.scaleWave);
    qrenderer.setVscale(ro.scalePotential);
}
function loop() {
    if (!paused) {
        for (let i = 0; i < n_iter; i++)
            qparticle.stepSchrodinger();
        qrenderer.draw(ro);
    }
    requestAnimationFrame(loop);
}
var button_ppause = document.getElementById("button_toggle_play");
button_ppause.onclick = () => {
    paused = !paused;
    button_ppause.innerHTML = paused ? "play" : "pause";
};
var textarea_scene = document.getElementById("textarea_scene");
var button_applyScene = document.getElementById("button_applyScene");
button_applyScene.onclick = () => {
    let s = textarea_scene.value;
    let f = strScene_toFun(s);
    scene_set(qparticle, f);
    qrenderer.setWavescale(ro.scaleWave);
    qrenderer.setVscale(ro.scalePotential);
    qrenderer.draw(ro);
};
var strScenes = [strScene_Parabola, strScene_Tunneling];
var select_scene = document.getElementById("select_scene");
select_scene.onchange = () => {
    let scene = parseInt(select_scene.value);
    let strScene = strScenes[scene];
    textarea_scene.value = strScene;
    let f = strScene_toFun(strScene);
    scene_set(qparticle, f);
    qrenderer.setWavescale(ro.scaleWave);
    qrenderer.setVscale(ro.scalePotential);
    qrenderer.draw(ro);
};
function setButtonShow(buttonId, containerId) {
    let button = document.getElementById(buttonId);
    let container = document.getElementById(containerId);
    button.onclick = () => {
        let changeto = (container.style.display == 'none') ? 'block' : 'none';
        button.innerHTML = (changeto == 'none') ? '∨' : '∧';
        container.style.display = changeto;
    };
}
setButtonShow("button_moreScene", "container_sceneInput");
setButtonShow("button_moreRender", "container_renderOption");
setButtonShow("button_moreSimul", "container_simulOption");
function attachCheckbox(checkboxId, opt, component) {
    let checkbox = document.getElementById(checkboxId);
    checkbox.onchange = () => {
        opt[component] = checkbox.checked;
        qrenderer.draw(ro);
    };
}
attachCheckbox("cx_showReal", ro, "showReal");
attachCheckbox("cx_showImag", ro, "showImag");
attachCheckbox("cx_showProb", ro, "showProb");
attachCheckbox("cx_showPotent", ro, "showPotential");
attachCheckbox("cx_showNegPotent", ro, "showPotentialBottom");
setup();
loop();
