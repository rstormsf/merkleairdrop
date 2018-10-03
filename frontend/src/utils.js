import BN from "bn.js"

export const sleep = time => new Promise(res => setTimeout(res, time))

export const decimal = (number, exp) =>
    exp > 0 ? new BN(number).mul(new BN(10).pow(new BN(exp))).toString() : new BN(number).div(new BN(10).pow(new BN(exp))).toString()
