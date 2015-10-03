

var hull = {
    SMALL: 0, // fastest but weakest
    MEDIUM: 1,
    BIG: 2 // strongest but slowest
};

var specialPower = {
    ACCEL: 0, // increases acceleration
    DAMAGE: 1, // increases damage output
    STEALTH: 2 //goes invisible
};

function Ship(id, hull, weapon, specialPower, isHuman, teamId, health, acceleration) {
  this.id = id;
  this.hull = hull;
  this.weapon = weapon;
  this.specialPower = specialPower;
  this.isHuman = isHuman;
  this.teamId = teamId;
  this.health = health;
  this.acceleration = acceleration;
  
  this.currentSpeed = 0;
  this.angularFacing = 0;
  
  sessionStorage.setItem("SHIP" + id, teamId);
}