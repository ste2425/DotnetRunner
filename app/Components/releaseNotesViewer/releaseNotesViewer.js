const WebComponentBase = require('../WebComponentBase'),
    md = require('markdown-it')(),
    fs = require('fs'),
    path = require('path'),
    markdownItAttrs = require('markdown-it-attrs');
 
md.use(markdownItAttrs);
     
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

        this.applyStyle(shadow, __dirname, 'releaseNotes.css');

        const releaseNotesContents = fs.readFileSync(path.resolve(__dirname, '../../../ReleaseNotes.md')).toString();

        const releaseNotes = shadow.querySelector('.release-notes');

        releaseNotes.innerHTML = md.render(releaseNotesContents);
    }

    static register() {
        customElements.define('releasenotes-viewer', ReleaseNotesViewer);
    }
}
