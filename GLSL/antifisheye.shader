#version 120
uniform sampler2DRect myTextureY; // tex unit 0
uniform sampler2DRect myTextureU; // tex unit 1
uniform sampler2DRect myTextureV; // tex unit 2
uniform vec2 myResolution;
const vec2 haalf_vec=vec2(0.5,0.5);

#define EPSILON 0.000011

void main(void)
{
  // amount of effect (depends on video definition)
  //   > 0: fisheye
  //   < 0: anti-fisheye
  //   = 0: idle
  float power = -25;
  power *= 0.00001;
	
  vec2 xy = gl_TexCoord[0].xy;
  
  // screen proportion                                         
  float prop = myResolution.x / myResolution.y;
  
  // center
  vec2 center = vec2(0.5*myResolution.x, 0.5*myResolution.y);
  
  // vector from center to current fragment
  vec2 diff = xy - center;
  
  // distance of pixel from center
  float dist = sqrt(dot(diff, diff));
  
  //radius of 1:1 effect
  float bind;
  if (power > 0.0)
	bind = sqrt(dot(center, center)); // stick to corners
  else
  {
	if (prop < 1.0) bind = center.x;
	else bind = center.y; // stick to borders
  } 
  
  //Weird formulas
  vec2 res;
  if (power > 0.0) // fisheye
    res = center + normalize(diff) * tan(dist * power) * bind / tan( bind * power);
  else if (power < 0.0) // anti-fisheye
    res = center + normalize(diff) * atan(dist * -power * 10.0) * bind / atan(-power * bind * 10.0);
  else 
    res = xy; // no effect for power = 1.0
  
  //Second part of cheat
  //for round effect, not elliptical
  //vec3 col = texture2D(iChannel0, vec2(res.x, -res.y * prop)).xyz;*/
  
  // U & V are subsampled by 2 in both directions, you need to multiply the coordinates by 0.5
  vec2 haalf = haalf_vec*res;
  vec4 texY = texture2DRect(myTextureY, res);
  vec4 texU = texture2DRect(myTextureU, haalf);
  vec4 texV = texture2DRect(myTextureV, haalf);
  gl_FragColor = vec4(texY.r, texU.r, texV.r, 1.0);
}