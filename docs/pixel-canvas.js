((script, init) => {
    const imageTagName = script.dataset.image || 'pixel-image';
    customElements.whenDefined(imageTagName).then(() => {
        const pixelImage = customElements.get(imageTagName);
        init(script, pixelImage);
    });
})(document.currentScript, (script, pixelImage) => {
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
    ((component, tagname = 'pixel-canvas') => {
        if (customElements.get(tagname))
            return;
        customElements.define(tagname, component);
    })(class extends HTMLElement {
        svg;
        constructor() {
            super();
            const style = document.createElement('style');
            style.innerHTML = [
                ':host { display: block; }',
                'svg { display: block; width: 100%; height: auto; }',
            ].join('');
            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            const shadow = this.attachShadow({ mode: 'open' });
            shadow.appendChild(style);
            shadow.appendChild(this.svg);
            if (!this.width) {
                this.width = 600;
            }
            if (!this.height) {
                this.height = 400;
            }
            this.addEventListener('update', (event) => {
                event.stopPropagation();
                this.update();
            });
            this.update();
        }
        update() {
            const width = this.width;
            const height = this.height;
            this.svg.setAttributeNS(null, 'width', `${width}px`);
            this.svg.setAttributeNS(null, 'height', `${height}px`);
            this.svg.setAttributeNS(null, 'viewBox', `0 0 ${width} ${height}`);
            this.clear();
            this.updateSvg(this.svg, this.children);
        }
        updateSvg(parent, children) {
            for (const child of children) {
                if (child instanceof SVGGElement) {
                    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    this.updateSvg(group, child.children);
                    parent.appendChild(group);
                }
                else if (child instanceof pixelImage) {
                    parent.appendChild(child.image);
                }
            }
        }
        clear() {
            for (const child of this.svg.children) {
                this.svg.removeChild(child);
            }
        }
        get width() {
            return PositiveNumber(this.getAttribute('width'));
        }
        set width(value) {
            this.setAttribute('width', PositiveNumber(value) + '');
            this.update();
        }
        get height() {
            return PositiveNumber(this.getAttribute('height'));
        }
        set height(value) {
            this.setAttribute('height', PositiveNumber(value) + '');
            this.update();
        }
        static get observedAttributes() {
            return ['width', 'height'];
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal) {
                return;
            }
            switch (attrName) {
                case 'width':
                    this.width = newVal;
                    break;
                case 'height':
                    this.height = newVal;
                    break;
            }
        }
    }, script.dataset.tagname);
});
