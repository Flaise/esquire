import assert from 'power-assert'
import * as tween from './tween'

suite('tween')

const funcs = []
for(let key of Object.keys(tween))
    if(!/.*_fac$/.test(key))
        funcs.push(tween[key])
funcs.push(tween.power_fac(1))
funcs.push(tween.power_fac(2))
funcs.push(tween.power_fac(3))
funcs.push(tween.power_fac(1.5))

for(let func of funcs) {
    test(func.name, () => {
        assert(func(0) === 0)
        assert(Math.abs(func(1) - 1) < .0001) // reverseSine isn't perfectly precise
    })
}