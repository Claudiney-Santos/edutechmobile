class ErrorBox {
    constructor(container) {
        container.classList.add('errorBox');

        const title = document.createElement('h3');
        const message = document.createElement('span');
        const closeBtn = document.createElement('button');

        closeBtn.innerText = '\u00d7';
        closeBtn.onclick = () => { this.hide(); };
        closeBtn.classList.add('closeButton');

        title.classList.add('errorTitle');
        message.classList.add('errorMessage');

        this.container = container;
        this._title = title;
        this._message = message;

        this.container.appendChild(closeBtn);
        this.container.appendChild(this._title);
        this.container.appendChild(this._message);
    };

    trigger(title, message) {
        this._title.innerText = title;
        this._message.innerText = message;
        this.container.style.display = 'inline-block';
    };

    hide() {
        this.container.style.display = 'none';
    };
};
