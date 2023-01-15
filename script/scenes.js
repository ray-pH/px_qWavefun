function scene_set(qp, sf, ro, qr) {
    let potentArr = qp.V;
    let realArr = qp.Psi.real;
    let imagArr = qp.Psi.imag;
    let normalize = { 'wavepeak': 1.0 };
    sf(potentArr.length, potentArr, realArr, imagArr, normalize, ro);
    qp.Psi.setPeak(normalize.wavepeak);
    qr.rescale(ro);
}
function strScene_toFun(s) {
    let f = new Function('n', 'potent', 'real', 'imag', 'normalize', 'renderOpt', "\"use strict\";\n" + s);
    return f;
}
let strScene_Parabola = `let energy = 40;
normalize.wavepeak = 0.8;
renderOpt.scalePotential = 8e-5;

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
`;
let strScene_Tunneling = `let energy = 60;
normalize.wavepeak = 1.0;
renderOpt.scalePotential = 1e-3;

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
`;
const strScenes = {
    'Parabolic Potential': strScene_Parabola,
    'Quantum Tunneling': strScene_Tunneling,
    'Custom': '',
};
export { scene_set, strScene_toFun, strScenes };
