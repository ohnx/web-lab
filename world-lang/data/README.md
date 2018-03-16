## how to generate language_codes.js:

pull latest version of `languages.json` from https://github.com/OpenBookPrices/country-data/tree/master/data

```js
var data = require('./languages.json');
var lc = {};

for (var i = 0; i < data.length; i++) {
    lc[data[i].alpha3] = data[i];
}

fs.writeFile("language_codes.js", "var language_codes = " + JSON.stringify(lc) + ";", function(){});
```

## how to generate country_languages.js:

pull latest version of `countries.json` from https://github.com/OpenBookPrices/country-data/tree/master/data

You also need to `npm install countryjs`

```js
var population_data = require('countryjs').population;
var data = require('./countries.json');
var data2 = require('./country-by-population.json')
var cl = {};

for (var i = 0; i < data.length; i++) {
    if (data[i].alpha3.length > 0) {
        cl[data[i].alpha3] = {languages: data[i].languages, emoji: data[i].emoji, population: population_data(data[i].alpha3, 'ISO3')};
        if (cl[data[i].alpha3].population == undefined) {
            console.log('countryjs has a bad value for country ' + data[i].alpha3);
            console.log('trying nice name...');
            cl[data[i].alpha3].population = population_data(data[i].name, 'name');
            if (cl[data[i].alpha3].population == undefined) {
                console.log('... nope. no such luck with ' + data[i].name + ' either. will need manual fixing.');
            }
        }
    } else {
        cl[data[i].alpha2] = {languages: data[i].languages, emoji: data[i].emoji, population: population_data(data[i].alpha2, 'ISO2')};
        if (cl[data[i].alpha2].population == undefined) {
            console.log('countryjs has a bad value for country ' + data[i].alpha2);
            console.log('trying nice name...');
            cl[data[i].alpha2].population = population_data(data[i].name, 'name');
            if (cl[data[i].alpha2].population == undefined) {
                console.log('... nope. no such luck with ' + data[i].name + ' either. will need manual fixing.');
            }
        }
    }
}

fs.writeFile("country_languages.js", "var country_languages = " + JSON.stringify(cl) + ";", function(){});
fs.writeFile("country_languages.json", JSON.stringify(cl), function(){});

```

## how to generate data from CIA world factbook (country_info.js)

this is really annoying.

1. need to copy-paste everything on this page into a text document: https://www.cia.gov/library/publications/the-world-factbook/fields/2098.html
2. Delete all the notes and stuff (HUGE pain... recommend you use regex)
3. Delete everything in brackets
4. Remove "West Bank" entry since Gaza strip is already there and there's not any difference in languages spoken
5. "Sint Maarten" is duplicated under two different names? (is there a difference? data is different, but google says ISO codes are the same). Remove one named "Saint Martin".
6. "Philippines" make it only have Filipino and English
4. Save as "languages.txt"

now open nodejs repl.

```js
var data = fs.readFileSync('languages.txt', 'utf8').replace('\r', '');
var emojistuff = require('./country_languages.json');
var c = require('countryjs');
var data_formatted = data.split('\n');
var data_bycc = {};
var data_final = {};
var i = 0;

var unknown_stuff = {};
var fcf = function(country, cc) {
    if (country in unknown_stuff) {
        if (cc.length != 3) { console.log('Please give 3-letter ISO code'); return; }
        if (cc in data_bycc) {
            console.log('Oops, there is already data in this country code...');
        } else {
            data_bycc[cc] = unknown_stuff[country];
            delete unknown_stuff[country];
        }
    } else {
        console.log('Please check spelling of that country');
    }
}
for (i = 0; i < data_formatted.length; i++) {
    var info_parts = data_formatted[i].split('\t');
    var cc = c.ISOcodes(info_parts[0], 'name');
    if (!cc || cc.alpha3.length != 3) {
        console.log('[e]' + info_parts[0] + ': ' + info_parts[1]);
        unknown_stuff[info_parts[0]] = info_parts[1];
    } else {
        data_bycc[cc.alpha3] = info_parts[1];
    }
}

/* fill out any [e]'s... google is your friend... */
fcf('Andorra', 'AND')
fcf('Bahamas, The', 'BHS')
fcf('British Virgin Islands', 'VGB')
fcf('Burma', 'MMR')
fcf('Congo, Democratic Republic of the', 'COD')
fcf('Congo, Republic of the', 'COG')
fcf('Curacao', 'CUW')
fcf('Czechia', 'CZE')
fcf('Falkland Islands (Islas Malvinas)', 'FLK')
fcf('Gambia, The', 'GMB')
fcf('Gaza Strip', 'PSE')
fcf('Holy See (Vatican City)', 'VAT')
fcf('Korea, North', 'PRK')
fcf('Korea, South', 'KOR')
// Kosovo is not having a ISO-3 code
fcf('Micronesia, Federated States of', 'FSM')
fcf('Montenegro', 'MNE')
fcf('Saint Helena, Ascension, and Tristan da Cunha', 'SHN')
fcf('Serbia', 'SRB')
fcf('Sint Maarten', 'SXM')
fcf('Svalbard', 'SJM')
fcf('Turks and Caicos Islands', 'TCA')
fcf('Virgin Islands', 'VIR')

/* still don't know this stuff... doesn't really matter i guess */
unknown_stuff;

/* loop through each code now */
for (var cc in data_bycc) {
    if (!data_bycc.hasOwnProperty(cc)) continue;
    var languages = data_bycc[cc].split(',');
    data_final[cc] = {population: 0, emoji: '', languages: []};

    if (cc in emojistuff) {
        data_final[cc].population = emojistuff[cc].population ? emojistuff[cc].population : 0;
        data_final[cc].emoji = emojistuff[cc].emoji;
    } else {
        console.log('[w] no population nor emoji for country ' + cc);
    }

    for (var i = 0; i < languages.length; i++) {
        languages[i] = languages[i].trim().replace('%', '');
        var lang_name = languages[i].substring(0, languages[i].lastIndexOf(' '));
        var percentage_spoken = languages[i].substring(languages[i].lastIndexOf(' ') + 1, languages[i].length);
        if (isNaN(percentage_spoken)) {
            if (percentage_spoken.length != 0) {
                lang_name += ' ' + percentage_spoken;
            }
            percentage_spoken = 0;
        } else {
            percentage_spoken = +percentage_spoken;
            if (percentage_spoken < 3) percentage_spoken = -1;
        }
        if (percentage_spoken >= 0) {
            if (lang_name.indexOf('other') == 0 || lang_name.indexOf('many') == 0 ||
                lang_name.indexOf('sign language') >= 0 || lang_name.indexOf('various') == 0 ||
                lang_name.indexOf('unspecified') == 0 || lang_name.indexOf('indigenous') >= 0 ||
                lang_name.indexOf('tribal') == 0 || lang_name.indexOf('dialect') >= 0) {
                
            } else {
                data_final[cc].languages.push({language: lang_name.replace('languages', '').trim(), percentage_spoken: percentage_spoken});
            }
        }
    }
}

fs.writeFile("country_info.js", "var country_info = " + JSON.stringify(data_final) + ";", function(){});
fs.writeFile("country_info.json", JSON.stringify(data_final, null, 2), function(){});

```


