
function tAngle(p1, p2) {
  const radian = Math.atan2((p2.y - p1.y), (p2.x - p1.x));
  return radian * 180 / Math.PI - 90;
}
