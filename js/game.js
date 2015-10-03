var ships = [];
var rocksInfo = [];

var gameScale = 0.75

$(window).resize(function() { window.resizeGame(); } );
var game = new Phaser.Game($(window).width() * gameScale, $(window).height() * gameScale, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function populateShipsRandomly(){
    ships[0] = new Ship(0, shipType.SMALL,  new Weapon(weaponType.SNIPER, new Projectile(projectileType.PERPENDICULAR, 40, 200), 5), specialPower.ACCEL, true, 0, 1000, 50);
    ships[1] = new Ship(1, shipType.MEDIUM, new Weapon(weaponType.BARRAGE, new Projectile(projectileType.PERPENDICULAR, 40, 200), 5), specialPower.DAMAGE, false, 0, 1000, 50);
    ships[2] = new Ship(2, shipType.BIG,    new Weapon(weaponType.BRIGADE, new Projectile(projectileType.PERPENDICULAR, 40, 200), 5), specialPower.ACCEL, false, 1, 1000, 50);
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
var gameShips = [];
var gameRocks = [];
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

var angularFacing = 0;
var movementCycle = 0;

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
        if(!teams[ships[i].teamId]){
            console.log("Creating team "+ships[i].teamId+" for ship: "+i);
            teams[ships[i].teamId] = game.add.group();
            teams[ships[i].teamId].enableBody=true;
        }
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
        if(i >= 2){
            tempShip.angle+=180;
        }
        tempShip.body.collideWorldBounds = true;
        tempShip.anchor.setTo(0.5, 0.5);
        tempShip.body.drag.set(10);
        tempShip.body.angularDrag = 40;
        tempShip.body.maxAngular = 30;
        tempShip.body.maxVelocity = 30;
        tempShip.teamId = ships[i].teamId;
        tempShip.shipId = ships[i].id;
        if(ships[i].human){
            switch(humanPlayers){
                case 0 : player1 = tempShip; humanPlayers++; break;
                case 1 : player2 = tempShip; humanPlayers++; break;
            }
        }
        gameShips[i]=tempShip;
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
        tempRock.body.immovable = true;
        gameRocks[i]=tempRock;
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
    
    if (cursors.up.isDown)
    {
        //game.physics.arcade.velocityFromRotation(ghost.rotation, 30, ghost.body.acceleration);
        currentSpeed += speedChange;
    }
    else
    {
        if (currentSpeed > 0)
        {
            //ghost.body.velocity.set(0);
           currentSpeed -= speedChange;
        }
    }

    if (cursors.left.isDown)
    {
        angularFacing -= 0.5;
    }
    else if (cursors.right.isDown)
    {
        angularFacing += 0.5;
    }
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.Z))
    {
        fireLeft(player1);
    }
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.X))
    {
        fireRight(player1);
    }
    
    if (angularFacing >= 15)
    {
        player1.rotation += Math.PI/12;
        //ghost.rotation += Math.PI/12;
        angularFacing -= 15;
    }
    
    if (angularFacing <= -15)
    {
        player1.rotation -= Math.PI/12;
        //ghost.rotation -= Math.PI/12;
        angularFacing += 15;
    }
    
    //if (game.time.now >= movementCycle){
    //    player1.position.set(ghost.position);
    //    movementCycle = game.time.now + 2000;
    //}
    
    game.physics.arcade.velocityFromRotation(player1.rotation, currentSpeed, player1.body.velocity);

    // COLLISION CHECKS

    // Ships && Rocks
    for(i=0; i < gameShips.length; i++){
        for(j=0; j < gameShips.length; j++){
            if(i != j && j > i){
                game.physics.arcade.collide(gameShips[i], gameShips[j]);                
            }
        }
        for(j=0; j < gameRocks.length; j++){
                game.physics.arcade.collide(gameShips[i], gameRocks[j]);
        }
        //Shots
        for(j=0; j<shots.children.length; j++){
            if(shots.children[j].shipId != undefined && shots.children[j].shipId != i){
                game.physics.arcade.overlap(shots.children[j], gameShips[i], shipHit, null, this);
            }
        }
    }

    //Rocks
    for(i=0; i < gameRocks.length; i++){
        game.physics.arcade.overlap(shots, gameRocks[i], rockHit, null, this);
    }
      
}

function fireRight (ship) {

    if (game.time.now > shotTimeRight)
    {
        shot = shots.getFirstExists(false);

        if (shot)
        {
            shot.reset(ship.body.x + ship.body.halfWidth, ship.body.y + ship.body.halfHeight);
            shot.lifespan = 2000;
            shot.rotation = ship.rotation;
            game.physics.arcade.velocityFromRotation((ship.rotation + 1.57), 400, shot.body.velocity);
            shotTimeRight = game.time.now + 500;
            shot.shipId=ship.shipId;
        }
    }

}

function fireLeft (ship) {

    if (game.time.now > shotTimeLeft)
    {
        shot = shots.getFirstExists(false);

        if (shot)
        {
            shot.reset(ship.body.x + ship.body.halfWidth, ship.body.y + ship.body.halfHeight);
            shot.lifespan = 2000;
            shot.rotation = ship.rotation;
            game.physics.arcade.velocityFromRotation((ship.rotation - 1.57), 400, shot.body.velocity);
            shotTimeLeft = game.time.now + 500;
            shot.shipId=ship.shipId;
        }
    }
}
    
function shipHit (shot, ship) { 
    shot.kill();
}
function rockHit (rock, shot) { 
    shot.kill();
}

