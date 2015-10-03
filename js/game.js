var ships = [];
var rocksInfo = [];

var gameScale = 0.75

$(window).resize(function() { window.resizeGame(); } );
var game = new Phaser.Game($(window).width() * gameScale, $(window).height() * gameScale, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function populateShipsRandomly(){
    ships[0] = new Ship(0, shipType.SMALL, new Weapon(weaponType.SNIPER, new Projectile(projectileType.PERPENDICULAR, 40, 200), 5), specialPower.ACCEL, true, 0, 1000, 50);
    ships[1] = new Ship(1, shipType.MEDIUM, new Weapon(weaponType.BARRAGE, new Projectile(projectileType.PERPENDICULAR, 40, 200), 5), specialPower.DAMAGE, false, 0, 1000, 50);
    ships[2] = new Ship(2, shipType.BIG, new Weapon(weaponType.BRIGADE, new Projectile(projectileType.PERPENDICULAR, 40, 200), 5), specialPower.ACCEL, false, 1, 1000, 50);
    ships[3] = new Ship(3, shipType.MEDIUM, new Weapon(weaponType.BARRAGE, new Projectile(projectileType.PERPENDICULAR, 40, 200), 5), specialPower.STEALTH, false, 1, 1000, 50);
}

function generateRocks(){
    var rocksTotal = randomBetween(1,4);
    for(i=0; i < rocksTotal; i++){
        switch(randomBetween(0,2)){
            case 0: rocksInfo[i] = "rock0"; break;
            case 1: rocksInfo[i] = "rock1"; break;
            case 2: rocksInfo[i] = "rock2"; break;
        }
    }
}

function resizeGame() {
    var height = $(window).height() * gameScale;
    var width = $(window).width() * gameScale;
    console.log("Setting screen size to: ("+width+","+height+")");
        
    game.width = width;
    game.height = height;
    game.stage.bounds.width = width;
    game.stage.bounds.height = height;
        
    if (game.renderType === Phaser.WEBGL){
        game.renderer.resize(width, height);
    }
}

function preload() {

    game.load.image('sea', 'assets/water0.png');
    game.load.image('ship0', 'assets/ship0.png');
    game.load.image('ship1', 'assets/ship1.png');
    game.load.image('ship2', 'assets/ship2.png');
    game.load.image('shot', 'assets/shot.png');
    game.load.image('rock0', 'assets/rock0.png');
    game.load.image('rock1', 'assets/rock1.png');
    game.load.image('rock2', 'assets/rock2.png');

    populateShipsRandomly();
    generateRocks();
    console.log("Generated "+rocksInfo.length+" rocks");
}

var teams = [];
var player1;
var player2;
var currentSpeed = 0;
var cursors;
var SMALL_SHIP_SCALE = 0.05;
var ROCKS_SCALE = 0.2;

var shots;
var shot;
var shotTimeLeft = 0;
var shotTimeRight = 0;
var shotAngle = 0;
var rocks;

function create() {

    // Game Physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // SEA Generation
    var sea = game.add.sprite(0, 0, 'sea');
	var seaScaleX = (game.camera.width - sea.width)/sea.width;
	var seaScaleY = (game.camera.height - sea.height)/sea.height;
	sea.scale.setTo(1+seaScaleX, 1+seaScaleY);

    // SHIP Generation
    var humanPlayers=0;
    var shipXInc = game.world.width/7;
    var shipYInc = game.world.height/7;
    for(i=0; i < ships.length; i++){
        teams[ships[i].teamId] = game.add.group();
        teams[ships[i].teamId].enableBody=true;
        var shipX=0;
        var shipY=0;
        if(i < 2){            
            shipX = shipXInc;
            shipY = game.world.height*i- shipYInc;
        }else{
            shipX = game.world.width - shipXInc;
            shipY = game.world.height*(i%2);            
        }
        console.log("Ship cords:" +shipX+", "+shipY);
        tempShip = teams[ships[i].teamId].create( shipX, shipY, getShipFromType(ships[i].shipType));
        tempShip.body.collideWorldBounds = true;
        tempShip.anchor.setTo(0.5, 0.5);
        tempShip.body.drag.set(10);
        tempShip.body.angularDrag = 40;
        tempShip.body.maxAngular = 30;
        tempShip.body.maxVelocity = 30;
        if(ships[i].human){
            switch(humanPlayers){
                case 0 : player1 = tempShip; humanPlayers++; break;
                case 1 : player2 = tempShip; humanPlayers++; break;
            }
        }

        //var playerScaleX = (SMALL_SHIP_SCALE*game.camera.width)/tempShip.width;
        //var playerScaleY = (SMALL_SHIP_SCALE*game.camera.height)/tempShip.height;
        //tempShip.scale.setTo(playerScaleX, playerScaleY);

    }

    // ROCK Generation
    rocks = game.add.group();
    rocks.enableBody = true;
    var rockXInc = game.world.width/rocksInfo.length;
    var rockYInc = game.world.height/rocksInfo.length;
        console.log("world size:" +game.world.width+", "+game.world.height);
    for(i=0; i < rocksInfo.length; i++){
        var rockX = randomBetween(rockXInc*i, rockXInc*i+rockXInc);
        var rockY = randomBetween(rockYInc*i, rockYInc*i+rockYInc);
        console.log("Rock cords:" +rockX+", "+rockY);
        var tempRock = rocks.create(rockX, rockY, rocksInfo[i]);
        var rocksScaleX = (ROCKS_SCALE*game.camera.width)/tempRock.width;
        var rocksScaleY = (ROCKS_SCALE*game.camera.height)/tempRock.height;
        tempRock.scale.setTo(rocksScaleX, rocksScaleY);
    }

    // SHOT Generation
    shots = game.add.group();
    shots.enableBody = true;
    shots.physicsBodyType = Phaser.Physics.ARCADE;
    
    //  All 40 of them
    shots.createMultiple(40, 'shot');
    shots.setAll('anchor.x', 0.5);
    shots.setAll('anchor.y', 0.5);
    
    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);
    
}

