/** Transparent foreground in world coordinates with continuous wind and camera parallax. */
export function mountVillageCloudShader(viewport:HTMLElement):()=>void {
  const canvas=document.createElement('canvas');canvas.className='village-cloud-shader';canvas.setAttribute('aria-hidden','true');viewport.append(canvas);
  const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false});
  if(!gl){canvas.remove();return ()=>{};}
  const compile=(type:number,source:string)=>{const s=gl.createShader(type)!;gl.shaderSource(s,source);gl.compileShader(s);return s;};
  const vs=compile(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}');
  const fs=compile(gl.FRAGMENT_SHADER,`precision mediump float;
    uniform sampler2D tex;uniform vec2 size;uniform vec3 camera;uniform float time;
    void main(){
      vec2 screen=vec2(gl_FragCoord.x,size.y-gl_FragCoord.y);
      vec2 center=size*.5;
      vec2 world=(screen-center)/camera.z+(center-camera.xy)/camera.z*.92;
      vec2 uv=vec2(fract((world.x-time*28.)/1536.),world.y/512.);
      uv.x+=sin(uv.y*12.+time*.35)*.003;
      vec4 c=texture2D(tex,uv);
      float hi=max(c.r,max(c.g,c.b)),lo=min(c.r,min(c.g,c.b));
      float clean=1.-smoothstep(.25,.55,hi-lo);
      float band=step(0.,uv.y)*step(uv.y,1.);
      gl_FragColor=vec4(c.rgb,c.a*.32*clean*band);
    }`);
  const program=gl.createProgram()!;gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);canvas.remove();return ()=>{};}
  gl.useProgram(program);const buffer=gl.createBuffer()!;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
  const texture=gl.createTexture()!;gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const size=gl.getUniformLocation(program,'size'),camera=gl.getUniformLocation(program,'camera'),time=gl.getUniformLocation(program,'time');
  let pose={x:0,y:0,scale:1},raf=0,elapsed=0,last=0,ready=false,disposed=false;
  const update=(e:Event)=>{pose=(e as CustomEvent<typeof pose>).detail;};viewport.addEventListener('village-camera-transform',update);
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const draw=(now:number)=>{
    if(disposed)return;
    if(last&&!document.hidden&&!motion.matches)elapsed+=Math.min(now-last,100)/1000;last=now;
    if(ready&&!document.hidden){
      const w=Math.max(1,viewport.clientWidth),h=Math.max(1,viewport.clientHeight);
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
      gl.uniform2f(size,w,h);gl.uniform3f(camera,pose.x,pose.y,pose.scale);gl.uniform1f(time,elapsed);gl.drawArrays(gl.TRIANGLES,0,6);
    }
    raf=requestAnimationFrame(draw);
  };
  const image=new Image();image.onload=()=>{if(disposed)return;gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);ready=true;};image.src='/assets/ui/camp/river-owner-v1/clouds.png';raf=requestAnimationFrame(draw);
  return ()=>{disposed=true;cancelAnimationFrame(raf);image.onload=null;viewport.removeEventListener('village-camera-transform',update);gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);canvas.remove();};
}
