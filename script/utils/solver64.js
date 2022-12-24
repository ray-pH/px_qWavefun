import { arr_add, arr_scale } from "./arr64.js";
function step_euler(f, ti, Xi, dt) {
    // yn = yi + f * dt
    let Fi = f(ti, Xi);
    let Xn = arr_add(Xi, arr_scale(dt, Fi));
    return Xn;
}
function step_heun(f, ti, Xi, dt) {
    let tn = ti + dt;
    let Fi = f(ti, Xi);
    //  Xp = X + dt*Fi
    let Xp = arr_add(Xi, arr_scale(dt, Fi));
    let Fp = f(tn, Xp);
    //  Xn = Xi + dt/2 * (Fi + Fp)
    let Xn = arr_add(Xi, arr_scale(dt / 2, arr_add(Fi, Fp)));
    return Xn;
}
function step_RK4(f, ti, Xi, dt) {
    let tn = ti + dt;
    //  k1 = h * f(T(i)        , Y(i,:)         );
    //  k2 = h * f(T(i) + 1/2*h, Y(i,:) + 1/2*k1);
    //  k3 = h * f(T(i) + 1/2*h, Y(i,:) + 1/2*k2);
    //  k4 = h * f(T(i) +     h, Y(i,:) +     k3);
    //
    //
    let K1 = f(ti, Xi);
    let t2 = ti + dt / 2.0;
    let X2 = arr_add(Xi, arr_scale(dt / 2.0, K1));
    let K2 = f(t2, X2);
    let t3 = t2;
    let X3 = arr_add(Xi, arr_scale(dt / 2.0, K2));
    let K3 = f(t3, X3);
    let t4 = tn;
    let X4 = arr_add(Xi, arr_scale(dt, K3));
    let K4 = f(t4, X4);
    let twoK2 = arr_scale(2.0, K2);
    let twoK3 = arr_scale(2.0, K3);
    let Ksum = arr_add(K1, arr_add(twoK2, arr_add(twoK3, K4)));
    return arr_add(Xi, arr_scale(dt / 6.0, Ksum));
}
export { step_euler, step_heun, step_RK4 };
