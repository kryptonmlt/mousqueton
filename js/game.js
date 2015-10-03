var ships = [];
var rocksInfo = [];

var gameScale = 1;

var gameWidth = 800;
var gameHeight = 600;

$(window).resize(function() { window.resizeGame(); } );

function startGame(){
    game = new Phaser.Game(gameWidth * gameScale, gameHeight * gameScale, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });
}

function populateShipsRandomly(){
    ships[0] = new Ship(0, hull.SMALL,  new Weapon(gun.SNIPER,  new Projectile(Direction.PERPENDICULAR, 40, 200), 5), specialPower.ACCEL, true, 0, 1000, 50);
    ships[1] = new Ship(1, hull.MEDIUM, new Weapon(gun.BARRAGE, new Projectile(Direction.PERPENDICULAR, 40, 200), 5), specialPower.DAMAGE, false, 0, 1000, 50);
    ships[2] = new Ship(2, hull.BIG,    new Weapon(gun.BRIGADE, new Projectile(Direction.PERPENDICULAR, 40, 200), 5), specialPower.ACCEL, false, 1, 1000, 50);
    ships[3] = new Ship(3, hull.MEDIUM, new Weapon(gun.BARRAGE, new Projectile(Direction.PERPENDICULAR, 40, 200), 5), specialPower.STEALTH, false, 1, 1000, 50);
}

function generateRocks(){
    var rocksTotal = randomBetween(1,3);
    for(i=0; i < rocksTotal; i++){
        switch(randomBetween(0,2)){
            case 0: rocksInfo[i] = "rock0"; break;
            case 1: rocksInfo[i] = "rock1"; break;
            case 2: rocksInfo[i] = "rock2"; break;
        }
    }
}

function resizeGame() {
    var height = gameHeight * gameScale;
    var width = gameWidth * gameScale;
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
    //game.load.image('diamond', 'assets/diamond.png');
    game.load.spritesheet('explosion', 'assets/explosion.png',32, 32, frameMax = 37);

    populateShipsRandomly();
    generateRocks();
    console.log("Generated "+rocksInfo.length+" rocks");
    
    
}

var teams = [];
var gameShips = [];
var gameRocks = [];
var score  = [];
var player1;
var player2;
var player3;
var player4;
var cursors;
var SMALL_SHIP_SCALE = 0.05;
var ROCKS_SCALE = 0.2;
var speedChange = 0.5;

var shots;
var shot;
var shotTimeLeft = 0;
var shotTimeRight = 0;
var shotAngle = 0;
var rocks;

var angularFacing = 0;
var explosions;
var survivors;
//var movementCycle = 0;

function addBackground(assetName) {
    
    var sea = game.add.sprite(0, 0, assetName);
    var seaScaleX = (game.camera.width - sea.width)/sea.width;
    var seaScaleY = (game.camera.height - sea.height)/sea.height;
    sea.scale.setTo(1+seaScaleX, 1+seaScaleY);
}

