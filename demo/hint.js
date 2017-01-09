var mysuggests = [
    {
        mode: 'markdown',
        startChar: '@',
        listCallback: function() {
            return [
                {
                    text: 'cebe ',
                    displayText: 'cebe'
                },
                {
                    text: 'jacmoe ',
                    displayText: 'jacmoe'
                },
                {
                    text: 'samdark ',
                    displayText: 'samdark'
                }
            ];
        }
    },
    {
        mode: 'markdown',
        startChar: '#',
        listCallback: function() {
            return [
                {
                    text: '#hash ',
                    displayText: 'hash'
                }
            ];
        }
    }
];

function autoSuggest(editor, suggestions) {
    editor.codemirror.on("inputRead", function(cm, change){
        var mode = cm.getModeAt(cm.getCursor());
        for (var i = 0, len = suggestions.length; i < len; i++) {
        if (mode.name === suggestions[i].mode &&
            change.text[0] === suggestions[i].startChar) {
            cm.showHint({
                completeSingle: false,
                hint: function (cm, options) {
                    var cur = cm.getCursor(),
                        token = cm.getTokenAt(cur);
                    var start = token.start + 1,
                        end = token.end;
                    return {
                        list: suggestions[i].listCallback(),
                        from: SimpleMDE.Pos(cur.line, start),
                        to: SimpleMDE.Pos(cur.line, end)
                    };
                }
            });
        }
        }
    });
}
