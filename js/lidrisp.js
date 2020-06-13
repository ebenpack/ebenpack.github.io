import lidrisp from 'lidrisp';

const initLidrisp = () => {
    // This is all an ugly dirty quick hack right now
    var editor = ace.edit("input");
    var langTools = ace.require("ace/ext/language_tools");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/scheme");
    editor.setOptions({
        fontSize: "16px"
    });
    var input = document.getElementById('input');
    var output = document.getElementById('output');
    var eval_ = document.getElementById('eval');
    eval_.addEventListener('click', function(){
        var result = lidrisp.run(editor.getValue());
        output.textContent = result;
    });
}

export default initLidrisp;
