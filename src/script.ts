import {QParticle, QRenderer} from "./quantumMech.js"

var canvas : HTMLElement | null = document.getElementById("canvas");

var n  = 200;
var dt = 1e-6; 

// approximately dψ_re <= 2Δt/Δx^2 = 2Δt n^2
// to make it stable set at most Δt < δψ/n^2
//
var qparticle = new QParticle(n, dt);
var qrenderer = new QRenderer(qparticle, canvas as HTMLCanvasElement, 300);

var potentArr = new Float64Array(n);
for (let i = 0; i < n; i++){
    let x = i/n;
    potentArr[i] = n * n * (x-0.5) * (x-0.5);
}

var realArr = new Float64Array(n);
var imagArr = new Float64Array(n);
var sinusoidscale = 40;
for (let i = 0; i < n; i++){
    let x = i/n;
    let y = -(x - 0.1)*(x - 0.4);
    let envelope = Math.max(y,0)
    realArr[i] = envelope * Math.sin(sinusoidscale * x);
    imagArr[i] = envelope * Math.cos(sinusoidscale * x);
}

qparticle.Psi.setReal(realArr);
qparticle.Psi.setImag(imagArr);
qparticle.Psi.setPeak(0.8);
qparticle.setPotential(potentArr);
qrenderer.setVjmax(0.8);

var paused = false;
var n_iter = 10;
function loop() {
    if (!paused){
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
}

loop();
