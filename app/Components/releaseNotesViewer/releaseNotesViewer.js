const WebComponentBase = require('../WebComponentBase'),
    md = require('markdown-it')(),
    fs = require('fs'),
    path = require('path');

/**
 * Parses and display the Release Notes MD file.
 */
module.exports = class ReleaseNotesViewer extends WebComponentBase {
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
