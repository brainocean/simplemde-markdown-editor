var opts = {
    lines: 13 // The number of lines to draw
    , length: 28 // The length of each line
    , width: 14 // The line thickness
    , radius: 42 // The radius of the inner circle
    , scale: 1 // Scales overall size of the spinner
    , corners: 1 // Corner roundness (0..1)
    , color: '#000' // #rgb or #rrggbb or array of colors
    , opacity: 0.25 // Opacity of the lines
    , rotate: 0 // The rotation offset
    , direction: 1 // 1: clockwise, -1: counterclockwise
    , speed: 1 // Rounds per second
    , trail: 60 // Afterglow percentage
    , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
    , zIndex: 2e9 // The z-index (defaults to 2000000000)
    , className: 'spinner' // The CSS class to assign to the spinner
    , top: '50%' // Top position relative to parent
    , left: '50%' // Left position relative to parent
    , shadow: false // Whether to render a shadow
    , hwaccel: false // Whether to use hardware acceleration
    , position: 'absolute' // Element positioning
};

var spinner = new Spinner(opts);

function showSpin() {
    if(spinner) spinner.spin(document.getElementById("body"));
}
function hideSpin() {
    if(spinner) spinner.stop();
}

var PACKAGE_KEY_FIELDS = [
    'id',
    'packageId',
    'type',
    'leadingProduct',
    'leadingProductVersion',
    'country',
    'language',
    'name',
    'contentVersion',
    'status',
    'sdcId',
    'sourceId',
    'lobs',
    'industries',
    'scopeItems',
    'scopeItemGroups'
];

function renderEditor( elmId, template, data ) {
    var smartEditor = new SmartEditor({
        element: document.getElementById(elmId),
        spellChecker: false,
        bindingData: data
    });
    smartEditor.value(template);
    smartEditor.toggleSideBySide();
};

function onPackageDataReady(data) {
    hideSpin();
    $.get( "factsheet.md", function( template ) {
        renderEditor( "demo1", template, data);
    });
}

function loadPackageData(uuid) {
      //getPackageInfoById("6b4872d3b1d14661b87b3c3dbc0f07d5", assemblePackageData);
    showSpin();
    getPackageInfoById(uuid, function(data) {
        assemblePackageData(data);
    }, true);
}

function getPackageInfoById(uuid, callback, async) {
    getEntityById("packageversions", uuid, callback, async);
}
function getScopeItemInfoById(uuid, callback, async) {
    getEntityById("scopeitemversions", uuid, callback, async);
}
function getEntityById(entityPath, uuid, callback, async) {
    var ocdBaseUrl = "http://mo-934d50484.mo.sap.corp:8081/ocd/api/";
    $.ajax({
        type: "GET",
        url: ocdBaseUrl + entityPath + "/" + uuid,
        headers: {
            "Authorization": "Basic " + btoa("i067908" + ":" + "G00dt!m@")
        },
        async: async,
        success: function(entity) {
            callback(entity);
        }
    });
}

function assemblePackageData(packageObj) {
    delete packageObj.bomItemRefs;
    delete packageObj.scopeItemKeys;

    var profileKeys = _.difference( _.keys(packageObj), PACKAGE_KEY_FIELDS );
    packageObj.profile = {};
    _.each( profileKeys, function(profileKey) {
        packageObj.profile[profileKey] = packageObj[profileKey];
        delete packageObj[profileKey];
    });

    var sivData = [];
    var count = packageObj.scopeItems.length;
    _.each( packageObj.scopeItems, function(siUuid) {
        getScopeItemInfoById(siUuid, function(si) {
            sivData.push(si);
            count -= 1;
            if(count==0) {
                packageObj.scopeItems = sivData;
                onPackageDataReady(packageObj);
            }
        }, true);
    });
}

function anyhints(editor, options) {
    var wholelist = options.hintList
    var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
    var end = cur.ch, start = end;
    while (start && /[\w$]+/.test(curLine.charAt(start - 1))) --start;
    var curWord = start != end && curLine.slice(start, end);

    var list = _.filter(wholelist, function(item) { return item.displayText.includes(curWord); });
    if(list.length==0) list = wholelist;

    return {list: list, from: SimpleMDE.CodeMirror.Pos(cur.line, start), to: SimpleMDE.CodeMirror.Pos(cur.line, end)};
}


function registerHints(editor) {
    editor.codemirror.setOption("extraKeys", {
        "Alt-Space": "autocomplete"
    });

    SimpleMDE.CodeMirror.registerHelper(
        "hint",
        "html",
        anyhints
    );

    SimpleMDE.CodeMirror.registerHelper(
        "hint",
        "markdown",
        anyhints
    );

    editor.codemirror.on("inputRead", function (cm, change) {
        var cur = cm.getCursor(),
            curLine = cm.getLine(cur.line);

        var lastChar = curLine.charAt(cur.ch-2);

        if (change.text[0] == "{" && lastChar == "{") {
            cm.showHint({
                completeSingle: false,
                hintList: editor.hintList
            });
        }
    });
}

function getPropertyListDeeply(obj) {
    return _.transform(obj, function(result, value, key){
        if(_.isPlainObject(value)) {
            _.each(getPropertyListDeeply(obj[key]), function(subProp) {
                result.push( key + "." + subProp );
            });
        } else {
            result.push(key);
        }
    }, []);
}

function getHintListFromObject(obj) {
    return _.map(
        getPropertyListDeeply(obj),
        function(propKey) {
            return {
                text: propKey+"}}",
                displayText: propKey.toString()
            }
        });
}

function registerHanlderbarHelpers() {
    Handlebars.registerHelper("block", function(clazz, options) {
        var classAttr = "";
        if(clazz) classAttr = "class=\"" + clazz + "\"";
        return new Handlebars.SafeString(
            "<div " + classAttr + " markdown=\"1\">"
                + options.fn(this)
                + "</div>");
    });
}

function SmartEditor(options) {
    SimpleMDE.call(this, options);

    this.showdown = new showdown.Converter({
        parseImgDimensions: true,
        tables: true
    });
    registerHints(this);
    registerHanlderbarHelpers();
    var self = this;

    if(options.bindingData) {
        this.bindData(options.bindingData);
    }
    this.options.previewRender = function(plainText) {
        var inputText = plainText;
        try {
            inputText = Handlebars.compile(plainText, {noEscape:false})(self.bindingData);
        } catch(err) {
            inputText = plainText;
        }
        return self.showdown.makeHtml(inputText);
    }
}
SmartEditor.prototype = Object.create(SimpleMDE.prototype);
SmartEditor.prototype.constructor = SmartEditor;

SmartEditor.prototype.bindData = function(data) {

    this.hintList = getHintListFromObject(data);
    this.bindingData = data;
}
