

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