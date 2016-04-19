var realImg = ["http://intranet.ashbury.ca/actv/photo/2016/4/8/A703BD66-0BB2-6D05-828E-7C398E27E0F4_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/8/A7022B28-CBE8-1955-AEEE-8A19B604994E_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/8/A7011F18-A787-5FCF-2378-E8A96E6EEE00_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/8/A6FFCFAD-BAB1-1986-618F-72D8FF364987_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/8/A6FE84AB-A6FE-752F-FD7B-2A04DC0D5471_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/8/A6FCE789-FAA6-25C4-EBA7-F0676C5B8D74_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/8/A6FB53FD-E500-BB5F-49DF-E116AF61E5CE_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/7/82C168DC-B245-1307-2727-46A66A95DDF0_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/7/82BD7F0D-AEF9-2F4E-A431-012F6468023B_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/7/82B958C9-E094-6222-58A4-DB26A31937FB_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/7/82B5C51A-9043-4503-AA68-E902D3C643B0_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/7/82AE480E-9EEE-9F31-A0C0-CA327FB2D5C9_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/7/82A9C19D-00E4-4865-9AF6-BC8CD84E3C8D_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/7/78BAEAE5-92BB-3018-2699-B9E1EC9E6241_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/7/78543D38-FD27-AFCB-D8AB-17FF94479725_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/7/7852FB22-FC7C-2DF9-725D-B3AD1FDF9762_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/7/7851B65F-E125-D0EC-EA65-0D33713A441A_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/7/784FBC5D-FFA9-7C64-0A00-16CA298AAA28_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/7/784DDFDB-9A70-51C6-1AEA-C1C11B210C5F_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/7/784BF59D-E0FC-AFE6-A37B-FC846749F452_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/7/784A18DD-9EE5-7FAA-2656-90E80F19DED5_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/7/7848D168-EECB-589F-E08E-61D9F4811162_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/6/4BDB8068-CDBF-94F4-C1FF-45F2D976311C_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/6/4BCF1998-9A0C-1230-37AA-4BF5077F344C_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/6/4BCBA976-CD53-E02A-0BEF-F08273CB077A_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/6/4BC8A109-BF34-A9AF-F82D-2D29CDA40D91_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/6/4BC5EB77-9098-E4FA-99E3-C882E5A081D6_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/6/4BBFBD4D-BDFF-975B-DFCC-161F6722429E_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/6/40752B83-0324-1826-A178-DA5B8FC2D5C4_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/6/407316C0-F5DD-E256-B26D-3F079550C0E4_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/6/407173CC-C818-9CE4-39A7-C19C2B7DBD09_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/6/40706DE0-AFD2-8F64-F647-438FAD46B7FC_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/6/406F42DE-BC9A-90F0-EB09-F7FFB602F7A1_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/6/406DCC51-EAA4-C21F-5BE1-241217226360_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/6/406C6DB0-BF17-FDBB-0249-B3FE79B20AE3_1920.jpg","http://intranet.ashbury.ca/actv/photo/2016/4/5/1432BE75-0E5F-9A75-D854-CDDA12C4E2B5_1920.jpg"];
var images;
var currId = "imgOne";
var currIndex = -1;

(function() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            var galleryData = JSON.parse(xhttp.responseText);
            images = galleryData.images;
            //images = realImg;
            document.title = galleryData.name;
            nextPic();
            //preloadImg();
            setInterval(function(){fadeOut(document.body);}, galleryData.time*1000);
        }
    };
    xhttp.open("GET", "../images.json", true);
    xhttp.send();
})();
/*
function preloadImg(index) {
    index = index || 0;
    if (images.length > index) {
        var img = new Image();
        img.onload = function() {
            preloadImg(index + 1);
        }
        img.src = realImg[index];
    }
}*/

function fadeIn(element) {
    var op = 0.0;  // initial opacity
    element.style.display = 'block';
    var timer = setInterval(function () {
        if (op >= 1.0){
            clearInterval(timer);
            op = 1.0
        }
        element.style.opacity = op;
        op += 0.06;
    }, 50);
}

function fadeOut(element) {
    nextBack();
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.0){
            clearInterval(timer);
            element.style.display = 'none';
            nextPic();
            fadeIn(element);
        }
        element.style.opacity = op;
        op -= 0.06;
    }, 50);
}

function nextBack() {
    var temp = currIndex;
    temp++;
    if (temp >= images.length) {
        temp = 0;
    }
    document.getElementById("main").style.backgroundImage = "url(\""+images[temp].img+"\")";
}

function nextPic() {
    currIndex++;
    if (currIndex >= images.length) {
        currIndex = 0;
    }
    document.body.style.backgroundImage = "url(\""+images[currIndex].img+"\")";
}