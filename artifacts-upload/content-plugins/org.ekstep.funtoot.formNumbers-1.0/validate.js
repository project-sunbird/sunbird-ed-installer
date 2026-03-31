// npm modules
var fs = require('fs');
var _ = require('underscore');

var validateConfig = function (configFile) {
    var configData = JSON.parse(fs.readFileSync(configFile, { encoding: 'utf-8' }));
    var i18nData = JSON.parse(fs.readFileSync('./editor/i18n.json', { encoding: 'utf-8' }));
    _.each(configData, function (c, i) {
        // Check if the HintID is in i18n.json
        _.each(i18nData, function (o, k) {
            if (!o[c.HintID])
                console.error('Config entry at index ' + i + ' has HintID ' + c.HintID + ' that is not found in ' + k + ' of i18n.json');
            if (!o[c.QuestionText])
                console.error('Config entry at index ' + i + ' has QuestionText ' + c.QuestionText + ' that is not found in ' + k + ' of i18n.json');
        });
    });
}

var validateManifest = function (manifestFile) {
    var manifest = JSON.parse(fs.readFileSync(manifestFile, { encoding: 'utf-8' }));
    if (/[A-Z]/.test(manifest.editor.main))
        console.error('File name ' + manifest.editor.main + ' has capital letters..');
    if (/[A-Z]/.test(manifest.editor.wizard.controller))
        console.error('File name ' + manifest.editor.wizard.controller + ' has capital letters..');
    if (/[A-Z]/.test(manifest.editor.wizard.template))
        console.error('File name ' + manifest.editor.wizard.template + ' has capital letters..');
    _.each(manifest.editor.dependencies, function (v, i) {
        if (/[A-Z]/.test(v.src))
            console.error('File name ' + v.src + ' has capital letters..');
    });
    if (/[A-Z]/.test(manifest.renderer.main))
        console.error('File name ' + manifest.editor.main + ' has capital letters..');
    _.each(manifest.renderer.dependencies, function (v, i) {
        if (/[A-Z]/.test(v.src))
            console.error('File name ' + v.src + ' has capital letters..');
    });
}

validateConfig('./editor/form.numbers.json')
validateManifest('./manifest.json');