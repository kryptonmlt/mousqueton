var ships = [];
var rocksInfo = [];

var gameScale = 0.8;

var gameWidth = $(window).width();
var gameHeight = $(window).height();

    //Enums

var HULL = {
    SMALL: new hull(75, 0.7, 0.7), // fastest but weakest
    MEDIUM: new hull(100, 0.5, 0.5),
    BIG: new hull(125, 0.4, 0.4) // strongest but slowest
};

var PROJECTILE = {
    ARMOR_PIERCING: new projectile(300, 10),
    NORMAL: new projectile(400, 5),
    LIGHT: new projectile(500, 0)
};

var GUN = {
    SNIPER: new weapon (25, 800), //slowest - high damage
    BARRAGE: new weapon (20, 500), //fires a barrage of bombs - longest to reload - medium damage
    BRIGADE: new weapon (15, 350) // fastest firing - low damage
};

var specialPower = {
    ACCEL: 0, // increases acceleration
    DAMAGE: 1, // increases damage output
    STEALTH: 2 //goes invisible
};


$(window).resize(function() { window.resizeGame(); } );

function startGame(){
    game = new Phaser.Game(gameWidth * gameScale, gameHeight * gameScale, Phaser.AUTO, 'game', { preload: preload, create: create, update: update });
}

function loadData() {
    
    if(typeof sessionStorage.Team0 != 'undefined') {
        console.log("Stored values found.");
        var maxShips = 4;
        for (var i = 0; i < maxShips; i++) {
            if (sessionStorage.getItem("Team" + i)) {
                var team = sessionStorage.getItem("Team" + i);
                var hull = sessionStorage.getItem("Hull" + i);
                var weapon = sessionStorage.getItem("Weapon" + i);
                var projectile = sessionStorage.getItem("Projectile" + i);
                
                console.log("Team" + i + ": " + team);
                console.log("Hull" + i + ": " + hull);
                console.log("Weapon" + i + ": " + weapon);
                console.log("Projectile" + i + ": " + projectile);
                                
                ships[i] = new Ship(i, HULL.SMALL, GUN.BARRAGE, PROJECTILE.NORMAL, 0, true, team);
                
            } else {
                console.log("Can't find Ship" + i + " in storage, breaking.")
                maxShips = i;
            }
        }
        console.log("Found " + maxShips + " ships.")
    } else {
        console.log("No stored values found, using random generation.");
        populateShipsRandomly();
    }
}

function populateShipsRandomly(){
    ships[0] = new Ship(0, HULL.SMALL,  GUN.SNIPER,  PROJECTILE.ARMOR_PIERCING, specialPower.ACCEL, true, 0);
    ships[1] = new Ship(1, HULL.MEDIUM, GUN.BARRAGE, PROJECTILE.LIGHT, specialPower.DAMAGE, true, 0);
    ships[2] = new Ship(2, HULL.BIG,    GUN.BRIGADE, PROJECTILE.NORMAL, specialPower.ACCEL, true, 1);
    ships[3] = new Ship(3, HULL.MEDIUM, GUN.BARRAGE, PROJECTILE.NORMAL, specialPower.STEALTH, true, 1);
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
    game.load.image('lightShot', 'assets/cannonball.png');
    game.load.image('AP', 'assets/shot.png');
    game.load.image('barrage', 'assets/barrage.png');
    game.load.image('rock0', 'assets/rock0.png');
    game.load.image('rock1', 'assets/rock1.png');
    game.load.image('rock2', 'assets/rock2.png');
    game.load.image('healthbar', 'assets/healthbar.jpg');
    game.load.spritesheet('boom', 'assets/explosion.png',32, 32, frameMax = 37);
    game.load.image('replay', 'assets/replay.png');

    loadData();
    generateRocks();
    console.log("Generated "+rocksInfo.length+" rocks");

}

var teams = [];
var gameShips = [];
var gameRocks = [];
var gameTexts = [];
var score  = [];
var healthbars = [];
var player1;
var player2;
var player3;
var player4;
var cursors;
var SMALL_SHIP_SCALE = 0.05;
var ROCKS_SCALE = 0.2;

var shots;
var APshots;
var lightShots;
var barrageShots;
var shot;
var shotTimeLeft = 0;
var shotTimeRight = 0;
var shotAngle = 0;
var rocks;

var survivors;
var finished = 0;
var winner;
var button;

