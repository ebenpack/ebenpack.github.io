import lidrisp from 'lidrisp';

const initLidrisp = () => {
    // This is all an ugly dirty quick hack right now
    const editor = ace.edit("input");
    const langTools = ace.require("ace/ext/language_tools");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/scheme");
    editor.setOptions({
        fontSize: "16px"
    });
    window.lidrisp = (function(){
        var lidrisp = {};
        var input = document.getElementById('input');
        var output = document.getElementById('output');
        var evaluate = document.getElementById('eval');
        lidrisp.read = function(err, succ) {
            function _read(){
                if (input.textContent) {
                    succ(editor.getValue())
                }
                else {err("Could not get input")}
                evaluate.removeEventListener('click', _read);
            }
            evaluate.addEventListener('click', _read)
        }
        lidrisp.print = function(out) {
            output.textContent = out;
        }
        return lidrisp;
    })();
    lidrisp();
}

export default initLidrisp;
