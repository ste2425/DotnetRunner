const WebComponentBase = require('../WebComponentBase'),
    md = require('markdown-it')(),
    fs = require('fs'),
    path = require('path'),
    markdownItAttrs = require('markdown-it-attrs'),
    { shell } = require('electron').remote,
    { addDeletegateEventListener } = require('../../utils/eventUtils');
 
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

        const cotnainer = document.createElement('div');

        cotnainer.innerHTML = md.render(releaseNotesContents);

        releaseNotes.appendChild(cotnainer);

        addDeletegateEventListener(shadow, 'a.open-external', 'click', (e) => {
            e.preventDefault();
            shell.openExternal(e.target.getAttribute('href'));
        });        
    }

    static register() {
        customElements.define('releasenotes-viewer', ReleaseNotesViewer);
    }
}
