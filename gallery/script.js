function getSize() {
    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    return {x, y};
}

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

// check if an element exists in array using a comparer function
// comparer : function(currentElement)
Array.prototype.inArray = function(comparer) { 
    for(var i=0; i < this.length; i++) { 
        if(comparer(this[i])) return true; 
    }
    return false; 
}; 

// adds an element to the array if it does not already exist using a comparer 
// function
Array.prototype.pushIfNotExist = function(element, comparer) { 
    if (!this.inArray(comparer)) {
        this.push(element);
    }
};

var images;
var currRow = -1, currImage = -1, currDetailBox, currFilter = null;

(function() {
    var winSize = getSize().x;
    var imagesPerRow = Math.floor(winSize/310);
    document.getElementById("gallery").style.width = imagesPerRow*310 + "px";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            images = JSON.parse(xhttp.responseText);
            filterImages();
        }
    };
    xhttp.open("GET", "images.json", true);
    xhttp.send();
})();

function filterImages(filter) {
    var ignore;
    var currFilter
    if (filter == null) {
        ignore = true;
    } else {
        ignore = false;
        currFilter = filter;
    }
    var allTags = [];
    var newHTML = "";
    for (var i = 0; i < images.length; i++) {
        for (var j = 0; j < images[i].tags.length; j++) {
            allTags.pushIfNotExist(images[i].tags[j], function(e) { 
                return e == images[i].tags[j]; 
            });
        }
        if (ignore == true) {
            
        } else if (!isInArray(filter, images[i].tags)) {
            continue;
        }
        newHTML += "<div class=\"picbox\" onclick=\"getDesc("+i+")\" id=\"img-"+i+"\">";
        newHTML += "<div class=\"pic\" style=\"background: url('"+images[i].thumb+"') 50% 50% no-repeat; \"></div></div>";
    }
    document.getElementById("gallery").innerHTML = newHTML;
    
    newHTML = "";
    for (var i = 0; i < allTags.length; i++) {
        if (currFilter == allTags[i]) newHTML += "<b onclick=\"filterImages('"+allTags[i]+"');\">" + allTags[i] + "</b>&nbsp;";
        else newHTML += "<span onclick=\"filterImages('"+allTags[i]+"');\">" + allTags[i] + "</span>&nbsp;";
    }
    document.getElementById("tags").innerHTML = newHTML;
}

function animOut() {
    currDetailBox.classList.toggle("expandedBox");
}

function getDesc(id, extra) {
    var winSize = getSize().x;
    var imagesPerRow = Math.floor(winSize/310);
    var imageRow = Math.ceil(id/imagesPerRow);
    var element = document.getElementById("gallery");
    if (imageRow == Math.floor(id/imagesPerRow)) {
        // perfectly divisible
        imageRow++;
    }
    if (currDetailBox == undefined) {
        
    } else if (currImage == id) {
        animOut();
        setTimeout(function() {
            element.removeChild(currDetailBox);
            currImage = -1;
            currDetailBox = undefined;
            currRow = -1;
        }, 600);
        return;
    } else {
        animOut();
        setTimeout(function() {
            element.removeChild(currDetailBox);
            var descElem = document.createElement("div");
            descElem.className = "detailbox";
            var newHTML = "";
            newHTML += "<a href=\""+images[id].img+"\"><img src=\""+images[id].img+"\" class=\"detail-img\"/></a><div class=\"detail-words\"><h1 class=\"detail-name\">"+images[id].name+"</h1><div class=\"detail-desc\">"+images[id].desc+"</div></div>";
            descElem.innerHTML = newHTML;
            var child = document.getElementById("img-"+(imagesPerRow * imageRow));
            element.insertBefore(descElem,child);
            setTimeout(function() {descElem.classList.toggle("expandedBox");}, 10);
            currImage = id;
            currRow = imageRow;
            currDetailBox = descElem;
        }, 600);
        return;
    }
    var descElem = document.createElement("div");
    descElem.className = "detailbox";
    var newHTML = "";
    newHTML += "<a href=\""+images[id].img+"\"><img src=\""+images[id].img+"\" class=\"detail-img\"/></a><div class=\"detail-words\"><h1 class=\"detail-name\">"+images[id].name+"</h1><div class=\"detail-desc\">"+images[id].desc+"</div></div>";
    descElem.innerHTML = newHTML;
    var child = document.getElementById("img-"+(imagesPerRow * imageRow));
    element.insertBefore(descElem,child);
    setTimeout(function() {descElem.classList.toggle("expandedBox");}, 10);
    currImage = id;
    currRow = imageRow;
    currDetailBox = descElem;
}