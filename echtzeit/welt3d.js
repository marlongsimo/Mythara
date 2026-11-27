"use strict";(()=>{var jh=0,zl=1,Qh=2;var qc=1,Za=2,xn=3,Bn=0,Ut=1,Kt=2,Fn=0,zi=1,Hi=2,Ol=3,Bl=4,eu=5,ni=100,tu=101,nu=102,iu=103,su=104,ru=200,ou=201,au=202,lu=203,Po=204,Lo=205,cu=206,hu=207,uu=208,fu=209,du=210,pu=211,mu=212,gu=213,xu=214,Do=0,Uo=1,No=2,Vi=3,Fo=4,zo=5,Oo=6,Bo=7,$a=0,_u=1,yu=2,zn=0,vu=1,bu=2,Mu=3,Ja=4,Su=5,Eu=6,wu=7;var Yc=300,Gi=301,Wi=302,ko=303,Ho=304,kr=306,kn=1e3,si=1001,Vo=1002,Ot=1003,Tu=1004;var Fs=1005;var on=1006,Kr=1007;var ri=1008;var bn=1009,Zc=1010,$c=1011,ys=1012,Ka=1013,oi=1014,an=1015,Cs=1016,ja=1017,Qa=1018,Xi=1020,Jc=35902,Kc=1021,jc=1022,jt=1023,Qc=1024,eh=1025,Oi=1026,qi=1027,el=1028,tl=1029,th=1030,nl=1031;var il=1033,lr=33776,cr=33777,hr=33778,ur=33779,Go=35840,Wo=35841,Xo=35842,qo=35843,Yo=36196,Zo=37492,$o=37496,Jo=37808,Ko=37809,jo=37810,Qo=37811,ea=37812,ta=37813,na=37814,ia=37815,sa=37816,ra=37817,oa=37818,aa=37819,la=37820,ca=37821,fr=36492,ha=36494,ua=36495,nh=36283,fa=36284,da=36285,pa=36286;var dr=2300,ma=2301,jr=2302,kl=2400,Hl=2401,Vl=2402;var Au=3200,Ru=3201;var ih=0,Cu=1,Un="",_t="srgb",Ji="srgb-linear",Hr="linear",et="srgb";var xi=7680;var Gl=519,Iu=512,Pu=513,Lu=514,sh=515,Du=516,Uu=517,Nu=518,Fu=519,ga=35044;var Wl="300 es",yn=2e3,pr=2001,Hn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let s=this._listeners[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let n=this._listeners[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},Et=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Qr=Math.PI/180,xa=180/Math.PI;function On(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Et[i&255]+Et[i>>8&255]+Et[i>>16&255]+Et[i>>24&255]+"-"+Et[e&255]+Et[e>>8&255]+"-"+Et[e>>16&15|64]+Et[e>>24&255]+"-"+Et[t&63|128]+Et[t>>8&255]+"-"+Et[t>>16&255]+Et[t>>24&255]+Et[n&255]+Et[n>>8&255]+Et[n>>16&255]+Et[n>>24&255]).toLowerCase()}function Dt(i,e,t){return Math.max(e,Math.min(t,i))}function zu(i,e){return(i%e+e)%e}function eo(i,e,t){return(1-t)*i+t*e}function rn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function tt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var Ee=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Dt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},ze=class i{constructor(e,t,n,s,r,o,a,l,u){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,u)}set(e,t,n,s,r,o,a,l,u){let h=this.elements;return h[0]=e,h[1]=s,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=u,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],u=n[1],h=n[4],d=n[7],c=n[2],p=n[5],g=n[8],y=s[0],m=s[3],f=s[6],b=s[1],S=s[4],v=s[7],I=s[2],w=s[5],T=s[8];return r[0]=o*y+a*b+l*I,r[3]=o*m+a*S+l*w,r[6]=o*f+a*v+l*T,r[1]=u*y+h*b+d*I,r[4]=u*m+h*S+d*w,r[7]=u*f+h*v+d*T,r[2]=c*y+p*b+g*I,r[5]=c*m+p*S+g*w,r[8]=c*f+p*v+g*T,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],u=e[7],h=e[8];return t*o*h-t*a*u-n*r*h+n*a*l+s*r*u-s*o*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],u=e[7],h=e[8],d=h*o-a*u,c=a*l-h*r,p=u*r-o*l,g=t*d+n*c+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/g;return e[0]=d*y,e[1]=(s*u-h*n)*y,e[2]=(a*n-s*o)*y,e[3]=c*y,e[4]=(h*t-s*l)*y,e[5]=(s*r-a*t)*y,e[6]=p*y,e[7]=(n*l-u*t)*y,e[8]=(o*t-n*r)*y,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){let l=Math.cos(r),u=Math.sin(r);return this.set(n*l,n*u,-n*(l*o+u*a)+o+e,-s*u,s*l,-s*(-u*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(to.makeScale(e,t)),this}rotate(e){return this.premultiply(to.makeRotation(-e)),this}translate(e,t){return this.premultiply(to.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},to=new ze;function rh(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function vs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Ou(){let i=vs("canvas");return i.style.display="block",i}var Xl={};function gs(i){i in Xl||(Xl[i]=!0,console.warn(i))}function Bu(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}function ku(i){let e=i.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Hu(i){let e=i.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}var Ze={enabled:!0,workingColorSpace:Ji,spaces:{},convert:function(i,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===et&&(i.r=vn(i.r),i.g=vn(i.g),i.b=vn(i.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(i.applyMatrix3(this.spaces[e].toXYZ),i.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===et&&(i.r=Bi(i.r),i.g=Bi(i.g),i.b=Bi(i.b))),i},fromWorkingColorSpace:function(i,e){return this.convert(i,this.workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Un?Hr:this.spaces[i].transfer},getLuminanceCoefficients:function(i,e=this.workingColorSpace){return i.fromArray(this.spaces[e].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,e,t){return i.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function vn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Bi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var ql=[.64,.33,.3,.6,.15,.06],Yl=[.2126,.7152,.0722],Zl=[.3127,.329],$l=new ze().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Jl=new ze().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Ze.define({[Ji]:{primaries:ql,whitePoint:Zl,transfer:Hr,toXYZ:$l,fromXYZ:Jl,luminanceCoefficients:Yl,workingColorSpaceConfig:{unpackColorSpace:_t},outputColorSpaceConfig:{drawingBufferColorSpace:_t}},[_t]:{primaries:ql,whitePoint:Zl,transfer:et,toXYZ:$l,fromXYZ:Jl,luminanceCoefficients:Yl,outputColorSpaceConfig:{drawingBufferColorSpace:_t}}});var _i,_a=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{_i===void 0&&(_i=vs("canvas")),_i.width=e.width,_i.height=e.height;let n=_i.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=_i}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=vs("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=vn(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(vn(t[n]/255)*255):t[n]=vn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Vu=0,mr=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Vu++}),this.uuid=On(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(no(s[o].image)):r.push(no(s[o]))}else r=no(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function no(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?_a.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Gu=0,Pt=class i extends Hn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=si,s=si,r=on,o=ri,a=jt,l=bn,u=i.DEFAULT_ANISOTROPY,h=Un){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Gu++}),this.uuid=On(),this.name="",this.source=new mr(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=u,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Ee(0,0),this.repeat=new Ee(1,1),this.center=new Ee(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ze,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Yc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case kn:e.x=e.x-Math.floor(e.x);break;case si:e.x=e.x<0?0:1;break;case Vo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case kn:e.y=e.y-Math.floor(e.y);break;case si:e.y=e.y<0?0:1;break;case Vo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Pt.DEFAULT_IMAGE=null;Pt.DEFAULT_MAPPING=Yc;Pt.DEFAULT_ANISOTROPY=1;var nt=class i{constructor(e=0,t=0,n=0,s=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,u=l[0],h=l[4],d=l[8],c=l[1],p=l[5],g=l[9],y=l[2],m=l[6],f=l[10];if(Math.abs(h-c)<.01&&Math.abs(d-y)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+c)<.1&&Math.abs(d+y)<.1&&Math.abs(g+m)<.1&&Math.abs(u+p+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let S=(u+1)/2,v=(p+1)/2,I=(f+1)/2,w=(h+c)/4,T=(d+y)/4,A=(g+m)/4;return S>v&&S>I?S<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(S),s=w/n,r=T/n):v>I?v<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),n=w/s,r=A/s):I<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(I),n=T/r,s=A/r),this.set(n,s,r,t),this}let b=Math.sqrt((m-g)*(m-g)+(d-y)*(d-y)+(c-h)*(c-h));return Math.abs(b)<.001&&(b=1),this.x=(m-g)/b,this.y=(d-y)/b,this.z=(c-h)/b,this.w=Math.acos((u+p+f-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},ya=class extends Hn{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new nt(0,0,e,t),this.scissorTest=!1,this.viewport=new nt(0,0,e,t);let s={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:on,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);let r=new Pt(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];let o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,s=e.textures.length;n<s;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new mr(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},Mn=class extends ya{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},gr=class extends Pt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ot,this.minFilter=Ot,this.wrapR=si,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var va=class extends Pt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ot,this.minFilter=Ot,this.wrapR=si,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Gt=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],u=n[s+1],h=n[s+2],d=n[s+3],c=r[o+0],p=r[o+1],g=r[o+2],y=r[o+3];if(a===0){e[t+0]=l,e[t+1]=u,e[t+2]=h,e[t+3]=d;return}if(a===1){e[t+0]=c,e[t+1]=p,e[t+2]=g,e[t+3]=y;return}if(d!==y||l!==c||u!==p||h!==g){let m=1-a,f=l*c+u*p+h*g+d*y,b=f>=0?1:-1,S=1-f*f;if(S>Number.EPSILON){let I=Math.sqrt(S),w=Math.atan2(I,f*b);m=Math.sin(m*w)/I,a=Math.sin(a*w)/I}let v=a*b;if(l=l*m+c*v,u=u*m+p*v,h=h*m+g*v,d=d*m+y*v,m===1-a){let I=1/Math.sqrt(l*l+u*u+h*h+d*d);l*=I,u*=I,h*=I,d*=I}}e[t]=l,e[t+1]=u,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,s,r,o){let a=n[s],l=n[s+1],u=n[s+2],h=n[s+3],d=r[o],c=r[o+1],p=r[o+2],g=r[o+3];return e[t]=a*g+h*d+l*p-u*c,e[t+1]=l*g+h*c+u*d-a*p,e[t+2]=u*g+h*p+a*c-l*d,e[t+3]=h*g-a*d-l*c-u*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,u=a(n/2),h=a(s/2),d=a(r/2),c=l(n/2),p=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=c*h*d+u*p*g,this._y=u*p*d-c*h*g,this._z=u*h*g+c*p*d,this._w=u*h*d-c*p*g;break;case"YXZ":this._x=c*h*d+u*p*g,this._y=u*p*d-c*h*g,this._z=u*h*g-c*p*d,this._w=u*h*d+c*p*g;break;case"ZXY":this._x=c*h*d-u*p*g,this._y=u*p*d+c*h*g,this._z=u*h*g+c*p*d,this._w=u*h*d-c*p*g;break;case"ZYX":this._x=c*h*d-u*p*g,this._y=u*p*d+c*h*g,this._z=u*h*g-c*p*d,this._w=u*h*d+c*p*g;break;case"YZX":this._x=c*h*d+u*p*g,this._y=u*p*d+c*h*g,this._z=u*h*g-c*p*d,this._w=u*h*d-c*p*g;break;case"XZY":this._x=c*h*d-u*p*g,this._y=u*p*d-c*h*g,this._z=u*h*g+c*p*d,this._w=u*h*d+c*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],u=t[2],h=t[6],d=t[10],c=n+a+d;if(c>0){let p=.5/Math.sqrt(c+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-u)*p,this._z=(o-s)*p}else if(n>a&&n>d){let p=2*Math.sqrt(1+n-a-d);this._w=(h-l)/p,this._x=.25*p,this._y=(s+o)/p,this._z=(r+u)/p}else if(a>d){let p=2*Math.sqrt(1+a-n-d);this._w=(r-u)/p,this._x=(s+o)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+d-n-a);this._w=(o-s)/p,this._x=(r+u)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Dt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,u=t._z,h=t._w;return this._x=n*h+o*a+s*u-r*l,this._y=s*h+o*l+r*a-n*u,this._z=r*h+o*u+n*l-s*a,this._w=o*h-n*a-s*l-r*u,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,s=this._y,r=this._z,o=this._w,a=o*e._w+n*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;let l=1-a*a;if(l<=Number.EPSILON){let p=1-t;return this._w=p*o+t*this._w,this._x=p*n+t*this._x,this._y=p*s+t*this._y,this._z=p*r+t*this._z,this.normalize(),this}let u=Math.sqrt(l),h=Math.atan2(u,a),d=Math.sin((1-t)*h)/u,c=Math.sin(t*h)/u;return this._w=o*d+this._w*c,this._x=n*d+this._x*c,this._y=s*d+this._y*c,this._z=r*d+this._z*c,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},P=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Kl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Kl.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,u=2*(o*s-a*n),h=2*(a*t-r*s),d=2*(r*n-o*t);return this.x=t+l*u+o*d-a*h,this.y=n+l*h+a*u-r*d,this.z=s+l*d+r*h-o*u,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return io.copy(this).projectOnVector(e),this.sub(io)}reflect(e){return this.sub(io.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Dt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},io=new P,Kl=new Gt,Sn=class{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Zt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Zt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Zt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Zt):Zt.fromBufferAttribute(r,o),Zt.applyMatrix4(e.matrixWorld),this.expandByPoint(Zt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),zs.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),zs.copy(n.boundingBox)),zs.applyMatrix4(e.matrixWorld),this.union(zs)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Zt),Zt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(os),Os.subVectors(this.max,os),yi.subVectors(e.a,os),vi.subVectors(e.b,os),bi.subVectors(e.c,os),Rn.subVectors(vi,yi),Cn.subVectors(bi,vi),$n.subVectors(yi,bi);let t=[0,-Rn.z,Rn.y,0,-Cn.z,Cn.y,0,-$n.z,$n.y,Rn.z,0,-Rn.x,Cn.z,0,-Cn.x,$n.z,0,-$n.x,-Rn.y,Rn.x,0,-Cn.y,Cn.x,0,-$n.y,$n.x,0];return!so(t,yi,vi,bi,Os)||(t=[1,0,0,0,1,0,0,0,1],!so(t,yi,vi,bi,Os))?!1:(Bs.crossVectors(Rn,Cn),t=[Bs.x,Bs.y,Bs.z],so(t,yi,vi,bi,Os))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Zt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Zt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(fn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),fn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),fn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),fn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),fn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),fn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),fn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),fn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(fn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},fn=[new P,new P,new P,new P,new P,new P,new P,new P],Zt=new P,zs=new Sn,yi=new P,vi=new P,bi=new P,Rn=new P,Cn=new P,$n=new P,os=new P,Os=new P,Bs=new P,Jn=new P;function so(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Jn.fromArray(i,r);let a=s.x*Math.abs(Jn.x)+s.y*Math.abs(Jn.y)+s.z*Math.abs(Jn.z),l=e.dot(Jn),u=t.dot(Jn),h=n.dot(Jn);if(Math.max(-Math.max(l,u,h),Math.min(l,u,h))>a)return!1}return!0}var Wu=new Sn,as=new P,ro=new P,ai=class{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Wu.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;as.subVectors(e,this.center);let t=as.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(as,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ro.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(as.copy(e.center).add(ro)),this.expandByPoint(as.copy(e.center).sub(ro))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},dn=new P,oo=new P,ks=new P,In=new P,ao=new P,Hs=new P,lo=new P,xr=class{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,dn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=dn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(dn.copy(this.origin).addScaledVector(this.direction,t),dn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){oo.copy(e).add(t).multiplyScalar(.5),ks.copy(t).sub(e).normalize(),In.copy(this.origin).sub(oo);let r=e.distanceTo(t)*.5,o=-this.direction.dot(ks),a=In.dot(this.direction),l=-In.dot(ks),u=In.lengthSq(),h=Math.abs(1-o*o),d,c,p,g;if(h>0)if(d=o*l-a,c=o*a-l,g=r*h,d>=0)if(c>=-g)if(c<=g){let y=1/h;d*=y,c*=y,p=d*(d+o*c+2*a)+c*(o*d+c+2*l)+u}else c=r,d=Math.max(0,-(o*c+a)),p=-d*d+c*(c+2*l)+u;else c=-r,d=Math.max(0,-(o*c+a)),p=-d*d+c*(c+2*l)+u;else c<=-g?(d=Math.max(0,-(-o*r+a)),c=d>0?-r:Math.min(Math.max(-r,-l),r),p=-d*d+c*(c+2*l)+u):c<=g?(d=0,c=Math.min(Math.max(-r,-l),r),p=c*(c+2*l)+u):(d=Math.max(0,-(o*r+a)),c=d>0?r:Math.min(Math.max(-r,-l),r),p=-d*d+c*(c+2*l)+u);else c=o>0?-r:r,d=Math.max(0,-(o*c+a)),p=-d*d+c*(c+2*l)+u;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(oo).addScaledVector(ks,c),p}intersectSphere(e,t){dn.subVectors(e.center,this.origin);let n=dn.dot(this.direction),s=dn.dot(dn)-n*n,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l,u=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,c=this.origin;return u>=0?(n=(e.min.x-c.x)*u,s=(e.max.x-c.x)*u):(n=(e.max.x-c.x)*u,s=(e.min.x-c.x)*u),h>=0?(r=(e.min.y-c.y)*h,o=(e.max.y-c.y)*h):(r=(e.max.y-c.y)*h,o=(e.min.y-c.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),d>=0?(a=(e.min.z-c.z)*d,l=(e.max.z-c.z)*d):(a=(e.max.z-c.z)*d,l=(e.min.z-c.z)*d),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,dn)!==null}intersectTriangle(e,t,n,s,r){ao.subVectors(t,e),Hs.subVectors(n,e),lo.crossVectors(ao,Hs);let o=this.direction.dot(lo),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;In.subVectors(this.origin,e);let l=a*this.direction.dot(Hs.crossVectors(In,Hs));if(l<0)return null;let u=a*this.direction.dot(ao.cross(In));if(u<0||l+u>o)return null;let h=-a*In.dot(lo);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Le=class i{constructor(e,t,n,s,r,o,a,l,u,h,d,c,p,g,y,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,u,h,d,c,p,g,y,m)}set(e,t,n,s,r,o,a,l,u,h,d,c,p,g,y,m){let f=this.elements;return f[0]=e,f[4]=t,f[8]=n,f[12]=s,f[1]=r,f[5]=o,f[9]=a,f[13]=l,f[2]=u,f[6]=h,f[10]=d,f[14]=c,f[3]=p,f[7]=g,f[11]=y,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,s=1/Mi.setFromMatrixColumn(e,0).length(),r=1/Mi.setFromMatrixColumn(e,1).length(),o=1/Mi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),u=Math.sin(s),h=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){let c=o*h,p=o*d,g=a*h,y=a*d;t[0]=l*h,t[4]=-l*d,t[8]=u,t[1]=p+g*u,t[5]=c-y*u,t[9]=-a*l,t[2]=y-c*u,t[6]=g+p*u,t[10]=o*l}else if(e.order==="YXZ"){let c=l*h,p=l*d,g=u*h,y=u*d;t[0]=c+y*a,t[4]=g*a-p,t[8]=o*u,t[1]=o*d,t[5]=o*h,t[9]=-a,t[2]=p*a-g,t[6]=y+c*a,t[10]=o*l}else if(e.order==="ZXY"){let c=l*h,p=l*d,g=u*h,y=u*d;t[0]=c-y*a,t[4]=-o*d,t[8]=g+p*a,t[1]=p+g*a,t[5]=o*h,t[9]=y-c*a,t[2]=-o*u,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let c=o*h,p=o*d,g=a*h,y=a*d;t[0]=l*h,t[4]=g*u-p,t[8]=c*u+y,t[1]=l*d,t[5]=y*u+c,t[9]=p*u-g,t[2]=-u,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let c=o*l,p=o*u,g=a*l,y=a*u;t[0]=l*h,t[4]=y-c*d,t[8]=g*d+p,t[1]=d,t[5]=o*h,t[9]=-a*h,t[2]=-u*h,t[6]=p*d+g,t[10]=c-y*d}else if(e.order==="XZY"){let c=o*l,p=o*u,g=a*l,y=a*u;t[0]=l*h,t[4]=-d,t[8]=u*h,t[1]=c*d+y,t[5]=o*h,t[9]=p*d-g,t[2]=g*d-p,t[6]=a*h,t[10]=y*d+c}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Xu,e,qu)}lookAt(e,t,n){let s=this.elements;return Ft.subVectors(e,t),Ft.lengthSq()===0&&(Ft.z=1),Ft.normalize(),Pn.crossVectors(n,Ft),Pn.lengthSq()===0&&(Math.abs(n.z)===1?Ft.x+=1e-4:Ft.z+=1e-4,Ft.normalize(),Pn.crossVectors(n,Ft)),Pn.normalize(),Vs.crossVectors(Ft,Pn),s[0]=Pn.x,s[4]=Vs.x,s[8]=Ft.x,s[1]=Pn.y,s[5]=Vs.y,s[9]=Ft.y,s[2]=Pn.z,s[6]=Vs.z,s[10]=Ft.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],u=n[12],h=n[1],d=n[5],c=n[9],p=n[13],g=n[2],y=n[6],m=n[10],f=n[14],b=n[3],S=n[7],v=n[11],I=n[15],w=s[0],T=s[4],A=s[8],x=s[12],_=s[1],C=s[5],L=s[9],U=s[13],O=s[2],W=s[6],k=s[10],Z=s[14],H=s[3],ie=s[7],ee=s[11],X=s[15];return r[0]=o*w+a*_+l*O+u*H,r[4]=o*T+a*C+l*W+u*ie,r[8]=o*A+a*L+l*k+u*ee,r[12]=o*x+a*U+l*Z+u*X,r[1]=h*w+d*_+c*O+p*H,r[5]=h*T+d*C+c*W+p*ie,r[9]=h*A+d*L+c*k+p*ee,r[13]=h*x+d*U+c*Z+p*X,r[2]=g*w+y*_+m*O+f*H,r[6]=g*T+y*C+m*W+f*ie,r[10]=g*A+y*L+m*k+f*ee,r[14]=g*x+y*U+m*Z+f*X,r[3]=b*w+S*_+v*O+I*H,r[7]=b*T+S*C+v*W+I*ie,r[11]=b*A+S*L+v*k+I*ee,r[15]=b*x+S*U+v*Z+I*X,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],u=e[13],h=e[2],d=e[6],c=e[10],p=e[14],g=e[3],y=e[7],m=e[11],f=e[15];return g*(+r*l*d-s*u*d-r*a*c+n*u*c+s*a*p-n*l*p)+y*(+t*l*p-t*u*c+r*o*c-s*o*p+s*u*h-r*l*h)+m*(+t*u*d-t*a*p-r*o*d+n*o*p+r*a*h-n*u*h)+f*(-s*a*h-t*l*d+t*a*c+s*o*d-n*o*c+n*l*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],u=e[7],h=e[8],d=e[9],c=e[10],p=e[11],g=e[12],y=e[13],m=e[14],f=e[15],b=d*m*u-y*c*u+y*l*p-a*m*p-d*l*f+a*c*f,S=g*c*u-h*m*u-g*l*p+o*m*p+h*l*f-o*c*f,v=h*y*u-g*d*u+g*a*p-o*y*p-h*a*f+o*d*f,I=g*d*l-h*y*l-g*a*c+o*y*c+h*a*m-o*d*m,w=t*b+n*S+s*v+r*I;if(w===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let T=1/w;return e[0]=b*T,e[1]=(y*c*r-d*m*r-y*s*p+n*m*p+d*s*f-n*c*f)*T,e[2]=(a*m*r-y*l*r+y*s*u-n*m*u-a*s*f+n*l*f)*T,e[3]=(d*l*r-a*c*r-d*s*u+n*c*u+a*s*p-n*l*p)*T,e[4]=S*T,e[5]=(h*m*r-g*c*r+g*s*p-t*m*p-h*s*f+t*c*f)*T,e[6]=(g*l*r-o*m*r-g*s*u+t*m*u+o*s*f-t*l*f)*T,e[7]=(o*c*r-h*l*r+h*s*u-t*c*u-o*s*p+t*l*p)*T,e[8]=v*T,e[9]=(g*d*r-h*y*r-g*n*p+t*y*p+h*n*f-t*d*f)*T,e[10]=(o*y*r-g*a*r+g*n*u-t*y*u-o*n*f+t*a*f)*T,e[11]=(h*a*r-o*d*r-h*n*u+t*d*u+o*n*p-t*a*p)*T,e[12]=I*T,e[13]=(h*y*s-g*d*s+g*n*c-t*y*c-h*n*m+t*d*m)*T,e[14]=(g*a*s-o*y*s-g*n*l+t*y*l+o*n*m-t*a*m)*T,e[15]=(o*d*s-h*a*s+h*n*l-t*d*l-o*n*c+t*a*c)*T,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,u=r*o,h=r*a;return this.set(u*o+n,u*a-s*l,u*l+s*a,0,u*a+s*l,h*a+n,h*l-s*o,0,u*l-s*a,h*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,u=r+r,h=o+o,d=a+a,c=r*u,p=r*h,g=r*d,y=o*h,m=o*d,f=a*d,b=l*u,S=l*h,v=l*d,I=n.x,w=n.y,T=n.z;return s[0]=(1-(y+f))*I,s[1]=(p+v)*I,s[2]=(g-S)*I,s[3]=0,s[4]=(p-v)*w,s[5]=(1-(c+f))*w,s[6]=(m+b)*w,s[7]=0,s[8]=(g+S)*T,s[9]=(m-b)*T,s[10]=(1-(c+y))*T,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements,r=Mi.set(s[0],s[1],s[2]).length(),o=Mi.set(s[4],s[5],s[6]).length(),a=Mi.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],$t.copy(this);let u=1/r,h=1/o,d=1/a;return $t.elements[0]*=u,$t.elements[1]*=u,$t.elements[2]*=u,$t.elements[4]*=h,$t.elements[5]*=h,$t.elements[6]*=h,$t.elements[8]*=d,$t.elements[9]*=d,$t.elements[10]*=d,t.setFromRotationMatrix($t),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,s,r,o,a=yn){let l=this.elements,u=2*r/(t-e),h=2*r/(n-s),d=(t+e)/(t-e),c=(n+s)/(n-s),p,g;if(a===yn)p=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===pr)p=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=h,l[9]=c,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=yn){let l=this.elements,u=1/(t-e),h=1/(n-s),d=1/(o-r),c=(t+e)*u,p=(n+s)*h,g,y;if(a===yn)g=(o+r)*d,y=-2*d;else if(a===pr)g=r*d,y=-1*d;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*u,l[4]=0,l[8]=0,l[12]=-c,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=y,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Mi=new P,$t=new Le,Xu=new P(0,0,0),qu=new P(1,1,1),Pn=new P,Vs=new P,Ft=new P,jl=new Le,Ql=new Gt,Wt=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],u=s[5],h=s[9],d=s[2],c=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(Dt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(c,u),this._z=0);break;case"YXZ":this._x=Math.asin(-Dt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,u)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Dt(c,-1,1)),Math.abs(c)<.9999999?(this._y=Math.atan2(-d,p),this._z=Math.atan2(-o,u)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Dt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(c,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,u));break;case"YZX":this._z=Math.asin(Dt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,u),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-Dt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(c,u),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return jl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(jl,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ql.setFromEuler(this),this.setFromQuaternion(Ql,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Wt.DEFAULT_ORDER="XYZ";var bs=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Yu=0,ec=new P,Si=new Gt,pn=new Le,Gs=new P,ls=new P,Zu=new P,$u=new Gt,tc=new P(1,0,0),nc=new P(0,1,0),ic=new P(0,0,1),sc={type:"added"},Ju={type:"removed"},Ei={type:"childadded",child:null},co={type:"childremoved",child:null},Rt=class i extends Hn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Yu++}),this.uuid=On(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new P,t=new Wt,n=new Gt,s=new P(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Le},normalMatrix:{value:new ze}}),this.matrix=new Le,this.matrixWorld=new Le,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new bs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Si.setFromAxisAngle(e,t),this.quaternion.multiply(Si),this}rotateOnWorldAxis(e,t){return Si.setFromAxisAngle(e,t),this.quaternion.premultiply(Si),this}rotateX(e){return this.rotateOnAxis(tc,e)}rotateY(e){return this.rotateOnAxis(nc,e)}rotateZ(e){return this.rotateOnAxis(ic,e)}translateOnAxis(e,t){return ec.copy(e).applyQuaternion(this.quaternion),this.position.add(ec.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(tc,e)}translateY(e){return this.translateOnAxis(nc,e)}translateZ(e){return this.translateOnAxis(ic,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(pn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Gs.copy(e):Gs.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),ls.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?pn.lookAt(ls,Gs,this.up):pn.lookAt(Gs,ls,this.up),this.quaternion.setFromRotationMatrix(pn),s&&(pn.extractRotation(s.matrixWorld),Si.setFromRotationMatrix(pn),this.quaternion.premultiply(Si.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(sc),Ei.child=e,this.dispatchEvent(Ei),Ei.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Ju),co.child=e,this.dispatchEvent(co),co.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),pn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),pn.multiply(e.parent.matrixWorld)),e.applyMatrix4(pn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(sc),Ei.child=e,this.dispatchEvent(Ei),Ei.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ls,e,Zu),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ls,$u,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let u=0,h=l.length;u<h;u++){let d=l[u];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,u=this.material.length;l<u;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),u=o(e.textures),h=o(e.images),d=o(e.shapes),c=o(e.skeletons),p=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),u.length>0&&(n.textures=u),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),c.length>0&&(n.skeletons=c),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){let l=[];for(let u in a){let h=a[u];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}};Rt.DEFAULT_UP=new P(0,1,0);Rt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Rt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Jt=new P,mn=new P,ho=new P,gn=new P,wi=new P,Ti=new P,rc=new P,uo=new P,fo=new P,po=new P,mo=new nt,go=new nt,xo=new nt,Nn=class i{constructor(e=new P,t=new P,n=new P){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Jt.subVectors(e,t),s.cross(Jt);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Jt.subVectors(s,t),mn.subVectors(n,t),ho.subVectors(e,t);let o=Jt.dot(Jt),a=Jt.dot(mn),l=Jt.dot(ho),u=mn.dot(mn),h=mn.dot(ho),d=o*u-a*a;if(d===0)return r.set(0,0,0),null;let c=1/d,p=(u*l-a*h)*c,g=(o*h-a*l)*c;return r.set(1-p-g,g,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,gn)===null?!1:gn.x>=0&&gn.y>=0&&gn.x+gn.y<=1}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,gn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,gn.x),l.addScaledVector(o,gn.y),l.addScaledVector(a,gn.z),l)}static getInterpolatedAttribute(e,t,n,s,r,o){return mo.setScalar(0),go.setScalar(0),xo.setScalar(0),mo.fromBufferAttribute(e,t),go.fromBufferAttribute(e,n),xo.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(mo,r.x),o.addScaledVector(go,r.y),o.addScaledVector(xo,r.z),o}static isFrontFacing(e,t,n,s){return Jt.subVectors(n,t),mn.subVectors(e,t),Jt.cross(mn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Jt.subVectors(this.c,this.b),mn.subVectors(this.a,this.b),Jt.cross(mn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,o,a;wi.subVectors(s,n),Ti.subVectors(r,n),uo.subVectors(e,n);let l=wi.dot(uo),u=Ti.dot(uo);if(l<=0&&u<=0)return t.copy(n);fo.subVectors(e,s);let h=wi.dot(fo),d=Ti.dot(fo);if(h>=0&&d<=h)return t.copy(s);let c=l*d-h*u;if(c<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(n).addScaledVector(wi,o);po.subVectors(e,r);let p=wi.dot(po),g=Ti.dot(po);if(g>=0&&p<=g)return t.copy(r);let y=p*u-l*g;if(y<=0&&u>=0&&g<=0)return a=u/(u-g),t.copy(n).addScaledVector(Ti,a);let m=h*g-p*d;if(m<=0&&d-h>=0&&p-g>=0)return rc.subVectors(r,s),a=(d-h)/(d-h+(p-g)),t.copy(s).addScaledVector(rc,a);let f=1/(m+y+c);return o=y*f,a=c*f,t.copy(n).addScaledVector(wi,o).addScaledVector(Ti,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},oh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ln={h:0,s:0,l:0},Ws={h:0,s:0,l:0};function _o(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Ce=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=_t){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ze.toWorkingColorSpace(this,t),this}setRGB(e,t,n,s=Ze.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ze.toWorkingColorSpace(this,s),this}setHSL(e,t,n,s=Ze.workingColorSpace){if(e=zu(e,1),t=Dt(t,0,1),n=Dt(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=_o(o,r,e+1/3),this.g=_o(o,r,e),this.b=_o(o,r,e-1/3)}return Ze.toWorkingColorSpace(this,s),this}setStyle(e,t=_t){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=_t){let n=oh[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=vn(e.r),this.g=vn(e.g),this.b=vn(e.b),this}copyLinearToSRGB(e){return this.r=Bi(e.r),this.g=Bi(e.g),this.b=Bi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=_t){return Ze.fromWorkingColorSpace(wt.copy(this),e),Math.round(Dt(wt.r*255,0,255))*65536+Math.round(Dt(wt.g*255,0,255))*256+Math.round(Dt(wt.b*255,0,255))}getHexString(e=_t){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ze.workingColorSpace){Ze.fromWorkingColorSpace(wt.copy(this),t);let n=wt.r,s=wt.g,r=wt.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,u,h=(a+o)/2;if(a===o)l=0,u=0;else{let d=o-a;switch(u=h<=.5?d/(o+a):d/(2-o-a),o){case n:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-n)/d+2;break;case r:l=(n-s)/d+4;break}l/=6}return e.h=l,e.s=u,e.l=h,e}getRGB(e,t=Ze.workingColorSpace){return Ze.fromWorkingColorSpace(wt.copy(this),t),e.r=wt.r,e.g=wt.g,e.b=wt.b,e}getStyle(e=_t){Ze.fromWorkingColorSpace(wt.copy(this),e);let t=wt.r,n=wt.g,s=wt.b;return e!==_t?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Ln),this.setHSL(Ln.h+e,Ln.s+t,Ln.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Ln),e.getHSL(Ws);let n=eo(Ln.h,Ws.h,t),s=eo(Ln.s,Ws.s,t),r=eo(Ln.l,Ws.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},wt=new Ce;Ce.NAMES=oh;var Ku=0,Vn=class extends Hn{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ku++}),this.uuid=On(),this.name="",this.blending=zi,this.side=Bn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Po,this.blendDst=Lo,this.blendEquation=ni,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ce(0,0,0),this.blendAlpha=0,this.depthFunc=Vi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Gl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=xi,this.stencilZFail=xi,this.stencilZPass=xi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==zi&&(n.blending=this.blending),this.side!==Bn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Po&&(n.blendSrc=this.blendSrc),this.blendDst!==Lo&&(n.blendDst=this.blendDst),this.blendEquation!==ni&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Vi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Gl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==xi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==xi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==xi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},Qt=class extends Vn{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new Ce(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wt,this.combine=$a,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var gt=new P,Xs=new Ee,xt=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=ga,this.updateRanges=[],this.gpuType=an,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Xs.fromBufferAttribute(this,t),Xs.applyMatrix3(e),this.setXY(t,Xs.x,Xs.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)gt.fromBufferAttribute(this,t),gt.applyMatrix3(e),this.setXYZ(t,gt.x,gt.y,gt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)gt.fromBufferAttribute(this,t),gt.applyMatrix4(e),this.setXYZ(t,gt.x,gt.y,gt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)gt.fromBufferAttribute(this,t),gt.applyNormalMatrix(e),this.setXYZ(t,gt.x,gt.y,gt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)gt.fromBufferAttribute(this,t),gt.transformDirection(e),this.setXYZ(t,gt.x,gt.y,gt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=rn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=tt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=rn(t,this.array)),t}setX(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=rn(t,this.array)),t}setY(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=rn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=rn(t,this.array)),t}setW(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),s=tt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),s=tt(s,this.array),r=tt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==ga&&(e.usage=this.usage),e}};var _r=class extends xt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var yr=class extends xt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var He=class extends xt{constructor(e,t,n){super(new Float32Array(e),t,n)}},ju=0,Vt=new Le,yo=new Rt,Ai=new P,zt=new Sn,cs=new Sn,bt=new P,pt=class i extends Hn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ju++}),this.uuid=On(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(rh(e)?yr:_r)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new ze().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Vt.makeRotationFromQuaternion(e),this.applyMatrix4(Vt),this}rotateX(e){return Vt.makeRotationX(e),this.applyMatrix4(Vt),this}rotateY(e){return Vt.makeRotationY(e),this.applyMatrix4(Vt),this}rotateZ(e){return Vt.makeRotationZ(e),this.applyMatrix4(Vt),this}translate(e,t,n){return Vt.makeTranslation(e,t,n),this.applyMatrix4(Vt),this}scale(e,t,n){return Vt.makeScale(e,t,n),this.applyMatrix4(Vt),this}lookAt(e){return yo.lookAt(e),yo.updateMatrix(),this.applyMatrix4(yo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ai).negate(),this.translate(Ai.x,Ai.y,Ai.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new He(n,3))}else{for(let n=0,s=t.count;n<s;n++){let r=e[n];t.setXYZ(n,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Sn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];zt.setFromBufferAttribute(r),this.morphTargetsRelative?(bt.addVectors(this.boundingBox.min,zt.min),this.boundingBox.expandByPoint(bt),bt.addVectors(this.boundingBox.max,zt.max),this.boundingBox.expandByPoint(bt)):(this.boundingBox.expandByPoint(zt.min),this.boundingBox.expandByPoint(zt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ai);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(e){let n=this.boundingSphere.center;if(zt.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];cs.setFromBufferAttribute(a),this.morphTargetsRelative?(bt.addVectors(zt.min,cs.min),zt.expandByPoint(bt),bt.addVectors(zt.max,cs.max),zt.expandByPoint(bt)):(zt.expandByPoint(cs.min),zt.expandByPoint(cs.max))}zt.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)bt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(bt));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let u=0,h=a.count;u<h;u++)bt.fromBufferAttribute(a,u),l&&(Ai.fromBufferAttribute(e,u),bt.add(Ai)),s=Math.max(s,n.distanceToSquared(bt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new xt(new Float32Array(4*n.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let A=0;A<n.count;A++)a[A]=new P,l[A]=new P;let u=new P,h=new P,d=new P,c=new Ee,p=new Ee,g=new Ee,y=new P,m=new P;function f(A,x,_){u.fromBufferAttribute(n,A),h.fromBufferAttribute(n,x),d.fromBufferAttribute(n,_),c.fromBufferAttribute(r,A),p.fromBufferAttribute(r,x),g.fromBufferAttribute(r,_),h.sub(u),d.sub(u),p.sub(c),g.sub(c);let C=1/(p.x*g.y-g.x*p.y);isFinite(C)&&(y.copy(h).multiplyScalar(g.y).addScaledVector(d,-p.y).multiplyScalar(C),m.copy(d).multiplyScalar(p.x).addScaledVector(h,-g.x).multiplyScalar(C),a[A].add(y),a[x].add(y),a[_].add(y),l[A].add(m),l[x].add(m),l[_].add(m))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let A=0,x=b.length;A<x;++A){let _=b[A],C=_.start,L=_.count;for(let U=C,O=C+L;U<O;U+=3)f(e.getX(U+0),e.getX(U+1),e.getX(U+2))}let S=new P,v=new P,I=new P,w=new P;function T(A){I.fromBufferAttribute(s,A),w.copy(I);let x=a[A];S.copy(x),S.sub(I.multiplyScalar(I.dot(x))).normalize(),v.crossVectors(w,x);let C=v.dot(l[A])<0?-1:1;o.setXYZW(A,S.x,S.y,S.z,C)}for(let A=0,x=b.length;A<x;++A){let _=b[A],C=_.start,L=_.count;for(let U=C,O=C+L;U<O;U+=3)T(e.getX(U+0)),T(e.getX(U+1)),T(e.getX(U+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new xt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let c=0,p=n.count;c<p;c++)n.setXYZ(c,0,0,0);let s=new P,r=new P,o=new P,a=new P,l=new P,u=new P,h=new P,d=new P;if(e)for(let c=0,p=e.count;c<p;c+=3){let g=e.getX(c+0),y=e.getX(c+1),m=e.getX(c+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,y),o.fromBufferAttribute(t,m),h.subVectors(o,r),d.subVectors(s,r),h.cross(d),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,y),u.fromBufferAttribute(n,m),a.add(h),l.add(h),u.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(y,l.x,l.y,l.z),n.setXYZ(m,u.x,u.y,u.z)}else for(let c=0,p=t.count;c<p;c+=3)s.fromBufferAttribute(t,c+0),r.fromBufferAttribute(t,c+1),o.fromBufferAttribute(t,c+2),h.subVectors(o,r),d.subVectors(s,r),h.cross(d),n.setXYZ(c+0,h.x,h.y,h.z),n.setXYZ(c+1,h.x,h.y,h.z),n.setXYZ(c+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)bt.fromBufferAttribute(e,t),bt.normalize(),e.setXYZ(t,bt.x,bt.y,bt.z)}toNonIndexed(){function e(a,l){let u=a.array,h=a.itemSize,d=a.normalized,c=new u.constructor(l.length*h),p=0,g=0;for(let y=0,m=l.length;y<m;y++){a.isInterleavedBufferAttribute?p=l[y]*a.data.stride+a.offset:p=l[y]*h;for(let f=0;f<h;f++)c[g++]=u[p++]}return new xt(c,h,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],u=e(l,n);t.setAttribute(a,u)}let r=this.morphAttributes;for(let a in r){let l=[],u=r[a];for(let h=0,d=u.length;h<d;h++){let c=u[h],p=e(c,n);l.push(p)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let u=o[a];t.addGroup(u.start,u.count,u.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let u in l)l[u]!==void 0&&(e[u]=l[u]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let u=n[l];e.data.attributes[l]=u.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let u=this.morphAttributes[l],h=[];for(let d=0,c=u.length;d<c;d++){let p=u[d];h.push(p.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone(t));let s=e.attributes;for(let u in s){let h=s[u];this.setAttribute(u,h.clone(t))}let r=e.morphAttributes;for(let u in r){let h=[],d=r[u];for(let c=0,p=d.length;c<p;c++)h.push(d[c].clone(t));this.morphAttributes[u]=h}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let u=0,h=o.length;u<h;u++){let d=o[u];this.addGroup(d.start,d.count,d.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},oc=new Le,Kn=new xr,qs=new ai,ac=new P,Ys=new P,Zs=new P,$s=new P,vo=new P,Js=new P,lc=new P,Ks=new P,it=class extends Rt{constructor(e=new pt,t=new Qt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){Js.set(0,0,0);for(let l=0,u=r.length;l<u;l++){let h=a[l],d=r[l];h!==0&&(vo.fromBufferAttribute(d,e),o?Js.addScaledVector(vo,h):Js.addScaledVector(vo.sub(t),h))}t.add(Js)}return t}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),qs.copy(n.boundingSphere),qs.applyMatrix4(r),Kn.copy(e.ray).recast(e.near),!(qs.containsPoint(Kn.origin)===!1&&(Kn.intersectSphere(qs,ac)===null||Kn.origin.distanceToSquared(ac)>(e.far-e.near)**2))&&(oc.copy(r).invert(),Kn.copy(e.ray).applyMatrix4(oc),!(n.boundingBox!==null&&Kn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Kn)))}_computeIntersections(e,t,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,u=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,c=r.groups,p=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,y=c.length;g<y;g++){let m=c[g],f=o[m.materialIndex],b=Math.max(m.start,p.start),S=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let v=b,I=S;v<I;v+=3){let w=a.getX(v),T=a.getX(v+1),A=a.getX(v+2);s=js(this,f,e,n,u,h,d,w,T,A),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),y=Math.min(a.count,p.start+p.count);for(let m=g,f=y;m<f;m+=3){let b=a.getX(m),S=a.getX(m+1),v=a.getX(m+2);s=js(this,o,e,n,u,h,d,b,S,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,y=c.length;g<y;g++){let m=c[g],f=o[m.materialIndex],b=Math.max(m.start,p.start),S=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let v=b,I=S;v<I;v+=3){let w=v,T=v+1,A=v+2;s=js(this,f,e,n,u,h,d,w,T,A),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),y=Math.min(l.count,p.start+p.count);for(let m=g,f=y;m<f;m+=3){let b=m,S=m+1,v=m+2;s=js(this,o,e,n,u,h,d,b,S,v),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function Qu(i,e,t,n,s,r,o,a){let l;if(e.side===Ut?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===Bn,a),l===null)return null;Ks.copy(a),Ks.applyMatrix4(i.matrixWorld);let u=t.ray.origin.distanceTo(Ks);return u<t.near||u>t.far?null:{distance:u,point:Ks.clone(),object:i}}function js(i,e,t,n,s,r,o,a,l,u){i.getVertexPosition(a,Ys),i.getVertexPosition(l,Zs),i.getVertexPosition(u,$s);let h=Qu(i,e,t,n,Ys,Zs,$s,lc);if(h){let d=new P;Nn.getBarycoord(lc,Ys,Zs,$s,d),s&&(h.uv=Nn.getInterpolatedAttribute(s,a,l,u,d,new Ee)),r&&(h.uv1=Nn.getInterpolatedAttribute(r,a,l,u,d,new Ee)),o&&(h.normal=Nn.getInterpolatedAttribute(o,a,l,u,d,new P),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let c={a,b:l,c:u,normal:new P,materialIndex:0};Nn.getNormal(Ys,Zs,$s,c.normal),h.face=c,h.barycoord=d}return h}var mt=class i extends pt{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],u=[],h=[],d=[],c=0,p=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,s,o,2),g("x","z","y",1,-1,e,n,-t,s,o,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new He(u,3)),this.setAttribute("normal",new He(h,3)),this.setAttribute("uv",new He(d,2));function g(y,m,f,b,S,v,I,w,T,A,x){let _=v/T,C=I/A,L=v/2,U=I/2,O=w/2,W=T+1,k=A+1,Z=0,H=0,ie=new P;for(let ee=0;ee<k;ee++){let X=ee*C-U;for(let le=0;le<W;le++){let De=le*_-L;ie[y]=De*b,ie[m]=X*S,ie[f]=O,u.push(ie.x,ie.y,ie.z),ie[y]=0,ie[m]=0,ie[f]=w>0?1:-1,h.push(ie.x,ie.y,ie.z),d.push(le/T),d.push(1-ee/A),Z+=1}}for(let ee=0;ee<A;ee++)for(let X=0;X<T;X++){let le=c+X+W*ee,De=c+X+W*(ee+1),Y=c+(X+1)+W*(ee+1),Q=c+(X+1)+W*ee;l.push(le,De,Q),l.push(De,Y,Q),H+=6}a.addGroup(p,H,x),p+=H,c+=Z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function Yi(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function It(i){let e={};for(let t=0;t<i.length;t++){let n=Yi(i[t]);for(let s in n)e[s]=n[s]}return e}function ef(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function ah(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ze.workingColorSpace}var tf={clone:Yi,merge:It},nf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,sf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Bt=class extends Vn{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=nf,this.fragmentShader=sf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Yi(e.uniforms),this.uniformsGroups=ef(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},vr=class extends Rt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Le,this.projectionMatrix=new Le,this.projectionMatrixInverse=new Le,this.coordinateSystem=yn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Dn=new P,cc=new Ee,hc=new Ee,Tt=class extends vr{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=xa*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Qr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return xa*2*Math.atan(Math.tan(Qr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Dn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Dn.x,Dn.y).multiplyScalar(-e/Dn.z),Dn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Dn.x,Dn.y).multiplyScalar(-e/Dn.z)}getViewSize(e,t){return this.getViewBounds(e,cc,hc),t.subVectors(hc,cc)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Qr*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,u=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/u,s*=o.width/l,n*=o.height/u}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Ri=-90,Ci=1,ba=class extends Rt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Tt(Ri,Ci,e,t);s.layers=this.layers,this.add(s);let r=new Tt(Ri,Ci,e,t);r.layers=this.layers,this.add(r);let o=new Tt(Ri,Ci,e,t);o.layers=this.layers,this.add(o);let a=new Tt(Ri,Ci,e,t);a.layers=this.layers,this.add(a);let l=new Tt(Ri,Ci,e,t);l.layers=this.layers,this.add(l);let u=new Tt(Ri,Ci,e,t);u.layers=this.layers,this.add(u)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(let u of t)this.remove(u);if(e===yn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===pr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let u of t)this.add(u),u.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,u,h]=this.children,d=e.getRenderTarget(),c=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,o),e.setRenderTarget(n,2,s),e.render(t,a),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,u),n.texture.generateMipmaps=y,e.setRenderTarget(n,5,s),e.render(t,h),e.setRenderTarget(d,c,p),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},br=class extends Pt{constructor(e,t,n,s,r,o,a,l,u,h){e=e!==void 0?e:[],t=t!==void 0?t:Gi,super(e,t,n,s,r,o,a,l,u,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ma=class extends Mn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new br(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:on}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new mt(5,5,5),r=new Bt({name:"CubemapFromEquirect",uniforms:Yi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ut,blending:Fn});r.uniforms.tEquirect.value=t;let o=new it(s,r),a=t.minFilter;return t.minFilter===ri&&(t.minFilter=on),new ba(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,n,s){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}},bo=new P,rf=new P,of=new ze,_n=class{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=bo.subVectors(n,t).cross(rf.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(bo),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||of.getNormalMatrix(e),s=this.coplanarPoint(bo).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},jn=new ai,Qs=new P,Ms=class{constructor(e=new _n,t=new _n,n=new _n,s=new _n,r=new _n,o=new _n){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=yn){let n=this.planes,s=e.elements,r=s[0],o=s[1],a=s[2],l=s[3],u=s[4],h=s[5],d=s[6],c=s[7],p=s[8],g=s[9],y=s[10],m=s[11],f=s[12],b=s[13],S=s[14],v=s[15];if(n[0].setComponents(l-r,c-u,m-p,v-f).normalize(),n[1].setComponents(l+r,c+u,m+p,v+f).normalize(),n[2].setComponents(l+o,c+h,m+g,v+b).normalize(),n[3].setComponents(l-o,c-h,m-g,v-b).normalize(),n[4].setComponents(l-a,c-d,m-y,v-S).normalize(),t===yn)n[5].setComponents(l+a,c+d,m+y,v+S).normalize();else if(t===pr)n[5].setComponents(a,d,y,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),jn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),jn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(jn)}intersectsSprite(e){return jn.center.set(0,0,0),jn.radius=.7071067811865476,jn.applyMatrix4(e.matrixWorld),this.intersectsSphere(jn)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Qs.x=s.normal.x>0?e.max.x:e.min.x,Qs.y=s.normal.y>0?e.max.y:e.min.y,Qs.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Qs)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function lh(){let i=null,e=!1,t=null,n=null;function s(r,o){t(r,o),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function af(i){let e=new WeakMap;function t(a,l){let u=a.array,h=a.usage,d=u.byteLength,c=i.createBuffer();i.bindBuffer(l,c),i.bufferData(l,u,h),a.onUploadCallback();let p;if(u instanceof Float32Array)p=i.FLOAT;else if(u instanceof Uint16Array)a.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(u instanceof Int16Array)p=i.SHORT;else if(u instanceof Uint32Array)p=i.UNSIGNED_INT;else if(u instanceof Int32Array)p=i.INT;else if(u instanceof Int8Array)p=i.BYTE;else if(u instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:c,type:p,bytesPerElement:u.BYTES_PER_ELEMENT,version:a.version,size:d}}function n(a,l,u){let h=l.array,d=l.updateRanges;if(i.bindBuffer(u,a),d.length===0)i.bufferSubData(u,0,h);else{d.sort((p,g)=>p.start-g.start);let c=0;for(let p=1;p<d.length;p++){let g=d[c],y=d[p];y.start<=g.start+g.count+1?g.count=Math.max(g.count,y.start+y.count-g.start):(++c,d[c]=y)}d.length=c+1;for(let p=0,g=d.length;p<g;p++){let y=d[p];i.bufferSubData(u,y.start*h.BYTES_PER_ELEMENT,h,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let u=e.get(a);if(u===void 0)e.set(a,t(a,l));else if(u.version<a.version){if(u.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(u.buffer,a,l),u.version=a.version}}return{get:s,remove:r,update:o}}var Zi=class i extends pt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),u=a+1,h=l+1,d=e/a,c=t/l,p=[],g=[],y=[],m=[];for(let f=0;f<h;f++){let b=f*c-o;for(let S=0;S<u;S++){let v=S*d-r;g.push(v,-b,0),y.push(0,0,1),m.push(S/a),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let b=0;b<a;b++){let S=b+u*f,v=b+u*(f+1),I=b+1+u*(f+1),w=b+1+u*f;p.push(S,v,w),p.push(v,I,w)}this.setIndex(p),this.setAttribute("position",new He(g,3)),this.setAttribute("normal",new He(y,3)),this.setAttribute("uv",new He(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},lf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,cf=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,hf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,uf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ff=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,df=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,pf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,mf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,gf=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,xf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,_f=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,yf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,vf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,bf=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Mf=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Sf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Ef=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,wf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Tf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Af=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Rf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Cf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,If=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Pf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Lf=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Df=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Uf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Nf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Ff=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,zf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Of="gl_FragColor = linearToOutputTexel( gl_FragColor );",Bf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,kf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Hf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Vf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Gf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Wf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Xf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,qf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Yf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Zf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,$f=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Jf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Kf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,jf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Qf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,ed=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,td=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,nd=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,id=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,sd=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,rd=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,od=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,ad=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,ld=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,cd=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,hd=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,ud=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,fd=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,dd=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,pd=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,md=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,gd=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,xd=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,_d=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,yd=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,vd=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,bd=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Md=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Sd=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Ed=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,wd=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Td=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Ad=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Rd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Cd=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Id=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Pd=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Ld=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Dd=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Ud=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Nd=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Fd=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,zd=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Od=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Bd=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,kd=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Hd=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Vd=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Gd=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Wd=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Xd=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,qd=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Yd=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Zd=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,$d=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Jd=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Kd=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,jd=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Qd=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,ep=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,tp=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,np=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,ip=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,sp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,rp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,op=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,ap=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,lp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,hp=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,up=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,fp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,dp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,pp=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,mp=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,gp=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,xp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,_p=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,yp=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,vp=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,bp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Mp=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Sp=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ep=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wp=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Tp=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ap=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Rp=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Cp=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ip=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Pp=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Lp=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Dp=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Up=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Np=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Fp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,zp=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Op=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Bp=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,kp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Be={alphahash_fragment:lf,alphahash_pars_fragment:cf,alphamap_fragment:hf,alphamap_pars_fragment:uf,alphatest_fragment:ff,alphatest_pars_fragment:df,aomap_fragment:pf,aomap_pars_fragment:mf,batching_pars_vertex:gf,batching_vertex:xf,begin_vertex:_f,beginnormal_vertex:yf,bsdfs:vf,iridescence_fragment:bf,bumpmap_pars_fragment:Mf,clipping_planes_fragment:Sf,clipping_planes_pars_fragment:Ef,clipping_planes_pars_vertex:wf,clipping_planes_vertex:Tf,color_fragment:Af,color_pars_fragment:Rf,color_pars_vertex:Cf,color_vertex:If,common:Pf,cube_uv_reflection_fragment:Lf,defaultnormal_vertex:Df,displacementmap_pars_vertex:Uf,displacementmap_vertex:Nf,emissivemap_fragment:Ff,emissivemap_pars_fragment:zf,colorspace_fragment:Of,colorspace_pars_fragment:Bf,envmap_fragment:kf,envmap_common_pars_fragment:Hf,envmap_pars_fragment:Vf,envmap_pars_vertex:Gf,envmap_physical_pars_fragment:ed,envmap_vertex:Wf,fog_vertex:Xf,fog_pars_vertex:qf,fog_fragment:Yf,fog_pars_fragment:Zf,gradientmap_pars_fragment:$f,lightmap_pars_fragment:Jf,lights_lambert_fragment:Kf,lights_lambert_pars_fragment:jf,lights_pars_begin:Qf,lights_toon_fragment:td,lights_toon_pars_fragment:nd,lights_phong_fragment:id,lights_phong_pars_fragment:sd,lights_physical_fragment:rd,lights_physical_pars_fragment:od,lights_fragment_begin:ad,lights_fragment_maps:ld,lights_fragment_end:cd,logdepthbuf_fragment:hd,logdepthbuf_pars_fragment:ud,logdepthbuf_pars_vertex:fd,logdepthbuf_vertex:dd,map_fragment:pd,map_pars_fragment:md,map_particle_fragment:gd,map_particle_pars_fragment:xd,metalnessmap_fragment:_d,metalnessmap_pars_fragment:yd,morphinstance_vertex:vd,morphcolor_vertex:bd,morphnormal_vertex:Md,morphtarget_pars_vertex:Sd,morphtarget_vertex:Ed,normal_fragment_begin:wd,normal_fragment_maps:Td,normal_pars_fragment:Ad,normal_pars_vertex:Rd,normal_vertex:Cd,normalmap_pars_fragment:Id,clearcoat_normal_fragment_begin:Pd,clearcoat_normal_fragment_maps:Ld,clearcoat_pars_fragment:Dd,iridescence_pars_fragment:Ud,opaque_fragment:Nd,packing:Fd,premultiplied_alpha_fragment:zd,project_vertex:Od,dithering_fragment:Bd,dithering_pars_fragment:kd,roughnessmap_fragment:Hd,roughnessmap_pars_fragment:Vd,shadowmap_pars_fragment:Gd,shadowmap_pars_vertex:Wd,shadowmap_vertex:Xd,shadowmask_pars_fragment:qd,skinbase_vertex:Yd,skinning_pars_vertex:Zd,skinning_vertex:$d,skinnormal_vertex:Jd,specularmap_fragment:Kd,specularmap_pars_fragment:jd,tonemapping_fragment:Qd,tonemapping_pars_fragment:ep,transmission_fragment:tp,transmission_pars_fragment:np,uv_pars_fragment:ip,uv_pars_vertex:sp,uv_vertex:rp,worldpos_vertex:op,background_vert:ap,background_frag:lp,backgroundCube_vert:cp,backgroundCube_frag:hp,cube_vert:up,cube_frag:fp,depth_vert:dp,depth_frag:pp,distanceRGBA_vert:mp,distanceRGBA_frag:gp,equirect_vert:xp,equirect_frag:_p,linedashed_vert:yp,linedashed_frag:vp,meshbasic_vert:bp,meshbasic_frag:Mp,meshlambert_vert:Sp,meshlambert_frag:Ep,meshmatcap_vert:wp,meshmatcap_frag:Tp,meshnormal_vert:Ap,meshnormal_frag:Rp,meshphong_vert:Cp,meshphong_frag:Ip,meshphysical_vert:Pp,meshphysical_frag:Lp,meshtoon_vert:Dp,meshtoon_frag:Up,points_vert:Np,points_frag:Fp,shadow_vert:zp,shadow_frag:Op,sprite_vert:Bp,sprite_frag:kp},oe={common:{diffuse:{value:new Ce(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ze}},envmap:{envMap:{value:null},envMapRotation:{value:new ze},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ze}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ze}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ze},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ze},normalScale:{value:new Ee(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ze},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ze}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ze}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ze}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ce(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ce(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0},uvTransform:{value:new ze}},sprite:{diffuse:{value:new Ce(16777215)},opacity:{value:1},center:{value:new Ee(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ze},alphaMap:{value:null},alphaMapTransform:{value:new ze},alphaTest:{value:0}}},sn={basic:{uniforms:It([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.fog]),vertexShader:Be.meshbasic_vert,fragmentShader:Be.meshbasic_frag},lambert:{uniforms:It([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new Ce(0)}}]),vertexShader:Be.meshlambert_vert,fragmentShader:Be.meshlambert_frag},phong:{uniforms:It([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new Ce(0)},specular:{value:new Ce(1118481)},shininess:{value:30}}]),vertexShader:Be.meshphong_vert,fragmentShader:Be.meshphong_frag},standard:{uniforms:It([oe.common,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.roughnessmap,oe.metalnessmap,oe.fog,oe.lights,{emissive:{value:new Ce(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Be.meshphysical_vert,fragmentShader:Be.meshphysical_frag},toon:{uniforms:It([oe.common,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.gradientmap,oe.fog,oe.lights,{emissive:{value:new Ce(0)}}]),vertexShader:Be.meshtoon_vert,fragmentShader:Be.meshtoon_frag},matcap:{uniforms:It([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,{matcap:{value:null}}]),vertexShader:Be.meshmatcap_vert,fragmentShader:Be.meshmatcap_frag},points:{uniforms:It([oe.points,oe.fog]),vertexShader:Be.points_vert,fragmentShader:Be.points_frag},dashed:{uniforms:It([oe.common,oe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Be.linedashed_vert,fragmentShader:Be.linedashed_frag},depth:{uniforms:It([oe.common,oe.displacementmap]),vertexShader:Be.depth_vert,fragmentShader:Be.depth_frag},normal:{uniforms:It([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,{opacity:{value:1}}]),vertexShader:Be.meshnormal_vert,fragmentShader:Be.meshnormal_frag},sprite:{uniforms:It([oe.sprite,oe.fog]),vertexShader:Be.sprite_vert,fragmentShader:Be.sprite_frag},background:{uniforms:{uvTransform:{value:new ze},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Be.background_vert,fragmentShader:Be.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ze}},vertexShader:Be.backgroundCube_vert,fragmentShader:Be.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Be.cube_vert,fragmentShader:Be.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Be.equirect_vert,fragmentShader:Be.equirect_frag},distanceRGBA:{uniforms:It([oe.common,oe.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Be.distanceRGBA_vert,fragmentShader:Be.distanceRGBA_frag},shadow:{uniforms:It([oe.lights,oe.fog,{color:{value:new Ce(0)},opacity:{value:1}}]),vertexShader:Be.shadow_vert,fragmentShader:Be.shadow_frag}};sn.physical={uniforms:It([sn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ze},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ze},clearcoatNormalScale:{value:new Ee(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ze},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ze},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ze},sheen:{value:0},sheenColor:{value:new Ce(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ze},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ze},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ze},transmissionSamplerSize:{value:new Ee},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ze},attenuationDistance:{value:0},attenuationColor:{value:new Ce(0)},specularColor:{value:new Ce(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ze},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ze},anisotropyVector:{value:new Ee},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ze}}]),vertexShader:Be.meshphysical_vert,fragmentShader:Be.meshphysical_frag};var er={r:0,b:0,g:0},Qn=new Wt,Hp=new Le;function Vp(i,e,t,n,s,r,o){let a=new Ce(0),l=r===!0?0:1,u,h,d=null,c=0,p=null;function g(b){let S=b.isScene===!0?b.background:null;return S&&S.isTexture&&(S=(b.backgroundBlurriness>0?t:e).get(S)),S}function y(b){let S=!1,v=g(b);v===null?f(a,l):v&&v.isColor&&(f(v,1),S=!0);let I=i.xr.getEnvironmentBlendMode();I==="additive"?n.buffers.color.setClear(0,0,0,1,o):I==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||S)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(b,S){let v=g(S);v&&(v.isCubeTexture||v.mapping===kr)?(h===void 0&&(h=new it(new mt(1,1,1),new Bt({name:"BackgroundCubeMaterial",uniforms:Yi(sn.backgroundCube.uniforms),vertexShader:sn.backgroundCube.vertexShader,fragmentShader:sn.backgroundCube.fragmentShader,side:Ut,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(I,w,T){this.matrixWorld.copyPosition(T.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),Qn.copy(S.backgroundRotation),Qn.x*=-1,Qn.y*=-1,Qn.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(Qn.y*=-1,Qn.z*=-1),h.material.uniforms.envMap.value=v,h.material.uniforms.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Hp.makeRotationFromEuler(Qn)),h.material.toneMapped=Ze.getTransfer(v.colorSpace)!==et,(d!==v||c!==v.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,d=v,c=v.version,p=i.toneMapping),h.layers.enableAll(),b.unshift(h,h.geometry,h.material,0,0,null)):v&&v.isTexture&&(u===void 0&&(u=new it(new Zi(2,2),new Bt({name:"BackgroundMaterial",uniforms:Yi(sn.background.uniforms),vertexShader:sn.background.vertexShader,fragmentShader:sn.background.fragmentShader,side:Bn,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),Object.defineProperty(u.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(u)),u.material.uniforms.t2D.value=v,u.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,u.material.toneMapped=Ze.getTransfer(v.colorSpace)!==et,v.matrixAutoUpdate===!0&&v.updateMatrix(),u.material.uniforms.uvTransform.value.copy(v.matrix),(d!==v||c!==v.version||p!==i.toneMapping)&&(u.material.needsUpdate=!0,d=v,c=v.version,p=i.toneMapping),u.layers.enableAll(),b.unshift(u,u.geometry,u.material,0,0,null))}function f(b,S){b.getRGB(er,ah(i)),n.buffers.color.setClear(er.r,er.g,er.b,S,o)}return{getClearColor:function(){return a},setClearColor:function(b,S=1){a.set(b),l=S,f(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(b){l=b,f(a,l)},render:y,addToRenderList:m}}function Gp(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=c(null),r=s,o=!1;function a(_,C,L,U,O){let W=!1,k=d(U,L,C);r!==k&&(r=k,u(r.object)),W=p(_,U,L,O),W&&g(_,U,L,O),O!==null&&e.update(O,i.ELEMENT_ARRAY_BUFFER),(W||o)&&(o=!1,v(_,C,L,U),O!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(O).buffer))}function l(){return i.createVertexArray()}function u(_){return i.bindVertexArray(_)}function h(_){return i.deleteVertexArray(_)}function d(_,C,L){let U=L.wireframe===!0,O=n[_.id];O===void 0&&(O={},n[_.id]=O);let W=O[C.id];W===void 0&&(W={},O[C.id]=W);let k=W[U];return k===void 0&&(k=c(l()),W[U]=k),k}function c(_){let C=[],L=[],U=[];for(let O=0;O<t;O++)C[O]=0,L[O]=0,U[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:C,enabledAttributes:L,attributeDivisors:U,object:_,attributes:{},index:null}}function p(_,C,L,U){let O=r.attributes,W=C.attributes,k=0,Z=L.getAttributes();for(let H in Z)if(Z[H].location>=0){let ee=O[H],X=W[H];if(X===void 0&&(H==="instanceMatrix"&&_.instanceMatrix&&(X=_.instanceMatrix),H==="instanceColor"&&_.instanceColor&&(X=_.instanceColor)),ee===void 0||ee.attribute!==X||X&&ee.data!==X.data)return!0;k++}return r.attributesNum!==k||r.index!==U}function g(_,C,L,U){let O={},W=C.attributes,k=0,Z=L.getAttributes();for(let H in Z)if(Z[H].location>=0){let ee=W[H];ee===void 0&&(H==="instanceMatrix"&&_.instanceMatrix&&(ee=_.instanceMatrix),H==="instanceColor"&&_.instanceColor&&(ee=_.instanceColor));let X={};X.attribute=ee,ee&&ee.data&&(X.data=ee.data),O[H]=X,k++}r.attributes=O,r.attributesNum=k,r.index=U}function y(){let _=r.newAttributes;for(let C=0,L=_.length;C<L;C++)_[C]=0}function m(_){f(_,0)}function f(_,C){let L=r.newAttributes,U=r.enabledAttributes,O=r.attributeDivisors;L[_]=1,U[_]===0&&(i.enableVertexAttribArray(_),U[_]=1),O[_]!==C&&(i.vertexAttribDivisor(_,C),O[_]=C)}function b(){let _=r.newAttributes,C=r.enabledAttributes;for(let L=0,U=C.length;L<U;L++)C[L]!==_[L]&&(i.disableVertexAttribArray(L),C[L]=0)}function S(_,C,L,U,O,W,k){k===!0?i.vertexAttribIPointer(_,C,L,O,W):i.vertexAttribPointer(_,C,L,U,O,W)}function v(_,C,L,U){y();let O=U.attributes,W=L.getAttributes(),k=C.defaultAttributeValues;for(let Z in W){let H=W[Z];if(H.location>=0){let ie=O[Z];if(ie===void 0&&(Z==="instanceMatrix"&&_.instanceMatrix&&(ie=_.instanceMatrix),Z==="instanceColor"&&_.instanceColor&&(ie=_.instanceColor)),ie!==void 0){let ee=ie.normalized,X=ie.itemSize,le=e.get(ie);if(le===void 0)continue;let De=le.buffer,Y=le.type,Q=le.bytesPerElement,de=Y===i.INT||Y===i.UNSIGNED_INT||ie.gpuType===Ka;if(ie.isInterleavedBufferAttribute){let re=ie.data,ve=re.stride,Te=ie.offset;if(re.isInstancedInterleavedBuffer){for(let Ue=0;Ue<H.locationSize;Ue++)f(H.location+Ue,re.meshPerAttribute);_.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=re.meshPerAttribute*re.count)}else for(let Ue=0;Ue<H.locationSize;Ue++)m(H.location+Ue);i.bindBuffer(i.ARRAY_BUFFER,De);for(let Ue=0;Ue<H.locationSize;Ue++)S(H.location+Ue,X/H.locationSize,Y,ee,ve*Q,(Te+X/H.locationSize*Ue)*Q,de)}else{if(ie.isInstancedBufferAttribute){for(let re=0;re<H.locationSize;re++)f(H.location+re,ie.meshPerAttribute);_.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=ie.meshPerAttribute*ie.count)}else for(let re=0;re<H.locationSize;re++)m(H.location+re);i.bindBuffer(i.ARRAY_BUFFER,De);for(let re=0;re<H.locationSize;re++)S(H.location+re,X/H.locationSize,Y,ee,X*Q,X/H.locationSize*re*Q,de)}}else if(k!==void 0){let ee=k[Z];if(ee!==void 0)switch(ee.length){case 2:i.vertexAttrib2fv(H.location,ee);break;case 3:i.vertexAttrib3fv(H.location,ee);break;case 4:i.vertexAttrib4fv(H.location,ee);break;default:i.vertexAttrib1fv(H.location,ee)}}}}b()}function I(){A();for(let _ in n){let C=n[_];for(let L in C){let U=C[L];for(let O in U)h(U[O].object),delete U[O];delete C[L]}delete n[_]}}function w(_){if(n[_.id]===void 0)return;let C=n[_.id];for(let L in C){let U=C[L];for(let O in U)h(U[O].object),delete U[O];delete C[L]}delete n[_.id]}function T(_){for(let C in n){let L=n[C];if(L[_.id]===void 0)continue;let U=L[_.id];for(let O in U)h(U[O].object),delete U[O];delete L[_.id]}}function A(){x(),o=!0,r!==s&&(r=s,u(r.object))}function x(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:A,resetDefaultState:x,dispose:I,releaseStatesOfGeometry:w,releaseStatesOfProgram:T,initAttributes:y,enableAttribute:m,disableUnusedAttributes:b}}function Wp(i,e,t){let n;function s(u){n=u}function r(u,h){i.drawArrays(n,u,h),t.update(h,n,1)}function o(u,h,d){d!==0&&(i.drawArraysInstanced(n,u,h,d),t.update(h,n,d))}function a(u,h,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,u,0,h,0,d);let p=0;for(let g=0;g<d;g++)p+=h[g];t.update(p,n,1)}function l(u,h,d,c){if(d===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<u.length;g++)o(u[g],h[g],c[g]);else{p.multiDrawArraysInstancedWEBGL(n,u,0,h,0,c,0,d);let g=0;for(let y=0;y<d;y++)g+=h[y]*c[y];t.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Xp(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let T=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(T){return!(T!==jt&&n.convert(T)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(T){let A=T===Cs&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(T!==bn&&n.convert(T)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&T!==an&&!A)}function l(T){if(T==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let u=t.precision!==void 0?t.precision:"highp",h=l(u);h!==u&&(console.warn("THREE.WebGLRenderer:",u,"not supported, using",h,"instead."),u=h);let d=t.logarithmicDepthBuffer===!0,c=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),f=i.getParameter(i.MAX_VERTEX_ATTRIBS),b=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),S=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),I=g>0,w=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:u,logarithmicDepthBuffer:d,reverseDepthBuffer:c,maxTextures:p,maxVertexTextures:g,maxTextureSize:y,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:b,maxVaryings:S,maxFragmentUniforms:v,vertexTextures:I,maxSamples:w}}function qp(i){let e=this,t=null,n=0,s=!1,r=!1,o=new _n,a=new ze,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,c){let p=d.length!==0||c||n!==0||s;return s=c,n=d.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,c){t=h(d,c,0)},this.setState=function(d,c,p){let g=d.clippingPlanes,y=d.clipIntersection,m=d.clipShadows,f=i.get(d);if(!s||g===null||g.length===0||r&&!m)r?h(null):u();else{let b=r?0:n,S=b*4,v=f.clippingState||null;l.value=v,v=h(g,c,S,p);for(let I=0;I!==S;++I)v[I]=t[I];f.clippingState=v,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=b}};function u(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(d,c,p,g){let y=d!==null?d.length:0,m=null;if(y!==0){if(m=l.value,g!==!0||m===null){let f=p+y*4,b=c.matrixWorldInverse;a.getNormalMatrix(b),(m===null||m.length<f)&&(m=new Float32Array(f));for(let S=0,v=p;S!==y;++S,v+=4)o.copy(d[S]).applyMatrix4(b,a),o.normal.toArray(m,v),m[v+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,m}}function Yp(i){let e=new WeakMap;function t(o,a){return a===ko?o.mapping=Gi:a===Ho&&(o.mapping=Wi),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===ko||a===Ho)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let u=new Ma(l.height);return u.fromEquirectangularTexture(i,o),e.set(o,u),o.addEventListener("dispose",s),t(u.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}var Mr=class extends vr{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let u=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=u*this.view.offsetX,o=r+u*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Fi=4,uc=[.125,.215,.35,.446,.526,.582],ii=20,Mo=new Mr,fc=new Ce,So=null,Eo=0,wo=0,To=!1,ti=(1+Math.sqrt(5))/2,Ii=1/ti,dc=[new P(-ti,Ii,0),new P(ti,Ii,0),new P(-Ii,0,ti),new P(Ii,0,ti),new P(0,ti,-Ii),new P(0,ti,Ii),new P(-1,1,-1),new P(1,1,-1),new P(-1,1,1),new P(1,1,1)],Sr=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100){So=this._renderer.getRenderTarget(),Eo=this._renderer.getActiveCubeFace(),wo=this._renderer.getActiveMipmapLevel(),To=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,n,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=gc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=mc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(So,Eo,wo),this._renderer.xr.enabled=To,e.scissorTest=!1,tr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Gi||e.mapping===Wi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),So=this._renderer.getRenderTarget(),Eo=this._renderer.getActiveCubeFace(),wo=this._renderer.getActiveMipmapLevel(),To=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:on,minFilter:on,generateMipmaps:!1,type:Cs,format:jt,colorSpace:Ji,depthBuffer:!1},s=pc(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=pc(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Zp(r)),this._blurMaterial=$p(r,e,t)}return s}_compileMaterial(e){let t=new it(this._lodPlanes[0],e);this._renderer.compile(t,Mo)}_sceneToCubeUV(e,t,n,s){let a=new Tt(90,1,t,n),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,c=h.toneMapping;h.getClearColor(fc),h.toneMapping=zn,h.autoClear=!1;let p=new Qt({name:"PMREM.Background",side:Ut,depthWrite:!1,depthTest:!1}),g=new it(new mt,p),y=!1,m=e.background;m?m.isColor&&(p.color.copy(m),e.background=null,y=!0):(p.color.copy(fc),y=!0);for(let f=0;f<6;f++){let b=f%3;b===0?(a.up.set(0,l[f],0),a.lookAt(u[f],0,0)):b===1?(a.up.set(0,0,l[f]),a.lookAt(0,u[f],0)):(a.up.set(0,l[f],0),a.lookAt(0,0,u[f]));let S=this._cubeSize;tr(s,b*S,f>2?S:0,S,S),h.setRenderTarget(s),y&&h.render(g,a),h.render(e,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=c,h.autoClear=d,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===Gi||e.mapping===Wi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=gc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=mc());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new it(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;let l=this._cubeSize;tr(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,Mo)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=dc[(s-r-1)%dc.length];this._blur(e,r-1,r,o,a)}t.autoClear=n}_blur(e,t,n,s,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,s,"latitudinal",r),this._halfBlur(o,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,o,a){let l=this._renderer,u=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,d=new it(this._lodPlanes[s],u),c=u.uniforms,p=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*ii-1),y=r/g,m=isFinite(r)?1+Math.floor(h*y):ii;m>ii&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ii}`);let f=[],b=0;for(let T=0;T<ii;++T){let A=T/y,x=Math.exp(-A*A/2);f.push(x),T===0?b+=x:T<m&&(b+=2*x)}for(let T=0;T<f.length;T++)f[T]=f[T]/b;c.envMap.value=e.texture,c.samples.value=m,c.weights.value=f,c.latitudinal.value=o==="latitudinal",a&&(c.poleAxis.value=a);let{_lodMax:S}=this;c.dTheta.value=g,c.mipInt.value=S-n;let v=this._sizeLods[s],I=3*v*(s>S-Fi?s-S+Fi:0),w=4*(this._cubeSize-v);tr(t,I,w,3*v,2*v),l.setRenderTarget(t),l.render(d,Mo)}};function Zp(i){let e=[],t=[],n=[],s=i,r=i-Fi+1+uc.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);t.push(a);let l=1/a;o>i-Fi?l=uc[o-i+Fi-1]:o===0&&(l=0),n.push(l);let u=1/(a-2),h=-u,d=1+u,c=[h,h,d,h,d,d,h,h,d,d,h,d],p=6,g=6,y=3,m=2,f=1,b=new Float32Array(y*g*p),S=new Float32Array(m*g*p),v=new Float32Array(f*g*p);for(let w=0;w<p;w++){let T=w%3*2/3-1,A=w>2?0:-1,x=[T,A,0,T+2/3,A,0,T+2/3,A+1,0,T,A,0,T+2/3,A+1,0,T,A+1,0];b.set(x,y*g*w),S.set(c,m*g*w);let _=[w,w,w,w,w,w];v.set(_,f*g*w)}let I=new pt;I.setAttribute("position",new xt(b,y)),I.setAttribute("uv",new xt(S,m)),I.setAttribute("faceIndex",new xt(v,f)),e.push(I),s>Fi&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function pc(i,e,t){let n=new Mn(i,e,t);return n.texture.mapping=kr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function tr(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function $p(i,e,t){let n=new Float32Array(ii),s=new P(0,1,0);return new Bt({name:"SphericalGaussianBlur",defines:{n:ii,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:sl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function mc(){return new Bt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:sl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function gc(){return new Bt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:sl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Fn,depthTest:!1,depthWrite:!1})}function sl(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Jp(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){let l=a.mapping,u=l===ko||l===Ho,h=l===Gi||l===Wi;if(u||h){let d=e.get(a),c=d!==void 0?d.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==c)return t===null&&(t=new Sr(i)),d=u?t.fromEquirectangular(a,d):t.fromCubemap(a,d),d.texture.pmremVersion=a.pmremVersion,e.set(a,d),d.texture;if(d!==void 0)return d.texture;{let p=a.image;return u&&p&&p.height>0||h&&p&&s(p)?(t===null&&(t=new Sr(i)),d=u?t.fromEquirectangular(a):t.fromCubemap(a),d.texture.pmremVersion=a.pmremVersion,e.set(a,d),a.addEventListener("dispose",r),d.texture):null}}}return a}function s(a){let l=0,u=6;for(let h=0;h<u;h++)a[h]!==void 0&&l++;return l===u}function r(a){let l=a.target;l.removeEventListener("dispose",r);let u=e.get(l);u!==void 0&&(e.delete(l),u.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function Kp(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&gs("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function jp(i,e,t,n){let s={},r=new WeakMap;function o(d){let c=d.target;c.index!==null&&e.remove(c.index);for(let g in c.attributes)e.remove(c.attributes[g]);for(let g in c.morphAttributes){let y=c.morphAttributes[g];for(let m=0,f=y.length;m<f;m++)e.remove(y[m])}c.removeEventListener("dispose",o),delete s[c.id];let p=r.get(c);p&&(e.remove(p),r.delete(c)),n.releaseStatesOfGeometry(c),c.isInstancedBufferGeometry===!0&&delete c._maxInstanceCount,t.memory.geometries--}function a(d,c){return s[c.id]===!0||(c.addEventListener("dispose",o),s[c.id]=!0,t.memory.geometries++),c}function l(d){let c=d.attributes;for(let g in c)e.update(c[g],i.ARRAY_BUFFER);let p=d.morphAttributes;for(let g in p){let y=p[g];for(let m=0,f=y.length;m<f;m++)e.update(y[m],i.ARRAY_BUFFER)}}function u(d){let c=[],p=d.index,g=d.attributes.position,y=0;if(p!==null){let b=p.array;y=p.version;for(let S=0,v=b.length;S<v;S+=3){let I=b[S+0],w=b[S+1],T=b[S+2];c.push(I,w,w,T,T,I)}}else if(g!==void 0){let b=g.array;y=g.version;for(let S=0,v=b.length/3-1;S<v;S+=3){let I=S+0,w=S+1,T=S+2;c.push(I,w,w,T,T,I)}}else return;let m=new(rh(c)?yr:_r)(c,1);m.version=y;let f=r.get(d);f&&e.remove(f),r.set(d,m)}function h(d){let c=r.get(d);if(c){let p=d.index;p!==null&&c.version<p.version&&u(d)}else u(d);return r.get(d)}return{get:a,update:l,getWireframeAttribute:h}}function Qp(i,e,t){let n;function s(c){n=c}let r,o;function a(c){r=c.type,o=c.bytesPerElement}function l(c,p){i.drawElements(n,p,r,c*o),t.update(p,n,1)}function u(c,p,g){g!==0&&(i.drawElementsInstanced(n,p,r,c*o,g),t.update(p,n,g))}function h(c,p,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,c,0,g);let m=0;for(let f=0;f<g;f++)m+=p[f];t.update(m,n,1)}function d(c,p,g,y){if(g===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let f=0;f<c.length;f++)u(c[f]/o,p[f],y[f]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,r,c,0,y,0,g);let f=0;for(let b=0;b<g;b++)f+=p[b]*y[b];t.update(f,n,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=u,this.renderMultiDraw=h,this.renderMultiDrawInstances=d}function em(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function tm(i,e,t){let n=new WeakMap,s=new nt;function r(o,a,l){let u=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=h!==void 0?h.length:0,c=n.get(a);if(c===void 0||c.count!==d){let x=function(){T.dispose(),n.delete(a),a.removeEventListener("dispose",x)};c!==void 0&&c.texture.dispose();let p=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,y=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],f=a.morphAttributes.normal||[],b=a.morphAttributes.color||[],S=0;p===!0&&(S=1),g===!0&&(S=2),y===!0&&(S=3);let v=a.attributes.position.count*S,I=1;v>e.maxTextureSize&&(I=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);let w=new Float32Array(v*I*4*d),T=new gr(w,v,I,d);T.type=an,T.needsUpdate=!0;let A=S*4;for(let _=0;_<d;_++){let C=m[_],L=f[_],U=b[_],O=v*I*4*_;for(let W=0;W<C.count;W++){let k=W*A;p===!0&&(s.fromBufferAttribute(C,W),w[O+k+0]=s.x,w[O+k+1]=s.y,w[O+k+2]=s.z,w[O+k+3]=0),g===!0&&(s.fromBufferAttribute(L,W),w[O+k+4]=s.x,w[O+k+5]=s.y,w[O+k+6]=s.z,w[O+k+7]=0),y===!0&&(s.fromBufferAttribute(U,W),w[O+k+8]=s.x,w[O+k+9]=s.y,w[O+k+10]=s.z,w[O+k+11]=U.itemSize===4?s.w:1)}}c={count:d,texture:T,size:new Ee(v,I)},n.set(a,c),a.addEventListener("dispose",x)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let p=0;for(let y=0;y<u.length;y++)p+=u[y];let g=a.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",u)}l.getUniforms().setValue(i,"morphTargetsTexture",c.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",c.size)}return{update:r}}function nm(i,e,t,n){let s=new WeakMap;function r(l){let u=n.render.frame,h=l.geometry,d=e.get(l,h);if(s.get(d)!==u&&(e.update(d),s.set(d,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==u&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,u))),l.isSkinnedMesh){let c=l.skeleton;s.get(c)!==u&&(c.update(),s.set(c,u))}return d}function o(){s=new WeakMap}function a(l){let u=l.target;u.removeEventListener("dispose",a),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:r,dispose:o}}var Er=class extends Pt{constructor(e,t,n,s,r,o,a,l,u,h=Oi){if(h!==Oi&&h!==qi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Oi&&(n=oi),n===void 0&&h===qi&&(n=Xi),super(null,s,r,o,a,l,h,n,u),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:Ot,this.minFilter=l!==void 0?l:Ot,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},ch=new Pt,xc=new Er(1,1),hh=new gr,uh=new va,fh=new br,_c=[],yc=[],vc=new Float32Array(16),bc=new Float32Array(9),Mc=new Float32Array(4);function Ki(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=_c[s];if(r===void 0&&(r=new Float32Array(s),_c[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function yt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function vt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Vr(i,e){let t=yc[e];t===void 0&&(t=new Int32Array(e),yc[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function im(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function sm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;i.uniform2fv(this.addr,e),vt(t,e)}}function rm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(yt(t,e))return;i.uniform3fv(this.addr,e),vt(t,e)}}function om(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;i.uniform4fv(this.addr,e),vt(t,e)}}function am(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),vt(t,e)}else{if(yt(t,n))return;Mc.set(n),i.uniformMatrix2fv(this.addr,!1,Mc),vt(t,n)}}function lm(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),vt(t,e)}else{if(yt(t,n))return;bc.set(n),i.uniformMatrix3fv(this.addr,!1,bc),vt(t,n)}}function cm(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),vt(t,e)}else{if(yt(t,n))return;vc.set(n),i.uniformMatrix4fv(this.addr,!1,vc),vt(t,n)}}function hm(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function um(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;i.uniform2iv(this.addr,e),vt(t,e)}}function fm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(yt(t,e))return;i.uniform3iv(this.addr,e),vt(t,e)}}function dm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;i.uniform4iv(this.addr,e),vt(t,e)}}function pm(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function mm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;i.uniform2uiv(this.addr,e),vt(t,e)}}function gm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(yt(t,e))return;i.uniform3uiv(this.addr,e),vt(t,e)}}function xm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;i.uniform4uiv(this.addr,e),vt(t,e)}}function _m(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(xc.compareFunction=sh,r=xc):r=ch,t.setTexture2D(e||r,s)}function ym(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||uh,s)}function vm(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||fh,s)}function bm(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||hh,s)}function Mm(i){switch(i){case 5126:return im;case 35664:return sm;case 35665:return rm;case 35666:return om;case 35674:return am;case 35675:return lm;case 35676:return cm;case 5124:case 35670:return hm;case 35667:case 35671:return um;case 35668:case 35672:return fm;case 35669:case 35673:return dm;case 5125:return pm;case 36294:return mm;case 36295:return gm;case 36296:return xm;case 35678:case 36198:case 36298:case 36306:case 35682:return _m;case 35679:case 36299:case 36307:return ym;case 35680:case 36300:case 36308:case 36293:return vm;case 36289:case 36303:case 36311:case 36292:return bm}}function Sm(i,e){i.uniform1fv(this.addr,e)}function Em(i,e){let t=Ki(e,this.size,2);i.uniform2fv(this.addr,t)}function wm(i,e){let t=Ki(e,this.size,3);i.uniform3fv(this.addr,t)}function Tm(i,e){let t=Ki(e,this.size,4);i.uniform4fv(this.addr,t)}function Am(i,e){let t=Ki(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Rm(i,e){let t=Ki(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Cm(i,e){let t=Ki(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Im(i,e){i.uniform1iv(this.addr,e)}function Pm(i,e){i.uniform2iv(this.addr,e)}function Lm(i,e){i.uniform3iv(this.addr,e)}function Dm(i,e){i.uniform4iv(this.addr,e)}function Um(i,e){i.uniform1uiv(this.addr,e)}function Nm(i,e){i.uniform2uiv(this.addr,e)}function Fm(i,e){i.uniform3uiv(this.addr,e)}function zm(i,e){i.uniform4uiv(this.addr,e)}function Om(i,e,t){let n=this.cache,s=e.length,r=Vr(t,s);yt(n,r)||(i.uniform1iv(this.addr,r),vt(n,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||ch,r[o])}function Bm(i,e,t){let n=this.cache,s=e.length,r=Vr(t,s);yt(n,r)||(i.uniform1iv(this.addr,r),vt(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||uh,r[o])}function km(i,e,t){let n=this.cache,s=e.length,r=Vr(t,s);yt(n,r)||(i.uniform1iv(this.addr,r),vt(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||fh,r[o])}function Hm(i,e,t){let n=this.cache,s=e.length,r=Vr(t,s);yt(n,r)||(i.uniform1iv(this.addr,r),vt(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||hh,r[o])}function Vm(i){switch(i){case 5126:return Sm;case 35664:return Em;case 35665:return wm;case 35666:return Tm;case 35674:return Am;case 35675:return Rm;case 35676:return Cm;case 5124:case 35670:return Im;case 35667:case 35671:return Pm;case 35668:case 35672:return Lm;case 35669:case 35673:return Dm;case 5125:return Um;case 36294:return Nm;case 36295:return Fm;case 36296:return zm;case 35678:case 36198:case 36298:case 36306:case 35682:return Om;case 35679:case 36299:case 36307:return Bm;case 35680:case 36300:case 36308:case 36293:return km;case 36289:case 36303:case 36311:case 36292:return Hm}}var Sa=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Mm(t.type)}},Ea=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Vm(t.type)}},wa=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],n)}}},Ao=/(\w+)(\])?(\[|\.)?/g;function Sc(i,e){i.seq.push(e),i.map[e.id]=e}function Gm(i,e,t){let n=i.name,s=n.length;for(Ao.lastIndex=0;;){let r=Ao.exec(n),o=Ao.lastIndex,a=r[1],l=r[2]==="]",u=r[3];if(l&&(a=a|0),u===void 0||u==="["&&o+2===s){Sc(t,u===void 0?new Sa(a,i,e):new Ea(a,i,e));break}else{let d=t.map[a];d===void 0&&(d=new wa(a),Sc(t,d)),t=d}}}var ki=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);Gm(r,o,this)}}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&n.push(o)}return n}};function Ec(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var Wm=37297,Xm=0;function qm(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var wc=new ze;function Ym(i){Ze._getMatrix(wc,Ze.workingColorSpace,i);let e=`mat3( ${wc.elements.map(t=>t.toFixed(4))} )`;switch(Ze.getTransfer(i)){case Hr:return[e,"LinearTransferOETF"];case et:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Tc(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),s=i.getShaderInfoLog(e).trim();if(n&&s==="")return"";let r=/ERROR: 0:(\d+)/.exec(s);if(r){let o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+qm(i.getShaderSource(e),o)}else return s}function Zm(i,e){let t=Ym(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function $m(i,e){let t;switch(e){case vu:t="Linear";break;case bu:t="Reinhard";break;case Mu:t="Cineon";break;case Ja:t="ACESFilmic";break;case Eu:t="AgX";break;case wu:t="Neutral";break;case Su:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var nr=new P;function Jm(){Ze.getLuminanceCoefficients(nr);let i=nr.x.toFixed(4),e=nr.y.toFixed(4),t=nr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Km(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(xs).join(`
`)}function jm(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Qm(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function xs(i){return i!==""}function Ac(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Rc(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var e0=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ta(i){return i.replace(e0,n0)}var t0=new Map;function n0(i,e){let t=Be[e];if(t===void 0){let n=t0.get(e);if(n!==void 0)t=Be[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Ta(t)}var i0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Cc(i){return i.replace(i0,s0)}function s0(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Ic(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function r0(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===qc?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Za?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===xn&&(e="SHADOWMAP_TYPE_VSM"),e}function o0(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Gi:case Wi:e="ENVMAP_TYPE_CUBE";break;case kr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function a0(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Wi:e="ENVMAP_MODE_REFRACTION";break}return e}function l0(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case $a:e="ENVMAP_BLENDING_MULTIPLY";break;case _u:e="ENVMAP_BLENDING_MIX";break;case yu:e="ENVMAP_BLENDING_ADD";break}return e}function c0(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function h0(i,e,t,n){let s=i.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=r0(t),u=o0(t),h=a0(t),d=l0(t),c=c0(t),p=Km(t),g=jm(r),y=s.createProgram(),m,f,b=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(xs).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(xs).join(`
`),f.length>0&&(f+=`
`)):(m=[Ic(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(xs).join(`
`),f=[Ic(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",c?"#define CUBEUV_TEXEL_WIDTH "+c.texelWidth:"",c?"#define CUBEUV_TEXEL_HEIGHT "+c.texelHeight:"",c?"#define CUBEUV_MAX_MIP "+c.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==zn?"#define TONE_MAPPING":"",t.toneMapping!==zn?Be.tonemapping_pars_fragment:"",t.toneMapping!==zn?$m("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Be.colorspace_pars_fragment,Zm("linearToOutputTexel",t.outputColorSpace),Jm(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(xs).join(`
`)),o=Ta(o),o=Ac(o,t),o=Rc(o,t),a=Ta(a),a=Ac(a,t),a=Rc(a,t),o=Cc(o),a=Cc(a),t.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",t.glslVersion===Wl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Wl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);let S=b+m+o,v=b+f+a,I=Ec(s,s.VERTEX_SHADER,S),w=Ec(s,s.FRAGMENT_SHADER,v);s.attachShader(y,I),s.attachShader(y,w),t.index0AttributeName!==void 0?s.bindAttribLocation(y,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(y,0,"position"),s.linkProgram(y);function T(C){if(i.debug.checkShaderErrors){let L=s.getProgramInfoLog(y).trim(),U=s.getShaderInfoLog(I).trim(),O=s.getShaderInfoLog(w).trim(),W=!0,k=!0;if(s.getProgramParameter(y,s.LINK_STATUS)===!1)if(W=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,y,I,w);else{let Z=Tc(s,I,"vertex"),H=Tc(s,w,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(y,s.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+L+`
`+Z+`
`+H)}else L!==""?console.warn("THREE.WebGLProgram: Program Info Log:",L):(U===""||O==="")&&(k=!1);k&&(C.diagnostics={runnable:W,programLog:L,vertexShader:{log:U,prefix:m},fragmentShader:{log:O,prefix:f}})}s.deleteShader(I),s.deleteShader(w),A=new ki(s,y),x=Qm(s,y)}let A;this.getUniforms=function(){return A===void 0&&T(this),A};let x;this.getAttributes=function(){return x===void 0&&T(this),x};let _=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return _===!1&&(_=s.getProgramParameter(y,Wm)),_},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Xm++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=I,this.fragmentShader=w,this}var u0=0,Aa=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Ra(e),t.set(e,n)),n}},Ra=class{constructor(e){this.id=u0++,this.code=e,this.usedTimes=0}};function f0(i,e,t,n,s,r,o){let a=new bs,l=new Aa,u=new Set,h=[],d=s.logarithmicDepthBuffer,c=s.vertexTextures,p=s.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function y(x){return u.add(x),x===0?"uv":`uv${x}`}function m(x,_,C,L,U){let O=L.fog,W=U.geometry,k=x.isMeshStandardMaterial?L.environment:null,Z=(x.isMeshStandardMaterial?t:e).get(x.envMap||k),H=Z&&Z.mapping===kr?Z.image.height:null,ie=g[x.type];x.precision!==null&&(p=s.getMaxPrecision(x.precision),p!==x.precision&&console.warn("THREE.WebGLProgram.getParameters:",x.precision,"not supported, using",p,"instead."));let ee=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,X=ee!==void 0?ee.length:0,le=0;W.morphAttributes.position!==void 0&&(le=1),W.morphAttributes.normal!==void 0&&(le=2),W.morphAttributes.color!==void 0&&(le=3);let De,Y,Q,de;if(ie){let je=sn[ie];De=je.vertexShader,Y=je.fragmentShader}else De=x.vertexShader,Y=x.fragmentShader,l.update(x),Q=l.getVertexShaderID(x),de=l.getFragmentShaderID(x);let re=i.getRenderTarget(),ve=i.state.buffers.depth.getReversed(),Te=U.isInstancedMesh===!0,Ue=U.isBatchedMesh===!0,ut=!!x.map,qe=!!x.matcap,dt=!!Z,z=!!x.aoMap,kt=!!x.lightMap,Ge=!!x.bumpMap,We=!!x.normalMap,Ae=!!x.displacementMap,ot=!!x.emissiveMap,we=!!x.metalnessMap,R=!!x.roughnessMap,M=x.anisotropy>0,B=x.clearcoat>0,J=x.dispersion>0,j=x.iridescence>0,$=x.sheen>0,be=x.transmission>0,ce=M&&!!x.anisotropyMap,pe=B&&!!x.clearcoatMap,Ye=B&&!!x.clearcoatNormalMap,te=B&&!!x.clearcoatRoughnessMap,me=j&&!!x.iridescenceMap,Re=j&&!!x.iridescenceThicknessMap,Ie=$&&!!x.sheenColorMap,ge=$&&!!x.sheenRoughnessMap,Xe=!!x.specularMap,Oe=!!x.specularColorMap,st=!!x.specularIntensityMap,D=be&&!!x.transmissionMap,ae=be&&!!x.thicknessMap,q=!!x.gradientMap,K=!!x.alphaMap,fe=x.alphaTest>0,he=!!x.alphaHash,Ne=!!x.extensions,ft=zn;x.toneMapped&&(re===null||re.isXRRenderTarget===!0)&&(ft=i.toneMapping);let St={shaderID:ie,shaderType:x.type,shaderName:x.name,vertexShader:De,fragmentShader:Y,defines:x.defines,customVertexShaderID:Q,customFragmentShaderID:de,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:p,batching:Ue,batchingColor:Ue&&U._colorsTexture!==null,instancing:Te,instancingColor:Te&&U.instanceColor!==null,instancingMorph:Te&&U.morphTexture!==null,supportsVertexTextures:c,outputColorSpace:re===null?i.outputColorSpace:re.isXRRenderTarget===!0?re.texture.colorSpace:Ji,alphaToCoverage:!!x.alphaToCoverage,map:ut,matcap:qe,envMap:dt,envMapMode:dt&&Z.mapping,envMapCubeUVHeight:H,aoMap:z,lightMap:kt,bumpMap:Ge,normalMap:We,displacementMap:c&&Ae,emissiveMap:ot,normalMapObjectSpace:We&&x.normalMapType===Cu,normalMapTangentSpace:We&&x.normalMapType===ih,metalnessMap:we,roughnessMap:R,anisotropy:M,anisotropyMap:ce,clearcoat:B,clearcoatMap:pe,clearcoatNormalMap:Ye,clearcoatRoughnessMap:te,dispersion:J,iridescence:j,iridescenceMap:me,iridescenceThicknessMap:Re,sheen:$,sheenColorMap:Ie,sheenRoughnessMap:ge,specularMap:Xe,specularColorMap:Oe,specularIntensityMap:st,transmission:be,transmissionMap:D,thicknessMap:ae,gradientMap:q,opaque:x.transparent===!1&&x.blending===zi&&x.alphaToCoverage===!1,alphaMap:K,alphaTest:fe,alphaHash:he,combine:x.combine,mapUv:ut&&y(x.map.channel),aoMapUv:z&&y(x.aoMap.channel),lightMapUv:kt&&y(x.lightMap.channel),bumpMapUv:Ge&&y(x.bumpMap.channel),normalMapUv:We&&y(x.normalMap.channel),displacementMapUv:Ae&&y(x.displacementMap.channel),emissiveMapUv:ot&&y(x.emissiveMap.channel),metalnessMapUv:we&&y(x.metalnessMap.channel),roughnessMapUv:R&&y(x.roughnessMap.channel),anisotropyMapUv:ce&&y(x.anisotropyMap.channel),clearcoatMapUv:pe&&y(x.clearcoatMap.channel),clearcoatNormalMapUv:Ye&&y(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:te&&y(x.clearcoatRoughnessMap.channel),iridescenceMapUv:me&&y(x.iridescenceMap.channel),iridescenceThicknessMapUv:Re&&y(x.iridescenceThicknessMap.channel),sheenColorMapUv:Ie&&y(x.sheenColorMap.channel),sheenRoughnessMapUv:ge&&y(x.sheenRoughnessMap.channel),specularMapUv:Xe&&y(x.specularMap.channel),specularColorMapUv:Oe&&y(x.specularColorMap.channel),specularIntensityMapUv:st&&y(x.specularIntensityMap.channel),transmissionMapUv:D&&y(x.transmissionMap.channel),thicknessMapUv:ae&&y(x.thicknessMap.channel),alphaMapUv:K&&y(x.alphaMap.channel),vertexTangents:!!W.attributes.tangent&&(We||M),vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,pointsUvs:U.isPoints===!0&&!!W.attributes.uv&&(ut||K),fog:!!O,useFog:x.fog===!0,fogExp2:!!O&&O.isFogExp2,flatShading:x.flatShading===!0,sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:d,reverseDepthBuffer:ve,skinning:U.isSkinnedMesh===!0,morphTargets:W.morphAttributes.position!==void 0,morphNormals:W.morphAttributes.normal!==void 0,morphColors:W.morphAttributes.color!==void 0,morphTargetsCount:X,morphTextureStride:le,numDirLights:_.directional.length,numPointLights:_.point.length,numSpotLights:_.spot.length,numSpotLightMaps:_.spotLightMap.length,numRectAreaLights:_.rectArea.length,numHemiLights:_.hemi.length,numDirLightShadows:_.directionalShadowMap.length,numPointLightShadows:_.pointShadowMap.length,numSpotLightShadows:_.spotShadowMap.length,numSpotLightShadowsWithMaps:_.numSpotLightShadowsWithMaps,numLightProbes:_.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&C.length>0,shadowMapType:i.shadowMap.type,toneMapping:ft,decodeVideoTexture:ut&&x.map.isVideoTexture===!0&&Ze.getTransfer(x.map.colorSpace)===et,decodeVideoTextureEmissive:ot&&x.emissiveMap.isVideoTexture===!0&&Ze.getTransfer(x.emissiveMap.colorSpace)===et,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Kt,flipSided:x.side===Ut,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:Ne&&x.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ne&&x.extensions.multiDraw===!0||Ue)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return St.vertexUv1s=u.has(1),St.vertexUv2s=u.has(2),St.vertexUv3s=u.has(3),u.clear(),St}function f(x){let _=[];if(x.shaderID?_.push(x.shaderID):(_.push(x.customVertexShaderID),_.push(x.customFragmentShaderID)),x.defines!==void 0)for(let C in x.defines)_.push(C),_.push(x.defines[C]);return x.isRawShaderMaterial===!1&&(b(_,x),S(_,x),_.push(i.outputColorSpace)),_.push(x.customProgramCacheKey),_.join()}function b(x,_){x.push(_.precision),x.push(_.outputColorSpace),x.push(_.envMapMode),x.push(_.envMapCubeUVHeight),x.push(_.mapUv),x.push(_.alphaMapUv),x.push(_.lightMapUv),x.push(_.aoMapUv),x.push(_.bumpMapUv),x.push(_.normalMapUv),x.push(_.displacementMapUv),x.push(_.emissiveMapUv),x.push(_.metalnessMapUv),x.push(_.roughnessMapUv),x.push(_.anisotropyMapUv),x.push(_.clearcoatMapUv),x.push(_.clearcoatNormalMapUv),x.push(_.clearcoatRoughnessMapUv),x.push(_.iridescenceMapUv),x.push(_.iridescenceThicknessMapUv),x.push(_.sheenColorMapUv),x.push(_.sheenRoughnessMapUv),x.push(_.specularMapUv),x.push(_.specularColorMapUv),x.push(_.specularIntensityMapUv),x.push(_.transmissionMapUv),x.push(_.thicknessMapUv),x.push(_.combine),x.push(_.fogExp2),x.push(_.sizeAttenuation),x.push(_.morphTargetsCount),x.push(_.morphAttributeCount),x.push(_.numDirLights),x.push(_.numPointLights),x.push(_.numSpotLights),x.push(_.numSpotLightMaps),x.push(_.numHemiLights),x.push(_.numRectAreaLights),x.push(_.numDirLightShadows),x.push(_.numPointLightShadows),x.push(_.numSpotLightShadows),x.push(_.numSpotLightShadowsWithMaps),x.push(_.numLightProbes),x.push(_.shadowMapType),x.push(_.toneMapping),x.push(_.numClippingPlanes),x.push(_.numClipIntersection),x.push(_.depthPacking)}function S(x,_){a.disableAll(),_.supportsVertexTextures&&a.enable(0),_.instancing&&a.enable(1),_.instancingColor&&a.enable(2),_.instancingMorph&&a.enable(3),_.matcap&&a.enable(4),_.envMap&&a.enable(5),_.normalMapObjectSpace&&a.enable(6),_.normalMapTangentSpace&&a.enable(7),_.clearcoat&&a.enable(8),_.iridescence&&a.enable(9),_.alphaTest&&a.enable(10),_.vertexColors&&a.enable(11),_.vertexAlphas&&a.enable(12),_.vertexUv1s&&a.enable(13),_.vertexUv2s&&a.enable(14),_.vertexUv3s&&a.enable(15),_.vertexTangents&&a.enable(16),_.anisotropy&&a.enable(17),_.alphaHash&&a.enable(18),_.batching&&a.enable(19),_.dispersion&&a.enable(20),_.batchingColor&&a.enable(21),x.push(a.mask),a.disableAll(),_.fog&&a.enable(0),_.useFog&&a.enable(1),_.flatShading&&a.enable(2),_.logarithmicDepthBuffer&&a.enable(3),_.reverseDepthBuffer&&a.enable(4),_.skinning&&a.enable(5),_.morphTargets&&a.enable(6),_.morphNormals&&a.enable(7),_.morphColors&&a.enable(8),_.premultipliedAlpha&&a.enable(9),_.shadowMapEnabled&&a.enable(10),_.doubleSided&&a.enable(11),_.flipSided&&a.enable(12),_.useDepthPacking&&a.enable(13),_.dithering&&a.enable(14),_.transmission&&a.enable(15),_.sheen&&a.enable(16),_.opaque&&a.enable(17),_.pointsUvs&&a.enable(18),_.decodeVideoTexture&&a.enable(19),_.decodeVideoTextureEmissive&&a.enable(20),_.alphaToCoverage&&a.enable(21),x.push(a.mask)}function v(x){let _=g[x.type],C;if(_){let L=sn[_];C=tf.clone(L.uniforms)}else C=x.uniforms;return C}function I(x,_){let C;for(let L=0,U=h.length;L<U;L++){let O=h[L];if(O.cacheKey===_){C=O,++C.usedTimes;break}}return C===void 0&&(C=new h0(i,_,x,r),h.push(C)),C}function w(x){if(--x.usedTimes===0){let _=h.indexOf(x);h[_]=h[h.length-1],h.pop(),x.destroy()}}function T(x){l.remove(x)}function A(){l.dispose()}return{getParameters:m,getProgramCacheKey:f,getUniforms:v,acquireProgram:I,releaseProgram:w,releaseShaderCache:T,programs:h,dispose:A}}function d0(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function p0(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Pc(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Lc(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(d,c,p,g,y,m){let f=i[e];return f===void 0?(f={id:d.id,object:d,geometry:c,material:p,groupOrder:g,renderOrder:d.renderOrder,z:y,group:m},i[e]=f):(f.id=d.id,f.object=d,f.geometry=c,f.material=p,f.groupOrder=g,f.renderOrder=d.renderOrder,f.z=y,f.group=m),e++,f}function a(d,c,p,g,y,m){let f=o(d,c,p,g,y,m);p.transmission>0?n.push(f):p.transparent===!0?s.push(f):t.push(f)}function l(d,c,p,g,y,m){let f=o(d,c,p,g,y,m);p.transmission>0?n.unshift(f):p.transparent===!0?s.unshift(f):t.unshift(f)}function u(d,c){t.length>1&&t.sort(d||p0),n.length>1&&n.sort(c||Pc),s.length>1&&s.sort(c||Pc)}function h(){for(let d=e,c=i.length;d<c;d++){let p=i[d];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:h,sort:u}}function m0(){let i=new WeakMap;function e(n,s){let r=i.get(n),o;return r===void 0?(o=new Lc,i.set(n,[o])):s>=r.length?(o=new Lc,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function g0(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new P,color:new Ce};break;case"SpotLight":t={position:new P,direction:new P,color:new Ce,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new Ce,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new Ce,groundColor:new Ce};break;case"RectAreaLight":t={color:new Ce,position:new P,halfWidth:new P,halfHeight:new P};break}return i[e.id]=t,t}}}function x0(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ee};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ee};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ee,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var _0=0;function y0(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function v0(i){let e=new g0,t=x0(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)n.probe.push(new P);let s=new P,r=new Le,o=new Le;function a(u){let h=0,d=0,c=0;for(let x=0;x<9;x++)n.probe[x].set(0,0,0);let p=0,g=0,y=0,m=0,f=0,b=0,S=0,v=0,I=0,w=0,T=0;u.sort(y0);for(let x=0,_=u.length;x<_;x++){let C=u[x],L=C.color,U=C.intensity,O=C.distance,W=C.shadow&&C.shadow.map?C.shadow.map.texture:null;if(C.isAmbientLight)h+=L.r*U,d+=L.g*U,c+=L.b*U;else if(C.isLightProbe){for(let k=0;k<9;k++)n.probe[k].addScaledVector(C.sh.coefficients[k],U);T++}else if(C.isDirectionalLight){let k=e.get(C);if(k.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let Z=C.shadow,H=t.get(C);H.shadowIntensity=Z.intensity,H.shadowBias=Z.bias,H.shadowNormalBias=Z.normalBias,H.shadowRadius=Z.radius,H.shadowMapSize=Z.mapSize,n.directionalShadow[p]=H,n.directionalShadowMap[p]=W,n.directionalShadowMatrix[p]=C.shadow.matrix,b++}n.directional[p]=k,p++}else if(C.isSpotLight){let k=e.get(C);k.position.setFromMatrixPosition(C.matrixWorld),k.color.copy(L).multiplyScalar(U),k.distance=O,k.coneCos=Math.cos(C.angle),k.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),k.decay=C.decay,n.spot[y]=k;let Z=C.shadow;if(C.map&&(n.spotLightMap[I]=C.map,I++,Z.updateMatrices(C),C.castShadow&&w++),n.spotLightMatrix[y]=Z.matrix,C.castShadow){let H=t.get(C);H.shadowIntensity=Z.intensity,H.shadowBias=Z.bias,H.shadowNormalBias=Z.normalBias,H.shadowRadius=Z.radius,H.shadowMapSize=Z.mapSize,n.spotShadow[y]=H,n.spotShadowMap[y]=W,v++}y++}else if(C.isRectAreaLight){let k=e.get(C);k.color.copy(L).multiplyScalar(U),k.halfWidth.set(C.width*.5,0,0),k.halfHeight.set(0,C.height*.5,0),n.rectArea[m]=k,m++}else if(C.isPointLight){let k=e.get(C);if(k.color.copy(C.color).multiplyScalar(C.intensity),k.distance=C.distance,k.decay=C.decay,C.castShadow){let Z=C.shadow,H=t.get(C);H.shadowIntensity=Z.intensity,H.shadowBias=Z.bias,H.shadowNormalBias=Z.normalBias,H.shadowRadius=Z.radius,H.shadowMapSize=Z.mapSize,H.shadowCameraNear=Z.camera.near,H.shadowCameraFar=Z.camera.far,n.pointShadow[g]=H,n.pointShadowMap[g]=W,n.pointShadowMatrix[g]=C.shadow.matrix,S++}n.point[g]=k,g++}else if(C.isHemisphereLight){let k=e.get(C);k.skyColor.copy(C.color).multiplyScalar(U),k.groundColor.copy(C.groundColor).multiplyScalar(U),n.hemi[f]=k,f++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=oe.LTC_FLOAT_1,n.rectAreaLTC2=oe.LTC_FLOAT_2):(n.rectAreaLTC1=oe.LTC_HALF_1,n.rectAreaLTC2=oe.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=d,n.ambient[2]=c;let A=n.hash;(A.directionalLength!==p||A.pointLength!==g||A.spotLength!==y||A.rectAreaLength!==m||A.hemiLength!==f||A.numDirectionalShadows!==b||A.numPointShadows!==S||A.numSpotShadows!==v||A.numSpotMaps!==I||A.numLightProbes!==T)&&(n.directional.length=p,n.spot.length=y,n.rectArea.length=m,n.point.length=g,n.hemi.length=f,n.directionalShadow.length=b,n.directionalShadowMap.length=b,n.pointShadow.length=S,n.pointShadowMap.length=S,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=b,n.pointShadowMatrix.length=S,n.spotLightMatrix.length=v+I-w,n.spotLightMap.length=I,n.numSpotLightShadowsWithMaps=w,n.numLightProbes=T,A.directionalLength=p,A.pointLength=g,A.spotLength=y,A.rectAreaLength=m,A.hemiLength=f,A.numDirectionalShadows=b,A.numPointShadows=S,A.numSpotShadows=v,A.numSpotMaps=I,A.numLightProbes=T,n.version=_0++)}function l(u,h){let d=0,c=0,p=0,g=0,y=0,m=h.matrixWorldInverse;for(let f=0,b=u.length;f<b;f++){let S=u[f];if(S.isDirectionalLight){let v=n.directional[d];v.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(m),d++}else if(S.isSpotLight){let v=n.spot[p];v.position.setFromMatrixPosition(S.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(m),p++}else if(S.isRectAreaLight){let v=n.rectArea[g];v.position.setFromMatrixPosition(S.matrixWorld),v.position.applyMatrix4(m),o.identity(),r.copy(S.matrixWorld),r.premultiply(m),o.extractRotation(r),v.halfWidth.set(S.width*.5,0,0),v.halfHeight.set(0,S.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),g++}else if(S.isPointLight){let v=n.point[c];v.position.setFromMatrixPosition(S.matrixWorld),v.position.applyMatrix4(m),c++}else if(S.isHemisphereLight){let v=n.hemi[y];v.direction.setFromMatrixPosition(S.matrixWorld),v.direction.transformDirection(m),y++}}}return{setup:a,setupView:l,state:n}}function Dc(i){let e=new v0(i),t=[],n=[];function s(h){u.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function o(h){n.push(h)}function a(){e.setup(t)}function l(h){e.setupView(t,h)}let u={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:u,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function b0(i){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new Dc(i),e.set(s,[a])):r>=o.length?(a=new Dc(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var Ca=class extends Vn{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Au,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ia=class extends Vn{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},M0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,S0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function E0(i,e,t){let n=new Ms,s=new Ee,r=new Ee,o=new nt,a=new Ca({depthPacking:Ru}),l=new Ia,u={},h=t.maxTextureSize,d={[Bn]:Ut,[Ut]:Bn,[Kt]:Kt},c=new Bt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ee},radius:{value:4}},vertexShader:M0,fragmentShader:S0}),p=c.clone();p.defines.HORIZONTAL_PASS=1;let g=new pt;g.setAttribute("position",new xt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new it(g,c),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=qc;let f=this.type;this.render=function(w,T,A){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||w.length===0)return;let x=i.getRenderTarget(),_=i.getActiveCubeFace(),C=i.getActiveMipmapLevel(),L=i.state;L.setBlending(Fn),L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);let U=f!==xn&&this.type===xn,O=f===xn&&this.type!==xn;for(let W=0,k=w.length;W<k;W++){let Z=w[W],H=Z.shadow;if(H===void 0){console.warn("THREE.WebGLShadowMap:",Z,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;s.copy(H.mapSize);let ie=H.getFrameExtents();if(s.multiply(ie),r.copy(H.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/ie.x),s.x=r.x*ie.x,H.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/ie.y),s.y=r.y*ie.y,H.mapSize.y=r.y)),H.map===null||U===!0||O===!0){let X=this.type!==xn?{minFilter:Ot,magFilter:Ot}:{};H.map!==null&&H.map.dispose(),H.map=new Mn(s.x,s.y,X),H.map.texture.name=Z.name+".shadowMap",H.camera.updateProjectionMatrix()}i.setRenderTarget(H.map),i.clear();let ee=H.getViewportCount();for(let X=0;X<ee;X++){let le=H.getViewport(X);o.set(r.x*le.x,r.y*le.y,r.x*le.z,r.y*le.w),L.viewport(o),H.updateMatrices(Z,X),n=H.getFrustum(),v(T,A,H.camera,Z,this.type)}H.isPointLightShadow!==!0&&this.type===xn&&b(H,A),H.needsUpdate=!1}f=this.type,m.needsUpdate=!1,i.setRenderTarget(x,_,C)};function b(w,T){let A=e.update(y);c.defines.VSM_SAMPLES!==w.blurSamples&&(c.defines.VSM_SAMPLES=w.blurSamples,p.defines.VSM_SAMPLES=w.blurSamples,c.needsUpdate=!0,p.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new Mn(s.x,s.y)),c.uniforms.shadow_pass.value=w.map.texture,c.uniforms.resolution.value=w.mapSize,c.uniforms.radius.value=w.radius,i.setRenderTarget(w.mapPass),i.clear(),i.renderBufferDirect(T,null,A,c,y,null),p.uniforms.shadow_pass.value=w.mapPass.texture,p.uniforms.resolution.value=w.mapSize,p.uniforms.radius.value=w.radius,i.setRenderTarget(w.map),i.clear(),i.renderBufferDirect(T,null,A,p,y,null)}function S(w,T,A,x){let _=null,C=A.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(C!==void 0)_=C;else if(_=A.isPointLight===!0?l:a,i.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0){let L=_.uuid,U=T.uuid,O=u[L];O===void 0&&(O={},u[L]=O);let W=O[U];W===void 0&&(W=_.clone(),O[U]=W,T.addEventListener("dispose",I)),_=W}if(_.visible=T.visible,_.wireframe=T.wireframe,x===xn?_.side=T.shadowSide!==null?T.shadowSide:T.side:_.side=T.shadowSide!==null?T.shadowSide:d[T.side],_.alphaMap=T.alphaMap,_.alphaTest=T.alphaTest,_.map=T.map,_.clipShadows=T.clipShadows,_.clippingPlanes=T.clippingPlanes,_.clipIntersection=T.clipIntersection,_.displacementMap=T.displacementMap,_.displacementScale=T.displacementScale,_.displacementBias=T.displacementBias,_.wireframeLinewidth=T.wireframeLinewidth,_.linewidth=T.linewidth,A.isPointLight===!0&&_.isMeshDistanceMaterial===!0){let L=i.properties.get(_);L.light=A}return _}function v(w,T,A,x,_){if(w.visible===!1)return;if(w.layers.test(T.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&_===xn)&&(!w.frustumCulled||n.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(A.matrixWorldInverse,w.matrixWorld);let U=e.update(w),O=w.material;if(Array.isArray(O)){let W=U.groups;for(let k=0,Z=W.length;k<Z;k++){let H=W[k],ie=O[H.materialIndex];if(ie&&ie.visible){let ee=S(w,ie,x,_);w.onBeforeShadow(i,w,T,A,U,ee,H),i.renderBufferDirect(A,null,U,ee,w,H),w.onAfterShadow(i,w,T,A,U,ee,H)}}}else if(O.visible){let W=S(w,O,x,_);w.onBeforeShadow(i,w,T,A,U,W,null),i.renderBufferDirect(A,null,U,W,w,null),w.onAfterShadow(i,w,T,A,U,W,null)}}let L=w.children;for(let U=0,O=L.length;U<O;U++)v(L[U],T,A,x,_)}function I(w){w.target.removeEventListener("dispose",I);for(let A in u){let x=u[A],_=w.target.uuid;_ in x&&(x[_].dispose(),delete x[_])}}}var w0={[Do]:Uo,[No]:Oo,[Fo]:Bo,[Vi]:zo,[Uo]:Do,[Oo]:No,[Bo]:Fo,[zo]:Vi};function T0(i,e){function t(){let D=!1,ae=new nt,q=null,K=new nt(0,0,0,0);return{setMask:function(fe){q!==fe&&!D&&(i.colorMask(fe,fe,fe,fe),q=fe)},setLocked:function(fe){D=fe},setClear:function(fe,he,Ne,ft,St){St===!0&&(fe*=ft,he*=ft,Ne*=ft),ae.set(fe,he,Ne,ft),K.equals(ae)===!1&&(i.clearColor(fe,he,Ne,ft),K.copy(ae))},reset:function(){D=!1,q=null,K.set(-1,0,0,0)}}}function n(){let D=!1,ae=!1,q=null,K=null,fe=null;return{setReversed:function(he){if(ae!==he){let Ne=e.get("EXT_clip_control");ae?Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.ZERO_TO_ONE_EXT):Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.NEGATIVE_ONE_TO_ONE_EXT);let ft=fe;fe=null,this.setClear(ft)}ae=he},getReversed:function(){return ae},setTest:function(he){he?re(i.DEPTH_TEST):ve(i.DEPTH_TEST)},setMask:function(he){q!==he&&!D&&(i.depthMask(he),q=he)},setFunc:function(he){if(ae&&(he=w0[he]),K!==he){switch(he){case Do:i.depthFunc(i.NEVER);break;case Uo:i.depthFunc(i.ALWAYS);break;case No:i.depthFunc(i.LESS);break;case Vi:i.depthFunc(i.LEQUAL);break;case Fo:i.depthFunc(i.EQUAL);break;case zo:i.depthFunc(i.GEQUAL);break;case Oo:i.depthFunc(i.GREATER);break;case Bo:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}K=he}},setLocked:function(he){D=he},setClear:function(he){fe!==he&&(ae&&(he=1-he),i.clearDepth(he),fe=he)},reset:function(){D=!1,q=null,K=null,fe=null,ae=!1}}}function s(){let D=!1,ae=null,q=null,K=null,fe=null,he=null,Ne=null,ft=null,St=null;return{setTest:function(je){D||(je?re(i.STENCIL_TEST):ve(i.STENCIL_TEST))},setMask:function(je){ae!==je&&!D&&(i.stencilMask(je),ae=je)},setFunc:function(je,qt,hn){(q!==je||K!==qt||fe!==hn)&&(i.stencilFunc(je,qt,hn),q=je,K=qt,fe=hn)},setOp:function(je,qt,hn){(he!==je||Ne!==qt||ft!==hn)&&(i.stencilOp(je,qt,hn),he=je,Ne=qt,ft=hn)},setLocked:function(je){D=je},setClear:function(je){St!==je&&(i.clearStencil(je),St=je)},reset:function(){D=!1,ae=null,q=null,K=null,fe=null,he=null,Ne=null,ft=null,St=null}}}let r=new t,o=new n,a=new s,l=new WeakMap,u=new WeakMap,h={},d={},c=new WeakMap,p=[],g=null,y=!1,m=null,f=null,b=null,S=null,v=null,I=null,w=null,T=new Ce(0,0,0),A=0,x=!1,_=null,C=null,L=null,U=null,O=null,W=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),k=!1,Z=0,H=i.getParameter(i.VERSION);H.indexOf("WebGL")!==-1?(Z=parseFloat(/^WebGL (\d)/.exec(H)[1]),k=Z>=1):H.indexOf("OpenGL ES")!==-1&&(Z=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),k=Z>=2);let ie=null,ee={},X=i.getParameter(i.SCISSOR_BOX),le=i.getParameter(i.VIEWPORT),De=new nt().fromArray(X),Y=new nt().fromArray(le);function Q(D,ae,q,K){let fe=new Uint8Array(4),he=i.createTexture();i.bindTexture(D,he),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ne=0;Ne<q;Ne++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(ae,0,i.RGBA,1,1,K,0,i.RGBA,i.UNSIGNED_BYTE,fe):i.texImage2D(ae+Ne,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,fe);return he}let de={};de[i.TEXTURE_2D]=Q(i.TEXTURE_2D,i.TEXTURE_2D,1),de[i.TEXTURE_CUBE_MAP]=Q(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),de[i.TEXTURE_2D_ARRAY]=Q(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),de[i.TEXTURE_3D]=Q(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),re(i.DEPTH_TEST),o.setFunc(Vi),Ge(!1),We(zl),re(i.CULL_FACE),z(Fn);function re(D){h[D]!==!0&&(i.enable(D),h[D]=!0)}function ve(D){h[D]!==!1&&(i.disable(D),h[D]=!1)}function Te(D,ae){return d[D]!==ae?(i.bindFramebuffer(D,ae),d[D]=ae,D===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=ae),D===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=ae),!0):!1}function Ue(D,ae){let q=p,K=!1;if(D){q=c.get(ae),q===void 0&&(q=[],c.set(ae,q));let fe=D.textures;if(q.length!==fe.length||q[0]!==i.COLOR_ATTACHMENT0){for(let he=0,Ne=fe.length;he<Ne;he++)q[he]=i.COLOR_ATTACHMENT0+he;q.length=fe.length,K=!0}}else q[0]!==i.BACK&&(q[0]=i.BACK,K=!0);K&&i.drawBuffers(q)}function ut(D){return g!==D?(i.useProgram(D),g=D,!0):!1}let qe={[ni]:i.FUNC_ADD,[tu]:i.FUNC_SUBTRACT,[nu]:i.FUNC_REVERSE_SUBTRACT};qe[iu]=i.MIN,qe[su]=i.MAX;let dt={[ru]:i.ZERO,[ou]:i.ONE,[au]:i.SRC_COLOR,[Po]:i.SRC_ALPHA,[du]:i.SRC_ALPHA_SATURATE,[uu]:i.DST_COLOR,[cu]:i.DST_ALPHA,[lu]:i.ONE_MINUS_SRC_COLOR,[Lo]:i.ONE_MINUS_SRC_ALPHA,[fu]:i.ONE_MINUS_DST_COLOR,[hu]:i.ONE_MINUS_DST_ALPHA,[pu]:i.CONSTANT_COLOR,[mu]:i.ONE_MINUS_CONSTANT_COLOR,[gu]:i.CONSTANT_ALPHA,[xu]:i.ONE_MINUS_CONSTANT_ALPHA};function z(D,ae,q,K,fe,he,Ne,ft,St,je){if(D===Fn){y===!0&&(ve(i.BLEND),y=!1);return}if(y===!1&&(re(i.BLEND),y=!0),D!==eu){if(D!==m||je!==x){if((f!==ni||v!==ni)&&(i.blendEquation(i.FUNC_ADD),f=ni,v=ni),je)switch(D){case zi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Hi:i.blendFunc(i.ONE,i.ONE);break;case Ol:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Bl:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case zi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Hi:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Ol:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Bl:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}b=null,S=null,I=null,w=null,T.set(0,0,0),A=0,m=D,x=je}return}fe=fe||ae,he=he||q,Ne=Ne||K,(ae!==f||fe!==v)&&(i.blendEquationSeparate(qe[ae],qe[fe]),f=ae,v=fe),(q!==b||K!==S||he!==I||Ne!==w)&&(i.blendFuncSeparate(dt[q],dt[K],dt[he],dt[Ne]),b=q,S=K,I=he,w=Ne),(ft.equals(T)===!1||St!==A)&&(i.blendColor(ft.r,ft.g,ft.b,St),T.copy(ft),A=St),m=D,x=!1}function kt(D,ae){D.side===Kt?ve(i.CULL_FACE):re(i.CULL_FACE);let q=D.side===Ut;ae&&(q=!q),Ge(q),D.blending===zi&&D.transparent===!1?z(Fn):z(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),o.setFunc(D.depthFunc),o.setTest(D.depthTest),o.setMask(D.depthWrite),r.setMask(D.colorWrite);let K=D.stencilWrite;a.setTest(K),K&&(a.setMask(D.stencilWriteMask),a.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),a.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),ot(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?re(i.SAMPLE_ALPHA_TO_COVERAGE):ve(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ge(D){_!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),_=D)}function We(D){D!==jh?(re(i.CULL_FACE),D!==C&&(D===zl?i.cullFace(i.BACK):D===Qh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ve(i.CULL_FACE),C=D}function Ae(D){D!==L&&(k&&i.lineWidth(D),L=D)}function ot(D,ae,q){D?(re(i.POLYGON_OFFSET_FILL),(U!==ae||O!==q)&&(i.polygonOffset(ae,q),U=ae,O=q)):ve(i.POLYGON_OFFSET_FILL)}function we(D){D?re(i.SCISSOR_TEST):ve(i.SCISSOR_TEST)}function R(D){D===void 0&&(D=i.TEXTURE0+W-1),ie!==D&&(i.activeTexture(D),ie=D)}function M(D,ae,q){q===void 0&&(ie===null?q=i.TEXTURE0+W-1:q=ie);let K=ee[q];K===void 0&&(K={type:void 0,texture:void 0},ee[q]=K),(K.type!==D||K.texture!==ae)&&(ie!==q&&(i.activeTexture(q),ie=q),i.bindTexture(D,ae||de[D]),K.type=D,K.texture=ae)}function B(){let D=ee[ie];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function J(){try{i.compressedTexImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function j(){try{i.compressedTexImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function $(){try{i.texSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function be(){try{i.texSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ce(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function pe(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ye(){try{i.texStorage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function te(){try{i.texStorage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function me(){try{i.texImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Re(){try{i.texImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ie(D){De.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),De.copy(D))}function ge(D){Y.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),Y.copy(D))}function Xe(D,ae){let q=u.get(ae);q===void 0&&(q=new WeakMap,u.set(ae,q));let K=q.get(D);K===void 0&&(K=i.getUniformBlockIndex(ae,D.name),q.set(D,K))}function Oe(D,ae){let K=u.get(ae).get(D);l.get(ae)!==K&&(i.uniformBlockBinding(ae,K,D.__bindingPointIndex),l.set(ae,K))}function st(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},ie=null,ee={},d={},c=new WeakMap,p=[],g=null,y=!1,m=null,f=null,b=null,S=null,v=null,I=null,w=null,T=new Ce(0,0,0),A=0,x=!1,_=null,C=null,L=null,U=null,O=null,De.set(0,0,i.canvas.width,i.canvas.height),Y.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:re,disable:ve,bindFramebuffer:Te,drawBuffers:Ue,useProgram:ut,setBlending:z,setMaterial:kt,setFlipSided:Ge,setCullFace:We,setLineWidth:Ae,setPolygonOffset:ot,setScissorTest:we,activeTexture:R,bindTexture:M,unbindTexture:B,compressedTexImage2D:J,compressedTexImage3D:j,texImage2D:me,texImage3D:Re,updateUBOMapping:Xe,uniformBlockBinding:Oe,texStorage2D:Ye,texStorage3D:te,texSubImage2D:$,texSubImage3D:be,compressedTexSubImage2D:ce,compressedTexSubImage3D:pe,scissor:Ie,viewport:ge,reset:st}}function Uc(i,e,t,n){let s=A0(n);switch(t){case Kc:return i*e;case Qc:return i*e;case eh:return i*e*2;case el:return i*e/s.components*s.byteLength;case tl:return i*e/s.components*s.byteLength;case th:return i*e*2/s.components*s.byteLength;case nl:return i*e*2/s.components*s.byteLength;case jc:return i*e*3/s.components*s.byteLength;case jt:return i*e*4/s.components*s.byteLength;case il:return i*e*4/s.components*s.byteLength;case lr:case cr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case hr:case ur:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Wo:case qo:return Math.max(i,16)*Math.max(e,8)/4;case Go:case Xo:return Math.max(i,8)*Math.max(e,8)/2;case Yo:case Zo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case $o:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Jo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ko:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case jo:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Qo:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case ea:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case ta:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case na:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case ia:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case sa:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case ra:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case oa:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case aa:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case la:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case ca:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case fr:case ha:case ua:return Math.ceil(i/4)*Math.ceil(e/4)*16;case nh:case fa:return Math.ceil(i/4)*Math.ceil(e/4)*8;case da:case pa:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function A0(i){switch(i){case bn:case Zc:return{byteLength:1,components:1};case ys:case $c:case Cs:return{byteLength:2,components:1};case ja:case Qa:return{byteLength:2,components:4};case oi:case Ka:case an:return{byteLength:4,components:1};case Jc:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function R0(i,e,t,n,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new Ee,h=new WeakMap,d,c=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,M){return p?new OffscreenCanvas(R,M):vs("canvas")}function y(R,M,B){let J=1,j=we(R);if((j.width>B||j.height>B)&&(J=B/Math.max(j.width,j.height)),J<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){let $=Math.floor(J*j.width),be=Math.floor(J*j.height);d===void 0&&(d=g($,be));let ce=M?g($,be):d;return ce.width=$,ce.height=be,ce.getContext("2d").drawImage(R,0,0,$,be),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+$+"x"+be+")."),ce}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),R;return R}function m(R){return R.generateMipmaps}function f(R){i.generateMipmap(R)}function b(R){return R.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?i.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function S(R,M,B,J,j=!1){if(R!==null){if(i[R]!==void 0)return i[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let $=M;if(M===i.RED&&(B===i.FLOAT&&($=i.R32F),B===i.HALF_FLOAT&&($=i.R16F),B===i.UNSIGNED_BYTE&&($=i.R8)),M===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&($=i.R8UI),B===i.UNSIGNED_SHORT&&($=i.R16UI),B===i.UNSIGNED_INT&&($=i.R32UI),B===i.BYTE&&($=i.R8I),B===i.SHORT&&($=i.R16I),B===i.INT&&($=i.R32I)),M===i.RG&&(B===i.FLOAT&&($=i.RG32F),B===i.HALF_FLOAT&&($=i.RG16F),B===i.UNSIGNED_BYTE&&($=i.RG8)),M===i.RG_INTEGER&&(B===i.UNSIGNED_BYTE&&($=i.RG8UI),B===i.UNSIGNED_SHORT&&($=i.RG16UI),B===i.UNSIGNED_INT&&($=i.RG32UI),B===i.BYTE&&($=i.RG8I),B===i.SHORT&&($=i.RG16I),B===i.INT&&($=i.RG32I)),M===i.RGB_INTEGER&&(B===i.UNSIGNED_BYTE&&($=i.RGB8UI),B===i.UNSIGNED_SHORT&&($=i.RGB16UI),B===i.UNSIGNED_INT&&($=i.RGB32UI),B===i.BYTE&&($=i.RGB8I),B===i.SHORT&&($=i.RGB16I),B===i.INT&&($=i.RGB32I)),M===i.RGBA_INTEGER&&(B===i.UNSIGNED_BYTE&&($=i.RGBA8UI),B===i.UNSIGNED_SHORT&&($=i.RGBA16UI),B===i.UNSIGNED_INT&&($=i.RGBA32UI),B===i.BYTE&&($=i.RGBA8I),B===i.SHORT&&($=i.RGBA16I),B===i.INT&&($=i.RGBA32I)),M===i.RGB&&B===i.UNSIGNED_INT_5_9_9_9_REV&&($=i.RGB9_E5),M===i.RGBA){let be=j?Hr:Ze.getTransfer(J);B===i.FLOAT&&($=i.RGBA32F),B===i.HALF_FLOAT&&($=i.RGBA16F),B===i.UNSIGNED_BYTE&&($=be===et?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT_4_4_4_4&&($=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&($=i.RGB5_A1)}return($===i.R16F||$===i.R32F||$===i.RG16F||$===i.RG32F||$===i.RGBA16F||$===i.RGBA32F)&&e.get("EXT_color_buffer_float"),$}function v(R,M){let B;return R?M===null||M===oi||M===Xi?B=i.DEPTH24_STENCIL8:M===an?B=i.DEPTH32F_STENCIL8:M===ys&&(B=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===oi||M===Xi?B=i.DEPTH_COMPONENT24:M===an?B=i.DEPTH_COMPONENT32F:M===ys&&(B=i.DEPTH_COMPONENT16),B}function I(R,M){return m(R)===!0||R.isFramebufferTexture&&R.minFilter!==Ot&&R.minFilter!==on?Math.log2(Math.max(M.width,M.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?M.mipmaps.length:1}function w(R){let M=R.target;M.removeEventListener("dispose",w),A(M),M.isVideoTexture&&h.delete(M)}function T(R){let M=R.target;M.removeEventListener("dispose",T),_(M)}function A(R){let M=n.get(R);if(M.__webglInit===void 0)return;let B=R.source,J=c.get(B);if(J){let j=J[M.__cacheKey];j.usedTimes--,j.usedTimes===0&&x(R),Object.keys(J).length===0&&c.delete(B)}n.remove(R)}function x(R){let M=n.get(R);i.deleteTexture(M.__webglTexture);let B=R.source,J=c.get(B);delete J[M.__cacheKey],o.memory.textures--}function _(R){let M=n.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),n.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let J=0;J<6;J++){if(Array.isArray(M.__webglFramebuffer[J]))for(let j=0;j<M.__webglFramebuffer[J].length;j++)i.deleteFramebuffer(M.__webglFramebuffer[J][j]);else i.deleteFramebuffer(M.__webglFramebuffer[J]);M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer[J])}else{if(Array.isArray(M.__webglFramebuffer))for(let J=0;J<M.__webglFramebuffer.length;J++)i.deleteFramebuffer(M.__webglFramebuffer[J]);else i.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&i.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let J=0;J<M.__webglColorRenderbuffer.length;J++)M.__webglColorRenderbuffer[J]&&i.deleteRenderbuffer(M.__webglColorRenderbuffer[J]);M.__webglDepthRenderbuffer&&i.deleteRenderbuffer(M.__webglDepthRenderbuffer)}let B=R.textures;for(let J=0,j=B.length;J<j;J++){let $=n.get(B[J]);$.__webglTexture&&(i.deleteTexture($.__webglTexture),o.memory.textures--),n.remove(B[J])}n.remove(R)}let C=0;function L(){C=0}function U(){let R=C;return R>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+s.maxTextures),C+=1,R}function O(R){let M=[];return M.push(R.wrapS),M.push(R.wrapT),M.push(R.wrapR||0),M.push(R.magFilter),M.push(R.minFilter),M.push(R.anisotropy),M.push(R.internalFormat),M.push(R.format),M.push(R.type),M.push(R.generateMipmaps),M.push(R.premultiplyAlpha),M.push(R.flipY),M.push(R.unpackAlignment),M.push(R.colorSpace),M.join()}function W(R,M){let B=n.get(R);if(R.isVideoTexture&&Ae(R),R.isRenderTargetTexture===!1&&R.version>0&&B.__version!==R.version){let J=R.image;if(J===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(J.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(B,R,M);return}}t.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+M)}function k(R,M){let B=n.get(R);if(R.version>0&&B.__version!==R.version){Y(B,R,M);return}t.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+M)}function Z(R,M){let B=n.get(R);if(R.version>0&&B.__version!==R.version){Y(B,R,M);return}t.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+M)}function H(R,M){let B=n.get(R);if(R.version>0&&B.__version!==R.version){Q(B,R,M);return}t.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+M)}let ie={[kn]:i.REPEAT,[si]:i.CLAMP_TO_EDGE,[Vo]:i.MIRRORED_REPEAT},ee={[Ot]:i.NEAREST,[Tu]:i.NEAREST_MIPMAP_NEAREST,[Fs]:i.NEAREST_MIPMAP_LINEAR,[on]:i.LINEAR,[Kr]:i.LINEAR_MIPMAP_NEAREST,[ri]:i.LINEAR_MIPMAP_LINEAR},X={[Iu]:i.NEVER,[Fu]:i.ALWAYS,[Pu]:i.LESS,[sh]:i.LEQUAL,[Lu]:i.EQUAL,[Nu]:i.GEQUAL,[Du]:i.GREATER,[Uu]:i.NOTEQUAL};function le(R,M){if(M.type===an&&e.has("OES_texture_float_linear")===!1&&(M.magFilter===on||M.magFilter===Kr||M.magFilter===Fs||M.magFilter===ri||M.minFilter===on||M.minFilter===Kr||M.minFilter===Fs||M.minFilter===ri)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(R,i.TEXTURE_WRAP_S,ie[M.wrapS]),i.texParameteri(R,i.TEXTURE_WRAP_T,ie[M.wrapT]),(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)&&i.texParameteri(R,i.TEXTURE_WRAP_R,ie[M.wrapR]),i.texParameteri(R,i.TEXTURE_MAG_FILTER,ee[M.magFilter]),i.texParameteri(R,i.TEXTURE_MIN_FILTER,ee[M.minFilter]),M.compareFunction&&(i.texParameteri(R,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(R,i.TEXTURE_COMPARE_FUNC,X[M.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===Ot||M.minFilter!==Fs&&M.minFilter!==ri||M.type===an&&e.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||n.get(M).__currentAnisotropy){let B=e.get("EXT_texture_filter_anisotropic");i.texParameterf(R,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,s.getMaxAnisotropy())),n.get(M).__currentAnisotropy=M.anisotropy}}}function De(R,M){let B=!1;R.__webglInit===void 0&&(R.__webglInit=!0,M.addEventListener("dispose",w));let J=M.source,j=c.get(J);j===void 0&&(j={},c.set(J,j));let $=O(M);if($!==R.__cacheKey){j[$]===void 0&&(j[$]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,B=!0),j[$].usedTimes++;let be=j[R.__cacheKey];be!==void 0&&(j[R.__cacheKey].usedTimes--,be.usedTimes===0&&x(M)),R.__cacheKey=$,R.__webglTexture=j[$].texture}return B}function Y(R,M,B){let J=i.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(J=i.TEXTURE_2D_ARRAY),M.isData3DTexture&&(J=i.TEXTURE_3D);let j=De(R,M),$=M.source;t.bindTexture(J,R.__webglTexture,i.TEXTURE0+B);let be=n.get($);if($.version!==be.__version||j===!0){t.activeTexture(i.TEXTURE0+B);let ce=Ze.getPrimaries(Ze.workingColorSpace),pe=M.colorSpace===Un?null:Ze.getPrimaries(M.colorSpace),Ye=M.colorSpace===Un||ce===pe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ye);let te=y(M.image,!1,s.maxTextureSize);te=ot(M,te);let me=r.convert(M.format,M.colorSpace),Re=r.convert(M.type),Ie=S(M.internalFormat,me,Re,M.colorSpace,M.isVideoTexture);le(J,M);let ge,Xe=M.mipmaps,Oe=M.isVideoTexture!==!0,st=be.__version===void 0||j===!0,D=$.dataReady,ae=I(M,te);if(M.isDepthTexture)Ie=v(M.format===qi,M.type),st&&(Oe?t.texStorage2D(i.TEXTURE_2D,1,Ie,te.width,te.height):t.texImage2D(i.TEXTURE_2D,0,Ie,te.width,te.height,0,me,Re,null));else if(M.isDataTexture)if(Xe.length>0){Oe&&st&&t.texStorage2D(i.TEXTURE_2D,ae,Ie,Xe[0].width,Xe[0].height);for(let q=0,K=Xe.length;q<K;q++)ge=Xe[q],Oe?D&&t.texSubImage2D(i.TEXTURE_2D,q,0,0,ge.width,ge.height,me,Re,ge.data):t.texImage2D(i.TEXTURE_2D,q,Ie,ge.width,ge.height,0,me,Re,ge.data);M.generateMipmaps=!1}else Oe?(st&&t.texStorage2D(i.TEXTURE_2D,ae,Ie,te.width,te.height),D&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,te.width,te.height,me,Re,te.data)):t.texImage2D(i.TEXTURE_2D,0,Ie,te.width,te.height,0,me,Re,te.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){Oe&&st&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ae,Ie,Xe[0].width,Xe[0].height,te.depth);for(let q=0,K=Xe.length;q<K;q++)if(ge=Xe[q],M.format!==jt)if(me!==null)if(Oe){if(D)if(M.layerUpdates.size>0){let fe=Uc(ge.width,ge.height,M.format,M.type);for(let he of M.layerUpdates){let Ne=ge.data.subarray(he*fe/ge.data.BYTES_PER_ELEMENT,(he+1)*fe/ge.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,q,0,0,he,ge.width,ge.height,1,me,Ne)}M.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,q,0,0,0,ge.width,ge.height,te.depth,me,ge.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,q,Ie,ge.width,ge.height,te.depth,0,ge.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Oe?D&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,q,0,0,0,ge.width,ge.height,te.depth,me,Re,ge.data):t.texImage3D(i.TEXTURE_2D_ARRAY,q,Ie,ge.width,ge.height,te.depth,0,me,Re,ge.data)}else{Oe&&st&&t.texStorage2D(i.TEXTURE_2D,ae,Ie,Xe[0].width,Xe[0].height);for(let q=0,K=Xe.length;q<K;q++)ge=Xe[q],M.format!==jt?me!==null?Oe?D&&t.compressedTexSubImage2D(i.TEXTURE_2D,q,0,0,ge.width,ge.height,me,ge.data):t.compressedTexImage2D(i.TEXTURE_2D,q,Ie,ge.width,ge.height,0,ge.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Oe?D&&t.texSubImage2D(i.TEXTURE_2D,q,0,0,ge.width,ge.height,me,Re,ge.data):t.texImage2D(i.TEXTURE_2D,q,Ie,ge.width,ge.height,0,me,Re,ge.data)}else if(M.isDataArrayTexture)if(Oe){if(st&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ae,Ie,te.width,te.height,te.depth),D)if(M.layerUpdates.size>0){let q=Uc(te.width,te.height,M.format,M.type);for(let K of M.layerUpdates){let fe=te.data.subarray(K*q/te.data.BYTES_PER_ELEMENT,(K+1)*q/te.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,K,te.width,te.height,1,me,Re,fe)}M.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,te.width,te.height,te.depth,me,Re,te.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Ie,te.width,te.height,te.depth,0,me,Re,te.data);else if(M.isData3DTexture)Oe?(st&&t.texStorage3D(i.TEXTURE_3D,ae,Ie,te.width,te.height,te.depth),D&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,te.width,te.height,te.depth,me,Re,te.data)):t.texImage3D(i.TEXTURE_3D,0,Ie,te.width,te.height,te.depth,0,me,Re,te.data);else if(M.isFramebufferTexture){if(st)if(Oe)t.texStorage2D(i.TEXTURE_2D,ae,Ie,te.width,te.height);else{let q=te.width,K=te.height;for(let fe=0;fe<ae;fe++)t.texImage2D(i.TEXTURE_2D,fe,Ie,q,K,0,me,Re,null),q>>=1,K>>=1}}else if(Xe.length>0){if(Oe&&st){let q=we(Xe[0]);t.texStorage2D(i.TEXTURE_2D,ae,Ie,q.width,q.height)}for(let q=0,K=Xe.length;q<K;q++)ge=Xe[q],Oe?D&&t.texSubImage2D(i.TEXTURE_2D,q,0,0,me,Re,ge):t.texImage2D(i.TEXTURE_2D,q,Ie,me,Re,ge);M.generateMipmaps=!1}else if(Oe){if(st){let q=we(te);t.texStorage2D(i.TEXTURE_2D,ae,Ie,q.width,q.height)}D&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,me,Re,te)}else t.texImage2D(i.TEXTURE_2D,0,Ie,me,Re,te);m(M)&&f(J),be.__version=$.version,M.onUpdate&&M.onUpdate(M)}R.__version=M.version}function Q(R,M,B){if(M.image.length!==6)return;let J=De(R,M),j=M.source;t.bindTexture(i.TEXTURE_CUBE_MAP,R.__webglTexture,i.TEXTURE0+B);let $=n.get(j);if(j.version!==$.__version||J===!0){t.activeTexture(i.TEXTURE0+B);let be=Ze.getPrimaries(Ze.workingColorSpace),ce=M.colorSpace===Un?null:Ze.getPrimaries(M.colorSpace),pe=M.colorSpace===Un||be===ce?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,pe);let Ye=M.isCompressedTexture||M.image[0].isCompressedTexture,te=M.image[0]&&M.image[0].isDataTexture,me=[];for(let K=0;K<6;K++)!Ye&&!te?me[K]=y(M.image[K],!0,s.maxCubemapSize):me[K]=te?M.image[K].image:M.image[K],me[K]=ot(M,me[K]);let Re=me[0],Ie=r.convert(M.format,M.colorSpace),ge=r.convert(M.type),Xe=S(M.internalFormat,Ie,ge,M.colorSpace),Oe=M.isVideoTexture!==!0,st=$.__version===void 0||J===!0,D=j.dataReady,ae=I(M,Re);le(i.TEXTURE_CUBE_MAP,M);let q;if(Ye){Oe&&st&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ae,Xe,Re.width,Re.height);for(let K=0;K<6;K++){q=me[K].mipmaps;for(let fe=0;fe<q.length;fe++){let he=q[fe];M.format!==jt?Ie!==null?Oe?D&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe,0,0,he.width,he.height,Ie,he.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe,Xe,he.width,he.height,0,he.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Oe?D&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe,0,0,he.width,he.height,Ie,ge,he.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe,Xe,he.width,he.height,0,Ie,ge,he.data)}}}else{if(q=M.mipmaps,Oe&&st){q.length>0&&ae++;let K=we(me[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,ae,Xe,K.width,K.height)}for(let K=0;K<6;K++)if(te){Oe?D&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,me[K].width,me[K].height,Ie,ge,me[K].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Xe,me[K].width,me[K].height,0,Ie,ge,me[K].data);for(let fe=0;fe<q.length;fe++){let Ne=q[fe].image[K].image;Oe?D&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe+1,0,0,Ne.width,Ne.height,Ie,ge,Ne.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe+1,Xe,Ne.width,Ne.height,0,Ie,ge,Ne.data)}}else{Oe?D&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,Ie,ge,me[K]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Xe,Ie,ge,me[K]);for(let fe=0;fe<q.length;fe++){let he=q[fe];Oe?D&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe+1,0,0,Ie,ge,he.image[K]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+K,fe+1,Xe,Ie,ge,he.image[K])}}}m(M)&&f(i.TEXTURE_CUBE_MAP),$.__version=j.version,M.onUpdate&&M.onUpdate(M)}R.__version=M.version}function de(R,M,B,J,j,$){let be=r.convert(B.format,B.colorSpace),ce=r.convert(B.type),pe=S(B.internalFormat,be,ce,B.colorSpace),Ye=n.get(M),te=n.get(B);if(te.__renderTarget=M,!Ye.__hasExternalTextures){let me=Math.max(1,M.width>>$),Re=Math.max(1,M.height>>$);j===i.TEXTURE_3D||j===i.TEXTURE_2D_ARRAY?t.texImage3D(j,$,pe,me,Re,M.depth,0,be,ce,null):t.texImage2D(j,$,pe,me,Re,0,be,ce,null)}t.bindFramebuffer(i.FRAMEBUFFER,R),We(M)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,J,j,te.__webglTexture,0,Ge(M)):(j===i.TEXTURE_2D||j>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,J,j,te.__webglTexture,$),t.bindFramebuffer(i.FRAMEBUFFER,null)}function re(R,M,B){if(i.bindRenderbuffer(i.RENDERBUFFER,R),M.depthBuffer){let J=M.depthTexture,j=J&&J.isDepthTexture?J.type:null,$=v(M.stencilBuffer,j),be=M.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=Ge(M);We(M)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ce,$,M.width,M.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,ce,$,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,$,M.width,M.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,be,i.RENDERBUFFER,R)}else{let J=M.textures;for(let j=0;j<J.length;j++){let $=J[j],be=r.convert($.format,$.colorSpace),ce=r.convert($.type),pe=S($.internalFormat,be,ce,$.colorSpace),Ye=Ge(M);B&&We(M)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ye,pe,M.width,M.height):We(M)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ye,pe,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,pe,M.width,M.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function ve(R,M){if(M&&M.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,R),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let J=n.get(M.depthTexture);J.__renderTarget=M,(!J.__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),W(M.depthTexture,0);let j=J.__webglTexture,$=Ge(M);if(M.depthTexture.format===Oi)We(M)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0,$):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0);else if(M.depthTexture.format===qi)We(M)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0,$):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0);else throw new Error("Unknown depthTexture format")}function Te(R){let M=n.get(R),B=R.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==R.depthTexture){let J=R.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),J){let j=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,J.removeEventListener("dispose",j)};J.addEventListener("dispose",j),M.__depthDisposeCallback=j}M.__boundDepthTexture=J}if(R.depthTexture&&!M.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");ve(M.__webglFramebuffer,R)}else if(B){M.__webglDepthbuffer=[];for(let J=0;J<6;J++)if(t.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[J]),M.__webglDepthbuffer[J]===void 0)M.__webglDepthbuffer[J]=i.createRenderbuffer(),re(M.__webglDepthbuffer[J],R,!1);else{let j=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,$=M.__webglDepthbuffer[J];i.bindRenderbuffer(i.RENDERBUFFER,$),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,$)}}else if(t.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=i.createRenderbuffer(),re(M.__webglDepthbuffer,R,!1);else{let J=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,j=M.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,j),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,j)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ue(R,M,B){let J=n.get(R);M!==void 0&&de(J.__webglFramebuffer,R,R.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&Te(R)}function ut(R){let M=R.texture,B=n.get(R),J=n.get(M);R.addEventListener("dispose",T);let j=R.textures,$=R.isWebGLCubeRenderTarget===!0,be=j.length>1;if(be||(J.__webglTexture===void 0&&(J.__webglTexture=i.createTexture()),J.__version=M.version,o.memory.textures++),$){B.__webglFramebuffer=[];for(let ce=0;ce<6;ce++)if(M.mipmaps&&M.mipmaps.length>0){B.__webglFramebuffer[ce]=[];for(let pe=0;pe<M.mipmaps.length;pe++)B.__webglFramebuffer[ce][pe]=i.createFramebuffer()}else B.__webglFramebuffer[ce]=i.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){B.__webglFramebuffer=[];for(let ce=0;ce<M.mipmaps.length;ce++)B.__webglFramebuffer[ce]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(be)for(let ce=0,pe=j.length;ce<pe;ce++){let Ye=n.get(j[ce]);Ye.__webglTexture===void 0&&(Ye.__webglTexture=i.createTexture(),o.memory.textures++)}if(R.samples>0&&We(R)===!1){B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let ce=0;ce<j.length;ce++){let pe=j[ce];B.__webglColorRenderbuffer[ce]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[ce]);let Ye=r.convert(pe.format,pe.colorSpace),te=r.convert(pe.type),me=S(pe.internalFormat,Ye,te,pe.colorSpace,R.isXRRenderTarget===!0),Re=Ge(R);i.renderbufferStorageMultisample(i.RENDERBUFFER,Re,me,R.width,R.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.RENDERBUFFER,B.__webglColorRenderbuffer[ce])}i.bindRenderbuffer(i.RENDERBUFFER,null),R.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),re(B.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if($){t.bindTexture(i.TEXTURE_CUBE_MAP,J.__webglTexture),le(i.TEXTURE_CUBE_MAP,M);for(let ce=0;ce<6;ce++)if(M.mipmaps&&M.mipmaps.length>0)for(let pe=0;pe<M.mipmaps.length;pe++)de(B.__webglFramebuffer[ce][pe],R,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,pe);else de(B.__webglFramebuffer[ce],R,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0);m(M)&&f(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(be){for(let ce=0,pe=j.length;ce<pe;ce++){let Ye=j[ce],te=n.get(Ye);t.bindTexture(i.TEXTURE_2D,te.__webglTexture),le(i.TEXTURE_2D,Ye),de(B.__webglFramebuffer,R,Ye,i.COLOR_ATTACHMENT0+ce,i.TEXTURE_2D,0),m(Ye)&&f(i.TEXTURE_2D)}t.unbindTexture()}else{let ce=i.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(ce=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ce,J.__webglTexture),le(ce,M),M.mipmaps&&M.mipmaps.length>0)for(let pe=0;pe<M.mipmaps.length;pe++)de(B.__webglFramebuffer[pe],R,M,i.COLOR_ATTACHMENT0,ce,pe);else de(B.__webglFramebuffer,R,M,i.COLOR_ATTACHMENT0,ce,0);m(M)&&f(ce),t.unbindTexture()}R.depthBuffer&&Te(R)}function qe(R){let M=R.textures;for(let B=0,J=M.length;B<J;B++){let j=M[B];if(m(j)){let $=b(R),be=n.get(j).__webglTexture;t.bindTexture($,be),f($),t.unbindTexture()}}}let dt=[],z=[];function kt(R){if(R.samples>0){if(We(R)===!1){let M=R.textures,B=R.width,J=R.height,j=i.COLOR_BUFFER_BIT,$=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,be=n.get(R),ce=M.length>1;if(ce)for(let pe=0;pe<M.length;pe++)t.bindFramebuffer(i.FRAMEBUFFER,be.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,be.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,be.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,be.__webglFramebuffer);for(let pe=0;pe<M.length;pe++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(j|=i.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(j|=i.STENCIL_BUFFER_BIT)),ce){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,be.__webglColorRenderbuffer[pe]);let Ye=n.get(M[pe]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Ye,0)}i.blitFramebuffer(0,0,B,J,0,0,B,J,j,i.NEAREST),l===!0&&(dt.length=0,z.length=0,dt.push(i.COLOR_ATTACHMENT0+pe),R.depthBuffer&&R.resolveDepthBuffer===!1&&(dt.push($),z.push($),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,z)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,dt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ce)for(let pe=0;pe<M.length;pe++){t.bindFramebuffer(i.FRAMEBUFFER,be.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.RENDERBUFFER,be.__webglColorRenderbuffer[pe]);let Ye=n.get(M[pe]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,be.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.TEXTURE_2D,Ye,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,be.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){let M=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[M])}}}function Ge(R){return Math.min(s.maxSamples,R.samples)}function We(R){let M=n.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function Ae(R){let M=o.render.frame;h.get(R)!==M&&(h.set(R,M),R.update())}function ot(R,M){let B=R.colorSpace,J=R.format,j=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||B!==Ji&&B!==Un&&(Ze.getTransfer(B)===et?(J!==jt||j!==bn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),M}function we(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(u.width=R.naturalWidth||R.width,u.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(u.width=R.displayWidth,u.height=R.displayHeight):(u.width=R.width,u.height=R.height),u}this.allocateTextureUnit=U,this.resetTextureUnits=L,this.setTexture2D=W,this.setTexture2DArray=k,this.setTexture3D=Z,this.setTextureCube=H,this.rebindTextures=Ue,this.setupRenderTarget=ut,this.updateRenderTargetMipmap=qe,this.updateMultisampleRenderTarget=kt,this.setupDepthRenderbuffer=Te,this.setupFrameBufferTexture=de,this.useMultisampledRTT=We}function C0(i,e){function t(n,s=Un){let r,o=Ze.getTransfer(s);if(n===bn)return i.UNSIGNED_BYTE;if(n===ja)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Qa)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Jc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Zc)return i.BYTE;if(n===$c)return i.SHORT;if(n===ys)return i.UNSIGNED_SHORT;if(n===Ka)return i.INT;if(n===oi)return i.UNSIGNED_INT;if(n===an)return i.FLOAT;if(n===Cs)return i.HALF_FLOAT;if(n===Kc)return i.ALPHA;if(n===jc)return i.RGB;if(n===jt)return i.RGBA;if(n===Qc)return i.LUMINANCE;if(n===eh)return i.LUMINANCE_ALPHA;if(n===Oi)return i.DEPTH_COMPONENT;if(n===qi)return i.DEPTH_STENCIL;if(n===el)return i.RED;if(n===tl)return i.RED_INTEGER;if(n===th)return i.RG;if(n===nl)return i.RG_INTEGER;if(n===il)return i.RGBA_INTEGER;if(n===lr||n===cr||n===hr||n===ur)if(o===et)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===lr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===cr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===hr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ur)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===lr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===cr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===hr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ur)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Go||n===Wo||n===Xo||n===qo)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Go)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Wo)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Xo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===qo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Yo||n===Zo||n===$o)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Yo||n===Zo)return o===et?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===$o)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Jo||n===Ko||n===jo||n===Qo||n===ea||n===ta||n===na||n===ia||n===sa||n===ra||n===oa||n===aa||n===la||n===ca)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Jo)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ko)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===jo)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Qo)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ea)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ta)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===na)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ia)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===sa)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===ra)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===oa)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===aa)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===la)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===ca)return o===et?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===fr||n===ha||n===ua)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===fr)return o===et?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===ha)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===ua)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===nh||n===fa||n===da||n===pa)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===fr)return r.COMPRESSED_RED_RGTC1_EXT;if(n===fa)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===da)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===pa)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Xi?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var Pa=class extends Tt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},At=class extends Rt{constructor(){super(),this.isGroup=!0,this.type="Group"}},I0={type:"move"},_s=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new At,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new At,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new At,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,u=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(u&&e.hand){o=!0;for(let y of e.hand.values()){let m=t.getJointPose(y,n),f=this._getHandJoint(u,y);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}let h=u.joints["index-finger-tip"],d=u.joints["thumb-tip"],c=h.position.distanceTo(d.position),p=.02,g=.005;u.inputState.pinching&&c>p+g?(u.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!u.inputState.pinching&&c<=p-g&&(u.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(I0)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),u!==null&&(u.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new At;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},P0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,L0=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,La=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){let s=new Pt,r=e.properties.get(s);r.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Bt({vertexShader:P0,fragmentShader:L0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new it(new Zi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Da=class extends Hn{constructor(e,t){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,u=null,h=null,d=null,c=null,p=null,g=null,y=new La,m=t.getContextAttributes(),f=null,b=null,S=[],v=[],I=new Ee,w=null,T=new Tt;T.viewport=new nt;let A=new Tt;A.viewport=new nt;let x=[T,A],_=new Pa,C=null,L=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let Q=S[Y];return Q===void 0&&(Q=new _s,S[Y]=Q),Q.getTargetRaySpace()},this.getControllerGrip=function(Y){let Q=S[Y];return Q===void 0&&(Q=new _s,S[Y]=Q),Q.getGripSpace()},this.getHand=function(Y){let Q=S[Y];return Q===void 0&&(Q=new _s,S[Y]=Q),Q.getHandSpace()};function U(Y){let Q=v.indexOf(Y.inputSource);if(Q===-1)return;let de=S[Q];de!==void 0&&(de.update(Y.inputSource,Y.frame,u||o),de.dispatchEvent({type:Y.type,data:Y.inputSource}))}function O(){s.removeEventListener("select",U),s.removeEventListener("selectstart",U),s.removeEventListener("selectend",U),s.removeEventListener("squeeze",U),s.removeEventListener("squeezestart",U),s.removeEventListener("squeezeend",U),s.removeEventListener("end",O),s.removeEventListener("inputsourceschange",W);for(let Y=0;Y<S.length;Y++){let Q=v[Y];Q!==null&&(v[Y]=null,S[Y].disconnect(Q))}C=null,L=null,y.reset(),e.setRenderTarget(f),p=null,c=null,d=null,s=null,b=null,De.stop(),n.isPresenting=!1,e.setPixelRatio(w),e.setSize(I.width,I.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){a=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return u||o},this.setReferenceSpace=function(Y){u=Y},this.getBaseLayer=function(){return c!==null?c:p},this.getBinding=function(){return d},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(f=e.getRenderTarget(),s.addEventListener("select",U),s.addEventListener("selectstart",U),s.addEventListener("selectend",U),s.addEventListener("squeeze",U),s.addEventListener("squeezestart",U),s.addEventListener("squeezeend",U),s.addEventListener("end",O),s.addEventListener("inputsourceschange",W),m.xrCompatible!==!0&&await t.makeXRCompatible(),w=e.getPixelRatio(),e.getSize(I),s.renderState.layers===void 0){let Q={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,Q),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),b=new Mn(p.framebufferWidth,p.framebufferHeight,{format:jt,type:bn,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let Q=null,de=null,re=null;m.depth&&(re=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Q=m.stencil?qi:Oi,de=m.stencil?Xi:oi);let ve={colorFormat:t.RGBA8,depthFormat:re,scaleFactor:r};d=new XRWebGLBinding(s,t),c=d.createProjectionLayer(ve),s.updateRenderState({layers:[c]}),e.setPixelRatio(1),e.setSize(c.textureWidth,c.textureHeight,!1),b=new Mn(c.textureWidth,c.textureHeight,{format:jt,type:bn,depthTexture:new Er(c.textureWidth,c.textureHeight,de,void 0,void 0,void 0,void 0,void 0,void 0,Q),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:c.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(l),u=null,o=await s.requestReferenceSpace(a),De.setContext(s),De.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return y.getDepthTexture()};function W(Y){for(let Q=0;Q<Y.removed.length;Q++){let de=Y.removed[Q],re=v.indexOf(de);re>=0&&(v[re]=null,S[re].disconnect(de))}for(let Q=0;Q<Y.added.length;Q++){let de=Y.added[Q],re=v.indexOf(de);if(re===-1){for(let Te=0;Te<S.length;Te++)if(Te>=v.length){v.push(de),re=Te;break}else if(v[Te]===null){v[Te]=de,re=Te;break}if(re===-1)break}let ve=S[re];ve&&ve.connect(de)}}let k=new P,Z=new P;function H(Y,Q,de){k.setFromMatrixPosition(Q.matrixWorld),Z.setFromMatrixPosition(de.matrixWorld);let re=k.distanceTo(Z),ve=Q.projectionMatrix.elements,Te=de.projectionMatrix.elements,Ue=ve[14]/(ve[10]-1),ut=ve[14]/(ve[10]+1),qe=(ve[9]+1)/ve[5],dt=(ve[9]-1)/ve[5],z=(ve[8]-1)/ve[0],kt=(Te[8]+1)/Te[0],Ge=Ue*z,We=Ue*kt,Ae=re/(-z+kt),ot=Ae*-z;if(Q.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(ot),Y.translateZ(Ae),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),ve[10]===-1)Y.projectionMatrix.copy(Q.projectionMatrix),Y.projectionMatrixInverse.copy(Q.projectionMatrixInverse);else{let we=Ue+Ae,R=ut+Ae,M=Ge-ot,B=We+(re-ot),J=qe*ut/R*we,j=dt*ut/R*we;Y.projectionMatrix.makePerspective(M,B,J,j,we,R),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function ie(Y,Q){Q===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(Q.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let Q=Y.near,de=Y.far;y.texture!==null&&(y.depthNear>0&&(Q=y.depthNear),y.depthFar>0&&(de=y.depthFar)),_.near=A.near=T.near=Q,_.far=A.far=T.far=de,(C!==_.near||L!==_.far)&&(s.updateRenderState({depthNear:_.near,depthFar:_.far}),C=_.near,L=_.far),T.layers.mask=Y.layers.mask|2,A.layers.mask=Y.layers.mask|4,_.layers.mask=T.layers.mask|A.layers.mask;let re=Y.parent,ve=_.cameras;ie(_,re);for(let Te=0;Te<ve.length;Te++)ie(ve[Te],re);ve.length===2?H(_,T,A):_.projectionMatrix.copy(T.projectionMatrix),ee(Y,_,re)};function ee(Y,Q,de){de===null?Y.matrix.copy(Q.matrixWorld):(Y.matrix.copy(de.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(Q.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(Q.projectionMatrix),Y.projectionMatrixInverse.copy(Q.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=xa*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return _},this.getFoveation=function(){if(!(c===null&&p===null))return l},this.setFoveation=function(Y){l=Y,c!==null&&(c.fixedFoveation=Y),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Y)},this.hasDepthSensing=function(){return y.texture!==null},this.getDepthSensingMesh=function(){return y.getMesh(_)};let X=null;function le(Y,Q){if(h=Q.getViewerPose(u||o),g=Q,h!==null){let de=h.views;p!==null&&(e.setRenderTargetFramebuffer(b,p.framebuffer),e.setRenderTarget(b));let re=!1;de.length!==_.cameras.length&&(_.cameras.length=0,re=!0);for(let Te=0;Te<de.length;Te++){let Ue=de[Te],ut=null;if(p!==null)ut=p.getViewport(Ue);else{let dt=d.getViewSubImage(c,Ue);ut=dt.viewport,Te===0&&(e.setRenderTargetTextures(b,dt.colorTexture,c.ignoreDepthValues?void 0:dt.depthStencilTexture),e.setRenderTarget(b))}let qe=x[Te];qe===void 0&&(qe=new Tt,qe.layers.enable(Te),qe.viewport=new nt,x[Te]=qe),qe.matrix.fromArray(Ue.transform.matrix),qe.matrix.decompose(qe.position,qe.quaternion,qe.scale),qe.projectionMatrix.fromArray(Ue.projectionMatrix),qe.projectionMatrixInverse.copy(qe.projectionMatrix).invert(),qe.viewport.set(ut.x,ut.y,ut.width,ut.height),Te===0&&(_.matrix.copy(qe.matrix),_.matrix.decompose(_.position,_.quaternion,_.scale)),re===!0&&_.cameras.push(qe)}let ve=s.enabledFeatures;if(ve&&ve.includes("depth-sensing")){let Te=d.getDepthInformation(de[0]);Te&&Te.isValid&&Te.texture&&y.init(e,Te,s.renderState)}}for(let de=0;de<S.length;de++){let re=v[de],ve=S[de];re!==null&&ve!==void 0&&ve.update(re,Q,u||o)}X&&X(Y,Q),Q.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Q}),g=null}let De=new lh;De.setAnimationLoop(le),this.setAnimationLoop=function(Y){X=Y},this.dispose=function(){}}},ei=new Wt,D0=new Le;function U0(i,e){function t(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function n(m,f){f.color.getRGB(m.fogColor.value,ah(i)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function s(m,f,b,S,v){f.isMeshBasicMaterial||f.isMeshLambertMaterial?r(m,f):f.isMeshToonMaterial?(r(m,f),d(m,f)):f.isMeshPhongMaterial?(r(m,f),h(m,f)):f.isMeshStandardMaterial?(r(m,f),c(m,f),f.isMeshPhysicalMaterial&&p(m,f,v)):f.isMeshMatcapMaterial?(r(m,f),g(m,f)):f.isMeshDepthMaterial?r(m,f):f.isMeshDistanceMaterial?(r(m,f),y(m,f)):f.isMeshNormalMaterial?r(m,f):f.isLineBasicMaterial?(o(m,f),f.isLineDashedMaterial&&a(m,f)):f.isPointsMaterial?l(m,f,b,S):f.isSpriteMaterial?u(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,t(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===Ut&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,t(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===Ut&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,t(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,t(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,t(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);let b=e.get(f),S=b.envMap,v=b.envMapRotation;S&&(m.envMap.value=S,ei.copy(v),ei.x*=-1,ei.y*=-1,ei.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(ei.y*=-1,ei.z*=-1),m.envMapRotation.value.setFromMatrix4(D0.makeRotationFromEuler(ei)),m.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,t(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,t(f.aoMap,m.aoMapTransform))}function o(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform))}function a(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,b,S){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*b,m.scale.value=S*.5,f.map&&(m.map.value=f.map,t(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function u(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function h(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function d(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function c(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,t(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,t(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,b){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,t(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,t(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,t(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,t(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,t(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Ut&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,t(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,t(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=b.texture,m.transmissionSamplerSize.value.set(b.width,b.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,t(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,t(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,t(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,t(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,t(f.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,f){f.matcap&&(m.matcap.value=f.matcap)}function y(m,f){let b=e.get(f).light;m.referencePosition.value.setFromMatrixPosition(b.matrixWorld),m.nearDistance.value=b.shadow.camera.near,m.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function N0(i,e,t,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,S){let v=S.program;n.uniformBlockBinding(b,v)}function u(b,S){let v=s[b.id];v===void 0&&(g(b),v=h(b),s[b.id]=v,b.addEventListener("dispose",m));let I=S.program;n.updateUBOMapping(b,I);let w=e.render.frame;r[b.id]!==w&&(c(b),r[b.id]=w)}function h(b){let S=d();b.__bindingPointIndex=S;let v=i.createBuffer(),I=b.__size,w=b.usage;return i.bindBuffer(i.UNIFORM_BUFFER,v),i.bufferData(i.UNIFORM_BUFFER,I,w),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,S,v),v}function d(){for(let b=0;b<a;b++)if(o.indexOf(b)===-1)return o.push(b),b;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function c(b){let S=s[b.id],v=b.uniforms,I=b.__cache;i.bindBuffer(i.UNIFORM_BUFFER,S);for(let w=0,T=v.length;w<T;w++){let A=Array.isArray(v[w])?v[w]:[v[w]];for(let x=0,_=A.length;x<_;x++){let C=A[x];if(p(C,w,x,I)===!0){let L=C.__offset,U=Array.isArray(C.value)?C.value:[C.value],O=0;for(let W=0;W<U.length;W++){let k=U[W],Z=y(k);typeof k=="number"||typeof k=="boolean"?(C.__data[0]=k,i.bufferSubData(i.UNIFORM_BUFFER,L+O,C.__data)):k.isMatrix3?(C.__data[0]=k.elements[0],C.__data[1]=k.elements[1],C.__data[2]=k.elements[2],C.__data[3]=0,C.__data[4]=k.elements[3],C.__data[5]=k.elements[4],C.__data[6]=k.elements[5],C.__data[7]=0,C.__data[8]=k.elements[6],C.__data[9]=k.elements[7],C.__data[10]=k.elements[8],C.__data[11]=0):(k.toArray(C.__data,O),O+=Z.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,L,C.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(b,S,v,I){let w=b.value,T=S+"_"+v;if(I[T]===void 0)return typeof w=="number"||typeof w=="boolean"?I[T]=w:I[T]=w.clone(),!0;{let A=I[T];if(typeof w=="number"||typeof w=="boolean"){if(A!==w)return I[T]=w,!0}else if(A.equals(w)===!1)return A.copy(w),!0}return!1}function g(b){let S=b.uniforms,v=0,I=16;for(let T=0,A=S.length;T<A;T++){let x=Array.isArray(S[T])?S[T]:[S[T]];for(let _=0,C=x.length;_<C;_++){let L=x[_],U=Array.isArray(L.value)?L.value:[L.value];for(let O=0,W=U.length;O<W;O++){let k=U[O],Z=y(k),H=v%I,ie=H%Z.boundary,ee=H+ie;v+=ie,ee!==0&&I-ee<Z.storage&&(v+=I-ee),L.__data=new Float32Array(Z.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=v,v+=Z.storage}}}let w=v%I;return w>0&&(v+=I-w),b.__size=v,b.__cache={},this}function y(b){let S={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(S.boundary=4,S.storage=4):b.isVector2?(S.boundary=8,S.storage=8):b.isVector3||b.isColor?(S.boundary=16,S.storage=12):b.isVector4?(S.boundary=16,S.storage=16):b.isMatrix3?(S.boundary=48,S.storage=48):b.isMatrix4?(S.boundary=64,S.storage=64):b.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",b),S}function m(b){let S=b.target;S.removeEventListener("dispose",m);let v=o.indexOf(S.__bindingPointIndex);o.splice(v,1),i.deleteBuffer(s[S.id]),delete s[S.id],delete r[S.id]}function f(){for(let b in s)i.deleteBuffer(s[b]);o=[],s={},r={}}return{bind:l,update:u,dispose:f}}var wr=class{constructor(e={}){let{canvas:t=Ou(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:u=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reverseDepthBuffer:c=!1}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=o;let g=new Uint32Array(4),y=new Int32Array(4),m=null,f=null,b=[],S=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=_t,this.toneMapping=zn,this.toneMappingExposure=1;let v=this,I=!1,w=0,T=0,A=null,x=-1,_=null,C=new nt,L=new nt,U=null,O=new Ce(0),W=0,k=t.width,Z=t.height,H=1,ie=null,ee=null,X=new nt(0,0,k,Z),le=new nt(0,0,k,Z),De=!1,Y=new Ms,Q=!1,de=!1,re=new Le,ve=new Le,Te=new P,Ue=new nt,ut={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},qe=!1;function dt(){return A===null?H:1}let z=n;function kt(E,N){return t.getContext(E,N)}try{let E={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:u,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r170"),t.addEventListener("webglcontextlost",K,!1),t.addEventListener("webglcontextrestored",fe,!1),t.addEventListener("webglcontextcreationerror",he,!1),z===null){let N="webgl2";if(z=kt(N,E),z===null)throw kt(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let Ge,We,Ae,ot,we,R,M,B,J,j,$,be,ce,pe,Ye,te,me,Re,Ie,ge,Xe,Oe,st,D;function ae(){Ge=new Kp(z),Ge.init(),Oe=new C0(z,Ge),We=new Xp(z,Ge,e,Oe),Ae=new T0(z,Ge),We.reverseDepthBuffer&&c&&Ae.buffers.depth.setReversed(!0),ot=new em(z),we=new d0,R=new R0(z,Ge,Ae,we,We,Oe,ot),M=new Yp(v),B=new Jp(v),J=new af(z),st=new Gp(z,J),j=new jp(z,J,ot,st),$=new nm(z,j,J,ot),Ie=new tm(z,We,R),te=new qp(we),be=new f0(v,M,B,Ge,We,st,te),ce=new U0(v,we),pe=new m0,Ye=new b0(Ge),Re=new Vp(v,M,B,Ae,$,p,l),me=new E0(v,$,We),D=new N0(z,ot,We,Ae),ge=new Wp(z,Ge,ot),Xe=new Qp(z,Ge,ot),ot.programs=be.programs,v.capabilities=We,v.extensions=Ge,v.properties=we,v.renderLists=pe,v.shadowMap=me,v.state=Ae,v.info=ot}ae();let q=new Da(v,z);this.xr=q,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){let E=Ge.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){let E=Ge.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return H},this.setPixelRatio=function(E){E!==void 0&&(H=E,this.setSize(k,Z,!1))},this.getSize=function(E){return E.set(k,Z)},this.setSize=function(E,N,V=!0){if(q.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}k=E,Z=N,t.width=Math.floor(E*H),t.height=Math.floor(N*H),V===!0&&(t.style.width=E+"px",t.style.height=N+"px"),this.setViewport(0,0,E,N)},this.getDrawingBufferSize=function(E){return E.set(k*H,Z*H).floor()},this.setDrawingBufferSize=function(E,N,V){k=E,Z=N,H=V,t.width=Math.floor(E*V),t.height=Math.floor(N*V),this.setViewport(0,0,E,N)},this.getCurrentViewport=function(E){return E.copy(C)},this.getViewport=function(E){return E.copy(X)},this.setViewport=function(E,N,V,G){E.isVector4?X.set(E.x,E.y,E.z,E.w):X.set(E,N,V,G),Ae.viewport(C.copy(X).multiplyScalar(H).round())},this.getScissor=function(E){return E.copy(le)},this.setScissor=function(E,N,V,G){E.isVector4?le.set(E.x,E.y,E.z,E.w):le.set(E,N,V,G),Ae.scissor(L.copy(le).multiplyScalar(H).round())},this.getScissorTest=function(){return De},this.setScissorTest=function(E){Ae.setScissorTest(De=E)},this.setOpaqueSort=function(E){ie=E},this.setTransparentSort=function(E){ee=E},this.getClearColor=function(E){return E.copy(Re.getClearColor())},this.setClearColor=function(){Re.setClearColor.apply(Re,arguments)},this.getClearAlpha=function(){return Re.getClearAlpha()},this.setClearAlpha=function(){Re.setClearAlpha.apply(Re,arguments)},this.clear=function(E=!0,N=!0,V=!0){let G=0;if(E){let F=!1;if(A!==null){let ne=A.texture.format;F=ne===il||ne===nl||ne===tl}if(F){let ne=A.texture.type,ue=ne===bn||ne===oi||ne===ys||ne===Xi||ne===ja||ne===Qa,xe=Re.getClearColor(),_e=Re.getClearAlpha(),Pe=xe.r,Fe=xe.g,ye=xe.b;ue?(g[0]=Pe,g[1]=Fe,g[2]=ye,g[3]=_e,z.clearBufferuiv(z.COLOR,0,g)):(y[0]=Pe,y[1]=Fe,y[2]=ye,y[3]=_e,z.clearBufferiv(z.COLOR,0,y))}else G|=z.COLOR_BUFFER_BIT}N&&(G|=z.DEPTH_BUFFER_BIT),V&&(G|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",K,!1),t.removeEventListener("webglcontextrestored",fe,!1),t.removeEventListener("webglcontextcreationerror",he,!1),pe.dispose(),Ye.dispose(),we.dispose(),M.dispose(),B.dispose(),$.dispose(),st.dispose(),D.dispose(),be.dispose(),q.dispose(),q.removeEventListener("sessionstart",Cl),q.removeEventListener("sessionend",Il),Zn.stop()};function K(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),I=!0}function fe(){console.log("THREE.WebGLRenderer: Context Restored."),I=!1;let E=ot.autoReset,N=me.enabled,V=me.autoUpdate,G=me.needsUpdate,F=me.type;ae(),ot.autoReset=E,me.enabled=N,me.autoUpdate=V,me.needsUpdate=G,me.type=F}function he(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function Ne(E){let N=E.target;N.removeEventListener("dispose",Ne),ft(N)}function ft(E){St(E),we.remove(E)}function St(E){let N=we.get(E).programs;N!==void 0&&(N.forEach(function(V){be.releaseProgram(V)}),E.isShaderMaterial&&be.releaseShaderCache(E))}this.renderBufferDirect=function(E,N,V,G,F,ne){N===null&&(N=ut);let ue=F.isMesh&&F.matrixWorld.determinant()<0,xe=$h(E,N,V,G,F);Ae.setMaterial(G,ue);let _e=V.index,Pe=1;if(G.wireframe===!0){if(_e=j.getWireframeAttribute(V),_e===void 0)return;Pe=2}let Fe=V.drawRange,ye=V.attributes.position,$e=Fe.start*Pe,rt=(Fe.start+Fe.count)*Pe;ne!==null&&($e=Math.max($e,ne.start*Pe),rt=Math.min(rt,(ne.start+ne.count)*Pe)),_e!==null?($e=Math.max($e,0),rt=Math.min(rt,_e.count)):ye!=null&&($e=Math.max($e,0),rt=Math.min(rt,ye.count));let at=rt-$e;if(at<0||at===1/0)return;st.setup(F,G,xe,V,_e);let Lt,Je=ge;if(_e!==null&&(Lt=J.get(_e),Je=Xe,Je.setIndex(Lt)),F.isMesh)G.wireframe===!0?(Ae.setLineWidth(G.wireframeLinewidth*dt()),Je.setMode(z.LINES)):Je.setMode(z.TRIANGLES);else if(F.isLine){let Me=G.linewidth;Me===void 0&&(Me=1),Ae.setLineWidth(Me*dt()),F.isLineSegments?Je.setMode(z.LINES):F.isLineLoop?Je.setMode(z.LINE_LOOP):Je.setMode(z.LINE_STRIP)}else F.isPoints?Je.setMode(z.POINTS):F.isSprite&&Je.setMode(z.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)Je.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(Ge.get("WEBGL_multi_draw"))Je.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{let Me=F._multiDrawStarts,un=F._multiDrawCounts,Ke=F._multiDrawCount,Yt=_e?J.get(_e).bytesPerElement:1,gi=we.get(G).currentProgram.getUniforms();for(let Nt=0;Nt<Ke;Nt++)gi.setValue(z,"_gl_DrawID",Nt),Je.render(Me[Nt]/Yt,un[Nt])}else if(F.isInstancedMesh)Je.renderInstances($e,at,F.count);else if(V.isInstancedBufferGeometry){let Me=V._maxInstanceCount!==void 0?V._maxInstanceCount:1/0,un=Math.min(V.instanceCount,Me);Je.renderInstances($e,at,un)}else Je.render($e,at)};function je(E,N,V){E.transparent===!0&&E.side===Kt&&E.forceSinglePass===!1?(E.side=Ut,E.needsUpdate=!0,Ns(E,N,V),E.side=Bn,E.needsUpdate=!0,Ns(E,N,V),E.side=Kt):Ns(E,N,V)}this.compile=function(E,N,V=null){V===null&&(V=E),f=Ye.get(V),f.init(N),S.push(f),V.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(f.pushLight(F),F.castShadow&&f.pushShadow(F))}),E!==V&&E.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(f.pushLight(F),F.castShadow&&f.pushShadow(F))}),f.setupLights();let G=new Set;return E.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;let ne=F.material;if(ne)if(Array.isArray(ne))for(let ue=0;ue<ne.length;ue++){let xe=ne[ue];je(xe,V,F),G.add(xe)}else je(ne,V,F),G.add(ne)}),S.pop(),f=null,G},this.compileAsync=function(E,N,V=null){let G=this.compile(E,N,V);return new Promise(F=>{function ne(){if(G.forEach(function(ue){we.get(ue).currentProgram.isReady()&&G.delete(ue)}),G.size===0){F(E);return}setTimeout(ne,10)}Ge.get("KHR_parallel_shader_compile")!==null?ne():setTimeout(ne,10)})};let qt=null;function hn(E){qt&&qt(E)}function Cl(){Zn.stop()}function Il(){Zn.start()}let Zn=new lh;Zn.setAnimationLoop(hn),typeof self<"u"&&Zn.setContext(self),this.setAnimationLoop=function(E){qt=E,q.setAnimationLoop(E),E===null?Zn.stop():Zn.start()},q.addEventListener("sessionstart",Cl),q.addEventListener("sessionend",Il),this.render=function(E,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),q.enabled===!0&&q.isPresenting===!0&&(q.cameraAutoUpdate===!0&&q.updateCamera(N),N=q.getCamera()),E.isScene===!0&&E.onBeforeRender(v,E,N,A),f=Ye.get(E,S.length),f.init(N),S.push(f),ve.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),Y.setFromProjectionMatrix(ve),de=this.localClippingEnabled,Q=te.init(this.clippingPlanes,de),m=pe.get(E,b.length),m.init(),b.push(m),q.enabled===!0&&q.isPresenting===!0){let ne=v.xr.getDepthSensingMesh();ne!==null&&Jr(ne,N,-1/0,v.sortObjects)}Jr(E,N,0,v.sortObjects),m.finish(),v.sortObjects===!0&&m.sort(ie,ee),qe=q.enabled===!1||q.isPresenting===!1||q.hasDepthSensing()===!1,qe&&Re.addToRenderList(m,E),this.info.render.frame++,Q===!0&&te.beginShadows();let V=f.state.shadowsArray;me.render(V,E,N),Q===!0&&te.endShadows(),this.info.autoReset===!0&&this.info.reset();let G=m.opaque,F=m.transmissive;if(f.setupLights(),N.isArrayCamera){let ne=N.cameras;if(F.length>0)for(let ue=0,xe=ne.length;ue<xe;ue++){let _e=ne[ue];Ll(G,F,E,_e)}qe&&Re.render(E);for(let ue=0,xe=ne.length;ue<xe;ue++){let _e=ne[ue];Pl(m,E,_e,_e.viewport)}}else F.length>0&&Ll(G,F,E,N),qe&&Re.render(E),Pl(m,E,N);A!==null&&(R.updateMultisampleRenderTarget(A),R.updateRenderTargetMipmap(A)),E.isScene===!0&&E.onAfterRender(v,E,N),st.resetDefaultState(),x=-1,_=null,S.pop(),S.length>0?(f=S[S.length-1],Q===!0&&te.setGlobalState(v.clippingPlanes,f.state.camera)):f=null,b.pop(),b.length>0?m=b[b.length-1]:m=null};function Jr(E,N,V,G){if(E.visible===!1)return;if(E.layers.test(N.layers)){if(E.isGroup)V=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(N);else if(E.isLight)f.pushLight(E),E.castShadow&&f.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||Y.intersectsSprite(E)){G&&Ue.setFromMatrixPosition(E.matrixWorld).applyMatrix4(ve);let ue=$.update(E),xe=E.material;xe.visible&&m.push(E,ue,xe,V,Ue.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||Y.intersectsObject(E))){let ue=$.update(E),xe=E.material;if(G&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Ue.copy(E.boundingSphere.center)):(ue.boundingSphere===null&&ue.computeBoundingSphere(),Ue.copy(ue.boundingSphere.center)),Ue.applyMatrix4(E.matrixWorld).applyMatrix4(ve)),Array.isArray(xe)){let _e=ue.groups;for(let Pe=0,Fe=_e.length;Pe<Fe;Pe++){let ye=_e[Pe],$e=xe[ye.materialIndex];$e&&$e.visible&&m.push(E,ue,$e,V,Ue.z,ye)}}else xe.visible&&m.push(E,ue,xe,V,Ue.z,null)}}let ne=E.children;for(let ue=0,xe=ne.length;ue<xe;ue++)Jr(ne[ue],N,V,G)}function Pl(E,N,V,G){let F=E.opaque,ne=E.transmissive,ue=E.transparent;f.setupLightsView(V),Q===!0&&te.setGlobalState(v.clippingPlanes,V),G&&Ae.viewport(C.copy(G)),F.length>0&&Us(F,N,V),ne.length>0&&Us(ne,N,V),ue.length>0&&Us(ue,N,V),Ae.buffers.depth.setTest(!0),Ae.buffers.depth.setMask(!0),Ae.buffers.color.setMask(!0),Ae.setPolygonOffset(!1)}function Ll(E,N,V,G){if((V.isScene===!0?V.overrideMaterial:null)!==null)return;f.state.transmissionRenderTarget[G.id]===void 0&&(f.state.transmissionRenderTarget[G.id]=new Mn(1,1,{generateMipmaps:!0,type:Ge.has("EXT_color_buffer_half_float")||Ge.has("EXT_color_buffer_float")?Cs:bn,minFilter:ri,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ze.workingColorSpace}));let ne=f.state.transmissionRenderTarget[G.id],ue=G.viewport||C;ne.setSize(ue.z,ue.w);let xe=v.getRenderTarget();v.setRenderTarget(ne),v.getClearColor(O),W=v.getClearAlpha(),W<1&&v.setClearColor(16777215,.5),v.clear(),qe&&Re.render(V);let _e=v.toneMapping;v.toneMapping=zn;let Pe=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),f.setupLightsView(G),Q===!0&&te.setGlobalState(v.clippingPlanes,G),Us(E,V,G),R.updateMultisampleRenderTarget(ne),R.updateRenderTargetMipmap(ne),Ge.has("WEBGL_multisampled_render_to_texture")===!1){let Fe=!1;for(let ye=0,$e=N.length;ye<$e;ye++){let rt=N[ye],at=rt.object,Lt=rt.geometry,Je=rt.material,Me=rt.group;if(Je.side===Kt&&at.layers.test(G.layers)){let un=Je.side;Je.side=Ut,Je.needsUpdate=!0,Dl(at,V,G,Lt,Je,Me),Je.side=un,Je.needsUpdate=!0,Fe=!0}}Fe===!0&&(R.updateMultisampleRenderTarget(ne),R.updateRenderTargetMipmap(ne))}v.setRenderTarget(xe),v.setClearColor(O,W),Pe!==void 0&&(G.viewport=Pe),v.toneMapping=_e}function Us(E,N,V){let G=N.isScene===!0?N.overrideMaterial:null;for(let F=0,ne=E.length;F<ne;F++){let ue=E[F],xe=ue.object,_e=ue.geometry,Pe=G===null?ue.material:G,Fe=ue.group;xe.layers.test(V.layers)&&Dl(xe,N,V,_e,Pe,Fe)}}function Dl(E,N,V,G,F,ne){E.onBeforeRender(v,N,V,G,F,ne),E.modelViewMatrix.multiplyMatrices(V.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),F.onBeforeRender(v,N,V,G,E,ne),F.transparent===!0&&F.side===Kt&&F.forceSinglePass===!1?(F.side=Ut,F.needsUpdate=!0,v.renderBufferDirect(V,N,G,F,E,ne),F.side=Bn,F.needsUpdate=!0,v.renderBufferDirect(V,N,G,F,E,ne),F.side=Kt):v.renderBufferDirect(V,N,G,F,E,ne),E.onAfterRender(v,N,V,G,F,ne)}function Ns(E,N,V){N.isScene!==!0&&(N=ut);let G=we.get(E),F=f.state.lights,ne=f.state.shadowsArray,ue=F.state.version,xe=be.getParameters(E,F.state,ne,N,V),_e=be.getProgramCacheKey(xe),Pe=G.programs;G.environment=E.isMeshStandardMaterial?N.environment:null,G.fog=N.fog,G.envMap=(E.isMeshStandardMaterial?B:M).get(E.envMap||G.environment),G.envMapRotation=G.environment!==null&&E.envMap===null?N.environmentRotation:E.envMapRotation,Pe===void 0&&(E.addEventListener("dispose",Ne),Pe=new Map,G.programs=Pe);let Fe=Pe.get(_e);if(Fe!==void 0){if(G.currentProgram===Fe&&G.lightsStateVersion===ue)return Nl(E,xe),Fe}else xe.uniforms=be.getUniforms(E),E.onBeforeCompile(xe,v),Fe=be.acquireProgram(xe,_e),Pe.set(_e,Fe),G.uniforms=xe.uniforms;let ye=G.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(ye.clippingPlanes=te.uniform),Nl(E,xe),G.needsLights=Kh(E),G.lightsStateVersion=ue,G.needsLights&&(ye.ambientLightColor.value=F.state.ambient,ye.lightProbe.value=F.state.probe,ye.directionalLights.value=F.state.directional,ye.directionalLightShadows.value=F.state.directionalShadow,ye.spotLights.value=F.state.spot,ye.spotLightShadows.value=F.state.spotShadow,ye.rectAreaLights.value=F.state.rectArea,ye.ltc_1.value=F.state.rectAreaLTC1,ye.ltc_2.value=F.state.rectAreaLTC2,ye.pointLights.value=F.state.point,ye.pointLightShadows.value=F.state.pointShadow,ye.hemisphereLights.value=F.state.hemi,ye.directionalShadowMap.value=F.state.directionalShadowMap,ye.directionalShadowMatrix.value=F.state.directionalShadowMatrix,ye.spotShadowMap.value=F.state.spotShadowMap,ye.spotLightMatrix.value=F.state.spotLightMatrix,ye.spotLightMap.value=F.state.spotLightMap,ye.pointShadowMap.value=F.state.pointShadowMap,ye.pointShadowMatrix.value=F.state.pointShadowMatrix),G.currentProgram=Fe,G.uniformsList=null,Fe}function Ul(E){if(E.uniformsList===null){let N=E.currentProgram.getUniforms();E.uniformsList=ki.seqWithValue(N.seq,E.uniforms)}return E.uniformsList}function Nl(E,N){let V=we.get(E);V.outputColorSpace=N.outputColorSpace,V.batching=N.batching,V.batchingColor=N.batchingColor,V.instancing=N.instancing,V.instancingColor=N.instancingColor,V.instancingMorph=N.instancingMorph,V.skinning=N.skinning,V.morphTargets=N.morphTargets,V.morphNormals=N.morphNormals,V.morphColors=N.morphColors,V.morphTargetsCount=N.morphTargetsCount,V.numClippingPlanes=N.numClippingPlanes,V.numIntersection=N.numClipIntersection,V.vertexAlphas=N.vertexAlphas,V.vertexTangents=N.vertexTangents,V.toneMapping=N.toneMapping}function $h(E,N,V,G,F){N.isScene!==!0&&(N=ut),R.resetTextureUnits();let ne=N.fog,ue=G.isMeshStandardMaterial?N.environment:null,xe=A===null?v.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:Ji,_e=(G.isMeshStandardMaterial?B:M).get(G.envMap||ue),Pe=G.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,Fe=!!V.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),ye=!!V.morphAttributes.position,$e=!!V.morphAttributes.normal,rt=!!V.morphAttributes.color,at=zn;G.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(at=v.toneMapping);let Lt=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,Je=Lt!==void 0?Lt.length:0,Me=we.get(G),un=f.state.lights;if(Q===!0&&(de===!0||E!==_)){let Ht=E===_&&G.id===x;te.setState(G,E,Ht)}let Ke=!1;G.version===Me.__version?(Me.needsLights&&Me.lightsStateVersion!==un.state.version||Me.outputColorSpace!==xe||F.isBatchedMesh&&Me.batching===!1||!F.isBatchedMesh&&Me.batching===!0||F.isBatchedMesh&&Me.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&Me.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&Me.instancing===!1||!F.isInstancedMesh&&Me.instancing===!0||F.isSkinnedMesh&&Me.skinning===!1||!F.isSkinnedMesh&&Me.skinning===!0||F.isInstancedMesh&&Me.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Me.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Me.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Me.instancingMorph===!1&&F.morphTexture!==null||Me.envMap!==_e||G.fog===!0&&Me.fog!==ne||Me.numClippingPlanes!==void 0&&(Me.numClippingPlanes!==te.numPlanes||Me.numIntersection!==te.numIntersection)||Me.vertexAlphas!==Pe||Me.vertexTangents!==Fe||Me.morphTargets!==ye||Me.morphNormals!==$e||Me.morphColors!==rt||Me.toneMapping!==at||Me.morphTargetsCount!==Je)&&(Ke=!0):(Ke=!0,Me.__version=G.version);let Yt=Me.currentProgram;Ke===!0&&(Yt=Ns(G,N,F));let gi=!1,Nt=!1,ss=!1,lt=Yt.getUniforms(),nn=Me.uniforms;if(Ae.useProgram(Yt.program)&&(gi=!0,Nt=!0,ss=!0),G.id!==x&&(x=G.id,Nt=!0),gi||_!==E){Ae.buffers.depth.getReversed()?(re.copy(E.projectionMatrix),ku(re),Hu(re),lt.setValue(z,"projectionMatrix",re)):lt.setValue(z,"projectionMatrix",E.projectionMatrix),lt.setValue(z,"viewMatrix",E.matrixWorldInverse);let Tn=lt.map.cameraPosition;Tn!==void 0&&Tn.setValue(z,Te.setFromMatrixPosition(E.matrixWorld)),We.logarithmicDepthBuffer&&lt.setValue(z,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&lt.setValue(z,"isOrthographic",E.isOrthographicCamera===!0),_!==E&&(_=E,Nt=!0,ss=!0)}if(F.isSkinnedMesh){lt.setOptional(z,F,"bindMatrix"),lt.setOptional(z,F,"bindMatrixInverse");let Ht=F.skeleton;Ht&&(Ht.boneTexture===null&&Ht.computeBoneTexture(),lt.setValue(z,"boneTexture",Ht.boneTexture,R))}F.isBatchedMesh&&(lt.setOptional(z,F,"batchingTexture"),lt.setValue(z,"batchingTexture",F._matricesTexture,R),lt.setOptional(z,F,"batchingIdTexture"),lt.setValue(z,"batchingIdTexture",F._indirectTexture,R),lt.setOptional(z,F,"batchingColorTexture"),F._colorsTexture!==null&&lt.setValue(z,"batchingColorTexture",F._colorsTexture,R));let rs=V.morphAttributes;if((rs.position!==void 0||rs.normal!==void 0||rs.color!==void 0)&&Ie.update(F,V,Yt),(Nt||Me.receiveShadow!==F.receiveShadow)&&(Me.receiveShadow=F.receiveShadow,lt.setValue(z,"receiveShadow",F.receiveShadow)),G.isMeshGouraudMaterial&&G.envMap!==null&&(nn.envMap.value=_e,nn.flipEnvMap.value=_e.isCubeTexture&&_e.isRenderTargetTexture===!1?-1:1),G.isMeshStandardMaterial&&G.envMap===null&&N.environment!==null&&(nn.envMapIntensity.value=N.environmentIntensity),Nt&&(lt.setValue(z,"toneMappingExposure",v.toneMappingExposure),Me.needsLights&&Jh(nn,ss),ne&&G.fog===!0&&ce.refreshFogUniforms(nn,ne),ce.refreshMaterialUniforms(nn,G,H,Z,f.state.transmissionRenderTarget[E.id]),ki.upload(z,Ul(Me),nn,R)),G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(ki.upload(z,Ul(Me),nn,R),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&lt.setValue(z,"center",F.center),lt.setValue(z,"modelViewMatrix",F.modelViewMatrix),lt.setValue(z,"normalMatrix",F.normalMatrix),lt.setValue(z,"modelMatrix",F.matrixWorld),G.isShaderMaterial||G.isRawShaderMaterial){let Ht=G.uniformsGroups;for(let Tn=0,An=Ht.length;Tn<An;Tn++){let Fl=Ht[Tn];D.update(Fl,Yt),D.bind(Fl,Yt)}}return Yt}function Jh(E,N){E.ambientLightColor.needsUpdate=N,E.lightProbe.needsUpdate=N,E.directionalLights.needsUpdate=N,E.directionalLightShadows.needsUpdate=N,E.pointLights.needsUpdate=N,E.pointLightShadows.needsUpdate=N,E.spotLights.needsUpdate=N,E.spotLightShadows.needsUpdate=N,E.rectAreaLights.needsUpdate=N,E.hemisphereLights.needsUpdate=N}function Kh(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return w},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(E,N,V){we.get(E.texture).__webglTexture=N,we.get(E.depthTexture).__webglTexture=V;let G=we.get(E);G.__hasExternalTextures=!0,G.__autoAllocateDepthBuffer=V===void 0,G.__autoAllocateDepthBuffer||Ge.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),G.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,N){let V=we.get(E);V.__webglFramebuffer=N,V.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(E,N=0,V=0){A=E,w=N,T=V;let G=!0,F=null,ne=!1,ue=!1;if(E){let _e=we.get(E);if(_e.__useDefaultFramebuffer!==void 0)Ae.bindFramebuffer(z.FRAMEBUFFER,null),G=!1;else if(_e.__webglFramebuffer===void 0)R.setupRenderTarget(E);else if(_e.__hasExternalTextures)R.rebindTextures(E,we.get(E.texture).__webglTexture,we.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){let ye=E.depthTexture;if(_e.__boundDepthTexture!==ye){if(ye!==null&&we.has(ye)&&(E.width!==ye.image.width||E.height!==ye.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");R.setupDepthRenderbuffer(E)}}let Pe=E.texture;(Pe.isData3DTexture||Pe.isDataArrayTexture||Pe.isCompressedArrayTexture)&&(ue=!0);let Fe=we.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Fe[N])?F=Fe[N][V]:F=Fe[N],ne=!0):E.samples>0&&R.useMultisampledRTT(E)===!1?F=we.get(E).__webglMultisampledFramebuffer:Array.isArray(Fe)?F=Fe[V]:F=Fe,C.copy(E.viewport),L.copy(E.scissor),U=E.scissorTest}else C.copy(X).multiplyScalar(H).floor(),L.copy(le).multiplyScalar(H).floor(),U=De;if(Ae.bindFramebuffer(z.FRAMEBUFFER,F)&&G&&Ae.drawBuffers(E,F),Ae.viewport(C),Ae.scissor(L),Ae.setScissorTest(U),ne){let _e=we.get(E.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+N,_e.__webglTexture,V)}else if(ue){let _e=we.get(E.texture),Pe=N||0;z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,_e.__webglTexture,V||0,Pe)}x=-1},this.readRenderTargetPixels=function(E,N,V,G,F,ne,ue){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let xe=we.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&ue!==void 0&&(xe=xe[ue]),xe){Ae.bindFramebuffer(z.FRAMEBUFFER,xe);try{let _e=E.texture,Pe=_e.format,Fe=_e.type;if(!We.textureFormatReadable(Pe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!We.textureTypeReadable(Fe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=E.width-G&&V>=0&&V<=E.height-F&&z.readPixels(N,V,G,F,Oe.convert(Pe),Oe.convert(Fe),ne)}finally{let _e=A!==null?we.get(A).__webglFramebuffer:null;Ae.bindFramebuffer(z.FRAMEBUFFER,_e)}}},this.readRenderTargetPixelsAsync=async function(E,N,V,G,F,ne,ue){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let xe=we.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&ue!==void 0&&(xe=xe[ue]),xe){let _e=E.texture,Pe=_e.format,Fe=_e.type;if(!We.textureFormatReadable(Pe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!We.textureTypeReadable(Fe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(N>=0&&N<=E.width-G&&V>=0&&V<=E.height-F){Ae.bindFramebuffer(z.FRAMEBUFFER,xe);let ye=z.createBuffer();z.bindBuffer(z.PIXEL_PACK_BUFFER,ye),z.bufferData(z.PIXEL_PACK_BUFFER,ne.byteLength,z.STREAM_READ),z.readPixels(N,V,G,F,Oe.convert(Pe),Oe.convert(Fe),0);let $e=A!==null?we.get(A).__webglFramebuffer:null;Ae.bindFramebuffer(z.FRAMEBUFFER,$e);let rt=z.fenceSync(z.SYNC_GPU_COMMANDS_COMPLETE,0);return z.flush(),await Bu(z,rt,4),z.bindBuffer(z.PIXEL_PACK_BUFFER,ye),z.getBufferSubData(z.PIXEL_PACK_BUFFER,0,ne),z.deleteBuffer(ye),z.deleteSync(rt),ne}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,N=null,V=0){E.isTexture!==!0&&(gs("WebGLRenderer: copyFramebufferToTexture function signature has changed."),N=arguments[0]||null,E=arguments[1]);let G=Math.pow(2,-V),F=Math.floor(E.image.width*G),ne=Math.floor(E.image.height*G),ue=N!==null?N.x:0,xe=N!==null?N.y:0;R.setTexture2D(E,0),z.copyTexSubImage2D(z.TEXTURE_2D,V,0,0,ue,xe,F,ne),Ae.unbindTexture()},this.copyTextureToTexture=function(E,N,V=null,G=null,F=0){E.isTexture!==!0&&(gs("WebGLRenderer: copyTextureToTexture function signature has changed."),G=arguments[0]||null,E=arguments[1],N=arguments[2],F=arguments[3]||0,V=null);let ne,ue,xe,_e,Pe,Fe,ye,$e,rt,at=E.isCompressedTexture?E.mipmaps[F]:E.image;V!==null?(ne=V.max.x-V.min.x,ue=V.max.y-V.min.y,xe=V.isBox3?V.max.z-V.min.z:1,_e=V.min.x,Pe=V.min.y,Fe=V.isBox3?V.min.z:0):(ne=at.width,ue=at.height,xe=at.depth||1,_e=0,Pe=0,Fe=0),G!==null?(ye=G.x,$e=G.y,rt=G.z):(ye=0,$e=0,rt=0);let Lt=Oe.convert(N.format),Je=Oe.convert(N.type),Me;N.isData3DTexture?(R.setTexture3D(N,0),Me=z.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(R.setTexture2DArray(N,0),Me=z.TEXTURE_2D_ARRAY):(R.setTexture2D(N,0),Me=z.TEXTURE_2D),z.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,N.flipY),z.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),z.pixelStorei(z.UNPACK_ALIGNMENT,N.unpackAlignment);let un=z.getParameter(z.UNPACK_ROW_LENGTH),Ke=z.getParameter(z.UNPACK_IMAGE_HEIGHT),Yt=z.getParameter(z.UNPACK_SKIP_PIXELS),gi=z.getParameter(z.UNPACK_SKIP_ROWS),Nt=z.getParameter(z.UNPACK_SKIP_IMAGES);z.pixelStorei(z.UNPACK_ROW_LENGTH,at.width),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,at.height),z.pixelStorei(z.UNPACK_SKIP_PIXELS,_e),z.pixelStorei(z.UNPACK_SKIP_ROWS,Pe),z.pixelStorei(z.UNPACK_SKIP_IMAGES,Fe);let ss=E.isDataArrayTexture||E.isData3DTexture,lt=N.isDataArrayTexture||N.isData3DTexture;if(E.isRenderTargetTexture||E.isDepthTexture){let nn=we.get(E),rs=we.get(N),Ht=we.get(nn.__renderTarget),Tn=we.get(rs.__renderTarget);Ae.bindFramebuffer(z.READ_FRAMEBUFFER,Ht.__webglFramebuffer),Ae.bindFramebuffer(z.DRAW_FRAMEBUFFER,Tn.__webglFramebuffer);for(let An=0;An<xe;An++)ss&&z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,we.get(E).__webglTexture,F,Fe+An),E.isDepthTexture?(lt&&z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,we.get(N).__webglTexture,F,rt+An),z.blitFramebuffer(_e,Pe,ne,ue,ye,$e,ne,ue,z.DEPTH_BUFFER_BIT,z.NEAREST)):lt?z.copyTexSubImage3D(Me,F,ye,$e,rt+An,_e,Pe,ne,ue):z.copyTexSubImage2D(Me,F,ye,$e,rt+An,_e,Pe,ne,ue);Ae.bindFramebuffer(z.READ_FRAMEBUFFER,null),Ae.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else lt?E.isDataTexture||E.isData3DTexture?z.texSubImage3D(Me,F,ye,$e,rt,ne,ue,xe,Lt,Je,at.data):N.isCompressedArrayTexture?z.compressedTexSubImage3D(Me,F,ye,$e,rt,ne,ue,xe,Lt,at.data):z.texSubImage3D(Me,F,ye,$e,rt,ne,ue,xe,Lt,Je,at):E.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,F,ye,$e,ne,ue,Lt,Je,at.data):E.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,F,ye,$e,at.width,at.height,Lt,at.data):z.texSubImage2D(z.TEXTURE_2D,F,ye,$e,ne,ue,Lt,Je,at);z.pixelStorei(z.UNPACK_ROW_LENGTH,un),z.pixelStorei(z.UNPACK_IMAGE_HEIGHT,Ke),z.pixelStorei(z.UNPACK_SKIP_PIXELS,Yt),z.pixelStorei(z.UNPACK_SKIP_ROWS,gi),z.pixelStorei(z.UNPACK_SKIP_IMAGES,Nt),F===0&&N.generateMipmaps&&z.generateMipmap(Me),Ae.unbindTexture()},this.copyTextureToTexture3D=function(E,N,V=null,G=null,F=0){return E.isTexture!==!0&&(gs("WebGLRenderer: copyTextureToTexture3D function signature has changed."),V=arguments[0]||null,G=arguments[1]||null,E=arguments[2],N=arguments[3],F=arguments[4]||0),gs('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(E,N,V,G,F)},this.initRenderTarget=function(E){we.get(E).__webglFramebuffer===void 0&&R.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?R.setTextureCube(E,0):E.isData3DTexture?R.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?R.setTexture2DArray(E,0):R.setTexture2D(E,0),Ae.unbindTexture()},this.resetState=function(){w=0,T=0,A=null,Ae.reset(),st.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return yn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorspace=Ze._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ze._getUnpackColorSpace()}};var Tr=class i{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Ce(e),this.near=t,this.far=n}clone(){return new i(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Ar=class extends Rt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Wt,this.environmentIntensity=1,this.environmentRotation=new Wt,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Rr=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=ga,this.updateRanges=[],this.version=0,this.uuid=On()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=On()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=On()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},Ct=new P,Ss=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyMatrix4(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyNormalMatrix(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.transformDirection(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=rn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=tt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=rn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=rn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=rn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=rn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),s=tt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),s=tt(s,this.array),r=tt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new xt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Gn=class extends Vn{static get type(){return"SpriteMaterial"}constructor(e){super(),this.isSpriteMaterial=!0,this.color=new Ce(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Pi,hs=new P,Li=new P,Di=new P,Ui=new Ee,us=new Ee,dh=new Le,ir=new P,fs=new P,sr=new P,Nc=new Ee,Ro=new Ee,Fc=new Ee,Wn=class extends Rt{constructor(e=new Gn){if(super(),this.isSprite=!0,this.type="Sprite",Pi===void 0){Pi=new pt;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Rr(t,5);Pi.setIndex([0,1,2,0,2,3]),Pi.setAttribute("position",new Ss(n,3,0,!1)),Pi.setAttribute("uv",new Ss(n,2,3,!1))}this.geometry=Pi,this.material=e,this.center=new Ee(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Li.setFromMatrixScale(this.matrixWorld),dh.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Di.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Li.multiplyScalar(-Di.z);let n=this.material.rotation,s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));let o=this.center;rr(ir.set(-.5,-.5,0),Di,o,Li,s,r),rr(fs.set(.5,-.5,0),Di,o,Li,s,r),rr(sr.set(.5,.5,0),Di,o,Li,s,r),Nc.set(0,0),Ro.set(1,0),Fc.set(1,1);let a=e.ray.intersectTriangle(ir,fs,sr,!1,hs);if(a===null&&(rr(fs.set(-.5,.5,0),Di,o,Li,s,r),Ro.set(0,1),a=e.ray.intersectTriangle(ir,sr,fs,!1,hs),a===null))return;let l=e.ray.origin.distanceTo(hs);l<e.near||l>e.far||t.push({distance:l,point:hs.clone(),uv:Nn.getInterpolation(hs,ir,fs,sr,Nc,Ro,Fc,new Ee),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function rr(i,e,t,n,s,r){Ui.subVectors(i,t).addScalar(.5).multiply(n),s!==void 0?(us.x=r*Ui.x-s*Ui.y,us.y=s*Ui.x+r*Ui.y):us.copy(Ui),i.copy(e),i.x+=us.x,i.y+=us.y,i.applyMatrix4(dh)}var Ua=class extends Pt{constructor(e=null,t=1,n=1,s,r,o,a,l,u=Ot,h=Ot,d,c){super(null,o,a,l,u,h,s,r,d,c),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Es=class extends xt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Ni=new Le,zc=new Le,or=[],Oc=new Sn,F0=new Le,ds=new it,ps=new ai,Cr=class extends it{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Es(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,F0)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Sn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ni),Oc.copy(e.boundingBox).applyMatrix4(Ni),this.boundingBox.union(Oc)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new ai),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ni),ps.copy(e.boundingSphere).applyMatrix4(Ni),this.boundingSphere.union(ps)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(ds.geometry=this.geometry,ds.material=this.material,ds.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ps.copy(this.boundingSphere),ps.applyMatrix4(n),e.ray.intersectsSphere(ps)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ni),zc.multiplyMatrices(n,Ni),ds.matrixWorld=zc,ds.raycast(e,or);for(let o=0,a=or.length;o<a;o++){let l=or[o];l.instanceId=r,l.object=this,t.push(l)}or.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Es(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Ua(new Float32Array(s*this.count),s,this.count,el,an));let r=this.morphTexture.source.data.data,o=0;for(let u=0;u<n.length;u++)o+=n[u];let a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}};var En=class extends Pt{constructor(e,t,n,s,r,o,a,l,u){super(e,t,n,s,r,o,a,l,u),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Ir=class i extends pt{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);let r=[],o=[],a=[],l=[],u=new P,h=new Ee;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let d=0,c=3;d<=t;d++,c+=3){let p=n+d/t*s;u.x=e*Math.cos(p),u.y=e*Math.sin(p),o.push(u.x,u.y,u.z),a.push(0,0,1),h.x=(o[c]/e+1)/2,h.y=(o[c+1]/e+1)/2,l.push(h.x,h.y)}for(let d=1;d<=t;d++)r.push(d,d+1,0);this.setIndex(r),this.setAttribute("position",new He(o,3)),this.setAttribute("normal",new He(a,3)),this.setAttribute("uv",new He(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}},ke=class i extends pt{constructor(e=1,t=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let u=this;s=Math.floor(s),r=Math.floor(r);let h=[],d=[],c=[],p=[],g=0,y=[],m=n/2,f=0;b(),o===!1&&(e>0&&S(!0),t>0&&S(!1)),this.setIndex(h),this.setAttribute("position",new He(d,3)),this.setAttribute("normal",new He(c,3)),this.setAttribute("uv",new He(p,2));function b(){let v=new P,I=new P,w=0,T=(t-e)/n;for(let A=0;A<=r;A++){let x=[],_=A/r,C=_*(t-e)+e;for(let L=0;L<=s;L++){let U=L/s,O=U*l+a,W=Math.sin(O),k=Math.cos(O);I.x=C*W,I.y=-_*n+m,I.z=C*k,d.push(I.x,I.y,I.z),v.set(W,T,k).normalize(),c.push(v.x,v.y,v.z),p.push(U,1-_),x.push(g++)}y.push(x)}for(let A=0;A<s;A++)for(let x=0;x<r;x++){let _=y[x][A],C=y[x+1][A],L=y[x+1][A+1],U=y[x][A+1];(e>0||x!==0)&&(h.push(_,C,U),w+=3),(t>0||x!==r-1)&&(h.push(C,L,U),w+=3)}u.addGroup(f,w,0),f+=w}function S(v){let I=g,w=new Ee,T=new P,A=0,x=v===!0?e:t,_=v===!0?1:-1;for(let L=1;L<=s;L++)d.push(0,m*_,0),c.push(0,_,0),p.push(.5,.5),g++;let C=g;for(let L=0;L<=s;L++){let O=L/s*l+a,W=Math.cos(O),k=Math.sin(O);T.x=x*k,T.y=m*_,T.z=x*W,d.push(T.x,T.y,T.z),c.push(0,_,0),w.x=W*.5+.5,w.y=k*.5*_+.5,p.push(w.x,w.y),g++}for(let L=0;L<s;L++){let U=I+L,O=C+L;v===!0?h.push(O,O+1,U):h.push(O+1,O,U),A+=3}u.addGroup(f,A,v===!0?1:2),f+=A}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Mt=class i extends ke{constructor(e=1,t=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Pr=class i extends pt{constructor(e=[],t=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:s};let r=[],o=[];a(s),u(n),h(),this.setAttribute("position",new He(r,3)),this.setAttribute("normal",new He(r.slice(),3)),this.setAttribute("uv",new He(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(b){let S=new P,v=new P,I=new P;for(let w=0;w<t.length;w+=3)p(t[w+0],S),p(t[w+1],v),p(t[w+2],I),l(S,v,I,b)}function l(b,S,v,I){let w=I+1,T=[];for(let A=0;A<=w;A++){T[A]=[];let x=b.clone().lerp(v,A/w),_=S.clone().lerp(v,A/w),C=w-A;for(let L=0;L<=C;L++)L===0&&A===w?T[A][L]=x:T[A][L]=x.clone().lerp(_,L/C)}for(let A=0;A<w;A++)for(let x=0;x<2*(w-A)-1;x++){let _=Math.floor(x/2);x%2===0?(c(T[A][_+1]),c(T[A+1][_]),c(T[A][_])):(c(T[A][_+1]),c(T[A+1][_+1]),c(T[A+1][_]))}}function u(b){let S=new P;for(let v=0;v<r.length;v+=3)S.x=r[v+0],S.y=r[v+1],S.z=r[v+2],S.normalize().multiplyScalar(b),r[v+0]=S.x,r[v+1]=S.y,r[v+2]=S.z}function h(){let b=new P;for(let S=0;S<r.length;S+=3){b.x=r[S+0],b.y=r[S+1],b.z=r[S+2];let v=m(b)/2/Math.PI+.5,I=f(b)/Math.PI+.5;o.push(v,1-I)}g(),d()}function d(){for(let b=0;b<o.length;b+=6){let S=o[b+0],v=o[b+2],I=o[b+4],w=Math.max(S,v,I),T=Math.min(S,v,I);w>.9&&T<.1&&(S<.2&&(o[b+0]+=1),v<.2&&(o[b+2]+=1),I<.2&&(o[b+4]+=1))}}function c(b){r.push(b.x,b.y,b.z)}function p(b,S){let v=b*3;S.x=e[v+0],S.y=e[v+1],S.z=e[v+2]}function g(){let b=new P,S=new P,v=new P,I=new P,w=new Ee,T=new Ee,A=new Ee;for(let x=0,_=0;x<r.length;x+=9,_+=6){b.set(r[x+0],r[x+1],r[x+2]),S.set(r[x+3],r[x+4],r[x+5]),v.set(r[x+6],r[x+7],r[x+8]),w.set(o[_+0],o[_+1]),T.set(o[_+2],o[_+3]),A.set(o[_+4],o[_+5]),I.copy(b).add(S).add(v).divideScalar(3);let C=m(I);y(w,_+0,b,C),y(T,_+2,S,C),y(A,_+4,v,C)}}function y(b,S,v,I){I<0&&b.x===1&&(o[S]=b.x-1),v.x===0&&v.z===0&&(o[S]=I/2/Math.PI+.5)}function m(b){return Math.atan2(b.z,-b.x)}function f(b){return Math.atan2(-b.y,Math.sqrt(b.x*b.x+b.z*b.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.vertices,e.indices,e.radius,e.details)}};var ln=class i extends Pr{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}},Lr=class i extends Pr{constructor(e=1,t=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}},ws=class i extends pt{constructor(e=.5,t=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);let a=[],l=[],u=[],h=[],d=e,c=(t-e)/s,p=new P,g=new Ee;for(let y=0;y<=s;y++){for(let m=0;m<=n;m++){let f=r+m/n*o;p.x=d*Math.cos(f),p.y=d*Math.sin(f),l.push(p.x,p.y,p.z),u.push(0,0,1),g.x=(p.x/t+1)/2,g.y=(p.y/t+1)/2,h.push(g.x,g.y)}d+=c}for(let y=0;y<s;y++){let m=y*(n+1);for(let f=0;f<n;f++){let b=f+m,S=b,v=b+n+1,I=b+n+2,w=b+1;a.push(S,v,w),a.push(v,I,w)}}this.setIndex(a),this.setAttribute("position",new He(l,3)),this.setAttribute("normal",new He(u,3)),this.setAttribute("uv",new He(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var li=class i extends pt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),u=0,h=[],d=new P,c=new P,p=[],g=[],y=[],m=[];for(let f=0;f<=n;f++){let b=[],S=f/n,v=0;f===0&&o===0?v=.5/t:f===n&&l===Math.PI&&(v=-.5/t);for(let I=0;I<=t;I++){let w=I/t;d.x=-e*Math.cos(s+w*r)*Math.sin(o+S*a),d.y=e*Math.cos(o+S*a),d.z=e*Math.sin(s+w*r)*Math.sin(o+S*a),g.push(d.x,d.y,d.z),c.copy(d).normalize(),y.push(c.x,c.y,c.z),m.push(w+v,1-S),b.push(u++)}h.push(b)}for(let f=0;f<n;f++)for(let b=0;b<t;b++){let S=h[f][b+1],v=h[f][b],I=h[f+1][b],w=h[f+1][b+1];(f!==0||o>0)&&p.push(S,v,w),(f!==n-1||l<Math.PI)&&p.push(v,I,w)}this.setIndex(p),this.setAttribute("position",new He(g,3)),this.setAttribute("normal",new He(y,3)),this.setAttribute("uv",new He(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var ci=class i extends pt{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);let o=[],a=[],l=[],u=[],h=new P,d=new P,c=new P;for(let p=0;p<=n;p++)for(let g=0;g<=s;g++){let y=g/s*r,m=p/n*Math.PI*2;d.x=(e+t*Math.cos(m))*Math.cos(y),d.y=(e+t*Math.cos(m))*Math.sin(y),d.z=t*Math.sin(m),a.push(d.x,d.y,d.z),h.x=e*Math.cos(y),h.y=e*Math.sin(y),c.subVectors(d,h).normalize(),l.push(c.x,c.y,c.z),u.push(g/s),u.push(p/n)}for(let p=1;p<=n;p++)for(let g=1;g<=s;g++){let y=(s+1)*p+g-1,m=(s+1)*(p-1)+g-1,f=(s+1)*(p-1)+g,b=(s+1)*p+g;o.push(y,m,b),o.push(m,f,b)}this.setIndex(o),this.setAttribute("position",new He(a,3)),this.setAttribute("normal",new He(l,3)),this.setAttribute("uv",new He(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var hi=class extends Vn{static get type(){return"MeshLambertMaterial"}constructor(e){super(),this.isMeshLambertMaterial=!0,this.color=new Ce(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ce(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ih,this.normalScale=new Ee(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wt,this.combine=$a,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};function ar(i,e,t){return!i||!t&&i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function z0(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var $i=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=t[++n],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Na=class extends $i{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:kl,endingEnd:kl}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Hl:r=e,a=2*t-n;break;case Vl:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Hl:o=e,l=2*n-t;break;case Vl:o=1,l=n+s[1]-s[0];break;default:o=e-1,l=t}let u=(n-t)*.5,h=this.valueSize;this._weightPrev=u/(t-a),this._weightNext=u/(l-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,u=l-a,h=this._offsetPrev,d=this._offsetNext,c=this._weightPrev,p=this._weightNext,g=(n-t)/(s-t),y=g*g,m=y*g,f=-c*m+2*c*y-c*g,b=(1+c)*m+(-1.5-2*c)*y+(-.5+c)*g+1,S=(-1-p)*m+(1.5+p)*y+.5*g,v=p*m-p*y;for(let I=0;I!==a;++I)r[I]=f*o[h+I]+b*o[u+I]+S*o[l+I]+v*o[d+I];return r}},Fa=class extends $i{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,u=l-a,h=(n-t)/(s-t),d=1-h;for(let c=0;c!==a;++c)r[c]=o[u+c]*d+o[l+c]*h;return r}},za=class extends $i{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},en=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=ar(t,this.TimeBufferType),this.values=ar(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:ar(e.times,Array),values:ar(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new za(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Fa(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Na(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case dr:t=this.InterpolantFactoryMethodDiscrete;break;case ma:t=this.InterpolantFactoryMethodLinear;break;case jr:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return dr;case this.InterpolantFactoryMethodLinear:return ma;case this.InterpolantFactoryMethodSmooth:return jr}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&z0(s))for(let a=0,l=s.length;a!==l;++a){let u=s[a];if(isNaN(u)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,u),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===jr,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,u=e[a],h=e[a+1];if(u!==h&&(a!==1||u!==e[0]))if(s)l=!0;else{let d=a*n,c=d-n,p=d+n;for(let g=0;g!==n;++g){let y=t[d+g];if(y!==t[c+g]||y!==t[p+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let d=a*n,c=o*n;for(let p=0;p!==n;++p)t[c+p]=t[d+p]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,u=0;u!==n;++u)t[l+u]=t[a+u];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};en.prototype.TimeBufferType=Float32Array;en.prototype.ValueBufferType=Float32Array;en.prototype.DefaultInterpolation=ma;var ui=class extends en{constructor(e,t,n){super(e,t,n)}};ui.prototype.ValueTypeName="bool";ui.prototype.ValueBufferType=Array;ui.prototype.DefaultInterpolation=dr;ui.prototype.InterpolantFactoryMethodLinear=void 0;ui.prototype.InterpolantFactoryMethodSmooth=void 0;var Oa=class extends en{};Oa.prototype.ValueTypeName="color";var Ba=class extends en{};Ba.prototype.ValueTypeName="number";var ka=class extends $i{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(s-t),u=e*a;for(let h=u+a;u!==h;u+=4)Gt.slerpFlat(r,0,o,u-a,o,u,l);return r}},Dr=class extends en{InterpolantFactoryMethodLinear(e){return new ka(this.times,this.values,this.getValueSize(),e)}};Dr.prototype.ValueTypeName="quaternion";Dr.prototype.InterpolantFactoryMethodSmooth=void 0;var fi=class extends en{constructor(e,t,n){super(e,t,n)}};fi.prototype.ValueTypeName="string";fi.prototype.ValueBufferType=Array;fi.prototype.DefaultInterpolation=dr;fi.prototype.InterpolantFactoryMethodLinear=void 0;fi.prototype.InterpolantFactoryMethodSmooth=void 0;var Ha=class extends en{};Ha.prototype.ValueTypeName="vector";var Bc={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(this.files[i]=e)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}},Va=class{constructor(e,t,n){let s=this,r=!1,o=0,a=0,l,u=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return u.push(h,d),this},this.removeHandler=function(h){let d=u.indexOf(h);return d!==-1&&u.splice(d,2),this},this.getHandler=function(h){for(let d=0,c=u.length;d<c;d+=2){let p=u[d],g=u[d+1];if(p.global&&(p.lastIndex=0),p.test(h))return g}return null}}},O0=new Va,Ts=class{constructor(e){this.manager=e!==void 0?e:O0,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};Ts.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ga=class extends Ts{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=Bc.get(e);if(o!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o;let a=vs("img");function l(){h(),Bc.add(e,this),t&&t(this),r.manager.itemEnd(e)}function u(d){h(),s&&s(d),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){a.removeEventListener("load",l,!1),a.removeEventListener("error",u,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",u,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),r.manager.itemStart(e),a.src=e,a}};var Ur=class extends Ts{constructor(e){super(e)}load(e,t,n,s){let r=new Pt,o=new Ga(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},As=class extends Rt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ce(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},Nr=class extends As{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Rt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ce(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Co=new Le,kc=new P,Hc=new P,Fr=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ee(512,512),this.map=null,this.mapPass=null,this.matrix=new Le,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ms,this._frameExtents=new Ee(1,1),this._viewportCount=1,this._viewports=[new nt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;kc.setFromMatrixPosition(e.matrixWorld),t.position.copy(kc),Hc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Hc),t.updateMatrixWorld(),Co.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Co),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Co)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var Vc=new Le,ms=new P,Io=new P,Wa=class extends Fr{constructor(){super(new Tt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Ee(4,2),this._viewportCount=6,this._viewports=[new nt(2,1,1,1),new nt(0,1,1,1),new nt(3,1,1,1),new nt(1,1,1,1),new nt(3,0,1,1),new nt(1,0,1,1)],this._cubeDirections=[new P(1,0,0),new P(-1,0,0),new P(0,0,1),new P(0,0,-1),new P(0,1,0),new P(0,-1,0)],this._cubeUps=[new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,0,1),new P(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),ms.setFromMatrixPosition(e.matrixWorld),n.position.copy(ms),Io.copy(n.position),Io.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Io),n.updateMatrixWorld(),s.makeTranslation(-ms.x,-ms.y,-ms.z),Vc.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Vc)}},Rs=class extends As{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Wa}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},Xa=class extends Fr{constructor(){super(new Mr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},zr=class extends As{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Rt.DEFAULT_UP),this.updateMatrix(),this.target=new Rt,this.shadow=new Xa}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var Or=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Gc(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=Gc();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}};function Gc(){return performance.now()}var rl="\\[\\]\\.:\\/",B0=new RegExp("["+rl+"]","g"),ol="[^"+rl+"]",k0="[^"+rl.replace("\\.","")+"]",H0=/((?:WC+[\/:])*)/.source.replace("WC",ol),V0=/(WCOD+)?/.source.replace("WCOD",k0),G0=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",ol),W0=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",ol),X0=new RegExp("^"+H0+V0+G0+W0+"$"),q0=["material","materials","bones","map"],qa=class{constructor(e,t,n){let s=n||ct.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},ct=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(B0,"")}static parseTrackName(e){let t=X0.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);q0.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let u=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===u){u=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(u!==void 0){if(e[u]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[u]}}let o=e[s];if(o===void 0){let u=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+u+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ct.Composite=qa;ct.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ct.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ct.prototype.GetterByBindingType=[ct.prototype._getValue_direct,ct.prototype._getValue_array,ct.prototype._getValue_arrayElement,ct.prototype._getValue_toArray];ct.prototype.SetterByBindingTypeAndVersioning=[[ct.prototype._setValue_direct,ct.prototype._setValue_direct_setNeedsUpdate,ct.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_array,ct.prototype._setValue_array_setNeedsUpdate,ct.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_arrayElement,ct.prototype._setValue_arrayElement_setNeedsUpdate,ct.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_fromArray,ct.prototype._setValue_fromArray_setNeedsUpdate,ct.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var ex=new Float32Array(1);var Wc=new Le,Br=class{constructor(e,t,n=0,s=1/0){this.ray=new xr(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new bs,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Wc.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Wc),this}intersectObject(e,t=!0,n=[]){return Ya(e,this,n,t),n.sort(Xc),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)Ya(e[s],this,n,t);return n.sort(Xc),n}};function Xc(i,e){return i.distance-e.distance}function Ya(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let o=0,a=r.length;o<a;o++)Ya(r[o],e,t,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"170"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="170");function ph(i,e,t=0){let n=(t%360+360)%360;return n===90?[-e,i]:n===180?[-i,-e]:n===270?[e,-i]:[i,e]}function al(i,e=!1){let t=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),r={},o={},a=i[0].morphTargetsRelative,l=new pt,u=0;for(let h=0;h<i.length;++h){let d=i[h],c=0;if(t!==(d.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let p in d.attributes){if(!n.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+p+'" attribute exists among all geometries, or in none of them.'),null;r[p]===void 0&&(r[p]=[]),r[p].push(d.attributes[p]),c++}if(c!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==d.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let p in d.morphAttributes){if(!s.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[p]===void 0&&(o[p]=[]),o[p].push(d.morphAttributes[p])}if(e){let p;if(t)p=d.index.count;else if(d.attributes.position!==void 0)p=d.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(u,p,h),u+=p}}if(t){let h=0,d=[];for(let c=0;c<i.length;++c){let p=i[c].index;for(let g=0;g<p.count;++g)d.push(p.getX(g)+h);h+=i[c].attributes.position.count}l.setIndex(d)}for(let h in r){let d=mh(r[h]);if(!d)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,d)}for(let h in o){let d=o[h][0].length;if(d===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let c=0;c<d;++c){let p=[];for(let y=0;y<o[h].length;++y)p.push(o[h][y][c]);let g=mh(p);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}return l}function mh(i){let e,t,n,s=-1,r=0;for(let u=0;u<i.length;++u){let h=i[u];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=h.gpuType),s!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*t}let o=new e(r),a=new xt(o,t,n),l=0;for(let u=0;u<i.length;++u){let h=i[u];if(h.isInterleavedBufferAttribute){let d=l/t;for(let c=0,p=h.count;c<p;c++)for(let g=0;g<t;g++){let y=h.getComponent(c,g);a.setComponent(c+d,g,y)}}else o.set(h.array,l);l+=h.count*t}return s!==void 0&&(a.gpuType=s),a}var _h=["glatt","holz","stein","ziegel","schindel","stroh","putz","laub","rinde","metall"],Ve=(i,e)=>{let t=Math.imul(Math.floor(i*7919),374761393)+Math.imul(Math.floor(e*6037),668265263);return t=Math.imul(t^t>>>13,1274126177),((t^t>>>16)>>>0)/4294967296};function Xn(i,e){let n=document.createElement("canvas");n.width=n.height=256;let s=n.getContext("2d"),r=e,o=()=>(r=r*16807%2147483647)/2147483647;s.fillStyle="rgb(225,225,225)",s.fillRect(0,0,256,256),i(s,o,256);let a=new En(n);return a.wrapS=a.wrapT=kn,a.colorSpace=_t,a.anisotropy=4,a}var ht=(i,e=1)=>`rgba(${i|0},${i|0},${i|0},${e})`,pi=(i,e)=>{for(let t of[-i,0,i])for(let n of[-i,0,i])e(t,n)},Y0={glatt:()=>null,metall:()=>null,holz:()=>Xn((i,e,t)=>{let s=t/6;for(let r=0;r<6;r++){let o=r*s,a=200+e()*45;i.fillStyle=ht(a),i.fillRect(0,o,t,s);for(let u=0;u<14;u++){i.strokeStyle=ht(a-30-e()*30,.5),i.lineWidth=1+e()*1.5,i.beginPath();let h=o+4+e()*(s-8);i.moveTo(0,h),i.bezierCurveTo(t*.3,h+(e()-.5)*6,t*.6,h+(e()-.5)*6,t,h),i.stroke()}i.fillStyle=ht(255,.35),i.fillRect(0,o+2,t,3),i.fillStyle=ht(70),i.fillRect(0,o+s-3,t,3);let l=e()*t;i.fillStyle=ht(80),i.fillRect(l,o,3,s),i.fillStyle=ht(110);for(let u of[o+9,o+s-12])i.beginPath(),i.arc(l+9,u,2.4,0,7),i.arc(l-6,u,2.4,0,7),i.fill()}},11),stein:()=>Xn((i,e,t)=>{i.fillStyle=ht(95),i.fillRect(0,0,t,t);let n=0;for(;n<t;){let s=26+e()*18,r=-e()*40;for(;r<t;){let o=34+e()*36,a=175+e()*60;pi(t,(l,u)=>{i.fillStyle=ht(a),i.beginPath(),i.roundRect(r+l+2,n+u+2,o-4,s-4,9),i.fill(),i.fillStyle=ht(255,.28),i.beginPath(),i.roundRect(r+l+5,n+u+4,o-12,5,3),i.fill(),i.fillStyle=ht(0,.18),i.beginPath(),i.roundRect(r+l+4,n+u+s-10,o-8,5,3),i.fill()}),r+=o}n+=s}},23),ziegel:()=>Xn((i,e,t)=>{i.fillStyle=ht(90),i.fillRect(0,0,t,t);for(let r=0;r<t/32+1;r++)for(let o=-1;o<t/32+1;o++){let a=o*32+r%2*32/2,l=r*32,u=185+e()*55;pi(t,(h,d)=>{let c=i.createLinearGradient(a+h,0,a+h+32,0);c.addColorStop(0,ht(u-50)),c.addColorStop(.45,ht(u+15)),c.addColorStop(1,ht(u-60)),i.fillStyle=c,i.beginPath(),i.moveTo(a+h+1,l+d),i.lineTo(a+h+32-1,l+d),i.lineTo(a+h+32-1,l+d+32-8),i.quadraticCurveTo(a+h+32/2,l+d+32+6,a+h+1,l+d+32-8),i.closePath(),i.fill()})}},37),schindel:()=>Xn((i,e,t)=>{i.fillStyle=ht(80),i.fillRect(0,0,t,t);for(let s=0;s<t/26;s++){let r=-e()*30;for(;r<t;){let o=20+e()*22,a=170+e()*70,l=s*26;pi(t,(u,h)=>{i.fillStyle=ht(a),i.fillRect(r+u+1,l+h,o-2,24),i.fillStyle=ht(0,.25),i.fillRect(r+u+1,l+h+26-7,o-2,5),i.strokeStyle=ht(a-40,.6),i.lineWidth=1,i.beginPath(),i.moveTo(r+u+o*.4,l+h+2),i.lineTo(r+u+o*.45,l+h+26-6),i.stroke()}),r+=o}}},41),stroh:()=>Xn((i,e,t)=>{for(let n=0;n<1500;n++){let s=e()*t,r=e()*t,o=14+e()*26,a=150+e()*105;pi(t,(l,u)=>{i.strokeStyle=ht(a,.8),i.lineWidth=1.2+e()*1.6,i.beginPath(),i.moveTo(s+l,r+u),i.lineTo(s+l+(e()-.5)*5,r+u+o),i.stroke()})}for(let n=0;n<6;n++)i.fillStyle=ht(60,.45),i.fillRect(0,n*(t/6)+t/6-6,t,5)},53),putz:()=>Xn((i,e,t)=>{for(let n=0;n<260;n++){let s=e()*t,r=e()*t,o=8+e()*26,a=200+e()*55;pi(t,(l,u)=>{i.fillStyle=ht(a,.35),i.beginPath(),i.ellipse(s+l,r+u,o,o*.7,e()*3,0,7),i.fill()})}for(let n=0;n<5;n++){let s=e()*t,r=e()*t;i.strokeStyle=ht(120,.6),i.lineWidth=1,i.beginPath(),i.moveTo(s,r);for(let o=0;o<5;o++)s+=(e()-.5)*18,r+=e()*12,i.lineTo(s,r);i.stroke()}},67),laub:()=>Xn((i,e,t)=>{for(let n=0;n<1100;n++){let s=e()*t,r=e()*t,o=4+e()*9,a=150+e()*105;pi(t,(l,u)=>{i.fillStyle=ht(a,.7),i.beginPath(),i.ellipse(s+l,r+u,o,o*.6,e()*3,0,7),i.fill()})}},71),rinde:()=>Xn((i,e,t)=>{for(let n=0;n<220;n++){let s=e()*t,r=110+e()*120;pi(t,(o,a)=>{i.strokeStyle=ht(r,.7),i.lineWidth=2+e()*4,i.beginPath(),i.moveTo(s+o,a),i.bezierCurveTo(s+o+6,a+t*.3,s+o-6,a+t*.7,s+o,a+t),i.stroke()})}},83)},hl=_h.map(i=>{let e=Y0[i]();return new hi({vertexColors:!0,map:e,color:e?new Ce(1.18,1.18,1.18):16777215,side:Kt})}),Z0={glatt:1,metall:1,holz:1.6,stein:2,ziegel:1.7,schindel:1.5,stroh:2.2,putz:3,laub:2.6,rinde:1.2},$0=new Le,J0=new Gt,K0=new Wt,j0=new P,Q0=new P,se=(i,e,t,n=0,s=0,r=0,o=1,a=1,l=1)=>$0.clone().compose(Q0.set(i,e,t),J0.setFromEuler(K0.set(n,s,r)),j0.set(o,a,l)),eg=new P(0,1,0),ll=new P,gh=new P,xh=new P,cl=new P,qn=new P,Yn=new P,Se=class{constructor(e="glatt"){this.standard=e;this.liste=[]}get leer(){return this.liste.length===0}add(e,t,n,s={}){let r=typeof s=="number"?{schwanken:s}:s,o=r.muster||this.standard,a=e.index?e.toNonIndexed():e.clone();e.dispose(),n&&a.applyMatrix4(n);for(let f of Object.keys(a.attributes))f!=="position"&&f!=="normal"&&a.deleteAttribute(f);a.attributes.normal||a.computeVertexNormals();let l=a.attributes.position,u=l.count,h=new Ce(t),d=new Float32Array(u*3),c=new Float32Array(u*2),p=1/0,g=-1/0;if(r.verlauf)for(let f=0;f<u;f++){let b=l.getY(f);p=Math.min(p,b),g=Math.max(g,b)}let y=Z0[o],m=r.schwanken||0;for(let f=0;f<u;f+=3){let b=m?1+(Ve(f+u,u*.37+f*.11)-.5)*2*m:1;ll.fromBufferAttribute(l,f),gh.fromBufferAttribute(l,f+1),xh.fromBufferAttribute(l,f+2),cl.subVectors(gh,ll).cross(xh.clone().sub(ll)).normalize(),qn.crossVectors(eg,cl),qn.lengthSq()<.01?qn.set(1,0,0):qn.normalize(),Yn.crossVectors(cl,qn).normalize(),(Yn.y<0||Math.abs(Yn.y)<.01&&Yn.z<0)&&Yn.negate();for(let S=0;S<3;S++){let v=f+S,I=l.getX(v),w=l.getY(v),T=l.getZ(v),A=r.verlauf?r.verlauf[0]+(r.verlauf[1]-r.verlauf[0])*((w-p)/Math.max(1e-6,g-p)):1;d[v*3]=h.r*b*A,d[v*3+1]=h.g*b*A,d[v*3+2]=h.b*b*A,c[v*2]=(I*qn.x+w*qn.y+T*qn.z)/y,c[v*2+1]=(I*Yn.x+w*Yn.y+T*Yn.z)/y}}return a.setAttribute("color",new xt(d,3)),a.setAttribute("uv",new xt(c,2)),this.liste.push({g:a,m:o}),this}box(e,t,n,s,r,o,a,l=0,u={}){return this.add(new mt(e,t,n),a,se(s,r+t/2,o,0,l),u)}flaechen(e,t,n={}){let s=new Float32Array(e.length*9);e.forEach((o,a)=>o.forEach((l,u)=>s.set(l,a*9+u*3)));let r=new pt;return r.setAttribute("position",new xt(s,3)),r.computeVertexNormals(),this.add(r,t,void 0,n)}viereck(e,t,n,s,r,o={}){return this.flaechen([[e,t,n],[e,n,s]],r,o)}geometrie(){let e=[],t=[];_h.forEach((s,r)=>{let o=this.liste.filter(a=>a.m===s).map(a=>a.g);o.length&&(e.push(al(o,!1)),t.push(r))});let n=al(e,!0);n.groups.forEach((s,r)=>s.materialIndex=t[r]);for(let s of this.liste)s.g.dispose();for(let s of e)s.dispose();return this.liste=[],n.computeBoundingSphere(),n}netz(e=!0){let t=new it(this.geometrie(),hl);return t.castShadow=e,t.receiveShadow=!0,t}};function ji(i=2,e=.12,t=1){let n=new ln(1,i),s=n.attributes.position,r=new P;for(let a=0;a<s.count;a++){r.fromBufferAttribute(s,a);let l=r.clone().normalize(),u=1+e*(Math.sin(l.x*5.1+t)*Math.sin(l.y*4.3+t*2)+.6*Math.sin(l.z*6.7-t));s.setXYZ(a,l.x*u,l.y*u,l.z*u)}n.computeVertexNormals();let o=n.attributes.normal;for(let a=0;a<s.count;a++)r.fromBufferAttribute(s,a).normalize(),o.setXYZ(a,r.x,r.y,r.z);return n}var ul="#8a8378",tg="#6f6a63",ng="#221d1a",Qi="#3b3d42",fl="#585b62",yh="#ff7a1c",vh="#ffcf6e",Is="#6a4527",ig="#7c4a2c";function bh(i,e,t){i.box(1.9,.85,1.5,e,0,t,ul,0,{muster:"stein",schwanken:.05}),i.box(1.9-.3,.05,1.5-.3,e,.85,t,ng,0,{muster:"glatt"});for(let[a,l,u,h]of[[0,-(1.5/2-.07),1.9,.14],[0,1.5/2-.07,1.9,.14],[-(1.9/2-.07),0,.14,1.5],[1.9/2-.07,0,.14,1.5]])i.box(u,.13,h,e+a,.85,t+l,tg,0,{muster:"stein"});for(let a=0;a<14;a++){let l=Ve(a,3)*Math.PI*2,u=Ve(a,5)*.45,h=.07+Ve(a,7)*.07;i.add(new ln(1,0),a%3?yh:vh,se(e+Math.cos(l)*u,.85+.07,t+Math.sin(l)*u*.7,0,a,0,h,h*.6,h),{muster:"glatt"})}for(let a of[-1,1])i.box(.09,.78,.09,e+a*(1.9/2-.12),.85,t-1.5/2+.12,Qi,0,{muster:"metall"});i.add(new ke(.42,1.18,.9,4,1,!0),ul,se(e,.85+.78+.45,t,0,Math.PI/4,0,1,1,.78),{muster:"stein",schwanken:.04}),i.box(.62,.7,.62,e,.85+1.62,t,ul,0,{muster:"stein"});let o=e+1.9/2+.55;i.box(.9,.05,.55,o,.62,t,Is,0,{muster:"holz"}),i.box(.9,.05,.55,o,.98,t,Is,0,{muster:"holz"}),i.add(new ke(.06,.3,.8,6,1),ig,se(o+.05,.8,t,0,0,Math.PI/2,1,1,.8),{muster:"putz"}),i.add(new ke(.035,.05,.5,6),Qi,se(o-.6,.8,t,0,0,Math.PI/2),{muster:"metall"}),i.box(.06,.06,.5,o+.48,1,t,Is,0,{muster:"holz"});for(let a of[-1,1])i.box(.08,.62,.08,o+.3*a,0,t+.22,Is,0,{muster:"holz"});for(let a of[-1,1])i.add(new mt(.75,.03,.035),Qi,se(e-.15,.85+.15,t+1.5/2-.07+a*.03,0,a*.06,0),{muster:"metall"});return .85+.1}function Mh(){let i=new Se("glatt");for(let t=0;t<5;t++){let n=t/5*Math.PI*2,s=t?.28:0,r=t?.32+Ve(t,2)*.18:.55;i.add(new Mt(t?.12:.18,r,7),t%2?yh:"#ff9a2e",se(Math.cos(n)*s,r/2,Math.sin(n)*s*.7),{muster:"glatt"}),i.add(new Mt(t?.06:.09,r*.6,6),vh,se(Math.cos(n)*s,r*.3,Math.sin(n)*s*.7),{muster:"glatt"})}let e=new it(i.geometrie(),new Qt({vertexColors:!0,toneMapped:!1}));return e.castShadow=!1,e}function Sh(i,e,t,n=0){let s=new Le().makeRotationY(n).setPosition(e,0,t),r=(a,l,u,h)=>i.add(a,l,s.clone().multiply(u),{muster:h}),o=(a,l,u,h,d,c,p,g=0)=>r(new mt(a,l,u),p,se(h,d+l/2,c,0,g),"metall");r(new ke(.4,.47,.55,11),"#6a4a2e",se(0,.275,0),"rinde"),r(new ke(.41,.41,.03,11),"#a07a4e",se(0,.56,0),"holz"),o(.64,.15,.42,0,.57,0,Qi),o(.34,.2,.24,0,.72,0,Qi),o(.96,.19,.34,-.05,.92,0,fl),o(.9,.02,.3,-.05,1.11,0,"#7d8087"),r(new Mt(.15,.55,10),fl,se(.7,1.02,0,0,0,-Math.PI/2,1,1,1.05),"metall"),o(.2,.13,.26,-.62,.98,0,fl),r(new ke(.03,.035,.6,6),Is,se(-.1,1.17,.06,0,.5,Math.PI/2),"holz"),o(.11,.11,.24,.17,1.12,-.11,Qi,.5)}var Eh={bretter:"#8b6542",blockbohlen:"#7b5535",stein:"#8e8a80",putz:"#d9cfb6",fachwerk:"#ddd3b8",quader:"#9b968c",ziegel:"#9c5a42"},dl={ziegel:"#a2553a",schindel:"#6f5c49",stroh:"#c8a45a",schiefer:"#4c5462"},sg={bretter:"holz",blockbohlen:"holz",stein:"stein",quader:"stein",ziegel:"stein",putz:"putz",fachwerk:"putz"},wh={ziegel:"ziegel",schindel:"schindel",stroh:"stroh",schiefer:"schindel"},tn="#5b3b22",es="#3a2614",rg="#33404c",pl=i=>i?new Ce(i[0]/255,i[1]/255,i[2]/255).convertSRGBToLinear():null;function Th(i,e,t,n){if(!n)return;i.gruppe.rotation.y=-n*Math.PI/180;let s=(r,o)=>ph(r-e,o-t,n).map((a,l)=>a+(l?t:e));i.raeume=i.raeume.map(r=>{let o=s(r.x0,r.z0),a=s(r.x1,r.z1);return{x0:Math.min(o[0],a[0]),x1:Math.max(o[0],a[0]),z0:Math.min(o[1],a[1]),z1:Math.max(o[1],a[1])}});for(let r of i.tueren)[r.x,r.z]=s(r.x,r.z);for(let r of i.feuer)[r.x,r.z]=s(r.x,r.z)}function Ah(i,e,t,n){let s=new At;s.position.set(e,t,n);let r=new Se,o=i.koerper,a=c=>typeof c=="string"?Math.max(0,o.findIndex(p=>p.id===c)):c??0,l={gruppe:s,daecher:[],raeume:[],tueren:[],drehen:[],feuer:[],flackern:[]},u=.2;o.forEach((c,p)=>{let g=c.x,y=c.x+c.b,m=-c.d,f=-c.d-c.t,b=c.h,S=Eh[c.wand||"bretter"]||Eh.bretter,v=c.dach||{form:"flach"},I=v.hoehe??1.6,w=v.ueber??.35,T=v.form,A={muster:sg[c.wand||"bretter"]||"holz",schwanken:.03},x={muster:wh[v.deckung||"schindel"]||"schindel",schwanken:.03},_=(i.tueren||[]).filter(X=>a(X.koerper)===p).sort((X,le)=>X.x-le.x),C=g;for(let X of _){let le=X.x-X.b/2,De=X.x+X.b/2;le>C&&r.box(le-C,b,u,(C+le)/2,0,m-u/2,S,0,A),r.box(X.b,b-X.h,u,X.x,X.h,m-u/2,S),C=De,r.box(.12,X.h,u+.06,le-.06,0,m-u/2,tn,0,{muster:"holz"}),r.box(.12,X.h,u+.06,De+.06,0,m-u/2,tn,0,{muster:"holz"}),r.box(X.b+.24,.12,u+.06,X.x,X.h,m-u/2,tn,0,{muster:"holz"});let Y=X.art==="doppel"||X.art==="tor"?[[le,1],[De,-1]]:[[le,1]];for(let[Q,de]of Y){let re=X.b/Y.length,ve=new Se;ve.box(re-.04,X.h-.04,.08,de*re/2,0,0,"#6a4527",0,{muster:"holz",schwanken:.05}),ve.box(re-.1,.1,.1,de*re/2,X.h*.3,.02,es),ve.box(re-.1,.1,.1,de*re/2,X.h*.72,.02,es);let Te=ve.netz(),Ue=new At;Ue.position.set(Q,0,m-.06),Ue.add(Te),s.add(Ue),l.tueren.push({fluegel:Ue,x:e+X.x,z:n+m,zu:0,auf:de*-1.75})}}if(C<y&&r.box(y-C,b,u,(C+y)/2,0,m-u/2,S,0,A),r.box(c.b,b,u,(g+y)/2,0,f+u/2,S,0,A),r.box(u,b,c.t-2*u,g+u/2,0,(m+f)/2,S,0,A),r.box(u,b,c.t-2*u,y-u/2,0,(m+f)/2,S,0,A),c.wand==="fachwerk"||c.wand==="blockbohlen"||c.wand==="bretter"){let X=c.wand==="fachwerk"?"#4a3220":"#5e3f25",le=.04;for(let[De,Y]of[[g,m],[y,m],[g,f],[y,f]])r.box(.26,b,.26,De,0,Y,X,0,{muster:"holz"});if(r.box(c.b+.1,.18,.08,(g+y)/2,b-.18,m+le,X),r.box(.08,.18,c.t,y+le,b-.18,(m+f)/2,X),r.box(.08,.18,c.t,g-le,b-.18,(m+f)/2,X),c.wand==="fachwerk"){r.box(c.b+.1,.14,.08,(g+y)/2,b*.45,m+le,X),r.box(.08,.14,c.t,y+le,b*.45,(m+f)/2,X);for(let De=1;De<Math.round(c.b/1.4);De++)r.box(.14,b,.08,g+De*c.b/Math.round(c.b/1.4),0,m+le,X)}}c.sockel||c.wand==="stein"||c.wand==="quader"?r.box(c.b+.12,.35,c.t+.12,(g+y)/2,0,(m+f)/2,"#6c675e",0,{muster:"stein"}):r.box(c.b+.1,.3,c.t+.1,(g+y)/2,0,(m+f)/2,"#6c675e",0,{muster:"stein"});let L=b+I,U=(g+y)/2,O=(m+f)/2,W=new Se;if(T==="sattel"&&(v.first||"x")==="x")for(let X of[g+u/2,y-u/2])W.flaechen([[[X,b,m],[X,b,f],[X,L,O]]],S,A);if(T==="sattel"&&v.first==="d")for(let X of[m-u/2,f+u/2])W.flaechen([[[g,b,X],[y,b,X],[U,L,X]]],S,A);if(T==="pult")for(let X of[g+u/2,y-u/2])W.flaechen([[[X,b,m],[X,b,f],[X,L,f]]],S,A);let k=pl(v.farbe)||new Ce(dl[v.deckung||"schindel"]||dl.schindel),Z=g-w,H=y+w,ie=m+w,ee=f-w;if(T==="flach")W.box(c.b+2*w,.25,c.t+2*w,U,b,O,k,0,x);else if(T==="sattel"&&(v.first||"x")==="x"){let X=I/(c.t/2)*w,le=b-X;W.viereck([Z,le,ie],[H,le,ie],[H,L,O],[Z,L,O],k,x),W.viereck([Z,le,ee],[H,le,ee],[H,L,O],[Z,L,O],k,x),W.box(c.b+2*w+.1,.16,.24,U,L-.08,O,es)}else if(T==="sattel"){let X=I/(c.b/2)*w,le=b-X;W.viereck([Z,le,ie],[Z,le,ee],[U,L,ee],[U,L,ie],k,x),W.viereck([H,le,ie],[H,le,ee],[U,L,ee],[U,L,ie],k,x),W.box(.24,.16,c.t+2*w+.1,U,L-.08,O,es)}else if(T==="pult"){let X=I/c.t*w;W.viereck([Z,b-X,ie],[H,b-X,ie],[H,L+X,ee],[Z,L+X,ee],k,x)}else{let X=b-.25,le=c.b>=c.t,De=T==="zelt"?0:Math.abs(c.b-c.t)/2,Y=le?[U-De,L,O]:[U,L,O-De],Q=le?[U+De,L,O]:[U,L,O+De],de=[Z,X,ie],re=[H,X,ie],ve=[H,X,ee],Te=[Z,X,ee];le?(W.viereck(de,re,Q,Y,k,x),W.viereck(Te,ve,Q,Y,k,x),W.flaechen([[de,Te,Y],[re,ve,Q]],k,x)):(W.viereck(de,Te,Y,Q,k,x),W.viereck(re,ve,Y,Q,k,x),W.flaechen([[de,re,Q],[Te,ve,Y]],k,x))}if(!W.leer){let X=W.netz();s.add(X),l.daecher.push(X)}c.betretbar&&(r.box(c.b-2*u,.06,c.t-2*u,U,0,O,i.innen?.boden==="stein"?"#8a857c":"#86603c",0,{muster:i.innen?.boden==="stein"?"stein":"holz"}),l.raeume.push({x0:e+g,x1:e+y,z0:n+f,z1:n+m}))});for(let c of i.fenster||[]){let p=o[a(c.koerper)],g=c.wand==="ost",y=c.art==="glut"?"#e7a640":c.art==="gruen"?"#4e6a52":c.art==="violett"?"#b38ad6":c.art==="schalter"?"#221a16":rg,m=new Se,f=c.z;if(m.box(c.b+.16,c.h+.16,.06,0,f-.08,0,tn,0,{muster:"holz"}),m.box(c.b,c.h,.08,0,f,.01,y),(c.art==="kreuz"||!c.art)&&(m.box(.06,c.h,.1,0,f,.02,tn,0,{muster:"holz"}),m.box(c.b,.06,.1,0,f+c.h/2-.03,.02,tn,0,{muster:"holz"})),c.art==="schalter"){for(let S=1;S<6;S++)m.box(.05,c.h-.12,.08,-c.b/2+c.b*S/6,f+.12,.05,"#c4a052",0,{muster:"metall"});m.box(c.b+.24,.1,.45,0,f-.1,.2,"#7a5232",0,{muster:"holz"})}if(c.laeden)for(let S of[-1,1])m.box(c.b/2,c.h,.06,S*(c.b*.75+.1),f,.03,"#4f6b4c",0,.05);if(c.blumen){m.box(c.b+.1,.18,.22,0,f-.2,.1,"#6a4527");for(let S=0;S<4;S++)m.box(.14,.14,.14,-c.b/2+.15+S*(c.b-.3)/3,f-.04,.12,S%2?"#d2463c":"#e8c547")}let b=m.netz(!1);g?(b.rotation.y=Math.PI/2,b.position.set(p.x+p.b+.01,0,-(c.d??p.t/2))):b.position.set(c.x??0,0,-p.d+.01),s.add(b)}for(let c of i.zubehoer||[]){let p=o[a(c.koerper)],g=p.dach||{form:"flach"},y=p.h+(g.hoehe??1.6);if(c.art==="esse"){let m=(i.zubehoer||[]).find(I=>I.art==="kamin"),f=m?m.x??0:((c.x0??-1)+(c.x1??1))/2,b=m?-(m.d??p.t/2):-(p.d+p.t/2),S=bh(r,f,b),v=Mh();v.position.set(f,S,b),s.add(v),l.flackern.push(v),l.feuer.push(new P(e+f,t+S+.35,n+b))}else if(c.art==="kamin")r.box(.6,y-p.h+.9,.6,c.x??0,p.h-.2,-(c.d??p.t/2),"#7a6f66",0,{muster:"stein"});else if(c.art==="banner")r.box(.55,1.1,.05,c.x??0,(c.z??2)-1.1,-p.d+.05,pl(c.farbe)||"#9b2f2a"),r.box(.7,.06,.08,c.x??0,c.z??2,-p.d+.06,tn,0,{muster:"holz"});else if(c.art==="laterne"||c.art==="schild")r.box(.24,.32,.24,c.x??0,(c.z??2)-.3,-p.d+.15,c.art==="laterne"?"#f1b84d":"#8a6440");else if(c.art==="vordach"){let m=c.x0??-1,f=c.x1??1,b=c.tiefe??1,S=c.z??2.2,v=-p.d,I={muster:wh[c.deckung||"schindel"]||"schindel"},w=pl(c.farbe)||new Ce(dl[c.deckung||"schindel"]),T=new Se;T.viereck([m-.15,S+.45,v],[f+.15,S+.45,v],[f+.15,S-.05,v+b+.15],[m-.15,S-.05,v+b+.15],w,I);for(let x of[m,f])T.box(.12,S-.05,.12,x,0,v+b,tn,0,{muster:"holz"});let A=T.netz();s.add(A)}else if(c.art==="muehlrad"){let m=new Se,f=c.r??1.5,b=c.b??.8;for(let v of[-b/2,b/2])m.add(new ci(f,.07,6,24),tn,new Le().makeTranslation(0,0,v),{muster:"holz"});for(let v=0;v<8;v++){let I=v*Math.PI/4;m.add(new mt(.09,f*2,.09),tn,new Le().makeRotationZ(I),{muster:"holz"}),m.add(new mt(.06,.42,b+.08),"#6a4a2c",new Le().makeRotationZ(I).multiply(new Le().makeTranslation(0,f-.12,0)),{muster:"holz"})}m.add(new ke(.16,.16,b+.4,10),es,new Le().makeRotationX(Math.PI/2));let S=m.netz();S.position.set(c.x??0,c.z??f*.75,-p.d+b/2+.15),s.add(S),l.drehen.push(S)}else if(c.art==="fluegel"){let m=new Se,f=c.laenge??3;for(let S=0;S<4;S++){let v=S*Math.PI/2;m.add(new mt(.16,f,.06),tn,new Le().makeRotationZ(v).multiply(new Le().makeTranslation(0,f/2,0))),m.add(new mt(.62,f*.8,.03),"#d8cfb9",new Le().makeRotationZ(v).multiply(new Le().makeTranslation(.36,f*.55,.03)))}m.box(.4,.4,.5,0,-.2,-.2,es);let b=m.netz();b.position.set(c.x??0,c.z??p.h,-p.d+.45),s.add(b),l.drehen.push(b)}}let h={tisch:[1.2,.75,.8,"#7a5232"],bett:[1,.55,2,"#a8443a"],theke:[2.4,1,.6,"#6a4527"],fass:[.6,.8,.6,"#7a5232"],amboss:[.7,.7,.4,"#3c3c40"],regal:[1.2,1.8,.4,"#6a4527"],ofen:[1,1.3,1,"#6c655e"],altar:[1.4,1,.7,"#bdb5a5"],bank:[1.5,.45,.4,"#7a5232"],kessel:[.7,.6,.7,"#34332f"],heu:[1.2,.8,1,"#c9a85a"],saecke:[.9,.6,.6,"#c2ae86"],muehlstein:[1.2,.5,1.2,"#8e8a80"],frisierstuhl:[.7,.55,.7,"#74428c"]};for(let c of i.innen?.moebel||[])c.art==="spiegel"&&(r.box(1,1.95,.14,c.x,.06,-c.d,"#c49c46",0,{muster:"metall"}),r.box(.76,1.55,.05,c.x,.26,-c.d+.09,"#c4a2ea",0,{muster:"glatt"}));for(let c of i.innen?.moebel||[])if(c.art==="schalter"){r.box(1.6,1,.5,c.x,.06,-c.d,"#7a5232",0,{muster:"holz"});for(let p=0;p<6;p++)r.box(.04,.9,.04,c.x-.75+p*.3,1.06,-c.d+.2,"#c4a052",0,{muster:"metall"});r.box(1.6,.06,.06,c.x,1.92,-c.d+.2,"#c4a052",0,{muster:"metall"})}else c.art==="tresor"&&(r.box(1.1,1.2,.8,c.x,.06,-c.d,"#34363c",0,{muster:"metall"}),r.add(new ke(.22,.22,.05,14),"#cca85a",new Le().makeRotationX(Math.PI/2).setPosition(c.x,.66,-c.d+.42),{muster:"metall"}));for(let c of i.innen?.moebel||[])c.art==="amboss"&&Sh(r,c.x,-c.d,0);for(let c of i.innen?.moebel||[])if(c.art==="treppe")for(let p=0;p<6;p++)r.box(1.1,.35*(p+1),.4,c.x,.06,-(c.d-1.2+p*.4+.2),"#7a5232",0,{muster:"holz"});else if(c.art==="treppe_oben"){r.box(1.2,.02,2.4,c.x,.07,-c.d,"#181210",0,{muster:"glatt"});for(let p of[-.65,.65])r.box(.1,.9,2.4,c.x+p,.06,-c.d,"#5b3b22",0,{muster:"holz"});r.box(1.3,.1,.1,c.x,.9,-(c.d-1.2),"#5b3b22",0,{muster:"holz"})}for(let c of(i.innen?.moebel||[]).filter(p=>!["spiegel","treppe","treppe_oben","schalter","tresor","amboss"].includes(p.art))){let[p,g,y,m]=h[c.art]||[.8,.8,.8,"#7a5232"];r.box(p,g,y,c.x,.06,-c.d,m,0,{muster:m==="#8a857c"||c.art==="ofen"||c.art==="muehlstein"||c.art==="altar"?"stein":"holz"})}let d=r.netz();return s.add(d),l}var Ps="#5d4129";function og(i,e,t,n,s,r,o=1){for(let a=0;a<s;a++){let l=a/s*Math.PI*2+r,u=a===0?0:t*.28,h=(a===0?.62:.46+.1*Ve(a,r))*t;i.add(ji(2,.13,r*3+a),n[a%n.length],se(Math.cos(l)*u,e*(a===0?.68:.56+.12*Ve(r,a)),Math.sin(l)*u,Ve(a,3),Ve(a,4),0,h,h*o,h),{muster:"laub",verlauf:[.55,1.2]})}}function ts(i,e,t,n,s=Ps,r=1,o=5){let a=new Se("rinde");return a.add(new ke(.18,.32,i*.55,9),s,se(0,i*.275,0),.05),a.add(new ke(.05,.1,i*.3,4),s,se(.35,i*.4,0,0,0,-.7)),og(a,i,e,t,o,n,r),a.geometrie()}function ag(i,e,t){let n=new Se("rinde");n.add(new ke(.12,.22,i*.3,8),Ps,se(0,i*.15,0));let s=4;for(let r=0;r<s;r++){let o=r/s,a=e*.5*(1-o*.72),l=i*.42*(1-o*.35);n.add(new Mt(a,l,11),t[r%t.length],se(0,i*.18+o*i*.62+l/2,0,0,r*.4,0),{muster:"laub",verlauf:[.6,1.15]})}return n.geometrie()}function lg(i){let e=new Se("rinde");e.add(new ke(.12,.28,i*.7,8),"#5a5148",se(0,i*.35,0),.05);for(let t=0;t<5;t++){let n=t*1.3,s=i*(.35+t*.08);e.add(new ke(.03,.08,i*.32,4),"#5a5148",se(Math.cos(n)*.5,s+i*.1,Math.sin(n)*.5,Math.sin(n)*.8,0,-Math.cos(n)*.8))}return e.geometrie()}function cg(){let i=new Se("holz");for(let e=0;e<5;e++){let t=-.8+e*.4,n=2+Ve(e,9)*.3;i.add(new ke(.19,.2,n,6),"#6e4c2e",se(t,n/2,-.35),.06),i.add(new Mt(.19,.4,6),"#6e4c2e",se(t,n+.2,-.35))}return i.box(2,.14,.1,0,1.4,-.12,"#4f3420"),i.geometrie()}function hg(){let i=new Se("holz");for(let e of[-.95,.95])i.box(.14,1,.14,e,0,-.15,"#6e4c2e");return i.box(2,.1,.06,0,.75,-.15,"#8a6440"),i.box(2,.1,.06,0,.4,-.15,"#8a6440"),i.geometrie()}function ug(){let i=new Se("holz");i.add(new ke(.3,.3,.72,8),"#7a5232",se(0,.36,-.1),.05);for(let e of[.15,.57])i.add(new ke(.315,.315,.06,8),"#3b3530",se(0,e,-.1));return i.geometrie()}function fg(){let i=new Se("holz");return i.box(.82,.6,.5,0,0,-.27,"#8b6440",.2,.06),i.box(.86,.08,.54,0,.5,-.27,"#5b3b22",.2),i.geometrie()}function dg(){let i=new Se;return i.box(.1,1.9,.1,0,0,0,"#3b3530"),i.box(.5,.06,.06,.2,1.8,0,"#3b3530"),i.box(.22,.3,.22,.4,1.45,0,"#f3c25a"),i.geometrie()}function pg(){let i=new Se("stroh");return i.add(new ke(.48,.48,.9,10),"#c8a55a",se(0,.48,0,0,0,Math.PI/2),.06),i.geometrie()}function mg(){let i=new Se("holz");for(let e=0;e<3;e++)for(let t=0;t<4-e;t++)i.add(new ke(.15,.15,1.5,6),e%2?"#8a6440":"#7a5634",se(-.45+t*.3+e*.15,.15+e*.26,-.3,0,0,Math.PI/2),.08);return i.geometrie()}function gg(){let i=new Se("holz");i.box(1.4,.08,.36,0,.42,-.18,"#8a6440");for(let e of[-.6,.6])i.box(.08,.42,.3,e,0,-.18,"#5b3b22");return i.geometrie()}function ml(i){let e=new Se("holz");for(let[t,n]of[[-1.4,-.1],[1.4,-.1],[-1.4,-1],[1.4,-1]])e.box(.1,2.2,.1,t,0,n,"#5b3b22");e.box(3,.9,.7,0,0,-.35,"#8a6440",0,.04),e.viereck([-1.6,2,.2],[1.6,2,.2],[1.6,2.5,-1.2],[-1.6,2.5,-1.2],i,{muster:"putz"});for(let t=0;t<6;t++)e.box(.22,.2,.22,-1.1+t*.44,.9,-.35,["#d2463c","#e8c547","#6aa04a"][t%3]);return e.geometrie()}function xg(){let i=new Se;for(let e=0;e<6;e++){let t=.22+Ve(e,2)*.12;i.add(new ln(1,0),"#d9792c",se(-.8+e*.32,t*.8,-.25+Ve(e,5)*.2-.1,0,e,0,t,t*.8,t),.08)}return i.geometrie()}function _g(){let i=new Se("stein");i.add(new ke(1,1.05,.8,10,1,!0),"#8e8a80",se(0,.4,-.35),.08),i.add(new ke(.9,.9,.05,10),"#2f6f8f",se(0,.55,-.35),{muster:"glatt"});for(let e of[-.9,.9])i.box(.14,2.1,.14,e,0,-.35,"#5b3b22");return i.viereck([-1.2,2,.4],[1.2,2,.4],[1.2,2.6,-.35],[-1.2,2.6,-.35],"#a2553a",{muster:"ziegel"}),i.viereck([-1.2,2,-1.1],[1.2,2,-1.1],[1.2,2.6,-.35],[-1.2,2.6,-.35],"#a2553a",{muster:"ziegel"}),i.geometrie()}function yg(){let i=new Se("holz");for(let e of[-2.1,2.1])i.box(.5,4,.5,e,0,-.2,"#6e4c2e",0,.05),i.add(new Mt(.36,.5,6),"#6e4c2e",se(e,4.25,-.2));return i.box(4.9,.36,.4,0,3.3,-.2,"#5b3b22"),i.box(1.6,.7,.08,0,2.55,.02,"#8a6440"),i.geometrie()}function vg(){let i=new Se("stroh");return i.add(new Mt(1.1,1.3,9),"#3a332c",se(0,.65,0),.1),i.geometrie()}function bg(){let i=new Se("rinde");return i.add(new ke(.45,.55,9,8),"#5d4129",se(0,.5,-4.5,Math.PI/2,0,0),.05),i.geometrie()}var _l={};function Ih(i){_l=i}function Mg(i){let e=new Se;for(let t of i){let n=[];for(let s=0;s+8<t.p.length;s+=9)n.push([[t.p[s],t.p[s+1],t.p[s+2]],[t.p[s+3],t.p[s+4],t.p[s+5]],[t.p[s+6],t.p[s+7],t.p[s+8]]]);n.length&&e.flaechen(n,t.farbe,{muster:t.muster,schwanken:.03})}return e.geometrie()}var Gr="#7a5634",vl="#8f6a42",Sg="#8a857a",yl="#3a3836",Eg="#ffb24a",wg="#fff0b0",Ph={moor_bruecke_alt_01:{luecken:[5,11],vorn:1,kurzVorn:2,hinten:1,kurzHinten:-1},moor_bruecke_alt_02:{luecken:[3,9,10],vorn:.42,kurzVorn:-1,hinten:1,kurzHinten:1},moor_bruecke_alt_03:{luecken:[7],vorn:0,kurzVorn:-1,hinten:.7,kurzHinten:3},moor_bruecke_morsch_01:{luecken:[2,6,7,8,9,10,13],vorn:0,kurzVorn:-1,hinten:.3,kurzHinten:-1}};function gl(i,e,t,n=""){let s=new Se("holz"),r=.85,o=t?0:-e/2,a=Math.round(i/.42),l=Ph[n];for(let h=0;h<a;h++){if(l&&l.luecken.includes(h))continue;let d=-i/2+(h+.5)*i/a,c=l?(Ve(h,17)-.5)*.08:0,p=l?-Ve(h,5)*.05:0;s.add(new mt(i/a-(l?.07:.04),.12,e*(l?.94+Ve(h,9)*.06:1)),l?h%3?"#7a6a58":h%2?"#6a5c4c":"#86745e":h%3?Gr:vl,se(d,r-.06+p,o+(l?(Ve(h,11)-.5)*.12:0),c,l?(Ve(h,13)-.5)*.06:0,0),{muster:"holz",schwanken:.06}),l&&Ve(h,21)<.3&&s.box(i/a*.7,.02,e*.4,d,r,o+(Ve(h,23)-.5)*e*.5,"#4f6236",0,{muster:"laub"})}for(let[h,d,c]of[[o-e/2+.1,l?l.hinten:1,l?l.kurzHinten:-1],[o+e/2-.1,l?l.vorn:1,l?l.kurzVorn:-1]]){let p=0;for(let g=-i/2+.15;g<=i/2;g+=i/4,p++){if(s.box(.22,1.8,.22,g,r-1.8,h,l?"#3d3226":"#4a3020"),p/4>d+.01)continue;let y=p===c?.42:.9;s.add(new mt(.16,y,.16),l?"#4e4032":"#5b3b22",se(g,r-.1+y/2,h,0,0,l&&p===c?.25:0))}if(d>0){let g=i*Math.min(1,d);if(c>=0&&l){let y=-i/2+.15+c*i/4,m=Math.atan2(.4,y+i/2);s.add(new mt(Math.hypot(y+i/2,.4),.12,.12),"#5b4a38",se((-i/2+y)/2,r+.55,h,0,0,-m))}else s.box(g,.12,.12,-i/2+g/2,r+.75,h,l?"#5b4a38":"#5b3b22")}}let u=s.geometrie();return t&&(u.rotateY(Math.PI/2),u.translate(0,0,-i/2)),u}function Tg(){let i=new Se("stein");i.box(7.6,1.7,1.5,0,-.8,-.85,Sg,0,{muster:"stein",schwanken:.05});for(let e=0;e<17;e++)i.box(.42,.1,1.4,-3.4+e*.425,.9,-.85,e%2?Gr:vl,0,{muster:"holz"});for(let e of[-2.2,0,2.2])i.box(.9,.5,.25,e,.1,-.05,"#cfe4ec",0,{muster:"glatt"}),i.box(1.1,.25,.9,e,-.15,.45,"#e8f3f6",0,{muster:"glatt"});for(let e of[-3.6,3.6])i.box(.5,1.3,1.7,e,-.4,-.85,"#77726a",0,{muster:"stein"});return i.geometrie()}function Ag(){let i=new Se("holz");for(let t=0;t<12;t++)i.box(.44,.16,3.2,-2.6+t*.47,.05,-1.4,t%3?Gr:vl,0,{muster:"holz",schwanken:.06});for(let t of[-.1,-2.7])i.box(5.7,.18,.2,0,.22,t,"#5b3b22");for(let t of[-2.6,2.6])for(let n of[-.1,-2.7])i.box(.18,.8,.18,t,.2,n,"#4a3020");for(let t=0;t<6;t++)i.add(new ci(.12,.04,5,8),yl,se(-2.4+t*.22,.32,-.1+t%2*.05,Math.PI/2*(t%2),0,0),{muster:"metall"});let e=i.geometrie();return e.rotateZ(.08),e.rotateX(-.05),e.translate(0,.72,0),e}function Rg(){let i=new Se("holz");i.box(3.2,.36,1.1,0,0,-.5,"#5e4029",0,{muster:"holz"}),i.box(3,.08,.9,0,.2,-.5,"#3b2a1c");for(let t of[-1,1])i.add(new Mt(.55,.9,4),"#5e4029",se(t*2,.18,-.5,0,Math.PI/4,t*Math.PI/2,1,1,.7),{muster:"holz"});i.box(.08,.06,2.4,.3,.42,-.5,Gr,.5);let e=i.geometrie();return e.translate(0,.6,0),e}function Rh(i){let e=new Se("stein");e.add(ji(1,.08,3+i),"#7d7a72",se(0,1.1,-.2,0,.3,i,.42,1.25,.3),{muster:"stein",verlauf:[.75,1.1]});for(let t=0;t<6;t++)e.add(new ci(.16+t*.03,.025,4,10,Math.PI*1.4),"#5d8f8a",se(0,1.25+t*.02,.1,0,0,t*1.1),{muster:"glatt"});return e.geometrie()}function Cg(){let i=new Se("stein");i.box(2,.4,.9,0,-.15,-.45,"#6f6b62");for(let t of[-.75,.75])i.box(.25,1.1,.25,t,.25,-.45,"#7d7a72");i.box(2.1,.22,1,0,1.35,-.45,"#6a665d"),i.box(.5,.6,.35,0,.25,-.45,"#8d887d"),i.add(ji(1,.1,9),"#3f5a30",se(-.6,1.6,-.3,0,0,0,.5,.18,.4),{muster:"laub"});let e=i.geometrie();return e.rotateZ(-.12),e}function Ig(){let i=new Se("stein");for(let e=0;e<16;e++){let t=e/16*Math.PI*2,n=.32+Ve(e,4)*.12;i.add(ji(1,.12,e),e%3?"#8a857a":"#77726a",se(Math.cos(t)*2,n*.5,-1.2+Math.sin(t)*1,0,t,0,n*1.2,n*.8,n),{muster:"stein",verlauf:[.8,1.1]})}return i.box(3.6,.06,1.6,0,0,-1.2,"#4a3a28",0,{muster:"glatt"}),i.geometrie()}function bl(i,e,t,n,s){i.add(new Mt(.3*s,.9*s,7),Eg,se(e,t+.45*s,n),{muster:"glatt"}),i.add(new Mt(.16*s,.55*s,6),wg,se(e+.04,t+.3*s,n+.04),{muster:"glatt"})}function Pg(){let i=new Se("metall");return i.box(.08,1.35,.08,0,0,0,yl,0,{muster:"metall"}),i.add(new ke(.3,.18,.35,8,1,!0),yl,se(0,1.5,0),{muster:"metall"}),i.add(new ke(.24,.24,.12,8),"#c2552a",se(0,1.55,0)),bl(i,0,1.6,0,.8),i.geometrie()}function Lg(){let i=new Se("holz");for(let e=0;e<12;e++){let t=e/12*Math.PI*2;i.add(ji(1,.1,e),"#77726a",se(Math.cos(t)*1.2,.12,-.7+Math.sin(t)*.9,0,0,0,.26,.2,.26),{muster:"stein"})}for(let e=0;e<7;e++){let t=e/7*Math.PI*2;i.add(new ke(.08,.1,1.5,6),"#5d4129",se(Math.cos(t)*.32,.6,-.7+Math.sin(t)*.32,Math.sin(t)*.45,0,-Math.cos(t)*.45),{muster:"rinde"})}return bl(i,0,.15,-.7,1.7),i.geometrie()}function Dg(){let i=new Se("glatt");return i.add(new ke(.025,.05,1.6,4),"#4a4a32",se(0,.8,0,.1,0,.08),{muster:"rinde"}),i.add(new ln(.2,1),"#c8ffd8",se(.08,1.75,0)),i.add(new ln(.11,1),"#a8f0c0",se(-.25,1.3,.1)),i.geometrie()}function Ug(){let i=new Se("stroh");return i.box(1.1,.28,2,0,0,-.5,"#c8a55a",0,{muster:"stroh"}),i.box(.9,.06,1.1,0,.28,-.25,"#6a4a3a",.1,{muster:"putz"}),i.box(.5,.14,.32,0,.28,-1.25,"#d8cdb0",0,{muster:"putz"}),i.geometrie()}function Ng(){let i=new Se("holz");i.box(1.2,.55,.7,0,0,-.35,"#6a4527",0,{muster:"holz"}),i.add(new ke(.35,.35,1.2,10,1,!1,0,Math.PI),"#7a5232",se(0,.55,-.35,0,0,Math.PI/2),{muster:"holz"});for(let e of[-.45,.45])i.box(.08,.95,.74,e,0,-.35,"#b08a3a",0,{muster:"metall"});return i.box(.16,.2,.06,0,.35,.02,"#d8b04a",0,{muster:"metall"}),i.geometrie()}function Fg(){let i=new Se("holz");i.box(2,.1,.95,0,.75,-.5,"#7a5232",0,{muster:"holz"});for(let[e,t]of[[-.85,-.12],[.85,-.12],[-.85,-.88],[.85,-.88]])i.box(.12,.75,.12,e,0,t,"#5b3b22");return i.add(new ke(.05,.05,.28,6),"#efe6cf",se(.5,.99,-.5)),bl(i,.5,1.13,-.5,.18),i.box(.7,.02,.5,-.3,.85,-.5,"#d8c8a0",.2,{muster:"glatt"}),i.geometrie()}function zg(){let i=new Se("holz");i.box(1.2,.5,1,0,0,-.5,"#5b3b22",0,{muster:"holz"}),i.box(1.2,1.9,.18,0,.5,-.92,"#5b3b22",0,{muster:"holz"}),i.box(1,.12,.85,0,.5,-.45,"#9b2f2a",0,{muster:"putz"}),i.box(.9,1,.06,0,.9,-.82,"#9b2f2a",0,{muster:"putz"});for(let e of[-.6,.6])i.box(.14,.3,.9,e,.5,-.5,"#4a3020"),i.add(new li(.12,8,6),"#b08a3a",se(e,2.5,-.92),{muster:"metall"});return i.geometrie()}function Og(){let i=new Se("holz");for(let t of[-.32,.32])i.box(.09,4.4,.09,t,0,0,"#7a5634",0,{muster:"holz"});for(let t=0;t<11;t++)i.box(.64,.06,.07,0,.3+t*.38,0,"#8f6a42");let e=i.geometrie();return e.rotateX(-.22),e}function Bg(){let i=new Se("rinde");i.add(new ke(.45,.6,9.6,9),"#5d4129",se(0,.5,-.45,0,0,Math.PI/2),{muster:"rinde"}),i.add(new ke(.62,.62,.06,9),"#b08a5a",se(-4.82,.5,-.45,0,0,Math.PI/2));for(let e of[-2,1.5,3.2])i.add(new ke(.04,.12,1.2,4),"#5d4129",se(e,1,-.45,.5,0,.4));return i.geometrie()}function Ch(i){let e=new Se("glatt");for(let t=0;t<16;t++){let n=Ve(t,7)*Math.PI*2,s=Ve(t,3)*i,r=.9+Ve(t,5)*.9,o=Math.cos(n)*s,a=Math.sin(n)*s*.6-.3;e.add(new Mt(.05,r,3),t%3?"#6f8a3c":"#8a9a48",se(o,r/2,a,(Ve(t,1)-.5)*.4,0,(Ve(t,2)-.5)*.4),{muster:"glatt",verlauf:[.6,1.15]}),t%4===0&&e.add(new ke(.06,.06,.26,5),"#6a4228",se(o,r*.85,a))}return e.geometrie()}var Lh={dorf_bruecke_01:[-3.2,-2.7,3.2,.1,.85],moor_bruecke_alt_01:[-3.2,-2.7,3.2,.1,.85],moor_bruecke_alt_02:[-3.2,-2.7,3.2,.1,.85],moor_bruecke_alt_03:[-3.2,-2.7,3.2,.1,.85],moor_bruecke_morsch_01:[-3.2,-2.7,3.2,.1,.85],dorf_bruecke_02:[-1.4,-5.2,1.4,.1,.85],dorf_wehr_01:[-3.5,-1.6,3.5,-.1,1]},xl=new Map;function Ml(i){if(xl.has(i.id))return xl.get(i.id);let e=i.groesse[1]/48*i.massstab*.85,t=i.groesse[0]/48*i.massstab*.68,n=i.id,s=null;return _l[n]?s=Mg(_l[n]):/eiche_01/.test(n)?s=ts(e,t,["#4a6e2a","#557a30","#41622a"],1):/eiche_02/.test(n)?s=ts(e,t,["#527a30","#46692c","#5e8538"],2,Ps,.9,4):/linde/.test(n)?s=ts(e,t*.9,["#5a8034","#4e702f","#668c3c"],3,Ps,1.25,5):/herbst/.test(n)?s=ts(e,t,["#c9772e","#b85e28","#d8963a"],4):/apfel/.test(n)?s=ts(e,t,["#6b9b43","#5d8c3b","#b8433a"],5,Ps,.85,6):/birke/.test(n)?s=ts(e,t*.7,["#8aa84a","#7c9a42"],6,"#d9d4c8",1.3,4):/tanne/.test(n)?s=ag(e,t*.95,["#2f5a34","#386640","#2a5030"]):/erle_tot/.test(n)?s=lg(e*.85):/palisade/.test(n)?s=cg():/zaun/.test(n)?s=hg():/fass/.test(n)?s=ug():/kiste/.test(n)?s=fg():/laterne/.test(n)?s=dg():/heuballen/.test(n)?s=pg():/holzstapel/.test(n)?s=mg():/dorf_bank/.test(n)?s=gg():/marktstand_01/.test(n)?s=ml("#b8433a"):/marktstand_02/.test(n)?s=ml("#3f6aa0"):/marktstand_03/.test(n)?s=ml("#5f8a3a"):/kuerbisse/.test(n)?s=xg():/brunnen/.test(n)?s=_g():n==="dorf_tor_01"?s=yg():/meiler/.test(n)?s=vg():/baumstamm_02/.test(n)?s=bg():n==="dorf_bruecke_01"?s=gl(6.4,2.7,!1):Ph[n]?s=gl(6.4,2.7,!1,n):n==="dorf_bruecke_02"?s=gl(5.3,2.7,!0):n==="dorf_wehr_01"?s=Tg():/faehre/.test(n)?s=Ag():/kahn/.test(n)?s=Rg():n==="moor_menhir_01"?s=Rh(0):n==="moor_menhir_02"?s=Rh(.28):/schrein/.test(n)?s=Cg():/steinring/.test(n)?s=Ig():/festfeuer/.test(n)?s=Lg():/feuerkorb/.test(n)?s=Pg():/moorlicht/.test(n)?s=Dg():/hoehle_lager/.test(n)?s=Ug():/hoehle_truhe/.test(n)?s=Ng():/hoehle_tisch/.test(n)?s=Fg():/hoehle_thron/.test(n)?s=zg():/hoehle_leiter/.test(n)?s=Og():/baumstamm_01/.test(n)?s=Bg():n==="stil_schilf_01"?s=Ch(.45):n==="stil_schilf_02"&&(s=Ch(.7)),s&&(s.userData.geteilt=!0),xl.set(i.id,s),s}var Wr=i=>i.kategorie==="bewuchs"&&!/baumstamm|^k_/.test(i.id),Sl=i=>/^dorf_(palisade|zaun)/.test(i.id);var Dh=`
  uniform vec2 groesse; uniform vec2 mitte; uniform vec2 rep; uniform vec2 off; varying vec2 vUv;
  void main() {
    vUv = uv * rep + off;
    vec3 fuss = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    vec3 rechts = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]), oben = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
    vec2 q = vec2((uv.x - mitte.x) * groesse.x, (uv.y - mitte.y) * groesse.y);
    vec3 r0 = normalize(vec3(rechts.x, 0.0, rechts.z) + vec3(1e-5, 0.0, 0.0));
    vec4 a = projectionMatrix * viewMatrix * vec4(fuss + rechts * q.x + oben * q.y, 1.0);      /* so sieht man sie */
    vec4 b = projectionMatrix * viewMatrix * vec4(fuss + r0 * q.x + vec3(0.0, q.y, 0.0), 1.0); /* so tief steht sie (aufrecht) */
    gl_Position = vec4(a.xy, clamp(b.z / b.w, -1.0, 1.0) * a.w, a.w);
  }`,Uh=`
  uniform sampler2D map; uniform float deck; uniform float durch; varying vec2 vUv;
  void main() {
    vec4 c = texture2D(map, vUv); if (c.a < 0.35) discard;
    gl_FragColor = durch > 0.5 ? vec4(mix(c.rgb, vec3(0.08, 0.1, 0.16), 0.75), 0.5) : vec4(c.rgb, deck);
    #include <colorspace_fragment>
  }`,Ls=class{constructor(e){this.gruppe=new At;let t=()=>({map:{value:e},groesse:{value:new Ee(1,2)},mitte:{value:new Ee(.5,.05)},rep:{value:new Ee(1,1)},off:{value:new Ee(0,0)},deck:{value:1},durch:{value:0}});this.haupt=new Bt({uniforms:t(),vertexShader:Dh,fragmentShader:Uh,transparent:!0}),this.durch=new Bt({uniforms:t(),vertexShader:Dh,fragmentShader:Uh,transparent:!0,depthTest:!1,depthWrite:!1}),this.durch.uniforms.durch.value=1;let n=new Zi(1,1);n.translate(.5,.5,0);let s=new it(n,this.durch),r=new it(n,this.haupt);s.renderOrder=10,r.renderOrder=11,s.frustumCulled=r.frustumCulled=!1,this.gruppe.add(s,r)}setze(e,t,n,s,r){for(let o of[this.haupt,this.durch]){let a=o.uniforms;a.map.value=e,a.rep.value.set(t[0],t[1]),a.off.value.set(n[0],n[1]),a.groesse.value.set(s[0],s[1]),a.mitte.value.set(r[0],r[1])}}bild(e,t,n=!1){for(let s of[this.haupt,this.durch]){let r=s.uniforms;r.rep.value.x=(n?-1:1)/t,r.off.value.x=(e+(n?1:0))/t}}silhouette(e){this.gruppe.children[0].visible=e}};var Tl="#d6a07a",El="#b98563",Xr="#6e3a1f",Yr="#c9b58c",Nh="#4b3b2b",kg="#2f2520",Fh="#7a4a2b",qr="#55331d",Hg="#3a2a1f",Vg="#c79a3e",wl="#8d3b2a",zh="#7a5230",Oh="#5b5e66",ns=(i,e,t,n,s)=>{let r=new At;return r.position.set(e,t,n),s&&!s.leer&&r.add(s.netz()),i.add(r),r},mi=(i,e=10,t=8)=>new li(i,e,t),Xt=(i,e,t,n=9)=>new ke(i,e,t,n);function Bh(i,e){let t=new Se("putz");t.add(mi(.1),Yr,se(0,0,0,0,0,0,1.1,1,1)),t.add(Xt(.085,.075,.3),Yr,se(0,-.15,0)),t.add(Xt(.085,.085,.06),"#b6a27a",se(0,-.29,0));let n=ns(i,e*.3,.56,0,t),s=new Se("glatt");s.add(Xt(.065,.055,.28),Tl,se(0,-.14,0)),s.add(Xt(.07,.07,.07),qr,se(0,-.25,0),{muster:"holz"}),s.add(mi(.072,8,6),Tl,se(0,-.33,.01,0,0,0,.9,1.15,1));let r=ns(n,0,-.31,0,s);return{schulter:n,ellbogen:r}}function Gg(){let i=new At,e=ns(i,0,.86,0),t=new Se("putz");for(let g of[-1,1])t.add(Xt(.115,.095,.72),Nh,se(g*.13,-.42,0),.03),t.box(.19,.2,.3,g*.13,-.86,.04,kg,0,{muster:"holz"}),t.add(Xt(.1,.1,.05),qr,se(g*.13,-.66,0),{muster:"holz"});e.add(t.netz());let n=new Se("putz");n.add(Xt(.27,.23,.66,12),Yr,se(0,.31,0,0,0,0,1,1,.74),.03),n.add(mi(.27,12,8),Yr,se(0,.62,0,0,0,0,1.05,.42,.72)),n.add(Xt(.245,.25,.14,12),Nh,se(0,-.03,0,0,0,0,1,1,.76)),n.box(.42,.78,.04,0,-.42,.185,Fh,0,{muster:"holz",schwanken:.04}),n.box(.3,.36,.04,0,.08,.19,Fh,0,{muster:"holz",schwanken:.04});for(let g of[-1,1])n.add(new mt(.05,.42,.03),qr,se(g*.12,.5,.15,-.25,0,g*-.12),{muster:"holz"});n.add(Xt(.255,.255,.07,14),Hg,se(0,.04,0,0,0,0,1,1,.8),{muster:"holz"}),n.box(.08,.07,.02,0,.005,.215,Vg,0,{muster:"metall"}),n.box(.1,.13,.06,-.21,-.12,.08,qr,.3,{muster:"holz"}),n.add(Xt(.015,.015,.24,6),zh,se(.22,-.08,.1,0,0,.15),{muster:"holz"}),n.box(.035,.05,.03,.235,.05,.1,Oh,0,{muster:"metall"});let s=ns(e,0,0,0,n),r=new Se("glatt");r.add(Xt(.08,.09,.12),El,se(0,.04,0)),r.add(mi(.165,12,10),Tl,se(0,.22,.01,0,0,0,.95,1.08,1)),r.add(new Mt(.035,.09,6),El,se(0,.21,.17,Math.PI/2-.15,0,0));for(let g of[-1,1])r.box(.035,.03,.02,g*.06,.245,.145,"#1f1814"),r.box(.07,.03,.04,g*.065,.275,.14,Xr,g*.15,{muster:"putz"}),r.add(mi(.04,6,5),El,se(g*.158,.22,0,0,0,0,.5,1,.8));r.add(mi(.15,10,8),Xr,se(0,.12,.06,0,0,0,1.02,1,.85),{muster:"putz"}),r.add(new Mt(.11,.16,8),Xr,se(0,0,.1,Math.PI+.25,0,0),{muster:"putz"}),r.box(.1,.025,.03,0,.17,.165,Xr,0,{muster:"putz"}),r.add(new li(.175,12,8,0,Math.PI*2,0,Math.PI*.52),wl,se(0,.25,-.005,-.12,0,0,1,.95,1.05),{muster:"putz",schwanken:.04}),r.add(mi(.05,6,5),wl,se(0,.26,-.18),{muster:"putz"});for(let g of[-1,1])r.box(.05,.12,.02,g*.03,.15,-.19,wl,g*.3,{muster:"putz"});let o=ns(s,0,.68,0,r),a=Bh(s,-1),l=Bh(s,1),u=new Se("holz");u.add(Xt(.022,.025,.46,7),zh,se(0,-.12,0)),u.box(.07,.07,.2,0,.1,.03,Oh,0,{muster:"metall"});let h=ns(l.ellbogen,0,-.33,.03,u);h.rotation.x=1.25,a.schulter.rotation.set(.05,0,-.16),a.ellbogen.rotation.set(-.2,0,.05),l.schulter.rotation.set(.1,0,.14),l.ellbogen.rotation.set(-.75,0,-.1);let d=g=>({g,ruhe:g.rotation.clone()}),c={huefte:d(e),rumpf:d(s),kopf:d(o),lS:d(a.schulter),lE:d(a.ellbogen),rS:d(l.schulter),rE:d(l.ellbogen),hammer:d(h)};i.traverse(g=>{g.isMesh&&(g.castShadow=!0,g.receiveShadow=!0)});let p=g=>{let y=Math.sin(g*1.7),m=Math.sin(g*.55);s.scale.set(1+.012*y,1+.018*y,1+.02*y),e.position.x=.025*m,c.huefte.g.rotation.z=c.huefte.ruhe.z-.025*m,c.rumpf.g.rotation.z=c.rumpf.ruhe.z+.03*m,c.rumpf.g.rotation.x=c.rumpf.ruhe.x+.015*y;let f=Math.sin(g*.31)*Math.abs(Math.sin(g*.31))**.5;c.kopf.g.rotation.y=c.kopf.ruhe.y+.5*f,c.kopf.g.rotation.x=c.kopf.ruhe.x-.04*y+.06*Math.sin(g*.23),c.lS.g.rotation.x=c.lS.ruhe.x+.04*Math.sin(g*1.7+.6),c.lE.g.rotation.x=c.lE.ruhe.x-.03*Math.sin(g*1.7+1);let b=g%9/9,S=b>.72?Math.sin((b-.72)/.28*Math.PI):0,v=S*S*(3-2*S);c.rS.g.rotation.x=c.rS.ruhe.x-.35*v+.03*y,c.rE.g.rotation.x=c.rE.ruhe.x-.75*v,c.hammer.g.rotation.y=c.hammer.ruhe.y+.9*v*Math.sin(g*2.2),c.kopf.g.rotation.x+=.22*v,c.kopf.g.rotation.y=c.kopf.g.rotation.y*(1-v)+.25*v};return i.scale.setScalar(1.12),p(0),{gruppe:i,tick:p}}var Al={handwerker:Gg};var Wg=document.createElement("div"),cn=i=>document.querySelector(i)||Wg,Ds=matchMedia("(pointer: coarse)").matches,Qe=32,Xg="../",is=Ds?2:3,Zr=new URLSearchParams(location.search),qg={".":"#4e7230",",":"#567a33",v:"#566f34",f:"#3f4f28",m:"#5a4a32",t:"#4a3a2a",s:"#c2ad78",a:"#7f5e36",e:"#8f6b44",k:"#a1978a",p:"#968c7e",d:"#7a5638",h:"#5c544a","~":"#3c7d9a",w:"#3f8296",o:"#2a3a30",F:"#6a655c",X:"#120e0b"," ":"#4a5e2d",M:"#2a6a88",g:"#8f897c",S:"#e9eef1",T:"#8b8d66",u:"#d9b475",y:"#a69c5c",j:"#3d6d2a"},kh=new Set(["k","p","e","a","d"]);function Yg(){let e=document.createElement("canvas");e.width=e.height=256;let t=e.getContext("2d");t.fillStyle="rgb(228,228,228)",t.fillRect(0,0,256,256);let n=7,s=()=>(n=n*16807%2147483647)/2147483647;for(let o=0;o<900;o++){let a=s()*256,l=s()*256,u=6+s()*16,h=s()*Math.PI,d=Math.round(190+s()*65);t.strokeStyle=`rgba(${d},${d},${d},0.55)`,t.lineWidth=2+s()*4,t.lineCap="round";for(let c of[-256,0,256])for(let p of[-256,0,256])t.beginPath(),t.moveTo(a+c,l+p),t.lineTo(a+c+Math.cos(h)*u,l+p+Math.sin(h)*u),t.stroke()}let r=new En(e);return r.wrapS=r.wrapT=kn,r.colorSpace=_t,r.anisotropy=4,r}var Hh=new hi({vertexColors:!0,color:new Ce(1.1,1.1,1.1)}),Wh={value:0},Zg=(()=>{let e=document.createElement("canvas");e.width=e.height=256;let t=e.getContext("2d");t.fillStyle="rgb(150,150,150)",t.fillRect(0,0,256,256);let n=3,s=()=>(n=n*16807%2147483647)/2147483647;for(let o=0;o<260;o++){let a=s()*256,l=s()*256,u=10+s()*26,h=s()<.55?205+s()*50:90+s()*40,d=1.5+s()*3;t.strokeStyle=`rgba(${h},${h},${h},0.7)`,t.lineWidth=d,t.lineCap="round";for(let c of[-256,0,256])for(let p of[-256,0,256])t.beginPath(),t.moveTo(a+c,l+p),t.quadraticCurveTo(a+c+u/2,l+p-5-s()*4,a+c+u,l+p),t.stroke()}let r=new En(e);return r.wrapS=r.wrapT=kn,r.anisotropy=4,r})();function Xh(i,e,t){let n=new hi({color:i,vertexColors:!0,transparent:!0,opacity:e,map:Zg});return n.onBeforeCompile=s=>{s.uniforms.zeit=Wh,s.vertexShader=`uniform float zeit;
varying vec2 vW;
`+s.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vW = position.xz; transformed.y += (sin(position.x * 0.9 + zeit * 1.4) + cos(position.z * 1.2 + zeit * 1.1)) * 0.03 * ${t.toFixed(2)};`),s.fragmentShader=`uniform float zeit;
varying vec2 vW;
`+s.fragmentShader.replace("#include <map_fragment>",`
      float zt = zeit * ${t.toFixed(2)};
      float w1 = texture2D(map, vW / 5.0 + vec2(zt * 0.035, zt * 0.012)).r, w2 = texture2D(map, vW / 8.0 + vec2(-zt * 0.02, zt * 0.03)).r, w = (w1 + w2) * 0.5;
      diffuseColor.rgb *= 0.62 + 0.75 * w;`).replace("#include <opaque_fragment>",`outgoingLight += vec3(smoothstep(0.74, 0.86, w) * 0.22);
      #include <opaque_fragment>`)},n}var $g=Xh(2909824,.9,1),Jg=Xh(2503724,.94,.35),Vh=new Map(Object.entries(qg).map(([i,e])=>[i,new Ce(e)])),Gh=i=>Vh.get(i)||Vh.get("."),wn={gieren:0,neigen:.95,abstand:24},$r=class{constructor(e=null,t=cn("#ez-feld")){this.an=e;this.behaelter=t;this.hd={};this.hinweise=[];this.nord=null;this.nordR=0;this.zurueck=null;this.stickStart=null;this.szene=new Ar;this.kamera=new Tt(42,1,.5,600);this.licht=new zr(16768174,2.9);this.himmelLicht=new Nr(13032703,5917232,1.1);this.fackel=new Rs(16756832,0,16,1.4);this.st=new Map;this.laedt=new Set;this.warte=[];this.vorhanden=new Set;this.naechsterBlick=0;this.held={x:0,z:0,blick:1,lauf:0};this.pfad=[];this.tasten={};this.gieren=wn.gieren;this.neigen=wn.neigen;this.abstand=wn.abstand;this.ziel=new P;this.uhr=new Or;this.fps=[];this.gebiet="";this.ebene="";this.feuerLichter=[];this.bilder=new Ur;this.bildMat=new Map;this.bildTex=new Map;this.art="oberwelt"}async start(){this.r=new wr({antialias:!Ds,powerPreference:"high-performance"}),this.r.setPixelRatio(Math.min(devicePixelRatio,Ds?1.5:2)),this.r.shadowMap.enabled=!Ds&&Zr.get("schatten")!=="0",this.r.shadowMap.type=Za,this.r.toneMapping=Ja,this.r.toneMappingExposure=1.12,this.an&&(this.r.domElement.style.cssText="position:fixed;inset:0;z-index:0;touch-action:none"),this.behaelter.prepend(this.r.domElement),this.groesse(),addEventListener("resize",()=>this.groesse()),this.szene.fog=new Tr(12177376,60,150),this.szene.add(this.himmelLicht,this.licht,this.licht.target,this.fackel);for(let s=0;s<(Ds?3:6);s++){let r=new Rs(16751168,0,13,1.6);this.feuerLichter.push(r),this.szene.add(r)}let e=this.licht.shadow;e.mapSize.set(2048,2048),e.camera.left=e.camera.bottom=-38,e.camera.right=e.camera.top=38,e.camera.near=1,e.camera.far=160,e.bias=-6e-4,e.normalBias=.04,this.licht.castShadow=!0,Hh.map=Yg(),cn("#ez-lade").textContent="Lade Weltdaten \u2026",this.ix=await(await fetch("welt3d/index.json?t="+Date.now())).json(),this.vorhanden=new Set(this.ix.chunks);try{Ih(await(await fetch("welt3d/modelle.json?v="+this.ix.stand)).json())}catch{}let[t,n]=this.ix.start;try{let s=JSON.parse(localStorage.getItem("ez_welt_pos")||"null");Array.isArray(s)&&this.vorhanden.has(Math.floor(s[0]/Qe)+"_"+Math.floor(s[1]/Qe))&&([t,n]=s)}catch{}if(Zr.has("x")&&(t=Number(Zr.get("x")),n=Number(Zr.get("y"))),this.an){let s=this.an.ort();t=s.x,n=s.y,this.hd=this.an.held()}for(this.held.x=t,this.held.z=n,this.heldBauen(),cn("#ez-lade").textContent="Baue die Welt \u2026",this.nachladen(),await this.alleGeladen();this.warte.length;)this.bauen(this.warte.shift());this.eingaben(),this.an&&this.spielteile(),cn("#ez-lade").remove(),this.r.setAnimationLoop(()=>this.bild()),Object.assign(window,{W3D:this})}groesse(){let e=innerWidth,t=innerHeight;this.r.setSize(e,t),this.kamera.aspect=e/t,this.kamera.updateProjectionMatrix()}async alleGeladen(){for(let e=0;e<300&&this.laedt.size;e++)await new Promise(t=>setTimeout(t,30))}nachladen(){let e=Math.floor(this.held.x/Qe),t=Math.floor(this.held.z/Qe);for(let n=-is;n<=is;n++)for(let s=-is;s<=is;s++){let r=e+s+"_"+(t+n);this.vorhanden.has(r)&&!this.st.has(r)&&!this.laedt.has(r)&&(this.laedt.add(r),this.holen(r))}for(let[n,s]of this.st)Math.max(Math.abs(s.d.cx-e),Math.abs(s.d.cy-t))>is+1&&this.freigeben(n)}async holen(e){try{let t=await(await fetch("welt3d/"+e+".json?v="+this.ix.stand)).json();this.st.set(e,{d:t,obj:[],bauten:[],boden:null,gebaut:!1,feuer:[],stege:[],leute:[],modelle:[]}),this.warte.push(e)}catch{}finally{this.laedt.delete(e)}}freigeben(e){let t=this.st.get(e);if(!t)return;this.st.delete(e),this.hinweise=this.hinweise.filter(s=>!t.obj.includes(s.g));let n=this.warte.indexOf(e);n>=0&&this.warte.splice(n,1);for(let s of t.obj)this.szene.remove(s),s.traverse(r=>{let o=r,a=r;o.isInstancedMesh?o.dispose():a.isMesh&&a.geometry&&!a.geometry.userData.geteilt&&a.geometry.dispose()})}bauen(e){let t=this.st.get(e);!t||t.gebaut||(t.gebaut=!0,this.gelaende(t),this.dinge(t),this.figuren(t),this.hinweiseBauen(t))}hinweiseBauen(e){for(let t of e.d.interaktionen){let n=new At,s=this.stehHoehe(t.x,t.y),r=new it(Yh,new Qt({color:15978602,transparent:!0,opacity:.7,depthWrite:!1,toneMapped:!1}));r.rotation.x=-Math.PI/2,r.position.y=.07,r.userData.deck=.7;let o=new Wn(new Gn({map:Rl.map,color:16767370,blending:Hi,transparent:!0,depthWrite:!1,toneMapped:!1}));o.position.y=.9,o.scale.set(2.2,2.6,1),o.userData.deck=.55;let a=new it(Zh,new Qt({color:16766814,transparent:!0,opacity:.95,toneMapped:!1}));a.position.y=2.9,a.userData.deck=.95,n.add(r,o,a),n.position.set(t.x,s,t.y),n.userData.y=2.9,n.visible=!1,this.szene.add(n),e.obj.push(n),this.hinweise.push({x:t.x,y:t.y,r:t.radius||1.5,g:n})}}eck(e,t){let n=Math.floor(e/Qe),s=Math.floor(t/Qe);for(let[r,o]of[[0,0],[-1,0],[0,-1],[-1,-1]]){let a=this.st.get(n+r+"_"+(s+o));if(!a)continue;let l=e-(n+r)*Qe,u=t-(s+o)*Qe;if(!(l>Qe+1||u>Qe+1))return a.d.hoehe[(u+1)*(Qe+3)+l+1]/100}return 0}hoehe(e,t){let n=Math.floor(e),s=Math.floor(t),r=e-n,o=t-s,a=this.eck(n,s),l=this.eck(n+1,s),u=this.eck(n,s+1),h=this.eck(n+1,s+1);return r+o<1?a+(l-a)*r+(u-a)*o:h+(u-h)*(1-r)+(l-h)*(1-o)}gehbar(e,t){let n=this.st.get(Math.floor(e/Qe)+"_"+Math.floor(t/Qe));return n?n.d.geh[t-n.d.cy*Qe]?.[e-n.d.cx*Qe]===".":!1}stehHoehe(e,t){let n=this.hoehe(e,t),s=this.chunkBei(e,t);if(s)for(let[r,o,a,l,u]of s.stege)e>r&&e<a&&t>o&&t<l&&(n=Math.max(n,u));return n}chunkBei(e,t){return this.st.get(Math.floor(e/Qe)+"_"+Math.floor(t/Qe))}gelaende(e){let t=e.d,n=Qe+3,s=t.cx*Qe,r=t.cy*Qe,o=t.ebene!=="oberwelt",a=(w,T)=>t.boden[T+1]?.[w+1]??" ",l=(w,T)=>t.hoehe[(T+1)*n+w+1]/100,u=w=>kh.has(w)?".":w,h=[];for(let w=0;w<=Qe;w++)for(let T=0;T<=Qe;T++){let A=0,x=0,_=0;for(let[U,O]of[[-1,-1],[0,-1],[-1,0],[0,0]]){let W=Gh(u(a(T+U,w+O)));A+=W.r,x+=W.g,_+=W.b}let C=1+(Ve((T+s)*.7,(w+r)*1.3)-.5)*.14+(Ve(Math.floor((T+s)/3),Math.floor((w+r)/3))-.5)*.1+(Ve(Math.floor((T+s)/9),Math.floor((w+r)/9))-.5)*.12,L=o?Math.max(.45,1-l(T,w)*.12):1;h[w*(Qe+1)+T]=[A/4*C*L,x/4*C*L,_/4*C*L]}let d=(w,T)=>{let A=-9;for(let x=-1;x<=1;x++)for(let _=-1;_<=1;_++)A=Math.max(A,l(Math.max(-1,Math.min(Qe+1,w+_)),Math.max(-1,Math.min(Qe+1,T+x))));return A+.06},c=[],p=[],g=[],y=[],m=[],f=[],b=[],S=[];for(let w=0;w<Qe;w++)for(let T=0;T<Qe;T++){let A=a(T,w),x=kh.has(A),_=Gh(A),C=1+(Ve((T+s)*1.7,(w+r)*.9)-.5)*.12,U=[[T,w],[T+1,w],[T+1,w+1],[T,w+1]].map(([W,k])=>({lx:W,ly:k,p:[W+s,l(W,k),k+r],c:x?[_.r*C,_.g*C,_.b*C]:h[k*(Qe+1)+W]})),O=(T+w)%2?[[0,3,1],[1,3,2]]:[[0,3,2],[0,2,1]];for(let W of O)for(let k of W){let Z=U[k];c.push(...Z.p),p.push(...Z.c),g.push(Z.p[0]/7,Z.p[2]/7);let H=new P(l(Z.lx-1,Z.ly)-l(Z.lx+1,Z.ly),2,l(Z.lx,Z.ly-1)-l(Z.lx,Z.ly+1)).normalize();y.push(H.x,H.y,H.z)}if(this.ix.arten[A]?.wasser){let W=T+s,k=w+r,Z=A==="o",H=(ee,X)=>!!this.ix.arten[a(ee,X)]?.wasser,ie=(ee,X)=>H(ee-1,X-1)&&H(ee,X-1)&&H(ee-1,X)&&H(ee,X)?Z?.9:.86:Z?1.15:1.32;for(let[ee,X]of[[0,0],[0,1],[1,1],[0,0],[1,1],[1,0]]){(Z?f:m).push(W+ee,d(T+ee,w+X),k+X);let le=ie(T+ee,w+X);(Z?S:b).push(le,le,le)}}}let v=new pt;v.setAttribute("position",new He(c,3)),v.setAttribute("color",new He(p,3)),v.setAttribute("uv",new He(g,2)),v.setAttribute("normal",new He(y,3)),v.computeBoundingSphere();let I=new it(v,Hh);I.receiveShadow=!0,this.szene.add(I),e.obj.push(I),e.boden=I;for(let[w,T,A]of[[m,b,$g],[f,S,Jg]])if(w.length){let x=new pt;x.setAttribute("position",new He(w,3)),x.setAttribute("color",new He(T,3)),x.setAttribute("uv",new He(new Array(w.length/3*2).fill(0),2)),x.computeVertexNormals();let _=new it(x,A);_.receiveShadow=!0,this.szene.add(_),e.obj.push(_)}}dinge(e){let t=this.ix.typen,n=new Map,s=e.d.dinge.filter(([r])=>Sl(t[r]));for(let[r,o,a,l,,,u]of e.d.dinge){let h=t[r],d=this.hoehe(o,a),c=u||0;if(h.plan&&this.ix.bauplaene[h.id]){let f=Ah(this.ix.bauplaene[h.id],o,this.hoehe(o,a-.5),a);Th(f,o,a,c),f.gruppe.traverse(b=>{b.isMesh&&!b.material.isMeshBasicMaterial&&(b.castShadow=!0,b.receiveShadow=!0)}),this.szene.add(f.gruppe),e.obj.push(f.gruppe),e.bauten.push(f);for(let b of f.feuer){e.feuer.push(b);let S=new Wn(Rl);S.position.copy(b),S.scale.setScalar(2.6),this.szene.add(S),e.obj.push(S)}continue}if(Ml(h)){let f=0;if(Wr(h))f=Ve(o,a)*Math.PI*2;else if(Sl(h)){let I=99,w=99;for(let[,T,A]of s){let x=Math.abs(T-o),_=Math.abs(A-a);x+_<.1||(_<.3&&x<2.6&&(I=Math.min(I,x)),x<.3&&_<2.6&&(w=Math.min(w,_)))}w<I&&(f=Math.PI/2)}f-=c*Math.PI/180,n.has(r)||n.set(r,{m:[],f:[]});let b=l*(Wr(h)?.9+Ve(a,o)*.2:1),S=new Gt().setFromAxisAngle(new P(0,1,0),f);n.get(r).m.push(new Le().compose(new P(o,d-(Wr(h)?.1:0),a),S,new P(b,b,b)));let v=.88+Ve(o*3,a*5)*.24;n.get(r).f.push(new Ce(v,v,v));continue}if(/nebel/.test(h.id))continue;let g=Lh[h.id];if(g&&e.stege.push([o+g[0],a+g[1],o+g[2],a+g[3],d+g[4]]),/moorlicht/.test(h.id)){let f=new Wn(Kg);f.position.set(o+.08,d+1.75,a),f.scale.setScalar(1.6),this.szene.add(f),e.obj.push(f)}if(/feuerkorb|festfeuer|fackel|laterne/.test(h.id)){let f=/festfeuer/.test(h.id)?.9:/laterne/.test(h.id)?1.5:1.7,b=new P(o,d+f,a);e.feuer.push(b);let S=new Wn(Rl);S.position.copy(b),S.scale.setScalar(/festfeuer/.test(h.id)?4:2.4),this.szene.add(S),e.obj.push(S)}this.bildMat.has(h.id)||this.bildMat.set(h.id,new Gn({map:this.textur(h.bild),alphaTest:.2,toneMapped:!1}));let y=new Wn(this.bildMat.get(h.id)),m=h.massstab*l/48;y.center.set(h.anker[0],1-h.anker[1]),y.scale.set(h.groesse[0]*m,h.groesse[1]*m,1),y.position.set(o,d,a),this.szene.add(y),e.obj.push(y)}for(let[r,o]of n){let a=new Cr(Ml(t[r]),hl,o.m.length);o.m.forEach((l,u)=>{a.setMatrixAt(u,l),a.setColorAt(u,o.f[u])}),a.castShadow=!0,a.receiveShadow=!0,a.computeBoundingSphere(),this.szene.add(a),e.obj.push(a)}}textur(e,t){let n=this.bildTex.get(e);if(!n)n=this.bilder.load(Xg+e,t?s=>setTimeout(()=>t(s),0):void 0),n.colorSpace=_t,this.bildTex.set(e,n);else if(t){let s=n;s.image&&s.image.complete!==!1?t(s):setTimeout(()=>this.textur(e,t),200)}return n}figuren(e){for(let[t,n]of e.d.figuren.entries()){if(n.modell&&Al[n.modell]){let o=Al[n.modell]();o.gruppe.position.set(n.x,this.hoehe(n.x,n.y),n.y),o.gruppe.rotation.y=n.blick??0,this.szene.add(o.gruppe),e.obj.push(o.gruppe,this.fleck(n.x,n.y)),e.modelle.push({tick:o.tick,takt:t*2.3});continue}let s="img/echtzeit/"+n.figur+".webp",r=new Ls(this.textur(s));this.textur(s,o=>{let a=Math.max(1,Math.round(o.image.width/o.image.height));r.setze(o,[1/a,1],[0,0],[2.25,2.25],[.5,.06]),r.bild(0,a,!!n.links),e.leute.push({fb:r,n:a,links:!!n.links,takt:t*.7})}),r.silhouette(!1),r.gruppe.position.set(n.x,this.hoehe(n.x,n.y)+.08,n.y),this.szene.add(r.gruppe),e.obj.push(r.gruppe,this.fleck(n.x,n.y))}}fleck(e,t){let n=new it(qh,jg);return n.rotation.x=-Math.PI/2,n.position.set(e,this.hoehe(e,t)+.05,t),this.szene.add(n),n}heldBauen(){this.stand=this.textur(this.hd.figur||"img/echtzeit/torvald.webp"),this.lauf=this.textur(this.hd.lauf||(this.hd.figur?this.hd.figur:"img/echtzeit/torvald-lauf.webp")),this.hd.figur||(this.hd={figur:"img/echtzeit/torvald.webp",lauf:"img/echtzeit/torvald-lauf.webp",laufMass:[.5,.946,.855],gross:1.065,fuss:[.5,.94]}),this.figur=new Ls(this.stand),this.szene.add(this.figur.gruppe),this.schattenFleck=this.fleck(this.held.x,this.held.z),this.marke=new it(new ws(.28,.42,20),new Qt({color:16766814,transparent:!0,opacity:.85,depthWrite:!1})),this.marke.rotation.x=-Math.PI/2,this.marke.visible=!1,this.szene.add(this.marke)}springen(e,t){this.held.x=e,this.held.z=t,this.pfad=[],this.marke.visible=!1,this.ziel.set(0,0,0),this.nachladen()}frei(e,t){for(let[s,r]of[[-.28,-.28],[.28,-.28],[-.28,.28],[.28,.28]])if(!this.gehbar(Math.floor(e+s),Math.floor(t+r)))return!1;return!0}weg(e,t,n,s){let r=(x,_)=>this.gehbar(x,_),a=Math.floor(n),l=Math.floor(s);if(!r(a,l)){let x=1e9,_=0,C=0;for(let L=-3;L<=3;L++)for(let U=-3;U<=3;U++)r(a+U,l+L)&&U*U+L*L<x&&(x=U*U+L*L,_=a+U,C=l+L);if(x===1e9)return[];a=_,l=C,n=_+.5,s=C+.5}let u=Math.floor(e),h=Math.floor(t),d=(x,_)=>_*65536+x,c=new Map,p=new Map,g=[],y=(x,_)=>{g.push([_,x]);let C=g.length-1;for(;C>0;){let L=C-1>>1;if(g[L][0]<=g[C][0])break;[g[L],g[C]]=[g[C],g[L]],C=L}},m=()=>{let x=g[0],_=g.pop();if(g.length){g[0]=_;let C=0;for(;;){let L=2*C+1,U=L+1,O=C;if(L<g.length&&g[L][0]<g[O][0]&&(O=L),U<g.length&&g[U][0]<g[O][0]&&(O=U),O===C)break;[g[O],g[C]]=[g[C],g[O]],C=O}}return x},f=(x,_)=>{let C=Math.abs(x-a),L=Math.abs(_-l);return Math.max(C,L)+.414*Math.min(C,L)};c.set(d(u,h),0),y(d(u,h),f(u,h));let b=0,S=!1;for(;g.length&&b++<4e4;){let[,x]=m(),_=x%65536,C=(x-_)/65536;if(_===a&&C===l){S=!0;break}for(let[L,U]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){let O=_+L,W=C+U;if(!r(O,W)||L&&U&&(!r(_+L,C)||!r(_,C+U)))continue;let k=d(O,W),Z=c.get(x)+(L&&U?1.414:1);Z<(c.get(k)??1/0)&&(c.set(k,Z),p.set(k,x),y(k,Z+f(O,W)))}}if(!S)return[];let v=[],I=d(a,l);for(;I!==d(u,h);){let x=I%65536;v.unshift({x:x+.5,z:(I-x)/65536+.5}),I=p.get(I)}v.length&&(v[v.length-1]={x:n,z:s});let w=[],T={x:e,z:t},A=0;for(;A<v.length;){let x=v.length-1;for(;x>A&&!this.sicht(T,v[x]);)x--;w.push(v[x]),T=v[x],A=x+1}return w}sicht(e,t){let n=Math.ceil(Math.hypot(t.x-e.x,t.z-e.z)*3);for(let s=1;s<=n;s++){let r=s/n;if(!this.frei(e.x+(t.x-e.x)*r,e.z+(t.z-e.z)*r))return!1}return!0}eingaben(){let e=this.r.domElement,t=!1,n=0,s=0,r=0,o=new Map,a=0,l={x:0,y:0};addEventListener("keydown",h=>{this.tasten[h.key.toLowerCase()]=!0,h.key.startsWith("Arrow")&&h.preventDefault()}),addEventListener("keyup",h=>{this.tasten[h.key.toLowerCase()]=!1}),e.addEventListener("contextmenu",h=>h.preventDefault()),e.addEventListener("pointerdown",h=>{if(o.set(h.pointerId,{x:h.clientX,y:h.clientY}),t=!0,n=0,s=h.clientX,r=h.clientY,e.setPointerCapture(h.pointerId),o.size===2){let[d,c]=[...o.values()];a=Math.hypot(d.x-c.x,d.y-c.y),l.x=(d.x+c.x)/2,l.y=(d.y+c.y)/2}else this.an&&h.pointerType==="touch"&&(this.stickStart={x:h.clientX,y:h.clientY})}),e.addEventListener("pointermove",h=>{if(!o.has(h.pointerId))return;if(o.set(h.pointerId,{x:h.clientX,y:h.clientY}),o.size===2){let[g,y]=[...o.values()],m=Math.hypot(g.x-y.x,g.y-y.y),f=(g.x+y.x)/2,b=(g.y+y.y)/2;a&&(this.abstand=Math.max(9,Math.min(60,this.abstand*a/m)),this.gieren-=(f-l.x)*.008,this.neigen=Math.max(.42,Math.min(1.35,this.neigen+(b-l.y)*.004))),a=m,l.x=f,l.y=b,n=99,this.an&&this.stick(null);return}if(!t)return;let d=h.clientX-s,c=h.clientY-r;if(s=h.clientX,r=h.clientY,n+=Math.abs(d)+Math.abs(c),this.an&&h.pointerType==="touch"){n>12&&this.stick({x:h.clientX,y:h.clientY});return}(h.buttons&2||h.buttons&4||h.pointerType==="touch"&&n>12)&&(this.gieren-=d*.006,this.neigen=Math.max(.42,Math.min(1.35,this.neigen+c*.004)))});let u=h=>{o.delete(h.pointerId),o.size<2&&(a=0),this.an&&this.stick(null),t&&(t=!1,n<8&&h.button===0&&this.klick(h.clientX,h.clientY))};e.addEventListener("pointerup",u),e.addEventListener("pointercancel",h=>{o.delete(h.pointerId),t=!1,this.an&&this.stick(null)}),e.addEventListener("wheel",h=>{h.preventDefault(),this.abstand=Math.max(9,Math.min(60,this.abstand*(1+Math.sign(h.deltaY)*.1)))},{passive:!1}),cn("#ez-schatten").onclick=()=>{this.r.shadowMap.enabled=!this.r.shadowMap.enabled,this.szene.traverse(h=>{let d=h.material;for(let c of Array.isArray(d)?d:d?[d]:[])c.needsUpdate=!0}),cn("#ez-schatten").textContent=this.r.shadowMap.enabled?"Schatten: an":"Schatten: aus"},cn("#ez-schatten").textContent=this.r.shadowMap.enabled?"Schatten: an":"Schatten: aus"}klick(e,t){let n=new Br;n.setFromCamera(new Ee(e/innerWidth*2-1,-(t/innerHeight)*2+1),this.kamera);let s=n.intersectObjects([...this.st.values()].map(r=>r.boden).filter(r=>!!r),!1)[0];if(s){if(this.an){this.an.gehe(s.point.x,s.point.z),this.marke.position.set(s.point.x,this.hoehe(s.point.x,s.point.z)+.06,s.point.z),this.marke.visible=!0;return}if(this.pfad=this.weg(this.held.x,this.held.z,s.point.x,s.point.z),this.pfad.length){let r=this.pfad[this.pfad.length-1];this.marke.position.set(r.x,this.hoehe(r.x,r.z)+.06,r.z),this.marke.visible=!0}}}stick(e){let t=document.querySelector("#ez-stick"),n=this.stickStart;if(!e||!n||!this.an){t&&(t.hidden=!0),this.an&&this.an.steuern(0,0),e||(this.stickStart=null);return}let s=e.x-n.x,r=e.y-n.y,o=Math.hypot(s,r),a=46;if(t){t.hidden=!1,t.style.left=n.x+"px",t.style.top=n.y+"px";let c=t.querySelector("i");c&&(c.style.transform=`translate(calc(-50% + ${s/Math.max(o,1)*Math.min(o,a)}px), calc(-50% + ${r/Math.max(o,1)*Math.min(o,a)}px))`)}if(o<8){this.an.steuern(0,0);return}let l=Math.min(1,o/a),u=s/o,h=r/o,d=this.gieren;this.an.steuern((Math.cos(d)*u+Math.sin(d)*h)*l,(-Math.sin(d)*u+Math.cos(d)*h)*l)}drehen(e,t){let n=this.gieren;return[Math.cos(n)*e+Math.sin(n)*t,-Math.sin(n)*e+Math.cos(n)*t]}spielteile(){this.nord=document.querySelector("#ez-kartenrahmen .nord");let e=document.querySelector("#ez-kartenrahmen");if(e){let t=document.createElement("button");t.type="button",t.id="ez-kamera-zurueck",t.title="Kamera zur\xFCck",t.setAttribute("aria-label","Kamera zur\xFCck"),t.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',t.style.cssText="position:absolute;left:-4px;bottom:-4px;z-index:3;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;cursor:pointer;color:#f3d895;background:linear-gradient(#3a2817,#24180e);border:2px solid #d6b066;box-shadow:0 3px 10px rgba(0,0,0,.55);transition:opacity .25s",t.onclick=n=>{n.stopPropagation(),this.gieren=wn.gieren,this.neigen=wn.neigen,this.abstand=wn.abstand},getComputedStyle(e).position==="static"&&(e.style.position="relative"),e.appendChild(t),this.zurueck=t}}kompass(){let e=this.gieren,t=this.nord,n=this.nord?.parentElement;if(this.an){let s=this.an.held();s.figur&&s.figur!==this.hd.figur&&(this.hd=s,this.stand=this.textur(s.figur),this.lauf=this.textur(s.lauf||s.figur))}if(t&&n){if(!this.nordR){t.style.transform="";let s=n.getBoundingClientRect(),r=t.getBoundingClientRect();this.nordR=Math.hypot(r.left+r.width/2-(s.left+s.width/2),r.top+r.height/2-(s.top+s.height/2))||1}t.style.transform=`translate(${(this.nordR*Math.sin(e)).toFixed(1)}px, ${(this.nordR*(1-Math.cos(e))).toFixed(1)}px)`}if(this.zurueck){let s=Math.abs(((this.gieren-wn.gieren+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI)>.05||Math.abs(this.neigen-wn.neigen)>.05||Math.abs(this.abstand-wn.abstand)>1;this.zurueck.style.opacity=s?"1":"0",this.zurueck.style.pointerEvents=s?"auto":"none"}}stimmung(e,t){if(e===this.ebene)return;this.ebene=e,this.art=t;let n=t!=="oberwelt",s=this.szene.fog,r=new Ce(t==="innen"?"#0c0907":n?"#0e0c0a":"#b9cfe0");this.szene.background=r,s.color.copy(r),this.himmelLicht.intensity=n?.62:1.1,this.himmelLicht.color.set(n?11573890:13032703),this.licht.intensity=n?.35:2.9,this.fackel.intensity=n?30:0,this.fackel.distance=20,t==="innen"&&(this.himmelLicht.intensity=1,this.himmelLicht.color.set(16769728),this.licht.intensity=1.1,this.fackel.intensity=10)}bild(){let e=Math.min(.05,this.uhr.getDelta()),t=this.tasten,n=this.held;Wh.value+=e,this.warte.length&&this.bauen(this.warte.shift()),performance.now()>this.naechsterBlick&&(this.naechsterBlick=performance.now()+300,this.nachladen()),(t.arrowleft||t.q)&&(this.gieren+=e*1.8),(t.arrowright||t.e)&&(this.gieren-=e*1.8),t.arrowup&&(this.neigen=Math.min(1.35,this.neigen+e*.9)),t.arrowdown&&(this.neigen=Math.max(.42,this.neigen-e*.9));let s=0,r=0,o=!1,a=-Math.sin(this.gieren),l=-Math.cos(this.gieren);if(this.an){let w=this.an.ort(),T=w.x-n.x,A=w.y-n.z;if(Math.hypot(T,A)>4?(n.x=w.x,n.z=w.y,this.ziel.set(0,0,0),this.nachladen()):(n.x=w.x,n.z=w.y),o=this.an.laeuft(),o){let x=T*Math.cos(this.gieren)-A*Math.sin(this.gieren);Math.abs(x)>.004&&(n.blick=x>0?1:-1),n.lauf+=e}else this.marke.visible=!1}else{if(this.an||(t.w&&(s+=a,r+=l),t.s&&(s-=a,r-=l),t.a&&(s+=l,r-=a),t.d&&(s-=l,r+=a)),s||r)this.pfad=[],this.marke.visible=!1;else if(this.pfad.length){let T=this.pfad[0],A=T.x-n.x,x=T.z-n.z,_=Math.hypot(A,x);_<.15?(this.pfad.shift(),this.pfad.length||(this.marke.visible=!1)):(s=A/_,r=x/_)}let w=Math.hypot(s,r);if(o=w>.01,o){let T=4.6*e/w,A=n.x+s*T,x=n.z+r*T;this.frei(A,x)?(n.x=A,n.z=x):this.frei(A,n.z)?n.x=A:this.frei(n.x,x)?n.z=x:this.pfad.length&&this.pfad.shift();let _=s*Math.cos(this.gieren)-r*Math.sin(this.gieren);Math.abs(_)>.2&&(n.blick=_>0?1:-1),n.lauf+=e}}let u=this.stehHoehe(n.x,n.z),h=this.figur,d=this.hd.laufMass||[.5,.946,.91],c=this.hd.fuss||[.5,.94],p=this.hd.gross||1;if(o&&this.hd.lauf){let w=Math.floor(n.lauf*11)%8,T=2.05/d[2];h.setze(this.lauf,[n.blick/4,1/2],[(w%4+(n.blick<0?1:0))/4,w<4?.5:0],[T,T],[d[0],1-d[1]])}else{let w=this.stand,T=w.image?w.image.width/w.image.height:.7;h.setze(w,[n.blick,1],[n.blick<0?1:0,0],[2.05*p*T,2.05*p],[c[0],1-c[1]]),o||(n.lauf=0)}h.gruppe.position.set(n.x,u+.08,n.z),this.schattenFleck.position.set(n.x,u+.05,n.z),this.ziel.lerp(new P(n.x,u+1.1,n.z),this.ziel.lengthSq()?.18:1);let g=Math.cos(this.neigen),y=Math.sin(this.neigen);this.kamera.position.set(this.ziel.x+Math.sin(this.gieren)*g*this.abstand,this.ziel.y+y*this.abstand,this.ziel.z+Math.cos(this.gieren)*g*this.abstand),this.kamera.lookAt(this.ziel);let m=this.chunkBei(n.x,n.z);m&&this.stimmung(m.d.ebene,m.d.art||(m.d.ebene==="oberwelt"?"oberwelt":"untergrund"));let f=this.art==="untergrund",b=this.art==="innen",S=this.szene.fog,v=Math.min((is+.4)*Qe,f?34+this.abstand:b?40+this.abstand:60+this.abstand*1.8);S.far=v,S.near=f?6+this.abstand*.4:b?16+this.abstand*.6:v*.45,this.licht.position.set(this.ziel.x-30,this.ziel.y+55,this.ziel.z+22),this.licht.target.position.copy(this.ziel),this.fackel.position.set(n.x+.4,u+2.6,n.z+.6);for(let w of this.st.values())for(let T of w.bauten){let A=T.raeume.some(x=>n.x>x.x0&&n.x<x.x1&&n.z>x.z0&&n.z<x.z1);for(let x of T.daecher)x.visible=!A;for(let x of T.tueren){let _=Math.hypot(n.x-x.x,n.z-x.z)<2.2?x.auf:x.zu;x.fluegel.rotation.y+=(_-x.fluegel.rotation.y)*.18}for(let x of T.drehen)x.rotation.z-=e*.6;for(let[x,_]of T.flackern.entries()){let C=performance.now()/1e3+x*1.7;_.scale.set(1+.08*Math.sin(C*7),.8+.28*Math.abs(Math.sin(C*9.3)*Math.sin(C*4.1+1)),1+.08*Math.cos(C*6))}}{let w=performance.now()/1e3;for(let T of this.st.values())for(let A of T.leute){if(A.n<2)continue;let x=Math.floor((w+A.takt)*2.5)%(2*A.n-2);A.fb.bild(x<A.n?x:2*A.n-2-x,A.n,A.links)}for(let T of this.st.values())for(let A of T.modelle)A.tick(w+A.takt)}this.marke.rotation.z+=e;{let w=[];for(let A of this.st.values())for(let x of A.feuer)w.push(x);w.sort((A,x)=>(A.x-n.x)**2+(A.z-n.z)**2-((x.x-n.x)**2+(x.z-n.z)**2));let T=performance.now()/1e3;this.feuerLichter.forEach((A,x)=>{let _=w[x];if(!_||!f&&(_.x-n.x)**2+(_.z-n.z)**2>144){A.intensity=0;return}A.position.copy(_),A.intensity=(f?22:10)*(.85+.15*Math.sin(T*9+x*2.1)*Math.sin(T*5.3+x))})}{let w=performance.now()/1e3;for(let T of this.hinweise){let A=Math.hypot(T.x-n.x,T.y-n.z),x=A<T.r+2.6;if(T.g.visible=x,x){let _=A<T.r?1:1-(A-T.r)/2.6;T.g.scale.setScalar(.9+.08*Math.sin(w*3));for(let C of T.g.children){let L=C.material;L.opacity=C.userData.deck*_}T.g.children[2].position.y=T.g.userData.y+.15*Math.sin(w*2.4)}}}this.an&&this.kompass(),this.r.render(this.szene,this.kamera);let I=this.ix.gebiete.find(w=>n.x>=w.x&&n.x<w.x+w.b&&n.z>=w.y&&n.z<w.y+w.h);if(I&&I.id!==this.gebiet&&(this.gebiet=I.id,cn("#ez-ort b").textContent=I.name,cn("#ez-ort small").textContent=I.untertitel),this.fps.push(performance.now()),this.fps.length>=30){let w=(this.fps.length-1)*1e3/(this.fps[this.fps.length-1]-this.fps[0]);cn("#ez-fps").textContent=Math.round(w)+" FPS \xB7 "+this.r.info.render.calls+" Aufrufe \xB7 "+this.st.size+" Chunks",this.fps=[]}}},qh=new Ir(.42,16);qh.userData.geteilt=!0;var Kg=(()=>{let i=document.createElement("canvas");i.width=i.height=64;let e=i.getContext("2d"),t=e.createRadialGradient(32,32,0,32,32,32);t.addColorStop(0,"rgba(200,255,220,0.95)"),t.addColorStop(.4,"rgba(120,230,170,0.35)"),t.addColorStop(1,"rgba(80,200,140,0)"),e.fillStyle=t,e.fillRect(0,0,64,64);let n=new En(i);return n.colorSpace=_t,new Gn({map:n,blending:Hi,depthWrite:!1,transparent:!0,toneMapped:!1})})(),Rl=(()=>{let i=document.createElement("canvas");i.width=i.height=64;let e=i.getContext("2d"),t=e.createRadialGradient(32,32,0,32,32,32);t.addColorStop(0,"rgba(255,210,140,0.9)"),t.addColorStop(.35,"rgba(255,150,60,0.35)"),t.addColorStop(1,"rgba(255,120,40,0)"),e.fillStyle=t,e.fillRect(0,0,64,64);let n=new En(i);return n.colorSpace=_t,new Gn({map:n,blending:Hi,depthWrite:!1,transparent:!0,toneMapped:!1})})(),jg=new Qt({color:0,transparent:!0,opacity:.32,depthWrite:!1}),Yh=new ws(.55,.78,32),Zh=new Lr(.22,0);Yh.userData.geteilt=!0;Zh.userData.geteilt=!0;var Qg=new $r;Qg.start().catch(i=>{let e=document.querySelector("#ez-lade");e&&(e.textContent="Fehler: "+(i&&i.message?i.message:i)),console.error(i)});})();
