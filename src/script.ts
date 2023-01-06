import {QParticle, QRenderer, RenderOptions} from "./quantumMech.js"
import {scene_set, scenefun, strScene_toFun, strScene_Parabola, strScene_Tunneling} from "./scenes.js"

var canvas : HTMLElement | null = document.getElementById("canvas");

var n  = 200;
var ny = 300; // for canvas
var dt = 1e-6; 

// approximately dψ_re <= 2Δt/Δx^2 = 2Δt n^2
// to make it stable set at most Δt < δψ/n^2

var qparticle = new QParticle(n, dt);
var qrenderer = new QRenderer(qparticle, canvas as HTMLCanvasElement, ny);

var renderOptions : RenderOptions = {
    showReal : true,
    showImag : true,
    showProb : true,
    showPotential : true,
    showPotentialBottom : false,
    scalePotential : 1.0,
    scaleWave : 1.0,
}

var paused = false;
var n_iter = 10;

function setup(){
    let containerIds = ["container_sceneInput", "container_renderOption", "container_simulOption"]
    containerIds.forEach((id : string) => { document.getElementById(id).style.display = 'none'; })

    let initScene = strScene_Parabola;
    scene_set(qparticle, strScene_toFun(initScene));
    textarea_scene.value = initScene;

    qrenderer.setWavescale(0.8);
    qrenderer.setVjmax(0.8);

}
function loop() {
    if (!paused){
        for (let i = 0; i < n_iter; i++)
            qparticle.stepSchrodinger();
        qrenderer.draw(renderOptions);
    }
    requestAnimationFrame(loop);
}

var button_ppause = document.getElementById("button_toggle_play");
button_ppause.onclick = () => {
    paused = !paused;
    button_ppause.innerHTML = paused ? "play" : "pause";
}

var textarea_scene : HTMLTextAreaElement = document.getElementById("textarea_scene") as HTMLTextAreaElement;
var button_applyScene = document.getElementById("button_applyScene");
button_applyScene.onclick = () => {
    let s = textarea_scene.value;
    let f : scenefun = strScene_toFun(s);
    scene_set(qparticle, f);
    qrenderer.setWavescale(0.8);
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
    qrenderer.setWavescale(0.8);
    qrenderer.setVjmax(0.8);
}

function setButtonShow(buttonId : string, containerId : string){
    let button     = document.getElementById(buttonId);
    let container  = document.getElementById(containerId);
    button.onclick = ()=>{
        let changeto   = (container.style.display == 'none') ? 'block' : 'none';
        button.innerHTML = (changeto == 'none') ? '∨' : '∧';
        container.style.display = changeto;
    };
}
setButtonShow("button_moreScene" , "container_sceneInput");
setButtonShow("button_moreRender", "container_renderOption");
setButtonShow("button_moreSimul" , "container_simulOption");

function attachCheckbox(checkboxId : string, opt : RenderOptions, component : string){
    let checkbox = document.getElementById(checkboxId) as HTMLInputElement;
    checkbox.onchange = ()=>{ opt[component] = checkbox.checked };
}
attachCheckbox("cx_showReal",   renderOptions, "showReal");
attachCheckbox("cx_showImag",   renderOptions, "showImag");
attachCheckbox("cx_showProb",   renderOptions, "showProb");
attachCheckbox("cx_showPotent", renderOptions, "showPotential");
attachCheckbox("cx_showNegPotent", renderOptions, "showPotentialBottom");

setup();
loop();
