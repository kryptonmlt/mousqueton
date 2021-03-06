var shipCount = 2;
var assignedTeams = [];
var possibleShips = [2, 3, 4];

function showShips()
{
    console.log("Using " + shipCount + " Ships");
}

var TEAMS = {
    TEAM_A : 0,
    TEAM_B : 1,
    TEAM_C : 2,
    TEAM_D : 3
}

AVAILABLE_TEAMS = {
    UNASSIGNED: ["No team assigned"],
    TWO_1v1:    [TEAMS.TEAM_A, TEAMS.TEAM_B],
    THREE_2v1:  [TEAMS.TEAM_A, TEAMS.TEAM_B, TEAMS.TEAM_C],
    THREE_ffa:  [TEAMS.TEAM_A, TEAMS.TEAM_C, TEAMS.TEAM_C],
    FOUR_3v1:   [TEAMS.TEAM_A, TEAMS.TEAM_A, TEAMS.TEAM_A, TEAMS.TEAM_B],
    FOUR_2v2:   [TEAMS.TEAM_A, TEAMS.TEAM_A, TEAMS.TEAM_B, TEAMS.TEAM_B],
    FOUR_ffa:   [TEAMS.TEAM_A, TEAMS.TEAM_B, TEAMS.TEAM_C, TEAMS.TEAM_D],
}

function pickFromAvailableTeams()
{
    
    if (shipCount === 2) {
       assignedTeams = AVAILABLE_TEAMS.TWO_1v1;
    } else if (shipCount === 3) {
       assignedTeams = AVAILABLE_TEAMS.THREE_2v1;
    } else if (shipCount === 4) {
       assignedTeams = AVAILABLE_TEAMS.FOUR_3v1;
    } else {
       assignedTeams = AVAILABLE_TEAMS.UNASSIGNED;
    }
    
    showShips();
    console.log("Teams: " + assignedTeams);
}

function setupGame(teamArrangement) {

    storedKeys = ["Hull", "Weapon", "Projectile"] // 0 1 2 3
    inputNames = ["Ship", "Weapon", "Ammo"] // 1 2 3 4
    
    sessionStorage.clear();

    for (var i = 0; i < teamArrangement.length; i++) {
        
        sessionStorage.setItem("Team" + i, teamArrangement[i]);
        
        for (var j = 0; j < inputNames.length; j++) {
            var radioID = "p" + (i+1) + inputNames[j];
            var radioVal = null;
            var radios = document.getElementsByName(radioID);
            
            console.log(radioID + " (checking " + radios.length + ")")
            for (var k = 0, length = radios.length; k < length; k++) {  
                
                if (radios[k].checked) {
                    // do whatever you want with the checked radio
                    radioVal = radios[k].value
                    sessionStorage.setItem(storedKeys[j] + i, radioVal);

                    console.log(radioID + "|" + storedKeys[j] + i + " is k" + k  + "  " + radioVal + ", breaking.")
                    // only one radio can be logically checked, don't check the rest
                    break;
                } else {
                }
            }

        }
    }
    
    window.location.assign("game.html");
}
