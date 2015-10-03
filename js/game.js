
var ships = [];
var rocksInfo = [];

$(window).resize(function() { window.resizeGame(); } );
var game = new Phaser.Game($(window).width(), $(window).height(), Phaser.AUTO, '', { preload: preload, create: create, update: update });

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
    var height = $(window).height();
    var width = $(window).width();
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
    game.load.image('ship', 'assets/ship2.png');
    game.load.image('shot', 'assets/shot.png');
    game.load.image('rock0', 'assets/rock0.png');
    game.load.image('rock1', 'assets/rock1.png');
    game.load.image('rock2', 'assets/rock2.png');

    populateShipsRandomly();
    generateRocks();
    console.log("Generated "+rocksInfo.length+" rocks");
}

var team1;
var team2;
var player;
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

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    var sea = game.add.sprite(0, 0, 'sea');
	var seaScaleX = (game.camera.width - sea.width)/sea.width;
	var seaScaleY = (game.camera.height - sea.height)/sea.height;
	sea.scale.setTo(1+seaScaleX, 1+seaScaleY);

    // The player and its settings
    team1 = game.add.group();
    team2 = game.add.group();
    team1.enableBody = true;
    team2.enableBody = true;
    badGuy = team2.create(game.world.width/1.5, game.world.height/1.5, 'ship');
    player = team1.create(game.world.width/3, game.world.height/3, 'ship');
    //var playerScaleX = (SMALL_SHIP_SCALE*game.camera.width)/player.width;
    //var playerScaleY = (SMALL_SHIP_SCALE*game.camera.height)/player.height;
    //player.scale.setTo(playerScaleX, playerScaleY);

    rocks = game.add.group();
    rocks.enableBody = true;
    var rockXInc = game.world.width/rocksInfo.length;
    var rockYInc = game.world.height/rocksInfo.length;
        console.log("world size:" +game.world.width+", "+game.world.height);
    for(i=0;i<rocksInfo.length;i++){
        var rockX = randomBetween(rockXInc*i, rockXInc*i+rockXInc);
        var rockY = randomBetween(rockYInc*i, rockYInc*i+rockYInc);
        console.log("Rock cords:" +rockX+", "+rockY);
        var tempRock = rocks.create(rockX, rockY, rocksInfo[i]);
        var rocksScaleX = (ROCKS_SCALE*game.camera.width)/tempRock.width;
        var rocksScaleY = (ROCKS_SCALE*game.camera.height)/tempRock.height;
        tempRock.scale.setTo(rocksScaleX, rocksScaleY);
    }

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.collideWorldBounds = true;
    player.anchor.setTo(0.5, 0.5);
    player.body.drag.set(10);
    player.body.angularDrag = 40;
    player.body.maxAngular = 30;
    player.body.maxVelocity = 30;
    
    badGuy.body.collideWorldBounds = true;
    badGuy.anchor.setTo(0.5, 0.5);
    badGuy.body.drag.set(10);
    badGuy.body.angularDrag = 40;
    badGuy.body.maxAngular = 30;
    badGuy.body.maxVelocity = 30;

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

function randomBetween(min, max){
    return Math.floor((Math.random() * (max-min+1)) + min);
}

function update() {
    
    if (cursors.up.isDown)
    {
        currentSpeed += 0.5;
    }
    else
    {
        if (currentSpeed > 0)
        {
           currentSpeed -= 0.5;
        }
    }

    if (cursors.left.isDown)
    {
        player.body.angularVelocity = -30;
    }
    else if (cursors.right.isDown)
    {
        player.body.angularVelocity = 30;
    }
    else
    {
        player.body.angularVelocity = 0;
    }
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.Z))
    {
        fireLeft();
    }
    
    if (game.input.keyboard.isDown(Phaser.Keyboard.X))
    {
        fireRight();
    }
    
    game.physics.arcade.velocityFromRotation(player.rotation, currentSpeed, player.body.velocity);
    game.physics.arcade.collide(team1, team2);
    game.physics.arcade.overlap(shots, team2, shipHit, null, this);
      
}

function fireRight () {

    if (game.time.now > shotTimeRight)
    {
        shot = shots.getFirstExists(false);

        if (shot)
        {
            shot.reset(player.body.x + player.body.halfWidth, player.body.y + player.body.halfHeight);
            shot.lifespan = 2000;
            shot.rotation = player.rotation;
            game.physics.arcade.velocityFromRotation((player.rotation + 1.57), 400, shot.body.velocity);
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
            shot.reset(player.body.x + player.body.halfWidth, player.body.y + player.body.halfHeight);
            shot.lifespan = 2000;
            shot.rotation = player.rotation;
            game.physics.arcade.velocityFromRotation((player.rotation - 1.57), 400, shot.body.velocity);
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

function Ship(id, shipType, weapon, specialPower, human, team_id, health, acceleration) {
  this.id = id;
  this.shipType = shipType;
  this.weapon = weapon;
  this.specialPower = specialPower;
  this.human = human;
  this.team_id = team_id;
  this.health = health;
  this.acceleration = acceleration;
}
