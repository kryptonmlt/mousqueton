
console.log("customising")
var prefixes = ["Hull", "Weapon", "Special", "Team"]

sessionStorage.clear();

for (var i = 0; i < prefixes.length; i++) {
    for (var j = 0; j < 4; j++) {
        var radioID = "p" + i + prefixes[i];
        var radioVal = -1;

        console.log (j + prefixes[i] + " " + radioID + " " );
        sessionStorage.setItem(prefixes[i] + j, radioVal);
    }
}



