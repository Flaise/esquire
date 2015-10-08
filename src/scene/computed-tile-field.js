import TileField from './tile-field'
import IconAvatar from './icon-avatar'
import is from '../is'

export default class ComputedTileField {
    constructor(root, tileSize) {
        this.field = new TileField(root, tileSize)
        this.types = Object.create(null) // {position: {type: true}}
        this.updaters = Object.create(null)
    }
    
    _hasTypeAtKey(key, types) {
        const typeSet = this.types[key]
        if(!typeSet)
            return false
        if(!is.iterable(types))
            return !!typeSet[types]
        for(let type of types)
            if(typeSet[type])
                return true
        return false
    }
    
    _addType(x, y, type) {
        const key = keyOf(x, y)
        let typeSet = this.types[key]
        if(!typeSet) {
            typeSet = Object.create(null)
            this.types[key] = typeSet
        }
        typeSet[type] = true
    }
    _addUpdater(x, y, func) {
        const key = keyOf(x, y)
        let updaters = this.updaters[key]
        if(!updaters) {
            updaters = []
            this.updaters[key] = updaters
        }
        
        updaters.push(func)
    }
    
    _changedAt(x, y) {
        const functions = this.updaters[keyOf(x, y)]
        if(functions)
            for(let func of functions)
                func()
    }
    
    _changedAround(x, y) {
        this._changedAt(x - 1, y - 1)
        this._changedAt(x, y - 1)
        this._changedAt(x + 1, y - 1)
        this._changedAt(x - 1, y)
        this._changedAt(x + 1, y)
        this._changedAt(x - 1, y + 1)
        this._changedAt(x, y + 1)
        this._changedAt(x + 1, y + 1)
    }
    
    _makeTile4Part(icon, x, y, layer, sx, sy) {
        const segment = this.field.nodeAt(x, y)
        const avatar = new IconAvatar(segment, undefined, x + .25 * sx, y + .25 * sy, .5, .5)
        avatar.layer = layer
        if(is.function(icon))
            this._addUpdater(x, y, icon(this, avatar, x, y))
        else
            avatar.icon = icon
    }
    
    makeTile4(icons, x, y, layer, type) {
        const {nw, ne, sw, se} = icons
        
        this._makeTile4Part(nw, x, y, layer, -1, -1)
        this._makeTile4Part(ne, x, y, layer, 1, -1)
        this._makeTile4Part(sw, x, y, layer, -1, 1)
        this._makeTile4Part(se, x, y, layer, 1, 1)
        
        this._addType(x, y, type)
        this._changedAt(x, y)
        this._changedAround(x, y)
    }
    makeTile(icon, x, y, layer, type) {
        const avatar = new IconAvatar(this.field.nodeAt(x, y), icon, x, y, 1, 1)
        avatar.layer = layer
        this._addType(x, y, type)
        this._changedAround(x, y)
    }
    
    clear() {
        this.field.clear()
    }
}

function keyOf(x, y) {
    return x + ',' + y
}


export function borderIcons(
    observedTypes, inverse,
    nw, n, ne,
    w,  c,  e,
    sw, s, se,
    concaveNW, concaveNE,
    concaveSW, concaveSE
) {
    if(inverse) {
        // TODO: Does this make sense or is the atlas mistructured?
        ;[concaveNW, concaveNE, concaveSW, concaveSE] = [concaveSE, concaveSW, concaveNE, concaveNW]
    }
    
    return {
        nw: selected(-1, -1, observedTypes, inverse, nw, concaveNW, n, w, c),
        ne: selected(1, -1, observedTypes, inverse, ne, concaveNE, n, e, c),
        sw: selected(-1, 1, observedTypes, inverse, sw, concaveSW, s, w, c),
        se: selected(1, 1, observedTypes, inverse, se, concaveSE, s, e, c)
    }
}

function selected(dx, dy, observedTypes, inverse, convex, concave, hFace, vFace, surrounded) {
    return (cfield, avatar, x, y) => {
        const cornerKey = keyOf(x + dx, y + dy)
        const hKey = keyOf(x, y + dy)
        const vKey = keyOf(x + dx, y)
        
        return () => {
            let corner = cfield._hasTypeAtKey(cornerKey, observedTypes)
            let horiz = cfield._hasTypeAtKey(hKey, observedTypes)
            let vert = cfield._hasTypeAtKey(vKey, observedTypes)
            
            if(inverse) {
                corner = !corner
                horiz = !horiz
                vert = !vert
            }
            
            avatar.icon = select(convex, concave, hFace, vFace, surrounded, corner, horiz, vert)
        }
    }
}

function select(convex, concave, hFace, vFace, surrounded, atCorner, atHFace, atVFace) {
    return (atCorner && atHFace && atVFace)? surrounded:
           (atHFace && atVFace)? concave:
           atVFace? hFace:
           atHFace? vFace:
           convex
}