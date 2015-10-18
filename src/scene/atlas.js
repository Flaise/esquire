import Icon from './icon'
import loadImage from './load-image'

export default class Atlas {
    constructor() {
        this._icons = Object.create(null)
        this._layout = undefined
        this._image = undefined
    }
    
    get(name) {
        let icon = this._icons[name]
        if(!icon) {
            icon = new Icon(this.image, this.layoutOf(name))
            this._icons[name] = icon
        }
        return icon
    }
    
    set image(value) {
        this._image = value
        // TODO: check ready state to ensure not already loaded
        if(value)
            value.onload = () => {
                value.onerror = value.onload = undefined
                if(this._image === value)
                    for(let key of Object.keys(this._icons))
                        this._icons[key].image = value
            }
        else
            for(let key of Object.keys(this._icons))
                this._icons[key].image = value
    }
    get image() {
        return this._image
    }
    
    set layout(value) {
        this._layout = value
        for(let key of Object.keys(this._icons))
            this._icons[key].layout = this.layoutOf(key)
    }
    get layout() {
        return this._layout
    }
    
    layoutOf(name) {
        return this.layout && this.layout.sprites && this.layout.sprites[name]
    }
    
    hasData(name) {
        return !!this.layoutOf(name)
    }
    
    loadImage(source) {
        this.image = loadImage(source)
    }
    
    load(data, next) {
        const oldImage = this.layout && this.layout.image
        this.layout = data
        
        if(data.image && data.image !== oldImage)
            this.loadImage(data.image, next)
        else
            setTimeout(next)
    }
}
