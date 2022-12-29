import {QParticle, QRenderer} from "./quantumMech.js"
import {scene_set, scenefun, strScene_toFun, strScene_Parabola, strScene_Tunneling} from "./scenes.js"

var canvas : HTMLElement | null = document.getElementById("canvas");

var n  = 200;
var ny = 300; // for canvas
var dt = 1e-6; 

// approximately dψ_re <= 2Δt/Δx^2 = 2Δt n^2
// to make it stable set at most Δt < δψ/n^2

var qparticle = new QParticle(n, dt);
var qrenderer = new QRenderer(qparticle, canvas as HTMLCanvasElement, ny);


var paused = false;
var n_iter = 10;

function setup(){
    container_sceneInput.style.display = 'none';

    let initScene = strScene_Parabola;
    scene_set(qparticle, strScene_toFun(initScene));
    textarea_scene.value = initScene;

    qparticle.Psi.setPeak(0.8);
    qrenderer.setVjmax(0.8);
    qrenderer.option_drawBottomPot = false;

}
function loop() {
    if (!paused){
        for (let i = 0; i < n_iter; i++)
            qparticle.stepSchrodinger();
        qrenderer.draw();
    }
    requestAnimationFrame(loop);
}

var textarea_scene : HTMLTextAreaElement = document.getElementById("textarea_scene") as HTMLTextAreaElement;
var button_applyScene = document.getElementById("button_applyScene");
button_applyScene.onclick = () => {
    let s = textarea_scene.value;
    let f : scenefun = strScene_toFun(s);
    scene_set(qparticle, f);
    qparticle.Psi.setPeak(0.8);
    qrenderer.setVjmax(0.8);
}

var strScenes = [strScene_Parabola, strScene_Tunneling];
var select_scene : HTMLSelectElement = document.getElementById("select_scene") as HTMLSelectElement;
select_scene.onchange = () => {
    let scene = parseInt(select_scene.value);
    let strScene = strScenes[scene];
    textarea_scene.value = strScene;
    let f : scenefun = strScene_toFun(strScene);
    scene_set(qparticle, f);
    qparticle.Psi.setPeak(0.8);
    qrenderer.setVjmax(0.8);
}

var button_moreScene     = document.getElementById("button_moreScene");
var container_sceneInput = document.getElementById("container_sceneInput");
button_moreScene.onclick = () => {
    container_sceneInput.style.display = (container_sceneInput.style.display == 'none') ? 'block' : 'none';
}

var button_ppause = document.getElementById("button_toggle_play");
button_ppause.onclick = () => {
    paused = !paused;
    button_ppause.innerHTML = paused ? "play" : "pause";
}

setup();
loop();
