function anyhints(editor, options) {
    var wholelist = options.hintList
    var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
    var end = cur.ch, start = end;
    while (start && /[\w$]+/.test(curLine.charAt(start - 1))) --start;
    var curWord = start != end && curLine.slice(start, end);

    var list = _.filter(wholelist, function(item) { return item.displayText.startsWith(curWord); });
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

function getHintListFromObject(obj) {
    return _.chain(obj)
        .keys()
        .map(function(propKey) {
            return {
                text: propKey+"}}",
                displayText: propKey
            }
        })
        .value();
}

function SmartEditor(options) {
    SimpleMDE.call(this, options);
    if(options.bindingData) {
        this.bindData(options.bindingData);
    }
    registerHints(this);
}
SmartEditor.prototype = Object.create(SimpleMDE.prototype);
SmartEditor.prototype.constructor = SmartEditor;

SmartEditor.prototype.bindData = function(data) {
    this.hintList = getHintListFromObject(data);
    var self = this;
    this.bindingData = data;
    this.options.previewRender = function(plainText) {
        try {
            return this.parent.markdown(Handlebars.compile(plainText, {noEscape:true})(self.bindingData));
        } catch(err) {
            return this.parent.markdown(plainText);
        }
    }
}
