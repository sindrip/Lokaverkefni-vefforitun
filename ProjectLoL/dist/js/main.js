(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var openFile = function(event) {
        //sú skrá sem valinn var
        var input = event.target;
        //les fileinn
        var reader = new FileReader();
        //þegar búið er að loada fileinum
        reader.onload = function(){
          //setur á textaform
          var text = reader.result;
          //splittar upp í fylki við nýja línu
          var textArray = text.split('\n');
          //tekur useless info
          var reducedArray = textArray.filter(function (input) {
            return !(input.includes('WARN')||input.includes('ERROR')||
            input.includes('Expression: ALE')||input.includes('Data Error message'));}
          ).filter(function (input2) {
            if(input2.length > 2) {
              return input2;
            }
          });
          /*.map(function (s){
            return s.substring(0,11) + s.substring(49);}
          )*/
          //hvar texti fer a sidu
          var node = document.getElementById('output');
          //setur texta i divid
          for (var i = 0; i < reducedArray.length; i++) {
            //console.log(reducedArray[i]);
            //console.log('\n');
            console.log(reducedArray[i].indexOf("|"));
            var line = document.createElement('div');
            line.classList.add('textinn');
            line.innerText = reducedArray[i];
            node.appendChild(line);
          }


          //node.innerText = reducedArray;
          //console.log(reader.result.substring(0, 200));
        };

        reader.readAsText(input.files[0]);
      };

},{}]},{},[1])