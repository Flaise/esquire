'use strict'

var ObjectPool = require('./object-pool')
var sanity = require('./sanity')
var is = require('./is')


function Interpoland(tweens, value) {
    value = value || 0
    this.curr = value
    this.base = value
    this.dest = value
    this.tweens = tweens
}
Interpoland.prototype.mod = function(delta, duration, tweenFunc, onDone, remainder) {
    this.dest += delta
    return this.tweens.make(this, delta, duration, tweenFunc, onDone, remainder, delta)
}
Interpoland.prototype.modTo = function(dest, duration, tweenFunc, onDone, remainder) {
    return this.mod(dest - this.dest, duration, tweenFunc, onDone, remainder)
}
Interpoland.prototype.modNow = function(delta) {
    this.base += delta
    this.curr += delta
    this.dest += delta
}
Interpoland.prototype.modToNow = function(dest) {
    this.modNow(dest - this.dest)
}
Interpoland.prototype.setTo = function(dest) {
    this.base = dest
    this.curr = dest
    this.dest = dest
    this.tweens.removeInterpolands([this])
}
Interpoland.prototype.setToInitial = function(dest) {
    this.base = dest
    this.curr = dest
    this.dest = dest
}
Interpoland.prototype.mod_noDelta = function(amplitude, duration, tweenFunc, onDone, remainder) {
    return this.tweens.make(this, 0, duration, tweenFunc, onDone, remainder, amplitude)
}
sanity.noAccess(Interpoland.prototype, 'value')



function Interpolands() {
    ObjectPool.call(this, Interpoland)
    
    this.tweens = new Tweens()
}
Interpolands.prototype = Object.create(ObjectPool.prototype)

Interpolands.prototype.setTo = function(interpolands, dest) {
    for(var i = 0; i < interpolands.length; i += 1) {
        var interpoland = interpolands[i]
        interpoland.base = dest
        interpoland.curr = dest
        interpoland.dest = dest
    }
    this.tweens.removeInterpolands(interpolands)
}
Interpolands.prototype.setToMany = function(interpolands, dests) {
    for(var i = 0; i < interpolands.length; i += 1) {
        var interpoland = interpolands[i]
        var dest = dests[i]
        interpoland.base = dest
        interpoland.curr = dest
        interpoland.dest = dest
    }
    this.tweens.removeInterpolands(interpolands)
}


Interpolands.prototype.make = function(value) {
    return ObjectPool.prototype.make.call(this, this.tweens, value)
}
Interpolands.prototype.remove = function(removals) {
    ObjectPool.prototype.remove.call(this, removals)
    this.tweens.removeInterpolands(removals)
}

Interpolands.prototype.update = function(dt) {
    for(var i = 0; i < this.aliveCount; i += 1) {
        var interpoland = this.alive[i]
        interpoland.curr = interpoland.base
    }
    this.tweens.update(dt)
}

Interpolands.prototype.clear = function() {
    ObjectPool.prototype.clear.call(this)
    this.tweens.clear()
}

module.exports = exports = Interpolands



function Tween(interpoland, dest, duration, func, onDone, remainder, amplitude) {
    if(sanity(is.number(dest)))
        dest = 0
    if(sanity(is.number(amplitude)))
        amplitude = dest
    
    this.interpoland = interpoland
    this.curr = 0
    this.elapsed = remainder || 0
    this.dest = dest
    this.duration = duration
    this.func = func
    this.onDone = onDone
    this.amplitude = amplitude
}



function Tweens() {
    ObjectPool.call(this, Tween)
    this.ending = []
}
Tweens.prototype = Object.create(ObjectPool.prototype)

Tweens.prototype.removeInterpolands = function(removals) {
    var shiftBy = 0
    var initialCount = this.aliveCount
    for(var i = 0; i < initialCount; i += 1) {
        var tween = this.alive[i]
        
        var deleting = false
        for(var j = 0; j < removals.length; j += 1) {
            if(removals[j] === tween.interpoland) {
                deleting = true
                break
            }
        }
        
        if(deleting) {
            this.dead[this.deadCount] = tween
            this.deadCount += 1
            shiftBy += 1
        }
        else if(shiftBy && i - shiftBy >= 0)
            this.alive[i - shiftBy] = tween
    }
    this.aliveCount -= shiftBy
}
Tweens.prototype.update = function(dt) {
    var endingCount = 0
    var shiftBy = 0
    for(var i = 0; i < this.aliveCount; i += 1) {
        var tween = this.alive[i]
        tween.elapsed += dt
        
        if(tween.elapsed >= tween.duration) {
            shiftBy += 1
            
            if(tween.onDone) {
                this.ending[endingCount] = tween
                endingCount += 1
            }
            else {
                this.dead[this.deadCount] = tween
                this.deadCount += 1
            }
            
            tween.interpoland.curr += tween.dest
            tween.interpoland.base += tween.dest
        }
        else {
            tween.interpoland.curr += tween.amplitude * tween.func(tween.elapsed / tween.duration)

            if(shiftBy && i - shiftBy >= 0)
                this.alive[i - shiftBy] = tween
        }
    }
    this.aliveCount -= shiftBy
    for(var i = 0; i < endingCount; i += 1) {
        var tween = this.ending[i]
        tween.onDone(tween.elapsed - tween.duration)
        tween.onDone = undefined
        this.dead[this.deadCount] = tween
        this.deadCount += 1
    }
}