function addBackground(assetName) {
    
    var sea = game.add.sprite(0, 0, assetName);
    var seaScaleX = (game.camera.width - sea.width)/sea.width;
    var seaScaleY = (game.camera.height - sea.height)/sea.height;
    sea.scale.setTo(1+seaScaleX, 1+seaScaleY);
}

function create() {

    // Game Physics
    game.physics.startSystem(Phaser.Physics.ARCADE);
    
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
        
        tempShip.health = ships[i].health;
        tempShip.maxHealth = ships[i].health;
        tempShip.specialPower = ships[i].specialPower;
        tempShip.damage = ships[i].damage;
        tempShip.reloadTime = ships[i].reloadTime;
        tempShip.range = ships[i].range;
        tempShip.acceleration = ships[i].acceleration;
        tempShip.turnSpeed = ships[i].turnSpeed;
        tempShip.projectileSpeed = ships[i].speed;
        tempShip.ammo = ships[i].ammo;
        
        tempShip.body.collideWorldBounds = true;
        tempShip.anchor.setTo(0.5, 0.5);
        tempShip.body.drag.set(10);
        tempShip.body.angularDrag = 40;
        tempShip.body.maxAngular = 30;
        tempShip.body.maxVelocity = 30;
        tempShip.teamId = ships[i].teamId;
        tempShip.shipId = ships[i].id;
        tempShip.isHuman = ships[i].isHuman;
        //healthbars[i] = this.game.add.sprite(tempShip.body.x, tempShip.body.y+tempShip.body.height,'healthbar');
        //healthbars[i].cropEnabled = true;
        //healthbars[i].crop.width = (tempShip.health / tempShip.maxHealth) * healthbars[i].width
        healthbars[i] = new HealthBar(this.game, {x: tempShip.body.x, y: tempShip.body.y+tempShip.body.height, width: 100, height:15, 
            bar: {color: 'green'}});
        //this.myHealthBar.setPercent(100); 
        gameTexts[i] = game.add.text(tempShip.body.x, tempShip.body.y+tempShip.body.height, 'Player '+(ships[i].id+1),  
            { font: "20px Arial", fill: "#000000"});

        gameShips[i]=tempShip;
        if(ships[i].isHuman){
            switch(humanPlayers){
                case 0 : player1 = gameShips[i]; humanPlayers++; break;
                case 1 : player2 = gameShips[i]; humanPlayers++; break;
                case 2 : player3 = gameShips[i]; humanPlayers++; break;
                case 3 : player4 = gameShips[i]; humanPlayers++; break;
            }
        }
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
    
    APshots = game.add.group();
    APshots.enableBody = true;
    APshots.physicsBodyType = Phaser.Physics.ARCADE;
    
    //  All 40 of them
    APshots.createMultiple(40, 'AP');
    APshots.setAll('anchor.x', 0.5);
    APshots.setAll('anchor.y', 0.5);
    
    lightShots = game.add.group();
    lightShots.enableBody = true;
    lightShots.physicsBodyType = Phaser.Physics.ARCADE;
    
    //  All 40 of them
    lightShots.createMultiple(40, 'lightShot');
    lightShots.setAll('anchor.x', 0.5);
    lightShots.setAll('anchor.y', 0.5);
    
    barrageShots = game.add.group();
    barrageShots.enableBody = true;
    barrageShots.physicsBodyType = Phaser.Physics.ARCADE;
    
    //  All 40 of them
    barrageShots.createMultiple(40, 'barrage');
    barrageShots.setAll('anchor.x', 0.5);
    barrageShots.setAll('anchor.y', 0.5);
     
    shots.add(APshots);
    shots.add(lightShots);
    shots.add(barrageShots);
    
    //Healthbars
   /* for(i=0; i < gameShips.length; i++){
        switch(i){
            case 0: game.add.sprite(20,30,'healthBack');
                    var healthBar = this.game.add.sprite(20,30,'healthFront');
                    Healthbars[i] = healthBar;
                    break;
            case 1: game.add.sprite(20,game.height-30,'healthBack');
                    var healthBar = this.game.add.sprite(20,game.height-30,'healthFront');
                    Healthbars[i] = healthBar;
                    break;
            case 2: game.add.sprite(game.width - 20,30,'healthBack');
                    var healthBar = this.game.add.sprite(game.width - 20,30,'healthFront');
                    Healthbars[i] = healthBar;
                    break;
            case 3: game.add.sprite(game.width - 20,game.width - 30,'healthBack');
                    var healthBar = this.game.add.sprite(game.width - 20,game.width - 30,'healthFront');
                    Healthbars[i] = healthBar;
                    break;
        }
    }  */
           
    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);
    
}
function generateHexColor() { 
    return '#' + ((0.5 + 0.5 * Math.random()) * 0xFFFFFF << 0).toString(16);
}
function DoBoxesIntersect(aX, aWidth, aY, aHeight, bX, bWidth, bY, bHeight) {
  var result= (Math.abs(aX - bX) * 2 < (aWidth + bWidth)) && (Math.abs(aY - bY) * 2 < (aHeight + bHeight));
  return result;
}

