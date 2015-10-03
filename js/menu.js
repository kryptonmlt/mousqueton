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

var AVAILABLE_TEAMS = {
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


var game = new Phaser.Game(200, 30, Phaser.AUTO, 'menu', { preload: preload, create: create, update: update });

function preload() {
    console.log("preload");
    //game.load.image('sea', 'assets/water0.png');
}

function create() {
    console.log("create");
    generateSea();
    startGame();
}

function update() {
    //console.log("update");
}