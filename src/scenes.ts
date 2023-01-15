import { QParticle, QRenderer, RenderOptions} from "./quantumMech.js"

type scenefun = (n : number, p : Float64Array, r : Float64Array, i : Float64Array, no : Object, ro : RenderOptions) => void;

function scene_set(qp : QParticle, sf : scenefun, ro : RenderOptions, qr : QRenderer){
    let potentArr = qp.V;
    let realArr   = qp.Psi.real;
    let imagArr   = qp.Psi.imag;
    let normalize = {'wavepeak' : 1.0};
    sf(potentArr.length, potentArr, realArr, imagArr, normalize, ro);
    qp.Psi.setPeak(normalize.wavepeak);
    qr.rescale(ro);
}

function strScene_toFun(s : string) : scenefun {
    let f : scenefun = new Function('n', 'potent', 'real', 'imag', 'normalize', 'renderOpt', "\"use strict\";\n" + s) as scenefun;
    return f;
}

let ss_Parabola : string = 
`let energy = 40;

for (let i = 0; i < n; i++) {
    let x = i / n;
    let y = -(x - 0.1) * (x - 0.4);
    let envelope = Math.max(y, 0);
    real[i] = envelope * Math.sin(energy * x);
    imag[i] = envelope * Math.cos(energy * x);
}

for (let i = 0; i < n; i++){
    let x = i/n;
    potent[i] = n * n * (x-0.5) * (x-0.5);
}

normalize.wavepeak = 0.8;
renderOpt.scalePotential = 8e-5;
`

let ss_Tunneling : string = 
`let energy = 60;

for (let i = 0; i < n; i++) {
    let x = i / n;
    let y = -(x - 0.7) * (x - 0.9);
    let envelope = Math.max(y, 0);
    real[i] = envelope * Math.sin(energy * x);
    imag[i] = envelope * Math.cos(energy * x);
}

let ifrom = Math.round(0.55 * n);
let ito   = Math.round(0.60 * n);
potent.fill(0.0);
for (let i = ifrom; i < ito; i++){
    potent[i] = n * n * 0.05;
}

normalize.wavepeak = 1.0;
renderOpt.scalePotential = 1e-3;
`

const ss_TwoParticle : string = 
`let energy = 40;

for (let i = 0; i < n; i++) {
    let x = i / n;
    let y1 = -(x - 0.2) * (x - 0.4);
    let env1 = Math.max(y1, 0);
    
    let y2 = -(x - 0.9) * (x - 0.7);
    let env2 = Math.max(y2,0);

    let r1 = env1 * Math.sin(energy * -x);
    let i1 = env1 * Math.cos(energy * -x);
    let r2 = env2 * Math.sin(energy * x);
    let i2 = env2 * Math.cos(energy * x);

    real[i] = r1+r2;
    imag[i] = i1+i2;
}


for (let i = 0; i < n; i++){
    let x = i/n;
    potent[i] = n * n * (x-0.5) * (x-0.5);
}

normalize.wavepeak = 0.8;
renderOpt.scalePotential = 8e-5;
`

const ss_boxBasis : string = 
` // Increase step per Frame if movement is too slow
let L = 0.8;
let n_state = 3;

let kn = n_state * Math.PI / L;
for (let i = 0; i < n; i++) {
    let x = i / n;
    
    real[i] = Math.sin(kn * (x - 0.5 + L/2));
    imag[i] = 0;
}

potent.fill(0.0);
for (let i = 0; i < Math.round((1.0-L)/2*n); i++){
    potent[i] = n*n;
    potent[potent.length-1-i] = n*n;
    real[i] = 0; real[potent.length-1-i] = 0;
    imag[i] = 0; imag[potent.length-1-i] = 0;
}

normalize.wavepeak = 0.8;
renderOpt.scalePotential = 8e-5;
`

interface SceneStr {
    [key : string] : string;
}
const strScenes : SceneStr = {
    'Parabolic Potential' : ss_Parabola,
    'Quantum Tunneling'   : ss_Tunneling,
    'TwoParticle'         : ss_TwoParticle,
    'Basis State in Potential Well' : ss_boxBasis,
    'Custom'              : '',
}

export {scene_set, scenefun, strScene_toFun, SceneStr, strScenes};
