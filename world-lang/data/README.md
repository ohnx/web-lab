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

```
