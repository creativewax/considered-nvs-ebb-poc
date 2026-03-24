// src/lib/three/shaders/displacement.glsl
// Two-layer displacement: goo + surface waves
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

// ------------------------------------------------------------
// ORTHOGONAL HELPER
// ------------------------------------------------------------

vec3 orthogonal(vec3 v) {
  return normalize(abs(v.x) > abs(v.z)
    ? vec3(-v.y, v.x, 0.0)
    : vec3(0.0, -v.z, v.y));
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
