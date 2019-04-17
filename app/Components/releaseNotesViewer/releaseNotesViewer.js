const md = require('markdown-it')(),
    fs = require('fs'),
    path = require('path');

module.exports = class ReleaseNotesViewer extends HTMLElement {

    connectedCallback() {
        /**
         * @type {ShadowRoot}
         */
        let shadow = this.attachShadow({ mode: 'open'});
        
        const releaseNotesContents = fs.readFileSync(path.resolve(__dirname, '../../../ReleaseNotes.md')).toString();

        shadow.innerHTML = md.render(releaseNotesContents);
    }

    static register() {
        customElements.define('releasenotes-viewer', ReleaseNotesViewer);
    }
}
