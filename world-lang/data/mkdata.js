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
