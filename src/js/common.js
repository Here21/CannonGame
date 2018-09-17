
function tAngle(target, base) {
  const radians = Math.atan2(base.y - target.y, target.x - base.x);
  return radians * 180 / Math.PI; // degrees
}

function circleCollide(c1, c2) {
  const dx = Math.abs(c1.x - c2.x);
  const dy = Math.abs(c1.y - c2.y);

  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist < c1.radius + c2.radius;
}

function shuffle(arr){
  const temp = [...arr];
  const result = [];
  let random;
  while(temp.length > 0){
    random = Math.floor(Math.random() * temp.length);
    result.push(temp[random]);
    temp.splice(random, 1)
  }
  return result;
}