function create() {

    // Game Physics
    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    //Explosion Animations
    
    explosions = game.add.group();
    
    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'explosion', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('explosion');
    }

    // SEA Generation
    addBackground('sea');

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
        tempShip = teams[ships[i].teamId].create( shipX, shipY, getShipFromType(ships[i].hull));
        if(i >= 2){
            tempShip.angle+=180;
        }
        tempShip.currentSpeed = 0;
        tempShip.angularFacing = 0;
        tempShip.Health = 10;
        tempShip.body.collideWorldBounds = true;
        tempShip.anchor.setTo(0.5, 0.5);
        tempShip.body.drag.set(10);
        tempShip.body.angularDrag = 40;
        tempShip.body.maxAngular = 30;
        tempShip.body.maxVelocity = 30;
        tempShip.teamId = ships[i].teamId;
        tempShip.shipId = ships[i].id;
        tempShip.isHuman = ships[i].isHuman;
        //Wake Generation
       // wake = tempShip.addChild(game.add.emitter(tempShip.x, tempShip.y, 50));
        //wake.makeParticles('diamond');
        //wake.start(false,1000, 10);

        gameShips[i]=tempShip;
        if(ships[i].isHuman){
            switch(humanPlayers){
                case 0 : player1 = gameShips[i]; humanPlayers++; break;
                case 1 : player2 = gameShips[i]; humanPlayers++; break;
                case 2 : player3 = gameShips[i]; humanPlayers++; break;
                case 3 : player4 = gameShips[i]; humanPlayers++; break;
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
        found=true;
        var tries=0;
        var rockX =0;
        var rockY =0;
        var isDone=false;
        do{
            found =true;
            if(!isDone && tries>10){
                rockX+=20;
                rockY+=20;
                for(j=0; j<gameShips.length; j++){                
                    if(DoBoxesIntersect(rockX,320, rockY,200,gameShips[j].x,gameShips[j].body.width,gameShips[j].y,gameShips[j].body.height)){
                        found = false;
                    }
                }
            }else{
                rockX = randomBetween(rockXInc*i, rockXInc*i+rockXInc);
                rockY = randomBetween(rockYInc*i, rockYInc*i+rockYInc);
                for(j=0; j<gameShips.length; j++){                
                    if(DoBoxesIntersect(rockX,320, rockY,200,gameShips[j].x,gameShips[j].body.width,gameShips[j].y,gameShips[j].body.height)){
                        found = false;
                    }
                }
            }
            tries++;
        }while(!found && tries < 50);
        console.log("Rock cords:" +rockX+", "+rockY+" VALID: "+found);
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

function DoBoxesIntersect(aX, aWidth, aY, aHeight, bX, bWidth, bY, bHeight) {
  var result= (Math.abs(aX - bX) * 2 < (aWidth + bWidth)) && (Math.abs(aY - bY) * 2 < (aHeight + bHeight));
  return result;
}

function getShipFromType(hull){
    switch(hull){
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
    
    //Player 1 Controls
    if(player1){
        if (cursors.up.isDown)  {
            player1.currentSpeed += speedChange;}
        else if (player1.currentSpeed > 0){
               player1.currentSpeed -= speedChange;}

        if (cursors.left.isDown){
            player1.angularFacing -= 0.5;}
        else if (cursors.right.isDown){
            player1.angularFacing += 0.5;}
        
        if (game.input.keyboard.isDown(Phaser.Keyboard.Z)){
            fireLeft(player1);}
        
        if (game.input.keyboard.isDown(Phaser.Keyboard.X)){
            fireRight(player1);}
    }
    
    //Player 2 Controls
    
    if (player2){
       if (game.input.keyboard.isDown(Phaser.Keyboard.W))  {
        player2.currentSpeed += speedChange;}
    else if (player2.currentSpeed > 0){
           player2.currentSpeed -= speedChange;}

    if (game.input.keyboard.isDown(Phaser.Keyboard.A)){
        player2.angularFacing -= 0.5;}
    else if (game.input.keyboard.isDown(Phaser.Keyboard.D)){
        player2.angularFacing += 0.5;}
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.Q)){
        fireLeft(player2);}
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.E)){
        fireRight(player2);} 
    }
    
    //Player 3 Controls
    
    if (player3){
        if (game.input.keyboard.isDown(Phaser.Keyboard.I))  {
        player3.currentSpeed += speedChange;}
    else if (player3.currentSpeed > 0){
           player3.currentSpeed -= speedChange;}

    if (game.input.keyboard.isDown(Phaser.Keyboard.J)){
        player3.angularFacing -= 0.5;}
    else if (game.input.keyboard.isDown(Phaser.Keyboard.L)){
        player3.angularFacing += 0.5;}
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.U)){
        fireLeft(player3);}
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.O)){
        fireRight(player3);}
    }
    
    //Player 4 Controls
    
    if (player4){
       if (game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_8))  {
        player4.currentSpeed += speedChange;}
    else if (player4.currentSpeed > 0){
           player4.currentSpeed -= speedChange;}

    if (game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_4)){
        player4.angularFacing -= 0.5;}
    else if (game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_6)){
        player4.angularFacing += 0.5;}
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_7)){
        fireLeft(player4);}
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_9)){
        fireRight(player4);} 
    }
    
    for (var i in gameShips){
        ship = gameShips[i];
        if (ship.angularFacing >= 15)
        {
            ship.rotation += Math.PI/12;
            //ghost.rotation += Math.PI/12;
            ship.angularFacing -= 15;
        }
    
        if (ship.angularFacing <= -15)
        {
            ship.rotation -= Math.PI/12;
            //ghost.rotation -= Math.PI/12;
            ship.angularFacing += 15;
        }
    }
    //if (game.time.now >= movementCycle){
        //player1.position.set(ghost.position);
        //movementCycle = game.time.now + 2000;
    //}
    
    //game.physics.arcade.velocityFromRotation(ghost.rotation, currentSpeed, ghost.body.velocity);
    for (var i in gameShips){
        ship = gameShips[i];
        game.physics.arcade.velocityFromRotation(ship.rotation, ship.currentSpeed, ship.body.velocity);
    }
   
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

    //AI
    aI();
    
    //Victory Check
    checkWinner()
      
}

function aI(){
    for(i=0; i<gameShips.length; i++){
            if(!gameShips[i].isHuman){
                var target;
                for(j=0;j<gameShips.length;j++){
                    if(gameShips[j].teamId != gameShips[i].teamId){ //ENEMY
                        if(gameShips[j].health>0){ //ALIVE
                            target = gameShips[j];
                            break;
                        }
                    }
                }
                if(target){
                    switch(inSight(gameShips[i],target)){
                        case 0: fireLeft(gameShips[i]); break;
                        case 1: fireRight(gameShips[i]); break;
                        case 2: gameShips[i].angularFacing -= 0.5; break;
                        case 3: gameShips[i].angularFacing -= 0.5; break;
                    }
                }
            }
    }
}

function inSight(ship, target){
    //console.log("ANGLE: "+ game.physics.arcade.angleBetween(ship,target));
}

function fireRight (ship) {
    
    if (ship.health>0){
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
}

function fireLeft (ship) {

    if (ship.health>0){
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
}
    
function shipHit (shot, ship) {
    shot.kill();
    ship.health -= 1;
    if(ship.health <= 0){
        var explosionAnimation = explosions.getFirstExists(false);
        explosionAnimation.reset(ship.body.x, ship.body.y);
        explosionAnimation.play('explosion', 30, false, true);
        ship.kill();
    }
}
function rockHit (rock, shot) { 
    shot.kill();
}

function checkWinner(){
    survivors = 0;
    var winner;
    for (i in gameShips){
        var ship = gameShips[i];
        if (ship.health > 0){
            survivors++;
            winner = ship.shipId;
        }
    }
    if (survivors == 1){
        //Win Screen
        var winText = game.add.text(20, game.height/2, "Player " + (winner+1) + " Wins!", { font: "74px Arial Black", fill: "#c51b7d" });
        winText.stroke = "#de77ae";
        winText.strokeThickness = 16;
        //  Apply the shadow to the Stroke and the Fill (this is the default)
        winText.setShadow(2, 2, "#333333", 2, true, true);
    }
    else if (survivors == 0){
        //Draw Screen
    }
}
