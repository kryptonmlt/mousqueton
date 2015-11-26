
var specialPower = {
    ACCEL: 0, // increases acceleration
    DAMAGE: 1, // increases damage output
    STEALTH: 2 //goes invisible
};

function Ship(id, hull, weapon, projectile, specialPower, isHuman, teamId) {
  this.id = id;
  this.hull = hull;  
  this.isHuman = isHuman;
  this.teamId = teamId;
  
  this.specialPower = specialPower;
  this.damage = weapon.damage + projectile.damage;
  this.reloadTime = weapon.reloadTime;
  this.gunType = weapon;
  this.range = weapon.range;
  this.health = hull.health;
  this.maxHealth = hull.health;
  this.acceleration = hull.acceleration;
  this.turnSpeed = hull.turnSpeed;
  this.projectileSpeed = projectile.speed;
  this.maxHealth=hull.health;
  this.ammo = projectile;
  
  
  this.currentSpeed = 0;
  this.travelDistance = 0;
  this.angularFacing = 0;
  this.shotTimeRight = 0;
  this.shotTimeLeft = 0;
}

function hull( health, acceleration, turnSpeed) {
    this.health = health;
    this.acceleration = acceleration;
    this.turnSpeed = turnSpeed; 
}

function projectile(speed, damage){
    this.speed = speed;
    this.damage = damage;
}