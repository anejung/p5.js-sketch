let controlPoints = [];
let selected = -1;
let weights = [];
let resolution = 100;

function setup() {
  createCanvas(800, 500);
  for (let i = 0; i < 5; i++) {
    controlPoints.push(createVector(100 + i * 140, random(100, 400)));
    weights.push(0.2); // default weight
  }
  textFont('Helvetica', 10);
}

function draw() {
  background(255); // พื้นหลังสีขาว

  // เส้นโค้งสีดำ
  stroke('black');
  strokeWeight(20);
  noFill();
  beginShape();
  for (let t = 0; t <= 1; t += 1 / resolution) {
    let pt = rationalBSpline(t);
    vertex(pt.x, pt.y);
  }
  endShape();

  // เส้นเชื่อมจุดควบคุม (control polygon)
  stroke('black');
  strokeWeight(0.5);
  noFill();
  beginShape();
  for (let pt of controlPoints) {
    vertex(pt.x, pt.y);
  }
  endShape();

  // วาดจุดควบคุม
  noStroke();
  for (let i = 0; i < controlPoints.length; i++) {
    let w = weights[i];
    let sz = map(w, 0.1, 5, 6, 20, true);
    fill('black');
    ellipse(controlPoints[i].x, controlPoints[i].y, sz, sz);

    // Label น้ำหนัก
    fill('black');
    textAlign(CENTER);
    text(`w=${w.toFixed(2)}`, controlPoints[i].x, controlPoints[i].y - 15);
  }
}

// สร้างจุดจาก rational B-spline (คล้าย NURBS)
function rationalBSpline(t) {
  let n = controlPoints.length - 1;
  let numerator = createVector(0, 0);
  let denominator = 0;
  for (let i = 0; i <= n; i++) {
    let b = bernstein(n, i, t) * weights[i];
    numerator.add(p5.Vector.mult(controlPoints[i], b));
    denominator += b;
  }
  return p5.Vector.div(numerator, denominator);
}

// Bernstein polynomial
function bernstein(n, i, t) {
  return binomial(n, i) * pow(t, i) * pow(1 - t, n - i);
}

// คำนวณค่า Binomial
function binomial(n, k) {
  let coeff = 1;
  for (let i = 0; i < k; i++) {
    coeff *= (n - i) / (i + 1);
  }
  return coeff;
}

// คลิกเลือกจุด
function mousePressed() {
  for (let i = 0; i < controlPoints.length; i++) {
    if (dist(mouseX, mouseY, controlPoints[i].x, controlPoints[i].y) < 12) {
      selected = i;
      break;
    }
  }
}

// ลากจุด
function mouseDragged() {
  if (selected !== -1) {
    controlPoints[selected].x = constrain(mouseX, 0, width);
    controlPoints[selected].y = constrain(mouseY, 0, height);
  }
}

function mouseReleased() {
  selected = -1;
}

// ปรับน้ำหนักด้วยแป้น ↑ ↓
function keyPressed() {
  if (selected !== -1) {
    if (keyCode === UP_ARROW) {
      weights[selected] = min(5, weights[selected] + 0.1);
    }
    if (keyCode === DOWN_ARROW) {
      weights[selected] = max(0.1, weights[selected] - 0.1);
    }
  }
}
