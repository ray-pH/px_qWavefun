import {QParticle, QRenderer, RenderOptions, SimulOption} from "./quantumMech.js"
import {scene_set, scenefun, strScene_toFun, strScenes} from "./scenes.js"

var canvas : HTMLElement | null = document.getElementById("canvas");


var lastValid_strScene : string = "";
const ro : RenderOptions = {
    showReal : true,
    showImag : true,
    showProb : true,
    showPotential : true,
    showPotentialBottom : false,
    verticalResolution : 300,
    scalePotential : 8e-5,
    scaleWave : 0.8,
}
const so : SimulOption = {
    n  : 200,
    dt : 1e-6,
    n_iter : 10,
    solver : 'heun', //parameter not implemented yet
}
// approximately dψ_re <= 2Δt/Δx^2 = 2Δt n^2
// to make it stable set at most Δt < δψ/n^2

var qparticle : QParticle;
var qrenderer : QRenderer;
function initSystem(){
    qparticle = new QParticle(so.n, so.dt);
    qrenderer = new QRenderer(qparticle, canvas as HTMLCanvasElement, ro.verticalResolution);
}

function readSceneFromURL() : boolean{
    let queryString : Window['location']['search'] = window.location.search;
    let urlParams   : URLSearchParams = new URLSearchParams(queryString);
    let urlstrScene : string = urlParams.get('scene');
    if (urlstrScene == null) return false;

    let parsedstrScene : string = "";
    try{
        parsedstrScene = atob(decodeURIComponent(urlstrScene));
    } catch(e){
        console.log(e);
        return false;
    }

    (document.getElementById("select_scene") as HTMLSelectElement).value =
        (Object.keys(strScenes).length - 1).toString();;
    lastValid_strScene = parsedstrScene;
    textarea_scene.value = parsedstrScene;
    document.getElementById("button_moreScene").click();
    document.getElementById("button_applyScene").click();
    return true;
}


var paused = false;
function setup(){
    initSystem();
    let containerIds = ["container_sceneInput", "container_renderOption", "container_simulOption", "container_sceneHelp"]
    containerIds.forEach((id : string) => { document.getElementById(id).style.display = 'none'; })

    let select_scene = document.getElementById('select_scene') as HTMLSelectElement;
    let strScenesKeys = Object.keys(strScenes);
    for (let id in strScenesKeys){ select_scene.add(new Option(strScenesKeys[id], id)); }

    let success = readSceneFromURL();
    if (success) return;

    let initScene = strScenes[strScenesKeys[0]];
    lastValid_strScene = initScene;
    scene_set(qparticle, strScene_toFun(initScene), ro, qrenderer);
    textarea_scene.value = initScene;

    qrenderer.rescale(ro);
}
function loop() {
    if (!paused){
        for (let i = 0; i < so.n_iter; i++)
            qparticle.stepSchrodinger();
        qrenderer.draw(ro);
    }
    requestAnimationFrame(loop);
}

var button_ppause = document.getElementById("button_toggle_play");
button_ppause.onclick = () => {
    paused = !paused;
    button_ppause.innerHTML = paused ? "play" : "pause";
}
var button_reset = document.getElementById("button_reset");
button_reset.onclick = () => {
    let f : scenefun = strScene_toFun(lastValid_strScene);
    scene_set(qparticle, f, ro, qrenderer);
    rewrite_txRO();
    qrenderer.rescale(ro);
    qrenderer.draw(ro);
}

var textarea_scene : HTMLTextAreaElement = document.getElementById("textarea_scene") as HTMLTextAreaElement;
var container_sceneInput = document.getElementById("container_sceneInput");
var span_errorScene = document.getElementById("span_errorScene");
var button_applyScene = document.getElementById("button_applyScene");
button_applyScene.onclick = () => {
    let s = textarea_scene.value;
    let f : scenefun = strScene_toFun(s);

    let msg : string = ""; 
    let bgcolor : string = "#D6D6D6";
    try {
        scene_set(qparticle, f, ro, qrenderer);
        rewrite_txRO();
        qrenderer.rescale(ro);
        qrenderer.draw(ro);
    } catch(e){
        msg = e.toString();
        bgcolor = "#D63333"
    }

    if (msg == "") lastValid_strScene = s;
    container_sceneInput.style.backgroundColor = bgcolor;
    span_errorScene.innerHTML = msg;
}

