
var gun = {
    SNIPER: 0, //slowest - high damage
    BARRAGE: 1, //fires a barrage of bombs - longest to reload - medium damage
    BRIGADE: 2 // fastest firing - low damage
};

function Weapon(gun, projectile, reloadTime){
    this.gun = gun;
    this.projectile = projectile;
    this.reloadTime = reloadTime;
}