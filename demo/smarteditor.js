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
            console.log(clazz);
        return new Handlebars.SafeString(
            "<div class=\"" + clazz + "\" markdown=\"1\">"
                + options.fn(this)
                + "</div>");
    });
}

function SmartEditor(options) {
    SimpleMDE.call(this, options);

    this.showdown = new showdown.Converter({
        parseImgDimensions: true
    });
    console.log(this.showdown);
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