function getShipFromType(shipType){
    switch(shipType){
        case 0: return "ship0";
        case 1: return "ship1";
        case 2: return "ship2";
    }
    return "ship3";
}

function randomBetween(min, max){
    return Math.floor((Math.random() * (max-min+1)) + min);
}

function update() {
    
    var speedChange = 0.5;
    var angularVelocityChange = 30;
    
    if (cursors.up.isDown)
    {
        currentSpeed += speedChange;
    }
    else
    {
        if (currentSpeed > 0)
        {
           currentSpeed -= speedChange;
        }
    }

    if (cursors.left.isDown)
    {
        player1.body.angularVelocity = -1 * angularVelocityChange;
    }
    else if (cursors.right.isDown)
    {
        player1.body.angularVelocity = angularVelocityChange;
    }
    else
    {
        player1.body.angularVelocity = 0;
    }
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.Z))
    {
        fireLeft();
    }
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.X))
    {
        fireRight();
    }
    
    game.physics.arcade.velocityFromRotation(player1.rotation, currentSpeed, player1.body.velocity);

    //collision between teams and shots
    for(i=0; i < teams.length; i++){
        for(j=0; j < teams.length; j++){
            if(i != j && j > i){
                game.physics.arcade.collide(teams[i], teams[j]);                
            }
        }
        game.physics.arcade.overlap(shots, teams[i], shipHit, null, this);
    }
      
}

function fireRight () {

    if (game.time.now > shotTimeRight)
    {
        shot = shots.getFirstExists(false);

        if (shot)
        {
            shot.reset(player1.body.x + player1.body.halfWidth, player1.body.y + player1.body.halfHeight);
            shot.lifespan = 2000;
            shot.rotation = player1.rotation;
            game.physics.arcade.velocityFromRotation((player1.rotation + 1.57), 400, shot.body.velocity);
            shotTimeRight = game.time.now + 500;
        }
    }

}

function fireLeft () {

    if (game.time.now > shotTimeLeft)
    {
        shot = shots.getFirstExists(false);

        if (shot)
        {
            shot.reset(player1.body.x + player1.body.halfWidth, player1.body.y + player1.body.halfHeight);
            shot.lifespan = 2000;
            shot.rotation = player1.rotation;
            game.physics.arcade.velocityFromRotation((player1.rotation - 1.57), 400, shot.body.velocity);
            shotTimeLeft = game.time.now + 500;
        }
    }
}
    
function shipHit (shot, ship) { 
    shot.kill();
}

var shipType = {
    SMALL: 0, // fastest but weakest
    MEDIUM: 1,
    BIG: 2 // strongest but slowest
};

var specialPower = {
    ACCEL: 0, // increases acceleration
    DAMAGE: 1, // increases damage output
    STEALTH: 2 //goes invisible
};

var projectileType = {
    PERPENDICULAR: 0 // bullets shoot perpendicular to the ship
};

var weaponType = {
    SNIPER: 0, //slowest - high damage
    BARRAGE: 1, //fires a barrage of bombs - longest to reload - medium damage
    BRIGADE: 2 // fastest firing - low damage
};

function Projectile(projectileType, projectileSpeed, damage){
    this.projectileType - projectileType;
    this.projectileSpeed = projectileSpeed;
    this.damage = damage;
}

function Weapon(weaponType, projectile, reloadTime){
    this.weaponType = weaponType;
    this.projectile = projectile;
    this.reloadTime = reloadTime;
}

function Ship(id, shipType, weapon, specialPower, human, teamId, health, acceleration) {
  this.id = id;
  this.shipType = shipType;
  this.weapon = weapon;
  this.specialPower = specialPower;
  this.human = human;
  this.teamId = teamId;
  this.health = health;
  this.acceleration = acceleration;
}
