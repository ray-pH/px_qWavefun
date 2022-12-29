function scene_set(qp, sf) {
    let potentArr = qp.V;
    let realArr = qp.Psi.real;
    let imagArr = qp.Psi.imag;
    sf(potentArr, realArr, imagArr);
}
function scene_Parabola(potentArr, realArr, imagArr, energy = 40) {
    let n = potentArr.length;
    for (let i = 0; i < n; i++) {
        let x = i / n;
        let y = -(x - 0.1) * (x - 0.4);
        let envelope = Math.max(y, 0);
        realArr[i] = envelope * Math.sin(energy * x);
        imagArr[i] = envelope * Math.cos(energy * x);
    }
    for (let i = 0; i < n; i++) {
        let x = i / n;
        potentArr[i] = n * n * (x - 0.5) * (x - 0.5);
    }
}
function scene_Tunneling(potentArr, realArr, imagArr, energy = 60) {
    let n = potentArr.length;
    for (let i = 0; i < n; i++) {
        let x = i / n;
        let y = -(x - 0.7) * (x - 0.9);
        let envelope = Math.max(y, 0);
        realArr[i] = envelope * Math.sin(energy * x);
        imagArr[i] = envelope * Math.cos(energy * x);
    }
    let ifrom = Math.round(0.55 * n);
    let ito = Math.round(0.60 * n);
    potentArr.fill(0.0);
    for (let i = ifrom; i < ito; i++) {
        potentArr[i] = n * n * 0.05;
    }
}
export { scene_Parabola, scene_Tunneling, scene_set };
