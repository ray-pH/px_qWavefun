import { arr_concat } from "./utils/arr64.js";
import { step_RK4 } from "./utils/solver64.js";
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
    // type diffFun = (t : number, arr : Float64Array) => Float64Array;
    genFunSchrodinger() {
        let fun = (_t, Psi) => {
            let halflength = this.n;
            let i_dx2 = 1 / (this.dx * this.dx);
            let res = new Float64Array(Psi.length);
            // center
            for (let i = 1; i < halflength - 1; i++) {
                let ire = i;
                let iim = halflength + ire;
                let DDre = (Psi[ire + 1] - 2 * Psi[ire] + Psi[ire - 1]) * i_dx2;
                let DDim = (Psi[iim + 1] - 2 * Psi[iim] + Psi[iim - 1]) * i_dx2;
                res[ire] = (-0.5 / this.m * DDim) + (this.V[ire] * Psi[iim]);
                res[iim] = (0.5 / this.m * DDre) - (this.V[ire] * Psi[ire]);
            }
            // left (forward)
            {
                let ire = 0;
                let iim = halflength + ire;
                let DDre = (Psi[ire + 2] - 2 * Psi[ire + 1] + Psi[ire]) * i_dx2;
                let DDim = (Psi[iim + 2] - 2 * Psi[iim + 1] + Psi[iim]) * i_dx2;
                res[ire] = (-0.5 / this.m * DDim) + (this.V[ire] * Psi[iim]);
                res[iim] = (0.5 / this.m * DDre) - (this.V[ire] * Psi[ire]);
            }
            // right (backward)
            {
                let ire = halflength - 1;
                let iim = halflength + ire;
                let DDre = (Psi[ire] - 2 * Psi[ire - 1] + Psi[ire - 2]) * i_dx2;
                let DDim = (Psi[iim] - 2 * Psi[iim - 1] + Psi[iim - 2]) * i_dx2;
                res[ire] = (-0.5 / this.m * DDim) + (this.V[ire] * Psi[iim]);
                res[iim] = (0.5 / this.m * DDre) - (this.V[ire] * Psi[ire]);
            }
            return res;
        };
        return fun;
    }
    stepSchrodinger() {
        let halflength = this.n;
        let X = arr_concat(this.Psi.real, this.Psi.imag);
        let Xn = step_RK4(this.funSchrodinger, 0, X, this.dt);
        this.Psi.setReal(Xn.slice(0, halflength));
        this.Psi.setImag(Xn.slice(halflength));
    }
}
class QRenderer {
    constructor(qm, canvas) {
        this.qm = qm;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.xres = qm.n;
        this.yres = 200;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.scale(canvas.width / this.xres, canvas.height / this.yres);
        this.ctx.imageSmoothingEnabled = false; // -> nearest-neighbor interpolation
        // temp canvas to store original values
        this.data_canvas = document.createElement('canvas');
        this.data_canvas.width = qm.n;
        this.data_canvas.height = 100;
        this.data_ctx = this.data_canvas.getContext('2d');
        this.data_img_data = this.data_ctx.getImageData(0, 0, this.data_canvas.width, this.data_canvas.height);
        this.data_pixels = this.data_img_data.data;
    }
    clearImgdata() {
        this.data_pixels.fill(255);
    }
    drawProb() {
        this.clearImgdata();
        let probs = this.qm.Psi.getProbabilityArray();
        let cj = this.yres / 2;
        let color = [0, 0, 255, 255];
        for (let i = 0; i < this.qm.n; i++) {
            let jprob = probs[i] * this.yres / 2;
            for (let j = 0; j < jprob; j++) {
                var ptr = 4 * (i + (cj - j) * this.xres);
                this.data_pixels[ptr + 0] = color[0];
                this.data_pixels[ptr + 1] = color[1];
                this.data_pixels[ptr + 2] = color[2];
                this.data_pixels[ptr + 3] = color[3];
            }
        }
        // put data into temp_canvas
        this.data_ctx.putImageData(this.data_img_data, 0, 0);
        // draw into original canvas
        this.ctx.drawImage(this.data_canvas, 0, 0);
    }
}
export { WaveFunction, QParticle, QRenderer };