function getShipFromType(hull){
    switch(hull){
        case HULL.SMALL: return "ship0";
        case HULL.MEDIUM: return "ship1";
        case HULL.BIG: return "ship2";
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
            player1.currentSpeed += player1.acceleration;}
        else if (player1.currentSpeed > 0){
               player1.currentSpeed -= player1.acceleration;}

        if (cursors.left.isDown){
            player1.angularFacing -= player1.turnSpeed;}
        else if (cursors.right.isDown){
            player1.angularFacing += player1.turnSpeed;}
        
        if (game.input.keyboard.isDown(Phaser.Keyboard.Z)){
            fireLeft(player1);}
        
        if (game.input.keyboard.isDown(Phaser.Keyboard.X)){
            fireRight(player1);}
    }
    
    //Player 2 Controls
    
    if (player2){
       if (game.input.keyboard.isDown(Phaser.Keyboard.W))  {
        player2.currentSpeed += player2.acceleration;}
    else if (player2.currentSpeed > 0){
           player2.currentSpeed -= player2.acceleration;}

    if (game.input.keyboard.isDown(Phaser.Keyboard.A)){
        player2.angularFacing -= player2.turnSpeed;}
    else if (game.input.keyboard.isDown(Phaser.Keyboard.D)){
        player2.angularFacing += player2.turnSpeed;}
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.Q)){
        fireLeft(player2);}
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.E)){
        fireRight(player2);} 
    }
    
    //Player 3 Controls
    
    if (player3){
        if (game.input.keyboard.isDown(Phaser.Keyboard.I))  {
        player3.currentSpeed += player3.acceleration;}
    else if (player3.currentSpeed > 0){
           player3.currentSpeed -= player3.acceleration;}

    if (game.input.keyboard.isDown(Phaser.Keyboard.J)){
        player3.angularFacing -= player3.turnSpeed;}
    else if (game.input.keyboard.isDown(Phaser.Keyboard.L)){
        player3.angularFacing += player3.turnSpeed;}
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.U)){
        fireLeft(player3);}
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.O)){
        fireRight(player3);}
    }
    
    //Player 4 Controls
    
    if (player4){
       if (game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_8))  {
        player4.currentSpeed += player4.acceleration;}
    else if (player4.currentSpeed > 0){
           player4.currentSpeed -= player4.acceleration;}

    if (game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_4)){
        player4.angularFacing -= player4.turnSpeed;}
    else if (game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_6)){
        player4.angularFacing += player4.turnSpeed;}
    
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
        //APshots
        for(j=0; j<APshots.children.length; j++){
            if(APshots.children[j].shipId != undefined && APshots.children[j].shipId != i){
                game.physics.arcade.overlap(APshots.children[j], gameShips[i], shipHit, null, this);
            }
        }
        //lightShots
        for(j=0; j<lightShots.children.length; j++){
            if(lightShots.children[j].shipId != undefined && lightShots.children[j].shipId != i){
                game.physics.arcade.overlap(lightShots.children[j], gameShips[i], shipHit, null, this);
            }
        }
        //barrageShots
        for(j=0; j<barrageShots.children.length; j++){
            if(barrageShots.children[j].shipId != undefined && barrageShots.children[j].shipId != i){
                game.physics.arcade.overlap(barrageShots.children[j], gameShips[i], shipHit, null, this);
            }
        }
        if(ship.health <= 0 || isNaN(ship.health)){//ship died
            //gameTexts[ship.id].kill();
            //healthbars[ship.id].kill();
        }
    }

    //Rocks
    for(i=0; i < gameRocks.length; i++){
        game.physics.arcade.overlap(APshots, gameRocks[i], rockHit, null, this);
        game.physics.arcade.overlap(lightShots, gameRocks[i], rockHit, null, this);
        game.physics.arcade.overlap(barrageShots, gameRocks[i], rockHit, null, this);
    }

    //Update healthbars
    for(i =0;i<healthbars.length; i++){
        tempX = gameShips[i].body.x;
        tempY = gameShips[i].body.y+gameShips[i].body.height;
        healthbars[i].setPosition(tempX,tempY);
        healthbars[i].setPercent((gameShips[i].health/gameShips[i].maxHealth)*100);
    }

    //Update text
    for(i =0;i<gameTexts.length; i++){
            gameTexts[i].x = gameShips[i].body.x;
            gameTexts[i].y = gameShips[i].body.y+gameShips[i].body.height;
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
            console.log(ship.ammo);
            switch (ship.ammo){
                case(PROJECTILE.ARMOR_PIERCING):    shot = APshots.getFirstExists(false); break;
                case(PROJECTILE.NORMAL):            shot = barrageShots.getFirstExists(false); break;
                case(PROJECTILE.LIGHT):             shot = lightShots.getFirstExists(false); break;
            }
            
            if (shot)
            {
                shot.reset(ship.body.x + ship.body.halfWidth, ship.body.y + ship.body.halfHeight);
                shot.lifespan = ship.range;
                shot.rotation = ship.rotation;
                game.physics.arcade.velocityFromRotation((ship.rotation + 1.57), ship.projectileSpeed, shot.body.velocity);
                shotTimeRight = game.time.now + ship.reloadTime;
                shot.shipId=ship.shipId;
                shot.damage = ship.damage;
            }
        }  
    }
}

