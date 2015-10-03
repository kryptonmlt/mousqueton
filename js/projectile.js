

var Direction = {
    PERPENDICULAR: 0 // bullets shoot perpendicular to the ship
};

function projectile(direction, speed, damage){
    this.direction = direction;
    this.speed = speed;
    this.damage = damage;
}
