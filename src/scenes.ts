import { QParticle} from "./quantumMech.js"

type scenefun = (p : Float64Array, r : Float64Array, i : Float64Array) => void;

function scene_set(qp : QParticle, sf : scenefun){
    let potentArr = qp.V;
    let realArr   = qp.Psi.real;
    let imagArr   = qp.Psi.imag;
    sf(potentArr, realArr, imagArr);
}

function strScene_toFun(s : string) : scenefun {
    let f : scenefun = new Function('potentArr', 'realArr', 'imagArr', "\"use strict\";\n" + s) as scenefun;
    return f;
}

let strScene_Parabola : string = 
`let n = potentArr.length;
let energy = 40;

for (let i = 0; i < n; i++) {
    let x = i / n;
    let y = -(x - 0.1) * (x - 0.4);
    let envelope = Math.max(y, 0);
    realArr[i] = envelope * Math.sin(energy * x);
    imagArr[i] = envelope * Math.cos(energy * x);
}

for (let i = 0; i < n; i++){
    let x = i/n;
    potentArr[i] = n * n * (x-0.5) * (x-0.5);
}
`

let strScene_Tunneling : string = 
`let n = potentArr.length;
let energy = 60;

for (let i = 0; i < n; i++) {
    let x = i / n;
    let y = -(x - 0.7) * (x - 0.9);
    let envelope = Math.max(y, 0);
    realArr[i] = envelope * Math.sin(energy * x);
    imagArr[i] = envelope * Math.cos(energy * x);
}

let ifrom = Math.round(0.55 * n);
let ito   = Math.round(0.60 * n);
potentArr.fill(0.0);
for (let i = ifrom; i < ito; i++){
    potentArr[i] = n * n * 0.05;
}
`

export {scene_set, scenefun, strScene_toFun, strScene_Parabola, strScene_Tunneling};