function fireLeft (ship) {

    if (ship.health>0){
        if (game.time.now > shotTimeLeft)
        {
            console.log(ship.ammo);
            switch (ship.ammo){
                case(PROJECTILE.ARMOR_PIERCING):    shot = APshots.getFirstExists(false); break;
                case(PROJECTILE.NORMAL):            shot = barrageShots.getFirstExists(false); break;
                case(PROJECTILE.LIGHT):             shot = lightShots.getFirstExists(false); break;
            }

            if (shot)
            {
                shot.reset(ship.body.x + ship.body.halfWidth, ship.body.y + ship.body.halfHeight);
                shot.lifespan = ship.range;
                shot.rotation = ship.rotation;
                game.physics.arcade.velocityFromRotation((ship.rotation - 1.57), ship.projectileSpeed, shot.body.velocity);
                shotTimeLeft = game.time.now + ship.reloadTime;
                shot.shipId=ship.shipId;
                shot.damage = ship.damage;
            }
        }
    }
}
    
function shipHit (shot, ship) {
    ship.health -= shot.damage;
    shot.kill();
    if(ship.health <= 0 || isNaN(ship.health)){
        explosion = game.add.sprite(ship.body.center.x, ship.body.center.y, 'boom', 0);
        anim = explosion.animations.add('boomboom');
        anim.play('boomboom');
        anim.onComplete.add(clean(explosion), this)
        ship.kill();
        //gameTexts[ship.id].kill();
        //healthbars[ship.id].kill();
    }
}
function rockHit (rock, shot) { 
    shot.kill();
}

function clean(thing){
    thing.kill();
}

function checkWinner(){
    if (finished != 1){
        survivors = [];
        for (i in gameShips){
            var ship = gameShips[i];
            if (ship.health > 0){
                if (!contains(survivors,ship.teamId )){
                    survivors.push(ship.teamId);
                }
            }
        }
        if (survivors.length == 1){
            //Win Screen
            var winText = game.add.text(50, game.height/2 - 20, "Team " + (survivors[0]+1) + " Wins!", { font: "74px Arial Black", fill: "#c51b7d" });
            winText.stroke = "#de77ae";
            winText.strokeThickness = 16;
            //  Apply the shadow to the Stroke and the Fill (this is the default)
            winText.setShadow(2, 2, "#333333", 2, true, true);
            button = game.add.button(100, game.height - 160, 'replay', restart, this);
            finished = 1;
        }
        else if (survivors.length == 0){
            //Draw Screen
        }       
    }

}

function restart(){
    window.location = "http://kryptonmlt.github.io/mousqueton/";
}

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] == obj) {
            return true;
        }
    }
    return false;
}
