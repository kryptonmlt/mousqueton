

//var HULL = {
//    SMALL: new hull(75, 0.7, 0.7), // fastest but weakest
//    MEDIUM: new hull(100, 0.5, 0.5),
//    BIG: new hull(125, 0.4, 0.4) // strongest but slowest
//};

function hull( health, acceleration, turnSpeed) {
    this.health = health;
    this.acceleration = acceleration;
    this.turnSpeed = turnSpeed; 
}