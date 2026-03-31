// npm modules
var fs = require('fs');
var _ = require('underscore');

var validateConfig = function (configFile) {
    var configData = JSON.parse(fs.readFileSync(configFile, { encoding: 'utf-8' }));
    var i18nData = JSON.parse(fs.readFileSync('i18n.json', { encoding: 'utf-8' }));
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

validateConfig('./numerals.counting.json')