var typingstatistics_typings = (function () {
    const txtBox = document.getElementById("input-field");

    const words = document.getElementsByClassName("highlight");

    for (var i = 0; i < words.length; i++) {
        const classArray = Array.from(words[i].classList);
        if (!classArray.includes("correct")) {
            typeWord(words[i]);

            typeSpace(" ");
        }
    }

    function typeWord(wordEl) {
        const word = wordEl.innerHTML;

        txtBox.value = word.replace(" ", "");
    }

    function typeSpace(key) {
        var event = new KeyboardEvent('keydown', {
            key: key,
            keyCode: key.charCodeAt(0),
            code: 'Key' + key.toUpperCase(),
            which: key.charCodeAt(0),
            charCode: 0
        });

        //txtBox.dispatchEvent(event);
    }
});

setInterval(typingstatistics_typings, 100);