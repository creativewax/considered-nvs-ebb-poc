// src/lib/three/shaders/displacement.glsl
// Two-layer displacement + noise-driven vertex twist
// Requires noise.glsl to be prepended (provides pnoise)

#define M_PI 3.1415926538
#define NOISE_PERIOD 10.0

uniform float time;
uniform float distort;
uniform float frequency;
uniform float surfaceDistort;
uniform float surfaceFrequency;
uniform float surfaceTime;
uniform float numberOfWaves;
uniform float fixNormals;
uniform float surfacePoleAmount;
uniform float gooPoleAmount;
uniform float twist;
uniform float twistFrequency;

// ------------------------------------------------------------
// ORTHOGONAL HELPER
// ------------------------------------------------------------

vec3 orthogonal(vec3 v) {
  return normalize(abs(v.x) > abs(v.z)
    ? vec3(-v.y, v.x, 0.0)
    : vec3(0.0, -v.z, v.y));
}

// ------------------------------------------------------------
// TWIST — rotate vertices around noise-driven axes
// Creates flowing motion AROUND the sphere, not just in/out.
// ------------------------------------------------------------

vec3 applyTwist(vec3 point) {
  if (twist < 0.001) return point;

  // Noise-driven rotation angle per vertex
  float noiseVal = pnoise(
    vec3(point * twistFrequency + mod(time * 0.5, NOISE_PERIOD)),
    vec3(NOISE_PERIOD)
  );
  float angle = noiseVal * twist;

  // Rotate around Y axis (creates horizontal swirling)
  float cy = cos(angle);
  float sy = sin(angle);
  vec3 twisted = vec3(
    point.x * cy - point.z * sy,
    point.y,
    point.x * sy + point.z * cy
  );

  // Also add a smaller rotation around X (creates vertical flow)
  float angle2 = pnoise(
    vec3(point.yzx * twistFrequency * 0.7 + mod(time * 0.3, NOISE_PERIOD)),
    vec3(NOISE_PERIOD)
  ) * twist * 0.5;
  float cx = cos(angle2);
  float sx = sin(angle2);
  twisted = vec3(
    twisted.x,
    twisted.y * cx - twisted.z * sx,
    twisted.y * sx + twisted.z * cx
  );

  return twisted;
}

// ------------------------------------------------------------
// DISPLACEMENT FUNCTION
// ------------------------------------------------------------

float f(vec3 point) {
  float yPos = smoothstep(-1.0, 1.0, point.y);
  float amount = sin(yPos * M_PI);
  float wavePoleAmt = mix(amount, 1.0, surfacePoleAmount);
  float gooPoleAmt  = mix(amount, 1.0, gooPoleAmount);

  // Layer 1: goo — large-scale organic deformation
  float goo = pnoise(
    vec3(point / frequency + mod(time, NOISE_PERIOD)),
    vec3(NOISE_PERIOD)
  ) * pow(distort, 2.0);

  // Layer 2: surface — fine detail, wave-like ridges
  float surfaceNoise = pnoise(
    vec3(point / surfaceFrequency + mod(surfaceTime, NOISE_PERIOD)),
    vec3(NOISE_PERIOD)
  );

  float waves = (
    point.x * sin((point.y + surfaceNoise) * M_PI * numberOfWaves) +
    point.z * cos((point.y + surfaceNoise) * M_PI * numberOfWaves)
  ) * 0.01 * pow(surfaceDistort, 2.0);

  return waves * wavePoleAmt + goo * gooPoleAmt;
}
