const WebComponentBaseFactory = require('../WebComponentBaseFactory'),
    md = require('markdown-it')(),
    fs = require('fs'),
    path = require('path');

module.exports = class ReleaseNotesViewer extends WebComponentBaseFactory(HTMLElement) {

    connectedCallback() {
        /**
         * @type {ShadowRoot}
         */
        let shadow = this.attachShadow({ mode: 'open'});

        this.applyHTML(shadow, __dirname, 'releaseNotes.html');

        const releaseNotesContents = fs.readFileSync(path.resolve(__dirname, '../../../ReleaseNotes.md')).toString();

        const releaseNotes = shadow.querySelector('.release-notes');

        releaseNotes.innerHTML = md.render(releaseNotesContents);

        Array.from(releaseNotes.querySelectorAll('table')).forEach(x => x.classList.add('table'));
    }

    static register() {
        customElements.define('releasenotes-viewer', ReleaseNotesViewer);
    }
}
