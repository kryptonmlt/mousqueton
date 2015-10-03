
var GUN = {
    SNIPER: new weapon (25, 800), //slowest - high damage
    BARRAGE: new weapon (20, 500), //fires a barrage of bombs - longest to reload - medium damage
    BRIGADE: new weapon (15, 350) // fastest firing - low damage
};

function weapon(damage, reloadTime){
    this.damage = damage;
    this.reloadTime = reloadTime;
}
