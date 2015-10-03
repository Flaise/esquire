import Vec2 from './vector2'


export function wrap(a) {
    const b = a - Math.ceil(a)
    return b && (b + 1)
}
export function toRadians(a) {
    return a * 2 * Math.PI
}
export function fromRadians(a) {
    return a / 2 / Math.PI
}
export function shortestOffset(from, to) {
    return wrap(wrap(to) - wrap(from) + 1.5) - .5
}

export function toVector(a) {
    a = wrap(a)
    switch(a) {
        case NORTH: return new Vec2(0, -1)
        case EAST:  return new Vec2(1, 0)
        case SOUTH: return new Vec2(0, 1)
        case WEST:  return new Vec2(-1, 0)
        default:    return new Vec2(0, -1).rotated(a)
    }
}
export const NORTH = 0
export const EAST = .25
export const SOUTH = .5
export const WEST = .75
