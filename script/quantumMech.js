import { arr_scale, arr_concat } from "./utils/arr64.js";
import { step_heun } from "./utils/solver64.js";
import { hex2rgb } from "./utils/color.js";
class WaveFunction {
    constructor(n) {
        this.n = n;
        this.real = new Float64Array(n);
        this.imag = new Float64Array(n);
        this.prob = new Float64Array(n);
    }
    setReal(real) { this.real = real; }
    setImag(imag) { this.imag = imag; }
    updateProbabilityArray() {
        for (let i = 0; i < this.n; i++)
            this.prob[i] = this.real[i] * this.real[i] + this.imag[i] * this.imag[i];
    }
    getProbabilityArray() {
        this.updateProbabilityArray();
        return this.prob;
    }
    // ∫ ψψ* dx = ∫ |ψ|² dx = 1
    // if   ∫ |ψ'|² dx = C
    // then ∫ |ψ'/sqrt(C)|² dx = 1
    // normalize() : void {
    //     let dx = 1.0/this.n;
    //     let integral_dx = 0;
    //     for (let i = 0; i < this.n; i++){
    //         let re = this.real[i];
    //         let im = this.imag[i];
    //         integral_dx += re*re + im*im
    //     }
    //     let integral = integral_dx * dx;
    // }
    setPeak(peak) {
        let maxim = Math.max(...this.real, ...this.imag);
        let minim = Math.min(...this.real, ...this.imag);
        let peak0 = Math.max(Math.abs(maxim), Math.abs(minim));
        let scale = peak / peak0;
        this.real = arr_scale(scale, this.real);
        this.imag = arr_scale(scale, this.imag);
    }
}
class QParticle {
    constructor(n, dt, m = 1.0) {
        this.n = n;
        this.m = m;
        this.dt = dt;
        this.dx = 1.0 / n;
        this.Psi = new WaveFunction(n);
        this.V = new Float64Array(n);
        this.funSchrodinger = this.genFunSchrodinger();
    }
    setPotential(V) {
        this.V.set(V);
    }
    // type diffFun = (t : number, arr : Float64Array) => Float64Array;
    genFunSchrodinger() {
        let fun = (_t, Psi) => {
            let halflength = this.n;
            let i_dx2 = 1 / (this.dx * this.dx);
            let res = new Float64Array(Psi.length);
            let ire;
            let iim;
            // center
            for (let i = 1; i < halflength - 1; i++) {
                ire = i;
                iim = halflength + ire;
                let DDre = (Psi[ire + 1] - 2 * Psi[ire] + Psi[ire - 1]) * i_dx2;
                let DDim = (Psi[iim + 1] - 2 * Psi[iim] + Psi[iim - 1]) * i_dx2;
                res[ire] = (-0.5 / this.m * DDim) + (this.V[ire] * Psi[iim]);
                res[iim] = (0.5 / this.m * DDre) - (this.V[ire] * Psi[ire]);
            }
            // extrapolate boundary
            ire = 0;
            iim = halflength + ire; // left
            res[ire] = res[ire + 1];
            res[iim] = res[iim + 1];
            ire = halflength - 1;
            iim = halflength + ire; //right
            res[ire] = res[ire - 1];
            res[iim] = res[iim - 1];
            return res;
        };
        return fun;
    }
    stepSchrodinger() {
        let halflength = this.n;
        let X = arr_concat(this.Psi.real, this.Psi.imag);
        let Xn = step_heun(this.funSchrodinger, 0, X, this.dt);
        this.Psi.setReal(Xn.slice(0, halflength));
        this.Psi.setImag(Xn.slice(halflength));
    }
}
class QRenderer {
    constructor(qm, canvas, yres = 200) {
        this.Vjmax = 0.0;
        this.Vscale = 1.0;
        this.waveScale = 1.0;
        this.Vdynamic = false; // flag, whether V changes over time
        this.qm = qm;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.xres = qm.n;
        this.yres = yres;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.scale(canvas.width / this.xres, canvas.height / this.yres);
        this.ctx.imageSmoothingEnabled = false; // -> nearest-neighbor interpolation
        // temp canvas to store original values
        this.data_canvas = document.createElement('canvas');
        this.data_canvas.width = this.xres;
        this.data_canvas.height = this.yres;
        this.data_ctx = this.data_canvas.getContext('2d');
        this.data_img_data = this.data_ctx.getImageData(0, 0, this.data_canvas.width, this.data_canvas.height);
        this.data_pixels = this.data_img_data.data;
    }
    clearImgdata() { this.data_pixels.fill(255); }
    setVdynamic(Vd) { this.Vdynamic = Vd; }
    setWavescale(Ws) { this.waveScale = Ws; }
    setVscale(Vs) { this.Vscale = Vs; }
    calcVscale() {
        let Vmax = Math.max(...this.qm.V);
        let Vmin = Math.min(...this.qm.V);
        let peak0 = Math.max(Math.abs(Vmax), Math.abs(Vmin));
        this.Vscale = this.Vjmax / peak0;
    }
    setVjmax(Vj) {
        this.Vjmax = Vj;
        this.calcVscale();
    }
    drawProb(color) {
        let probs = this.qm.Psi.getProbabilityArray();
        let cj = this.yres / 2;
        for (let i = 0; i < this.qm.n; i++) {
            let jprob = Math.round(probs[i] * this.waveScale * this.yres / 2);
            for (let j = 0; j < jprob; j++) {
                var ptr = 4 * (i + (cj - j) * this.xres);
                this.data_pixels[ptr + 0] = color[0];
                this.data_pixels[ptr + 1] = color[1];
                this.data_pixels[ptr + 2] = color[2];
                this.data_pixels[ptr + 3] = color[3];
            }
        }
    }
    drawComponent(comp, color, width = 4) {
        let cj = this.yres / 2;
        for (let i = 0; i < this.qm.n; i++) {
            let jprob = Math.round(comp[i] * this.waveScale * this.yres / 2);
            for (let j = jprob - width; j < jprob; j++) {
                var ptr = 4 * (i + (cj - j) * this.xres);
                this.data_pixels[ptr + 0] = color[0];
                this.data_pixels[ptr + 1] = color[1];
                this.data_pixels[ptr + 2] = color[2];
                this.data_pixels[ptr + 3] = color[3];
            }
        }
    }
    drawPotential(color, drawBottomPot) {
        if (this.Vdynamic)
            this.calcVscale;
        let potent = this.qm.V;
        let cj = this.yres / 2;
        for (let i = 0; i < this.qm.n; i++) {
            let jpotent = Math.round(potent[i] * this.Vscale * this.yres / 2);
            let jfrom = (drawBottomPot) ? -this.yres / 2 : 0;
            let jto = Math.min(jpotent, this.yres / 2);
            for (let j = jfrom; j < jto; j++) {
                var ptr = 4 * (i + (cj - j) * this.xres);
                this.data_pixels[ptr + 0] = color[0];
                this.data_pixels[ptr + 1] = color[1];
                this.data_pixels[ptr + 2] = color[2];
                this.data_pixels[ptr + 3] = color[3];
            }
        }
    }
    draw(renderOptions) {
        this.clearImgdata();
        if (renderOptions.showPotential)
            this.drawPotential(hex2rgb(0xBBBBBB), renderOptions.showPotentialBottom); //#BBBBBB
        if (renderOptions.showProb)
            this.drawProb(hex2rgb(0x2E2E2E)); //#2E2E2E
        if (renderOptions.showReal)
            this.drawComponent(this.qm.Psi.real, hex2rgb(0x3477EB)); // #3477eb
        if (renderOptions.showImag)
            this.drawComponent(this.qm.Psi.imag, hex2rgb(0xE81570)); // #e81570
        // put data into temp_canvas
        this.data_ctx.putImageData(this.data_img_data, 0, 0);
        // draw into original canvas
        this.ctx.drawImage(this.data_canvas, 0, 0);
    }
}
export { WaveFunction, QParticle, QRenderer };
