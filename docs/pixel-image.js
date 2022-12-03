((script, init) => {
    if (document.readyState !== 'loading')
        return init(script);
    document.addEventListener('DOMContentLoaded', () => {
        init(script);
    });
})(document.currentScript, (script) => {
    function PositiveNumber(num) {
        if (!num) {
            return 0;
        }
        num = (typeof num === 'string') ? parseInt(num) : Math.floor(num);
        if (num < 0) {
            return 0;
        }
        return num;
    }
    function ParseImage(img) {
        if (img instanceof HTMLCanvasElement) {
            return Promise.resolve(img);
        }
        const p = img instanceof HTMLImageElement ? Promise.resolve(img) : ((src) => {
            return new Promise((resolve, reject) => {
                const img = document.createElement('img');
                img.onabort = reject;
                img.onerror = reject;
                img.onload = () => {
                    resolve(img);
                };
                img.src = src;
            });
        })(img);
        return p.then((img) => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const context = canvas.getContext('2d');
            if (!context) {
                throw new Error('Failure to get context2D.');
            }
            context.drawImage(img, 0, 0);
            return canvas;
        });
    }
    function ConvertColorCode(r, g, b, a) {
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${a.toString(16).padStart(2, '0')}`;
    }
    ((component, tagname = 'pixel-image') => {
        if (customElements.get(tagname))
            return;
        customElements.define(tagname, component);
    })(class extends HTMLElement {
        group;
        w = 1;
        h = 1;
        constructor() {
            super();
            this.group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            this.x = this.x;
            this.y = this.y;
            if (this.hasAttribute('background')) {
                this.background = this.background;
            }
            if (this.hasAttribute('src')) {
                this.src = this.src;
            }
        }
        update() {
            this.dispatchEvent(new Event('update'));
        }
        updateTransform() {
            this.group.setAttribute('transform', `translate(${this.x},${this.y})`);
        }
        clear() {
            for (const child of this.group.children) {
                this.group.removeChild(child);
            }
        }
        get src() {
            return this.getAttribute('src') || '';
        }
        set src(value) {
            if (!value) {
                this.removeAttribute('src');
            }
            else {
                this.setAttribute('src', value);
                this.import(value);
            }
        }
        importFromImageData(imageData, option) {
            this.w = imageData.width;
            this.h = imageData.height;
            const alpha = option?.mode === 'full' ? -1 : 0;
            const fills = {};
            const background = this.background;
            if (background) {
                fills[background] = new DirectedSegments();
            }
            for (let i = 0; i < imageData.data.length; i += 4) {
                if (imageData.data[i + 3] === alpha) {
                    continue;
                }
                const p = i >> 2;
                const x = p % imageData.width;
                const y = Math.floor(p / imageData.width);
                const key = ConvertColorCode(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2], imageData.data[i + 3]);
                if (!fills[key]) {
                    fills[key] = new DirectedSegments();
                }
                fills[key].addPixel(x, y);
                if (background && background !== key && imageData.data[i + 3] === 255) {
                    fills[background].addPixel(x, y);
                }
            }
            this.clear();
            for (const key in fills) {
                const directedSegment = fills[key];
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttributeNS(null, 'fill', key);
                path.setAttributeNS(null, 'd', directedSegment.toString());
                this.group.appendChild(path);
            }
            this.update();
        }
        import(img, option) {
            if (img instanceof ImageData) {
                return Promise.resolve(this.importFromImageData(img, option));
            }
            return ParseImage(img).then((canvas) => {
                const context = canvas.getContext('2d');
                if (!context) {
                    throw new Error('Failure to get context2D.');
                }
                return this.importFromImageData(context.getImageData(0, 0, canvas.width, canvas.height), option);
            });
        }
        get image() {
            return this.group;
        }
        get width() {
            return this.w;
        }
        get height() {
            return this.h;
        }
        get x() {
            return PositiveNumber(this.getAttribute('x'));
        }
        set x(value) {
            const x = value + '';
            this.updateTransform();
            if (x !== this.getAttribute('x')) {
                this.setAttribute('x', x);
            }
        }
        get y() {
            return PositiveNumber(this.getAttribute('y'));
        }
        set y(value) {
            const y = value + '';
            this.updateTransform();
            if (y !== this.getAttribute('y')) {
                this.setAttribute('y', y);
            }
        }
        get background() {
            return this.getAttribute('background') || '';
        }
        set background(value) {
            this.style.color = value;
            const [r, g, b] = this.style.color.replace(/^rgba{0,1}\((.+)\)$/, '$1').replace(/[\s]/g, '').split(',');
            if (typeof r !== 'string' || typeof g !== 'string' || typeof b !== 'string') {
                this.removeAttribute('background');
                return;
            }
            const color = `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}ff`;
            if (this.getAttribute('background') !== color) {
                this.setAttribute('background', color);
            }
        }
        static get observedAttributes() {
            return ['x', 'y', 'background'];
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal) {
                return;
            }
            switch (attrName) {
                case 'x':
                    this.x = newVal;
                    break;
                case 'y':
                    this.y = newVal;
                    break;
                case 'background':
                    this.background = newVal;
                    break;
            }
            this.update();
        }
    }, script.dataset.tagname);
});