var select_scene : HTMLSelectElement = document.getElementById("select_scene") as HTMLSelectElement;
select_scene.onchange = () => {
    let scene = parseInt(select_scene.value);
    let strScene = strScenes[Object.keys(strScenes)[scene]];
    lastValid_strScene = strScene;
    textarea_scene.value = strScene;
    let f : scenefun = strScene_toFun(strScene);
    scene_set(qparticle, f, ro, qrenderer);
    rewrite_txRO();
    qrenderer.rescale(ro);
    qrenderer.draw(ro);
}

var button_shareScene : HTMLButtonElement = document.getElementById("button_shareScene") as HTMLButtonElement;
var span_shareScene   : HTMLDivElement    = document.getElementById("span_shareScene") as HTMLDivElement;
var input_shareScene  : HTMLInputElement  = document.getElementById("input_shareScene") as HTMLInputElement;
button_shareScene.onclick = () => {
    let siteURI    : string = window.location.href.split('?')[0];
    let strScene   : string = textarea_scene.value;
    let strScene64 : string = btoa(strScene);
    span_shareScene.style.display = "grid";
    input_shareScene.value = siteURI + "?scene=" + encodeURIComponent(strScene64);
}

function setButtonShow(buttonId : string, containerId : string, sOpen : string, sClosed : string){
    let button     = document.getElementById(buttonId);
    let container  = document.getElementById(containerId);
    button.onclick = ()=>{
        let changeto   = (container.style.display == 'none') ? 'block' : 'none';
        button.innerHTML = (changeto == 'none') ? sOpen : sClosed;
        container.style.display = changeto;
    };
}
setButtonShow("button_moreDesc"  , "container_desc"        ,'∨','∧');
setButtonShow("button_moreScene" , "container_sceneInput"  ,'∨','∧');
setButtonShow("button_moreRender", "container_renderOption",'∨','∧');
setButtonShow("button_moreSimul" , "container_simulOption" ,'∨','∧');
setButtonShow("button_helpScene", "container_sceneHelp"    ,'?','?');

function attachCheckbox(checkboxId : string, opt : RenderOptions, component : string){
    let checkbox = document.getElementById(checkboxId) as HTMLInputElement;
    checkbox.onchange = ()=>{ 
        opt[component] = checkbox.checked 
        qrenderer.draw(ro);
    };
}
attachCheckbox("cx_showReal",   ro, "showReal");
attachCheckbox("cx_showImag",   ro, "showImag");
attachCheckbox("cx_showProb",   ro, "showProb");
attachCheckbox("cx_showPotent", ro, "showPotential");
attachCheckbox("cx_showNegPotent", ro, "showPotentialBottom");

const tx_ROcomponent = {
    "tx_yres"     : "verticalResolution",
    "tx_waveScale": "scaleWave",
    "tx_potScale" : "scalePotential",
}

function rewrite_txRO(){
    for (let tx_id in tx_ROcomponent){
        let comp = tx_ROcomponent[tx_id];
        let tx_element : HTMLInputElement = document.getElementById(tx_id) as HTMLInputElement;
        tx_element.value = ro[comp];
    }
};

for (let tx_id in tx_ROcomponent){
    let comp = tx_ROcomponent[tx_id];
    let tx_element : HTMLInputElement = document.getElementById(tx_id) as HTMLInputElement;
    let val : number = ro[comp];
    tx_element.value = (val < 0.01) ? val.toExponential() : val.toString();
    tx_element.oninput = () => { 
        ro[comp] = parseFloat(tx_element.value); 
        qrenderer.rescale(ro);
    }
}

const tx_SOcomponent = {
    "tx_n_grid" : "n",
    "tx_n_iter" : "n_iter",
    "tx_dt"     : "dt",
}
for (let tx_id in tx_SOcomponent){
    let comp = tx_SOcomponent[tx_id];
    let tx_element : HTMLInputElement = document.getElementById(tx_id) as HTMLInputElement;
    let val : number = so[comp];
    tx_element.value = (val < 0.01) ? val.toExponential() : val.toString();
}
var button_applySimulOp = document.getElementById("button_applySimulOp");
button_applySimulOp.onclick = () => {
    for (let tx_id in tx_SOcomponent){
        let comp = tx_SOcomponent[tx_id];
        let tx_element : HTMLInputElement = document.getElementById(tx_id) as HTMLInputElement;
        let parsed : number = parseFloat(tx_element.value);
        if (isNaN(parsed)) return;
        so[comp] = parsed;
    }
    initSystem();

    let f : scenefun = strScene_toFun(lastValid_strScene);
    scene_set(qparticle, f, ro, qrenderer);
    rewrite_txRO();
    qrenderer.rescale(ro);
    qrenderer.draw(ro);
}

setup();
loop();
