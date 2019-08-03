
document.getElementById("code").addEventListener("keyup", change);
document.getElementById("select_example").addEventListener("change", function(){
    var option = document.getElementById("select_example").value;
    setCode(option);
});

setCode("1");
document.querySelectorAll(".example").forEach(function(item) {
    document.getElementById("select_example").innerHTML += '<option value="'+item.dataset.value+'">'+item.dataset.title+'</option>';
});

function change () {
    try {
    eval(document.getElementById("code").value);
    document.getElementById("result").innerHTML = syntaxHighlight(JSON.stringify(output,null, 2));
    } catch (error) {
    document.getElementById("result").innerHTML = error.message;
    }
}

function setCode (option) {
    var exampleSrc = document.querySelector('[data-value="'+option+'"]').innerHTML
    var parts = exampleSrc.split("----");

    var codeSrc = "";
    var infoSrc = "";

    if (parts.length > 1) {
    codeSrc = parts[1];
    infoSrc = parts[0];
    } else {
    codeSrc = parts[0];
    }

    codeSrc = removeIndentation(codeSrc);
    document.getElementById("code").innerHTML = codeSrc;
    
    if (infoSrc.length>0) {
    infoSrc = removeIndentation(infoSrc);
    infoSrc = "<div>"+infoSrc+"</div>";
    }

    document.getElementById("info").innerHTML = infoSrc;
    change();

    document.getElementById("code").style.minHeight = "auto";

    document.getElementById("code").setAttribute(
    "rows", 
    Math.max(infoSrc.split("\n").length, codeSrc.split("\n").length));

    setTimeout(function(){
    document.getElementById("code").style.minHeight = 
        Math.max(
        document.getElementById("code").clientHeight, 
        document.getElementById("result").clientHeight,
        500)
        + "px";
    }, 50);
}

function removeIndentation (text) {
    if (text.length>0) {
    var matches = /^\n(\s)*/.exec(text);
    var indentation = matches[0].substr(1).length;
    var lines = text.split("\n");
    lines = lines.map(function(line){
        return line.substr(indentation);
    })
    lines.pop();
    lines.shift();
    return lines.join("\n");
    } else {
    return text;
    }
}

function syntaxHighlight(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    var cls = 'number';
    if (/^"/.test(match)) {
        if (/:$/.test(match)) {
            cls = 'key';
        } else {
            cls = 'string';
        }
    } else if (/true|false/.test(match)) {
        cls = 'boolean';
    } else if (/null/.test(match)) {
        cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
    });
}