"use strict";(()=>{var ou=0,Gl=1,lu=2;var jc=1,Qo=2,_n=3,Hn=0,Ut=1,jt=2,kn=0,Hi=1,Xi=2,Wl=3,Xl=4,cu=5,si=100,hu=101,uu=102,du=103,fu=104,pu=200,mu=201,gu=202,xu=203,Na=204,za=205,_u=206,yu=207,bu=208,vu=209,Mu=210,Su=211,Eu=212,wu=213,Tu=214,Fa=0,ka=1,Ba=2,qi=3,Oa=4,Ha=5,Va=6,Ga=7,el=0,Au=1,Ru=2,Bn=0,Cu=1,Iu=2,Pu=3,tl=4,Lu=5,Du=6,Uu=7;var Qc=300,Yi=301,Zi=302,Wa=303,Xa=304,Ws=306,Vn=1e3,oi=1001,qa=1002,kt=1003,Nu=1004;var Or=1005;var on=1006,na=1007;var li=1008;var Mn=1009,eh=1010,th=1011,Sr=1012,nl=1013,ci=1014,ln=1015,Dr=1016,il=1017,rl=1018,$i=1020,nh=35902,ih=1021,rh=1022,Qt=1023,sh=1024,ah=1025,Vi=1026,Ki=1027,sl=1028,al=1029,oh=1030,ol=1031;var ll=1033,ds=33776,fs=33777,ps=33778,ms=33779,Ya=35840,Za=35841,$a=35842,Ka=35843,Ja=36196,ja=37492,Qa=37496,eo=37808,to=37809,no=37810,io=37811,ro=37812,so=37813,ao=37814,oo=37815,lo=37816,co=37817,ho=37818,uo=37819,fo=37820,po=37821,gs=36492,mo=36494,go=36495,lh=36283,xo=36284,_o=36285,yo=36286;var xs=2300,bo=2301,ia=2302,ql=2400,Yl=2401,Zl=2402;var zu=3200,Fu=3201;var ch=0,ku=1,zn="",_t="srgb",er="srgb-linear",Xs="linear",et="srgb";var vi=7680;var $l=519,Bu=512,Ou=513,Hu=514,hh=515,Vu=516,Gu=517,Wu=518,Xu=519,vo=35044;var Kl="300 es",bn=2e3,_s=2001,Gn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;let n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;let r=this._listeners[e];if(r!==void 0){let s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;let n=this._listeners[e.type];if(n!==void 0){e.target=this;let r=n.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,e);e.target=null}}},Et=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var ra=Math.PI/180,Mo=180/Math.PI;function On(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Et[i&255]+Et[i>>8&255]+Et[i>>16&255]+Et[i>>24&255]+"-"+Et[e&255]+Et[e>>8&255]+"-"+Et[e>>16&15|64]+Et[e>>24&255]+"-"+Et[t&63|128]+Et[t>>8&255]+"-"+Et[t>>16&255]+Et[t>>24&255]+Et[n&255]+Et[n>>8&255]+Et[n>>16&255]+Et[n>>24&255]).toLowerCase()}function Dt(i,e,t){return Math.max(e,Math.min(t,i))}function qu(i,e){return(i%e+e)%e}function sa(i,e,t){return(1-t)*i+t*e}function an(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function tt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var Ee=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Dt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),s=this.x-e.x,a=this.y-e.y;return this.x=s*n-a*r+e.x,this.y=s*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Fe=class i{constructor(e,t,n,r,s,a,o,l,u){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,a,o,l,u)}set(e,t,n,r,s,a,o,l,u){let h=this.elements;return h[0]=e,h[1]=r,h[2]=o,h[3]=t,h[4]=s,h[5]=l,h[6]=n,h[7]=a,h[8]=u,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,a=n[0],o=n[3],l=n[6],u=n[1],h=n[4],f=n[7],c=n[2],p=n[5],g=n[8],y=r[0],m=r[3],d=r[6],v=r[1],S=r[4],b=r[7],I=r[2],T=r[5],w=r[8];return s[0]=a*y+o*v+l*I,s[3]=a*m+o*S+l*T,s[6]=a*d+o*b+l*w,s[1]=u*y+h*v+f*I,s[4]=u*m+h*S+f*T,s[7]=u*d+h*b+f*w,s[2]=c*y+p*v+g*I,s[5]=c*m+p*S+g*T,s[8]=c*d+p*b+g*w,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],u=e[7],h=e[8];return t*a*h-t*o*u-n*s*h+n*o*l+r*s*u-r*a*l}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],u=e[7],h=e[8],f=h*a-o*u,c=o*l-h*s,p=u*s-a*l,g=t*f+n*c+r*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/g;return e[0]=f*y,e[1]=(r*u-h*n)*y,e[2]=(o*n-r*a)*y,e[3]=c*y,e[4]=(h*t-r*l)*y,e[5]=(r*s-o*t)*y,e[6]=p*y,e[7]=(n*l-u*t)*y,e[8]=(a*t-n*s)*y,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,s,a,o){let l=Math.cos(s),u=Math.sin(s);return this.set(n*l,n*u,-n*(l*a+u*o)+a+e,-r*u,r*l,-r*(-u*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(aa.makeScale(e,t)),this}rotate(e){return this.premultiply(aa.makeRotation(-e)),this}translate(e,t){return this.premultiply(aa.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<9;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},aa=new Fe;function uh(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Er(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Yu(){let i=Er("canvas");return i.style.display="block",i}var Jl={};function br(i){i in Jl||(Jl[i]=!0,console.warn(i))}function Zu(i,e,t){return new Promise(function(n,r){function s(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:r();break;case i.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:n()}}setTimeout(s,t)})}function $u(i){let e=i.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Ku(i){let e=i.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}var Ze={enabled:!0,workingColorSpace:er,spaces:{},convert:function(i,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===et&&(i.r=vn(i.r),i.g=vn(i.g),i.b=vn(i.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(i.applyMatrix3(this.spaces[e].toXYZ),i.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===et&&(i.r=Gi(i.r),i.g=Gi(i.g),i.b=Gi(i.b))),i},fromWorkingColorSpace:function(i,e){return this.convert(i,this.workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===zn?Xs:this.spaces[i].transfer},getLuminanceCoefficients:function(i,e=this.workingColorSpace){return i.fromArray(this.spaces[e].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,e,t){return i.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function vn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Gi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var jl=[.64,.33,.3,.6,.15,.06],Ql=[.2126,.7152,.0722],ec=[.3127,.329],tc=new Fe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),nc=new Fe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Ze.define({[er]:{primaries:jl,whitePoint:ec,transfer:Xs,toXYZ:tc,fromXYZ:nc,luminanceCoefficients:Ql,workingColorSpaceConfig:{unpackColorSpace:_t},outputColorSpaceConfig:{drawingBufferColorSpace:_t}},[_t]:{primaries:jl,whitePoint:ec,transfer:et,toXYZ:tc,fromXYZ:nc,luminanceCoefficients:Ql,outputColorSpaceConfig:{drawingBufferColorSpace:_t}}});var Mi,So=class{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Mi===void 0&&(Mi=Er("canvas")),Mi.width=e.width,Mi.height=e.height;let n=Mi.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=Mi}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Er("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),s=r.data;for(let a=0;a<s.length;a++)s[a]=vn(s[a]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(vn(t[n]/255)*255):t[n]=vn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Ju=0,ys=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Ju++}),this.uuid=On(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let a=0,o=r.length;a<o;a++)r[a].isDataTexture?s.push(oa(r[a].image)):s.push(oa(r[a]))}else s=oa(r);n.url=s}return t||(e.images[this.uuid]=n),n}};function oa(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?So.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var ju=0,Pt=class i extends Gn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=oi,r=oi,s=on,a=li,o=Qt,l=Mn,u=i.DEFAULT_ANISOTROPY,h=zn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ju++}),this.uuid=On(),this.name="",this.source=new ys(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=u,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Ee(0,0),this.repeat=new Ee(1,1),this.center=new Ee(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Fe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Qc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Vn:e.x=e.x-Math.floor(e.x);break;case oi:e.x=e.x<0?0:1;break;case qa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Vn:e.y=e.y-Math.floor(e.y);break;case oi:e.y=e.y<0?0:1;break;case qa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Pt.DEFAULT_IMAGE=null;Pt.DEFAULT_MAPPING=Qc;Pt.DEFAULT_ANISOTROPY=1;var nt=class i{constructor(e=0,t=0,n=0,r=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*s,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*s,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*s,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,s,l=e.elements,u=l[0],h=l[4],f=l[8],c=l[1],p=l[5],g=l[9],y=l[2],m=l[6],d=l[10];if(Math.abs(h-c)<.01&&Math.abs(f-y)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+c)<.1&&Math.abs(f+y)<.1&&Math.abs(g+m)<.1&&Math.abs(u+p+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let S=(u+1)/2,b=(p+1)/2,I=(d+1)/2,T=(h+c)/4,w=(f+y)/4,A=(g+m)/4;return S>b&&S>I?S<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(S),r=T/n,s=w/n):b>I?b<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(b),n=T/r,s=A/r):I<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(I),n=w/s,r=A/s),this.set(n,r,s,t),this}let v=Math.sqrt((m-g)*(m-g)+(f-y)*(f-y)+(c-h)*(c-h));return Math.abs(v)<.001&&(v=1),this.x=(m-g)/v,this.y=(f-y)/v,this.z=(c-h)/v,this.w=Math.acos((u+p+d-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Eo=class extends Gn{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new nt(0,0,e,t),this.scissorTest=!1,this.viewport=new nt(0,0,e,t);let r={width:e,height:t,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:on,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);let s=new Pt(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];let a=n.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,r=e.textures.length;n<r;n++)this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;let t=Object.assign({},e.texture.image);return this.texture.source=new ys(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},Sn=class extends Eo{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},bs=class extends Pt{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=kt,this.minFilter=kt,this.wrapR=oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var wo=class extends Pt{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=kt,this.minFilter=kt,this.wrapR=oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Gt=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,s,a,o){let l=n[r+0],u=n[r+1],h=n[r+2],f=n[r+3],c=s[a+0],p=s[a+1],g=s[a+2],y=s[a+3];if(o===0){e[t+0]=l,e[t+1]=u,e[t+2]=h,e[t+3]=f;return}if(o===1){e[t+0]=c,e[t+1]=p,e[t+2]=g,e[t+3]=y;return}if(f!==y||l!==c||u!==p||h!==g){let m=1-o,d=l*c+u*p+h*g+f*y,v=d>=0?1:-1,S=1-d*d;if(S>Number.EPSILON){let I=Math.sqrt(S),T=Math.atan2(I,d*v);m=Math.sin(m*T)/I,o=Math.sin(o*T)/I}let b=o*v;if(l=l*m+c*b,u=u*m+p*b,h=h*m+g*b,f=f*m+y*b,m===1-o){let I=1/Math.sqrt(l*l+u*u+h*h+f*f);l*=I,u*=I,h*=I,f*=I}}e[t]=l,e[t+1]=u,e[t+2]=h,e[t+3]=f}static multiplyQuaternionsFlat(e,t,n,r,s,a){let o=n[r],l=n[r+1],u=n[r+2],h=n[r+3],f=s[a],c=s[a+1],p=s[a+2],g=s[a+3];return e[t]=o*g+h*f+l*p-u*c,e[t+1]=l*g+h*c+u*f-o*p,e[t+2]=u*g+h*p+o*c-l*f,e[t+3]=h*g-o*f-l*c-u*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,u=o(n/2),h=o(r/2),f=o(s/2),c=l(n/2),p=l(r/2),g=l(s/2);switch(a){case"XYZ":this._x=c*h*f+u*p*g,this._y=u*p*f-c*h*g,this._z=u*h*g+c*p*f,this._w=u*h*f-c*p*g;break;case"YXZ":this._x=c*h*f+u*p*g,this._y=u*p*f-c*h*g,this._z=u*h*g-c*p*f,this._w=u*h*f+c*p*g;break;case"ZXY":this._x=c*h*f-u*p*g,this._y=u*p*f+c*h*g,this._z=u*h*g+c*p*f,this._w=u*h*f-c*p*g;break;case"ZYX":this._x=c*h*f-u*p*g,this._y=u*p*f+c*h*g,this._z=u*h*g-c*p*f,this._w=u*h*f+c*p*g;break;case"YZX":this._x=c*h*f+u*p*g,this._y=u*p*f+c*h*g,this._z=u*h*g-c*p*f,this._w=u*h*f-c*p*g;break;case"XZY":this._x=c*h*f-u*p*g,this._y=u*p*f-c*h*g,this._z=u*h*g+c*p*f,this._w=u*h*f+c*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],s=t[8],a=t[1],o=t[5],l=t[9],u=t[2],h=t[6],f=t[10],c=n+o+f;if(c>0){let p=.5/Math.sqrt(c+1);this._w=.25/p,this._x=(h-l)*p,this._y=(s-u)*p,this._z=(a-r)*p}else if(n>o&&n>f){let p=2*Math.sqrt(1+n-o-f);this._w=(h-l)/p,this._x=.25*p,this._y=(r+a)/p,this._z=(s+u)/p}else if(o>f){let p=2*Math.sqrt(1+o-n-f);this._w=(s-u)/p,this._x=(r+a)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+f-n-o);this._w=(a-r)/p,this._x=(s+u)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Dt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,s=e._z,a=e._w,o=t._x,l=t._y,u=t._z,h=t._w;return this._x=n*h+a*o+r*u-s*l,this._y=r*h+a*l+s*o-n*u,this._z=s*h+a*u+n*l-r*o,this._w=a*h-n*o-r*l-s*u,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,r=this._y,s=this._z,a=this._w,o=a*e._w+n*e._x+r*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=r,this._z=s,this;let l=1-o*o;if(l<=Number.EPSILON){let p=1-t;return this._w=p*a+t*this._w,this._x=p*n+t*this._x,this._y=p*r+t*this._y,this._z=p*s+t*this._z,this.normalize(),this}let u=Math.sqrt(l),h=Math.atan2(u,o),f=Math.sin((1-t)*h)/u,c=Math.sin(t*h)/u;return this._w=a*f+this._w*c,this._x=n*f+this._x*c,this._y=r*f+this._y*c,this._z=s*f+this._z*c,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},P=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ic.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ic.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6]*r,this.y=s[1]*t+s[4]*n+s[7]*r,this.z=s[2]*t+s[5]*n+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,s=e.elements,a=1/(s[3]*t+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*n+s[8]*r+s[12])*a,this.y=(s[1]*t+s[5]*n+s[9]*r+s[13])*a,this.z=(s[2]*t+s[6]*n+s[10]*r+s[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,s=e.x,a=e.y,o=e.z,l=e.w,u=2*(a*r-o*n),h=2*(o*t-s*r),f=2*(s*n-a*t);return this.x=t+l*u+a*f-o*h,this.y=n+l*h+o*u-s*f,this.z=r+l*f+s*h-a*u,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*n+s[8]*r,this.y=s[1]*t+s[5]*n+s[9]*r,this.z=s[2]*t+s[6]*n+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,s=e.z,a=t.x,o=t.y,l=t.z;return this.x=r*l-s*o,this.y=s*a-n*l,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return la.copy(this).projectOnVector(e),this.sub(la)}reflect(e){return this.sub(la.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Dt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},la=new P,ic=new Gt,En=class{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint($t.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint($t.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=$t.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let s=n.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,$t):$t.fromBufferAttribute(s,a),$t.applyMatrix4(e.matrixWorld),this.expandByPoint($t);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Hr.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Hr.copy(n.boundingBox)),Hr.applyMatrix4(e.matrixWorld),this.union(Hr)}let r=e.children;for(let s=0,a=r.length;s<a;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,$t),$t.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(hr),Vr.subVectors(this.max,hr),Si.subVectors(e.a,hr),Ei.subVectors(e.b,hr),wi.subVectors(e.c,hr),In.subVectors(Ei,Si),Pn.subVectors(wi,Ei),jn.subVectors(Si,wi);let t=[0,-In.z,In.y,0,-Pn.z,Pn.y,0,-jn.z,jn.y,In.z,0,-In.x,Pn.z,0,-Pn.x,jn.z,0,-jn.x,-In.y,In.x,0,-Pn.y,Pn.x,0,-jn.y,jn.x,0];return!ca(t,Si,Ei,wi,Vr)||(t=[1,0,0,0,1,0,0,0,1],!ca(t,Si,Ei,wi,Vr))?!1:(Gr.crossVectors(In,Pn),t=[Gr.x,Gr.y,Gr.z],ca(t,Si,Ei,wi,Vr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,$t).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize($t).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(fn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),fn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),fn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),fn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),fn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),fn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),fn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),fn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(fn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}},fn=[new P,new P,new P,new P,new P,new P,new P,new P],$t=new P,Hr=new En,Si=new P,Ei=new P,wi=new P,In=new P,Pn=new P,jn=new P,hr=new P,Vr=new P,Gr=new P,Qn=new P;function ca(i,e,t,n,r){for(let s=0,a=i.length-3;s<=a;s+=3){Qn.fromArray(i,s);let o=r.x*Math.abs(Qn.x)+r.y*Math.abs(Qn.y)+r.z*Math.abs(Qn.z),l=e.dot(Qn),u=t.dot(Qn),h=n.dot(Qn);if(Math.max(-Math.max(l,u,h),Math.min(l,u,h))>o)return!1}return!0}var Qu=new En,ur=new P,ha=new P,hi=class{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Qu.setFromPoints(e).getCenter(n);let r=0;for(let s=0,a=e.length;s<a;s++)r=Math.max(r,n.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ur.subVectors(e,this.center);let t=ur.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),r=(n-this.radius)*.5;this.center.addScaledVector(ur,r/n),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ha.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ur.copy(e.center).add(ha)),this.expandByPoint(ur.copy(e.center).sub(ha))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}},pn=new P,ua=new P,Wr=new P,Ln=new P,da=new P,Xr=new P,fa=new P,vs=class{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,pn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=pn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(pn.copy(this.origin).addScaledVector(this.direction,t),pn.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){ua.copy(e).add(t).multiplyScalar(.5),Wr.copy(t).sub(e).normalize(),Ln.copy(this.origin).sub(ua);let s=e.distanceTo(t)*.5,a=-this.direction.dot(Wr),o=Ln.dot(this.direction),l=-Ln.dot(Wr),u=Ln.lengthSq(),h=Math.abs(1-a*a),f,c,p,g;if(h>0)if(f=a*l-o,c=a*o-l,g=s*h,f>=0)if(c>=-g)if(c<=g){let y=1/h;f*=y,c*=y,p=f*(f+a*c+2*o)+c*(a*f+c+2*l)+u}else c=s,f=Math.max(0,-(a*c+o)),p=-f*f+c*(c+2*l)+u;else c=-s,f=Math.max(0,-(a*c+o)),p=-f*f+c*(c+2*l)+u;else c<=-g?(f=Math.max(0,-(-a*s+o)),c=f>0?-s:Math.min(Math.max(-s,-l),s),p=-f*f+c*(c+2*l)+u):c<=g?(f=0,c=Math.min(Math.max(-s,-l),s),p=c*(c+2*l)+u):(f=Math.max(0,-(a*s+o)),c=f>0?s:Math.min(Math.max(-s,-l),s),p=-f*f+c*(c+2*l)+u);else c=a>0?-s:s,f=Math.max(0,-(a*c+o)),p=-f*f+c*(c+2*l)+u;return n&&n.copy(this.origin).addScaledVector(this.direction,f),r&&r.copy(ua).addScaledVector(Wr,c),p}intersectSphere(e,t){pn.subVectors(e.center,this.origin);let n=pn.dot(this.direction),r=pn.dot(pn)-n*n,s=e.radius*e.radius;if(r>s)return null;let a=Math.sqrt(s-r),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,s,a,o,l,u=1/this.direction.x,h=1/this.direction.y,f=1/this.direction.z,c=this.origin;return u>=0?(n=(e.min.x-c.x)*u,r=(e.max.x-c.x)*u):(n=(e.max.x-c.x)*u,r=(e.min.x-c.x)*u),h>=0?(s=(e.min.y-c.y)*h,a=(e.max.y-c.y)*h):(s=(e.max.y-c.y)*h,a=(e.min.y-c.y)*h),n>a||s>r||((s>n||isNaN(n))&&(n=s),(a<r||isNaN(r))&&(r=a),f>=0?(o=(e.min.z-c.z)*f,l=(e.max.z-c.z)*f):(o=(e.max.z-c.z)*f,l=(e.min.z-c.z)*f),n>l||o>r)||((o>n||n!==n)&&(n=o),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,pn)!==null}intersectTriangle(e,t,n,r,s){da.subVectors(t,e),Xr.subVectors(n,e),fa.crossVectors(da,Xr);let a=this.direction.dot(fa),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Ln.subVectors(this.origin,e);let l=o*this.direction.dot(Xr.crossVectors(Ln,Xr));if(l<0)return null;let u=o*this.direction.dot(da.cross(Ln));if(u<0||l+u>a)return null;let h=-o*Ln.dot(fa);return h<0?null:this.at(h/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},De=class i{constructor(e,t,n,r,s,a,o,l,u,h,f,c,p,g,y,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,s,a,o,l,u,h,f,c,p,g,y,m)}set(e,t,n,r,s,a,o,l,u,h,f,c,p,g,y,m){let d=this.elements;return d[0]=e,d[4]=t,d[8]=n,d[12]=r,d[1]=s,d[5]=a,d[9]=o,d[13]=l,d[2]=u,d[6]=h,d[10]=f,d[14]=c,d[3]=p,d[7]=g,d[11]=y,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,r=1/Ti.setFromMatrixColumn(e,0).length(),s=1/Ti.setFromMatrixColumn(e,1).length(),a=1/Ti.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*s,t[5]=n[5]*s,t[6]=n[6]*s,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,s=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(r),u=Math.sin(r),h=Math.cos(s),f=Math.sin(s);if(e.order==="XYZ"){let c=a*h,p=a*f,g=o*h,y=o*f;t[0]=l*h,t[4]=-l*f,t[8]=u,t[1]=p+g*u,t[5]=c-y*u,t[9]=-o*l,t[2]=y-c*u,t[6]=g+p*u,t[10]=a*l}else if(e.order==="YXZ"){let c=l*h,p=l*f,g=u*h,y=u*f;t[0]=c+y*o,t[4]=g*o-p,t[8]=a*u,t[1]=a*f,t[5]=a*h,t[9]=-o,t[2]=p*o-g,t[6]=y+c*o,t[10]=a*l}else if(e.order==="ZXY"){let c=l*h,p=l*f,g=u*h,y=u*f;t[0]=c-y*o,t[4]=-a*f,t[8]=g+p*o,t[1]=p+g*o,t[5]=a*h,t[9]=y-c*o,t[2]=-a*u,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let c=a*h,p=a*f,g=o*h,y=o*f;t[0]=l*h,t[4]=g*u-p,t[8]=c*u+y,t[1]=l*f,t[5]=y*u+c,t[9]=p*u-g,t[2]=-u,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let c=a*l,p=a*u,g=o*l,y=o*u;t[0]=l*h,t[4]=y-c*f,t[8]=g*f+p,t[1]=f,t[5]=a*h,t[9]=-o*h,t[2]=-u*h,t[6]=p*f+g,t[10]=c-y*f}else if(e.order==="XZY"){let c=a*l,p=a*u,g=o*l,y=o*u;t[0]=l*h,t[4]=-f,t[8]=u*h,t[1]=c*f+y,t[5]=a*h,t[9]=p*f-g,t[2]=g*f-p,t[6]=o*h,t[10]=y*f+c}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(ed,e,td)}lookAt(e,t,n){let r=this.elements;return zt.subVectors(e,t),zt.lengthSq()===0&&(zt.z=1),zt.normalize(),Dn.crossVectors(n,zt),Dn.lengthSq()===0&&(Math.abs(n.z)===1?zt.x+=1e-4:zt.z+=1e-4,zt.normalize(),Dn.crossVectors(n,zt)),Dn.normalize(),qr.crossVectors(zt,Dn),r[0]=Dn.x,r[4]=qr.x,r[8]=zt.x,r[1]=Dn.y,r[5]=qr.y,r[9]=zt.y,r[2]=Dn.z,r[6]=qr.z,r[10]=zt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,s=this.elements,a=n[0],o=n[4],l=n[8],u=n[12],h=n[1],f=n[5],c=n[9],p=n[13],g=n[2],y=n[6],m=n[10],d=n[14],v=n[3],S=n[7],b=n[11],I=n[15],T=r[0],w=r[4],A=r[8],x=r[12],_=r[1],C=r[5],L=r[9],U=r[13],k=r[2],W=r[6],O=r[10],$=r[14],B=r[3],ee=r[7],ae=r[11],X=r[15];return s[0]=a*T+o*_+l*k+u*B,s[4]=a*w+o*C+l*W+u*ee,s[8]=a*A+o*L+l*O+u*ae,s[12]=a*x+o*U+l*$+u*X,s[1]=h*T+f*_+c*k+p*B,s[5]=h*w+f*C+c*W+p*ee,s[9]=h*A+f*L+c*O+p*ae,s[13]=h*x+f*U+c*$+p*X,s[2]=g*T+y*_+m*k+d*B,s[6]=g*w+y*C+m*W+d*ee,s[10]=g*A+y*L+m*O+d*ae,s[14]=g*x+y*U+m*$+d*X,s[3]=v*T+S*_+b*k+I*B,s[7]=v*w+S*C+b*W+I*ee,s[11]=v*A+S*L+b*O+I*ae,s[15]=v*x+S*U+b*$+I*X,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],s=e[12],a=e[1],o=e[5],l=e[9],u=e[13],h=e[2],f=e[6],c=e[10],p=e[14],g=e[3],y=e[7],m=e[11],d=e[15];return g*(+s*l*f-r*u*f-s*o*c+n*u*c+r*o*p-n*l*p)+y*(+t*l*p-t*u*c+s*a*c-r*a*p+r*u*h-s*l*h)+m*(+t*u*f-t*o*p-s*a*f+n*a*p+s*o*h-n*u*h)+d*(-r*o*h-t*l*f+t*o*c+r*a*f-n*a*c+n*l*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],u=e[7],h=e[8],f=e[9],c=e[10],p=e[11],g=e[12],y=e[13],m=e[14],d=e[15],v=f*m*u-y*c*u+y*l*p-o*m*p-f*l*d+o*c*d,S=g*c*u-h*m*u-g*l*p+a*m*p+h*l*d-a*c*d,b=h*y*u-g*f*u+g*o*p-a*y*p-h*o*d+a*f*d,I=g*f*l-h*y*l-g*o*c+a*y*c+h*o*m-a*f*m,T=t*v+n*S+r*b+s*I;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let w=1/T;return e[0]=v*w,e[1]=(y*c*s-f*m*s-y*r*p+n*m*p+f*r*d-n*c*d)*w,e[2]=(o*m*s-y*l*s+y*r*u-n*m*u-o*r*d+n*l*d)*w,e[3]=(f*l*s-o*c*s-f*r*u+n*c*u+o*r*p-n*l*p)*w,e[4]=S*w,e[5]=(h*m*s-g*c*s+g*r*p-t*m*p-h*r*d+t*c*d)*w,e[6]=(g*l*s-a*m*s-g*r*u+t*m*u+a*r*d-t*l*d)*w,e[7]=(a*c*s-h*l*s+h*r*u-t*c*u-a*r*p+t*l*p)*w,e[8]=b*w,e[9]=(g*f*s-h*y*s-g*n*p+t*y*p+h*n*d-t*f*d)*w,e[10]=(a*y*s-g*o*s+g*n*u-t*y*u-a*n*d+t*o*d)*w,e[11]=(h*o*s-a*f*s-h*n*u+t*f*u+a*n*p-t*o*p)*w,e[12]=I*w,e[13]=(h*y*r-g*f*r+g*n*c-t*y*c-h*n*m+t*f*m)*w,e[14]=(g*o*r-a*y*r-g*n*l+t*y*l+a*n*m-t*o*m)*w,e[15]=(a*f*r-h*o*r+h*n*l-t*f*l-a*n*c+t*o*c)*w,this}scale(e){let t=this.elements,n=e.x,r=e.y,s=e.z;return t[0]*=n,t[4]*=r,t[8]*=s,t[1]*=n,t[5]*=r,t[9]*=s,t[2]*=n,t[6]*=r,t[10]*=s,t[3]*=n,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),s=1-n,a=e.x,o=e.y,l=e.z,u=s*a,h=s*o;return this.set(u*a+n,u*o-r*l,u*l+r*o,0,u*o+r*l,h*o+n,h*l-r*a,0,u*l-r*o,h*l+r*a,s*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,s,a){return this.set(1,n,s,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,s=t._x,a=t._y,o=t._z,l=t._w,u=s+s,h=a+a,f=o+o,c=s*u,p=s*h,g=s*f,y=a*h,m=a*f,d=o*f,v=l*u,S=l*h,b=l*f,I=n.x,T=n.y,w=n.z;return r[0]=(1-(y+d))*I,r[1]=(p+b)*I,r[2]=(g-S)*I,r[3]=0,r[4]=(p-b)*T,r[5]=(1-(c+d))*T,r[6]=(m+v)*T,r[7]=0,r[8]=(g+S)*w,r[9]=(m-v)*w,r[10]=(1-(c+y))*w,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements,s=Ti.set(r[0],r[1],r[2]).length(),a=Ti.set(r[4],r[5],r[6]).length(),o=Ti.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],Kt.copy(this);let u=1/s,h=1/a,f=1/o;return Kt.elements[0]*=u,Kt.elements[1]*=u,Kt.elements[2]*=u,Kt.elements[4]*=h,Kt.elements[5]*=h,Kt.elements[6]*=h,Kt.elements[8]*=f,Kt.elements[9]*=f,Kt.elements[10]*=f,t.setFromRotationMatrix(Kt),n.x=s,n.y=a,n.z=o,this}makePerspective(e,t,n,r,s,a,o=bn){let l=this.elements,u=2*s/(t-e),h=2*s/(n-r),f=(t+e)/(t-e),c=(n+r)/(n-r),p,g;if(o===bn)p=-(a+s)/(a-s),g=-2*a*s/(a-s);else if(o===_s)p=-a/(a-s),g=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=u,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=h,l[9]=c,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,r,s,a,o=bn){let l=this.elements,u=1/(t-e),h=1/(n-r),f=1/(a-s),c=(t+e)*u,p=(n+r)*h,g,y;if(o===bn)g=(a+s)*f,y=-2*f;else if(o===_s)g=s*f,y=-1*f;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*u,l[4]=0,l[8]=0,l[12]=-c,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=y,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let r=0;r<16;r++)if(t[r]!==n[r])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Ti=new P,Kt=new De,ed=new P(0,0,0),td=new P(1,1,1),Dn=new P,qr=new P,zt=new P,rc=new De,sc=new Gt,Wt=class i{constructor(e=0,t=0,n=0,r=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,s=r[0],a=r[4],o=r[8],l=r[1],u=r[5],h=r[9],f=r[2],c=r[6],p=r[10];switch(t){case"XYZ":this._y=Math.asin(Dt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(c,u),this._z=0);break;case"YXZ":this._x=Math.asin(-Dt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,u)):(this._y=Math.atan2(-f,s),this._z=0);break;case"ZXY":this._x=Math.asin(Dt(c,-1,1)),Math.abs(c)<.9999999?(this._y=Math.atan2(-f,p),this._z=Math.atan2(-a,u)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Dt(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(c,p),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,u));break;case"YZX":this._z=Math.asin(Dt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,u),this._y=Math.atan2(-f,s)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-Dt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(c,u),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return rc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(rc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return sc.setFromEuler(this),this.setFromQuaternion(sc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Wt.DEFAULT_ORDER="XYZ";var wr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},nd=0,ac=new P,Ai=new Gt,mn=new De,Yr=new P,dr=new P,id=new P,rd=new Gt,oc=new P(1,0,0),lc=new P(0,1,0),cc=new P(0,0,1),hc={type:"added"},sd={type:"removed"},Ri={type:"childadded",child:null},pa={type:"childremoved",child:null},Rt=class i extends Gn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:nd++}),this.uuid=On(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new P,t=new Wt,n=new Gt,r=new P(1,1,1);function s(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(s),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new De},normalMatrix:{value:new Fe}}),this.matrix=new De,this.matrixWorld=new De,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new wr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ai.setFromAxisAngle(e,t),this.quaternion.multiply(Ai),this}rotateOnWorldAxis(e,t){return Ai.setFromAxisAngle(e,t),this.quaternion.premultiply(Ai),this}rotateX(e){return this.rotateOnAxis(oc,e)}rotateY(e){return this.rotateOnAxis(lc,e)}rotateZ(e){return this.rotateOnAxis(cc,e)}translateOnAxis(e,t){return ac.copy(e).applyQuaternion(this.quaternion),this.position.add(ac.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(oc,e)}translateY(e){return this.translateOnAxis(lc,e)}translateZ(e){return this.translateOnAxis(cc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(mn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Yr.copy(e):Yr.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),dr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?mn.lookAt(dr,Yr,this.up):mn.lookAt(Yr,dr,this.up),this.quaternion.setFromRotationMatrix(mn),r&&(mn.extractRotation(r.matrixWorld),Ai.setFromRotationMatrix(mn),this.quaternion.premultiply(Ai.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(hc),Ri.child=e,this.dispatchEvent(Ri),Ri.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(sd),pa.child=e,this.dispatchEvent(pa),pa.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),mn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),mn.multiply(e.parent.matrixWorld)),e.applyMatrix4(mn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(hc),Ri.child=e,this.dispatchEvent(Ri),Ri.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(dr,e,id),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(dr,rd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let u=0,h=l.length;u<h;u++){let f=l[u];s(e.shapes,f)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,u=this.material.length;l<u;l++)o.push(s(e.materials,this.material[l]));r.material=o}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];r.animations.push(s(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),u=a(e.textures),h=a(e.images),f=a(e.shapes),c=a(e.skeletons),p=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),u.length>0&&(n.textures=u),h.length>0&&(n.images=h),f.length>0&&(n.shapes=f),c.length>0&&(n.skeletons=c),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=r,n;function a(o){let l=[];for(let u in o){let h=o[u];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let r=e.children[n];this.add(r.clone())}return this}};Rt.DEFAULT_UP=new P(0,1,0);Rt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Rt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Jt=new P,gn=new P,ma=new P,xn=new P,Ci=new P,Ii=new P,uc=new P,ga=new P,xa=new P,_a=new P,ya=new nt,ba=new nt,va=new nt,Fn=class i{constructor(e=new P,t=new P,n=new P){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Jt.subVectors(e,t),r.cross(Jt);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,n,r,s){Jt.subVectors(r,t),gn.subVectors(n,t),ma.subVectors(e,t);let a=Jt.dot(Jt),o=Jt.dot(gn),l=Jt.dot(ma),u=gn.dot(gn),h=gn.dot(ma),f=a*u-o*o;if(f===0)return s.set(0,0,0),null;let c=1/f,p=(u*l-o*h)*c,g=(a*h-o*l)*c;return s.set(1-p-g,g,p)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,xn)===null?!1:xn.x>=0&&xn.y>=0&&xn.x+xn.y<=1}static getInterpolation(e,t,n,r,s,a,o,l){return this.getBarycoord(e,t,n,r,xn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,xn.x),l.addScaledVector(a,xn.y),l.addScaledVector(o,xn.z),l)}static getInterpolatedAttribute(e,t,n,r,s,a){return ya.setScalar(0),ba.setScalar(0),va.setScalar(0),ya.fromBufferAttribute(e,t),ba.fromBufferAttribute(e,n),va.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(ya,s.x),a.addScaledVector(ba,s.y),a.addScaledVector(va,s.z),a}static isFrontFacing(e,t,n,r){return Jt.subVectors(n,t),gn.subVectors(e,t),Jt.cross(gn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Jt.subVectors(this.c,this.b),gn.subVectors(this.a,this.b),Jt.cross(gn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,r,s){return i.getInterpolation(e,this.a,this.b,this.c,t,n,r,s)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,s=this.c,a,o;Ci.subVectors(r,n),Ii.subVectors(s,n),ga.subVectors(e,n);let l=Ci.dot(ga),u=Ii.dot(ga);if(l<=0&&u<=0)return t.copy(n);xa.subVectors(e,r);let h=Ci.dot(xa),f=Ii.dot(xa);if(h>=0&&f<=h)return t.copy(r);let c=l*f-h*u;if(c<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(Ci,a);_a.subVectors(e,s);let p=Ci.dot(_a),g=Ii.dot(_a);if(g>=0&&p<=g)return t.copy(s);let y=p*u-l*g;if(y<=0&&u>=0&&g<=0)return o=u/(u-g),t.copy(n).addScaledVector(Ii,o);let m=h*g-p*f;if(m<=0&&f-h>=0&&p-g>=0)return uc.subVectors(s,r),o=(f-h)/(f-h+(p-g)),t.copy(r).addScaledVector(uc,o);let d=1/(m+y+c);return a=y*d,o=c*d,t.copy(n).addScaledVector(Ci,a).addScaledVector(Ii,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},dh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Un={h:0,s:0,l:0},Zr={h:0,s:0,l:0};function Ma(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Ce=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=_t){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ze.toWorkingColorSpace(this,t),this}setRGB(e,t,n,r=Ze.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ze.toWorkingColorSpace(this,r),this}setHSL(e,t,n,r=Ze.workingColorSpace){if(e=qu(e,1),t=Dt(t,0,1),n=Dt(n,0,1),t===0)this.r=this.g=this.b=n;else{let s=n<=.5?n*(1+t):n+t-n*t,a=2*n-s;this.r=Ma(a,s,e+1/3),this.g=Ma(a,s,e),this.b=Ma(a,s,e-1/3)}return Ze.toWorkingColorSpace(this,r),this}setStyle(e,t=_t){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,a=r[1],o=r[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=_t){let n=dh[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=vn(e.r),this.g=vn(e.g),this.b=vn(e.b),this}copyLinearToSRGB(e){return this.r=Gi(e.r),this.g=Gi(e.g),this.b=Gi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=_t){return Ze.fromWorkingColorSpace(wt.copy(this),e),Math.round(Dt(wt.r*255,0,255))*65536+Math.round(Dt(wt.g*255,0,255))*256+Math.round(Dt(wt.b*255,0,255))}getHexString(e=_t){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ze.workingColorSpace){Ze.fromWorkingColorSpace(wt.copy(this),t);let n=wt.r,r=wt.g,s=wt.b,a=Math.max(n,r,s),o=Math.min(n,r,s),l,u,h=(o+a)/2;if(o===a)l=0,u=0;else{let f=a-o;switch(u=h<=.5?f/(a+o):f/(2-a-o),a){case n:l=(r-s)/f+(r<s?6:0);break;case r:l=(s-n)/f+2;break;case s:l=(n-r)/f+4;break}l/=6}return e.h=l,e.s=u,e.l=h,e}getRGB(e,t=Ze.workingColorSpace){return Ze.fromWorkingColorSpace(wt.copy(this),t),e.r=wt.r,e.g=wt.g,e.b=wt.b,e}getStyle(e=_t){Ze.fromWorkingColorSpace(wt.copy(this),e);let t=wt.r,n=wt.g,r=wt.b;return e!==_t?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(e,t,n){return this.getHSL(Un),this.setHSL(Un.h+e,Un.s+t,Un.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Un),e.getHSL(Zr);let n=sa(Un.h,Zr.h,t),r=sa(Un.s,Zr.s,t),s=sa(Un.l,Zr.l,t);return this.setHSL(n,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*n+s[6]*r,this.g=s[1]*t+s[4]*n+s[7]*r,this.b=s[2]*t+s[5]*n+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},wt=new Ce;Ce.NAMES=dh;var ad=0,Wn=class extends Gn{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:ad++}),this.uuid=On(),this.name="",this.blending=Hi,this.side=Hn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Na,this.blendDst=za,this.blendEquation=si,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ce(0,0,0),this.blendAlpha=0,this.depthFunc=qi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=$l,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=vi,this.stencilZFail=vi,this.stencilZPass=vi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Hi&&(n.blending=this.blending),this.side!==Hn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Na&&(n.blendSrc=this.blendSrc),this.blendDst!==za&&(n.blendDst=this.blendDst),this.blendEquation!==si&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==qi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==$l&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==vi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==vi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==vi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){let a=[];for(let o in s){let l=s[o];delete l.metadata,a.push(l)}return a}if(t){let s=r(e.textures),a=r(e.images);s.length>0&&(n.textures=s),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let r=t.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=t[s].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},en=class extends Wn{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new Ce(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wt,this.combine=el,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var gt=new P,$r=new Ee,xt=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=vo,this.updateRanges=[],this.gpuType=ln,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)$r.fromBufferAttribute(this,t),$r.applyMatrix3(e),this.setXY(t,$r.x,$r.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)gt.fromBufferAttribute(this,t),gt.applyMatrix3(e),this.setXYZ(t,gt.x,gt.y,gt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)gt.fromBufferAttribute(this,t),gt.applyMatrix4(e),this.setXYZ(t,gt.x,gt.y,gt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)gt.fromBufferAttribute(this,t),gt.applyNormalMatrix(e),this.setXYZ(t,gt.x,gt.y,gt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)gt.fromBufferAttribute(this,t),gt.transformDirection(e),this.setXYZ(t,gt.x,gt.y,gt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=an(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=tt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=an(t,this.array)),t}setX(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=an(t,this.array)),t}setY(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=an(t,this.array)),t}setZ(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=an(t,this.array)),t}setW(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),r=tt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e*=this.itemSize,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),r=tt(r,this.array),s=tt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==vo&&(e.usage=this.usage),e}};var Ms=class extends xt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Ss=class extends xt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var He=class extends xt{constructor(e,t,n){super(new Float32Array(e),t,n)}},od=0,Vt=new De,Sa=new Rt,Pi=new P,Ft=new En,fr=new En,vt=new P,pt=class i extends Gn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:od++}),this.uuid=On(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(uh(e)?Ss:Ms)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let s=new Fe().getNormalMatrix(e);n.applyNormalMatrix(s),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Vt.makeRotationFromQuaternion(e),this.applyMatrix4(Vt),this}rotateX(e){return Vt.makeRotationX(e),this.applyMatrix4(Vt),this}rotateY(e){return Vt.makeRotationY(e),this.applyMatrix4(Vt),this}rotateZ(e){return Vt.makeRotationZ(e),this.applyMatrix4(Vt),this}translate(e,t,n){return Vt.makeTranslation(e,t,n),this.applyMatrix4(Vt),this}scale(e,t,n){return Vt.makeScale(e,t,n),this.applyMatrix4(Vt),this}lookAt(e){return Sa.lookAt(e),Sa.updateMatrix(),this.applyMatrix4(Sa.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Pi).negate(),this.translate(Pi.x,Pi.y,Pi.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let r=0,s=e.length;r<s;r++){let a=e[r];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new He(n,3))}else{for(let n=0,r=t.count;n<r;n++){let s=e[n];t.setXYZ(n,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new En);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,r=t.length;n<r;n++){let s=t[n];Ft.setFromBufferAttribute(s),this.morphTargetsRelative?(vt.addVectors(this.boundingBox.min,Ft.min),this.boundingBox.expandByPoint(vt),vt.addVectors(this.boundingBox.max,Ft.max),this.boundingBox.expandByPoint(vt)):(this.boundingBox.expandByPoint(Ft.min),this.boundingBox.expandByPoint(Ft.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new hi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(e){let n=this.boundingSphere.center;if(Ft.setFromBufferAttribute(e),t)for(let s=0,a=t.length;s<a;s++){let o=t[s];fr.setFromBufferAttribute(o),this.morphTargetsRelative?(vt.addVectors(Ft.min,fr.min),Ft.expandByPoint(vt),vt.addVectors(Ft.max,fr.max),Ft.expandByPoint(vt)):(Ft.expandByPoint(fr.min),Ft.expandByPoint(fr.max))}Ft.getCenter(n);let r=0;for(let s=0,a=e.count;s<a;s++)vt.fromBufferAttribute(e,s),r=Math.max(r,n.distanceToSquared(vt));if(t)for(let s=0,a=t.length;s<a;s++){let o=t[s],l=this.morphTargetsRelative;for(let u=0,h=o.count;u<h;u++)vt.fromBufferAttribute(o,u),l&&(Pi.fromBufferAttribute(e,u),vt.add(Pi)),r=Math.max(r,n.distanceToSquared(vt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new xt(new Float32Array(4*n.count),4));let a=this.getAttribute("tangent"),o=[],l=[];for(let A=0;A<n.count;A++)o[A]=new P,l[A]=new P;let u=new P,h=new P,f=new P,c=new Ee,p=new Ee,g=new Ee,y=new P,m=new P;function d(A,x,_){u.fromBufferAttribute(n,A),h.fromBufferAttribute(n,x),f.fromBufferAttribute(n,_),c.fromBufferAttribute(s,A),p.fromBufferAttribute(s,x),g.fromBufferAttribute(s,_),h.sub(u),f.sub(u),p.sub(c),g.sub(c);let C=1/(p.x*g.y-g.x*p.y);isFinite(C)&&(y.copy(h).multiplyScalar(g.y).addScaledVector(f,-p.y).multiplyScalar(C),m.copy(f).multiplyScalar(p.x).addScaledVector(h,-g.x).multiplyScalar(C),o[A].add(y),o[x].add(y),o[_].add(y),l[A].add(m),l[x].add(m),l[_].add(m))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let A=0,x=v.length;A<x;++A){let _=v[A],C=_.start,L=_.count;for(let U=C,k=C+L;U<k;U+=3)d(e.getX(U+0),e.getX(U+1),e.getX(U+2))}let S=new P,b=new P,I=new P,T=new P;function w(A){I.fromBufferAttribute(r,A),T.copy(I);let x=o[A];S.copy(x),S.sub(I.multiplyScalar(I.dot(x))).normalize(),b.crossVectors(T,x);let C=b.dot(l[A])<0?-1:1;a.setXYZW(A,S.x,S.y,S.z,C)}for(let A=0,x=v.length;A<x;++A){let _=v[A],C=_.start,L=_.count;for(let U=C,k=C+L;U<k;U+=3)w(e.getX(U+0)),w(e.getX(U+1)),w(e.getX(U+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new xt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let c=0,p=n.count;c<p;c++)n.setXYZ(c,0,0,0);let r=new P,s=new P,a=new P,o=new P,l=new P,u=new P,h=new P,f=new P;if(e)for(let c=0,p=e.count;c<p;c+=3){let g=e.getX(c+0),y=e.getX(c+1),m=e.getX(c+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,y),a.fromBufferAttribute(t,m),h.subVectors(a,s),f.subVectors(r,s),h.cross(f),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,y),u.fromBufferAttribute(n,m),o.add(h),l.add(h),u.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(y,l.x,l.y,l.z),n.setXYZ(m,u.x,u.y,u.z)}else for(let c=0,p=t.count;c<p;c+=3)r.fromBufferAttribute(t,c+0),s.fromBufferAttribute(t,c+1),a.fromBufferAttribute(t,c+2),h.subVectors(a,s),f.subVectors(r,s),h.cross(f),n.setXYZ(c+0,h.x,h.y,h.z),n.setXYZ(c+1,h.x,h.y,h.z),n.setXYZ(c+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)vt.fromBufferAttribute(e,t),vt.normalize(),e.setXYZ(t,vt.x,vt.y,vt.z)}toNonIndexed(){function e(o,l){let u=o.array,h=o.itemSize,f=o.normalized,c=new u.constructor(l.length*h),p=0,g=0;for(let y=0,m=l.length;y<m;y++){o.isInterleavedBufferAttribute?p=l[y]*o.data.stride+o.offset:p=l[y]*h;for(let d=0;d<h;d++)c[g++]=u[p++]}return new xt(c,h,f)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,r=this.attributes;for(let o in r){let l=r[o],u=e(l,n);t.setAttribute(o,u)}let s=this.morphAttributes;for(let o in s){let l=[],u=s[o];for(let h=0,f=u.length;h<f;h++){let c=u[h],p=e(c,n);l.push(p)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let u=a[o];t.addGroup(u.start,u.count,u.materialIndex)}return t}toJSON(){let e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let u in l)l[u]!==void 0&&(e[u]=l[u]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let u=n[l];e.data.attributes[l]=u.toJSON(e.data)}let r={},s=!1;for(let l in this.morphAttributes){let u=this.morphAttributes[l],h=[];for(let f=0,c=u.length;f<c;f++){let p=u[f];h.push(p.toJSON(e.data))}h.length>0&&(r[l]=h,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone(t));let r=e.attributes;for(let u in r){let h=r[u];this.setAttribute(u,h.clone(t))}let s=e.morphAttributes;for(let u in s){let h=[],f=s[u];for(let c=0,p=f.length;c<p;c++)h.push(f[c].clone(t));this.morphAttributes[u]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let u=0,h=a.length;u<h;u++){let f=a[u];this.addGroup(f.start,f.count,f.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},dc=new De,ei=new vs,Kr=new hi,fc=new P,Jr=new P,jr=new P,Qr=new P,Ea=new P,es=new P,pc=new P,ts=new P,it=class extends Rt{constructor(e=new pt,t=new en){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let r=t[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){let o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(s&&o){es.set(0,0,0);for(let l=0,u=s.length;l<u;l++){let h=o[l],f=s[l];h!==0&&(Ea.fromBufferAttribute(f,e),a?es.addScaledVector(Ea,h):es.addScaledVector(Ea.sub(t),h))}t.add(es)}return t}raycast(e,t){let n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Kr.copy(n.boundingSphere),Kr.applyMatrix4(s),ei.copy(e.ray).recast(e.near),!(Kr.containsPoint(ei.origin)===!1&&(ei.intersectSphere(Kr,fc)===null||ei.origin.distanceToSquared(fc)>(e.far-e.near)**2))&&(dc.copy(s).invert(),ei.copy(e.ray).applyMatrix4(dc),!(n.boundingBox!==null&&ei.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ei)))}_computeIntersections(e,t,n){let r,s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,u=s.attributes.uv,h=s.attributes.uv1,f=s.attributes.normal,c=s.groups,p=s.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,y=c.length;g<y;g++){let m=c[g],d=a[m.materialIndex],v=Math.max(m.start,p.start),S=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let b=v,I=S;b<I;b+=3){let T=o.getX(b),w=o.getX(b+1),A=o.getX(b+2);r=ns(this,d,e,n,u,h,f,T,w,A),r&&(r.faceIndex=Math.floor(b/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let g=Math.max(0,p.start),y=Math.min(o.count,p.start+p.count);for(let m=g,d=y;m<d;m+=3){let v=o.getX(m),S=o.getX(m+1),b=o.getX(m+2);r=ns(this,a,e,n,u,h,f,v,S,b),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,y=c.length;g<y;g++){let m=c[g],d=a[m.materialIndex],v=Math.max(m.start,p.start),S=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let b=v,I=S;b<I;b+=3){let T=b,w=b+1,A=b+2;r=ns(this,d,e,n,u,h,f,T,w,A),r&&(r.faceIndex=Math.floor(b/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let g=Math.max(0,p.start),y=Math.min(l.count,p.start+p.count);for(let m=g,d=y;m<d;m+=3){let v=m,S=m+1,b=m+2;r=ns(this,a,e,n,u,h,f,v,S,b),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}};function ld(i,e,t,n,r,s,a,o){let l;if(e.side===Ut?l=n.intersectTriangle(a,s,r,!0,o):l=n.intersectTriangle(r,s,a,e.side===Hn,o),l===null)return null;ts.copy(o),ts.applyMatrix4(i.matrixWorld);let u=t.ray.origin.distanceTo(ts);return u<t.near||u>t.far?null:{distance:u,point:ts.clone(),object:i}}function ns(i,e,t,n,r,s,a,o,l,u){i.getVertexPosition(o,Jr),i.getVertexPosition(l,jr),i.getVertexPosition(u,Qr);let h=ld(i,e,t,n,Jr,jr,Qr,pc);if(h){let f=new P;Fn.getBarycoord(pc,Jr,jr,Qr,f),r&&(h.uv=Fn.getInterpolatedAttribute(r,o,l,u,f,new Ee)),s&&(h.uv1=Fn.getInterpolatedAttribute(s,o,l,u,f,new Ee)),a&&(h.normal=Fn.getInterpolatedAttribute(a,o,l,u,f,new P),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let c={a:o,b:l,c:u,normal:new P,materialIndex:0};Fn.getNormal(Jr,jr,Qr,c.normal),h.face=c,h.barycoord=f}return h}var mt=class i extends pt{constructor(e=1,t=1,n=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:s,depthSegments:a};let o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);let l=[],u=[],h=[],f=[],c=0,p=0;g("z","y","x",-1,-1,n,t,e,a,s,0),g("z","y","x",1,-1,n,t,-e,a,s,1),g("x","z","y",1,1,e,n,t,r,a,2),g("x","z","y",1,-1,e,n,-t,r,a,3),g("x","y","z",1,-1,e,t,n,r,s,4),g("x","y","z",-1,-1,e,t,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new He(u,3)),this.setAttribute("normal",new He(h,3)),this.setAttribute("uv",new He(f,2));function g(y,m,d,v,S,b,I,T,w,A,x){let _=b/w,C=I/A,L=b/2,U=I/2,k=T/2,W=w+1,O=A+1,$=0,B=0,ee=new P;for(let ae=0;ae<O;ae++){let X=ae*C-U;for(let se=0;se<W;se++){let Ie=se*_-L;ee[y]=Ie*v,ee[m]=X*S,ee[d]=k,u.push(ee.x,ee.y,ee.z),ee[y]=0,ee[m]=0,ee[d]=T>0?1:-1,h.push(ee.x,ee.y,ee.z),f.push(se/w),f.push(1-ae/A),$+=1}}for(let ae=0;ae<A;ae++)for(let X=0;X<w;X++){let se=c+X+W*ae,Ie=c+X+W*(ae+1),Y=c+(X+1)+W*(ae+1),Q=c+(X+1)+W*ae;l.push(se,Ie,Q),l.push(Ie,Y,Q),B+=6}o.addGroup(p,B,x),p+=B,c+=$}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function Ji(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let r=i[t][n];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=r.clone():Array.isArray(r)?e[t][n]=r.slice():e[t][n]=r}}return e}function It(i){let e={};for(let t=0;t<i.length;t++){let n=Ji(i[t]);for(let r in n)e[r]=n[r]}return e}function cd(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function fh(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ze.workingColorSpace}var hd={clone:Ji,merge:It},ud=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,dd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Bt=class extends Wn{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ud,this.fragmentShader=dd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ji(e.uniforms),this.uniformsGroups=cd(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let a=this.uniforms[r].value;a&&a.isTexture?t.uniforms[r]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[r]={type:"m4",value:a.toArray()}:t.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},Es=class extends Rt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new De,this.projectionMatrix=new De,this.projectionMatrixInverse=new De,this.coordinateSystem=bn}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Nn=new P,mc=new Ee,gc=new Ee,Tt=class extends Es{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Mo*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(ra*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Mo*2*Math.atan(Math.tan(ra*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Nn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Nn.x,Nn.y).multiplyScalar(-e/Nn.z),Nn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Nn.x,Nn.y).multiplyScalar(-e/Nn.z)}getViewSize(e,t){return this.getViewBounds(e,mc,gc),t.subVectors(gc,mc)}setViewOffset(e,t,n,r,s,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(ra*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,s=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,u=a.fullHeight;s+=a.offsetX*r/l,t-=a.offsetY*n/u,r*=a.width/l,n*=a.height/u}let o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Li=-90,Di=1,To=class extends Rt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Tt(Li,Di,e,t);r.layers=this.layers,this.add(r);let s=new Tt(Li,Di,e,t);s.layers=this.layers,this.add(s);let a=new Tt(Li,Di,e,t);a.layers=this.layers,this.add(a);let o=new Tt(Li,Di,e,t);o.layers=this.layers,this.add(o);let l=new Tt(Li,Di,e,t);l.layers=this.layers,this.add(l);let u=new Tt(Li,Di,e,t);u.layers=this.layers,this.add(u)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,s,a,o,l]=t;for(let u of t)this.remove(u);if(e===bn)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===_s)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let u of t)this.add(u),u.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,a,o,l,u,h]=this.children,f=e.getRenderTarget(),c=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,r),e.render(t,s),e.setRenderTarget(n,1,r),e.render(t,a),e.setRenderTarget(n,2,r),e.render(t,o),e.setRenderTarget(n,3,r),e.render(t,l),e.setRenderTarget(n,4,r),e.render(t,u),n.texture.generateMipmaps=y,e.setRenderTarget(n,5,r),e.render(t,h),e.setRenderTarget(f,c,p),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},ws=class extends Pt{constructor(e,t,n,r,s,a,o,l,u,h){e=e!==void 0?e:[],t=t!==void 0?t:Yi,super(e,t,n,r,s,a,o,l,u,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ao=class extends Sn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new ws(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:on}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new mt(5,5,5),s=new Bt({name:"CubemapFromEquirect",uniforms:Ji(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ut,blending:kn});s.uniforms.tEquirect.value=t;let a=new it(r,s),o=t.minFilter;return t.minFilter===li&&(t.minFilter=on),new To(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,n,r){let s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,r);e.setRenderTarget(s)}},wa=new P,fd=new P,pd=new Fe,yn=class{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=wa.subVectors(n,t).cross(fd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(wa),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(n,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||pd.getNormalMatrix(e),r=this.coplanarPoint(wa).applyMatrix4(e),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},ti=new hi,is=new P,Tr=class{constructor(e=new yn,t=new yn,n=new yn,r=new yn,s=new yn,a=new yn){this.planes=[e,t,n,r,s,a]}set(e,t,n,r,s,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(s),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=bn){let n=this.planes,r=e.elements,s=r[0],a=r[1],o=r[2],l=r[3],u=r[4],h=r[5],f=r[6],c=r[7],p=r[8],g=r[9],y=r[10],m=r[11],d=r[12],v=r[13],S=r[14],b=r[15];if(n[0].setComponents(l-s,c-u,m-p,b-d).normalize(),n[1].setComponents(l+s,c+u,m+p,b+d).normalize(),n[2].setComponents(l+a,c+h,m+g,b+v).normalize(),n[3].setComponents(l-a,c-h,m-g,b-v).normalize(),n[4].setComponents(l-o,c-f,m-y,b-S).normalize(),t===bn)n[5].setComponents(l+o,c+f,m+y,b+S).normalize();else if(t===_s)n[5].setComponents(o,f,y,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ti.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ti.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ti)}intersectsSprite(e){return ti.center.set(0,0,0),ti.radius=.7071067811865476,ti.applyMatrix4(e.matrixWorld),this.intersectsSphere(ti)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(is.x=r.normal.x>0?e.max.x:e.min.x,is.y=r.normal.y>0?e.max.y:e.min.y,is.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(is)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function ph(){let i=null,e=!1,t=null,n=null;function r(s,a){t(s,a),n=i.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(r),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){i=s}}}function md(i){let e=new WeakMap;function t(o,l){let u=o.array,h=o.usage,f=u.byteLength,c=i.createBuffer();i.bindBuffer(l,c),i.bufferData(l,u,h),o.onUploadCallback();let p;if(u instanceof Float32Array)p=i.FLOAT;else if(u instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(u instanceof Int16Array)p=i.SHORT;else if(u instanceof Uint32Array)p=i.UNSIGNED_INT;else if(u instanceof Int32Array)p=i.INT;else if(u instanceof Int8Array)p=i.BYTE;else if(u instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(u instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+u);return{buffer:c,type:p,bytesPerElement:u.BYTES_PER_ELEMENT,version:o.version,size:f}}function n(o,l,u){let h=l.array,f=l.updateRanges;if(i.bindBuffer(u,o),f.length===0)i.bufferSubData(u,0,h);else{f.sort((p,g)=>p.start-g.start);let c=0;for(let p=1;p<f.length;p++){let g=f[c],y=f[p];y.start<=g.start+g.count+1?g.count=Math.max(g.count,y.start+y.count-g.start):(++c,f[c]=y)}f.length=c+1;for(let p=0,g=f.length;p<g;p++){let y=f[p];i.bufferSubData(u,y.start*h.BYTES_PER_ELEMENT,h,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let u=e.get(o);if(u===void 0)e.set(o,t(o,l));else if(u.version<o.version){if(u.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(u.buffer,o,l),u.version=o.version}}return{get:r,remove:s,update:a}}var ji=class i extends pt{constructor(e=1,t=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let s=e/2,a=t/2,o=Math.floor(n),l=Math.floor(r),u=o+1,h=l+1,f=e/o,c=t/l,p=[],g=[],y=[],m=[];for(let d=0;d<h;d++){let v=d*c-a;for(let S=0;S<u;S++){let b=S*f-s;g.push(b,-v,0),y.push(0,0,1),m.push(S/o),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let v=0;v<o;v++){let S=v+u*d,b=v+u*(d+1),I=v+1+u*(d+1),T=v+1+u*d;p.push(S,b,T),p.push(b,I,T)}this.setIndex(p),this.setAttribute("position",new He(g,3)),this.setAttribute("normal",new He(y,3)),this.setAttribute("uv",new He(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},gd=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,xd=`#ifdef USE_ALPHAHASH
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
#endif`,_d=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,yd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,bd=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,vd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Md=`#ifdef USE_AOMAP
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
#endif`,Sd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Ed=`#ifdef USE_BATCHING
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
#endif`,wd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Td=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Ad=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Rd=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Cd=`#ifdef USE_IRIDESCENCE
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
#endif`,Id=`#ifdef USE_BUMPMAP
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
#endif`,Pd=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Ld=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Dd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Ud=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Nd=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,zd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Fd=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,kd=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Bd=`#define PI 3.141592653589793
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
} // validated`,Od=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Hd=`vec3 transformedNormal = objectNormal;
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
#endif`,Vd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Gd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Wd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Xd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,qd="gl_FragColor = linearToOutputTexel( gl_FragColor );",Yd=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Zd=`#ifdef USE_ENVMAP
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
#endif`,$d=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Kd=`#ifdef USE_ENVMAP
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
#endif`,Jd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,jd=`#ifdef USE_ENVMAP
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
#endif`,Qd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,ef=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,tf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,nf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,rf=`#ifdef USE_GRADIENTMAP
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
}`,sf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,af=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,of=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lf=`uniform bool receiveShadow;
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
#endif`,cf=`#ifdef USE_ENVMAP
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
#endif`,hf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,uf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,df=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,ff=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,pf=`PhysicalMaterial material;
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
#endif`,mf=`struct PhysicalMaterial {
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
}`,gf=`
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
#endif`,xf=`#if defined( RE_IndirectDiffuse )
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
#endif`,_f=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,yf=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,bf=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,vf=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Mf=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Sf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Ef=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,wf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Tf=`#if defined( USE_POINTS_UV )
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
#endif`,Af=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Rf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Cf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,If=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Pf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Lf=`#ifdef USE_MORPHTARGETS
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
#endif`,Df=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Uf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Nf=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,zf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ff=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,kf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Bf=`#ifdef USE_NORMALMAP
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
#endif`,Of=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Hf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Vf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Gf=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Wf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Xf=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,qf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Yf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Zf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,$f=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Kf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Jf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,jf=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Qf=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,ep=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,tp=`float getShadowMask() {
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
}`,np=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,ip=`#ifdef USE_SKINNING
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
#endif`,rp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,sp=`#ifdef USE_SKINNING
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
#endif`,ap=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,op=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,lp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,cp=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,hp=`#ifdef USE_TRANSMISSION
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
#endif`,up=`#ifdef USE_TRANSMISSION
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
#endif`,dp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,fp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,pp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,mp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,gp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,xp=`uniform sampler2D t2D;
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
}`,_p=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,yp=`#ifdef ENVMAP_TYPE_CUBE
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
}`,bp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,vp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Mp=`#include <common>
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
}`,Sp=`#if DEPTH_PACKING == 3200
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
}`,Ep=`#define DISTANCE
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
}`,wp=`#define DISTANCE
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
}`,Tp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Ap=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Rp=`uniform float scale;
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
}`,Cp=`uniform vec3 diffuse;
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
}`,Ip=`#include <common>
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
}`,Pp=`uniform vec3 diffuse;
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
}`,Lp=`#define LAMBERT
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
}`,Dp=`#define LAMBERT
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
}`,Up=`#define MATCAP
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
}`,Np=`#define MATCAP
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
}`,zp=`#define NORMAL
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
}`,Fp=`#define NORMAL
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
}`,kp=`#define PHONG
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
}`,Bp=`#define PHONG
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
}`,Op=`#define STANDARD
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
}`,Hp=`#define STANDARD
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
}`,Vp=`#define TOON
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
}`,Gp=`#define TOON
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
}`,Wp=`uniform float size;
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
}`,Xp=`uniform vec3 diffuse;
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
}`,qp=`#include <common>
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
}`,Yp=`uniform vec3 color;
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
}`,Zp=`uniform float rotation;
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
}`,$p=`uniform vec3 diffuse;
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
}`,Be={alphahash_fragment:gd,alphahash_pars_fragment:xd,alphamap_fragment:_d,alphamap_pars_fragment:yd,alphatest_fragment:bd,alphatest_pars_fragment:vd,aomap_fragment:Md,aomap_pars_fragment:Sd,batching_pars_vertex:Ed,batching_vertex:wd,begin_vertex:Td,beginnormal_vertex:Ad,bsdfs:Rd,iridescence_fragment:Cd,bumpmap_pars_fragment:Id,clipping_planes_fragment:Pd,clipping_planes_pars_fragment:Ld,clipping_planes_pars_vertex:Dd,clipping_planes_vertex:Ud,color_fragment:Nd,color_pars_fragment:zd,color_pars_vertex:Fd,color_vertex:kd,common:Bd,cube_uv_reflection_fragment:Od,defaultnormal_vertex:Hd,displacementmap_pars_vertex:Vd,displacementmap_vertex:Gd,emissivemap_fragment:Wd,emissivemap_pars_fragment:Xd,colorspace_fragment:qd,colorspace_pars_fragment:Yd,envmap_fragment:Zd,envmap_common_pars_fragment:$d,envmap_pars_fragment:Kd,envmap_pars_vertex:Jd,envmap_physical_pars_fragment:cf,envmap_vertex:jd,fog_vertex:Qd,fog_pars_vertex:ef,fog_fragment:tf,fog_pars_fragment:nf,gradientmap_pars_fragment:rf,lightmap_pars_fragment:sf,lights_lambert_fragment:af,lights_lambert_pars_fragment:of,lights_pars_begin:lf,lights_toon_fragment:hf,lights_toon_pars_fragment:uf,lights_phong_fragment:df,lights_phong_pars_fragment:ff,lights_physical_fragment:pf,lights_physical_pars_fragment:mf,lights_fragment_begin:gf,lights_fragment_maps:xf,lights_fragment_end:_f,logdepthbuf_fragment:yf,logdepthbuf_pars_fragment:bf,logdepthbuf_pars_vertex:vf,logdepthbuf_vertex:Mf,map_fragment:Sf,map_pars_fragment:Ef,map_particle_fragment:wf,map_particle_pars_fragment:Tf,metalnessmap_fragment:Af,metalnessmap_pars_fragment:Rf,morphinstance_vertex:Cf,morphcolor_vertex:If,morphnormal_vertex:Pf,morphtarget_pars_vertex:Lf,morphtarget_vertex:Df,normal_fragment_begin:Uf,normal_fragment_maps:Nf,normal_pars_fragment:zf,normal_pars_vertex:Ff,normal_vertex:kf,normalmap_pars_fragment:Bf,clearcoat_normal_fragment_begin:Of,clearcoat_normal_fragment_maps:Hf,clearcoat_pars_fragment:Vf,iridescence_pars_fragment:Gf,opaque_fragment:Wf,packing:Xf,premultiplied_alpha_fragment:qf,project_vertex:Yf,dithering_fragment:Zf,dithering_pars_fragment:$f,roughnessmap_fragment:Kf,roughnessmap_pars_fragment:Jf,shadowmap_pars_fragment:jf,shadowmap_pars_vertex:Qf,shadowmap_vertex:ep,shadowmask_pars_fragment:tp,skinbase_vertex:np,skinning_pars_vertex:ip,skinning_vertex:rp,skinnormal_vertex:sp,specularmap_fragment:ap,specularmap_pars_fragment:op,tonemapping_fragment:lp,tonemapping_pars_fragment:cp,transmission_fragment:hp,transmission_pars_fragment:up,uv_pars_fragment:dp,uv_pars_vertex:fp,uv_vertex:pp,worldpos_vertex:mp,background_vert:gp,background_frag:xp,backgroundCube_vert:_p,backgroundCube_frag:yp,cube_vert:bp,cube_frag:vp,depth_vert:Mp,depth_frag:Sp,distanceRGBA_vert:Ep,distanceRGBA_frag:wp,equirect_vert:Tp,equirect_frag:Ap,linedashed_vert:Rp,linedashed_frag:Cp,meshbasic_vert:Ip,meshbasic_frag:Pp,meshlambert_vert:Lp,meshlambert_frag:Dp,meshmatcap_vert:Up,meshmatcap_frag:Np,meshnormal_vert:zp,meshnormal_frag:Fp,meshphong_vert:kp,meshphong_frag:Bp,meshphysical_vert:Op,meshphysical_frag:Hp,meshtoon_vert:Vp,meshtoon_frag:Gp,points_vert:Wp,points_frag:Xp,shadow_vert:qp,shadow_frag:Yp,sprite_vert:Zp,sprite_frag:$p},oe={common:{diffuse:{value:new Ce(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Fe}},envmap:{envMap:{value:null},envMapRotation:{value:new Fe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Fe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Fe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Fe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Fe},normalScale:{value:new Ee(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Fe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Fe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Fe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Fe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ce(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ce(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0},uvTransform:{value:new Fe}},sprite:{diffuse:{value:new Ce(16777215)},opacity:{value:1},center:{value:new Ee(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Fe},alphaMap:{value:null},alphaMapTransform:{value:new Fe},alphaTest:{value:0}}},sn={basic:{uniforms:It([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.fog]),vertexShader:Be.meshbasic_vert,fragmentShader:Be.meshbasic_frag},lambert:{uniforms:It([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new Ce(0)}}]),vertexShader:Be.meshlambert_vert,fragmentShader:Be.meshlambert_frag},phong:{uniforms:It([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new Ce(0)},specular:{value:new Ce(1118481)},shininess:{value:30}}]),vertexShader:Be.meshphong_vert,fragmentShader:Be.meshphong_frag},standard:{uniforms:It([oe.common,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.roughnessmap,oe.metalnessmap,oe.fog,oe.lights,{emissive:{value:new Ce(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Be.meshphysical_vert,fragmentShader:Be.meshphysical_frag},toon:{uniforms:It([oe.common,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.gradientmap,oe.fog,oe.lights,{emissive:{value:new Ce(0)}}]),vertexShader:Be.meshtoon_vert,fragmentShader:Be.meshtoon_frag},matcap:{uniforms:It([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,{matcap:{value:null}}]),vertexShader:Be.meshmatcap_vert,fragmentShader:Be.meshmatcap_frag},points:{uniforms:It([oe.points,oe.fog]),vertexShader:Be.points_vert,fragmentShader:Be.points_frag},dashed:{uniforms:It([oe.common,oe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Be.linedashed_vert,fragmentShader:Be.linedashed_frag},depth:{uniforms:It([oe.common,oe.displacementmap]),vertexShader:Be.depth_vert,fragmentShader:Be.depth_frag},normal:{uniforms:It([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,{opacity:{value:1}}]),vertexShader:Be.meshnormal_vert,fragmentShader:Be.meshnormal_frag},sprite:{uniforms:It([oe.sprite,oe.fog]),vertexShader:Be.sprite_vert,fragmentShader:Be.sprite_frag},background:{uniforms:{uvTransform:{value:new Fe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Be.background_vert,fragmentShader:Be.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Fe}},vertexShader:Be.backgroundCube_vert,fragmentShader:Be.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Be.cube_vert,fragmentShader:Be.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Be.equirect_vert,fragmentShader:Be.equirect_frag},distanceRGBA:{uniforms:It([oe.common,oe.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Be.distanceRGBA_vert,fragmentShader:Be.distanceRGBA_frag},shadow:{uniforms:It([oe.lights,oe.fog,{color:{value:new Ce(0)},opacity:{value:1}}]),vertexShader:Be.shadow_vert,fragmentShader:Be.shadow_frag}};sn.physical={uniforms:It([sn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Fe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Fe},clearcoatNormalScale:{value:new Ee(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Fe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Fe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Fe},sheen:{value:0},sheenColor:{value:new Ce(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Fe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Fe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Fe},transmissionSamplerSize:{value:new Ee},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Fe},attenuationDistance:{value:0},attenuationColor:{value:new Ce(0)},specularColor:{value:new Ce(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Fe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Fe},anisotropyVector:{value:new Ee},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Fe}}]),vertexShader:Be.meshphysical_vert,fragmentShader:Be.meshphysical_frag};var rs={r:0,b:0,g:0},ni=new Wt,Kp=new De;function Jp(i,e,t,n,r,s,a){let o=new Ce(0),l=s===!0?0:1,u,h,f=null,c=0,p=null;function g(v){let S=v.isScene===!0?v.background:null;return S&&S.isTexture&&(S=(v.backgroundBlurriness>0?t:e).get(S)),S}function y(v){let S=!1,b=g(v);b===null?d(o,l):b&&b.isColor&&(d(b,1),S=!0);let I=i.xr.getEnvironmentBlendMode();I==="additive"?n.buffers.color.setClear(0,0,0,1,a):I==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||S)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(v,S){let b=g(S);b&&(b.isCubeTexture||b.mapping===Ws)?(h===void 0&&(h=new it(new mt(1,1,1),new Bt({name:"BackgroundCubeMaterial",uniforms:Ji(sn.backgroundCube.uniforms),vertexShader:sn.backgroundCube.vertexShader,fragmentShader:sn.backgroundCube.fragmentShader,side:Ut,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(I,T,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(h)),ni.copy(S.backgroundRotation),ni.x*=-1,ni.y*=-1,ni.z*=-1,b.isCubeTexture&&b.isRenderTargetTexture===!1&&(ni.y*=-1,ni.z*=-1),h.material.uniforms.envMap.value=b,h.material.uniforms.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Kp.makeRotationFromEuler(ni)),h.material.toneMapped=Ze.getTransfer(b.colorSpace)!==et,(f!==b||c!==b.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,f=b,c=b.version,p=i.toneMapping),h.layers.enableAll(),v.unshift(h,h.geometry,h.material,0,0,null)):b&&b.isTexture&&(u===void 0&&(u=new it(new ji(2,2),new Bt({name:"BackgroundMaterial",uniforms:Ji(sn.background.uniforms),vertexShader:sn.background.vertexShader,fragmentShader:sn.background.fragmentShader,side:Hn,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),Object.defineProperty(u.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(u)),u.material.uniforms.t2D.value=b,u.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,u.material.toneMapped=Ze.getTransfer(b.colorSpace)!==et,b.matrixAutoUpdate===!0&&b.updateMatrix(),u.material.uniforms.uvTransform.value.copy(b.matrix),(f!==b||c!==b.version||p!==i.toneMapping)&&(u.material.needsUpdate=!0,f=b,c=b.version,p=i.toneMapping),u.layers.enableAll(),v.unshift(u,u.geometry,u.material,0,0,null))}function d(v,S){v.getRGB(rs,fh(i)),n.buffers.color.setClear(rs.r,rs.g,rs.b,S,a)}return{getClearColor:function(){return o},setClearColor:function(v,S=1){o.set(v),l=S,d(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(v){l=v,d(o,l)},render:y,addToRenderList:m}}function jp(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},r=c(null),s=r,a=!1;function o(_,C,L,U,k){let W=!1,O=f(U,L,C);s!==O&&(s=O,u(s.object)),W=p(_,U,L,k),W&&g(_,U,L,k),k!==null&&e.update(k,i.ELEMENT_ARRAY_BUFFER),(W||a)&&(a=!1,b(_,C,L,U),k!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(k).buffer))}function l(){return i.createVertexArray()}function u(_){return i.bindVertexArray(_)}function h(_){return i.deleteVertexArray(_)}function f(_,C,L){let U=L.wireframe===!0,k=n[_.id];k===void 0&&(k={},n[_.id]=k);let W=k[C.id];W===void 0&&(W={},k[C.id]=W);let O=W[U];return O===void 0&&(O=c(l()),W[U]=O),O}function c(_){let C=[],L=[],U=[];for(let k=0;k<t;k++)C[k]=0,L[k]=0,U[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:C,enabledAttributes:L,attributeDivisors:U,object:_,attributes:{},index:null}}function p(_,C,L,U){let k=s.attributes,W=C.attributes,O=0,$=L.getAttributes();for(let B in $)if($[B].location>=0){let ae=k[B],X=W[B];if(X===void 0&&(B==="instanceMatrix"&&_.instanceMatrix&&(X=_.instanceMatrix),B==="instanceColor"&&_.instanceColor&&(X=_.instanceColor)),ae===void 0||ae.attribute!==X||X&&ae.data!==X.data)return!0;O++}return s.attributesNum!==O||s.index!==U}function g(_,C,L,U){let k={},W=C.attributes,O=0,$=L.getAttributes();for(let B in $)if($[B].location>=0){let ae=W[B];ae===void 0&&(B==="instanceMatrix"&&_.instanceMatrix&&(ae=_.instanceMatrix),B==="instanceColor"&&_.instanceColor&&(ae=_.instanceColor));let X={};X.attribute=ae,ae&&ae.data&&(X.data=ae.data),k[B]=X,O++}s.attributes=k,s.attributesNum=O,s.index=U}function y(){let _=s.newAttributes;for(let C=0,L=_.length;C<L;C++)_[C]=0}function m(_){d(_,0)}function d(_,C){let L=s.newAttributes,U=s.enabledAttributes,k=s.attributeDivisors;L[_]=1,U[_]===0&&(i.enableVertexAttribArray(_),U[_]=1),k[_]!==C&&(i.vertexAttribDivisor(_,C),k[_]=C)}function v(){let _=s.newAttributes,C=s.enabledAttributes;for(let L=0,U=C.length;L<U;L++)C[L]!==_[L]&&(i.disableVertexAttribArray(L),C[L]=0)}function S(_,C,L,U,k,W,O){O===!0?i.vertexAttribIPointer(_,C,L,k,W):i.vertexAttribPointer(_,C,L,U,k,W)}function b(_,C,L,U){y();let k=U.attributes,W=L.getAttributes(),O=C.defaultAttributeValues;for(let $ in W){let B=W[$];if(B.location>=0){let ee=k[$];if(ee===void 0&&($==="instanceMatrix"&&_.instanceMatrix&&(ee=_.instanceMatrix),$==="instanceColor"&&_.instanceColor&&(ee=_.instanceColor)),ee!==void 0){let ae=ee.normalized,X=ee.itemSize,se=e.get(ee);if(se===void 0)continue;let Ie=se.buffer,Y=se.type,Q=se.bytesPerElement,fe=Y===i.INT||Y===i.UNSIGNED_INT||ee.gpuType===nl;if(ee.isInterleavedBufferAttribute){let re=ee.data,be=re.stride,Te=ee.offset;if(re.isInstancedInterleavedBuffer){for(let Ue=0;Ue<B.locationSize;Ue++)d(B.location+Ue,re.meshPerAttribute);_.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=re.meshPerAttribute*re.count)}else for(let Ue=0;Ue<B.locationSize;Ue++)m(B.location+Ue);i.bindBuffer(i.ARRAY_BUFFER,Ie);for(let Ue=0;Ue<B.locationSize;Ue++)S(B.location+Ue,X/B.locationSize,Y,ae,be*Q,(Te+X/B.locationSize*Ue)*Q,fe)}else{if(ee.isInstancedBufferAttribute){for(let re=0;re<B.locationSize;re++)d(B.location+re,ee.meshPerAttribute);_.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let re=0;re<B.locationSize;re++)m(B.location+re);i.bindBuffer(i.ARRAY_BUFFER,Ie);for(let re=0;re<B.locationSize;re++)S(B.location+re,X/B.locationSize,Y,ae,X*Q,X/B.locationSize*re*Q,fe)}}else if(O!==void 0){let ae=O[$];if(ae!==void 0)switch(ae.length){case 2:i.vertexAttrib2fv(B.location,ae);break;case 3:i.vertexAttrib3fv(B.location,ae);break;case 4:i.vertexAttrib4fv(B.location,ae);break;default:i.vertexAttrib1fv(B.location,ae)}}}}v()}function I(){A();for(let _ in n){let C=n[_];for(let L in C){let U=C[L];for(let k in U)h(U[k].object),delete U[k];delete C[L]}delete n[_]}}function T(_){if(n[_.id]===void 0)return;let C=n[_.id];for(let L in C){let U=C[L];for(let k in U)h(U[k].object),delete U[k];delete C[L]}delete n[_.id]}function w(_){for(let C in n){let L=n[C];if(L[_.id]===void 0)continue;let U=L[_.id];for(let k in U)h(U[k].object),delete U[k];delete L[_.id]}}function A(){x(),a=!0,s!==r&&(s=r,u(s.object))}function x(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:o,reset:A,resetDefaultState:x,dispose:I,releaseStatesOfGeometry:T,releaseStatesOfProgram:w,initAttributes:y,enableAttribute:m,disableUnusedAttributes:v}}function Qp(i,e,t){let n;function r(u){n=u}function s(u,h){i.drawArrays(n,u,h),t.update(h,n,1)}function a(u,h,f){f!==0&&(i.drawArraysInstanced(n,u,h,f),t.update(h,n,f))}function o(u,h,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,u,0,h,0,f);let p=0;for(let g=0;g<f;g++)p+=h[g];t.update(p,n,1)}function l(u,h,f,c){if(f===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<u.length;g++)a(u[g],h[g],c[g]);else{p.multiDrawArraysInstancedWEBGL(n,u,0,h,0,c,0,f);let g=0;for(let y=0;y<f;y++)g+=h[y]*c[y];t.update(g,n,1)}}this.setMode=r,this.render=s,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function em(i,e,t,n){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){let w=e.get("EXT_texture_filter_anisotropic");r=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function a(w){return!(w!==Qt&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){let A=w===Dr&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(w!==Mn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==ln&&!A)}function l(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let u=t.precision!==void 0?t.precision:"highp",h=l(u);h!==u&&(console.warn("THREE.WebGLRenderer:",u,"not supported, using",h,"instead."),u=h);let f=t.logarithmicDepthBuffer===!0,c=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),v=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),S=i.getParameter(i.MAX_VARYING_VECTORS),b=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),I=g>0,T=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:u,logarithmicDepthBuffer:f,reverseDepthBuffer:c,maxTextures:p,maxVertexTextures:g,maxTextureSize:y,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:v,maxVaryings:S,maxFragmentUniforms:b,vertexTextures:I,maxSamples:T}}function tm(i){let e=this,t=null,n=0,r=!1,s=!1,a=new yn,o=new Fe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,c){let p=f.length!==0||c||n!==0||r;return r=c,n=f.length,p},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(f,c){t=h(f,c,0)},this.setState=function(f,c,p){let g=f.clippingPlanes,y=f.clipIntersection,m=f.clipShadows,d=i.get(f);if(!r||g===null||g.length===0||s&&!m)s?h(null):u();else{let v=s?0:n,S=v*4,b=d.clippingState||null;l.value=b,b=h(g,c,S,p);for(let I=0;I!==S;++I)b[I]=t[I];d.clippingState=b,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=v}};function u(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(f,c,p,g){let y=f!==null?f.length:0,m=null;if(y!==0){if(m=l.value,g!==!0||m===null){let d=p+y*4,v=c.matrixWorldInverse;o.getNormalMatrix(v),(m===null||m.length<d)&&(m=new Float32Array(d));for(let S=0,b=p;S!==y;++S,b+=4)a.copy(f[S]).applyMatrix4(v,o),a.normal.toArray(m,b),m[b+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,m}}function nm(i){let e=new WeakMap;function t(a,o){return o===Wa?a.mapping=Yi:o===Xa&&(a.mapping=Zi),a}function n(a){if(a&&a.isTexture){let o=a.mapping;if(o===Wa||o===Xa)if(e.has(a)){let l=e.get(a).texture;return t(l,a.mapping)}else{let l=a.image;if(l&&l.height>0){let u=new Ao(l.height);return u.fromEquirectangularTexture(i,a),e.set(a,u),a.addEventListener("dispose",r),t(u.texture,a.mapping)}else return null}}return a}function r(a){let o=a.target;o.removeEventListener("dispose",r);let l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function s(){e=new WeakMap}return{get:n,dispose:s}}var Ts=class extends Es{constructor(e=-1,t=1,n=1,r=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=n-e,a=n+e,o=r+t,l=r-t;if(this.view!==null&&this.view.enabled){let u=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=u*this.view.offsetX,a=s+u*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Oi=4,xc=[.125,.215,.35,.446,.526,.582],ai=20,Ta=new Ts,_c=new Ce,Aa=null,Ra=0,Ca=0,Ia=!1,ri=(1+Math.sqrt(5))/2,Ui=1/ri,yc=[new P(-ri,Ui,0),new P(ri,Ui,0),new P(-Ui,0,ri),new P(Ui,0,ri),new P(0,ri,-Ui),new P(0,ri,Ui),new P(-1,1,-1),new P(1,1,-1),new P(-1,1,1),new P(1,1,1)],As=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100){Aa=this._renderer.getRenderTarget(),Ra=this._renderer.getActiveCubeFace(),Ca=this._renderer.getActiveMipmapLevel(),Ia=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Mc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=vc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Aa,Ra,Ca),this._renderer.xr.enabled=Ia,e.scissorTest=!1,ss(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Yi||e.mapping===Zi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Aa=this._renderer.getRenderTarget(),Ra=this._renderer.getActiveCubeFace(),Ca=this._renderer.getActiveMipmapLevel(),Ia=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:on,minFilter:on,generateMipmaps:!1,type:Dr,format:Qt,colorSpace:er,depthBuffer:!1},r=bc(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=bc(e,t,n);let{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=im(s)),this._blurMaterial=rm(s,e,t)}return r}_compileMaterial(e){let t=new it(this._lodPlanes[0],e);this._renderer.compile(t,Ta)}_sceneToCubeUV(e,t,n,r){let o=new Tt(90,1,t,n),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,f=h.autoClear,c=h.toneMapping;h.getClearColor(_c),h.toneMapping=Bn,h.autoClear=!1;let p=new en({name:"PMREM.Background",side:Ut,depthWrite:!1,depthTest:!1}),g=new it(new mt,p),y=!1,m=e.background;m?m.isColor&&(p.color.copy(m),e.background=null,y=!0):(p.color.copy(_c),y=!0);for(let d=0;d<6;d++){let v=d%3;v===0?(o.up.set(0,l[d],0),o.lookAt(u[d],0,0)):v===1?(o.up.set(0,0,l[d]),o.lookAt(0,u[d],0)):(o.up.set(0,l[d],0),o.lookAt(0,0,u[d]));let S=this._cubeSize;ss(r,v*S,d>2?S:0,S,S),h.setRenderTarget(r),y&&h.render(g,o),h.render(e,o)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=c,h.autoClear=f,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===Yi||e.mapping===Zi;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Mc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=vc());let s=r?this._cubemapMaterial:this._equirectMaterial,a=new it(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;let l=this._cubeSize;ss(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,Ta)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let s=1;s<r;s++){let a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=yc[(r-s-1)%yc.length];this._blur(e,s-1,s,a,o)}t.autoClear=n}_blur(e,t,n,r,s){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,"latitudinal",s),this._halfBlur(a,e,n,n,r,"longitudinal",s)}_halfBlur(e,t,n,r,s,a,o){let l=this._renderer,u=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,f=new it(this._lodPlanes[r],u),c=u.uniforms,p=this._sizeLods[n]-1,g=isFinite(s)?Math.PI/(2*p):2*Math.PI/(2*ai-1),y=s/g,m=isFinite(s)?1+Math.floor(h*y):ai;m>ai&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ai}`);let d=[],v=0;for(let w=0;w<ai;++w){let A=w/y,x=Math.exp(-A*A/2);d.push(x),w===0?v+=x:w<m&&(v+=2*x)}for(let w=0;w<d.length;w++)d[w]=d[w]/v;c.envMap.value=e.texture,c.samples.value=m,c.weights.value=d,c.latitudinal.value=a==="latitudinal",o&&(c.poleAxis.value=o);let{_lodMax:S}=this;c.dTheta.value=g,c.mipInt.value=S-n;let b=this._sizeLods[r],I=3*b*(r>S-Oi?r-S+Oi:0),T=4*(this._cubeSize-b);ss(t,I,T,3*b,2*b),l.setRenderTarget(t),l.render(f,Ta)}};function im(i){let e=[],t=[],n=[],r=i,s=i-Oi+1+xc.length;for(let a=0;a<s;a++){let o=Math.pow(2,r);t.push(o);let l=1/o;a>i-Oi?l=xc[a-i+Oi-1]:a===0&&(l=0),n.push(l);let u=1/(o-2),h=-u,f=1+u,c=[h,h,f,h,f,f,h,h,f,f,h,f],p=6,g=6,y=3,m=2,d=1,v=new Float32Array(y*g*p),S=new Float32Array(m*g*p),b=new Float32Array(d*g*p);for(let T=0;T<p;T++){let w=T%3*2/3-1,A=T>2?0:-1,x=[w,A,0,w+2/3,A,0,w+2/3,A+1,0,w,A,0,w+2/3,A+1,0,w,A+1,0];v.set(x,y*g*T),S.set(c,m*g*T);let _=[T,T,T,T,T,T];b.set(_,d*g*T)}let I=new pt;I.setAttribute("position",new xt(v,y)),I.setAttribute("uv",new xt(S,m)),I.setAttribute("faceIndex",new xt(b,d)),e.push(I),r>Oi&&r--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function bc(i,e,t){let n=new Sn(i,e,t);return n.texture.mapping=Ws,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ss(i,e,t,n,r){i.viewport.set(e,t,n,r),i.scissor.set(e,t,n,r)}function rm(i,e,t){let n=new Float32Array(ai),r=new P(0,1,0);return new Bt({name:"SphericalGaussianBlur",defines:{n:ai,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:cl(),fragmentShader:`

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
		`,blending:kn,depthTest:!1,depthWrite:!1})}function vc(){return new Bt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:cl(),fragmentShader:`

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
		`,blending:kn,depthTest:!1,depthWrite:!1})}function Mc(){return new Bt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:cl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:kn,depthTest:!1,depthWrite:!1})}function cl(){return`

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
	`}function sm(i){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){let l=o.mapping,u=l===Wa||l===Xa,h=l===Yi||l===Zi;if(u||h){let f=e.get(o),c=f!==void 0?f.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==c)return t===null&&(t=new As(i)),f=u?t.fromEquirectangular(o,f):t.fromCubemap(o,f),f.texture.pmremVersion=o.pmremVersion,e.set(o,f),f.texture;if(f!==void 0)return f.texture;{let p=o.image;return u&&p&&p.height>0||h&&p&&r(p)?(t===null&&(t=new As(i)),f=u?t.fromEquirectangular(o):t.fromCubemap(o),f.texture.pmremVersion=o.pmremVersion,e.set(o,f),o.addEventListener("dispose",s),f.texture):null}}}return o}function r(o){let l=0,u=6;for(let h=0;h<u;h++)o[h]!==void 0&&l++;return l===u}function s(o){let l=o.target;l.removeEventListener("dispose",s);let u=e.get(l);u!==void 0&&(e.delete(l),u.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function am(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let r;switch(n){case"WEBGL_depth_texture":r=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=i.getExtension(n)}return e[n]=r,r}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let r=t(n);return r===null&&br("THREE.WebGLRenderer: "+n+" extension not supported."),r}}}function om(i,e,t,n){let r={},s=new WeakMap;function a(f){let c=f.target;c.index!==null&&e.remove(c.index);for(let g in c.attributes)e.remove(c.attributes[g]);for(let g in c.morphAttributes){let y=c.morphAttributes[g];for(let m=0,d=y.length;m<d;m++)e.remove(y[m])}c.removeEventListener("dispose",a),delete r[c.id];let p=s.get(c);p&&(e.remove(p),s.delete(c)),n.releaseStatesOfGeometry(c),c.isInstancedBufferGeometry===!0&&delete c._maxInstanceCount,t.memory.geometries--}function o(f,c){return r[c.id]===!0||(c.addEventListener("dispose",a),r[c.id]=!0,t.memory.geometries++),c}function l(f){let c=f.attributes;for(let g in c)e.update(c[g],i.ARRAY_BUFFER);let p=f.morphAttributes;for(let g in p){let y=p[g];for(let m=0,d=y.length;m<d;m++)e.update(y[m],i.ARRAY_BUFFER)}}function u(f){let c=[],p=f.index,g=f.attributes.position,y=0;if(p!==null){let v=p.array;y=p.version;for(let S=0,b=v.length;S<b;S+=3){let I=v[S+0],T=v[S+1],w=v[S+2];c.push(I,T,T,w,w,I)}}else if(g!==void 0){let v=g.array;y=g.version;for(let S=0,b=v.length/3-1;S<b;S+=3){let I=S+0,T=S+1,w=S+2;c.push(I,T,T,w,w,I)}}else return;let m=new(uh(c)?Ss:Ms)(c,1);m.version=y;let d=s.get(f);d&&e.remove(d),s.set(f,m)}function h(f){let c=s.get(f);if(c){let p=f.index;p!==null&&c.version<p.version&&u(f)}else u(f);return s.get(f)}return{get:o,update:l,getWireframeAttribute:h}}function lm(i,e,t){let n;function r(c){n=c}let s,a;function o(c){s=c.type,a=c.bytesPerElement}function l(c,p){i.drawElements(n,p,s,c*a),t.update(p,n,1)}function u(c,p,g){g!==0&&(i.drawElementsInstanced(n,p,s,c*a,g),t.update(p,n,g))}function h(c,p,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,s,c,0,g);let m=0;for(let d=0;d<g;d++)m+=p[d];t.update(m,n,1)}function f(c,p,g,y){if(g===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<c.length;d++)u(c[d]/a,p[d],y[d]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,s,c,0,y,0,g);let d=0;for(let v=0;v<g;v++)d+=p[v]*y[v];t.update(d,n,1)}}this.setMode=r,this.setIndex=o,this.render=l,this.renderInstances=u,this.renderMultiDraw=h,this.renderMultiDrawInstances=f}function cm(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(s/3);break;case i.LINES:t.lines+=o*(s/2);break;case i.LINE_STRIP:t.lines+=o*(s-1);break;case i.LINE_LOOP:t.lines+=o*s;break;case i.POINTS:t.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:n}}function hm(i,e,t){let n=new WeakMap,r=new nt;function s(a,o,l){let u=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=h!==void 0?h.length:0,c=n.get(o);if(c===void 0||c.count!==f){let x=function(){w.dispose(),n.delete(o),o.removeEventListener("dispose",x)};c!==void 0&&c.texture.dispose();let p=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,y=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],d=o.morphAttributes.normal||[],v=o.morphAttributes.color||[],S=0;p===!0&&(S=1),g===!0&&(S=2),y===!0&&(S=3);let b=o.attributes.position.count*S,I=1;b>e.maxTextureSize&&(I=Math.ceil(b/e.maxTextureSize),b=e.maxTextureSize);let T=new Float32Array(b*I*4*f),w=new bs(T,b,I,f);w.type=ln,w.needsUpdate=!0;let A=S*4;for(let _=0;_<f;_++){let C=m[_],L=d[_],U=v[_],k=b*I*4*_;for(let W=0;W<C.count;W++){let O=W*A;p===!0&&(r.fromBufferAttribute(C,W),T[k+O+0]=r.x,T[k+O+1]=r.y,T[k+O+2]=r.z,T[k+O+3]=0),g===!0&&(r.fromBufferAttribute(L,W),T[k+O+4]=r.x,T[k+O+5]=r.y,T[k+O+6]=r.z,T[k+O+7]=0),y===!0&&(r.fromBufferAttribute(U,W),T[k+O+8]=r.x,T[k+O+9]=r.y,T[k+O+10]=r.z,T[k+O+11]=U.itemSize===4?r.w:1)}}c={count:f,texture:w,size:new Ee(b,I)},n.set(o,c),o.addEventListener("dispose",x)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let p=0;for(let y=0;y<u.length;y++)p+=u[y];let g=o.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",u)}l.getUniforms().setValue(i,"morphTargetsTexture",c.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",c.size)}return{update:s}}function um(i,e,t,n){let r=new WeakMap;function s(l){let u=n.render.frame,h=l.geometry,f=e.get(l,h);if(r.get(f)!==u&&(e.update(f),r.set(f,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),r.get(l)!==u&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,u))),l.isSkinnedMesh){let c=l.skeleton;r.get(c)!==u&&(c.update(),r.set(c,u))}return f}function a(){r=new WeakMap}function o(l){let u=l.target;u.removeEventListener("dispose",o),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:s,dispose:a}}var Rs=class extends Pt{constructor(e,t,n,r,s,a,o,l,u,h=Vi){if(h!==Vi&&h!==Ki)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Vi&&(n=ci),n===void 0&&h===Ki&&(n=$i),super(null,r,s,a,o,l,h,n,u),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o!==void 0?o:kt,this.minFilter=l!==void 0?l:kt,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},mh=new Pt,Sc=new Rs(1,1),gh=new bs,xh=new wo,_h=new ws,Ec=[],wc=[],Tc=new Float32Array(16),Ac=new Float32Array(9),Rc=new Float32Array(4);function tr(i,e,t){let n=i[0];if(n<=0||n>0)return i;let r=e*t,s=Ec[r];if(s===void 0&&(s=new Float32Array(r),Ec[r]=s),e!==0){n.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(s,o)}return s}function yt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function bt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function qs(i,e){let t=wc[e];t===void 0&&(t=new Int32Array(e),wc[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function dm(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function fm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;i.uniform2fv(this.addr,e),bt(t,e)}}function pm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(yt(t,e))return;i.uniform3fv(this.addr,e),bt(t,e)}}function mm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;i.uniform4fv(this.addr,e),bt(t,e)}}function gm(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),bt(t,e)}else{if(yt(t,n))return;Rc.set(n),i.uniformMatrix2fv(this.addr,!1,Rc),bt(t,n)}}function xm(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),bt(t,e)}else{if(yt(t,n))return;Ac.set(n),i.uniformMatrix3fv(this.addr,!1,Ac),bt(t,n)}}function _m(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(yt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),bt(t,e)}else{if(yt(t,n))return;Tc.set(n),i.uniformMatrix4fv(this.addr,!1,Tc),bt(t,n)}}function ym(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function bm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;i.uniform2iv(this.addr,e),bt(t,e)}}function vm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(yt(t,e))return;i.uniform3iv(this.addr,e),bt(t,e)}}function Mm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;i.uniform4iv(this.addr,e),bt(t,e)}}function Sm(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Em(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(yt(t,e))return;i.uniform2uiv(this.addr,e),bt(t,e)}}function wm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(yt(t,e))return;i.uniform3uiv(this.addr,e),bt(t,e)}}function Tm(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(yt(t,e))return;i.uniform4uiv(this.addr,e),bt(t,e)}}function Am(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s;this.type===i.SAMPLER_2D_SHADOW?(Sc.compareFunction=hh,s=Sc):s=mh,t.setTexture2D(e||s,r)}function Rm(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture3D(e||xh,r)}function Cm(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTextureCube(e||_h,r)}function Im(i,e,t){let n=this.cache,r=t.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),t.setTexture2DArray(e||gh,r)}function Pm(i){switch(i){case 5126:return dm;case 35664:return fm;case 35665:return pm;case 35666:return mm;case 35674:return gm;case 35675:return xm;case 35676:return _m;case 5124:case 35670:return ym;case 35667:case 35671:return bm;case 35668:case 35672:return vm;case 35669:case 35673:return Mm;case 5125:return Sm;case 36294:return Em;case 36295:return wm;case 36296:return Tm;case 35678:case 36198:case 36298:case 36306:case 35682:return Am;case 35679:case 36299:case 36307:return Rm;case 35680:case 36300:case 36308:case 36293:return Cm;case 36289:case 36303:case 36311:case 36292:return Im}}function Lm(i,e){i.uniform1fv(this.addr,e)}function Dm(i,e){let t=tr(e,this.size,2);i.uniform2fv(this.addr,t)}function Um(i,e){let t=tr(e,this.size,3);i.uniform3fv(this.addr,t)}function Nm(i,e){let t=tr(e,this.size,4);i.uniform4fv(this.addr,t)}function zm(i,e){let t=tr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Fm(i,e){let t=tr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function km(i,e){let t=tr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Bm(i,e){i.uniform1iv(this.addr,e)}function Om(i,e){i.uniform2iv(this.addr,e)}function Hm(i,e){i.uniform3iv(this.addr,e)}function Vm(i,e){i.uniform4iv(this.addr,e)}function Gm(i,e){i.uniform1uiv(this.addr,e)}function Wm(i,e){i.uniform2uiv(this.addr,e)}function Xm(i,e){i.uniform3uiv(this.addr,e)}function qm(i,e){i.uniform4uiv(this.addr,e)}function Ym(i,e,t){let n=this.cache,r=e.length,s=qs(t,r);yt(n,s)||(i.uniform1iv(this.addr,s),bt(n,s));for(let a=0;a!==r;++a)t.setTexture2D(e[a]||mh,s[a])}function Zm(i,e,t){let n=this.cache,r=e.length,s=qs(t,r);yt(n,s)||(i.uniform1iv(this.addr,s),bt(n,s));for(let a=0;a!==r;++a)t.setTexture3D(e[a]||xh,s[a])}function $m(i,e,t){let n=this.cache,r=e.length,s=qs(t,r);yt(n,s)||(i.uniform1iv(this.addr,s),bt(n,s));for(let a=0;a!==r;++a)t.setTextureCube(e[a]||_h,s[a])}function Km(i,e,t){let n=this.cache,r=e.length,s=qs(t,r);yt(n,s)||(i.uniform1iv(this.addr,s),bt(n,s));for(let a=0;a!==r;++a)t.setTexture2DArray(e[a]||gh,s[a])}function Jm(i){switch(i){case 5126:return Lm;case 35664:return Dm;case 35665:return Um;case 35666:return Nm;case 35674:return zm;case 35675:return Fm;case 35676:return km;case 5124:case 35670:return Bm;case 35667:case 35671:return Om;case 35668:case 35672:return Hm;case 35669:case 35673:return Vm;case 5125:return Gm;case 36294:return Wm;case 36295:return Xm;case 36296:return qm;case 35678:case 36198:case 36298:case 36306:case 35682:return Ym;case 35679:case 36299:case 36307:return Zm;case 35680:case 36300:case 36308:case 36293:return $m;case 36289:case 36303:case 36311:case 36292:return Km}}var Ro=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Pm(t.type)}},Co=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Jm(t.type)}},Io=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let s=0,a=r.length;s!==a;++s){let o=r[s];o.setValue(e,t[o.id],n)}}},Pa=/(\w+)(\])?(\[|\.)?/g;function Cc(i,e){i.seq.push(e),i.map[e.id]=e}function jm(i,e,t){let n=i.name,r=n.length;for(Pa.lastIndex=0;;){let s=Pa.exec(n),a=Pa.lastIndex,o=s[1],l=s[2]==="]",u=s[3];if(l&&(o=o|0),u===void 0||u==="["&&a+2===r){Cc(t,u===void 0?new Ro(o,i,e):new Co(o,i,e));break}else{let f=t.map[o];f===void 0&&(f=new Io(o),Cc(t,f)),t=f}}}var Wi=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let s=e.getActiveUniform(t,r),a=e.getUniformLocation(t,s.name);jm(s,a,this)}}setValue(e,t,n,r){let s=this.map[t];s!==void 0&&s.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let s=0,a=t.length;s!==a;++s){let o=t[s],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,s=e.length;r!==s;++r){let a=e[r];a.id in t&&n.push(a)}return n}};function Ic(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var Qm=37297,e0=0;function t0(i,e){let t=i.split(`
`),n=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let a=r;a<s;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var Pc=new Fe;function n0(i){Ze._getMatrix(Pc,Ze.workingColorSpace,i);let e=`mat3( ${Pc.elements.map(t=>t.toFixed(4))} )`;switch(Ze.getTransfer(i)){case Xs:return[e,"LinearTransferOETF"];case et:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Lc(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=i.getShaderInfoLog(e).trim();if(n&&r==="")return"";let s=/ERROR: 0:(\d+)/.exec(r);if(s){let a=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+t0(i.getShaderSource(e),a)}else return r}function i0(i,e){let t=n0(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function r0(i,e){let t;switch(e){case Cu:t="Linear";break;case Iu:t="Reinhard";break;case Pu:t="Cineon";break;case tl:t="ACESFilmic";break;case Du:t="AgX";break;case Uu:t="Neutral";break;case Lu:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var as=new P;function s0(){Ze.getLuminanceCoefficients(as);let i=as.x.toFixed(4),e=as.y.toFixed(4),t=as.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function a0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(vr).join(`
`)}function o0(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function l0(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){let s=i.getActiveAttrib(e,r),a=s.name,o=1;s.type===i.FLOAT_MAT2&&(o=2),s.type===i.FLOAT_MAT3&&(o=3),s.type===i.FLOAT_MAT4&&(o=4),t[a]={type:s.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function vr(i){return i!==""}function Dc(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Uc(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var c0=/^[ \t]*#include +<([\w\d./]+)>/gm;function Po(i){return i.replace(c0,u0)}var h0=new Map;function u0(i,e){let t=Be[e];if(t===void 0){let n=h0.get(e);if(n!==void 0)t=Be[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Po(t)}var d0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Nc(i){return i.replace(d0,f0)}function f0(i,e,t,n){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function zc(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}function p0(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===jc?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Qo?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===_n&&(e="SHADOWMAP_TYPE_VSM"),e}function m0(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Yi:case Zi:e="ENVMAP_TYPE_CUBE";break;case Ws:e="ENVMAP_TYPE_CUBE_UV";break}return e}function g0(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Zi:e="ENVMAP_MODE_REFRACTION";break}return e}function x0(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case el:e="ENVMAP_BLENDING_MULTIPLY";break;case Au:e="ENVMAP_BLENDING_MIX";break;case Ru:e="ENVMAP_BLENDING_ADD";break}return e}function _0(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function y0(i,e,t,n){let r=i.getContext(),s=t.defines,a=t.vertexShader,o=t.fragmentShader,l=p0(t),u=m0(t),h=g0(t),f=x0(t),c=_0(t),p=a0(t),g=o0(s),y=r.createProgram(),m,d,v=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(vr).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(vr).join(`
`),d.length>0&&(d+=`
`)):(m=[zc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(vr).join(`
`),d=[zc(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.envMap?"#define "+h:"",t.envMap?"#define "+f:"",c?"#define CUBEUV_TEXEL_WIDTH "+c.texelWidth:"",c?"#define CUBEUV_TEXEL_HEIGHT "+c.texelHeight:"",c?"#define CUBEUV_MAX_MIP "+c.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Bn?"#define TONE_MAPPING":"",t.toneMapping!==Bn?Be.tonemapping_pars_fragment:"",t.toneMapping!==Bn?r0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Be.colorspace_pars_fragment,i0("linearToOutputTexel",t.outputColorSpace),s0(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(vr).join(`
`)),a=Po(a),a=Dc(a,t),a=Uc(a,t),o=Po(o),o=Dc(o,t),o=Uc(o,t),a=Nc(a),o=Nc(o),t.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",t.glslVersion===Kl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Kl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);let S=v+m+a,b=v+d+o,I=Ic(r,r.VERTEX_SHADER,S),T=Ic(r,r.FRAGMENT_SHADER,b);r.attachShader(y,I),r.attachShader(y,T),t.index0AttributeName!==void 0?r.bindAttribLocation(y,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(y,0,"position"),r.linkProgram(y);function w(C){if(i.debug.checkShaderErrors){let L=r.getProgramInfoLog(y).trim(),U=r.getShaderInfoLog(I).trim(),k=r.getShaderInfoLog(T).trim(),W=!0,O=!0;if(r.getProgramParameter(y,r.LINK_STATUS)===!1)if(W=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,y,I,T);else{let $=Lc(r,I,"vertex"),B=Lc(r,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(y,r.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+L+`
`+$+`
`+B)}else L!==""?console.warn("THREE.WebGLProgram: Program Info Log:",L):(U===""||k==="")&&(O=!1);O&&(C.diagnostics={runnable:W,programLog:L,vertexShader:{log:U,prefix:m},fragmentShader:{log:k,prefix:d}})}r.deleteShader(I),r.deleteShader(T),A=new Wi(r,y),x=l0(r,y)}let A;this.getUniforms=function(){return A===void 0&&w(this),A};let x;this.getAttributes=function(){return x===void 0&&w(this),x};let _=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return _===!1&&(_=r.getProgramParameter(y,Qm)),_},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=e0++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=I,this.fragmentShader=T,this}var b0=0,Lo=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Do(e),t.set(e,n)),n}},Do=class{constructor(e){this.id=b0++,this.code=e,this.usedTimes=0}};function v0(i,e,t,n,r,s,a){let o=new wr,l=new Lo,u=new Set,h=[],f=r.logarithmicDepthBuffer,c=r.vertexTextures,p=r.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function y(x){return u.add(x),x===0?"uv":`uv${x}`}function m(x,_,C,L,U){let k=L.fog,W=U.geometry,O=x.isMeshStandardMaterial?L.environment:null,$=(x.isMeshStandardMaterial?t:e).get(x.envMap||O),B=$&&$.mapping===Ws?$.image.height:null,ee=g[x.type];x.precision!==null&&(p=r.getMaxPrecision(x.precision),p!==x.precision&&console.warn("THREE.WebGLProgram.getParameters:",x.precision,"not supported, using",p,"instead."));let ae=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,X=ae!==void 0?ae.length:0,se=0;W.morphAttributes.position!==void 0&&(se=1),W.morphAttributes.normal!==void 0&&(se=2),W.morphAttributes.color!==void 0&&(se=3);let Ie,Y,Q,fe;if(ee){let je=sn[ee];Ie=je.vertexShader,Y=je.fragmentShader}else Ie=x.vertexShader,Y=x.fragmentShader,l.update(x),Q=l.getVertexShaderID(x),fe=l.getFragmentShaderID(x);let re=i.getRenderTarget(),be=i.state.buffers.depth.getReversed(),Te=U.isInstancedMesh===!0,Ue=U.isBatchedMesh===!0,ut=!!x.map,qe=!!x.matcap,ft=!!$,F=!!x.aoMap,Ot=!!x.lightMap,Ge=!!x.bumpMap,We=!!x.normalMap,Ae=!!x.displacementMap,at=!!x.emissiveMap,we=!!x.metalnessMap,R=!!x.roughnessMap,M=x.anisotropy>0,H=x.clearcoat>0,K=x.dispersion>0,j=x.iridescence>0,Z=x.sheen>0,ve=x.transmission>0,ce=M&&!!x.anisotropyMap,pe=H&&!!x.clearcoatMap,Ye=H&&!!x.clearcoatNormalMap,te=H&&!!x.clearcoatRoughnessMap,me=j&&!!x.iridescenceMap,Re=j&&!!x.iridescenceThicknessMap,Pe=Z&&!!x.sheenColorMap,ge=Z&&!!x.sheenRoughnessMap,Xe=!!x.specularMap,ke=!!x.specularColorMap,rt=!!x.specularIntensityMap,D=ve&&!!x.transmissionMap,le=ve&&!!x.thicknessMap,q=!!x.gradientMap,J=!!x.alphaMap,de=x.alphaTest>0,he=!!x.alphaHash,Ne=!!x.extensions,dt=Bn;x.toneMapped&&(re===null||re.isXRRenderTarget===!0)&&(dt=i.toneMapping);let St={shaderID:ee,shaderType:x.type,shaderName:x.name,vertexShader:Ie,fragmentShader:Y,defines:x.defines,customVertexShaderID:Q,customFragmentShaderID:fe,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:p,batching:Ue,batchingColor:Ue&&U._colorsTexture!==null,instancing:Te,instancingColor:Te&&U.instanceColor!==null,instancingMorph:Te&&U.morphTexture!==null,supportsVertexTextures:c,outputColorSpace:re===null?i.outputColorSpace:re.isXRRenderTarget===!0?re.texture.colorSpace:er,alphaToCoverage:!!x.alphaToCoverage,map:ut,matcap:qe,envMap:ft,envMapMode:ft&&$.mapping,envMapCubeUVHeight:B,aoMap:F,lightMap:Ot,bumpMap:Ge,normalMap:We,displacementMap:c&&Ae,emissiveMap:at,normalMapObjectSpace:We&&x.normalMapType===ku,normalMapTangentSpace:We&&x.normalMapType===ch,metalnessMap:we,roughnessMap:R,anisotropy:M,anisotropyMap:ce,clearcoat:H,clearcoatMap:pe,clearcoatNormalMap:Ye,clearcoatRoughnessMap:te,dispersion:K,iridescence:j,iridescenceMap:me,iridescenceThicknessMap:Re,sheen:Z,sheenColorMap:Pe,sheenRoughnessMap:ge,specularMap:Xe,specularColorMap:ke,specularIntensityMap:rt,transmission:ve,transmissionMap:D,thicknessMap:le,gradientMap:q,opaque:x.transparent===!1&&x.blending===Hi&&x.alphaToCoverage===!1,alphaMap:J,alphaTest:de,alphaHash:he,combine:x.combine,mapUv:ut&&y(x.map.channel),aoMapUv:F&&y(x.aoMap.channel),lightMapUv:Ot&&y(x.lightMap.channel),bumpMapUv:Ge&&y(x.bumpMap.channel),normalMapUv:We&&y(x.normalMap.channel),displacementMapUv:Ae&&y(x.displacementMap.channel),emissiveMapUv:at&&y(x.emissiveMap.channel),metalnessMapUv:we&&y(x.metalnessMap.channel),roughnessMapUv:R&&y(x.roughnessMap.channel),anisotropyMapUv:ce&&y(x.anisotropyMap.channel),clearcoatMapUv:pe&&y(x.clearcoatMap.channel),clearcoatNormalMapUv:Ye&&y(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:te&&y(x.clearcoatRoughnessMap.channel),iridescenceMapUv:me&&y(x.iridescenceMap.channel),iridescenceThicknessMapUv:Re&&y(x.iridescenceThicknessMap.channel),sheenColorMapUv:Pe&&y(x.sheenColorMap.channel),sheenRoughnessMapUv:ge&&y(x.sheenRoughnessMap.channel),specularMapUv:Xe&&y(x.specularMap.channel),specularColorMapUv:ke&&y(x.specularColorMap.channel),specularIntensityMapUv:rt&&y(x.specularIntensityMap.channel),transmissionMapUv:D&&y(x.transmissionMap.channel),thicknessMapUv:le&&y(x.thicknessMap.channel),alphaMapUv:J&&y(x.alphaMap.channel),vertexTangents:!!W.attributes.tangent&&(We||M),vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,pointsUvs:U.isPoints===!0&&!!W.attributes.uv&&(ut||J),fog:!!k,useFog:x.fog===!0,fogExp2:!!k&&k.isFogExp2,flatShading:x.flatShading===!0,sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:f,reverseDepthBuffer:be,skinning:U.isSkinnedMesh===!0,morphTargets:W.morphAttributes.position!==void 0,morphNormals:W.morphAttributes.normal!==void 0,morphColors:W.morphAttributes.color!==void 0,morphTargetsCount:X,morphTextureStride:se,numDirLights:_.directional.length,numPointLights:_.point.length,numSpotLights:_.spot.length,numSpotLightMaps:_.spotLightMap.length,numRectAreaLights:_.rectArea.length,numHemiLights:_.hemi.length,numDirLightShadows:_.directionalShadowMap.length,numPointLightShadows:_.pointShadowMap.length,numSpotLightShadows:_.spotShadowMap.length,numSpotLightShadowsWithMaps:_.numSpotLightShadowsWithMaps,numLightProbes:_.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&C.length>0,shadowMapType:i.shadowMap.type,toneMapping:dt,decodeVideoTexture:ut&&x.map.isVideoTexture===!0&&Ze.getTransfer(x.map.colorSpace)===et,decodeVideoTextureEmissive:at&&x.emissiveMap.isVideoTexture===!0&&Ze.getTransfer(x.emissiveMap.colorSpace)===et,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===jt,flipSided:x.side===Ut,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:Ne&&x.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ne&&x.extensions.multiDraw===!0||Ue)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return St.vertexUv1s=u.has(1),St.vertexUv2s=u.has(2),St.vertexUv3s=u.has(3),u.clear(),St}function d(x){let _=[];if(x.shaderID?_.push(x.shaderID):(_.push(x.customVertexShaderID),_.push(x.customFragmentShaderID)),x.defines!==void 0)for(let C in x.defines)_.push(C),_.push(x.defines[C]);return x.isRawShaderMaterial===!1&&(v(_,x),S(_,x),_.push(i.outputColorSpace)),_.push(x.customProgramCacheKey),_.join()}function v(x,_){x.push(_.precision),x.push(_.outputColorSpace),x.push(_.envMapMode),x.push(_.envMapCubeUVHeight),x.push(_.mapUv),x.push(_.alphaMapUv),x.push(_.lightMapUv),x.push(_.aoMapUv),x.push(_.bumpMapUv),x.push(_.normalMapUv),x.push(_.displacementMapUv),x.push(_.emissiveMapUv),x.push(_.metalnessMapUv),x.push(_.roughnessMapUv),x.push(_.anisotropyMapUv),x.push(_.clearcoatMapUv),x.push(_.clearcoatNormalMapUv),x.push(_.clearcoatRoughnessMapUv),x.push(_.iridescenceMapUv),x.push(_.iridescenceThicknessMapUv),x.push(_.sheenColorMapUv),x.push(_.sheenRoughnessMapUv),x.push(_.specularMapUv),x.push(_.specularColorMapUv),x.push(_.specularIntensityMapUv),x.push(_.transmissionMapUv),x.push(_.thicknessMapUv),x.push(_.combine),x.push(_.fogExp2),x.push(_.sizeAttenuation),x.push(_.morphTargetsCount),x.push(_.morphAttributeCount),x.push(_.numDirLights),x.push(_.numPointLights),x.push(_.numSpotLights),x.push(_.numSpotLightMaps),x.push(_.numHemiLights),x.push(_.numRectAreaLights),x.push(_.numDirLightShadows),x.push(_.numPointLightShadows),x.push(_.numSpotLightShadows),x.push(_.numSpotLightShadowsWithMaps),x.push(_.numLightProbes),x.push(_.shadowMapType),x.push(_.toneMapping),x.push(_.numClippingPlanes),x.push(_.numClipIntersection),x.push(_.depthPacking)}function S(x,_){o.disableAll(),_.supportsVertexTextures&&o.enable(0),_.instancing&&o.enable(1),_.instancingColor&&o.enable(2),_.instancingMorph&&o.enable(3),_.matcap&&o.enable(4),_.envMap&&o.enable(5),_.normalMapObjectSpace&&o.enable(6),_.normalMapTangentSpace&&o.enable(7),_.clearcoat&&o.enable(8),_.iridescence&&o.enable(9),_.alphaTest&&o.enable(10),_.vertexColors&&o.enable(11),_.vertexAlphas&&o.enable(12),_.vertexUv1s&&o.enable(13),_.vertexUv2s&&o.enable(14),_.vertexUv3s&&o.enable(15),_.vertexTangents&&o.enable(16),_.anisotropy&&o.enable(17),_.alphaHash&&o.enable(18),_.batching&&o.enable(19),_.dispersion&&o.enable(20),_.batchingColor&&o.enable(21),x.push(o.mask),o.disableAll(),_.fog&&o.enable(0),_.useFog&&o.enable(1),_.flatShading&&o.enable(2),_.logarithmicDepthBuffer&&o.enable(3),_.reverseDepthBuffer&&o.enable(4),_.skinning&&o.enable(5),_.morphTargets&&o.enable(6),_.morphNormals&&o.enable(7),_.morphColors&&o.enable(8),_.premultipliedAlpha&&o.enable(9),_.shadowMapEnabled&&o.enable(10),_.doubleSided&&o.enable(11),_.flipSided&&o.enable(12),_.useDepthPacking&&o.enable(13),_.dithering&&o.enable(14),_.transmission&&o.enable(15),_.sheen&&o.enable(16),_.opaque&&o.enable(17),_.pointsUvs&&o.enable(18),_.decodeVideoTexture&&o.enable(19),_.decodeVideoTextureEmissive&&o.enable(20),_.alphaToCoverage&&o.enable(21),x.push(o.mask)}function b(x){let _=g[x.type],C;if(_){let L=sn[_];C=hd.clone(L.uniforms)}else C=x.uniforms;return C}function I(x,_){let C;for(let L=0,U=h.length;L<U;L++){let k=h[L];if(k.cacheKey===_){C=k,++C.usedTimes;break}}return C===void 0&&(C=new y0(i,_,x,s),h.push(C)),C}function T(x){if(--x.usedTimes===0){let _=h.indexOf(x);h[_]=h[h.length-1],h.pop(),x.destroy()}}function w(x){l.remove(x)}function A(){l.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:b,acquireProgram:I,releaseProgram:T,releaseShaderCache:w,programs:h,dispose:A}}function M0(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function r(a,o,l){i.get(a)[o]=l}function s(){i=new WeakMap}return{has:e,get:t,remove:n,update:r,dispose:s}}function S0(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function Fc(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function kc(){let i=[],e=0,t=[],n=[],r=[];function s(){e=0,t.length=0,n.length=0,r.length=0}function a(f,c,p,g,y,m){let d=i[e];return d===void 0?(d={id:f.id,object:f,geometry:c,material:p,groupOrder:g,renderOrder:f.renderOrder,z:y,group:m},i[e]=d):(d.id=f.id,d.object=f,d.geometry=c,d.material=p,d.groupOrder=g,d.renderOrder=f.renderOrder,d.z=y,d.group=m),e++,d}function o(f,c,p,g,y,m){let d=a(f,c,p,g,y,m);p.transmission>0?n.push(d):p.transparent===!0?r.push(d):t.push(d)}function l(f,c,p,g,y,m){let d=a(f,c,p,g,y,m);p.transmission>0?n.unshift(d):p.transparent===!0?r.unshift(d):t.unshift(d)}function u(f,c){t.length>1&&t.sort(f||S0),n.length>1&&n.sort(c||Fc),r.length>1&&r.sort(c||Fc)}function h(){for(let f=e,c=i.length;f<c;f++){let p=i[f];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:r,init:s,push:o,unshift:l,finish:h,sort:u}}function E0(){let i=new WeakMap;function e(n,r){let s=i.get(n),a;return s===void 0?(a=new kc,i.set(n,[a])):r>=s.length?(a=new kc,s.push(a)):a=s[r],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function w0(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new P,color:new Ce};break;case"SpotLight":t={position:new P,direction:new P,color:new Ce,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new Ce,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new Ce,groundColor:new Ce};break;case"RectAreaLight":t={color:new Ce,position:new P,halfWidth:new P,halfHeight:new P};break}return i[e.id]=t,t}}}function T0(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ee};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ee};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ee,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var A0=0;function R0(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function C0(i){let e=new w0,t=T0(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let u=0;u<9;u++)n.probe.push(new P);let r=new P,s=new De,a=new De;function o(u){let h=0,f=0,c=0;for(let x=0;x<9;x++)n.probe[x].set(0,0,0);let p=0,g=0,y=0,m=0,d=0,v=0,S=0,b=0,I=0,T=0,w=0;u.sort(R0);for(let x=0,_=u.length;x<_;x++){let C=u[x],L=C.color,U=C.intensity,k=C.distance,W=C.shadow&&C.shadow.map?C.shadow.map.texture:null;if(C.isAmbientLight)h+=L.r*U,f+=L.g*U,c+=L.b*U;else if(C.isLightProbe){for(let O=0;O<9;O++)n.probe[O].addScaledVector(C.sh.coefficients[O],U);w++}else if(C.isDirectionalLight){let O=e.get(C);if(O.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let $=C.shadow,B=t.get(C);B.shadowIntensity=$.intensity,B.shadowBias=$.bias,B.shadowNormalBias=$.normalBias,B.shadowRadius=$.radius,B.shadowMapSize=$.mapSize,n.directionalShadow[p]=B,n.directionalShadowMap[p]=W,n.directionalShadowMatrix[p]=C.shadow.matrix,v++}n.directional[p]=O,p++}else if(C.isSpotLight){let O=e.get(C);O.position.setFromMatrixPosition(C.matrixWorld),O.color.copy(L).multiplyScalar(U),O.distance=k,O.coneCos=Math.cos(C.angle),O.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),O.decay=C.decay,n.spot[y]=O;let $=C.shadow;if(C.map&&(n.spotLightMap[I]=C.map,I++,$.updateMatrices(C),C.castShadow&&T++),n.spotLightMatrix[y]=$.matrix,C.castShadow){let B=t.get(C);B.shadowIntensity=$.intensity,B.shadowBias=$.bias,B.shadowNormalBias=$.normalBias,B.shadowRadius=$.radius,B.shadowMapSize=$.mapSize,n.spotShadow[y]=B,n.spotShadowMap[y]=W,b++}y++}else if(C.isRectAreaLight){let O=e.get(C);O.color.copy(L).multiplyScalar(U),O.halfWidth.set(C.width*.5,0,0),O.halfHeight.set(0,C.height*.5,0),n.rectArea[m]=O,m++}else if(C.isPointLight){let O=e.get(C);if(O.color.copy(C.color).multiplyScalar(C.intensity),O.distance=C.distance,O.decay=C.decay,C.castShadow){let $=C.shadow,B=t.get(C);B.shadowIntensity=$.intensity,B.shadowBias=$.bias,B.shadowNormalBias=$.normalBias,B.shadowRadius=$.radius,B.shadowMapSize=$.mapSize,B.shadowCameraNear=$.camera.near,B.shadowCameraFar=$.camera.far,n.pointShadow[g]=B,n.pointShadowMap[g]=W,n.pointShadowMatrix[g]=C.shadow.matrix,S++}n.point[g]=O,g++}else if(C.isHemisphereLight){let O=e.get(C);O.skyColor.copy(C.color).multiplyScalar(U),O.groundColor.copy(C.groundColor).multiplyScalar(U),n.hemi[d]=O,d++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=oe.LTC_FLOAT_1,n.rectAreaLTC2=oe.LTC_FLOAT_2):(n.rectAreaLTC1=oe.LTC_HALF_1,n.rectAreaLTC2=oe.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=f,n.ambient[2]=c;let A=n.hash;(A.directionalLength!==p||A.pointLength!==g||A.spotLength!==y||A.rectAreaLength!==m||A.hemiLength!==d||A.numDirectionalShadows!==v||A.numPointShadows!==S||A.numSpotShadows!==b||A.numSpotMaps!==I||A.numLightProbes!==w)&&(n.directional.length=p,n.spot.length=y,n.rectArea.length=m,n.point.length=g,n.hemi.length=d,n.directionalShadow.length=v,n.directionalShadowMap.length=v,n.pointShadow.length=S,n.pointShadowMap.length=S,n.spotShadow.length=b,n.spotShadowMap.length=b,n.directionalShadowMatrix.length=v,n.pointShadowMatrix.length=S,n.spotLightMatrix.length=b+I-T,n.spotLightMap.length=I,n.numSpotLightShadowsWithMaps=T,n.numLightProbes=w,A.directionalLength=p,A.pointLength=g,A.spotLength=y,A.rectAreaLength=m,A.hemiLength=d,A.numDirectionalShadows=v,A.numPointShadows=S,A.numSpotShadows=b,A.numSpotMaps=I,A.numLightProbes=w,n.version=A0++)}function l(u,h){let f=0,c=0,p=0,g=0,y=0,m=h.matrixWorldInverse;for(let d=0,v=u.length;d<v;d++){let S=u[d];if(S.isDirectionalLight){let b=n.directional[f];b.direction.setFromMatrixPosition(S.matrixWorld),r.setFromMatrixPosition(S.target.matrixWorld),b.direction.sub(r),b.direction.transformDirection(m),f++}else if(S.isSpotLight){let b=n.spot[p];b.position.setFromMatrixPosition(S.matrixWorld),b.position.applyMatrix4(m),b.direction.setFromMatrixPosition(S.matrixWorld),r.setFromMatrixPosition(S.target.matrixWorld),b.direction.sub(r),b.direction.transformDirection(m),p++}else if(S.isRectAreaLight){let b=n.rectArea[g];b.position.setFromMatrixPosition(S.matrixWorld),b.position.applyMatrix4(m),a.identity(),s.copy(S.matrixWorld),s.premultiply(m),a.extractRotation(s),b.halfWidth.set(S.width*.5,0,0),b.halfHeight.set(0,S.height*.5,0),b.halfWidth.applyMatrix4(a),b.halfHeight.applyMatrix4(a),g++}else if(S.isPointLight){let b=n.point[c];b.position.setFromMatrixPosition(S.matrixWorld),b.position.applyMatrix4(m),c++}else if(S.isHemisphereLight){let b=n.hemi[y];b.direction.setFromMatrixPosition(S.matrixWorld),b.direction.transformDirection(m),y++}}}return{setup:o,setupView:l,state:n}}function Bc(i){let e=new C0(i),t=[],n=[];function r(h){u.camera=h,t.length=0,n.length=0}function s(h){t.push(h)}function a(h){n.push(h)}function o(){e.setup(t)}function l(h){e.setupView(t,h)}let u={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:u,setupLights:o,setupLightsView:l,pushLight:s,pushShadow:a}}function I0(i){let e=new WeakMap;function t(r,s=0){let a=e.get(r),o;return a===void 0?(o=new Bc(i),e.set(r,[o])):s>=a.length?(o=new Bc(i),a.push(o)):o=a[s],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var Uo=class extends Wn{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=zu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},No=class extends Wn{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}},P0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,L0=`uniform sampler2D shadow_pass;
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
}`;function D0(i,e,t){let n=new Tr,r=new Ee,s=new Ee,a=new nt,o=new Uo({depthPacking:Fu}),l=new No,u={},h=t.maxTextureSize,f={[Hn]:Ut,[Ut]:Hn,[jt]:jt},c=new Bt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ee},radius:{value:4}},vertexShader:P0,fragmentShader:L0}),p=c.clone();p.defines.HORIZONTAL_PASS=1;let g=new pt;g.setAttribute("position",new xt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new it(g,c),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=jc;let d=this.type;this.render=function(T,w,A){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;let x=i.getRenderTarget(),_=i.getActiveCubeFace(),C=i.getActiveMipmapLevel(),L=i.state;L.setBlending(kn),L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);let U=d!==_n&&this.type===_n,k=d===_n&&this.type!==_n;for(let W=0,O=T.length;W<O;W++){let $=T[W],B=$.shadow;if(B===void 0){console.warn("THREE.WebGLShadowMap:",$,"has no shadow.");continue}if(B.autoUpdate===!1&&B.needsUpdate===!1)continue;r.copy(B.mapSize);let ee=B.getFrameExtents();if(r.multiply(ee),s.copy(B.mapSize),(r.x>h||r.y>h)&&(r.x>h&&(s.x=Math.floor(h/ee.x),r.x=s.x*ee.x,B.mapSize.x=s.x),r.y>h&&(s.y=Math.floor(h/ee.y),r.y=s.y*ee.y,B.mapSize.y=s.y)),B.map===null||U===!0||k===!0){let X=this.type!==_n?{minFilter:kt,magFilter:kt}:{};B.map!==null&&B.map.dispose(),B.map=new Sn(r.x,r.y,X),B.map.texture.name=$.name+".shadowMap",B.camera.updateProjectionMatrix()}i.setRenderTarget(B.map),i.clear();let ae=B.getViewportCount();for(let X=0;X<ae;X++){let se=B.getViewport(X);a.set(s.x*se.x,s.y*se.y,s.x*se.z,s.y*se.w),L.viewport(a),B.updateMatrices($,X),n=B.getFrustum(),b(w,A,B.camera,$,this.type)}B.isPointLightShadow!==!0&&this.type===_n&&v(B,A),B.needsUpdate=!1}d=this.type,m.needsUpdate=!1,i.setRenderTarget(x,_,C)};function v(T,w){let A=e.update(y);c.defines.VSM_SAMPLES!==T.blurSamples&&(c.defines.VSM_SAMPLES=T.blurSamples,p.defines.VSM_SAMPLES=T.blurSamples,c.needsUpdate=!0,p.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new Sn(r.x,r.y)),c.uniforms.shadow_pass.value=T.map.texture,c.uniforms.resolution.value=T.mapSize,c.uniforms.radius.value=T.radius,i.setRenderTarget(T.mapPass),i.clear(),i.renderBufferDirect(w,null,A,c,y,null),p.uniforms.shadow_pass.value=T.mapPass.texture,p.uniforms.resolution.value=T.mapSize,p.uniforms.radius.value=T.radius,i.setRenderTarget(T.map),i.clear(),i.renderBufferDirect(w,null,A,p,y,null)}function S(T,w,A,x){let _=null,C=A.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(C!==void 0)_=C;else if(_=A.isPointLight===!0?l:o,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0){let L=_.uuid,U=w.uuid,k=u[L];k===void 0&&(k={},u[L]=k);let W=k[U];W===void 0&&(W=_.clone(),k[U]=W,w.addEventListener("dispose",I)),_=W}if(_.visible=w.visible,_.wireframe=w.wireframe,x===_n?_.side=w.shadowSide!==null?w.shadowSide:w.side:_.side=w.shadowSide!==null?w.shadowSide:f[w.side],_.alphaMap=w.alphaMap,_.alphaTest=w.alphaTest,_.map=w.map,_.clipShadows=w.clipShadows,_.clippingPlanes=w.clippingPlanes,_.clipIntersection=w.clipIntersection,_.displacementMap=w.displacementMap,_.displacementScale=w.displacementScale,_.displacementBias=w.displacementBias,_.wireframeLinewidth=w.wireframeLinewidth,_.linewidth=w.linewidth,A.isPointLight===!0&&_.isMeshDistanceMaterial===!0){let L=i.properties.get(_);L.light=A}return _}function b(T,w,A,x,_){if(T.visible===!1)return;if(T.layers.test(w.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&_===_n)&&(!T.frustumCulled||n.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(A.matrixWorldInverse,T.matrixWorld);let U=e.update(T),k=T.material;if(Array.isArray(k)){let W=U.groups;for(let O=0,$=W.length;O<$;O++){let B=W[O],ee=k[B.materialIndex];if(ee&&ee.visible){let ae=S(T,ee,x,_);T.onBeforeShadow(i,T,w,A,U,ae,B),i.renderBufferDirect(A,null,U,ae,T,B),T.onAfterShadow(i,T,w,A,U,ae,B)}}}else if(k.visible){let W=S(T,k,x,_);T.onBeforeShadow(i,T,w,A,U,W,null),i.renderBufferDirect(A,null,U,W,T,null),T.onAfterShadow(i,T,w,A,U,W,null)}}let L=T.children;for(let U=0,k=L.length;U<k;U++)b(L[U],w,A,x,_)}function I(T){T.target.removeEventListener("dispose",I);for(let A in u){let x=u[A],_=T.target.uuid;_ in x&&(x[_].dispose(),delete x[_])}}}var U0={[Fa]:ka,[Ba]:Va,[Oa]:Ga,[qi]:Ha,[ka]:Fa,[Va]:Ba,[Ga]:Oa,[Ha]:qi};function N0(i,e){function t(){let D=!1,le=new nt,q=null,J=new nt(0,0,0,0);return{setMask:function(de){q!==de&&!D&&(i.colorMask(de,de,de,de),q=de)},setLocked:function(de){D=de},setClear:function(de,he,Ne,dt,St){St===!0&&(de*=dt,he*=dt,Ne*=dt),le.set(de,he,Ne,dt),J.equals(le)===!1&&(i.clearColor(de,he,Ne,dt),J.copy(le))},reset:function(){D=!1,q=null,J.set(-1,0,0,0)}}}function n(){let D=!1,le=!1,q=null,J=null,de=null;return{setReversed:function(he){if(le!==he){let Ne=e.get("EXT_clip_control");le?Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.ZERO_TO_ONE_EXT):Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.NEGATIVE_ONE_TO_ONE_EXT);let dt=de;de=null,this.setClear(dt)}le=he},getReversed:function(){return le},setTest:function(he){he?re(i.DEPTH_TEST):be(i.DEPTH_TEST)},setMask:function(he){q!==he&&!D&&(i.depthMask(he),q=he)},setFunc:function(he){if(le&&(he=U0[he]),J!==he){switch(he){case Fa:i.depthFunc(i.NEVER);break;case ka:i.depthFunc(i.ALWAYS);break;case Ba:i.depthFunc(i.LESS);break;case qi:i.depthFunc(i.LEQUAL);break;case Oa:i.depthFunc(i.EQUAL);break;case Ha:i.depthFunc(i.GEQUAL);break;case Va:i.depthFunc(i.GREATER);break;case Ga:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}J=he}},setLocked:function(he){D=he},setClear:function(he){de!==he&&(le&&(he=1-he),i.clearDepth(he),de=he)},reset:function(){D=!1,q=null,J=null,de=null,le=!1}}}function r(){let D=!1,le=null,q=null,J=null,de=null,he=null,Ne=null,dt=null,St=null;return{setTest:function(je){D||(je?re(i.STENCIL_TEST):be(i.STENCIL_TEST))},setMask:function(je){le!==je&&!D&&(i.stencilMask(je),le=je)},setFunc:function(je,Yt,un){(q!==je||J!==Yt||de!==un)&&(i.stencilFunc(je,Yt,un),q=je,J=Yt,de=un)},setOp:function(je,Yt,un){(he!==je||Ne!==Yt||dt!==un)&&(i.stencilOp(je,Yt,un),he=je,Ne=Yt,dt=un)},setLocked:function(je){D=je},setClear:function(je){St!==je&&(i.clearStencil(je),St=je)},reset:function(){D=!1,le=null,q=null,J=null,de=null,he=null,Ne=null,dt=null,St=null}}}let s=new t,a=new n,o=new r,l=new WeakMap,u=new WeakMap,h={},f={},c=new WeakMap,p=[],g=null,y=!1,m=null,d=null,v=null,S=null,b=null,I=null,T=null,w=new Ce(0,0,0),A=0,x=!1,_=null,C=null,L=null,U=null,k=null,W=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),O=!1,$=0,B=i.getParameter(i.VERSION);B.indexOf("WebGL")!==-1?($=parseFloat(/^WebGL (\d)/.exec(B)[1]),O=$>=1):B.indexOf("OpenGL ES")!==-1&&($=parseFloat(/^OpenGL ES (\d)/.exec(B)[1]),O=$>=2);let ee=null,ae={},X=i.getParameter(i.SCISSOR_BOX),se=i.getParameter(i.VIEWPORT),Ie=new nt().fromArray(X),Y=new nt().fromArray(se);function Q(D,le,q,J){let de=new Uint8Array(4),he=i.createTexture();i.bindTexture(D,he),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ne=0;Ne<q;Ne++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(le,0,i.RGBA,1,1,J,0,i.RGBA,i.UNSIGNED_BYTE,de):i.texImage2D(le+Ne,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,de);return he}let fe={};fe[i.TEXTURE_2D]=Q(i.TEXTURE_2D,i.TEXTURE_2D,1),fe[i.TEXTURE_CUBE_MAP]=Q(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),fe[i.TEXTURE_2D_ARRAY]=Q(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),fe[i.TEXTURE_3D]=Q(i.TEXTURE_3D,i.TEXTURE_3D,1,1),s.setClear(0,0,0,1),a.setClear(1),o.setClear(0),re(i.DEPTH_TEST),a.setFunc(qi),Ge(!1),We(Gl),re(i.CULL_FACE),F(kn);function re(D){h[D]!==!0&&(i.enable(D),h[D]=!0)}function be(D){h[D]!==!1&&(i.disable(D),h[D]=!1)}function Te(D,le){return f[D]!==le?(i.bindFramebuffer(D,le),f[D]=le,D===i.DRAW_FRAMEBUFFER&&(f[i.FRAMEBUFFER]=le),D===i.FRAMEBUFFER&&(f[i.DRAW_FRAMEBUFFER]=le),!0):!1}function Ue(D,le){let q=p,J=!1;if(D){q=c.get(le),q===void 0&&(q=[],c.set(le,q));let de=D.textures;if(q.length!==de.length||q[0]!==i.COLOR_ATTACHMENT0){for(let he=0,Ne=de.length;he<Ne;he++)q[he]=i.COLOR_ATTACHMENT0+he;q.length=de.length,J=!0}}else q[0]!==i.BACK&&(q[0]=i.BACK,J=!0);J&&i.drawBuffers(q)}function ut(D){return g!==D?(i.useProgram(D),g=D,!0):!1}let qe={[si]:i.FUNC_ADD,[hu]:i.FUNC_SUBTRACT,[uu]:i.FUNC_REVERSE_SUBTRACT};qe[du]=i.MIN,qe[fu]=i.MAX;let ft={[pu]:i.ZERO,[mu]:i.ONE,[gu]:i.SRC_COLOR,[Na]:i.SRC_ALPHA,[Mu]:i.SRC_ALPHA_SATURATE,[bu]:i.DST_COLOR,[_u]:i.DST_ALPHA,[xu]:i.ONE_MINUS_SRC_COLOR,[za]:i.ONE_MINUS_SRC_ALPHA,[vu]:i.ONE_MINUS_DST_COLOR,[yu]:i.ONE_MINUS_DST_ALPHA,[Su]:i.CONSTANT_COLOR,[Eu]:i.ONE_MINUS_CONSTANT_COLOR,[wu]:i.CONSTANT_ALPHA,[Tu]:i.ONE_MINUS_CONSTANT_ALPHA};function F(D,le,q,J,de,he,Ne,dt,St,je){if(D===kn){y===!0&&(be(i.BLEND),y=!1);return}if(y===!1&&(re(i.BLEND),y=!0),D!==cu){if(D!==m||je!==x){if((d!==si||b!==si)&&(i.blendEquation(i.FUNC_ADD),d=si,b=si),je)switch(D){case Hi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Xi:i.blendFunc(i.ONE,i.ONE);break;case Wl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Xl:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case Hi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Xi:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Wl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Xl:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}v=null,S=null,I=null,T=null,w.set(0,0,0),A=0,m=D,x=je}return}de=de||le,he=he||q,Ne=Ne||J,(le!==d||de!==b)&&(i.blendEquationSeparate(qe[le],qe[de]),d=le,b=de),(q!==v||J!==S||he!==I||Ne!==T)&&(i.blendFuncSeparate(ft[q],ft[J],ft[he],ft[Ne]),v=q,S=J,I=he,T=Ne),(dt.equals(w)===!1||St!==A)&&(i.blendColor(dt.r,dt.g,dt.b,St),w.copy(dt),A=St),m=D,x=!1}function Ot(D,le){D.side===jt?be(i.CULL_FACE):re(i.CULL_FACE);let q=D.side===Ut;le&&(q=!q),Ge(q),D.blending===Hi&&D.transparent===!1?F(kn):F(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),a.setFunc(D.depthFunc),a.setTest(D.depthTest),a.setMask(D.depthWrite),s.setMask(D.colorWrite);let J=D.stencilWrite;o.setTest(J),J&&(o.setMask(D.stencilWriteMask),o.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),o.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),at(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?re(i.SAMPLE_ALPHA_TO_COVERAGE):be(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ge(D){_!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),_=D)}function We(D){D!==ou?(re(i.CULL_FACE),D!==C&&(D===Gl?i.cullFace(i.BACK):D===lu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):be(i.CULL_FACE),C=D}function Ae(D){D!==L&&(O&&i.lineWidth(D),L=D)}function at(D,le,q){D?(re(i.POLYGON_OFFSET_FILL),(U!==le||k!==q)&&(i.polygonOffset(le,q),U=le,k=q)):be(i.POLYGON_OFFSET_FILL)}function we(D){D?re(i.SCISSOR_TEST):be(i.SCISSOR_TEST)}function R(D){D===void 0&&(D=i.TEXTURE0+W-1),ee!==D&&(i.activeTexture(D),ee=D)}function M(D,le,q){q===void 0&&(ee===null?q=i.TEXTURE0+W-1:q=ee);let J=ae[q];J===void 0&&(J={type:void 0,texture:void 0},ae[q]=J),(J.type!==D||J.texture!==le)&&(ee!==q&&(i.activeTexture(q),ee=q),i.bindTexture(D,le||fe[D]),J.type=D,J.texture=le)}function H(){let D=ae[ee];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function K(){try{i.compressedTexImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function j(){try{i.compressedTexImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Z(){try{i.texSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ve(){try{i.texSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ce(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function pe(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Ye(){try{i.texStorage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function te(){try{i.texStorage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function me(){try{i.texImage2D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Re(){try{i.texImage3D.apply(i,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Pe(D){Ie.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),Ie.copy(D))}function ge(D){Y.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),Y.copy(D))}function Xe(D,le){let q=u.get(le);q===void 0&&(q=new WeakMap,u.set(le,q));let J=q.get(D);J===void 0&&(J=i.getUniformBlockIndex(le,D.name),q.set(D,J))}function ke(D,le){let J=u.get(le).get(D);l.get(le)!==J&&(i.uniformBlockBinding(le,J,D.__bindingPointIndex),l.set(le,J))}function rt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},ee=null,ae={},f={},c=new WeakMap,p=[],g=null,y=!1,m=null,d=null,v=null,S=null,b=null,I=null,T=null,w=new Ce(0,0,0),A=0,x=!1,_=null,C=null,L=null,U=null,k=null,Ie.set(0,0,i.canvas.width,i.canvas.height),Y.set(0,0,i.canvas.width,i.canvas.height),s.reset(),a.reset(),o.reset()}return{buffers:{color:s,depth:a,stencil:o},enable:re,disable:be,bindFramebuffer:Te,drawBuffers:Ue,useProgram:ut,setBlending:F,setMaterial:Ot,setFlipSided:Ge,setCullFace:We,setLineWidth:Ae,setPolygonOffset:at,setScissorTest:we,activeTexture:R,bindTexture:M,unbindTexture:H,compressedTexImage2D:K,compressedTexImage3D:j,texImage2D:me,texImage3D:Re,updateUBOMapping:Xe,uniformBlockBinding:ke,texStorage2D:Ye,texStorage3D:te,texSubImage2D:Z,texSubImage3D:ve,compressedTexSubImage2D:ce,compressedTexSubImage3D:pe,scissor:Pe,viewport:ge,reset:rt}}function Oc(i,e,t,n){let r=z0(n);switch(t){case ih:return i*e;case sh:return i*e;case ah:return i*e*2;case sl:return i*e/r.components*r.byteLength;case al:return i*e/r.components*r.byteLength;case oh:return i*e*2/r.components*r.byteLength;case ol:return i*e*2/r.components*r.byteLength;case rh:return i*e*3/r.components*r.byteLength;case Qt:return i*e*4/r.components*r.byteLength;case ll:return i*e*4/r.components*r.byteLength;case ds:case fs:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case ps:case ms:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Za:case Ka:return Math.max(i,16)*Math.max(e,8)/4;case Ya:case $a:return Math.max(i,8)*Math.max(e,8)/2;case Ja:case ja:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Qa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case eo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case to:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case no:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case io:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case ro:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case so:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case ao:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case oo:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case lo:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case co:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case ho:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case uo:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case fo:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case po:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case gs:case mo:case go:return Math.ceil(i/4)*Math.ceil(e/4)*16;case lh:case xo:return Math.ceil(i/4)*Math.ceil(e/4)*8;case _o:case yo:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function z0(i){switch(i){case Mn:case eh:return{byteLength:1,components:1};case Sr:case th:case Dr:return{byteLength:2,components:1};case il:case rl:return{byteLength:2,components:4};case ci:case nl:case ln:return{byteLength:4,components:1};case nh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function F0(i,e,t,n,r,s,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),u=new Ee,h=new WeakMap,f,c=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,M){return p?new OffscreenCanvas(R,M):Er("canvas")}function y(R,M,H){let K=1,j=we(R);if((j.width>H||j.height>H)&&(K=H/Math.max(j.width,j.height)),K<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){let Z=Math.floor(K*j.width),ve=Math.floor(K*j.height);f===void 0&&(f=g(Z,ve));let ce=M?g(Z,ve):f;return ce.width=Z,ce.height=ve,ce.getContext("2d").drawImage(R,0,0,Z,ve),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+Z+"x"+ve+")."),ce}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),R;return R}function m(R){return R.generateMipmaps}function d(R){i.generateMipmap(R)}function v(R){return R.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?i.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function S(R,M,H,K,j=!1){if(R!==null){if(i[R]!==void 0)return i[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let Z=M;if(M===i.RED&&(H===i.FLOAT&&(Z=i.R32F),H===i.HALF_FLOAT&&(Z=i.R16F),H===i.UNSIGNED_BYTE&&(Z=i.R8)),M===i.RED_INTEGER&&(H===i.UNSIGNED_BYTE&&(Z=i.R8UI),H===i.UNSIGNED_SHORT&&(Z=i.R16UI),H===i.UNSIGNED_INT&&(Z=i.R32UI),H===i.BYTE&&(Z=i.R8I),H===i.SHORT&&(Z=i.R16I),H===i.INT&&(Z=i.R32I)),M===i.RG&&(H===i.FLOAT&&(Z=i.RG32F),H===i.HALF_FLOAT&&(Z=i.RG16F),H===i.UNSIGNED_BYTE&&(Z=i.RG8)),M===i.RG_INTEGER&&(H===i.UNSIGNED_BYTE&&(Z=i.RG8UI),H===i.UNSIGNED_SHORT&&(Z=i.RG16UI),H===i.UNSIGNED_INT&&(Z=i.RG32UI),H===i.BYTE&&(Z=i.RG8I),H===i.SHORT&&(Z=i.RG16I),H===i.INT&&(Z=i.RG32I)),M===i.RGB_INTEGER&&(H===i.UNSIGNED_BYTE&&(Z=i.RGB8UI),H===i.UNSIGNED_SHORT&&(Z=i.RGB16UI),H===i.UNSIGNED_INT&&(Z=i.RGB32UI),H===i.BYTE&&(Z=i.RGB8I),H===i.SHORT&&(Z=i.RGB16I),H===i.INT&&(Z=i.RGB32I)),M===i.RGBA_INTEGER&&(H===i.UNSIGNED_BYTE&&(Z=i.RGBA8UI),H===i.UNSIGNED_SHORT&&(Z=i.RGBA16UI),H===i.UNSIGNED_INT&&(Z=i.RGBA32UI),H===i.BYTE&&(Z=i.RGBA8I),H===i.SHORT&&(Z=i.RGBA16I),H===i.INT&&(Z=i.RGBA32I)),M===i.RGB&&H===i.UNSIGNED_INT_5_9_9_9_REV&&(Z=i.RGB9_E5),M===i.RGBA){let ve=j?Xs:Ze.getTransfer(K);H===i.FLOAT&&(Z=i.RGBA32F),H===i.HALF_FLOAT&&(Z=i.RGBA16F),H===i.UNSIGNED_BYTE&&(Z=ve===et?i.SRGB8_ALPHA8:i.RGBA8),H===i.UNSIGNED_SHORT_4_4_4_4&&(Z=i.RGBA4),H===i.UNSIGNED_SHORT_5_5_5_1&&(Z=i.RGB5_A1)}return(Z===i.R16F||Z===i.R32F||Z===i.RG16F||Z===i.RG32F||Z===i.RGBA16F||Z===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Z}function b(R,M){let H;return R?M===null||M===ci||M===$i?H=i.DEPTH24_STENCIL8:M===ln?H=i.DEPTH32F_STENCIL8:M===Sr&&(H=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===ci||M===$i?H=i.DEPTH_COMPONENT24:M===ln?H=i.DEPTH_COMPONENT32F:M===Sr&&(H=i.DEPTH_COMPONENT16),H}function I(R,M){return m(R)===!0||R.isFramebufferTexture&&R.minFilter!==kt&&R.minFilter!==on?Math.log2(Math.max(M.width,M.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?M.mipmaps.length:1}function T(R){let M=R.target;M.removeEventListener("dispose",T),A(M),M.isVideoTexture&&h.delete(M)}function w(R){let M=R.target;M.removeEventListener("dispose",w),_(M)}function A(R){let M=n.get(R);if(M.__webglInit===void 0)return;let H=R.source,K=c.get(H);if(K){let j=K[M.__cacheKey];j.usedTimes--,j.usedTimes===0&&x(R),Object.keys(K).length===0&&c.delete(H)}n.remove(R)}function x(R){let M=n.get(R);i.deleteTexture(M.__webglTexture);let H=R.source,K=c.get(H);delete K[M.__cacheKey],a.memory.textures--}function _(R){let M=n.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),n.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(M.__webglFramebuffer[K]))for(let j=0;j<M.__webglFramebuffer[K].length;j++)i.deleteFramebuffer(M.__webglFramebuffer[K][j]);else i.deleteFramebuffer(M.__webglFramebuffer[K]);M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer[K])}else{if(Array.isArray(M.__webglFramebuffer))for(let K=0;K<M.__webglFramebuffer.length;K++)i.deleteFramebuffer(M.__webglFramebuffer[K]);else i.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&i.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let K=0;K<M.__webglColorRenderbuffer.length;K++)M.__webglColorRenderbuffer[K]&&i.deleteRenderbuffer(M.__webglColorRenderbuffer[K]);M.__webglDepthRenderbuffer&&i.deleteRenderbuffer(M.__webglDepthRenderbuffer)}let H=R.textures;for(let K=0,j=H.length;K<j;K++){let Z=n.get(H[K]);Z.__webglTexture&&(i.deleteTexture(Z.__webglTexture),a.memory.textures--),n.remove(H[K])}n.remove(R)}let C=0;function L(){C=0}function U(){let R=C;return R>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+r.maxTextures),C+=1,R}function k(R){let M=[];return M.push(R.wrapS),M.push(R.wrapT),M.push(R.wrapR||0),M.push(R.magFilter),M.push(R.minFilter),M.push(R.anisotropy),M.push(R.internalFormat),M.push(R.format),M.push(R.type),M.push(R.generateMipmaps),M.push(R.premultiplyAlpha),M.push(R.flipY),M.push(R.unpackAlignment),M.push(R.colorSpace),M.join()}function W(R,M){let H=n.get(R);if(R.isVideoTexture&&Ae(R),R.isRenderTargetTexture===!1&&R.version>0&&H.__version!==R.version){let K=R.image;if(K===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(K.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(H,R,M);return}}t.bindTexture(i.TEXTURE_2D,H.__webglTexture,i.TEXTURE0+M)}function O(R,M){let H=n.get(R);if(R.version>0&&H.__version!==R.version){Y(H,R,M);return}t.bindTexture(i.TEXTURE_2D_ARRAY,H.__webglTexture,i.TEXTURE0+M)}function $(R,M){let H=n.get(R);if(R.version>0&&H.__version!==R.version){Y(H,R,M);return}t.bindTexture(i.TEXTURE_3D,H.__webglTexture,i.TEXTURE0+M)}function B(R,M){let H=n.get(R);if(R.version>0&&H.__version!==R.version){Q(H,R,M);return}t.bindTexture(i.TEXTURE_CUBE_MAP,H.__webglTexture,i.TEXTURE0+M)}let ee={[Vn]:i.REPEAT,[oi]:i.CLAMP_TO_EDGE,[qa]:i.MIRRORED_REPEAT},ae={[kt]:i.NEAREST,[Nu]:i.NEAREST_MIPMAP_NEAREST,[Or]:i.NEAREST_MIPMAP_LINEAR,[on]:i.LINEAR,[na]:i.LINEAR_MIPMAP_NEAREST,[li]:i.LINEAR_MIPMAP_LINEAR},X={[Bu]:i.NEVER,[Xu]:i.ALWAYS,[Ou]:i.LESS,[hh]:i.LEQUAL,[Hu]:i.EQUAL,[Wu]:i.GEQUAL,[Vu]:i.GREATER,[Gu]:i.NOTEQUAL};function se(R,M){if(M.type===ln&&e.has("OES_texture_float_linear")===!1&&(M.magFilter===on||M.magFilter===na||M.magFilter===Or||M.magFilter===li||M.minFilter===on||M.minFilter===na||M.minFilter===Or||M.minFilter===li)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(R,i.TEXTURE_WRAP_S,ee[M.wrapS]),i.texParameteri(R,i.TEXTURE_WRAP_T,ee[M.wrapT]),(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)&&i.texParameteri(R,i.TEXTURE_WRAP_R,ee[M.wrapR]),i.texParameteri(R,i.TEXTURE_MAG_FILTER,ae[M.magFilter]),i.texParameteri(R,i.TEXTURE_MIN_FILTER,ae[M.minFilter]),M.compareFunction&&(i.texParameteri(R,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(R,i.TEXTURE_COMPARE_FUNC,X[M.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===kt||M.minFilter!==Or&&M.minFilter!==li||M.type===ln&&e.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||n.get(M).__currentAnisotropy){let H=e.get("EXT_texture_filter_anisotropic");i.texParameterf(R,H.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,r.getMaxAnisotropy())),n.get(M).__currentAnisotropy=M.anisotropy}}}function Ie(R,M){let H=!1;R.__webglInit===void 0&&(R.__webglInit=!0,M.addEventListener("dispose",T));let K=M.source,j=c.get(K);j===void 0&&(j={},c.set(K,j));let Z=k(M);if(Z!==R.__cacheKey){j[Z]===void 0&&(j[Z]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,H=!0),j[Z].usedTimes++;let ve=j[R.__cacheKey];ve!==void 0&&(j[R.__cacheKey].usedTimes--,ve.usedTimes===0&&x(M)),R.__cacheKey=Z,R.__webglTexture=j[Z].texture}return H}function Y(R,M,H){let K=i.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(K=i.TEXTURE_2D_ARRAY),M.isData3DTexture&&(K=i.TEXTURE_3D);let j=Ie(R,M),Z=M.source;t.bindTexture(K,R.__webglTexture,i.TEXTURE0+H);let ve=n.get(Z);if(Z.version!==ve.__version||j===!0){t.activeTexture(i.TEXTURE0+H);let ce=Ze.getPrimaries(Ze.workingColorSpace),pe=M.colorSpace===zn?null:Ze.getPrimaries(M.colorSpace),Ye=M.colorSpace===zn||ce===pe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ye);let te=y(M.image,!1,r.maxTextureSize);te=at(M,te);let me=s.convert(M.format,M.colorSpace),Re=s.convert(M.type),Pe=S(M.internalFormat,me,Re,M.colorSpace,M.isVideoTexture);se(K,M);let ge,Xe=M.mipmaps,ke=M.isVideoTexture!==!0,rt=ve.__version===void 0||j===!0,D=Z.dataReady,le=I(M,te);if(M.isDepthTexture)Pe=b(M.format===Ki,M.type),rt&&(ke?t.texStorage2D(i.TEXTURE_2D,1,Pe,te.width,te.height):t.texImage2D(i.TEXTURE_2D,0,Pe,te.width,te.height,0,me,Re,null));else if(M.isDataTexture)if(Xe.length>0){ke&&rt&&t.texStorage2D(i.TEXTURE_2D,le,Pe,Xe[0].width,Xe[0].height);for(let q=0,J=Xe.length;q<J;q++)ge=Xe[q],ke?D&&t.texSubImage2D(i.TEXTURE_2D,q,0,0,ge.width,ge.height,me,Re,ge.data):t.texImage2D(i.TEXTURE_2D,q,Pe,ge.width,ge.height,0,me,Re,ge.data);M.generateMipmaps=!1}else ke?(rt&&t.texStorage2D(i.TEXTURE_2D,le,Pe,te.width,te.height),D&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,te.width,te.height,me,Re,te.data)):t.texImage2D(i.TEXTURE_2D,0,Pe,te.width,te.height,0,me,Re,te.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){ke&&rt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,le,Pe,Xe[0].width,Xe[0].height,te.depth);for(let q=0,J=Xe.length;q<J;q++)if(ge=Xe[q],M.format!==Qt)if(me!==null)if(ke){if(D)if(M.layerUpdates.size>0){let de=Oc(ge.width,ge.height,M.format,M.type);for(let he of M.layerUpdates){let Ne=ge.data.subarray(he*de/ge.data.BYTES_PER_ELEMENT,(he+1)*de/ge.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,q,0,0,he,ge.width,ge.height,1,me,Ne)}M.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,q,0,0,0,ge.width,ge.height,te.depth,me,ge.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,q,Pe,ge.width,ge.height,te.depth,0,ge.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ke?D&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,q,0,0,0,ge.width,ge.height,te.depth,me,Re,ge.data):t.texImage3D(i.TEXTURE_2D_ARRAY,q,Pe,ge.width,ge.height,te.depth,0,me,Re,ge.data)}else{ke&&rt&&t.texStorage2D(i.TEXTURE_2D,le,Pe,Xe[0].width,Xe[0].height);for(let q=0,J=Xe.length;q<J;q++)ge=Xe[q],M.format!==Qt?me!==null?ke?D&&t.compressedTexSubImage2D(i.TEXTURE_2D,q,0,0,ge.width,ge.height,me,ge.data):t.compressedTexImage2D(i.TEXTURE_2D,q,Pe,ge.width,ge.height,0,ge.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ke?D&&t.texSubImage2D(i.TEXTURE_2D,q,0,0,ge.width,ge.height,me,Re,ge.data):t.texImage2D(i.TEXTURE_2D,q,Pe,ge.width,ge.height,0,me,Re,ge.data)}else if(M.isDataArrayTexture)if(ke){if(rt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,le,Pe,te.width,te.height,te.depth),D)if(M.layerUpdates.size>0){let q=Oc(te.width,te.height,M.format,M.type);for(let J of M.layerUpdates){let de=te.data.subarray(J*q/te.data.BYTES_PER_ELEMENT,(J+1)*q/te.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,J,te.width,te.height,1,me,Re,de)}M.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,te.width,te.height,te.depth,me,Re,te.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Pe,te.width,te.height,te.depth,0,me,Re,te.data);else if(M.isData3DTexture)ke?(rt&&t.texStorage3D(i.TEXTURE_3D,le,Pe,te.width,te.height,te.depth),D&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,te.width,te.height,te.depth,me,Re,te.data)):t.texImage3D(i.TEXTURE_3D,0,Pe,te.width,te.height,te.depth,0,me,Re,te.data);else if(M.isFramebufferTexture){if(rt)if(ke)t.texStorage2D(i.TEXTURE_2D,le,Pe,te.width,te.height);else{let q=te.width,J=te.height;for(let de=0;de<le;de++)t.texImage2D(i.TEXTURE_2D,de,Pe,q,J,0,me,Re,null),q>>=1,J>>=1}}else if(Xe.length>0){if(ke&&rt){let q=we(Xe[0]);t.texStorage2D(i.TEXTURE_2D,le,Pe,q.width,q.height)}for(let q=0,J=Xe.length;q<J;q++)ge=Xe[q],ke?D&&t.texSubImage2D(i.TEXTURE_2D,q,0,0,me,Re,ge):t.texImage2D(i.TEXTURE_2D,q,Pe,me,Re,ge);M.generateMipmaps=!1}else if(ke){if(rt){let q=we(te);t.texStorage2D(i.TEXTURE_2D,le,Pe,q.width,q.height)}D&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,me,Re,te)}else t.texImage2D(i.TEXTURE_2D,0,Pe,me,Re,te);m(M)&&d(K),ve.__version=Z.version,M.onUpdate&&M.onUpdate(M)}R.__version=M.version}function Q(R,M,H){if(M.image.length!==6)return;let K=Ie(R,M),j=M.source;t.bindTexture(i.TEXTURE_CUBE_MAP,R.__webglTexture,i.TEXTURE0+H);let Z=n.get(j);if(j.version!==Z.__version||K===!0){t.activeTexture(i.TEXTURE0+H);let ve=Ze.getPrimaries(Ze.workingColorSpace),ce=M.colorSpace===zn?null:Ze.getPrimaries(M.colorSpace),pe=M.colorSpace===zn||ve===ce?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,pe);let Ye=M.isCompressedTexture||M.image[0].isCompressedTexture,te=M.image[0]&&M.image[0].isDataTexture,me=[];for(let J=0;J<6;J++)!Ye&&!te?me[J]=y(M.image[J],!0,r.maxCubemapSize):me[J]=te?M.image[J].image:M.image[J],me[J]=at(M,me[J]);let Re=me[0],Pe=s.convert(M.format,M.colorSpace),ge=s.convert(M.type),Xe=S(M.internalFormat,Pe,ge,M.colorSpace),ke=M.isVideoTexture!==!0,rt=Z.__version===void 0||K===!0,D=j.dataReady,le=I(M,Re);se(i.TEXTURE_CUBE_MAP,M);let q;if(Ye){ke&&rt&&t.texStorage2D(i.TEXTURE_CUBE_MAP,le,Xe,Re.width,Re.height);for(let J=0;J<6;J++){q=me[J].mipmaps;for(let de=0;de<q.length;de++){let he=q[de];M.format!==Qt?Pe!==null?ke?D&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,de,0,0,he.width,he.height,Pe,he.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,de,Xe,he.width,he.height,0,he.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):ke?D&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,de,0,0,he.width,he.height,Pe,ge,he.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,de,Xe,he.width,he.height,0,Pe,ge,he.data)}}}else{if(q=M.mipmaps,ke&&rt){q.length>0&&le++;let J=we(me[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,le,Xe,J.width,J.height)}for(let J=0;J<6;J++)if(te){ke?D&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,me[J].width,me[J].height,Pe,ge,me[J].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,Xe,me[J].width,me[J].height,0,Pe,ge,me[J].data);for(let de=0;de<q.length;de++){let Ne=q[de].image[J].image;ke?D&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,de+1,0,0,Ne.width,Ne.height,Pe,ge,Ne.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,de+1,Xe,Ne.width,Ne.height,0,Pe,ge,Ne.data)}}else{ke?D&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,Pe,ge,me[J]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,Xe,Pe,ge,me[J]);for(let de=0;de<q.length;de++){let he=q[de];ke?D&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,de+1,0,0,Pe,ge,he.image[J]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,de+1,Xe,Pe,ge,he.image[J])}}}m(M)&&d(i.TEXTURE_CUBE_MAP),Z.__version=j.version,M.onUpdate&&M.onUpdate(M)}R.__version=M.version}function fe(R,M,H,K,j,Z){let ve=s.convert(H.format,H.colorSpace),ce=s.convert(H.type),pe=S(H.internalFormat,ve,ce,H.colorSpace),Ye=n.get(M),te=n.get(H);if(te.__renderTarget=M,!Ye.__hasExternalTextures){let me=Math.max(1,M.width>>Z),Re=Math.max(1,M.height>>Z);j===i.TEXTURE_3D||j===i.TEXTURE_2D_ARRAY?t.texImage3D(j,Z,pe,me,Re,M.depth,0,ve,ce,null):t.texImage2D(j,Z,pe,me,Re,0,ve,ce,null)}t.bindFramebuffer(i.FRAMEBUFFER,R),We(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,K,j,te.__webglTexture,0,Ge(M)):(j===i.TEXTURE_2D||j>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,K,j,te.__webglTexture,Z),t.bindFramebuffer(i.FRAMEBUFFER,null)}function re(R,M,H){if(i.bindRenderbuffer(i.RENDERBUFFER,R),M.depthBuffer){let K=M.depthTexture,j=K&&K.isDepthTexture?K.type:null,Z=b(M.stencilBuffer,j),ve=M.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=Ge(M);We(M)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ce,Z,M.width,M.height):H?i.renderbufferStorageMultisample(i.RENDERBUFFER,ce,Z,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,Z,M.width,M.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ve,i.RENDERBUFFER,R)}else{let K=M.textures;for(let j=0;j<K.length;j++){let Z=K[j],ve=s.convert(Z.format,Z.colorSpace),ce=s.convert(Z.type),pe=S(Z.internalFormat,ve,ce,Z.colorSpace),Ye=Ge(M);H&&We(M)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ye,pe,M.width,M.height):We(M)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ye,pe,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,pe,M.width,M.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function be(R,M){if(M&&M.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,R),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let K=n.get(M.depthTexture);K.__renderTarget=M,(!K.__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),W(M.depthTexture,0);let j=K.__webglTexture,Z=Ge(M);if(M.depthTexture.format===Vi)We(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0,Z):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0);else if(M.depthTexture.format===Ki)We(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0,Z):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0);else throw new Error("Unknown depthTexture format")}function Te(R){let M=n.get(R),H=R.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==R.depthTexture){let K=R.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),K){let j=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,K.removeEventListener("dispose",j)};K.addEventListener("dispose",j),M.__depthDisposeCallback=j}M.__boundDepthTexture=K}if(R.depthTexture&&!M.__autoAllocateDepthBuffer){if(H)throw new Error("target.depthTexture not supported in Cube render targets");be(M.__webglFramebuffer,R)}else if(H){M.__webglDepthbuffer=[];for(let K=0;K<6;K++)if(t.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[K]),M.__webglDepthbuffer[K]===void 0)M.__webglDepthbuffer[K]=i.createRenderbuffer(),re(M.__webglDepthbuffer[K],R,!1);else{let j=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Z=M.__webglDepthbuffer[K];i.bindRenderbuffer(i.RENDERBUFFER,Z),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,Z)}}else if(t.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=i.createRenderbuffer(),re(M.__webglDepthbuffer,R,!1);else{let K=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,j=M.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,j),i.framebufferRenderbuffer(i.FRAMEBUFFER,K,i.RENDERBUFFER,j)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ue(R,M,H){let K=n.get(R);M!==void 0&&fe(K.__webglFramebuffer,R,R.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),H!==void 0&&Te(R)}function ut(R){let M=R.texture,H=n.get(R),K=n.get(M);R.addEventListener("dispose",w);let j=R.textures,Z=R.isWebGLCubeRenderTarget===!0,ve=j.length>1;if(ve||(K.__webglTexture===void 0&&(K.__webglTexture=i.createTexture()),K.__version=M.version,a.memory.textures++),Z){H.__webglFramebuffer=[];for(let ce=0;ce<6;ce++)if(M.mipmaps&&M.mipmaps.length>0){H.__webglFramebuffer[ce]=[];for(let pe=0;pe<M.mipmaps.length;pe++)H.__webglFramebuffer[ce][pe]=i.createFramebuffer()}else H.__webglFramebuffer[ce]=i.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){H.__webglFramebuffer=[];for(let ce=0;ce<M.mipmaps.length;ce++)H.__webglFramebuffer[ce]=i.createFramebuffer()}else H.__webglFramebuffer=i.createFramebuffer();if(ve)for(let ce=0,pe=j.length;ce<pe;ce++){let Ye=n.get(j[ce]);Ye.__webglTexture===void 0&&(Ye.__webglTexture=i.createTexture(),a.memory.textures++)}if(R.samples>0&&We(R)===!1){H.__webglMultisampledFramebuffer=i.createFramebuffer(),H.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,H.__webglMultisampledFramebuffer);for(let ce=0;ce<j.length;ce++){let pe=j[ce];H.__webglColorRenderbuffer[ce]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,H.__webglColorRenderbuffer[ce]);let Ye=s.convert(pe.format,pe.colorSpace),te=s.convert(pe.type),me=S(pe.internalFormat,Ye,te,pe.colorSpace,R.isXRRenderTarget===!0),Re=Ge(R);i.renderbufferStorageMultisample(i.RENDERBUFFER,Re,me,R.width,R.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ce,i.RENDERBUFFER,H.__webglColorRenderbuffer[ce])}i.bindRenderbuffer(i.RENDERBUFFER,null),R.depthBuffer&&(H.__webglDepthRenderbuffer=i.createRenderbuffer(),re(H.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Z){t.bindTexture(i.TEXTURE_CUBE_MAP,K.__webglTexture),se(i.TEXTURE_CUBE_MAP,M);for(let ce=0;ce<6;ce++)if(M.mipmaps&&M.mipmaps.length>0)for(let pe=0;pe<M.mipmaps.length;pe++)fe(H.__webglFramebuffer[ce][pe],R,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,pe);else fe(H.__webglFramebuffer[ce],R,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0);m(M)&&d(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ve){for(let ce=0,pe=j.length;ce<pe;ce++){let Ye=j[ce],te=n.get(Ye);t.bindTexture(i.TEXTURE_2D,te.__webglTexture),se(i.TEXTURE_2D,Ye),fe(H.__webglFramebuffer,R,Ye,i.COLOR_ATTACHMENT0+ce,i.TEXTURE_2D,0),m(Ye)&&d(i.TEXTURE_2D)}t.unbindTexture()}else{let ce=i.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(ce=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ce,K.__webglTexture),se(ce,M),M.mipmaps&&M.mipmaps.length>0)for(let pe=0;pe<M.mipmaps.length;pe++)fe(H.__webglFramebuffer[pe],R,M,i.COLOR_ATTACHMENT0,ce,pe);else fe(H.__webglFramebuffer,R,M,i.COLOR_ATTACHMENT0,ce,0);m(M)&&d(ce),t.unbindTexture()}R.depthBuffer&&Te(R)}function qe(R){let M=R.textures;for(let H=0,K=M.length;H<K;H++){let j=M[H];if(m(j)){let Z=v(R),ve=n.get(j).__webglTexture;t.bindTexture(Z,ve),d(Z),t.unbindTexture()}}}let ft=[],F=[];function Ot(R){if(R.samples>0){if(We(R)===!1){let M=R.textures,H=R.width,K=R.height,j=i.COLOR_BUFFER_BIT,Z=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ve=n.get(R),ce=M.length>1;if(ce)for(let pe=0;pe<M.length;pe++)t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ve.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ve.__webglFramebuffer);for(let pe=0;pe<M.length;pe++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(j|=i.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(j|=i.STENCIL_BUFFER_BIT)),ce){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ve.__webglColorRenderbuffer[pe]);let Ye=n.get(M[pe]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Ye,0)}i.blitFramebuffer(0,0,H,K,0,0,H,K,j,i.NEAREST),l===!0&&(ft.length=0,F.length=0,ft.push(i.COLOR_ATTACHMENT0+pe),R.depthBuffer&&R.resolveDepthBuffer===!1&&(ft.push(Z),F.push(Z),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,F)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ft))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ce)for(let pe=0;pe<M.length;pe++){t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.RENDERBUFFER,ve.__webglColorRenderbuffer[pe]);let Ye=n.get(M[pe]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pe,i.TEXTURE_2D,Ye,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ve.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){let M=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[M])}}}function Ge(R){return Math.min(r.maxSamples,R.samples)}function We(R){let M=n.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function Ae(R){let M=a.render.frame;h.get(R)!==M&&(h.set(R,M),R.update())}function at(R,M){let H=R.colorSpace,K=R.format,j=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||H!==er&&H!==zn&&(Ze.getTransfer(H)===et?(K!==Qt||j!==Mn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",H)),M}function we(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(u.width=R.naturalWidth||R.width,u.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(u.width=R.displayWidth,u.height=R.displayHeight):(u.width=R.width,u.height=R.height),u}this.allocateTextureUnit=U,this.resetTextureUnits=L,this.setTexture2D=W,this.setTexture2DArray=O,this.setTexture3D=$,this.setTextureCube=B,this.rebindTextures=Ue,this.setupRenderTarget=ut,this.updateRenderTargetMipmap=qe,this.updateMultisampleRenderTarget=Ot,this.setupDepthRenderbuffer=Te,this.setupFrameBufferTexture=fe,this.useMultisampledRTT=We}function k0(i,e){function t(n,r=zn){let s,a=Ze.getTransfer(r);if(n===Mn)return i.UNSIGNED_BYTE;if(n===il)return i.UNSIGNED_SHORT_4_4_4_4;if(n===rl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===nh)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===eh)return i.BYTE;if(n===th)return i.SHORT;if(n===Sr)return i.UNSIGNED_SHORT;if(n===nl)return i.INT;if(n===ci)return i.UNSIGNED_INT;if(n===ln)return i.FLOAT;if(n===Dr)return i.HALF_FLOAT;if(n===ih)return i.ALPHA;if(n===rh)return i.RGB;if(n===Qt)return i.RGBA;if(n===sh)return i.LUMINANCE;if(n===ah)return i.LUMINANCE_ALPHA;if(n===Vi)return i.DEPTH_COMPONENT;if(n===Ki)return i.DEPTH_STENCIL;if(n===sl)return i.RED;if(n===al)return i.RED_INTEGER;if(n===oh)return i.RG;if(n===ol)return i.RG_INTEGER;if(n===ll)return i.RGBA_INTEGER;if(n===ds||n===fs||n===ps||n===ms)if(a===et)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===ds)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===fs)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===ps)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ms)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===ds)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===fs)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===ps)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ms)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ya||n===Za||n===$a||n===Ka)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===Ya)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Za)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===$a)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Ka)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ja||n===ja||n===Qa)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(n===Ja||n===ja)return a===et?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===Qa)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===eo||n===to||n===no||n===io||n===ro||n===so||n===ao||n===oo||n===lo||n===co||n===ho||n===uo||n===fo||n===po)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(n===eo)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===to)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===no)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===io)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ro)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===so)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===ao)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===oo)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===lo)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===co)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===ho)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===uo)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===fo)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===po)return a===et?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===gs||n===mo||n===go)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(n===gs)return a===et?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===mo)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===go)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===lh||n===xo||n===_o||n===yo)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(n===gs)return s.COMPRESSED_RED_RGTC1_EXT;if(n===xo)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===_o)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===yo)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===$i?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var zo=class extends Tt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}},At=class extends Rt{constructor(){super(),this.isGroup=!0,this.type="Group"}},B0={type:"move"},Mr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new At,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new At,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new At,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,s=null,a=null,o=this._targetRay,l=this._grip,u=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(u&&e.hand){a=!0;for(let y of e.hand.values()){let m=t.getJointPose(y,n),d=this._getHandJoint(u,y);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}let h=u.joints["index-finger-tip"],f=u.joints["thumb-tip"],c=h.position.distanceTo(f.position),p=.02,g=.005;u.inputState.pinching&&c>p+g?(u.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!u.inputState.pinching&&c<=p-g&&(u.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(B0)))}return o!==null&&(o.visible=r!==null),l!==null&&(l.visible=s!==null),u!==null&&(u.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new At;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},O0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,H0=`
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

}`,Fo=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,n){if(this.texture===null){let r=new Pt,s=e.properties.get(r);s.__webglTexture=t.texture,(t.depthNear!=n.depthNear||t.depthFar!=n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Bt({vertexShader:O0,fragmentShader:H0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new it(new ji(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ko=class extends Gn{constructor(e,t){super();let n=this,r=null,s=1,a=null,o="local-floor",l=1,u=null,h=null,f=null,c=null,p=null,g=null,y=new Fo,m=t.getContextAttributes(),d=null,v=null,S=[],b=[],I=new Ee,T=null,w=new Tt;w.viewport=new nt;let A=new Tt;A.viewport=new nt;let x=[w,A],_=new zo,C=null,L=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let Q=S[Y];return Q===void 0&&(Q=new Mr,S[Y]=Q),Q.getTargetRaySpace()},this.getControllerGrip=function(Y){let Q=S[Y];return Q===void 0&&(Q=new Mr,S[Y]=Q),Q.getGripSpace()},this.getHand=function(Y){let Q=S[Y];return Q===void 0&&(Q=new Mr,S[Y]=Q),Q.getHandSpace()};function U(Y){let Q=b.indexOf(Y.inputSource);if(Q===-1)return;let fe=S[Q];fe!==void 0&&(fe.update(Y.inputSource,Y.frame,u||a),fe.dispatchEvent({type:Y.type,data:Y.inputSource}))}function k(){r.removeEventListener("select",U),r.removeEventListener("selectstart",U),r.removeEventListener("selectend",U),r.removeEventListener("squeeze",U),r.removeEventListener("squeezestart",U),r.removeEventListener("squeezeend",U),r.removeEventListener("end",k),r.removeEventListener("inputsourceschange",W);for(let Y=0;Y<S.length;Y++){let Q=b[Y];Q!==null&&(b[Y]=null,S[Y].disconnect(Q))}C=null,L=null,y.reset(),e.setRenderTarget(d),p=null,c=null,f=null,r=null,v=null,Ie.stop(),n.isPresenting=!1,e.setPixelRatio(T),e.setSize(I.width,I.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){s=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){o=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return u||a},this.setReferenceSpace=function(Y){u=Y},this.getBaseLayer=function(){return c!==null?c:p},this.getBinding=function(){return f},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(Y){if(r=Y,r!==null){if(d=e.getRenderTarget(),r.addEventListener("select",U),r.addEventListener("selectstart",U),r.addEventListener("selectend",U),r.addEventListener("squeeze",U),r.addEventListener("squeezestart",U),r.addEventListener("squeezeend",U),r.addEventListener("end",k),r.addEventListener("inputsourceschange",W),m.xrCompatible!==!0&&await t.makeXRCompatible(),T=e.getPixelRatio(),e.getSize(I),r.renderState.layers===void 0){let Q={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};p=new XRWebGLLayer(r,t,Q),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),v=new Sn(p.framebufferWidth,p.framebufferHeight,{format:Qt,type:Mn,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let Q=null,fe=null,re=null;m.depth&&(re=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Q=m.stencil?Ki:Vi,fe=m.stencil?$i:ci);let be={colorFormat:t.RGBA8,depthFormat:re,scaleFactor:s};f=new XRWebGLBinding(r,t),c=f.createProjectionLayer(be),r.updateRenderState({layers:[c]}),e.setPixelRatio(1),e.setSize(c.textureWidth,c.textureHeight,!1),v=new Sn(c.textureWidth,c.textureHeight,{format:Qt,type:Mn,depthTexture:new Rs(c.textureWidth,c.textureHeight,fe,void 0,void 0,void 0,void 0,void 0,void 0,Q),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:c.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),u=null,a=await r.requestReferenceSpace(o),Ie.setContext(r),Ie.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return y.getDepthTexture()};function W(Y){for(let Q=0;Q<Y.removed.length;Q++){let fe=Y.removed[Q],re=b.indexOf(fe);re>=0&&(b[re]=null,S[re].disconnect(fe))}for(let Q=0;Q<Y.added.length;Q++){let fe=Y.added[Q],re=b.indexOf(fe);if(re===-1){for(let Te=0;Te<S.length;Te++)if(Te>=b.length){b.push(fe),re=Te;break}else if(b[Te]===null){b[Te]=fe,re=Te;break}if(re===-1)break}let be=S[re];be&&be.connect(fe)}}let O=new P,$=new P;function B(Y,Q,fe){O.setFromMatrixPosition(Q.matrixWorld),$.setFromMatrixPosition(fe.matrixWorld);let re=O.distanceTo($),be=Q.projectionMatrix.elements,Te=fe.projectionMatrix.elements,Ue=be[14]/(be[10]-1),ut=be[14]/(be[10]+1),qe=(be[9]+1)/be[5],ft=(be[9]-1)/be[5],F=(be[8]-1)/be[0],Ot=(Te[8]+1)/Te[0],Ge=Ue*F,We=Ue*Ot,Ae=re/(-F+Ot),at=Ae*-F;if(Q.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(at),Y.translateZ(Ae),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),be[10]===-1)Y.projectionMatrix.copy(Q.projectionMatrix),Y.projectionMatrixInverse.copy(Q.projectionMatrixInverse);else{let we=Ue+Ae,R=ut+Ae,M=Ge-at,H=We+(re-at),K=qe*ut/R*we,j=ft*ut/R*we;Y.projectionMatrix.makePerspective(M,H,K,j,we,R),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function ee(Y,Q){Q===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(Q.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(r===null)return;let Q=Y.near,fe=Y.far;y.texture!==null&&(y.depthNear>0&&(Q=y.depthNear),y.depthFar>0&&(fe=y.depthFar)),_.near=A.near=w.near=Q,_.far=A.far=w.far=fe,(C!==_.near||L!==_.far)&&(r.updateRenderState({depthNear:_.near,depthFar:_.far}),C=_.near,L=_.far),w.layers.mask=Y.layers.mask|2,A.layers.mask=Y.layers.mask|4,_.layers.mask=w.layers.mask|A.layers.mask;let re=Y.parent,be=_.cameras;ee(_,re);for(let Te=0;Te<be.length;Te++)ee(be[Te],re);be.length===2?B(_,w,A):_.projectionMatrix.copy(w.projectionMatrix),ae(Y,_,re)};function ae(Y,Q,fe){fe===null?Y.matrix.copy(Q.matrixWorld):(Y.matrix.copy(fe.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(Q.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(Q.projectionMatrix),Y.projectionMatrixInverse.copy(Q.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=Mo*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return _},this.getFoveation=function(){if(!(c===null&&p===null))return l},this.setFoveation=function(Y){l=Y,c!==null&&(c.fixedFoveation=Y),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Y)},this.hasDepthSensing=function(){return y.texture!==null},this.getDepthSensingMesh=function(){return y.getMesh(_)};let X=null;function se(Y,Q){if(h=Q.getViewerPose(u||a),g=Q,h!==null){let fe=h.views;p!==null&&(e.setRenderTargetFramebuffer(v,p.framebuffer),e.setRenderTarget(v));let re=!1;fe.length!==_.cameras.length&&(_.cameras.length=0,re=!0);for(let Te=0;Te<fe.length;Te++){let Ue=fe[Te],ut=null;if(p!==null)ut=p.getViewport(Ue);else{let ft=f.getViewSubImage(c,Ue);ut=ft.viewport,Te===0&&(e.setRenderTargetTextures(v,ft.colorTexture,c.ignoreDepthValues?void 0:ft.depthStencilTexture),e.setRenderTarget(v))}let qe=x[Te];qe===void 0&&(qe=new Tt,qe.layers.enable(Te),qe.viewport=new nt,x[Te]=qe),qe.matrix.fromArray(Ue.transform.matrix),qe.matrix.decompose(qe.position,qe.quaternion,qe.scale),qe.projectionMatrix.fromArray(Ue.projectionMatrix),qe.projectionMatrixInverse.copy(qe.projectionMatrix).invert(),qe.viewport.set(ut.x,ut.y,ut.width,ut.height),Te===0&&(_.matrix.copy(qe.matrix),_.matrix.decompose(_.position,_.quaternion,_.scale)),re===!0&&_.cameras.push(qe)}let be=r.enabledFeatures;if(be&&be.includes("depth-sensing")){let Te=f.getDepthInformation(fe[0]);Te&&Te.isValid&&Te.texture&&y.init(e,Te,r.renderState)}}for(let fe=0;fe<S.length;fe++){let re=b[fe],be=S[fe];re!==null&&be!==void 0&&be.update(re,Q,u||a)}X&&X(Y,Q),Q.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Q}),g=null}let Ie=new ph;Ie.setAnimationLoop(se),this.setAnimationLoop=function(Y){X=Y},this.dispose=function(){}}},ii=new Wt,V0=new De;function G0(i,e){function t(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function n(m,d){d.color.getRGB(m.fogColor.value,fh(i)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function r(m,d,v,S,b){d.isMeshBasicMaterial||d.isMeshLambertMaterial?s(m,d):d.isMeshToonMaterial?(s(m,d),f(m,d)):d.isMeshPhongMaterial?(s(m,d),h(m,d)):d.isMeshStandardMaterial?(s(m,d),c(m,d),d.isMeshPhysicalMaterial&&p(m,d,b)):d.isMeshMatcapMaterial?(s(m,d),g(m,d)):d.isMeshDepthMaterial?s(m,d):d.isMeshDistanceMaterial?(s(m,d),y(m,d)):d.isMeshNormalMaterial?s(m,d):d.isLineBasicMaterial?(a(m,d),d.isLineDashedMaterial&&o(m,d)):d.isPointsMaterial?l(m,d,v,S):d.isSpriteMaterial?u(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function s(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,t(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===Ut&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,t(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===Ut&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,t(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,t(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);let v=e.get(d),S=v.envMap,b=v.envMapRotation;S&&(m.envMap.value=S,ii.copy(b),ii.x*=-1,ii.y*=-1,ii.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(ii.y*=-1,ii.z*=-1),m.envMapRotation.value.setFromMatrix4(V0.makeRotationFromEuler(ii)),m.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,m.aoMapTransform))}function a(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform))}function o(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,v,S){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*v,m.scale.value=S*.5,d.map&&(m.map.value=d.map,t(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function u(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function f(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function c(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function p(m,d,v){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Ut&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=v.texture,m.transmissionSamplerSize.value.set(v.width,v.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,d){d.matcap&&(m.matcap.value=d.matcap)}function y(m,d){let v=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(v.matrixWorld),m.nearDistance.value=v.shadow.camera.near,m.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function W0(i,e,t,n){let r={},s={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,S){let b=S.program;n.uniformBlockBinding(v,b)}function u(v,S){let b=r[v.id];b===void 0&&(g(v),b=h(v),r[v.id]=b,v.addEventListener("dispose",m));let I=S.program;n.updateUBOMapping(v,I);let T=e.render.frame;s[v.id]!==T&&(c(v),s[v.id]=T)}function h(v){let S=f();v.__bindingPointIndex=S;let b=i.createBuffer(),I=v.__size,T=v.usage;return i.bindBuffer(i.UNIFORM_BUFFER,b),i.bufferData(i.UNIFORM_BUFFER,I,T),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,S,b),b}function f(){for(let v=0;v<o;v++)if(a.indexOf(v)===-1)return a.push(v),v;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function c(v){let S=r[v.id],b=v.uniforms,I=v.__cache;i.bindBuffer(i.UNIFORM_BUFFER,S);for(let T=0,w=b.length;T<w;T++){let A=Array.isArray(b[T])?b[T]:[b[T]];for(let x=0,_=A.length;x<_;x++){let C=A[x];if(p(C,T,x,I)===!0){let L=C.__offset,U=Array.isArray(C.value)?C.value:[C.value],k=0;for(let W=0;W<U.length;W++){let O=U[W],$=y(O);typeof O=="number"||typeof O=="boolean"?(C.__data[0]=O,i.bufferSubData(i.UNIFORM_BUFFER,L+k,C.__data)):O.isMatrix3?(C.__data[0]=O.elements[0],C.__data[1]=O.elements[1],C.__data[2]=O.elements[2],C.__data[3]=0,C.__data[4]=O.elements[3],C.__data[5]=O.elements[4],C.__data[6]=O.elements[5],C.__data[7]=0,C.__data[8]=O.elements[6],C.__data[9]=O.elements[7],C.__data[10]=O.elements[8],C.__data[11]=0):(O.toArray(C.__data,k),k+=$.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,L,C.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(v,S,b,I){let T=v.value,w=S+"_"+b;if(I[w]===void 0)return typeof T=="number"||typeof T=="boolean"?I[w]=T:I[w]=T.clone(),!0;{let A=I[w];if(typeof T=="number"||typeof T=="boolean"){if(A!==T)return I[w]=T,!0}else if(A.equals(T)===!1)return A.copy(T),!0}return!1}function g(v){let S=v.uniforms,b=0,I=16;for(let w=0,A=S.length;w<A;w++){let x=Array.isArray(S[w])?S[w]:[S[w]];for(let _=0,C=x.length;_<C;_++){let L=x[_],U=Array.isArray(L.value)?L.value:[L.value];for(let k=0,W=U.length;k<W;k++){let O=U[k],$=y(O),B=b%I,ee=B%$.boundary,ae=B+ee;b+=ee,ae!==0&&I-ae<$.storage&&(b+=I-ae),L.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=b,b+=$.storage}}}let T=b%I;return T>0&&(b+=I-T),v.__size=b,v.__cache={},this}function y(v){let S={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(S.boundary=4,S.storage=4):v.isVector2?(S.boundary=8,S.storage=8):v.isVector3||v.isColor?(S.boundary=16,S.storage=12):v.isVector4?(S.boundary=16,S.storage=16):v.isMatrix3?(S.boundary=48,S.storage=48):v.isMatrix4?(S.boundary=64,S.storage=64):v.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",v),S}function m(v){let S=v.target;S.removeEventListener("dispose",m);let b=a.indexOf(S.__bindingPointIndex);a.splice(b,1),i.deleteBuffer(r[S.id]),delete r[S.id],delete s[S.id]}function d(){for(let v in r)i.deleteBuffer(r[v]);a=[],r={},s={}}return{bind:l,update:u,dispose:d}}var Cs=class{constructor(e={}){let{canvas:t=Yu(),context:n=null,depth:r=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:u=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:f=!1,reverseDepthBuffer:c=!1}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=a;let g=new Uint32Array(4),y=new Int32Array(4),m=null,d=null,v=[],S=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=_t,this.toneMapping=Bn,this.toneMappingExposure=1;let b=this,I=!1,T=0,w=0,A=null,x=-1,_=null,C=new nt,L=new nt,U=null,k=new Ce(0),W=0,O=t.width,$=t.height,B=1,ee=null,ae=null,X=new nt(0,0,O,$),se=new nt(0,0,O,$),Ie=!1,Y=new Tr,Q=!1,fe=!1,re=new De,be=new De,Te=new P,Ue=new nt,ut={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},qe=!1;function ft(){return A===null?B:1}let F=n;function Ot(E,N){return t.getContext(E,N)}try{let E={alpha:!0,depth:r,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:u,powerPreference:h,failIfMajorPerformanceCaveat:f};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r170"),t.addEventListener("webglcontextlost",J,!1),t.addEventListener("webglcontextrestored",de,!1),t.addEventListener("webglcontextcreationerror",he,!1),F===null){let N="webgl2";if(F=Ot(N,E),F===null)throw Ot(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let Ge,We,Ae,at,we,R,M,H,K,j,Z,ve,ce,pe,Ye,te,me,Re,Pe,ge,Xe,ke,rt,D;function le(){Ge=new am(F),Ge.init(),ke=new k0(F,Ge),We=new em(F,Ge,e,ke),Ae=new N0(F,Ge),We.reverseDepthBuffer&&c&&Ae.buffers.depth.setReversed(!0),at=new cm(F),we=new M0,R=new F0(F,Ge,Ae,we,We,ke,at),M=new nm(b),H=new sm(b),K=new md(F),rt=new jp(F,K),j=new om(F,K,at,rt),Z=new um(F,j,K,at),Pe=new hm(F,We,R),te=new tm(we),ve=new v0(b,M,H,Ge,We,rt,te),ce=new G0(b,we),pe=new E0,Ye=new I0(Ge),Re=new Jp(b,M,H,Ae,Z,p,l),me=new D0(b,Z,We),D=new W0(F,at,We,Ae),ge=new Qp(F,Ge,at),Xe=new lm(F,Ge,at),at.programs=ve.programs,b.capabilities=We,b.extensions=Ge,b.properties=we,b.renderLists=pe,b.shadowMap=me,b.state=Ae,b.info=at}le();let q=new ko(b,F);this.xr=q,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){let E=Ge.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){let E=Ge.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return B},this.setPixelRatio=function(E){E!==void 0&&(B=E,this.setSize(O,$,!1))},this.getSize=function(E){return E.set(O,$)},this.setSize=function(E,N,V=!0){if(q.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}O=E,$=N,t.width=Math.floor(E*B),t.height=Math.floor(N*B),V===!0&&(t.style.width=E+"px",t.style.height=N+"px"),this.setViewport(0,0,E,N)},this.getDrawingBufferSize=function(E){return E.set(O*B,$*B).floor()},this.setDrawingBufferSize=function(E,N,V){O=E,$=N,B=V,t.width=Math.floor(E*V),t.height=Math.floor(N*V),this.setViewport(0,0,E,N)},this.getCurrentViewport=function(E){return E.copy(C)},this.getViewport=function(E){return E.copy(X)},this.setViewport=function(E,N,V,G){E.isVector4?X.set(E.x,E.y,E.z,E.w):X.set(E,N,V,G),Ae.viewport(C.copy(X).multiplyScalar(B).round())},this.getScissor=function(E){return E.copy(se)},this.setScissor=function(E,N,V,G){E.isVector4?se.set(E.x,E.y,E.z,E.w):se.set(E,N,V,G),Ae.scissor(L.copy(se).multiplyScalar(B).round())},this.getScissorTest=function(){return Ie},this.setScissorTest=function(E){Ae.setScissorTest(Ie=E)},this.setOpaqueSort=function(E){ee=E},this.setTransparentSort=function(E){ae=E},this.getClearColor=function(E){return E.copy(Re.getClearColor())},this.setClearColor=function(){Re.setClearColor.apply(Re,arguments)},this.getClearAlpha=function(){return Re.getClearAlpha()},this.setClearAlpha=function(){Re.setClearAlpha.apply(Re,arguments)},this.clear=function(E=!0,N=!0,V=!0){let G=0;if(E){let z=!1;if(A!==null){let ne=A.texture.format;z=ne===ll||ne===ol||ne===al}if(z){let ne=A.texture.type,ue=ne===Mn||ne===ci||ne===Sr||ne===$i||ne===il||ne===rl,xe=Re.getClearColor(),_e=Re.getClearAlpha(),Le=xe.r,ze=xe.g,ye=xe.b;ue?(g[0]=Le,g[1]=ze,g[2]=ye,g[3]=_e,F.clearBufferuiv(F.COLOR,0,g)):(y[0]=Le,y[1]=ze,y[2]=ye,y[3]=_e,F.clearBufferiv(F.COLOR,0,y))}else G|=F.COLOR_BUFFER_BIT}N&&(G|=F.DEPTH_BUFFER_BIT),V&&(G|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),F.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",J,!1),t.removeEventListener("webglcontextrestored",de,!1),t.removeEventListener("webglcontextcreationerror",he,!1),pe.dispose(),Ye.dispose(),we.dispose(),M.dispose(),H.dispose(),Z.dispose(),rt.dispose(),D.dispose(),ve.dispose(),q.dispose(),q.removeEventListener("sessionstart",Nl),q.removeEventListener("sessionend",zl),Jn.stop()};function J(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),I=!0}function de(){console.log("THREE.WebGLRenderer: Context Restored."),I=!1;let E=at.autoReset,N=me.enabled,V=me.autoUpdate,G=me.needsUpdate,z=me.type;le(),at.autoReset=E,me.enabled=N,me.autoUpdate=V,me.needsUpdate=G,me.type=z}function he(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function Ne(E){let N=E.target;N.removeEventListener("dispose",Ne),dt(N)}function dt(E){St(E),we.remove(E)}function St(E){let N=we.get(E).programs;N!==void 0&&(N.forEach(function(V){ve.releaseProgram(V)}),E.isShaderMaterial&&ve.releaseShaderCache(E))}this.renderBufferDirect=function(E,N,V,G,z,ne){N===null&&(N=ut);let ue=z.isMesh&&z.matrixWorld.determinant()<0,xe=ru(E,N,V,G,z);Ae.setMaterial(G,ue);let _e=V.index,Le=1;if(G.wireframe===!0){if(_e=j.getWireframeAttribute(V),_e===void 0)return;Le=2}let ze=V.drawRange,ye=V.attributes.position,$e=ze.start*Le,st=(ze.start+ze.count)*Le;ne!==null&&($e=Math.max($e,ne.start*Le),st=Math.min(st,(ne.start+ne.count)*Le)),_e!==null?($e=Math.max($e,0),st=Math.min(st,_e.count)):ye!=null&&($e=Math.max($e,0),st=Math.min(st,ye.count));let ot=st-$e;if(ot<0||ot===1/0)return;rt.setup(z,G,xe,V,_e);let Lt,Ke=ge;if(_e!==null&&(Lt=K.get(_e),Ke=Xe,Ke.setIndex(Lt)),z.isMesh)G.wireframe===!0?(Ae.setLineWidth(G.wireframeLinewidth*ft()),Ke.setMode(F.LINES)):Ke.setMode(F.TRIANGLES);else if(z.isLine){let Me=G.linewidth;Me===void 0&&(Me=1),Ae.setLineWidth(Me*ft()),z.isLineSegments?Ke.setMode(F.LINES):z.isLineLoop?Ke.setMode(F.LINE_LOOP):Ke.setMode(F.LINE_STRIP)}else z.isPoints?Ke.setMode(F.POINTS):z.isSprite&&Ke.setMode(F.TRIANGLES);if(z.isBatchedMesh)if(z._multiDrawInstances!==null)Ke.renderMultiDrawInstances(z._multiDrawStarts,z._multiDrawCounts,z._multiDrawCount,z._multiDrawInstances);else if(Ge.get("WEBGL_multi_draw"))Ke.renderMultiDraw(z._multiDrawStarts,z._multiDrawCounts,z._multiDrawCount);else{let Me=z._multiDrawStarts,dn=z._multiDrawCounts,Je=z._multiDrawCount,Zt=_e?K.get(_e).bytesPerElement:1,bi=we.get(G).currentProgram.getUniforms();for(let Nt=0;Nt<Je;Nt++)bi.setValue(F,"_gl_DrawID",Nt),Ke.render(Me[Nt]/Zt,dn[Nt])}else if(z.isInstancedMesh)Ke.renderInstances($e,ot,z.count);else if(V.isInstancedBufferGeometry){let Me=V._maxInstanceCount!==void 0?V._maxInstanceCount:1/0,dn=Math.min(V.instanceCount,Me);Ke.renderInstances($e,ot,dn)}else Ke.render($e,ot)};function je(E,N,V){E.transparent===!0&&E.side===jt&&E.forceSinglePass===!1?(E.side=Ut,E.needsUpdate=!0,Br(E,N,V),E.side=Hn,E.needsUpdate=!0,Br(E,N,V),E.side=jt):Br(E,N,V)}this.compile=function(E,N,V=null){V===null&&(V=E),d=Ye.get(V),d.init(N),S.push(d),V.traverseVisible(function(z){z.isLight&&z.layers.test(N.layers)&&(d.pushLight(z),z.castShadow&&d.pushShadow(z))}),E!==V&&E.traverseVisible(function(z){z.isLight&&z.layers.test(N.layers)&&(d.pushLight(z),z.castShadow&&d.pushShadow(z))}),d.setupLights();let G=new Set;return E.traverse(function(z){if(!(z.isMesh||z.isPoints||z.isLine||z.isSprite))return;let ne=z.material;if(ne)if(Array.isArray(ne))for(let ue=0;ue<ne.length;ue++){let xe=ne[ue];je(xe,V,z),G.add(xe)}else je(ne,V,z),G.add(ne)}),S.pop(),d=null,G},this.compileAsync=function(E,N,V=null){let G=this.compile(E,N,V);return new Promise(z=>{function ne(){if(G.forEach(function(ue){we.get(ue).currentProgram.isReady()&&G.delete(ue)}),G.size===0){z(E);return}setTimeout(ne,10)}Ge.get("KHR_parallel_shader_compile")!==null?ne():setTimeout(ne,10)})};let Yt=null;function un(E){Yt&&Yt(E)}function Nl(){Jn.stop()}function zl(){Jn.start()}let Jn=new ph;Jn.setAnimationLoop(un),typeof self<"u"&&Jn.setContext(self),this.setAnimationLoop=function(E){Yt=E,q.setAnimationLoop(E),E===null?Jn.stop():Jn.start()},q.addEventListener("sessionstart",Nl),q.addEventListener("sessionend",zl),this.render=function(E,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),q.enabled===!0&&q.isPresenting===!0&&(q.cameraAutoUpdate===!0&&q.updateCamera(N),N=q.getCamera()),E.isScene===!0&&E.onBeforeRender(b,E,N,A),d=Ye.get(E,S.length),d.init(N),S.push(d),be.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),Y.setFromProjectionMatrix(be),fe=this.localClippingEnabled,Q=te.init(this.clippingPlanes,fe),m=pe.get(E,v.length),m.init(),v.push(m),q.enabled===!0&&q.isPresenting===!0){let ne=b.xr.getDepthSensingMesh();ne!==null&&ta(ne,N,-1/0,b.sortObjects)}ta(E,N,0,b.sortObjects),m.finish(),b.sortObjects===!0&&m.sort(ee,ae),qe=q.enabled===!1||q.isPresenting===!1||q.hasDepthSensing()===!1,qe&&Re.addToRenderList(m,E),this.info.render.frame++,Q===!0&&te.beginShadows();let V=d.state.shadowsArray;me.render(V,E,N),Q===!0&&te.endShadows(),this.info.autoReset===!0&&this.info.reset();let G=m.opaque,z=m.transmissive;if(d.setupLights(),N.isArrayCamera){let ne=N.cameras;if(z.length>0)for(let ue=0,xe=ne.length;ue<xe;ue++){let _e=ne[ue];kl(G,z,E,_e)}qe&&Re.render(E);for(let ue=0,xe=ne.length;ue<xe;ue++){let _e=ne[ue];Fl(m,E,_e,_e.viewport)}}else z.length>0&&kl(G,z,E,N),qe&&Re.render(E),Fl(m,E,N);A!==null&&(R.updateMultisampleRenderTarget(A),R.updateRenderTargetMipmap(A)),E.isScene===!0&&E.onAfterRender(b,E,N),rt.resetDefaultState(),x=-1,_=null,S.pop(),S.length>0?(d=S[S.length-1],Q===!0&&te.setGlobalState(b.clippingPlanes,d.state.camera)):d=null,v.pop(),v.length>0?m=v[v.length-1]:m=null};function ta(E,N,V,G){if(E.visible===!1)return;if(E.layers.test(N.layers)){if(E.isGroup)V=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(N);else if(E.isLight)d.pushLight(E),E.castShadow&&d.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||Y.intersectsSprite(E)){G&&Ue.setFromMatrixPosition(E.matrixWorld).applyMatrix4(be);let ue=Z.update(E),xe=E.material;xe.visible&&m.push(E,ue,xe,V,Ue.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||Y.intersectsObject(E))){let ue=Z.update(E),xe=E.material;if(G&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Ue.copy(E.boundingSphere.center)):(ue.boundingSphere===null&&ue.computeBoundingSphere(),Ue.copy(ue.boundingSphere.center)),Ue.applyMatrix4(E.matrixWorld).applyMatrix4(be)),Array.isArray(xe)){let _e=ue.groups;for(let Le=0,ze=_e.length;Le<ze;Le++){let ye=_e[Le],$e=xe[ye.materialIndex];$e&&$e.visible&&m.push(E,ue,$e,V,Ue.z,ye)}}else xe.visible&&m.push(E,ue,xe,V,Ue.z,null)}}let ne=E.children;for(let ue=0,xe=ne.length;ue<xe;ue++)ta(ne[ue],N,V,G)}function Fl(E,N,V,G){let z=E.opaque,ne=E.transmissive,ue=E.transparent;d.setupLightsView(V),Q===!0&&te.setGlobalState(b.clippingPlanes,V),G&&Ae.viewport(C.copy(G)),z.length>0&&kr(z,N,V),ne.length>0&&kr(ne,N,V),ue.length>0&&kr(ue,N,V),Ae.buffers.depth.setTest(!0),Ae.buffers.depth.setMask(!0),Ae.buffers.color.setMask(!0),Ae.setPolygonOffset(!1)}function kl(E,N,V,G){if((V.isScene===!0?V.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[G.id]===void 0&&(d.state.transmissionRenderTarget[G.id]=new Sn(1,1,{generateMipmaps:!0,type:Ge.has("EXT_color_buffer_half_float")||Ge.has("EXT_color_buffer_float")?Dr:Mn,minFilter:li,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ze.workingColorSpace}));let ne=d.state.transmissionRenderTarget[G.id],ue=G.viewport||C;ne.setSize(ue.z,ue.w);let xe=b.getRenderTarget();b.setRenderTarget(ne),b.getClearColor(k),W=b.getClearAlpha(),W<1&&b.setClearColor(16777215,.5),b.clear(),qe&&Re.render(V);let _e=b.toneMapping;b.toneMapping=Bn;let Le=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),d.setupLightsView(G),Q===!0&&te.setGlobalState(b.clippingPlanes,G),kr(E,V,G),R.updateMultisampleRenderTarget(ne),R.updateRenderTargetMipmap(ne),Ge.has("WEBGL_multisampled_render_to_texture")===!1){let ze=!1;for(let ye=0,$e=N.length;ye<$e;ye++){let st=N[ye],ot=st.object,Lt=st.geometry,Ke=st.material,Me=st.group;if(Ke.side===jt&&ot.layers.test(G.layers)){let dn=Ke.side;Ke.side=Ut,Ke.needsUpdate=!0,Bl(ot,V,G,Lt,Ke,Me),Ke.side=dn,Ke.needsUpdate=!0,ze=!0}}ze===!0&&(R.updateMultisampleRenderTarget(ne),R.updateRenderTargetMipmap(ne))}b.setRenderTarget(xe),b.setClearColor(k,W),Le!==void 0&&(G.viewport=Le),b.toneMapping=_e}function kr(E,N,V){let G=N.isScene===!0?N.overrideMaterial:null;for(let z=0,ne=E.length;z<ne;z++){let ue=E[z],xe=ue.object,_e=ue.geometry,Le=G===null?ue.material:G,ze=ue.group;xe.layers.test(V.layers)&&Bl(xe,N,V,_e,Le,ze)}}function Bl(E,N,V,G,z,ne){E.onBeforeRender(b,N,V,G,z,ne),E.modelViewMatrix.multiplyMatrices(V.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),z.onBeforeRender(b,N,V,G,E,ne),z.transparent===!0&&z.side===jt&&z.forceSinglePass===!1?(z.side=Ut,z.needsUpdate=!0,b.renderBufferDirect(V,N,G,z,E,ne),z.side=Hn,z.needsUpdate=!0,b.renderBufferDirect(V,N,G,z,E,ne),z.side=jt):b.renderBufferDirect(V,N,G,z,E,ne),E.onAfterRender(b,N,V,G,z,ne)}function Br(E,N,V){N.isScene!==!0&&(N=ut);let G=we.get(E),z=d.state.lights,ne=d.state.shadowsArray,ue=z.state.version,xe=ve.getParameters(E,z.state,ne,N,V),_e=ve.getProgramCacheKey(xe),Le=G.programs;G.environment=E.isMeshStandardMaterial?N.environment:null,G.fog=N.fog,G.envMap=(E.isMeshStandardMaterial?H:M).get(E.envMap||G.environment),G.envMapRotation=G.environment!==null&&E.envMap===null?N.environmentRotation:E.envMapRotation,Le===void 0&&(E.addEventListener("dispose",Ne),Le=new Map,G.programs=Le);let ze=Le.get(_e);if(ze!==void 0){if(G.currentProgram===ze&&G.lightsStateVersion===ue)return Hl(E,xe),ze}else xe.uniforms=ve.getUniforms(E),E.onBeforeCompile(xe,b),ze=ve.acquireProgram(xe,_e),Le.set(_e,ze),G.uniforms=xe.uniforms;let ye=G.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(ye.clippingPlanes=te.uniform),Hl(E,xe),G.needsLights=au(E),G.lightsStateVersion=ue,G.needsLights&&(ye.ambientLightColor.value=z.state.ambient,ye.lightProbe.value=z.state.probe,ye.directionalLights.value=z.state.directional,ye.directionalLightShadows.value=z.state.directionalShadow,ye.spotLights.value=z.state.spot,ye.spotLightShadows.value=z.state.spotShadow,ye.rectAreaLights.value=z.state.rectArea,ye.ltc_1.value=z.state.rectAreaLTC1,ye.ltc_2.value=z.state.rectAreaLTC2,ye.pointLights.value=z.state.point,ye.pointLightShadows.value=z.state.pointShadow,ye.hemisphereLights.value=z.state.hemi,ye.directionalShadowMap.value=z.state.directionalShadowMap,ye.directionalShadowMatrix.value=z.state.directionalShadowMatrix,ye.spotShadowMap.value=z.state.spotShadowMap,ye.spotLightMatrix.value=z.state.spotLightMatrix,ye.spotLightMap.value=z.state.spotLightMap,ye.pointShadowMap.value=z.state.pointShadowMap,ye.pointShadowMatrix.value=z.state.pointShadowMatrix),G.currentProgram=ze,G.uniformsList=null,ze}function Ol(E){if(E.uniformsList===null){let N=E.currentProgram.getUniforms();E.uniformsList=Wi.seqWithValue(N.seq,E.uniforms)}return E.uniformsList}function Hl(E,N){let V=we.get(E);V.outputColorSpace=N.outputColorSpace,V.batching=N.batching,V.batchingColor=N.batchingColor,V.instancing=N.instancing,V.instancingColor=N.instancingColor,V.instancingMorph=N.instancingMorph,V.skinning=N.skinning,V.morphTargets=N.morphTargets,V.morphNormals=N.morphNormals,V.morphColors=N.morphColors,V.morphTargetsCount=N.morphTargetsCount,V.numClippingPlanes=N.numClippingPlanes,V.numIntersection=N.numClipIntersection,V.vertexAlphas=N.vertexAlphas,V.vertexTangents=N.vertexTangents,V.toneMapping=N.toneMapping}function ru(E,N,V,G,z){N.isScene!==!0&&(N=ut),R.resetTextureUnits();let ne=N.fog,ue=G.isMeshStandardMaterial?N.environment:null,xe=A===null?b.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:er,_e=(G.isMeshStandardMaterial?H:M).get(G.envMap||ue),Le=G.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,ze=!!V.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),ye=!!V.morphAttributes.position,$e=!!V.morphAttributes.normal,st=!!V.morphAttributes.color,ot=Bn;G.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(ot=b.toneMapping);let Lt=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,Ke=Lt!==void 0?Lt.length:0,Me=we.get(G),dn=d.state.lights;if(Q===!0&&(fe===!0||E!==_)){let Ht=E===_&&G.id===x;te.setState(G,E,Ht)}let Je=!1;G.version===Me.__version?(Me.needsLights&&Me.lightsStateVersion!==dn.state.version||Me.outputColorSpace!==xe||z.isBatchedMesh&&Me.batching===!1||!z.isBatchedMesh&&Me.batching===!0||z.isBatchedMesh&&Me.batchingColor===!0&&z.colorTexture===null||z.isBatchedMesh&&Me.batchingColor===!1&&z.colorTexture!==null||z.isInstancedMesh&&Me.instancing===!1||!z.isInstancedMesh&&Me.instancing===!0||z.isSkinnedMesh&&Me.skinning===!1||!z.isSkinnedMesh&&Me.skinning===!0||z.isInstancedMesh&&Me.instancingColor===!0&&z.instanceColor===null||z.isInstancedMesh&&Me.instancingColor===!1&&z.instanceColor!==null||z.isInstancedMesh&&Me.instancingMorph===!0&&z.morphTexture===null||z.isInstancedMesh&&Me.instancingMorph===!1&&z.morphTexture!==null||Me.envMap!==_e||G.fog===!0&&Me.fog!==ne||Me.numClippingPlanes!==void 0&&(Me.numClippingPlanes!==te.numPlanes||Me.numIntersection!==te.numIntersection)||Me.vertexAlphas!==Le||Me.vertexTangents!==ze||Me.morphTargets!==ye||Me.morphNormals!==$e||Me.morphColors!==st||Me.toneMapping!==ot||Me.morphTargetsCount!==Ke)&&(Je=!0):(Je=!0,Me.__version=G.version);let Zt=Me.currentProgram;Je===!0&&(Zt=Br(G,N,z));let bi=!1,Nt=!1,lr=!1,lt=Zt.getUniforms(),rn=Me.uniforms;if(Ae.useProgram(Zt.program)&&(bi=!0,Nt=!0,lr=!0),G.id!==x&&(x=G.id,Nt=!0),bi||_!==E){Ae.buffers.depth.getReversed()?(re.copy(E.projectionMatrix),$u(re),Ku(re),lt.setValue(F,"projectionMatrix",re)):lt.setValue(F,"projectionMatrix",E.projectionMatrix),lt.setValue(F,"viewMatrix",E.matrixWorldInverse);let Rn=lt.map.cameraPosition;Rn!==void 0&&Rn.setValue(F,Te.setFromMatrixPosition(E.matrixWorld)),We.logarithmicDepthBuffer&&lt.setValue(F,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&lt.setValue(F,"isOrthographic",E.isOrthographicCamera===!0),_!==E&&(_=E,Nt=!0,lr=!0)}if(z.isSkinnedMesh){lt.setOptional(F,z,"bindMatrix"),lt.setOptional(F,z,"bindMatrixInverse");let Ht=z.skeleton;Ht&&(Ht.boneTexture===null&&Ht.computeBoneTexture(),lt.setValue(F,"boneTexture",Ht.boneTexture,R))}z.isBatchedMesh&&(lt.setOptional(F,z,"batchingTexture"),lt.setValue(F,"batchingTexture",z._matricesTexture,R),lt.setOptional(F,z,"batchingIdTexture"),lt.setValue(F,"batchingIdTexture",z._indirectTexture,R),lt.setOptional(F,z,"batchingColorTexture"),z._colorsTexture!==null&&lt.setValue(F,"batchingColorTexture",z._colorsTexture,R));let cr=V.morphAttributes;if((cr.position!==void 0||cr.normal!==void 0||cr.color!==void 0)&&Pe.update(z,V,Zt),(Nt||Me.receiveShadow!==z.receiveShadow)&&(Me.receiveShadow=z.receiveShadow,lt.setValue(F,"receiveShadow",z.receiveShadow)),G.isMeshGouraudMaterial&&G.envMap!==null&&(rn.envMap.value=_e,rn.flipEnvMap.value=_e.isCubeTexture&&_e.isRenderTargetTexture===!1?-1:1),G.isMeshStandardMaterial&&G.envMap===null&&N.environment!==null&&(rn.envMapIntensity.value=N.environmentIntensity),Nt&&(lt.setValue(F,"toneMappingExposure",b.toneMappingExposure),Me.needsLights&&su(rn,lr),ne&&G.fog===!0&&ce.refreshFogUniforms(rn,ne),ce.refreshMaterialUniforms(rn,G,B,$,d.state.transmissionRenderTarget[E.id]),Wi.upload(F,Ol(Me),rn,R)),G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(Wi.upload(F,Ol(Me),rn,R),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&lt.setValue(F,"center",z.center),lt.setValue(F,"modelViewMatrix",z.modelViewMatrix),lt.setValue(F,"normalMatrix",z.normalMatrix),lt.setValue(F,"modelMatrix",z.matrixWorld),G.isShaderMaterial||G.isRawShaderMaterial){let Ht=G.uniformsGroups;for(let Rn=0,Cn=Ht.length;Rn<Cn;Rn++){let Vl=Ht[Rn];D.update(Vl,Zt),D.bind(Vl,Zt)}}return Zt}function su(E,N){E.ambientLightColor.needsUpdate=N,E.lightProbe.needsUpdate=N,E.directionalLights.needsUpdate=N,E.directionalLightShadows.needsUpdate=N,E.pointLights.needsUpdate=N,E.pointLightShadows.needsUpdate=N,E.spotLights.needsUpdate=N,E.spotLightShadows.needsUpdate=N,E.rectAreaLights.needsUpdate=N,E.hemisphereLights.needsUpdate=N}function au(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return T},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(E,N,V){we.get(E.texture).__webglTexture=N,we.get(E.depthTexture).__webglTexture=V;let G=we.get(E);G.__hasExternalTextures=!0,G.__autoAllocateDepthBuffer=V===void 0,G.__autoAllocateDepthBuffer||Ge.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),G.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,N){let V=we.get(E);V.__webglFramebuffer=N,V.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(E,N=0,V=0){A=E,T=N,w=V;let G=!0,z=null,ne=!1,ue=!1;if(E){let _e=we.get(E);if(_e.__useDefaultFramebuffer!==void 0)Ae.bindFramebuffer(F.FRAMEBUFFER,null),G=!1;else if(_e.__webglFramebuffer===void 0)R.setupRenderTarget(E);else if(_e.__hasExternalTextures)R.rebindTextures(E,we.get(E.texture).__webglTexture,we.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){let ye=E.depthTexture;if(_e.__boundDepthTexture!==ye){if(ye!==null&&we.has(ye)&&(E.width!==ye.image.width||E.height!==ye.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");R.setupDepthRenderbuffer(E)}}let Le=E.texture;(Le.isData3DTexture||Le.isDataArrayTexture||Le.isCompressedArrayTexture)&&(ue=!0);let ze=we.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(ze[N])?z=ze[N][V]:z=ze[N],ne=!0):E.samples>0&&R.useMultisampledRTT(E)===!1?z=we.get(E).__webglMultisampledFramebuffer:Array.isArray(ze)?z=ze[V]:z=ze,C.copy(E.viewport),L.copy(E.scissor),U=E.scissorTest}else C.copy(X).multiplyScalar(B).floor(),L.copy(se).multiplyScalar(B).floor(),U=Ie;if(Ae.bindFramebuffer(F.FRAMEBUFFER,z)&&G&&Ae.drawBuffers(E,z),Ae.viewport(C),Ae.scissor(L),Ae.setScissorTest(U),ne){let _e=we.get(E.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+N,_e.__webglTexture,V)}else if(ue){let _e=we.get(E.texture),Le=N||0;F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,_e.__webglTexture,V||0,Le)}x=-1},this.readRenderTargetPixels=function(E,N,V,G,z,ne,ue){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let xe=we.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&ue!==void 0&&(xe=xe[ue]),xe){Ae.bindFramebuffer(F.FRAMEBUFFER,xe);try{let _e=E.texture,Le=_e.format,ze=_e.type;if(!We.textureFormatReadable(Le)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!We.textureTypeReadable(ze)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=E.width-G&&V>=0&&V<=E.height-z&&F.readPixels(N,V,G,z,ke.convert(Le),ke.convert(ze),ne)}finally{let _e=A!==null?we.get(A).__webglFramebuffer:null;Ae.bindFramebuffer(F.FRAMEBUFFER,_e)}}},this.readRenderTargetPixelsAsync=async function(E,N,V,G,z,ne,ue){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let xe=we.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&ue!==void 0&&(xe=xe[ue]),xe){let _e=E.texture,Le=_e.format,ze=_e.type;if(!We.textureFormatReadable(Le))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!We.textureTypeReadable(ze))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(N>=0&&N<=E.width-G&&V>=0&&V<=E.height-z){Ae.bindFramebuffer(F.FRAMEBUFFER,xe);let ye=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,ye),F.bufferData(F.PIXEL_PACK_BUFFER,ne.byteLength,F.STREAM_READ),F.readPixels(N,V,G,z,ke.convert(Le),ke.convert(ze),0);let $e=A!==null?we.get(A).__webglFramebuffer:null;Ae.bindFramebuffer(F.FRAMEBUFFER,$e);let st=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await Zu(F,st,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,ye),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,ne),F.deleteBuffer(ye),F.deleteSync(st),ne}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,N=null,V=0){E.isTexture!==!0&&(br("WebGLRenderer: copyFramebufferToTexture function signature has changed."),N=arguments[0]||null,E=arguments[1]);let G=Math.pow(2,-V),z=Math.floor(E.image.width*G),ne=Math.floor(E.image.height*G),ue=N!==null?N.x:0,xe=N!==null?N.y:0;R.setTexture2D(E,0),F.copyTexSubImage2D(F.TEXTURE_2D,V,0,0,ue,xe,z,ne),Ae.unbindTexture()},this.copyTextureToTexture=function(E,N,V=null,G=null,z=0){E.isTexture!==!0&&(br("WebGLRenderer: copyTextureToTexture function signature has changed."),G=arguments[0]||null,E=arguments[1],N=arguments[2],z=arguments[3]||0,V=null);let ne,ue,xe,_e,Le,ze,ye,$e,st,ot=E.isCompressedTexture?E.mipmaps[z]:E.image;V!==null?(ne=V.max.x-V.min.x,ue=V.max.y-V.min.y,xe=V.isBox3?V.max.z-V.min.z:1,_e=V.min.x,Le=V.min.y,ze=V.isBox3?V.min.z:0):(ne=ot.width,ue=ot.height,xe=ot.depth||1,_e=0,Le=0,ze=0),G!==null?(ye=G.x,$e=G.y,st=G.z):(ye=0,$e=0,st=0);let Lt=ke.convert(N.format),Ke=ke.convert(N.type),Me;N.isData3DTexture?(R.setTexture3D(N,0),Me=F.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(R.setTexture2DArray(N,0),Me=F.TEXTURE_2D_ARRAY):(R.setTexture2D(N,0),Me=F.TEXTURE_2D),F.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,N.flipY),F.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),F.pixelStorei(F.UNPACK_ALIGNMENT,N.unpackAlignment);let dn=F.getParameter(F.UNPACK_ROW_LENGTH),Je=F.getParameter(F.UNPACK_IMAGE_HEIGHT),Zt=F.getParameter(F.UNPACK_SKIP_PIXELS),bi=F.getParameter(F.UNPACK_SKIP_ROWS),Nt=F.getParameter(F.UNPACK_SKIP_IMAGES);F.pixelStorei(F.UNPACK_ROW_LENGTH,ot.width),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,ot.height),F.pixelStorei(F.UNPACK_SKIP_PIXELS,_e),F.pixelStorei(F.UNPACK_SKIP_ROWS,Le),F.pixelStorei(F.UNPACK_SKIP_IMAGES,ze);let lr=E.isDataArrayTexture||E.isData3DTexture,lt=N.isDataArrayTexture||N.isData3DTexture;if(E.isRenderTargetTexture||E.isDepthTexture){let rn=we.get(E),cr=we.get(N),Ht=we.get(rn.__renderTarget),Rn=we.get(cr.__renderTarget);Ae.bindFramebuffer(F.READ_FRAMEBUFFER,Ht.__webglFramebuffer),Ae.bindFramebuffer(F.DRAW_FRAMEBUFFER,Rn.__webglFramebuffer);for(let Cn=0;Cn<xe;Cn++)lr&&F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,we.get(E).__webglTexture,z,ze+Cn),E.isDepthTexture?(lt&&F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,we.get(N).__webglTexture,z,st+Cn),F.blitFramebuffer(_e,Le,ne,ue,ye,$e,ne,ue,F.DEPTH_BUFFER_BIT,F.NEAREST)):lt?F.copyTexSubImage3D(Me,z,ye,$e,st+Cn,_e,Le,ne,ue):F.copyTexSubImage2D(Me,z,ye,$e,st+Cn,_e,Le,ne,ue);Ae.bindFramebuffer(F.READ_FRAMEBUFFER,null),Ae.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else lt?E.isDataTexture||E.isData3DTexture?F.texSubImage3D(Me,z,ye,$e,st,ne,ue,xe,Lt,Ke,ot.data):N.isCompressedArrayTexture?F.compressedTexSubImage3D(Me,z,ye,$e,st,ne,ue,xe,Lt,ot.data):F.texSubImage3D(Me,z,ye,$e,st,ne,ue,xe,Lt,Ke,ot):E.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,z,ye,$e,ne,ue,Lt,Ke,ot.data):E.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,z,ye,$e,ot.width,ot.height,Lt,ot.data):F.texSubImage2D(F.TEXTURE_2D,z,ye,$e,ne,ue,Lt,Ke,ot);F.pixelStorei(F.UNPACK_ROW_LENGTH,dn),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,Je),F.pixelStorei(F.UNPACK_SKIP_PIXELS,Zt),F.pixelStorei(F.UNPACK_SKIP_ROWS,bi),F.pixelStorei(F.UNPACK_SKIP_IMAGES,Nt),z===0&&N.generateMipmaps&&F.generateMipmap(Me),Ae.unbindTexture()},this.copyTextureToTexture3D=function(E,N,V=null,G=null,z=0){return E.isTexture!==!0&&(br("WebGLRenderer: copyTextureToTexture3D function signature has changed."),V=arguments[0]||null,G=arguments[1]||null,E=arguments[2],N=arguments[3],z=arguments[4]||0),br('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(E,N,V,G,z)},this.initRenderTarget=function(E){we.get(E).__webglFramebuffer===void 0&&R.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?R.setTextureCube(E,0):E.isData3DTexture?R.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?R.setTexture2DArray(E,0):R.setTexture2D(E,0),Ae.unbindTexture()},this.resetState=function(){T=0,w=0,A=null,Ae.reset(),rt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return bn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorspace=Ze._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ze._getUnpackColorSpace()}};var Is=class i{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Ce(e),this.near=t,this.far=n}clone(){return new i(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Ps=class extends Rt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Wt,this.environmentIntensity=1,this.environmentRotation=new Wt,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Ls=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=vo,this.updateRanges=[],this.version=0,this.uuid=On()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=On()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=On()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},Ct=new P,Ar=class i{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyMatrix4(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyNormalMatrix(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.transformDirection(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=an(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=tt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=an(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=an(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=an(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=an(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),r=tt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),r=tt(r,this.array),s=tt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new xt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let r=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Xn=class extends Wn{static get type(){return"SpriteMaterial"}constructor(e){super(),this.isSpriteMaterial=!0,this.color=new Ce(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Ni,pr=new P,zi=new P,Fi=new P,ki=new Ee,mr=new Ee,yh=new De,os=new P,gr=new P,ls=new P,Hc=new Ee,La=new Ee,Vc=new Ee,qn=class extends Rt{constructor(e=new Xn){if(super(),this.isSprite=!0,this.type="Sprite",Ni===void 0){Ni=new pt;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Ls(t,5);Ni.setIndex([0,1,2,0,2,3]),Ni.setAttribute("position",new Ar(n,3,0,!1)),Ni.setAttribute("uv",new Ar(n,2,3,!1))}this.geometry=Ni,this.material=e,this.center=new Ee(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),zi.setFromMatrixScale(this.matrixWorld),yh.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Fi.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&zi.multiplyScalar(-Fi.z);let n=this.material.rotation,r,s;n!==0&&(s=Math.cos(n),r=Math.sin(n));let a=this.center;cs(os.set(-.5,-.5,0),Fi,a,zi,r,s),cs(gr.set(.5,-.5,0),Fi,a,zi,r,s),cs(ls.set(.5,.5,0),Fi,a,zi,r,s),Hc.set(0,0),La.set(1,0),Vc.set(1,1);let o=e.ray.intersectTriangle(os,gr,ls,!1,pr);if(o===null&&(cs(gr.set(-.5,.5,0),Fi,a,zi,r,s),La.set(0,1),o=e.ray.intersectTriangle(os,ls,gr,!1,pr),o===null))return;let l=e.ray.origin.distanceTo(pr);l<e.near||l>e.far||t.push({distance:l,point:pr.clone(),uv:Fn.getInterpolation(pr,os,gr,ls,Hc,La,Vc,new Ee),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function cs(i,e,t,n,r,s){ki.subVectors(i,t).addScalar(.5).multiply(n),r!==void 0?(mr.x=s*ki.x-r*ki.y,mr.y=r*ki.x+s*ki.y):mr.copy(ki),i.copy(e),i.x+=mr.x,i.y+=mr.y,i.applyMatrix4(yh)}var Bo=class extends Pt{constructor(e=null,t=1,n=1,r,s,a,o,l,u=kt,h=kt,f,c){super(null,a,o,l,u,h,r,s,f,c),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Rr=class extends xt{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Bi=new De,Gc=new De,hs=[],Wc=new En,X0=new De,xr=new it,_r=new hi,Ds=class extends it{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Rr(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<n;r++)this.setMatrixAt(r,X0)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new En),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Bi),Wc.copy(e.boundingBox).applyMatrix4(Bi),this.boundingBox.union(Wc)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new hi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Bi),_r.copy(e.boundingSphere).applyMatrix4(Bi),this.boundingSphere.union(_r)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,s=n.length+1,a=e*s+1;for(let o=0;o<n.length;o++)n[o]=r[a+o]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(xr.geometry=this.geometry,xr.material=this.material,xr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),_r.copy(this.boundingSphere),_r.applyMatrix4(n),e.ray.intersectsSphere(_r)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,Bi),Gc.multiplyMatrices(n,Bi),xr.matrixWorld=Gc,xr.raycast(e,hs);for(let a=0,o=hs.length;a<o;a++){let l=hs[a];l.instanceId=s,l.object=this,t.push(l)}hs.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Rr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new Bo(new Float32Array(r*this.count),r,this.count,sl,ln));let s=this.morphTexture.source.data.data,a=0;for(let u=0;u<n.length;u++)a+=n[u];let o=this.geometry.morphTargetsRelative?1:1-a,l=r*e;s[l]=o,s.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}};var wn=class extends Pt{constructor(e,t,n,r,s,a,o,l,u){super(e,t,n,r,s,a,o,l,u),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Us=class i extends pt{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let s=[],a=[],o=[],l=[],u=new P,h=new Ee;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let f=0,c=3;f<=t;f++,c+=3){let p=n+f/t*r;u.x=e*Math.cos(p),u.y=e*Math.sin(p),a.push(u.x,u.y,u.z),o.push(0,0,1),h.x=(a[c]/e+1)/2,h.y=(a[c+1]/e+1)/2,l.push(h.x,h.y)}for(let f=1;f<=t;f++)s.push(f,f+1,0);this.setIndex(s),this.setAttribute("position",new He(a,3)),this.setAttribute("normal",new He(o,3)),this.setAttribute("uv",new He(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}},Oe=class i extends pt{constructor(e=1,t=1,n=1,r=32,s=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:l};let u=this;r=Math.floor(r),s=Math.floor(s);let h=[],f=[],c=[],p=[],g=0,y=[],m=n/2,d=0;v(),a===!1&&(e>0&&S(!0),t>0&&S(!1)),this.setIndex(h),this.setAttribute("position",new He(f,3)),this.setAttribute("normal",new He(c,3)),this.setAttribute("uv",new He(p,2));function v(){let b=new P,I=new P,T=0,w=(t-e)/n;for(let A=0;A<=s;A++){let x=[],_=A/s,C=_*(t-e)+e;for(let L=0;L<=r;L++){let U=L/r,k=U*l+o,W=Math.sin(k),O=Math.cos(k);I.x=C*W,I.y=-_*n+m,I.z=C*O,f.push(I.x,I.y,I.z),b.set(W,w,O).normalize(),c.push(b.x,b.y,b.z),p.push(U,1-_),x.push(g++)}y.push(x)}for(let A=0;A<r;A++)for(let x=0;x<s;x++){let _=y[x][A],C=y[x+1][A],L=y[x+1][A+1],U=y[x][A+1];(e>0||x!==0)&&(h.push(_,C,U),T+=3),(t>0||x!==s-1)&&(h.push(C,L,U),T+=3)}u.addGroup(d,T,0),d+=T}function S(b){let I=g,T=new Ee,w=new P,A=0,x=b===!0?e:t,_=b===!0?1:-1;for(let L=1;L<=r;L++)f.push(0,m*_,0),c.push(0,_,0),p.push(.5,.5),g++;let C=g;for(let L=0;L<=r;L++){let k=L/r*l+o,W=Math.cos(k),O=Math.sin(k);w.x=x*O,w.y=m*_,w.z=x*W,f.push(w.x,w.y,w.z),c.push(0,_,0),T.x=W*.5+.5,T.y=O*.5*_+.5,p.push(T.x,T.y),g++}for(let L=0;L<r;L++){let U=I+L,k=C+L;b===!0?h.push(k,k+1,U):h.push(k+1,k,U),A+=3}u.addGroup(d,A,b===!0?1:2),d+=A}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Mt=class i extends Oe{constructor(e=1,t=1,n=32,r=1,s=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,s,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:s,thetaStart:a,thetaLength:o}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Ns=class i extends pt{constructor(e=[],t=[],n=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:r};let s=[],a=[];o(r),u(n),h(),this.setAttribute("position",new He(s,3)),this.setAttribute("normal",new He(s.slice(),3)),this.setAttribute("uv",new He(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(v){let S=new P,b=new P,I=new P;for(let T=0;T<t.length;T+=3)p(t[T+0],S),p(t[T+1],b),p(t[T+2],I),l(S,b,I,v)}function l(v,S,b,I){let T=I+1,w=[];for(let A=0;A<=T;A++){w[A]=[];let x=v.clone().lerp(b,A/T),_=S.clone().lerp(b,A/T),C=T-A;for(let L=0;L<=C;L++)L===0&&A===T?w[A][L]=x:w[A][L]=x.clone().lerp(_,L/C)}for(let A=0;A<T;A++)for(let x=0;x<2*(T-A)-1;x++){let _=Math.floor(x/2);x%2===0?(c(w[A][_+1]),c(w[A+1][_]),c(w[A][_])):(c(w[A][_+1]),c(w[A+1][_+1]),c(w[A+1][_]))}}function u(v){let S=new P;for(let b=0;b<s.length;b+=3)S.x=s[b+0],S.y=s[b+1],S.z=s[b+2],S.normalize().multiplyScalar(v),s[b+0]=S.x,s[b+1]=S.y,s[b+2]=S.z}function h(){let v=new P;for(let S=0;S<s.length;S+=3){v.x=s[S+0],v.y=s[S+1],v.z=s[S+2];let b=m(v)/2/Math.PI+.5,I=d(v)/Math.PI+.5;a.push(b,1-I)}g(),f()}function f(){for(let v=0;v<a.length;v+=6){let S=a[v+0],b=a[v+2],I=a[v+4],T=Math.max(S,b,I),w=Math.min(S,b,I);T>.9&&w<.1&&(S<.2&&(a[v+0]+=1),b<.2&&(a[v+2]+=1),I<.2&&(a[v+4]+=1))}}function c(v){s.push(v.x,v.y,v.z)}function p(v,S){let b=v*3;S.x=e[b+0],S.y=e[b+1],S.z=e[b+2]}function g(){let v=new P,S=new P,b=new P,I=new P,T=new Ee,w=new Ee,A=new Ee;for(let x=0,_=0;x<s.length;x+=9,_+=6){v.set(s[x+0],s[x+1],s[x+2]),S.set(s[x+3],s[x+4],s[x+5]),b.set(s[x+6],s[x+7],s[x+8]),T.set(a[_+0],a[_+1]),w.set(a[_+2],a[_+3]),A.set(a[_+4],a[_+5]),I.copy(v).add(S).add(b).divideScalar(3);let C=m(I);y(T,_+0,v,C),y(w,_+2,S,C),y(A,_+4,b,C)}}function y(v,S,b,I){I<0&&v.x===1&&(a[S]=v.x-1),b.x===0&&b.z===0&&(a[S]=I/2/Math.PI+.5)}function m(v){return Math.atan2(v.z,-v.x)}function d(v){return Math.atan2(-v.y,Math.sqrt(v.x*v.x+v.z*v.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.vertices,e.indices,e.radius,e.details)}};var cn=class i extends Ns{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(r,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}},zs=class i extends Ns{constructor(e=1,t=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],r=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,r,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}},Cr=class i extends pt{constructor(e=.5,t=1,n=32,r=1,s=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:s,thetaLength:a},n=Math.max(3,n),r=Math.max(1,r);let o=[],l=[],u=[],h=[],f=e,c=(t-e)/r,p=new P,g=new Ee;for(let y=0;y<=r;y++){for(let m=0;m<=n;m++){let d=s+m/n*a;p.x=f*Math.cos(d),p.y=f*Math.sin(d),l.push(p.x,p.y,p.z),u.push(0,0,1),g.x=(p.x/t+1)/2,g.y=(p.y/t+1)/2,h.push(g.x,g.y)}f+=c}for(let y=0;y<r;y++){let m=y*(n+1);for(let d=0;d<n;d++){let v=d+m,S=v,b=v+n+1,I=v+n+2,T=v+1;o.push(S,b,T),o.push(b,I,T)}}this.setIndex(o),this.setAttribute("position",new He(l,3)),this.setAttribute("normal",new He(u,3)),this.setAttribute("uv",new He(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var ui=class i extends pt{constructor(e=1,t=32,n=16,r=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:s,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),u=0,h=[],f=new P,c=new P,p=[],g=[],y=[],m=[];for(let d=0;d<=n;d++){let v=[],S=d/n,b=0;d===0&&a===0?b=.5/t:d===n&&l===Math.PI&&(b=-.5/t);for(let I=0;I<=t;I++){let T=I/t;f.x=-e*Math.cos(r+T*s)*Math.sin(a+S*o),f.y=e*Math.cos(a+S*o),f.z=e*Math.sin(r+T*s)*Math.sin(a+S*o),g.push(f.x,f.y,f.z),c.copy(f).normalize(),y.push(c.x,c.y,c.z),m.push(T+b,1-S),v.push(u++)}h.push(v)}for(let d=0;d<n;d++)for(let v=0;v<t;v++){let S=h[d][v+1],b=h[d][v],I=h[d+1][v],T=h[d+1][v+1];(d!==0||a>0)&&p.push(S,b,T),(d!==n-1||l<Math.PI)&&p.push(b,I,T)}this.setIndex(p),this.setAttribute("position",new He(g,3)),this.setAttribute("normal",new He(y,3)),this.setAttribute("uv",new He(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var di=class i extends pt{constructor(e=1,t=.4,n=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:s},n=Math.floor(n),r=Math.floor(r);let a=[],o=[],l=[],u=[],h=new P,f=new P,c=new P;for(let p=0;p<=n;p++)for(let g=0;g<=r;g++){let y=g/r*s,m=p/n*Math.PI*2;f.x=(e+t*Math.cos(m))*Math.cos(y),f.y=(e+t*Math.cos(m))*Math.sin(y),f.z=t*Math.sin(m),o.push(f.x,f.y,f.z),h.x=e*Math.cos(y),h.y=e*Math.sin(y),c.subVectors(f,h).normalize(),l.push(c.x,c.y,c.z),u.push(g/r),u.push(p/n)}for(let p=1;p<=n;p++)for(let g=1;g<=r;g++){let y=(r+1)*p+g-1,m=(r+1)*(p-1)+g-1,d=(r+1)*(p-1)+g,v=(r+1)*p+g;a.push(y,m,v),a.push(m,d,v)}this.setIndex(a),this.setAttribute("position",new He(o,3)),this.setAttribute("normal",new He(l,3)),this.setAttribute("uv",new He(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}};var fi=class extends Wn{static get type(){return"MeshLambertMaterial"}constructor(e){super(),this.isMeshLambertMaterial=!0,this.color=new Ce(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ce(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ch,this.normalScale=new Ee(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wt,this.combine=el,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}};function us(i,e,t){return!i||!t&&i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function q0(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var Qi=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],s=t[n-1];n:{e:{let a;t:{i:if(!(e<r)){for(let o=n+2;;){if(r===void 0){if(e<s)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(s=r,r=t[++n],e<r)break e}a=t.length;break t}if(!(e>=s)){let o=t[1];e<o&&(n=2,s=o);for(let l=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(r=s,s=t[--n-1],e>=s)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(r=t[n],s=t[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,r)}return this.interpolate_(n,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,s=e*r;for(let a=0;a!==r;++a)t[a]=n[s+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Oo=class extends Qi{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ql,endingEnd:ql}}intervalChanged_(e,t,n){let r=this.parameterPositions,s=e-2,a=e+1,o=r[s],l=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case Yl:s=e,o=2*t-n;break;case Zl:s=r.length-2,o=t+r[s]-r[s+1];break;default:s=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Yl:a=e,l=2*n-t;break;case Zl:a=1,l=n+r[1]-r[0];break;default:a=e-1,l=t}let u=(n-t)*.5,h=this.valueSize;this._weightPrev=u/(t-o),this._weightNext=u/(l-n),this._offsetPrev=s*h,this._offsetNext=a*h}interpolate_(e,t,n,r){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,u=l-o,h=this._offsetPrev,f=this._offsetNext,c=this._weightPrev,p=this._weightNext,g=(n-t)/(r-t),y=g*g,m=y*g,d=-c*m+2*c*y-c*g,v=(1+c)*m+(-1.5-2*c)*y+(-.5+c)*g+1,S=(-1-p)*m+(1.5+p)*y+.5*g,b=p*m-p*y;for(let I=0;I!==o;++I)s[I]=d*a[h+I]+v*a[u+I]+S*a[l+I]+b*a[f+I];return s}},Ho=class extends Qi{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,u=l-o,h=(n-t)/(r-t),f=1-h;for(let c=0;c!==o;++c)s[c]=a[u+c]*f+a[l+c]*h;return s}},Vo=class extends Qi{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},tn=class{constructor(e,t,n,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=us(t,this.TimeBufferType),this.values=us(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:us(e.times,Array),values:us(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(n.interpolation=r)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Vo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ho(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Oo(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case xs:t=this.InterpolantFactoryMethodDiscrete;break;case bo:t=this.InterpolantFactoryMethodLinear;break;case ia:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return xs;case this.InterpolantFactoryMethodLinear:return bo;case this.InterpolantFactoryMethodSmooth:return ia}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,s=0,a=r-1;for(;s!==r&&n[s]<e;)++s;for(;a!==-1&&n[a]>t;)--a;if(++a,s!==0||a!==r){s>=a&&(a=Math.max(a,1),s=a-1);let o=this.getValueSize();this.times=n.slice(s,a),this.values=this.values.slice(s*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,r=this.values,s=n.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==s;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(r!==void 0&&q0(r))for(let o=0,l=r.length;o!==l;++o){let u=r[o];if(isNaN(u)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,u),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===ia,s=e.length-1,a=1;for(let o=1;o<s;++o){let l=!1,u=e[o],h=e[o+1];if(u!==h&&(o!==1||u!==e[0]))if(r)l=!0;else{let f=o*n,c=f-n,p=f+n;for(let g=0;g!==n;++g){let y=t[f+g];if(y!==t[c+g]||y!==t[p+g]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let f=o*n,c=a*n;for(let p=0;p!==n;++p)t[c+p]=t[f+p]}++a}}if(s>0){e[a]=e[s];for(let o=s*n,l=a*n,u=0;u!==n;++u)t[l+u]=t[o+u];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};tn.prototype.TimeBufferType=Float32Array;tn.prototype.ValueBufferType=Float32Array;tn.prototype.DefaultInterpolation=bo;var pi=class extends tn{constructor(e,t,n){super(e,t,n)}};pi.prototype.ValueTypeName="bool";pi.prototype.ValueBufferType=Array;pi.prototype.DefaultInterpolation=xs;pi.prototype.InterpolantFactoryMethodLinear=void 0;pi.prototype.InterpolantFactoryMethodSmooth=void 0;var Go=class extends tn{};Go.prototype.ValueTypeName="color";var Wo=class extends tn{};Wo.prototype.ValueTypeName="number";var Xo=class extends Qi{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let s=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(r-t),u=e*o;for(let h=u+o;u!==h;u+=4)Gt.slerpFlat(s,0,a,u-o,a,u,l);return s}},Fs=class extends tn{InterpolantFactoryMethodLinear(e){return new Xo(this.times,this.values,this.getValueSize(),e)}};Fs.prototype.ValueTypeName="quaternion";Fs.prototype.InterpolantFactoryMethodSmooth=void 0;var mi=class extends tn{constructor(e,t,n){super(e,t,n)}};mi.prototype.ValueTypeName="string";mi.prototype.ValueBufferType=Array;mi.prototype.DefaultInterpolation=xs;mi.prototype.InterpolantFactoryMethodLinear=void 0;mi.prototype.InterpolantFactoryMethodSmooth=void 0;var qo=class extends tn{};qo.prototype.ValueTypeName="vector";var Xc={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(this.files[i]=e)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}},Yo=class{constructor(e,t,n){let r=this,s=!1,a=0,o=0,l,u=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.itemStart=function(h){o++,s===!1&&r.onStart!==void 0&&r.onStart(h,a,o),s=!0},this.itemEnd=function(h){a++,r.onProgress!==void 0&&r.onProgress(h,a,o),a===o&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(h){r.onError!==void 0&&r.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,f){return u.push(h,f),this},this.removeHandler=function(h){let f=u.indexOf(h);return f!==-1&&u.splice(f,2),this},this.getHandler=function(h){for(let f=0,c=u.length;f<c;f+=2){let p=u[f],g=u[f+1];if(p.global&&(p.lastIndex=0),p.test(h))return g}return null}}},Y0=new Yo,Ir=class{constructor(e){this.manager=e!==void 0?e:Y0,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,s){n.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}};Ir.DEFAULT_MATERIAL_NAME="__DEFAULT";var Zo=class extends Ir{constructor(e){super(e)}load(e,t,n,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let s=this,a=Xc.get(e);if(a!==void 0)return s.manager.itemStart(e),setTimeout(function(){t&&t(a),s.manager.itemEnd(e)},0),a;let o=Er("img");function l(){h(),Xc.add(e,this),t&&t(this),s.manager.itemEnd(e)}function u(f){h(),r&&r(f),s.manager.itemError(e),s.manager.itemEnd(e)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",u,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",u,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),s.manager.itemStart(e),o.src=e,o}};var ks=class extends Ir{constructor(e){super(e)}load(e,t,n,r){let s=new Pt,a=new Zo(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){s.image=o,s.needsUpdate=!0,t!==void 0&&t(s)},n,r),s}},Pr=class extends Rt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ce(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}},Bs=class extends Pr{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Rt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ce(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}},Da=new De,qc=new P,Yc=new P,Os=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ee(512,512),this.map=null,this.mapPass=null,this.matrix=new De,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Tr,this._frameExtents=new Ee(1,1),this._viewportCount=1,this._viewports=[new nt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;qc.setFromMatrixPosition(e.matrixWorld),t.position.copy(qc),Yc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Yc),t.updateMatrixWorld(),Da.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Da),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Da)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};var Zc=new De,yr=new P,Ua=new P,$o=class extends Os{constructor(){super(new Tt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Ee(4,2),this._viewportCount=6,this._viewports=[new nt(2,1,1,1),new nt(0,1,1,1),new nt(3,1,1,1),new nt(1,1,1,1),new nt(3,0,1,1),new nt(1,0,1,1)],this._cubeDirections=[new P(1,0,0),new P(-1,0,0),new P(0,0,1),new P(0,0,-1),new P(0,1,0),new P(0,-1,0)],this._cubeUps=[new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,0,1),new P(0,0,-1)]}updateMatrices(e,t=0){let n=this.camera,r=this.matrix,s=e.distance||n.far;s!==n.far&&(n.far=s,n.updateProjectionMatrix()),yr.setFromMatrixPosition(e.matrixWorld),n.position.copy(yr),Ua.copy(n.position),Ua.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Ua),n.updateMatrixWorld(),r.makeTranslation(-yr.x,-yr.y,-yr.z),Zc.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Zc)}},Lr=class extends Pr{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=r,this.shadow=new $o}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}},Ko=class extends Os{constructor(){super(new Ts(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Hs=class extends Pr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Rt.DEFAULT_UP),this.updateMatrix(),this.target=new Rt,this.shadow=new Ko}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}};var Vs=class{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=$c(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let t=$c();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}};function $c(){return performance.now()}var hl="\\[\\]\\.:\\/",Z0=new RegExp("["+hl+"]","g"),ul="[^"+hl+"]",$0="[^"+hl.replace("\\.","")+"]",K0=/((?:WC+[\/:])*)/.source.replace("WC",ul),J0=/(WCOD+)?/.source.replace("WCOD",$0),j0=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",ul),Q0=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",ul),eg=new RegExp("^"+K0+J0+j0+Q0+"$"),tg=["material","materials","bones","map"],Jo=class{constructor(e,t,n){let r=n||ct.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=n.length;r!==s;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},ct=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Z0,"")}static parseTrackName(e){let t=eg.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){let s=n.nodeName.substring(r+1);tg.indexOf(s)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=s)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(s){for(let a=0;a<s.length;a++){let o=s[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,s=n.length;r!==s;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,r=t.propertyName,s=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let u=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===u){u=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(u!==void 0){if(e[u]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[u]}}let a=e[r];if(a===void 0){let u=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+u+"."+r+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?o=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ct.Composite=Jo;ct.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ct.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ct.prototype.GetterByBindingType=[ct.prototype._getValue_direct,ct.prototype._getValue_array,ct.prototype._getValue_arrayElement,ct.prototype._getValue_toArray];ct.prototype.SetterByBindingTypeAndVersioning=[[ct.prototype._setValue_direct,ct.prototype._setValue_direct_setNeedsUpdate,ct.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_array,ct.prototype._setValue_array_setNeedsUpdate,ct.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_arrayElement,ct.prototype._setValue_arrayElement_setNeedsUpdate,ct.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_fromArray,ct.prototype._setValue_fromArray_setNeedsUpdate,ct.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var cx=new Float32Array(1);var Kc=new De,Gs=class{constructor(e,t,n=0,r=1/0){this.ray=new vs(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new wr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Kc.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Kc),this}intersectObject(e,t=!0,n=[]){return jo(e,this,n,t),n.sort(Jc),n}intersectObjects(e,t=!0,n=[]){for(let r=0,s=e.length;r<s;r++)jo(e[r],this,n,t);return n.sort(Jc),n}};function Jc(i,e){return i.distance-e.distance}function jo(i,e,t,n){let r=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(r=!1),r===!0&&n===!0){let s=i.children;for(let a=0,o=s.length;a<o;a++)jo(s[a],e,t,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"170"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="170");var bh={arten:[{id:"wasser",name:"Wasser",zeichen:"~",kategorie:"wasser",begehbar:!1,wasser:!0,kachel:"realtime/werkzeug/boden/gemalt/wasser.webp",rang:0,rand:{art:"ufer",breite:1.2,bild:"realtime/werkzeug/boden/verlauf-wiese-wasser.webp"},farbe:"#2f6f8f",herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar",kachelPx:440},{id:"wasser_ruhig",name:"Ruhiges Wasser",zeichen:"w",kategorie:"wasser",begehbar:!1,wasser:!0,kachel:"realtime/werkzeug/boden/gemalt/wasser-ruhig.webp",rang:1,rand:{art:"ufer",breite:1.2,bild:"realtime/werkzeug/boden/verlauf-wiese-wasser.webp"},farbe:"#3d7f93",herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar",kachelPx:440},{id:"moorwasser",name:"Moorwasser",zeichen:"o",kategorie:"wasser",begehbar:!1,wasser:!0,kachel:"realtime/werkzeug/boden/gemalt/moorwasser.webp",rang:2,rand:{art:"ufer",breite:.6},farbe:"#1f2b24",kachelPx:420,herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar"},{id:"schlamm",name:"Schlamm",zeichen:"m",kategorie:"gelaende",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/schlamm.webp",rang:10,rand:{art:"fransen",breite:1.2},farbe:"#4a3f2c",kachelPx:420,herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar"},{id:"torf",name:"Torf",zeichen:"t",kategorie:"gelaende",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/torf.webp",rang:12,rand:{art:"fransen",breite:1},farbe:"#3a2c20",kachelPx:420,herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar",streu:[{art:"bueschel",dichte:.3},{art:"zweige",dichte:.04}]},{id:"sand",name:"Sand",zeichen:"s",kategorie:"gelaende",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/sand.webp",rang:15,rand:{art:"fransen",breite:1.2},farbe:"#b9a777",kachelPx:420,herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar"},{id:"waldboden",name:"Waldboden",zeichen:"f",kategorie:"gelaende",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/waldboden.webp",rang:20,rand:{art:"fransen",breite:2.2},farbe:"#3d4a2a",kachelPx:420,streu:[{art:"zweige",dichte:.07},{art:"steinchen",dichte:.025},{art:"bueschel",dichte:.05}],herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar"},{id:"moorwiese",name:"Moorwiese (welkes Gras)",zeichen:"v",kategorie:"gelaende",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/moorwiese.webp",rang:29,rand:{art:"fransen",breite:1.5},farbe:"#5f8a3a",herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar",kachelPx:420,streu:[{art:"bueschel",dichte:.16},{art:"steinchen",dichte:.012},{art:"blumen",dichte:.02}]},{id:"wiese",name:"Wiese",zeichen:".",kategorie:"gelaende",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/wiese.webp",rang:30,rand:{art:"fransen",breite:1.5},farbe:"#5f8a3a",herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar",varianten:["realtime/werkzeug/boden/gemalt/wiese-blumen.webp","realtime/werkzeug/boden/gemalt/wiese-trocken.webp","realtime/werkzeug/boden/gemalt/wiese-satt.webp"],kachelPx:420,streu:[{art:"bueschel",dichte:.16},{art:"steinchen",dichte:.012},{art:"blumen",dichte:.02}]},{id:"wiese_blumen",name:"Blumenwiese",zeichen:",",kategorie:"gelaende",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/wiese-blumen.webp",rang:31,rand:{art:"fransen",breite:2},farbe:"#74994a",herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar",kachelPx:420,varianten:["realtime/werkzeug/boden/gemalt/wiese-satt.webp"],streu:[{art:"bueschel",dichte:.12},{art:"blumen",dichte:.09}]},{id:"acker",name:"Acker",zeichen:"a",kategorie:"gelaende",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/acker.webp",rang:35,rand:{art:"hart",breite:.3},farbe:"#7a5c36",kachelPx:420,herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar"},{id:"erde",name:"Erdweg",zeichen:"e",kategorie:"weg",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/erde.webp",rang:40,rand:{art:"fransen",breite:1.1,saum:{breite:1.3,staerke:.55}},farbe:"#8a6a42",herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar",kachelPx:420,streu:[{art:"kiesel",dichte:.35},{art:"steinchen",dichte:.03}]},{id:"steinweg",name:"Steinweg",zeichen:"k",kategorie:"weg",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/pflaster.webp",rang:45,rand:{art:"steine",breite:.7},farbe:"#8d8a84",herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar",kachelPx:150,streu:[{art:"steinchen",dichte:.04}]},{id:"pflaster",name:"Pflaster",zeichen:"p",kategorie:"weg",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/pflaster.webp",rang:50,rand:{art:"steine",breite:.8},farbe:"#8d8a84",herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar",kachelPx:200},{id:"hoehlenboden",name:"H\xF6hlenboden",zeichen:"h",kategorie:"gelaende",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/hoehlenboden.webp",rang:42,rand:{art:"hart",breite:.3},farbe:"#5c544a",kachelPx:380,herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar"},{id:"holzboden",name:"Dielenboden",zeichen:"d",kategorie:"weg",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/holzboden.webp",rang:44,rand:{art:"hart",breite:.2},farbe:"#7a5638",kachelPx:300,herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar"},{id:"leere",name:"Leere (um Innenr\xE4ume)",zeichen:"X",kategorie:"gelaende",begehbar:!1,kachel:"realtime/werkzeug/boden/gemalt/leere.webp",rang:59,rand:{art:"hart",breite:.2},farbe:"#100c09",kachelPx:256,herkunft:"selbst gerechnet (dunkle Rauschkachel, ohne Bildvorlage) \u2013 frei verwendbar"},{id:"fels",name:"Fels",zeichen:"F",kategorie:"gelaende",begehbar:!1,kachel:"realtime/werkzeug/boden/gemalt/felswand.webp",rang:60,rand:{art:"hart",breite:.4},farbe:"#6b6860",kachelPx:380,herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar"},{id:"meer",name:"Meer",zeichen:"M",kategorie:"wasser",begehbar:!1,wasser:!0,kachel:"realtime/werkzeug/boden/gemalt/meer.webp",rang:3,rand:{art:"ufer",breite:1.4},farbe:"#24607e",kachelPx:440,herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar"},{id:"geroell",name:"Ger\xF6ll",zeichen:"g",kategorie:"gelaende",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/geroell.webp",rang:16,rand:{art:"fransen",breite:1.2},farbe:"#8a8478",kachelPx:420,herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar"},{id:"schnee",name:"Schnee",zeichen:"S",kategorie:"gelaende",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/schnee.webp",rang:18,rand:{art:"fransen",breite:1.6},farbe:"#e6ecef",kachelPx:420,herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar"},{id:"tundra",name:"Tundra",zeichen:"T",kategorie:"gelaende",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/tundra.webp",rang:19,rand:{art:"fransen",breite:1.6},farbe:"#8a8c68",kachelPx:420,herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar"},{id:"duene",name:"D\xFCnensand",zeichen:"u",kategorie:"gelaende",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/duene.webp",rang:14,rand:{art:"fransen",breite:1.8},farbe:"#d7b071",kachelPx:420,herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar"},{id:"steppe",name:"Steppe",zeichen:"y",kategorie:"gelaende",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/steppe.webp",rang:20,rand:{art:"fransen",breite:1.6},farbe:"#a39a5a",kachelPx:420,herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar"},{id:"dschungel",name:"Dschungelboden",zeichen:"j",kategorie:"gelaende",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/dschungel.webp",rang:21,rand:{art:"fransen",breite:1.4},farbe:"#3e6a2a",kachelPx:420,herkunft:"selbst gerechnet (werkzeug/welt/boden_gemalt.py, ohne Bildvorlage) \u2013 frei verwendbar"},{id:"eis_hell",name:"Eis (hell)",zeichen:"i",kategorie:"gelaende",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/eis-hell.webp",rang:46,rand:{art:"hart",breite:.05},farbe:"#c7e5f6",kachelPx:420,herkunft:"werkzeug/welt/boden_eis.py (#162) aus der Schneekachel gerechnet \u2013 frei verwendbar"},{id:"eis_dunkel",name:"Eis (dunkel)",zeichen:"I",kategorie:"gelaende",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/eis-dunkel.webp",rang:47,rand:{art:"hart",breite:.05},farbe:"#8cbbe0",kachelPx:420,herkunft:"werkzeug/welt/boden_eis.py (#162) aus der Schneekachel gerechnet \u2013 frei verwendbar"},{id:"lehm",name:"Lehm",zeichen:"l",kategorie:"gelaende",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/lehm.webp",rang:22,rand:{art:"fransen",breite:1.6},farbe:"#a8865e",kachelPx:420,herkunft:"werkzeug/welt/boden_lehm.py (#172) aus der Erdkachel gerechnet \u2013 frei verwendbar"},{id:"lehm_rissig",name:"Lehm, rissig",zeichen:"L",kategorie:"gelaende",begehbar:!0,kachel:"realtime/werkzeug/boden/gemalt/lehm-rissig.webp",rang:23,rand:{art:"fransen",breite:1.4},farbe:"#94734f",kachelPx:420,herkunft:"werkzeug/welt/boden_lehm.py (#172) aus der Erdkachel gerechnet \u2013 frei verwendbar"}]};var vh=[10448,9607.5],xi={rotmantel:{typ:"rotmantel",phasen:[{ab:1,ansagen:[{name:"Rundumschlag",alle:5,felder:"rundum",schaden:[8,14]}]},{ab:.5,text:"Rotmantel ruft nach seinen Leuten!",ruf:{art:"bandit_schlaeger",n:2,text:"Zwei Schl\xE4ger st\xFCrmen aus dem Gang!"},ansagen:[{name:"Rundumschlag",alle:3,felder:"rundum",schaden:[8,14]}],heilorte:[{x:vh[0],y:vh[1],r:2,menge:.3,unter:.5,text:"Rotmantel greift hinter den Thron und trinkt einen Heiltrank."}]}]}},Xt=[10302.5,9632.5],Tn=[{id:"unterschlupf_halle",name:"Die Versammlungshalle",feld:[10290,9616,10315,9647],schalter:"unterschlupf_halle",wellen:[[{art:"bandit_schlaeger",x:Xt[0]-3,y:Xt[1]-2},{art:"bandit_armbrust",x:Xt[0]+3,y:Xt[1]-3},{art:"bandit_spaeher",x:Xt[0],y:Xt[1]+3}],[{art:"bandit_schlaeger",x:Xt[0]-4,y:Xt[1]+2},{art:"bandit_schlaeger",x:Xt[0]+4,y:Xt[1]+2},{art:"bandit_armbrust",x:Xt[0],y:Xt[1]-4}]],welle:"unterschlupf_welle",pause:4,text:"Die Banditen der Halle haben dich bemerkt \u2013 sie kommen zu mehreren!"},{id:"rotmantel_kammer",name:"Die Kammer des Anf\xFChrers",feld:[10432,9600,10463,9631],schalter:"rotmantel_instanz",gegner:[{art:"rotmantel",x:10448.5,y:9614.5}],text:"Hauptmann Rotmantel erhebt sich von seinem Thron. \u201EGesas kleiner Hund. Komm her.\u201C"}],Ys=[{id:"beutelager",feld:[10270,9644,10276,9645],schalter:"beutelager_offen",zu:"Die T\xFCr ist verschlossen. Jemand in der Wachstube hat den Schl\xFCsselbund."},{id:"bergwerk_stollen",feld:[11661,9620,11671,9623],schalter:"urkammer_offen",zu:"Grubenholz und Ger\xF6ll versperren den Gang. Die Bergv\xF6gtin hat ihn sperren lassen \u2013 hier unten ist etwas aufgewacht."}];Ys.push({id:"lehmfurt_furt",feld:[6425,7244.5,6428,7248.5],schalter:"lehmfurt_trittsteine",zu:"Die Kiel ist hier zu tief. Mit ein paar Trittsteinen k\xE4me man trocken hin\xFCber."});Ys.push({id:"turm_wappentuer",feld:[6840,6519,6840,6519],schalter:"wappentuer_offen",eingang:"turm_wappentuer",zu:"Die T\xFCr tr\xE4gt ein Wappen \u2013 ein Turm \xFCber drei Wellen. Sie ist verschlossen. Vielleicht wei\xDF jemand in Graufurt, wer hier hineindarf."});Tn.push({id:"federmutter_kammer",name:"Das Nest der Federmutter",feld:[11520,9600,11551,9631],schalter:"federmutter_kammer",danach:"federmutter_danach",gegner:[{art:"federmutter",x:11536.5,y:9611.5}],text:"Federn liegen kn\xF6cheltief. \xDCber dem Nest hebt Ravena den Kopf."});xi.wrackkapitaen={typ:"wrackkapitaen",phasen:[{ab:1,ansagen:[{name:"S\xE4belwirbel",alle:4,felder:"rundum",schaden:[6,11]}]},{ab:.6,text:"Der Wrackkapit\xE4n ruft seine Mannschaft!",ruf:{art:"strandraeuber_saebel",n:2,text:"Alle Mann an Deck!"},ansagen:[{name:"S\xE4belwirbel",alle:3,felder:"rundum",schaden:[6,11]}]},{ab:.3,text:"Geisterwasser flutet die Kaj\xFCte!",ansagen:[{name:"Geisterflut",sek:4,felder:"raum",deckung:!0,vorlauf:2,schaden:[9,15]}]}]};Tn.push({id:"wrack_kajuete",name:"Die Kaj\xFCte des Kapit\xE4ns",feld:[11488,9600,11519,9631],schalter:"wrackkapitaen_kajuete",danach:"wrackkapitaen_danach",gegner:[{art:"wrackkapitaen",x:11504.5,y:9614.5}],text:"Die T\xFCr der Kaj\xFCte f\xE4llt ins Schloss. Am Kartentisch sitzt jemand, durch den man hindurchsieht."});xi.sandmutter={typ:"sandmutter",phasen:[{ab:1,ansagen:[{name:"Sandschlag",alle:4,felder:"rundum",schaden:[9,15]}]},{ab:.6,text:"Die Sandmutter gr\xE4bt sich ein!",eingraben:5,ruf:{art:"sandkriecher",n:2,text:"Der Sand bebt \xFCberall!"},ansagen:[{name:"Treibsand",sek:3,felder:"ziel",weite:1,vorlauf:2,schaden:[10,16]}]},{ab:.3,text:"Die Sandmutter br\xFCllt!",eingraben:4,ansagen:[{name:"Treibsand",sek:2.5,felder:"ziel",weite:2,vorlauf:2,schaden:[12,18]},{name:"Sandschlag",alle:3,felder:"rundum",schaden:[9,15]}]}]};Tn.push({id:"tempel_kammer",name:"Die Kammer der Sandmutter",feld:[11360,9600,11391,9631],schalter:"sandmutter_kammer",danach:"sandmutter_danach",gegner:[{art:"sandmutter",x:11376.5,y:9612.5}],text:"Das Tor mit dem Auge schlie\xDFt sich. Der Boden der Kammer atmet."});xi.grauer_hauptmann={typ:"grauer_hauptmann",phasen:[{ab:1,ansagen:[{name:"Rundumschlag",alle:4,felder:"rundum",schaden:[8,14]}]},{ab:.6,text:"Der Graue Hauptmann ruft seine Wacht!",ruf:{art:"wiedergaenger",n:2,text:"Steht auf, Wacht!"},ansagen:[{name:"Rundumschlag",alle:3,felder:"rundum",schaden:[8,14]}]},{ab:.3,text:"Ein eisiger Sturm fegt durch die Gruft!",ansagen:[{name:"Grabessturm",sek:4,felder:"raum",deckung:!0,vorlauf:2,schaden:[12,20]}]}]};Tn.push({id:"hauptmann_gruft",name:"Die Gruft des Grauen Hauptmanns",feld:[11200,9600,11231,9631],schalter:"hauptmann_gruft",danach:"hauptmann_danach",gegner:[{art:"grauer_hauptmann",x:11216.5,y:9619.5}],text:"Hinter dir schlie\xDFt sich die Gruft. Am Sarkophag regt sich etwas Graues."});var dl={x:10768,y:9615,r:4.2,menge:.12,unter:.55,mal:2,hingehen:!0,dauer:2,text:"trinkt aus dem Splitterbecken",ausser:"becken_getruebt"};xi.oberster_rabenpriester={typ:"oberster_rabenpriester",phasen:[{ab:1,hiebe:2,heilorte:[dl]},{ab:.6,text:"Der Oberste erhebt sich \xFCber das Becken!",schweben:15,landen:"landet zwischen den S\xE4ulen",ruf:{art:"rabenpriester_akoluth",n:2,text:"ruft seine Akoluthen!"},ansagen:[{name:"Sturzraben",sek:3,felder:"ziel",weite:1,vorlauf:2,schaden:[8,14]}],heilorte:[dl]},{ab:.3,text:"Schwarze Fl\xFCgel breiten sich \xFCber den Saal!",hiebe:2,ansagen:[{name:"Schwarzer Fl\xFCgelschlag",sek:3,felder:"raum",deckung:!0,vorlauf:2,schaden:[15,25]}],heilorte:[dl]}]};Tn.push({id:"thronsaal",name:"Der Thronsaal",feld:[10752,9600,10783,9631],schalter:"rabenpriester_thronsaal",danach:"rabenpriester_danach",gegner:[{art:"oberster_rabenpriester",x:10768.5,y:9607.5}],eintritt:"federsiegel",ohne:"Der Altar am Tor bleibt kalt \u2013 ohne Federsiegel \xF6ffnet sich der Thronsaal nicht.",text:"Das Federsiegel zerf\xE4llt zu Asche. Der Thronsaal geh\xF6rt dir \u2013 f\xFCr diesen Versuch."});xi.grumhold={typ:"grumhold",art:"schlaeger",phasen:[{ab:1,ansagen:[{name:"Stampf-Ring",bewegung:"stampfen",alle:3,felder:"ring",weite:2,vorlauf:3,schaden:[30,40]},{name:"Felsbrocken",bewegung:"werfen",sek:8,felder:"ziel",weite:1,vorlauf:3,schaden:[32,44]}]},{ab:.5,text:"Grumhold br\xFCllt \u2013 der Fels der Halle antwortet!",ruf:{art:"felsbrocken_waechter",n:2,weite:5,text:"Zwei Felsbrocken l\xF6sen sich aus der Wand!"},ansagen:[{name:"Stampf-Ring",bewegung:"stampfen",alle:3,felder:"ring",weite:3,vorlauf:3,schaden:[30,40]},{name:"Felsbrocken",bewegung:"werfen",sek:6,felder:"ziel",weite:1,vorlauf:3,schaden:[32,44]}]}]};xi.sturmschwinge={typ:"sturmschwinge",art:"schlaeger",phasen:[{ab:1,flug:!0,ansagen:[{name:"Sturzflug",bewegung:"sturzflug",sek:7,felder:"ziel",weite:1,vorlauf:3,schaden:[30,44],landen:4},{name:"Sturmb\xF6e",alle:4,felder:"rundum",weite:2,vorlauf:2,schaden:[30,36],wirkung:{schieben:3}}]},{ab:.4,text:"Die Sturmschwinge schreit \u2013 der Wind dreht!",flug:!0,ansagen:[{name:"Sturzflug",bewegung:"sturzflug",sek:5,felder:"ziel",weite:1,vorlauf:3,schaden:[30,44],landen:4},{name:"Sturmb\xF6e",alle:4,felder:"rundum",weite:3,vorlauf:2,schaden:[30,36],wirkung:{schieben:3}}]}]};xi.frostwitwe={typ:"frostwitwe",art:"taktiker",phasen:[{ab:1,ansagen:[{name:"Eisfeld",bewegung:"zauber",sek:8,felder:"ziel",weite:1,vorlauf:2,schaden:[30,36],art:"magie",wirkung:{langsam:[.5,4],erstarren:2}},{name:"Frostnova",bewegung:"nova",alle:5,felder:"rundum",weite:3,vorlauf:3,schaden:[30,44],art:"magie"}]},{ab:.6,text:"Die Frostwitwe haucht \u2013 das Eis erwacht!",ruf:{art:"eissplitter_waechter",n:2,weite:3,text:"Eissplitter wachsen aus dem Boden!"},ansagen:[{name:"Eisfeld",bewegung:"zauber",sek:6,felder:"ziel",weite:1,vorlauf:2,schaden:[30,36],art:"magie",wirkung:{langsam:[.5,4],erstarren:2}},{name:"Frostnova",bewegung:"nova",alle:4,felder:"rundum",weite:3,vorlauf:3,schaden:[30,44],art:"magie"}]}]};Tn.push({id:"trollhalle",name:"Die Trollhalle",feld:[11595,9602,11618,9624],schalter:"grumhold_halle",danach:"grumhold_danach",gegner:[{art:"grumhold",x:11607.5,y:9611.5}],text:"Hinter dir knirscht Ger\xF6ll. In der Halle steht ein Fels auf \u2013 und hat Augen."});Tn.push({id:"horst_grauhorn",name:"Der Horst der Sturmschwinge",feld:[11712,9600,11743,9631],schalter:"sturmschwinge_horst",danach:"sturmschwinge_danach",gegner:[{art:"sturmschwinge",x:11728.5,y:9613.5}],text:"Der Wind rei\xDFt an dir. \xDCber dem Gipfel zieht ein Schatten seine Kreise."});Tn.push({id:"eishoehle_hochpass",name:"Die Eish\xF6hle der Frostwitwe",feld:[11744,9600,11775,9631],schalter:"frostwitwe_hoehle",danach:"frostwitwe_danach",gegner:[{art:"frostwitwe",x:11760.5,y:9611.5}],text:"Der Atem gefriert dir vor dem Mund. Am Altar dreht sich jemand langsam zu dir um."});var Mh={thronsaal:{leben:.25,schaden:.2},trollhalle:{leben:.2,schaden:.2,abwehr:.5},horst_grauhorn:{leben:.25,schaden:.3,abwehr:.5},eishoehle_hochpass:{leben:.25,schaden:.3,abwehr:.5},hauptmann_gruft:{leben:.4,schaden:.5},tempel_kammer:{leben:.35,schaden:.4},wrack_kajuete:{leben:.4,schaden:.4}};for(let i of Tn)Mh[i.id]&&!i.questStaerke&&(i.questStaerke=Mh[i.id]);var _x=new Set(Ys.flatMap(i=>[i.schalter,i.weltSchalter].filter(e=>!!e)));function Sh(i,e,t=0){let n=(t%360+360)%360;return n===90?[-e,i]:n===180?[-i,-e]:n===270?[e,-i]:[i,e]}function fl(i,e=!1){let t=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),r=new Set(Object.keys(i[0].morphAttributes)),s={},a={},o=i[0].morphTargetsRelative,l=new pt,u=0;for(let h=0;h<i.length;++h){let f=i[h],c=0;if(t!==(f.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let p in f.attributes){if(!n.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+p+'" attribute exists among all geometries, or in none of them.'),null;s[p]===void 0&&(s[p]=[]),s[p].push(f.attributes[p]),c++}if(c!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(o!==f.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let p in f.morphAttributes){if(!r.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;a[p]===void 0&&(a[p]=[]),a[p].push(f.morphAttributes[p])}if(e){let p;if(t)p=f.index.count;else if(f.attributes.position!==void 0)p=f.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(u,p,h),u+=p}}if(t){let h=0,f=[];for(let c=0;c<i.length;++c){let p=i[c].index;for(let g=0;g<p.count;++g)f.push(p.getX(g)+h);h+=i[c].attributes.position.count}l.setIndex(f)}for(let h in s){let f=Eh(s[h]);if(!f)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,f)}for(let h in a){let f=a[h][0].length;if(f===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let c=0;c<f;++c){let p=[];for(let y=0;y<a[h].length;++y)p.push(a[h][y][c]);let g=Eh(p);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}return l}function Eh(i){let e,t,n,r=-1,s=0;for(let u=0;u<i.length;++u){let h=i[u];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(r===-1&&(r=h.gpuType),r!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;s+=h.count*t}let a=new e(s),o=new xt(a,t,n),l=0;for(let u=0;u<i.length;++u){let h=i[u];if(h.isInterleavedBufferAttribute){let f=l/t;for(let c=0,p=h.count;c<p;c++)for(let g=0;g<t;g++){let y=h.getComponent(c,g);o.setComponent(c+f,g,y)}}else a.set(h.array,l);l+=h.count*t}return r!==void 0&&(o.gpuType=r),o}var Ah=["glatt","holz","stein","ziegel","schindel","stroh","putz","laub","rinde","metall"],Ve=(i,e)=>{let t=Math.imul(Math.floor(i*7919),374761393)+Math.imul(Math.floor(e*6037),668265263);return t=Math.imul(t^t>>>13,1274126177),((t^t>>>16)>>>0)/4294967296};function Yn(i,e){let n=document.createElement("canvas");n.width=n.height=256;let r=n.getContext("2d"),s=e,a=()=>(s=s*16807%2147483647)/2147483647;r.fillStyle="rgb(225,225,225)",r.fillRect(0,0,256,256),i(r,a,256);let o=new wn(n);return o.wrapS=o.wrapT=Vn,o.colorSpace=_t,o.anisotropy=4,o}var ht=(i,e=1)=>`rgba(${i|0},${i|0},${i|0},${e})`,_i=(i,e)=>{for(let t of[-i,0,i])for(let n of[-i,0,i])e(t,n)},ig={glatt:()=>null,metall:()=>null,holz:()=>Yn((i,e,t)=>{let r=t/6;for(let s=0;s<6;s++){let a=s*r,o=200+e()*45;i.fillStyle=ht(o),i.fillRect(0,a,t,r);for(let u=0;u<14;u++){i.strokeStyle=ht(o-30-e()*30,.5),i.lineWidth=1+e()*1.5,i.beginPath();let h=a+4+e()*(r-8);i.moveTo(0,h),i.bezierCurveTo(t*.3,h+(e()-.5)*6,t*.6,h+(e()-.5)*6,t,h),i.stroke()}i.fillStyle=ht(255,.35),i.fillRect(0,a+2,t,3),i.fillStyle=ht(70),i.fillRect(0,a+r-3,t,3);let l=e()*t;i.fillStyle=ht(80),i.fillRect(l,a,3,r),i.fillStyle=ht(110);for(let u of[a+9,a+r-12])i.beginPath(),i.arc(l+9,u,2.4,0,7),i.arc(l-6,u,2.4,0,7),i.fill()}},11),stein:()=>Yn((i,e,t)=>{i.fillStyle=ht(95),i.fillRect(0,0,t,t);let n=0;for(;n<t;){let r=26+e()*18,s=-e()*40;for(;s<t;){let a=34+e()*36,o=175+e()*60;_i(t,(l,u)=>{i.fillStyle=ht(o),i.beginPath(),i.roundRect(s+l+2,n+u+2,a-4,r-4,9),i.fill(),i.fillStyle=ht(255,.28),i.beginPath(),i.roundRect(s+l+5,n+u+4,a-12,5,3),i.fill(),i.fillStyle=ht(0,.18),i.beginPath(),i.roundRect(s+l+4,n+u+r-10,a-8,5,3),i.fill()}),s+=a}n+=r}},23),ziegel:()=>Yn((i,e,t)=>{i.fillStyle=ht(90),i.fillRect(0,0,t,t);for(let s=0;s<t/32+1;s++)for(let a=-1;a<t/32+1;a++){let o=a*32+s%2*32/2,l=s*32,u=185+e()*55;_i(t,(h,f)=>{let c=i.createLinearGradient(o+h,0,o+h+32,0);c.addColorStop(0,ht(u-50)),c.addColorStop(.45,ht(u+15)),c.addColorStop(1,ht(u-60)),i.fillStyle=c,i.beginPath(),i.moveTo(o+h+1,l+f),i.lineTo(o+h+32-1,l+f),i.lineTo(o+h+32-1,l+f+32-8),i.quadraticCurveTo(o+h+32/2,l+f+32+6,o+h+1,l+f+32-8),i.closePath(),i.fill()})}},37),schindel:()=>Yn((i,e,t)=>{i.fillStyle=ht(80),i.fillRect(0,0,t,t);for(let r=0;r<t/26;r++){let s=-e()*30;for(;s<t;){let a=20+e()*22,o=170+e()*70,l=r*26;_i(t,(u,h)=>{i.fillStyle=ht(o),i.fillRect(s+u+1,l+h,a-2,24),i.fillStyle=ht(0,.25),i.fillRect(s+u+1,l+h+26-7,a-2,5),i.strokeStyle=ht(o-40,.6),i.lineWidth=1,i.beginPath(),i.moveTo(s+u+a*.4,l+h+2),i.lineTo(s+u+a*.45,l+h+26-6),i.stroke()}),s+=a}}},41),stroh:()=>Yn((i,e,t)=>{for(let n=0;n<1500;n++){let r=e()*t,s=e()*t,a=14+e()*26,o=150+e()*105;_i(t,(l,u)=>{i.strokeStyle=ht(o,.8),i.lineWidth=1.2+e()*1.6,i.beginPath(),i.moveTo(r+l,s+u),i.lineTo(r+l+(e()-.5)*5,s+u+a),i.stroke()})}for(let n=0;n<6;n++)i.fillStyle=ht(60,.45),i.fillRect(0,n*(t/6)+t/6-6,t,5)},53),putz:()=>Yn((i,e,t)=>{for(let n=0;n<260;n++){let r=e()*t,s=e()*t,a=8+e()*26,o=200+e()*55;_i(t,(l,u)=>{i.fillStyle=ht(o,.35),i.beginPath(),i.ellipse(r+l,s+u,a,a*.7,e()*3,0,7),i.fill()})}for(let n=0;n<5;n++){let r=e()*t,s=e()*t;i.strokeStyle=ht(120,.6),i.lineWidth=1,i.beginPath(),i.moveTo(r,s);for(let a=0;a<5;a++)r+=(e()-.5)*18,s+=e()*12,i.lineTo(r,s);i.stroke()}},67),laub:()=>Yn((i,e,t)=>{for(let n=0;n<1100;n++){let r=e()*t,s=e()*t,a=4+e()*9,o=150+e()*105;_i(t,(l,u)=>{i.fillStyle=ht(o,.7),i.beginPath(),i.ellipse(r+l,s+u,a,a*.6,e()*3,0,7),i.fill()})}},71),rinde:()=>Yn((i,e,t)=>{for(let n=0;n<220;n++){let r=e()*t,s=110+e()*120;_i(t,(a,o)=>{i.strokeStyle=ht(s,.7),i.lineWidth=2+e()*4,i.beginPath(),i.moveTo(r+a,o),i.bezierCurveTo(r+a+6,o+t*.3,r+a-6,o+t*.7,r+a,o+t),i.stroke()})}},83)},gl=Ah.map(i=>{let e=ig[i]();return new fi({vertexColors:!0,map:e,color:e?new Ce(1.18,1.18,1.18):16777215,side:jt})}),rg={glatt:1,metall:1,holz:1.6,stein:2,ziegel:1.7,schindel:1.5,stroh:2.2,putz:3,laub:2.6,rinde:1.2},sg=new De,ag=new Gt,og=new Wt,lg=new P,cg=new P,ie=(i,e,t,n=0,r=0,s=0,a=1,o=1,l=1)=>sg.clone().compose(cg.set(i,e,t),ag.setFromEuler(og.set(n,r,s)),lg.set(a,o,l)),hg=new P(0,1,0),pl=new P,wh=new P,Th=new P,ml=new P,Zn=new P,$n=new P,Se=class{constructor(e="glatt"){this.standard=e;this.liste=[]}get leer(){return this.liste.length===0}add(e,t,n,r={}){let s=typeof r=="number"?{schwanken:r}:r,a=s.muster||this.standard,o=e.index?e.toNonIndexed():e.clone();e.dispose(),n&&o.applyMatrix4(n);for(let d of Object.keys(o.attributes))d!=="position"&&d!=="normal"&&o.deleteAttribute(d);o.attributes.normal||o.computeVertexNormals();let l=o.attributes.position,u=l.count,h=new Ce(t),f=new Float32Array(u*3),c=new Float32Array(u*2),p=1/0,g=-1/0;if(s.verlauf)for(let d=0;d<u;d++){let v=l.getY(d);p=Math.min(p,v),g=Math.max(g,v)}let y=rg[a],m=s.schwanken||0;for(let d=0;d<u;d+=3){let v=m?1+(Ve(d+u,u*.37+d*.11)-.5)*2*m:1;pl.fromBufferAttribute(l,d),wh.fromBufferAttribute(l,d+1),Th.fromBufferAttribute(l,d+2),ml.subVectors(wh,pl).cross(Th.clone().sub(pl)).normalize(),Zn.crossVectors(hg,ml),Zn.lengthSq()<.01?Zn.set(1,0,0):Zn.normalize(),$n.crossVectors(ml,Zn).normalize(),($n.y<0||Math.abs($n.y)<.01&&$n.z<0)&&$n.negate();for(let S=0;S<3;S++){let b=d+S,I=l.getX(b),T=l.getY(b),w=l.getZ(b),A=s.verlauf?s.verlauf[0]+(s.verlauf[1]-s.verlauf[0])*((T-p)/Math.max(1e-6,g-p)):1;f[b*3]=h.r*v*A,f[b*3+1]=h.g*v*A,f[b*3+2]=h.b*v*A,c[b*2]=(I*Zn.x+T*Zn.y+w*Zn.z)/y,c[b*2+1]=(I*$n.x+T*$n.y+w*$n.z)/y}}return o.setAttribute("color",new xt(f,3)),o.setAttribute("uv",new xt(c,2)),this.liste.push({g:o,m:a}),this}box(e,t,n,r,s,a,o,l=0,u={}){return this.add(new mt(e,t,n),o,ie(r,s+t/2,a,0,l),u)}flaechen(e,t,n={}){let r=new Float32Array(e.length*9);e.forEach((a,o)=>a.forEach((l,u)=>r.set(l,o*9+u*3)));let s=new pt;return s.setAttribute("position",new xt(r,3)),s.computeVertexNormals(),this.add(s,t,void 0,n)}viereck(e,t,n,r,s,a={}){return this.flaechen([[e,t,n],[e,n,r]],s,a)}geometrie(){let e=[],t=[];Ah.forEach((r,s)=>{let a=this.liste.filter(o=>o.m===r).map(o=>o.g);a.length&&(e.push(fl(a,!1)),t.push(s))});let n=fl(e,!0);n.groups.forEach((r,s)=>r.materialIndex=t[s]);for(let r of this.liste)r.g.dispose();for(let r of e)r.dispose();return this.liste=[],n.computeBoundingSphere(),n}netz(e=!0){let t=new it(this.geometrie(),gl);return t.castShadow=e,t.receiveShadow=!0,t}};function nr(i=2,e=.12,t=1){let n=new cn(1,i),r=n.attributes.position,s=new P;for(let o=0;o<r.count;o++){s.fromBufferAttribute(r,o);let l=s.clone().normalize(),u=1+e*(Math.sin(l.x*5.1+t)*Math.sin(l.y*4.3+t*2)+.6*Math.sin(l.z*6.7-t));r.setXYZ(o,l.x*u,l.y*u,l.z*u)}n.computeVertexNormals();let a=n.attributes.normal;for(let o=0;o<r.count;o++)s.fromBufferAttribute(r,o).normalize(),a.setXYZ(o,s.x,s.y,s.z);return n}var xl="#8a8378",ug="#6f6a63",dg="#221d1a",ir="#3b3d42",_l="#585b62",Rh="#ff7a1c",Ch="#ffcf6e",Ur="#6a4527",fg="#7c4a2c";function Ih(i,e,t){i.box(1.9,.85,1.5,e,0,t,xl,0,{muster:"stein",schwanken:.05}),i.box(1.9-.3,.05,1.5-.3,e,.85,t,dg,0,{muster:"glatt"});for(let[o,l,u,h]of[[0,-(1.5/2-.07),1.9,.14],[0,1.5/2-.07,1.9,.14],[-(1.9/2-.07),0,.14,1.5],[1.9/2-.07,0,.14,1.5]])i.box(u,.13,h,e+o,.85,t+l,ug,0,{muster:"stein"});for(let o=0;o<14;o++){let l=Ve(o,3)*Math.PI*2,u=Ve(o,5)*.45,h=.07+Ve(o,7)*.07;i.add(new cn(1,0),o%3?Rh:Ch,ie(e+Math.cos(l)*u,.85+.07,t+Math.sin(l)*u*.7,0,o,0,h,h*.6,h),{muster:"glatt"})}for(let o of[-1,1])i.box(.09,.78,.09,e+o*(1.9/2-.12),.85,t-1.5/2+.12,ir,0,{muster:"metall"});i.add(new Oe(.42,1.18,.9,4,1,!0),xl,ie(e,.85+.78+.45,t,0,Math.PI/4,0,1,1,.78),{muster:"stein",schwanken:.04}),i.box(.62,.7,.62,e,.85+1.62,t,xl,0,{muster:"stein"});let a=e+1.9/2+.55;i.box(.9,.05,.55,a,.62,t,Ur,0,{muster:"holz"}),i.box(.9,.05,.55,a,.98,t,Ur,0,{muster:"holz"}),i.add(new Oe(.06,.3,.8,6,1),fg,ie(a+.05,.8,t,0,0,Math.PI/2,1,1,.8),{muster:"putz"}),i.add(new Oe(.035,.05,.5,6),ir,ie(a-.6,.8,t,0,0,Math.PI/2),{muster:"metall"}),i.box(.06,.06,.5,a+.48,1,t,Ur,0,{muster:"holz"});for(let o of[-1,1])i.box(.08,.62,.08,a+.3*o,0,t+.22,Ur,0,{muster:"holz"});for(let o of[-1,1])i.add(new mt(.75,.03,.035),ir,ie(e-.15,.85+.15,t+1.5/2-.07+o*.03,0,o*.06,0),{muster:"metall"});return .85+.1}function Ph(){let i=new Se("glatt");for(let t=0;t<5;t++){let n=t/5*Math.PI*2,r=t?.28:0,s=t?.32+Ve(t,2)*.18:.55;i.add(new Mt(t?.12:.18,s,7),t%2?Rh:"#ff9a2e",ie(Math.cos(n)*r,s/2,Math.sin(n)*r*.7),{muster:"glatt"}),i.add(new Mt(t?.06:.09,s*.6,6),Ch,ie(Math.cos(n)*r,s*.3,Math.sin(n)*r*.7),{muster:"glatt"})}let e=new it(i.geometrie(),new en({vertexColors:!0,toneMapped:!1}));return e.castShadow=!1,e}function Lh(i,e,t,n=0){let r=new De().makeRotationY(n).setPosition(e,0,t),s=(o,l,u,h)=>i.add(o,l,r.clone().multiply(u),{muster:h}),a=(o,l,u,h,f,c,p,g=0)=>s(new mt(o,l,u),p,ie(h,f+l/2,c,0,g),"metall");s(new Oe(.4,.47,.55,11),"#6a4a2e",ie(0,.275,0),"rinde"),s(new Oe(.41,.41,.03,11),"#a07a4e",ie(0,.56,0),"holz"),a(.64,.15,.42,0,.57,0,ir),a(.34,.2,.24,0,.72,0,ir),a(.96,.19,.34,-.05,.92,0,_l),a(.9,.02,.3,-.05,1.11,0,"#7d8087"),s(new Mt(.15,.55,10),_l,ie(.7,1.02,0,0,0,-Math.PI/2,1,1,1.05),"metall"),a(.2,.13,.26,-.62,.98,0,_l),s(new Oe(.03,.035,.6,6),Ur,ie(-.1,1.17,.06,0,.5,Math.PI/2),"holz"),a(.11,.11,.24,.17,1.12,-.11,ir,.5)}var Dh={bretter:"#8b6542",blockbohlen:"#7b5535",stein:"#8e8a80",putz:"#d9cfb6",fachwerk:"#ddd3b8",quader:"#9b968c",ziegel:"#9c5a42"},yl={ziegel:"#a2553a",schindel:"#6f5c49",stroh:"#c8a45a",schiefer:"#4c5462"},pg={bretter:"holz",blockbohlen:"holz",stein:"stein",quader:"stein",ziegel:"stein",putz:"putz",fachwerk:"putz"},Uh={ziegel:"ziegel",schindel:"schindel",stroh:"stroh",schiefer:"schindel"},nn="#5b3b22",rr="#3a2614",mg="#33404c",bl=i=>i?new Ce(i[0]/255,i[1]/255,i[2]/255).convertSRGBToLinear():null;function Nh(i,e,t,n){if(!n)return;i.gruppe.rotation.y=-n*Math.PI/180;let r=(s,a)=>Sh(s-e,a-t,n).map((o,l)=>o+(l?t:e));i.raeume=i.raeume.map(s=>{let a=r(s.x0,s.z0),o=r(s.x1,s.z1);return{x0:Math.min(a[0],o[0]),x1:Math.max(a[0],o[0]),z0:Math.min(a[1],o[1]),z1:Math.max(a[1],o[1])}});for(let s of i.tueren)[s.x,s.z]=r(s.x,s.z);for(let s of i.feuer)[s.x,s.z]=r(s.x,s.z)}function zh(i,e,t,n){let r=new At;r.position.set(e,t,n);let s=new Se,a=i.koerper,o=c=>typeof c=="string"?Math.max(0,a.findIndex(p=>p.id===c)):c??0,l={gruppe:r,daecher:[],raeume:[],tueren:[],drehen:[],feuer:[],flackern:[]},u=.2;a.forEach((c,p)=>{let g=c.x,y=c.x+c.b,m=-c.d,d=-c.d-c.t,v=c.h,S=Dh[c.wand||"bretter"]||Dh.bretter,b=c.dach||{form:"flach"},I=b.hoehe??1.6,T=b.ueber??.35,w=b.form,A={muster:pg[c.wand||"bretter"]||"holz",schwanken:.03},x={muster:Uh[b.deckung||"schindel"]||"schindel",schwanken:.03},_=(i.tueren||[]).filter(X=>o(X.koerper)===p).sort((X,se)=>X.x-se.x),C=g;for(let X of _){let se=X.x-X.b/2,Ie=X.x+X.b/2;se>C&&s.box(se-C,v,u,(C+se)/2,0,m-u/2,S,0,A),s.box(X.b,v-X.h,u,X.x,X.h,m-u/2,S),C=Ie,s.box(.12,X.h,u+.06,se-.06,0,m-u/2,nn,0,{muster:"holz"}),s.box(.12,X.h,u+.06,Ie+.06,0,m-u/2,nn,0,{muster:"holz"}),s.box(X.b+.24,.12,u+.06,X.x,X.h,m-u/2,nn,0,{muster:"holz"});let Y=X.art==="doppel"||X.art==="tor"?[[se,1],[Ie,-1]]:[[se,1]];for(let[Q,fe]of Y){let re=X.b/Y.length,be=new Se;be.box(re-.04,X.h-.04,.08,fe*re/2,0,0,"#6a4527",0,{muster:"holz",schwanken:.05}),be.box(re-.1,.1,.1,fe*re/2,X.h*.3,.02,rr),be.box(re-.1,.1,.1,fe*re/2,X.h*.72,.02,rr);let Te=be.netz(),Ue=new At;Ue.position.set(Q,0,m-.06),Ue.add(Te),r.add(Ue),l.tueren.push({fluegel:Ue,x:e+X.x,z:n+m,zu:0,auf:fe*-1.75})}}if(C<y&&s.box(y-C,v,u,(C+y)/2,0,m-u/2,S,0,A),s.box(c.b,v,u,(g+y)/2,0,d+u/2,S,0,A),s.box(u,v,c.t-2*u,g+u/2,0,(m+d)/2,S,0,A),s.box(u,v,c.t-2*u,y-u/2,0,(m+d)/2,S,0,A),c.wand==="fachwerk"||c.wand==="blockbohlen"||c.wand==="bretter"){let X=c.wand==="fachwerk"?"#4a3220":"#5e3f25",se=.04;for(let[Ie,Y]of[[g,m],[y,m],[g,d],[y,d]])s.box(.26,v,.26,Ie,0,Y,X,0,{muster:"holz"});if(s.box(c.b+.1,.18,.08,(g+y)/2,v-.18,m+se,X),s.box(.08,.18,c.t,y+se,v-.18,(m+d)/2,X),s.box(.08,.18,c.t,g-se,v-.18,(m+d)/2,X),c.wand==="fachwerk"){s.box(c.b+.1,.14,.08,(g+y)/2,v*.45,m+se,X),s.box(.08,.14,c.t,y+se,v*.45,(m+d)/2,X);for(let Ie=1;Ie<Math.round(c.b/1.4);Ie++)s.box(.14,v,.08,g+Ie*c.b/Math.round(c.b/1.4),0,m+se,X)}}c.sockel||c.wand==="stein"||c.wand==="quader"?s.box(c.b+.12,.35,c.t+.12,(g+y)/2,0,(m+d)/2,"#6c675e",0,{muster:"stein"}):s.box(c.b+.1,.3,c.t+.1,(g+y)/2,0,(m+d)/2,"#6c675e",0,{muster:"stein"});let L=v+I,U=(g+y)/2,k=(m+d)/2,W=new Se;if(w==="sattel"&&(b.first||"x")==="x")for(let X of[g+u/2,y-u/2])W.flaechen([[[X,v,m],[X,v,d],[X,L,k]]],S,A);if(w==="sattel"&&b.first==="d")for(let X of[m-u/2,d+u/2])W.flaechen([[[g,v,X],[y,v,X],[U,L,X]]],S,A);if(w==="pult")for(let X of[g+u/2,y-u/2])W.flaechen([[[X,v,m],[X,v,d],[X,L,d]]],S,A);let O=bl(b.farbe)||new Ce(yl[b.deckung||"schindel"]||yl.schindel),$=g-T,B=y+T,ee=m+T,ae=d-T;if(w==="flach")W.box(c.b+2*T,.25,c.t+2*T,U,v,k,O,0,x);else if(w==="sattel"&&(b.first||"x")==="x"){let X=I/(c.t/2)*T,se=v-X;W.viereck([$,se,ee],[B,se,ee],[B,L,k],[$,L,k],O,x),W.viereck([$,se,ae],[B,se,ae],[B,L,k],[$,L,k],O,x),W.box(c.b+2*T+.1,.16,.24,U,L-.08,k,rr)}else if(w==="sattel"){let X=I/(c.b/2)*T,se=v-X;W.viereck([$,se,ee],[$,se,ae],[U,L,ae],[U,L,ee],O,x),W.viereck([B,se,ee],[B,se,ae],[U,L,ae],[U,L,ee],O,x),W.box(.24,.16,c.t+2*T+.1,U,L-.08,k,rr)}else if(w==="pult"){let X=I/c.t*T;W.viereck([$,v-X,ee],[B,v-X,ee],[B,L+X,ae],[$,L+X,ae],O,x)}else{let X=v-.25,se=c.b>=c.t,Ie=w==="zelt"?0:Math.abs(c.b-c.t)/2,Y=se?[U-Ie,L,k]:[U,L,k-Ie],Q=se?[U+Ie,L,k]:[U,L,k+Ie],fe=[$,X,ee],re=[B,X,ee],be=[B,X,ae],Te=[$,X,ae];se?(W.viereck(fe,re,Q,Y,O,x),W.viereck(Te,be,Q,Y,O,x),W.flaechen([[fe,Te,Y],[re,be,Q]],O,x)):(W.viereck(fe,Te,Y,Q,O,x),W.viereck(re,be,Y,Q,O,x),W.flaechen([[fe,re,Q],[Te,be,Y]],O,x))}if(!W.leer){let X=W.netz();r.add(X),l.daecher.push(X)}c.betretbar&&(s.box(c.b-2*u,.06,c.t-2*u,U,0,k,i.innen?.boden==="stein"?"#8a857c":"#86603c",0,{muster:i.innen?.boden==="stein"?"stein":"holz"}),l.raeume.push({x0:e+g,x1:e+y,z0:n+d,z1:n+m}))});for(let c of i.fenster||[]){let p=a[o(c.koerper)],g=c.wand==="ost",y=c.art==="glut"?"#e7a640":c.art==="gruen"?"#4e6a52":c.art==="violett"?"#b38ad6":c.art==="schalter"?"#221a16":mg,m=new Se,d=c.z;if(m.box(c.b+.16,c.h+.16,.06,0,d-.08,0,nn,0,{muster:"holz"}),m.box(c.b,c.h,.08,0,d,.01,y),(c.art==="kreuz"||!c.art)&&(m.box(.06,c.h,.1,0,d,.02,nn,0,{muster:"holz"}),m.box(c.b,.06,.1,0,d+c.h/2-.03,.02,nn,0,{muster:"holz"})),c.art==="schalter"){for(let S=1;S<6;S++)m.box(.05,c.h-.12,.08,-c.b/2+c.b*S/6,d+.12,.05,"#c4a052",0,{muster:"metall"});m.box(c.b+.24,.1,.45,0,d-.1,.2,"#7a5232",0,{muster:"holz"})}if(c.laeden)for(let S of[-1,1])m.box(c.b/2,c.h,.06,S*(c.b*.75+.1),d,.03,"#4f6b4c",0,.05);if(c.blumen){m.box(c.b+.1,.18,.22,0,d-.2,.1,"#6a4527");for(let S=0;S<4;S++)m.box(.14,.14,.14,-c.b/2+.15+S*(c.b-.3)/3,d-.04,.12,S%2?"#d2463c":"#e8c547")}let v=m.netz(!1);g?(v.rotation.y=Math.PI/2,v.position.set(p.x+p.b+.01,0,-(c.d??p.t/2))):v.position.set(c.x??0,0,-p.d+.01),r.add(v)}for(let c of i.zubehoer||[]){let p=a[o(c.koerper)],g=p.dach||{form:"flach"},y=p.h+(g.hoehe??1.6);if(c.art==="esse"){let m=(i.zubehoer||[]).find(I=>I.art==="kamin"),d=m?m.x??0:((c.x0??-1)+(c.x1??1))/2,v=m?-(m.d??p.t/2):-(p.d+p.t/2),S=Ih(s,d,v),b=Ph();b.position.set(d,S,v),r.add(b),l.flackern.push(b),l.feuer.push(new P(e+d,t+S+.35,n+v))}else if(c.art==="kamin")s.box(.6,y-p.h+.9,.6,c.x??0,p.h-.2,-(c.d??p.t/2),"#7a6f66",0,{muster:"stein"});else if(c.art==="banner")s.box(.55,1.1,.05,c.x??0,(c.z??2)-1.1,-p.d+.05,bl(c.farbe)||"#9b2f2a"),s.box(.7,.06,.08,c.x??0,c.z??2,-p.d+.06,nn,0,{muster:"holz"});else if(c.art==="laterne"||c.art==="schild")s.box(.24,.32,.24,c.x??0,(c.z??2)-.3,-p.d+.15,c.art==="laterne"?"#f1b84d":"#8a6440");else if(c.art==="vordach"){let m=c.x0??-1,d=c.x1??1,v=c.tiefe??1,S=c.z??2.2,b=-p.d,I={muster:Uh[c.deckung||"schindel"]||"schindel"},T=bl(c.farbe)||new Ce(yl[c.deckung||"schindel"]),w=new Se;w.viereck([m-.15,S+.45,b],[d+.15,S+.45,b],[d+.15,S-.05,b+v+.15],[m-.15,S-.05,b+v+.15],T,I);for(let x of[m,d])w.box(.12,S-.05,.12,x,0,b+v,nn,0,{muster:"holz"});let A=w.netz();r.add(A)}else if(c.art==="muehlrad"){let m=new Se,d=c.r??1.5,v=c.b??.8;for(let b of[-v/2,v/2])m.add(new di(d,.07,6,24),nn,new De().makeTranslation(0,0,b),{muster:"holz"});for(let b=0;b<8;b++){let I=b*Math.PI/4;m.add(new mt(.09,d*2,.09),nn,new De().makeRotationZ(I),{muster:"holz"}),m.add(new mt(.06,.42,v+.08),"#6a4a2c",new De().makeRotationZ(I).multiply(new De().makeTranslation(0,d-.12,0)),{muster:"holz"})}m.add(new Oe(.16,.16,v+.4,10),rr,new De().makeRotationX(Math.PI/2));let S=m.netz();S.position.set(c.x??0,c.z??d*.75,-p.d+v/2+.15),r.add(S),l.drehen.push(S)}else if(c.art==="fluegel"){let m=new Se,d=c.laenge??3;for(let S=0;S<4;S++){let b=S*Math.PI/2;m.add(new mt(.16,d,.06),nn,new De().makeRotationZ(b).multiply(new De().makeTranslation(0,d/2,0))),m.add(new mt(.62,d*.8,.03),"#d8cfb9",new De().makeRotationZ(b).multiply(new De().makeTranslation(.36,d*.55,.03)))}m.box(.4,.4,.5,0,-.2,-.2,rr);let v=m.netz();v.position.set(c.x??0,c.z??p.h,-p.d+.45),r.add(v),l.drehen.push(v)}}let h={tisch:[1.2,.75,.8,"#7a5232"],bett:[1,.55,2,"#a8443a"],theke:[2.4,1,.6,"#6a4527"],fass:[.6,.8,.6,"#7a5232"],amboss:[.7,.7,.4,"#3c3c40"],regal:[1.2,1.8,.4,"#6a4527"],ofen:[1,1.3,1,"#6c655e"],altar:[1.4,1,.7,"#bdb5a5"],bank:[1.5,.45,.4,"#7a5232"],kessel:[.7,.6,.7,"#34332f"],heu:[1.2,.8,1,"#c9a85a"],saecke:[.9,.6,.6,"#c2ae86"],muehlstein:[1.2,.5,1.2,"#8e8a80"],frisierstuhl:[.7,.55,.7,"#74428c"]};for(let c of i.innen?.moebel||[])c.art==="spiegel"&&(s.box(1,1.95,.14,c.x,.06,-c.d,"#c49c46",0,{muster:"metall"}),s.box(.76,1.55,.05,c.x,.26,-c.d+.09,"#c4a2ea",0,{muster:"glatt"}));for(let c of i.innen?.moebel||[])if(c.art==="schalter"){s.box(1.6,1,.5,c.x,.06,-c.d,"#7a5232",0,{muster:"holz"});for(let p=0;p<6;p++)s.box(.04,.9,.04,c.x-.75+p*.3,1.06,-c.d+.2,"#c4a052",0,{muster:"metall"});s.box(1.6,.06,.06,c.x,1.92,-c.d+.2,"#c4a052",0,{muster:"metall"})}else c.art==="tresor"&&(s.box(1.1,1.2,.8,c.x,.06,-c.d,"#34363c",0,{muster:"metall"}),s.add(new Oe(.22,.22,.05,14),"#cca85a",new De().makeRotationX(Math.PI/2).setPosition(c.x,.66,-c.d+.42),{muster:"metall"}));for(let c of i.innen?.moebel||[])c.art==="amboss"&&Lh(s,c.x,-c.d,0);for(let c of i.innen?.moebel||[])if(c.art==="treppe")for(let p=0;p<6;p++)s.box(1.1,.35*(p+1),.4,c.x,.06,-(c.d-1.2+p*.4+.2),"#7a5232",0,{muster:"holz"});else if(c.art==="treppe_oben"){s.box(1.2,.02,2.4,c.x,.07,-c.d,"#181210",0,{muster:"glatt"});for(let p of[-.65,.65])s.box(.1,.9,2.4,c.x+p,.06,-c.d,"#5b3b22",0,{muster:"holz"});s.box(1.3,.1,.1,c.x,.9,-(c.d-1.2),"#5b3b22",0,{muster:"holz"})}for(let c of(i.innen?.moebel||[]).filter(p=>!["spiegel","treppe","treppe_oben","schalter","tresor","amboss"].includes(p.art))){let[p,g,y,m]=h[c.art]||[.8,.8,.8,"#7a5232"];s.box(p,g,y,c.x,.06,-c.d,m,0,{muster:m==="#8a857c"||c.art==="ofen"||c.art==="muehlstein"||c.art==="altar"?"stein":"holz"})}let f=s.netz();return r.add(f),l}var Nr="#5d4129";function gg(i,e,t,n,r,s,a=1){for(let o=0;o<r;o++){let l=o/r*Math.PI*2+s,u=o===0?0:t*.28,h=(o===0?.62:.46+.1*Ve(o,s))*t;i.add(nr(2,.13,s*3+o),n[o%n.length],ie(Math.cos(l)*u,e*(o===0?.68:.56+.12*Ve(s,o)),Math.sin(l)*u,Ve(o,3),Ve(o,4),0,h,h*a,h),{muster:"laub",verlauf:[.55,1.2]})}}function sr(i,e,t,n,r=Nr,s=1,a=5){let o=new Se("rinde");return o.add(new Oe(.18,.32,i*.55,9),r,ie(0,i*.275,0),.05),o.add(new Oe(.05,.1,i*.3,4),r,ie(.35,i*.4,0,0,0,-.7)),gg(o,i,e,t,a,n,s),o.geometrie()}function xg(i,e,t){let n=new Se("rinde");n.add(new Oe(.12,.22,i*.3,8),Nr,ie(0,i*.15,0));let r=4;for(let s=0;s<r;s++){let a=s/r,o=e*.5*(1-a*.72),l=i*.42*(1-a*.35);n.add(new Mt(o,l,11),t[s%t.length],ie(0,i*.18+a*i*.62+l/2,0,0,s*.4,0),{muster:"laub",verlauf:[.6,1.15]})}return n.geometrie()}function _g(i){let e=new Se("rinde");e.add(new Oe(.12,.28,i*.7,8),"#5a5148",ie(0,i*.35,0),.05);for(let t=0;t<5;t++){let n=t*1.3,r=i*(.35+t*.08);e.add(new Oe(.03,.08,i*.32,4),"#5a5148",ie(Math.cos(n)*.5,r+i*.1,Math.sin(n)*.5,Math.sin(n)*.8,0,-Math.cos(n)*.8))}return e.geometrie()}function yg(){let i=new Se("holz");for(let e=0;e<5;e++){let t=-.8+e*.4,n=2+Ve(e,9)*.3;i.add(new Oe(.19,.2,n,6),"#6e4c2e",ie(t,n/2,-.35),.06),i.add(new Mt(.19,.4,6),"#6e4c2e",ie(t,n+.2,-.35))}return i.box(2,.14,.1,0,1.4,-.12,"#4f3420"),i.geometrie()}function bg(){let i=new Se("holz");for(let e of[-.95,.95])i.box(.14,1,.14,e,0,-.15,"#6e4c2e");return i.box(2,.1,.06,0,.75,-.15,"#8a6440"),i.box(2,.1,.06,0,.4,-.15,"#8a6440"),i.geometrie()}function vg(){let i=new Se("holz");i.add(new Oe(.3,.3,.72,8),"#7a5232",ie(0,.36,-.1),.05);for(let e of[.15,.57])i.add(new Oe(.315,.315,.06,8),"#3b3530",ie(0,e,-.1));return i.geometrie()}function Mg(){let i=new Se("holz");return i.box(.82,.6,.5,0,0,-.27,"#8b6440",.2,.06),i.box(.86,.08,.54,0,.5,-.27,"#5b3b22",.2),i.geometrie()}function Sg(){let i=new Se;return i.box(.1,1.9,.1,0,0,0,"#3b3530"),i.box(.5,.06,.06,.2,1.8,0,"#3b3530"),i.box(.22,.3,.22,.4,1.45,0,"#f3c25a"),i.geometrie()}function Eg(){let i=new Se("stroh");return i.add(new Oe(.48,.48,.9,10),"#c8a55a",ie(0,.48,0,0,0,Math.PI/2),.06),i.geometrie()}function wg(){let i=new Se("holz");for(let e=0;e<3;e++)for(let t=0;t<4-e;t++)i.add(new Oe(.15,.15,1.5,6),e%2?"#8a6440":"#7a5634",ie(-.45+t*.3+e*.15,.15+e*.26,-.3,0,0,Math.PI/2),.08);return i.geometrie()}function Tg(){let i=new Se("holz");i.box(1.4,.08,.36,0,.42,-.18,"#8a6440");for(let e of[-.6,.6])i.box(.08,.42,.3,e,0,-.18,"#5b3b22");return i.geometrie()}function vl(i){let e=new Se("holz");for(let[t,n]of[[-1.4,-.1],[1.4,-.1],[-1.4,-1],[1.4,-1]])e.box(.1,2.2,.1,t,0,n,"#5b3b22");e.box(3,.9,.7,0,0,-.35,"#8a6440",0,.04),e.viereck([-1.6,2,.2],[1.6,2,.2],[1.6,2.5,-1.2],[-1.6,2.5,-1.2],i,{muster:"putz"});for(let t=0;t<6;t++)e.box(.22,.2,.22,-1.1+t*.44,.9,-.35,["#d2463c","#e8c547","#6aa04a"][t%3]);return e.geometrie()}function Ag(){let i=new Se;for(let e=0;e<6;e++){let t=.22+Ve(e,2)*.12;i.add(new cn(1,0),"#d9792c",ie(-.8+e*.32,t*.8,-.25+Ve(e,5)*.2-.1,0,e,0,t,t*.8,t),.08)}return i.geometrie()}function Rg(){let i=new Se("stein");i.add(new Oe(1,1.05,.8,10,1,!0),"#8e8a80",ie(0,.4,-.35),.08),i.add(new Oe(.9,.9,.05,10),"#2f6f8f",ie(0,.55,-.35),{muster:"glatt"});for(let e of[-.9,.9])i.box(.14,2.1,.14,e,0,-.35,"#5b3b22");return i.viereck([-1.2,2,.4],[1.2,2,.4],[1.2,2.6,-.35],[-1.2,2.6,-.35],"#a2553a",{muster:"ziegel"}),i.viereck([-1.2,2,-1.1],[1.2,2,-1.1],[1.2,2.6,-.35],[-1.2,2.6,-.35],"#a2553a",{muster:"ziegel"}),i.geometrie()}function Cg(){let i=new Se("holz");for(let e of[-2.1,2.1])i.box(.5,4,.5,e,0,-.2,"#6e4c2e",0,.05),i.add(new Mt(.36,.5,6),"#6e4c2e",ie(e,4.25,-.2));return i.box(4.9,.36,.4,0,3.3,-.2,"#5b3b22"),i.box(1.6,.7,.08,0,2.55,.02,"#8a6440"),i.geometrie()}function Ig(){let i=new Se("stroh");return i.add(new Mt(1.1,1.3,9),"#3a332c",ie(0,.65,0),.1),i.geometrie()}function Pg(){let i=new Se("rinde");return i.add(new Oe(.45,.55,9,8),"#5d4129",ie(0,.5,-4.5,Math.PI/2,0,0),.05),i.geometrie()}var El={};function Bh(i){El=i}function Lg(i){let e=new Se;for(let t of i){let n=[];for(let r=0;r+8<t.p.length;r+=9)n.push([[t.p[r],t.p[r+1],t.p[r+2]],[t.p[r+3],t.p[r+4],t.p[r+5]],[t.p[r+6],t.p[r+7],t.p[r+8]]]);n.length&&e.flaechen(n,t.farbe,{muster:t.muster,schwanken:.03})}return e.geometrie()}var Zs="#7a5634",Tl="#8f6a42",Dg="#8a857a",wl="#3a3836",Ug="#ffb24a",Ng="#fff0b0",Oh={moor_bruecke_alt_01:{luecken:[5,11],vorn:1,kurzVorn:2,hinten:1,kurzHinten:-1},moor_bruecke_alt_02:{luecken:[3,9,10],vorn:.42,kurzVorn:-1,hinten:1,kurzHinten:1},moor_bruecke_alt_03:{luecken:[7],vorn:0,kurzVorn:-1,hinten:.7,kurzHinten:3},moor_bruecke_morsch_01:{luecken:[2,6,7,8,9,10,13],vorn:0,kurzVorn:-1,hinten:.3,kurzHinten:-1}};function Ml(i,e,t,n=""){let r=new Se("holz"),s=.85,a=t?0:-e/2,o=Math.round(i/.42),l=Oh[n];for(let h=0;h<o;h++){if(l&&l.luecken.includes(h))continue;let f=-i/2+(h+.5)*i/o,c=l?(Ve(h,17)-.5)*.08:0,p=l?-Ve(h,5)*.05:0;r.add(new mt(i/o-(l?.07:.04),.12,e*(l?.94+Ve(h,9)*.06:1)),l?h%3?"#7a6a58":h%2?"#6a5c4c":"#86745e":h%3?Zs:Tl,ie(f,s-.06+p,a+(l?(Ve(h,11)-.5)*.12:0),c,l?(Ve(h,13)-.5)*.06:0,0),{muster:"holz",schwanken:.06}),l&&Ve(h,21)<.3&&r.box(i/o*.7,.02,e*.4,f,s,a+(Ve(h,23)-.5)*e*.5,"#4f6236",0,{muster:"laub"})}for(let[h,f,c]of[[a-e/2+.1,l?l.hinten:1,l?l.kurzHinten:-1],[a+e/2-.1,l?l.vorn:1,l?l.kurzVorn:-1]]){let p=0;for(let g=-i/2+.15;g<=i/2;g+=i/4,p++){if(r.box(.22,1.8,.22,g,s-1.8,h,l?"#3d3226":"#4a3020"),p/4>f+.01)continue;let y=p===c?.42:.9;r.add(new mt(.16,y,.16),l?"#4e4032":"#5b3b22",ie(g,s-.1+y/2,h,0,0,l&&p===c?.25:0))}if(f>0){let g=i*Math.min(1,f);if(c>=0&&l){let y=-i/2+.15+c*i/4,m=Math.atan2(.4,y+i/2);r.add(new mt(Math.hypot(y+i/2,.4),.12,.12),"#5b4a38",ie((-i/2+y)/2,s+.55,h,0,0,-m))}else r.box(g,.12,.12,-i/2+g/2,s+.75,h,l?"#5b4a38":"#5b3b22")}}let u=r.geometrie();return t&&(u.rotateY(Math.PI/2),u.translate(0,0,-i/2)),u}function zg(){let i=new Se("stein");i.box(7.6,1.7,1.5,0,-.8,-.85,Dg,0,{muster:"stein",schwanken:.05});for(let e=0;e<17;e++)i.box(.42,.1,1.4,-3.4+e*.425,.9,-.85,e%2?Zs:Tl,0,{muster:"holz"});for(let e of[-2.2,0,2.2])i.box(.9,.5,.25,e,.1,-.05,"#cfe4ec",0,{muster:"glatt"}),i.box(1.1,.25,.9,e,-.15,.45,"#e8f3f6",0,{muster:"glatt"});for(let e of[-3.6,3.6])i.box(.5,1.3,1.7,e,-.4,-.85,"#77726a",0,{muster:"stein"});return i.geometrie()}function Fg(){let i=new Se("holz");for(let t=0;t<12;t++)i.box(.44,.16,3.2,-2.6+t*.47,.05,-1.4,t%3?Zs:Tl,0,{muster:"holz",schwanken:.06});for(let t of[-.1,-2.7])i.box(5.7,.18,.2,0,.22,t,"#5b3b22");for(let t of[-2.6,2.6])for(let n of[-.1,-2.7])i.box(.18,.8,.18,t,.2,n,"#4a3020");for(let t=0;t<6;t++)i.add(new di(.12,.04,5,8),wl,ie(-2.4+t*.22,.32,-.1+t%2*.05,Math.PI/2*(t%2),0,0),{muster:"metall"});let e=i.geometrie();return e.rotateZ(.08),e.rotateX(-.05),e.translate(0,.72,0),e}function kg(){let i=new Se("holz");i.box(3.2,.36,1.1,0,0,-.5,"#5e4029",0,{muster:"holz"}),i.box(3,.08,.9,0,.2,-.5,"#3b2a1c");for(let t of[-1,1])i.add(new Mt(.55,.9,4),"#5e4029",ie(t*2,.18,-.5,0,Math.PI/4,t*Math.PI/2,1,1,.7),{muster:"holz"});i.box(.08,.06,2.4,.3,.42,-.5,Zs,.5);let e=i.geometrie();return e.translate(0,.6,0),e}function Fh(i){let e=new Se("stein");e.add(nr(1,.08,3+i),"#7d7a72",ie(0,1.1,-.2,0,.3,i,.42,1.25,.3),{muster:"stein",verlauf:[.75,1.1]});for(let t=0;t<6;t++)e.add(new di(.16+t*.03,.025,4,10,Math.PI*1.4),"#5d8f8a",ie(0,1.25+t*.02,.1,0,0,t*1.1),{muster:"glatt"});return e.geometrie()}function Bg(){let i=new Se("stein");i.box(2,.4,.9,0,-.15,-.45,"#6f6b62");for(let t of[-.75,.75])i.box(.25,1.1,.25,t,.25,-.45,"#7d7a72");i.box(2.1,.22,1,0,1.35,-.45,"#6a665d"),i.box(.5,.6,.35,0,.25,-.45,"#8d887d"),i.add(nr(1,.1,9),"#3f5a30",ie(-.6,1.6,-.3,0,0,0,.5,.18,.4),{muster:"laub"});let e=i.geometrie();return e.rotateZ(-.12),e}function Og(){let i=new Se("stein");for(let e=0;e<16;e++){let t=e/16*Math.PI*2,n=.32+Ve(e,4)*.12;i.add(nr(1,.12,e),e%3?"#8a857a":"#77726a",ie(Math.cos(t)*2,n*.5,-1.2+Math.sin(t)*1,0,t,0,n*1.2,n*.8,n),{muster:"stein",verlauf:[.8,1.1]})}return i.box(3.6,.06,1.6,0,0,-1.2,"#4a3a28",0,{muster:"glatt"}),i.geometrie()}function Al(i,e,t,n,r){i.add(new Mt(.3*r,.9*r,7),Ug,ie(e,t+.45*r,n),{muster:"glatt"}),i.add(new Mt(.16*r,.55*r,6),Ng,ie(e+.04,t+.3*r,n+.04),{muster:"glatt"})}function Hg(){let i=new Se("metall");return i.box(.08,1.35,.08,0,0,0,wl,0,{muster:"metall"}),i.add(new Oe(.3,.18,.35,8,1,!0),wl,ie(0,1.5,0),{muster:"metall"}),i.add(new Oe(.24,.24,.12,8),"#c2552a",ie(0,1.55,0)),Al(i,0,1.6,0,.8),i.geometrie()}function Vg(){let i=new Se("holz");for(let e=0;e<12;e++){let t=e/12*Math.PI*2;i.add(nr(1,.1,e),"#77726a",ie(Math.cos(t)*1.2,.12,-.7+Math.sin(t)*.9,0,0,0,.26,.2,.26),{muster:"stein"})}for(let e=0;e<7;e++){let t=e/7*Math.PI*2;i.add(new Oe(.08,.1,1.5,6),"#5d4129",ie(Math.cos(t)*.32,.6,-.7+Math.sin(t)*.32,Math.sin(t)*.45,0,-Math.cos(t)*.45),{muster:"rinde"})}return Al(i,0,.15,-.7,1.7),i.geometrie()}function Gg(){let i=new Se("glatt");return i.add(new Oe(.025,.05,1.6,4),"#4a4a32",ie(0,.8,0,.1,0,.08),{muster:"rinde"}),i.add(new cn(.2,1),"#c8ffd8",ie(.08,1.75,0)),i.add(new cn(.11,1),"#a8f0c0",ie(-.25,1.3,.1)),i.geometrie()}function Wg(){let i=new Se("stroh");return i.box(1.1,.28,2,0,0,-.5,"#c8a55a",0,{muster:"stroh"}),i.box(.9,.06,1.1,0,.28,-.25,"#6a4a3a",.1,{muster:"putz"}),i.box(.5,.14,.32,0,.28,-1.25,"#d8cdb0",0,{muster:"putz"}),i.geometrie()}function Xg(){let i=new Se("holz");i.box(1.2,.55,.7,0,0,-.35,"#6a4527",0,{muster:"holz"}),i.add(new Oe(.35,.35,1.2,10,1,!1,0,Math.PI),"#7a5232",ie(0,.55,-.35,0,0,Math.PI/2),{muster:"holz"});for(let e of[-.45,.45])i.box(.08,.95,.74,e,0,-.35,"#b08a3a",0,{muster:"metall"});return i.box(.16,.2,.06,0,.35,.02,"#d8b04a",0,{muster:"metall"}),i.geometrie()}function qg(){let i=new Se("holz");i.box(2,.1,.95,0,.75,-.5,"#7a5232",0,{muster:"holz"});for(let[e,t]of[[-.85,-.12],[.85,-.12],[-.85,-.88],[.85,-.88]])i.box(.12,.75,.12,e,0,t,"#5b3b22");return i.add(new Oe(.05,.05,.28,6),"#efe6cf",ie(.5,.99,-.5)),Al(i,.5,1.13,-.5,.18),i.box(.7,.02,.5,-.3,.85,-.5,"#d8c8a0",.2,{muster:"glatt"}),i.geometrie()}function Yg(){let i=new Se("holz");i.box(1.2,.5,1,0,0,-.5,"#5b3b22",0,{muster:"holz"}),i.box(1.2,1.9,.18,0,.5,-.92,"#5b3b22",0,{muster:"holz"}),i.box(1,.12,.85,0,.5,-.45,"#9b2f2a",0,{muster:"putz"}),i.box(.9,1,.06,0,.9,-.82,"#9b2f2a",0,{muster:"putz"});for(let e of[-.6,.6])i.box(.14,.3,.9,e,.5,-.5,"#4a3020"),i.add(new ui(.12,8,6),"#b08a3a",ie(e,2.5,-.92),{muster:"metall"});return i.geometrie()}function Zg(){let i=new Se("holz");for(let t of[-.32,.32])i.box(.09,4.4,.09,t,0,0,"#7a5634",0,{muster:"holz"});for(let t=0;t<11;t++)i.box(.64,.06,.07,0,.3+t*.38,0,"#8f6a42");let e=i.geometrie();return e.rotateX(-.22),e}function $g(){let i=new Se("rinde");i.add(new Oe(.45,.6,9.6,9),"#5d4129",ie(0,.5,-.45,0,0,Math.PI/2),{muster:"rinde"}),i.add(new Oe(.62,.62,.06,9),"#b08a5a",ie(-4.82,.5,-.45,0,0,Math.PI/2));for(let e of[-2,1.5,3.2])i.add(new Oe(.04,.12,1.2,4),"#5d4129",ie(e,1,-.45,.5,0,.4));return i.geometrie()}function kh(i){let e=new Se("glatt");for(let t=0;t<16;t++){let n=Ve(t,7)*Math.PI*2,r=Ve(t,3)*i,s=.9+Ve(t,5)*.9,a=Math.cos(n)*r,o=Math.sin(n)*r*.6-.3;e.add(new Mt(.05,s,3),t%3?"#6f8a3c":"#8a9a48",ie(a,s/2,o,(Ve(t,1)-.5)*.4,0,(Ve(t,2)-.5)*.4),{muster:"glatt",verlauf:[.6,1.15]}),t%4===0&&e.add(new Oe(.06,.06,.26,5),"#6a4228",ie(a,s*.85,o))}return e.geometrie()}var Hh={dorf_bruecke_01:[-3.2,-2.7,3.2,.1,.85],moor_bruecke_alt_01:[-3.2,-2.7,3.2,.1,.85],moor_bruecke_alt_02:[-3.2,-2.7,3.2,.1,.85],moor_bruecke_alt_03:[-3.2,-2.7,3.2,.1,.85],moor_bruecke_morsch_01:[-3.2,-2.7,3.2,.1,.85],dorf_bruecke_02:[-1.4,-5.2,1.4,.1,.85],dorf_wehr_01:[-3.5,-1.6,3.5,-.1,1]},Sl=new Map;function Rl(i){if(Sl.has(i.id))return Sl.get(i.id);let e=i.groesse[1]/48*i.massstab*.85,t=i.groesse[0]/48*i.massstab*.68,n=i.id,r=null;return El[n]?r=Lg(El[n]):/eiche_01/.test(n)?r=sr(e,t,["#4a6e2a","#557a30","#41622a"],1):/eiche_02/.test(n)?r=sr(e,t,["#527a30","#46692c","#5e8538"],2,Nr,.9,4):/linde/.test(n)?r=sr(e,t*.9,["#5a8034","#4e702f","#668c3c"],3,Nr,1.25,5):/herbst/.test(n)?r=sr(e,t,["#c9772e","#b85e28","#d8963a"],4):/apfel/.test(n)?r=sr(e,t,["#6b9b43","#5d8c3b","#b8433a"],5,Nr,.85,6):/birke/.test(n)?r=sr(e,t*.7,["#8aa84a","#7c9a42"],6,"#d9d4c8",1.3,4):/tanne/.test(n)?r=xg(e,t*.95,["#2f5a34","#386640","#2a5030"]):/erle_tot/.test(n)?r=_g(e*.85):/palisade/.test(n)?r=yg():/zaun/.test(n)?r=bg():/fass/.test(n)?r=vg():/kiste/.test(n)?r=Mg():/laterne/.test(n)?r=Sg():/heuballen/.test(n)?r=Eg():/holzstapel/.test(n)?r=wg():/dorf_bank/.test(n)?r=Tg():/marktstand_01/.test(n)?r=vl("#b8433a"):/marktstand_02/.test(n)?r=vl("#3f6aa0"):/marktstand_03/.test(n)?r=vl("#5f8a3a"):/kuerbisse/.test(n)?r=Ag():/brunnen/.test(n)?r=Rg():n==="dorf_tor_01"?r=Cg():/meiler/.test(n)?r=Ig():/baumstamm_02/.test(n)?r=Pg():n==="dorf_bruecke_01"?r=Ml(6.4,2.7,!1):Oh[n]?r=Ml(6.4,2.7,!1,n):n==="dorf_bruecke_02"?r=Ml(5.3,2.7,!0):n==="dorf_wehr_01"?r=zg():/faehre/.test(n)?r=Fg():/kahn/.test(n)?r=kg():n==="moor_menhir_01"?r=Fh(0):n==="moor_menhir_02"?r=Fh(.28):/schrein/.test(n)?r=Bg():/steinring/.test(n)?r=Og():/festfeuer/.test(n)?r=Vg():/feuerkorb/.test(n)?r=Hg():/moorlicht/.test(n)?r=Gg():/hoehle_lager/.test(n)?r=Wg():/hoehle_truhe/.test(n)?r=Xg():/hoehle_tisch/.test(n)?r=qg():/hoehle_thron/.test(n)?r=Yg():/hoehle_leiter/.test(n)?r=Zg():/baumstamm_01/.test(n)?r=$g():n==="stil_schilf_01"?r=kh(.45):n==="stil_schilf_02"&&(r=kh(.7)),r&&(r.userData.geteilt=!0),Sl.set(i.id,r),r}var $s=i=>i.kategorie==="bewuchs"&&!/baumstamm|^k_/.test(i.id),Cl=i=>/^dorf_(palisade|zaun)/.test(i.id);var Vh=`
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
  }`,Gh=`
  uniform sampler2D map; uniform float deck; uniform float durch; varying vec2 vUv;
  void main() {
    vec4 c = texture2D(map, vUv); if (c.a < 0.35) discard;
    gl_FragColor = durch > 0.5 ? vec4(mix(c.rgb, vec3(0.08, 0.1, 0.16), 0.75), 0.5) : vec4(c.rgb, deck);
    #include <colorspace_fragment>
  }`,zr=class{constructor(e){this.gruppe=new At;let t=()=>({map:{value:e},groesse:{value:new Ee(1,2)},mitte:{value:new Ee(.5,.05)},rep:{value:new Ee(1,1)},off:{value:new Ee(0,0)},deck:{value:1},durch:{value:0}});this.haupt=new Bt({uniforms:t(),vertexShader:Vh,fragmentShader:Gh,transparent:!0}),this.durch=new Bt({uniforms:t(),vertexShader:Vh,fragmentShader:Gh,transparent:!0,depthTest:!1,depthWrite:!1}),this.durch.uniforms.durch.value=1;let n=new ji(1,1);n.translate(.5,.5,0);let r=new it(n,this.durch),s=new it(n,this.haupt);r.renderOrder=10,s.renderOrder=11,r.frustumCulled=s.frustumCulled=!1,this.gruppe.add(r,s)}setze(e,t,n,r,s){for(let a of[this.haupt,this.durch]){let o=a.uniforms;o.map.value=e,o.rep.value.set(t[0],t[1]),o.off.value.set(n[0],n[1]),o.groesse.value.set(r[0],r[1]),o.mitte.value.set(s[0],s[1])}}bild(e,t,n=!1){for(let r of[this.haupt,this.durch]){let s=r.uniforms;s.rep.value.x=(n?-1:1)/t,s.off.value.x=(e+(n?1:0))/t}}silhouette(e){this.gruppe.children[0].visible=e}};var Ll="#d6a07a",Il="#b98563",Ks="#6e3a1f",js="#c9b58c",Wh="#4b3b2b",Kg="#2f2520",Xh="#7a4a2b",Js="#55331d",Jg="#3a2a1f",jg="#c79a3e",Pl="#8d3b2a",qh="#7a5230",Yh="#5b5e66",ar=(i,e,t,n,r)=>{let s=new At;return s.position.set(e,t,n),r&&!r.leer&&s.add(r.netz()),i.add(s),s},yi=(i,e=10,t=8)=>new ui(i,e,t),qt=(i,e,t,n=9)=>new Oe(i,e,t,n);function Zh(i,e){let t=new Se("putz");t.add(yi(.1),js,ie(0,0,0,0,0,0,1.1,1,1)),t.add(qt(.085,.075,.3),js,ie(0,-.15,0)),t.add(qt(.085,.085,.06),"#b6a27a",ie(0,-.29,0));let n=ar(i,e*.3,.56,0,t),r=new Se("glatt");r.add(qt(.065,.055,.28),Ll,ie(0,-.14,0)),r.add(qt(.07,.07,.07),Js,ie(0,-.25,0),{muster:"holz"}),r.add(yi(.072,8,6),Ll,ie(0,-.33,.01,0,0,0,.9,1.15,1));let s=ar(n,0,-.31,0,r);return{schulter:n,ellbogen:s}}function Qg(){let i=new At,e=ar(i,0,.86,0),t=new Se("putz");for(let g of[-1,1])t.add(qt(.115,.095,.72),Wh,ie(g*.13,-.42,0),.03),t.box(.19,.2,.3,g*.13,-.86,.04,Kg,0,{muster:"holz"}),t.add(qt(.1,.1,.05),Js,ie(g*.13,-.66,0),{muster:"holz"});e.add(t.netz());let n=new Se("putz");n.add(qt(.27,.23,.66,12),js,ie(0,.31,0,0,0,0,1,1,.74),.03),n.add(yi(.27,12,8),js,ie(0,.62,0,0,0,0,1.05,.42,.72)),n.add(qt(.245,.25,.14,12),Wh,ie(0,-.03,0,0,0,0,1,1,.76)),n.box(.42,.78,.04,0,-.42,.185,Xh,0,{muster:"holz",schwanken:.04}),n.box(.3,.36,.04,0,.08,.19,Xh,0,{muster:"holz",schwanken:.04});for(let g of[-1,1])n.add(new mt(.05,.42,.03),Js,ie(g*.12,.5,.15,-.25,0,g*-.12),{muster:"holz"});n.add(qt(.255,.255,.07,14),Jg,ie(0,.04,0,0,0,0,1,1,.8),{muster:"holz"}),n.box(.08,.07,.02,0,.005,.215,jg,0,{muster:"metall"}),n.box(.1,.13,.06,-.21,-.12,.08,Js,.3,{muster:"holz"}),n.add(qt(.015,.015,.24,6),qh,ie(.22,-.08,.1,0,0,.15),{muster:"holz"}),n.box(.035,.05,.03,.235,.05,.1,Yh,0,{muster:"metall"});let r=ar(e,0,0,0,n),s=new Se("glatt");s.add(qt(.08,.09,.12),Il,ie(0,.04,0)),s.add(yi(.165,12,10),Ll,ie(0,.22,.01,0,0,0,.95,1.08,1)),s.add(new Mt(.035,.09,6),Il,ie(0,.21,.17,Math.PI/2-.15,0,0));for(let g of[-1,1])s.box(.035,.03,.02,g*.06,.245,.145,"#1f1814"),s.box(.07,.03,.04,g*.065,.275,.14,Ks,g*.15,{muster:"putz"}),s.add(yi(.04,6,5),Il,ie(g*.158,.22,0,0,0,0,.5,1,.8));s.add(yi(.15,10,8),Ks,ie(0,.12,.06,0,0,0,1.02,1,.85),{muster:"putz"}),s.add(new Mt(.11,.16,8),Ks,ie(0,0,.1,Math.PI+.25,0,0),{muster:"putz"}),s.box(.1,.025,.03,0,.17,.165,Ks,0,{muster:"putz"}),s.add(new ui(.175,12,8,0,Math.PI*2,0,Math.PI*.52),Pl,ie(0,.25,-.005,-.12,0,0,1,.95,1.05),{muster:"putz",schwanken:.04}),s.add(yi(.05,6,5),Pl,ie(0,.26,-.18),{muster:"putz"});for(let g of[-1,1])s.box(.05,.12,.02,g*.03,.15,-.19,Pl,g*.3,{muster:"putz"});let a=ar(r,0,.68,0,s),o=Zh(r,-1),l=Zh(r,1),u=new Se("holz");u.add(qt(.022,.025,.46,7),qh,ie(0,-.12,0)),u.box(.07,.07,.2,0,.1,.03,Yh,0,{muster:"metall"});let h=ar(l.ellbogen,0,-.33,.03,u);h.rotation.x=1.25,o.schulter.rotation.set(.05,0,-.16),o.ellbogen.rotation.set(-.2,0,.05),l.schulter.rotation.set(.1,0,.14),l.ellbogen.rotation.set(-.75,0,-.1);let f=g=>({g,ruhe:g.rotation.clone()}),c={huefte:f(e),rumpf:f(r),kopf:f(a),lS:f(o.schulter),lE:f(o.ellbogen),rS:f(l.schulter),rE:f(l.ellbogen),hammer:f(h)};i.traverse(g=>{g.isMesh&&(g.castShadow=!0,g.receiveShadow=!0)});let p=g=>{let y=Math.sin(g*1.7),m=Math.sin(g*.55);r.scale.set(1+.012*y,1+.018*y,1+.02*y),e.position.x=.025*m,c.huefte.g.rotation.z=c.huefte.ruhe.z-.025*m,c.rumpf.g.rotation.z=c.rumpf.ruhe.z+.03*m,c.rumpf.g.rotation.x=c.rumpf.ruhe.x+.015*y;let d=Math.sin(g*.31)*Math.abs(Math.sin(g*.31))**.5;c.kopf.g.rotation.y=c.kopf.ruhe.y+.5*d,c.kopf.g.rotation.x=c.kopf.ruhe.x-.04*y+.06*Math.sin(g*.23),c.lS.g.rotation.x=c.lS.ruhe.x+.04*Math.sin(g*1.7+.6),c.lE.g.rotation.x=c.lE.ruhe.x-.03*Math.sin(g*1.7+1);let v=g%9/9,S=v>.72?Math.sin((v-.72)/.28*Math.PI):0,b=S*S*(3-2*S);c.rS.g.rotation.x=c.rS.ruhe.x-.35*b+.03*y,c.rE.g.rotation.x=c.rE.ruhe.x-.75*b,c.hammer.g.rotation.y=c.hammer.ruhe.y+.9*b*Math.sin(g*2.2),c.kopf.g.rotation.x+=.22*b,c.kopf.g.rotation.y=c.kopf.g.rotation.y*(1-b)+.25*b};return i.scale.setScalar(1.12),p(0),{gruppe:i,tick:p}}var Dl={handwerker:Qg};var ex=document.createElement("div"),hn=i=>document.querySelector(i)||ex,Fr=matchMedia("(pointer: coarse)").matches,Qe=32,tx="../",or=Fr?2:3,Qs=new URLSearchParams(location.search),Kn={".":"#4e7230",",":"#567a33",v:"#566f34",f:"#3f4f28",m:"#5a4a32",t:"#4a3a2a",s:"#c2ad78",a:"#7f5e36",e:"#8f6b44",k:"#a1978a",p:"#968c7e",d:"#7a5638",h:"#5c544a","~":"#3c7d9a",w:"#3f8296",o:"#2a3a30",F:"#6a655c",X:"#120e0b"," ":"#4a5e2d",M:"#2a6a88",g:"#8f897c",S:"#e9eef1",T:"#8b8d66",u:"#d9b475",y:"#a69c5c",j:"#3d6d2a"},$h=new Set(["k","p","e","a","d"]);function nx(){let e=document.createElement("canvas");e.width=e.height=256;let t=e.getContext("2d");t.fillStyle="rgb(228,228,228)",t.fillRect(0,0,256,256);let n=7,r=()=>(n=n*16807%2147483647)/2147483647;for(let a=0;a<900;a++){let o=r()*256,l=r()*256,u=6+r()*16,h=r()*Math.PI,f=Math.round(190+r()*65);t.strokeStyle=`rgba(${f},${f},${f},0.55)`,t.lineWidth=2+r()*4,t.lineCap="round";for(let c of[-256,0,256])for(let p of[-256,0,256])t.beginPath(),t.moveTo(o+c,l+p),t.lineTo(o+c+Math.cos(h)*u,l+p+Math.sin(h)*u),t.stroke()}let s=new wn(e);return s.wrapS=s.wrapT=Vn,s.colorSpace=_t,s.anisotropy=4,s}var Kh=new fi({vertexColors:!0,color:new Ce(1.1,1.1,1.1)}),Qh={value:0},ix=(()=>{let e=document.createElement("canvas");e.width=e.height=256;let t=e.getContext("2d");t.fillStyle="rgb(150,150,150)",t.fillRect(0,0,256,256);let n=3,r=()=>(n=n*16807%2147483647)/2147483647;for(let a=0;a<260;a++){let o=r()*256,l=r()*256,u=10+r()*26,h=r()<.55?205+r()*50:90+r()*40,f=1.5+r()*3;t.strokeStyle=`rgba(${h},${h},${h},0.7)`,t.lineWidth=f,t.lineCap="round";for(let c of[-256,0,256])for(let p of[-256,0,256])t.beginPath(),t.moveTo(o+c,l+p),t.quadraticCurveTo(o+c+u/2,l+p-5-r()*4,o+c+u,l+p),t.stroke()}let s=new wn(e);return s.wrapS=s.wrapT=Vn,s.anisotropy=4,s})();function eu(i,e,t){let n=new fi({color:i,vertexColors:!0,transparent:!0,opacity:e,map:ix});return n.onBeforeCompile=r=>{r.uniforms.zeit=Qh,r.vertexShader=`uniform float zeit;
varying vec2 vW;
`+r.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
      vW = position.xz; transformed.y += (sin(position.x * 0.9 + zeit * 1.4) + cos(position.z * 1.2 + zeit * 1.1)) * 0.03 * ${t.toFixed(2)};`),r.fragmentShader=`uniform float zeit;
varying vec2 vW;
`+r.fragmentShader.replace("#include <map_fragment>",`
      float zt = zeit * ${t.toFixed(2)};
      float w1 = texture2D(map, vW / 5.0 + vec2(zt * 0.035, zt * 0.012)).r, w2 = texture2D(map, vW / 8.0 + vec2(-zt * 0.02, zt * 0.03)).r, w = (w1 + w2) * 0.5;
      diffuseColor.rgb *= 0.62 + 0.75 * w;`).replace("#include <opaque_fragment>",`outgoingLight += vec3(smoothstep(0.74, 0.86, w) * 0.22);
      #include <opaque_fragment>`)},n}var rx=eu(2909824,.9,1),sx=eu(2503724,.94,.35);Kn.i=Kn.i||"#c7e5f6";Kn.I=Kn.I||"#8cbbe0";Kn.wolke="#e4ecf3";for(let i of bh.arten)i.farbe&&!Kn[i.zeichen]&&(Kn[i.zeichen]=i.farbe);var Jh=new Map(Object.entries(Kn).map(([i,e])=>[i,new Ce(e)])),jh=i=>Jh.get(i)||Jh.get("."),An={gieren:0,neigen:.95,abstand:24},ea=class{constructor(e=null,t=hn("#ez-feld")){this.an=e;this.behaelter=t;this.hd={};this.hinweise=[];this.nord=null;this.nordR=0;this.zurueck=null;this.stickStart=null;this.szene=new Ps;this.kamera=new Tt(42,1,.5,600);this.licht=new Hs(16768174,2.9);this.himmelLicht=new Bs(13032703,5917232,1.1);this.fackel=new Lr(16756832,0,16,1.4);this.st=new Map;this.laedt=new Set;this.warte=[];this.vorhanden=new Set;this.naechsterBlick=0;this.held={x:0,z:0,blick:1,lauf:0};this.pfad=[];this.tasten={};this.gieren=An.gieren;this.neigen=An.neigen;this.abstand=An.abstand;this.ziel=new P;this.uhr=new Vs;this.fps=[];this.gebiet="";this.ebene="";this.feuerLichter=[];this.bilder=new ks;this.bildMat=new Map;this.bildTex=new Map;this.art="oberwelt"}async start(){this.r=new Cs({antialias:!Fr,powerPreference:"high-performance"}),this.r.setPixelRatio(Math.min(devicePixelRatio,Fr?1.5:2)),this.r.shadowMap.enabled=!Fr&&Qs.get("schatten")!=="0",this.r.shadowMap.type=Qo,this.r.toneMapping=tl,this.r.toneMappingExposure=1.12,this.an&&(this.r.domElement.style.cssText="position:fixed;inset:0;z-index:0;touch-action:none"),this.behaelter.prepend(this.r.domElement),this.groesse(),addEventListener("resize",()=>this.groesse()),this.szene.fog=new Is(12177376,60,150),this.szene.add(this.himmelLicht,this.licht,this.licht.target,this.fackel);for(let r=0;r<(Fr?3:6);r++){let s=new Lr(16751168,0,13,1.6);this.feuerLichter.push(s),this.szene.add(s)}let e=this.licht.shadow;e.mapSize.set(2048,2048),e.camera.left=e.camera.bottom=-38,e.camera.right=e.camera.top=38,e.camera.near=1,e.camera.far=160,e.bias=-6e-4,e.normalBias=.04,this.licht.castShadow=!0,Kh.map=nx(),hn("#ez-lade").textContent="Lade Weltdaten \u2026",this.ix=await(await fetch("welt3d/index.json?t="+Date.now())).json(),this.vorhanden=new Set(this.ix.chunks);try{Bh(await(await fetch("welt3d/modelle.json?v="+this.ix.stand)).json())}catch{}let[t,n]=this.ix.start;try{let r=JSON.parse(localStorage.getItem("ez_welt_pos")||"null");Array.isArray(r)&&this.vorhanden.has(Math.floor(r[0]/Qe)+"_"+Math.floor(r[1]/Qe))&&([t,n]=r)}catch{}if(Qs.has("x")&&(t=Number(Qs.get("x")),n=Number(Qs.get("y"))),this.an){let r=this.an.ort();t=r.x,n=r.y,this.hd=this.an.held()}for(this.held.x=t,this.held.z=n,this.heldBauen(),hn("#ez-lade").textContent="Baue die Welt \u2026",this.nachladen(),await this.alleGeladen();this.warte.length;)this.bauen(this.warte.shift());this.eingaben(),this.an&&this.spielteile(),hn("#ez-lade").remove(),this.r.setAnimationLoop(()=>this.bild()),Object.assign(window,{W3D:this})}groesse(){let e=innerWidth,t=innerHeight;this.r.setSize(e,t),this.kamera.aspect=e/t,this.kamera.updateProjectionMatrix()}async alleGeladen(){for(let e=0;e<300&&this.laedt.size;e++)await new Promise(t=>setTimeout(t,30))}nachladen(){let e=Math.floor(this.held.x/Qe),t=Math.floor(this.held.z/Qe);for(let n=-or;n<=or;n++)for(let r=-or;r<=or;r++){let s=e+r+"_"+(t+n);this.vorhanden.has(s)&&!this.st.has(s)&&!this.laedt.has(s)&&(this.laedt.add(s),this.holen(s))}for(let[n,r]of this.st)Math.max(Math.abs(r.d.cx-e),Math.abs(r.d.cy-t))>or+1&&this.freigeben(n)}async holen(e){try{let t=await(await fetch("welt3d/"+e+".json?v="+this.ix.stand)).json();this.st.set(e,{d:t,obj:[],bauten:[],boden:null,gebaut:!1,feuer:[],stege:[],leute:[],modelle:[]}),this.warte.push(e)}catch{}finally{this.laedt.delete(e)}}freigeben(e){let t=this.st.get(e);if(!t)return;this.st.delete(e),this.hinweise=this.hinweise.filter(r=>!t.obj.includes(r.g));let n=this.warte.indexOf(e);n>=0&&this.warte.splice(n,1);for(let r of t.obj)this.szene.remove(r),r.traverse(s=>{let a=s,o=s;a.isInstancedMesh?a.dispose():o.isMesh&&o.geometry&&!o.geometry.userData.geteilt&&o.geometry.dispose()})}bauen(e){let t=this.st.get(e);!t||t.gebaut||(t.gebaut=!0,this.gelaende(t),this.dinge(t),this.figuren(t),this.hinweiseBauen(t))}hinweiseBauen(e){for(let t of e.d.interaktionen){let n=new At,r=this.stehHoehe(t.x,t.y),s=new it(nu,new en({color:15978602,transparent:!0,opacity:.7,depthWrite:!1,toneMapped:!1}));s.rotation.x=-Math.PI/2,s.position.y=.07,s.userData.deck=.7;let a=new qn(new Xn({map:Ul.map,color:16767370,blending:Xi,transparent:!0,depthWrite:!1,toneMapped:!1}));a.position.y=.9,a.scale.set(2.2,2.6,1),a.userData.deck=.55;let o=new it(iu,new en({color:16766814,transparent:!0,opacity:.95,toneMapped:!1}));o.position.y=2.9,o.userData.deck=.95,n.add(s,a,o),n.position.set(t.x,r,t.y),n.userData.y=2.9,n.visible=!1,this.szene.add(n),e.obj.push(n),this.hinweise.push({x:t.x,y:t.y,r:t.radius||1.5,g:n})}}eck(e,t){let n=Math.floor(e/Qe),r=Math.floor(t/Qe);for(let[s,a]of[[0,0],[-1,0],[0,-1],[-1,-1]]){let o=this.st.get(n+s+"_"+(r+a));if(!o)continue;let l=e-(n+s)*Qe,u=t-(r+a)*Qe;if(!(l>Qe+1||u>Qe+1))return o.d.hoehe[(u+1)*(Qe+3)+l+1]/100}return 0}hoehe(e,t){let n=Math.floor(e),r=Math.floor(t),s=e-n,a=t-r,o=this.eck(n,r),l=this.eck(n+1,r),u=this.eck(n,r+1),h=this.eck(n+1,r+1);return s+a<1?o+(l-o)*s+(u-o)*a:h+(u-h)*(1-s)+(l-h)*(1-a)}gehbar(e,t){let n=this.st.get(Math.floor(e/Qe)+"_"+Math.floor(t/Qe));return n?n.d.geh[t-n.d.cy*Qe]?.[e-n.d.cx*Qe]===".":!1}stehHoehe(e,t){let n=this.hoehe(e,t),r=this.chunkBei(e,t);if(r)for(let[s,a,o,l,u]of r.stege)e>s&&e<o&&t>a&&t<l&&(n=Math.max(n,u));return n}chunkBei(e,t){return this.st.get(Math.floor(e/Qe)+"_"+Math.floor(t/Qe))}gelaende(e){let t=e.d,n=Qe+3,r=t.cx*Qe,s=t.cy*Qe,a=t.ebene!=="oberwelt"&&t.art!=="draussen",o=t.art==="draussen",l=(w,A)=>t.boden[A+1]?.[w+1]??" ",u=(w,A)=>t.hoehe[(A+1)*n+w+1]/100,h=w=>$h.has(w)?".":o&&(w==="X"||w===" ")?"wolke":w,f=[];for(let w=0;w<=Qe;w++)for(let A=0;A<=Qe;A++){let x=0,_=0,C=0;for(let[k,W]of[[-1,-1],[0,-1],[-1,0],[0,0]]){let O=jh(h(l(A+k,w+W)));x+=O.r,_+=O.g,C+=O.b}let L=1+(Ve((A+r)*.7,(w+s)*1.3)-.5)*.14+(Ve(Math.floor((A+r)/3),Math.floor((w+s)/3))-.5)*.1+(Ve(Math.floor((A+r)/9),Math.floor((w+s)/9))-.5)*.12,U=a?Math.max(.45,1-u(A,w)*.12):1;f[w*(Qe+1)+A]=[x/4*L*U,_/4*L*U,C/4*L*U]}let c=(w,A)=>{let x=-9;for(let _=-1;_<=1;_++)for(let C=-1;C<=1;C++)x=Math.max(x,u(Math.max(-1,Math.min(Qe+1,w+C)),Math.max(-1,Math.min(Qe+1,A+_))));return x+.06},p=[],g=[],y=[],m=[],d=[],v=[],S=[],b=[];for(let w=0;w<Qe;w++)for(let A=0;A<Qe;A++){let x=l(A,w),_=$h.has(x),C=jh(x),L=1+(Ve((A+r)*1.7,(w+s)*.9)-.5)*.12,k=[[A,w],[A+1,w],[A+1,w+1],[A,w+1]].map(([O,$])=>({lx:O,ly:$,p:[O+r,u(O,$),$+s],c:_?[C.r*L,C.g*L,C.b*L]:f[$*(Qe+1)+O]})),W=(A+w)%2?[[0,3,1],[1,3,2]]:[[0,3,2],[0,2,1]];for(let O of W)for(let $ of O){let B=k[$];p.push(...B.p),g.push(...B.c),y.push(B.p[0]/7,B.p[2]/7);let ee=new P(u(B.lx-1,B.ly)-u(B.lx+1,B.ly),2,u(B.lx,B.ly-1)-u(B.lx,B.ly+1)).normalize();m.push(ee.x,ee.y,ee.z)}if(this.ix.arten[x]?.wasser){let O=A+r,$=w+s,B=x==="o",ee=(X,se)=>!!this.ix.arten[l(X,se)]?.wasser,ae=(X,se)=>ee(X-1,se-1)&&ee(X,se-1)&&ee(X-1,se)&&ee(X,se)?B?.9:.86:B?1.15:1.32;for(let[X,se]of[[0,0],[0,1],[1,1],[0,0],[1,1],[1,0]]){(B?v:d).push(O+X,c(A+X,w+se),$+se);let Ie=ae(A+X,w+se);(B?b:S).push(Ie,Ie,Ie)}}}let I=new pt;I.setAttribute("position",new He(p,3)),I.setAttribute("color",new He(g,3)),I.setAttribute("uv",new He(y,2)),I.setAttribute("normal",new He(m,3)),I.computeBoundingSphere();let T=new it(I,Kh);T.receiveShadow=!0,this.szene.add(T),e.obj.push(T),e.boden=T;for(let[w,A,x]of[[d,S,rx],[v,b,sx]])if(w.length){let _=new pt;_.setAttribute("position",new He(w,3)),_.setAttribute("color",new He(A,3)),_.setAttribute("uv",new He(new Array(w.length/3*2).fill(0),2)),_.computeVertexNormals();let C=new it(_,x);C.receiveShadow=!0,this.szene.add(C),e.obj.push(C)}}dinge(e){let t=this.ix.typen,n=new Map,r=e.d.dinge.filter(([s])=>Cl(t[s]));for(let[s,a,o,l,,,u]of e.d.dinge){let h=t[s],f=this.hoehe(a,o),c=u||0;if(h.plan&&this.ix.bauplaene[h.id]){let d=zh(this.ix.bauplaene[h.id],a,this.hoehe(a,o-.5),o);Nh(d,a,o,c),d.gruppe.traverse(v=>{v.isMesh&&!v.material.isMeshBasicMaterial&&(v.castShadow=!0,v.receiveShadow=!0)}),this.szene.add(d.gruppe),e.obj.push(d.gruppe),e.bauten.push(d);for(let v of d.feuer){e.feuer.push(v);let S=new qn(Ul);S.position.copy(v),S.scale.setScalar(2.6),this.szene.add(S),e.obj.push(S)}continue}if(Rl(h)){let d=0;if($s(h))d=Ve(a,o)*Math.PI*2;else if(Cl(h)){let I=99,T=99;for(let[,w,A]of r){let x=Math.abs(w-a),_=Math.abs(A-o);x+_<.1||(_<.3&&x<2.6&&(I=Math.min(I,x)),x<.3&&_<2.6&&(T=Math.min(T,_)))}T<I&&(d=Math.PI/2)}d-=c*Math.PI/180,n.has(s)||n.set(s,{m:[],f:[]});let v=l*($s(h)?.9+Ve(o,a)*.2:1),S=new Gt().setFromAxisAngle(new P(0,1,0),d);n.get(s).m.push(new De().compose(new P(a,f-($s(h)?.1:0),o),S,new P(v,v,v)));let b=.88+Ve(a*3,o*5)*.24;n.get(s).f.push(new Ce(b,b,b));continue}if(/nebel/.test(h.id))continue;let g=Hh[h.id];if(g&&e.stege.push([a+g[0],o+g[1],a+g[2],o+g[3],f+g[4]]),/moorlicht/.test(h.id)){let d=new qn(ax);d.position.set(a+.08,f+1.75,o),d.scale.setScalar(1.6),this.szene.add(d),e.obj.push(d)}if(/feuerkorb|festfeuer|fackel|laterne/.test(h.id)){let d=/festfeuer/.test(h.id)?.9:/laterne/.test(h.id)?1.5:1.7,v=new P(a,f+d,o);e.feuer.push(v);let S=new qn(Ul);S.position.copy(v),S.scale.setScalar(/festfeuer/.test(h.id)?4:2.4),this.szene.add(S),e.obj.push(S)}this.bildMat.has(h.id)||this.bildMat.set(h.id,new Xn({map:this.textur(h.bild),alphaTest:.2,toneMapped:!1}));let y=new qn(this.bildMat.get(h.id)),m=h.massstab*l/48;y.center.set(h.anker[0],1-h.anker[1]),y.scale.set(h.groesse[0]*m,h.groesse[1]*m,1),y.position.set(a,f,o),this.szene.add(y),e.obj.push(y)}for(let[s,a]of n){let o=new Ds(Rl(t[s]),gl,a.m.length);a.m.forEach((l,u)=>{o.setMatrixAt(u,l),o.setColorAt(u,a.f[u])}),o.castShadow=!0,o.receiveShadow=!0,o.computeBoundingSphere(),this.szene.add(o),e.obj.push(o)}}textur(e,t){let n=this.bildTex.get(e);if(!n)n=this.bilder.load(tx+e,t?r=>setTimeout(()=>t(r),0):void 0),n.colorSpace=_t,this.bildTex.set(e,n);else if(t){let r=n;r.image&&r.image.complete!==!1?t(r):setTimeout(()=>this.textur(e,t),200)}return n}figuren(e){for(let[t,n]of e.d.figuren.entries()){if(n.modell&&Dl[n.modell]){let a=Dl[n.modell]();a.gruppe.position.set(n.x,this.hoehe(n.x,n.y),n.y),a.gruppe.rotation.y=n.blick??0,this.szene.add(a.gruppe),e.obj.push(a.gruppe,this.fleck(n.x,n.y)),e.modelle.push({tick:a.tick,takt:t*2.3});continue}let r="img/echtzeit/"+n.figur+".webp",s=new zr(this.textur(r));this.textur(r,a=>{let o=Math.max(1,Math.round(a.image.width/a.image.height));s.setze(a,[1/o,1],[0,0],[2.25,2.25],[.5,.06]),s.bild(0,o,!!n.links),e.leute.push({fb:s,n:o,links:!!n.links,takt:t*.7})}),s.silhouette(!1),s.gruppe.position.set(n.x,this.hoehe(n.x,n.y)+.08,n.y),this.szene.add(s.gruppe),e.obj.push(s.gruppe,this.fleck(n.x,n.y))}}fleck(e,t){let n=new it(tu,ox);return n.rotation.x=-Math.PI/2,n.position.set(e,this.hoehe(e,t)+.05,t),this.szene.add(n),n}heldBauen(){this.stand=this.textur(this.hd.figur||"img/echtzeit/torvald.webp"),this.lauf=this.textur(this.hd.lauf||(this.hd.figur?this.hd.figur:"img/echtzeit/torvald-lauf.webp")),this.hd.figur||(this.hd={figur:"img/echtzeit/torvald.webp",lauf:"img/echtzeit/torvald-lauf.webp",laufMass:[.5,.946,.855],gross:1.065,fuss:[.5,.94]}),this.figur=new zr(this.stand),this.szene.add(this.figur.gruppe),this.schattenFleck=this.fleck(this.held.x,this.held.z),this.marke=new it(new Cr(.28,.42,20),new en({color:16766814,transparent:!0,opacity:.85,depthWrite:!1})),this.marke.rotation.x=-Math.PI/2,this.marke.visible=!1,this.szene.add(this.marke)}springen(e,t){this.held.x=e,this.held.z=t,this.pfad=[],this.marke.visible=!1,this.ziel.set(0,0,0),this.nachladen()}frei(e,t){for(let[r,s]of[[-.28,-.28],[.28,-.28],[-.28,.28],[.28,.28]])if(!this.gehbar(Math.floor(e+r),Math.floor(t+s)))return!1;return!0}weg(e,t,n,r){let s=(x,_)=>this.gehbar(x,_),o=Math.floor(n),l=Math.floor(r);if(!s(o,l)){let x=1e9,_=0,C=0;for(let L=-3;L<=3;L++)for(let U=-3;U<=3;U++)s(o+U,l+L)&&U*U+L*L<x&&(x=U*U+L*L,_=o+U,C=l+L);if(x===1e9)return[];o=_,l=C,n=_+.5,r=C+.5}let u=Math.floor(e),h=Math.floor(t),f=(x,_)=>_*65536+x,c=new Map,p=new Map,g=[],y=(x,_)=>{g.push([_,x]);let C=g.length-1;for(;C>0;){let L=C-1>>1;if(g[L][0]<=g[C][0])break;[g[L],g[C]]=[g[C],g[L]],C=L}},m=()=>{let x=g[0],_=g.pop();if(g.length){g[0]=_;let C=0;for(;;){let L=2*C+1,U=L+1,k=C;if(L<g.length&&g[L][0]<g[k][0]&&(k=L),U<g.length&&g[U][0]<g[k][0]&&(k=U),k===C)break;[g[k],g[C]]=[g[C],g[k]],C=k}}return x},d=(x,_)=>{let C=Math.abs(x-o),L=Math.abs(_-l);return Math.max(C,L)+.414*Math.min(C,L)};c.set(f(u,h),0),y(f(u,h),d(u,h));let v=0,S=!1;for(;g.length&&v++<4e4;){let[,x]=m(),_=x%65536,C=(x-_)/65536;if(_===o&&C===l){S=!0;break}for(let[L,U]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){let k=_+L,W=C+U;if(!s(k,W)||L&&U&&(!s(_+L,C)||!s(_,C+U)))continue;let O=f(k,W),$=c.get(x)+(L&&U?1.414:1);$<(c.get(O)??1/0)&&(c.set(O,$),p.set(O,x),y(O,$+d(k,W)))}}if(!S)return[];let b=[],I=f(o,l);for(;I!==f(u,h);){let x=I%65536;b.unshift({x:x+.5,z:(I-x)/65536+.5}),I=p.get(I)}b.length&&(b[b.length-1]={x:n,z:r});let T=[],w={x:e,z:t},A=0;for(;A<b.length;){let x=b.length-1;for(;x>A&&!this.sicht(w,b[x]);)x--;T.push(b[x]),w=b[x],A=x+1}return T}sicht(e,t){let n=Math.ceil(Math.hypot(t.x-e.x,t.z-e.z)*3);for(let r=1;r<=n;r++){let s=r/n;if(!this.frei(e.x+(t.x-e.x)*s,e.z+(t.z-e.z)*s))return!1}return!0}eingaben(){let e=this.r.domElement,t=!1,n=0,r=0,s=0,a=new Map,o=0,l={x:0,y:0};addEventListener("keydown",h=>{this.tasten[h.key.toLowerCase()]=!0,h.key.startsWith("Arrow")&&h.preventDefault()}),addEventListener("keyup",h=>{this.tasten[h.key.toLowerCase()]=!1}),e.addEventListener("contextmenu",h=>h.preventDefault()),e.addEventListener("pointerdown",h=>{if(a.set(h.pointerId,{x:h.clientX,y:h.clientY}),t=!0,n=0,r=h.clientX,s=h.clientY,e.setPointerCapture(h.pointerId),a.size===2){let[f,c]=[...a.values()];o=Math.hypot(f.x-c.x,f.y-c.y),l.x=(f.x+c.x)/2,l.y=(f.y+c.y)/2}else this.an&&h.pointerType==="touch"&&(this.stickStart={x:h.clientX,y:h.clientY})}),e.addEventListener("pointermove",h=>{if(!a.has(h.pointerId))return;if(a.set(h.pointerId,{x:h.clientX,y:h.clientY}),a.size===2){let[g,y]=[...a.values()],m=Math.hypot(g.x-y.x,g.y-y.y),d=(g.x+y.x)/2,v=(g.y+y.y)/2;o&&(this.abstand=Math.max(9,Math.min(60,this.abstand*o/m)),this.gieren-=(d-l.x)*.008,this.neigen=Math.max(.42,Math.min(1.35,this.neigen+(v-l.y)*.004))),o=m,l.x=d,l.y=v,n=99,this.an&&this.stick(null);return}if(!t)return;let f=h.clientX-r,c=h.clientY-s;if(r=h.clientX,s=h.clientY,n+=Math.abs(f)+Math.abs(c),this.an&&h.pointerType==="touch"){n>12&&this.stick({x:h.clientX,y:h.clientY});return}(h.buttons&2||h.buttons&4||h.pointerType==="touch"&&n>12)&&(this.gieren-=f*.006,this.neigen=Math.max(.42,Math.min(1.35,this.neigen+c*.004)))});let u=h=>{a.delete(h.pointerId),a.size<2&&(o=0),this.an&&this.stick(null),t&&(t=!1,n<8&&h.button===0&&this.klick(h.clientX,h.clientY))};e.addEventListener("pointerup",u),e.addEventListener("pointercancel",h=>{a.delete(h.pointerId),t=!1,this.an&&this.stick(null)}),e.addEventListener("wheel",h=>{h.preventDefault(),this.abstand=Math.max(9,Math.min(60,this.abstand*(1+Math.sign(h.deltaY)*.1)))},{passive:!1}),hn("#ez-schatten").onclick=()=>{this.r.shadowMap.enabled=!this.r.shadowMap.enabled,this.szene.traverse(h=>{let f=h.material;for(let c of Array.isArray(f)?f:f?[f]:[])c.needsUpdate=!0}),hn("#ez-schatten").textContent=this.r.shadowMap.enabled?"Schatten: an":"Schatten: aus"},hn("#ez-schatten").textContent=this.r.shadowMap.enabled?"Schatten: an":"Schatten: aus"}klick(e,t){let n=new Gs;n.setFromCamera(new Ee(e/innerWidth*2-1,-(t/innerHeight)*2+1),this.kamera);let r=n.intersectObjects([...this.st.values()].map(s=>s.boden).filter(s=>!!s),!1)[0];if(r){if(this.an){this.an.gehe(r.point.x,r.point.z),this.marke.position.set(r.point.x,this.hoehe(r.point.x,r.point.z)+.06,r.point.z),this.marke.visible=!0;return}if(this.pfad=this.weg(this.held.x,this.held.z,r.point.x,r.point.z),this.pfad.length){let s=this.pfad[this.pfad.length-1];this.marke.position.set(s.x,this.hoehe(s.x,s.z)+.06,s.z),this.marke.visible=!0}}}stick(e){let t=document.querySelector("#ez-stick"),n=this.stickStart;if(!e||!n||!this.an){t&&(t.hidden=!0),this.an&&this.an.steuern(0,0),e||(this.stickStart=null);return}let r=e.x-n.x,s=e.y-n.y,a=Math.hypot(r,s),o=46;if(t){t.hidden=!1,t.style.left=n.x+"px",t.style.top=n.y+"px";let c=t.querySelector("i");c&&(c.style.transform=`translate(calc(-50% + ${r/Math.max(a,1)*Math.min(a,o)}px), calc(-50% + ${s/Math.max(a,1)*Math.min(a,o)}px))`)}if(a<8){this.an.steuern(0,0);return}let l=Math.min(1,a/o),u=r/a,h=s/a,f=this.gieren;this.an.steuern((Math.cos(f)*u+Math.sin(f)*h)*l,(-Math.sin(f)*u+Math.cos(f)*h)*l)}drehen(e,t){let n=this.gieren;return[Math.cos(n)*e+Math.sin(n)*t,-Math.sin(n)*e+Math.cos(n)*t]}spielteile(){this.nord=document.querySelector("#ez-kartenrahmen .nord");let e=document.querySelector("#ez-kartenrahmen");if(e){let t=document.createElement("button");t.type="button",t.id="ez-kamera-zurueck",t.title="Kamera zur\xFCck",t.setAttribute("aria-label","Kamera zur\xFCck"),t.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',t.style.cssText="position:absolute;left:-4px;bottom:-4px;z-index:3;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;cursor:pointer;color:#f3d895;background:linear-gradient(#3a2817,#24180e);border:2px solid #d6b066;box-shadow:0 3px 10px rgba(0,0,0,.55);transition:opacity .25s",t.onclick=n=>{n.stopPropagation(),this.gieren=An.gieren,this.neigen=An.neigen,this.abstand=An.abstand},getComputedStyle(e).position==="static"&&(e.style.position="relative"),e.appendChild(t),this.zurueck=t}}kompass(){let e=this.gieren,t=this.nord,n=this.nord?.parentElement;if(this.an){let r=this.an.held();r.figur&&r.figur!==this.hd.figur&&(this.hd=r,this.stand=this.textur(r.figur),this.lauf=this.textur(r.lauf||r.figur))}if(t&&n){if(!this.nordR){t.style.transform="";let r=n.getBoundingClientRect(),s=t.getBoundingClientRect();this.nordR=Math.hypot(s.left+s.width/2-(r.left+r.width/2),s.top+s.height/2-(r.top+r.height/2))||1}t.style.transform=`translate(${(this.nordR*Math.sin(e)).toFixed(1)}px, ${(this.nordR*(1-Math.cos(e))).toFixed(1)}px)`}if(this.zurueck){let r=Math.abs(((this.gieren-An.gieren+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI)>.05||Math.abs(this.neigen-An.neigen)>.05||Math.abs(this.abstand-An.abstand)>1;this.zurueck.style.opacity=r?"1":"0",this.zurueck.style.pointerEvents=r?"auto":"none"}}stimmung(e,t){if(e===this.ebene)return;this.ebene=e,this.art=t;let n=t!=="oberwelt"&&t!=="draussen",r=this.szene.fog,s=new Ce(t==="innen"?"#0c0907":n?"#0e0c0a":t==="draussen"?"#cfdeea":"#b9cfe0");this.szene.background=s,r.color.copy(s),this.himmelLicht.intensity=n?.62:1.1,this.himmelLicht.color.set(n?11573890:13032703),this.licht.intensity=n?.35:2.9,this.fackel.intensity=n?30:0,this.fackel.distance=20,t==="innen"&&(this.himmelLicht.intensity=1,this.himmelLicht.color.set(16769728),this.licht.intensity=1.1,this.fackel.intensity=10)}bild(){let e=Math.min(.05,this.uhr.getDelta()),t=this.tasten,n=this.held;Qh.value+=e,this.warte.length&&this.bauen(this.warte.shift()),performance.now()>this.naechsterBlick&&(this.naechsterBlick=performance.now()+300,this.nachladen()),(t.arrowleft||t.q)&&(this.gieren+=e*1.8),(t.arrowright||t.e)&&(this.gieren-=e*1.8),t.arrowup&&(this.neigen=Math.min(1.35,this.neigen+e*.9)),t.arrowdown&&(this.neigen=Math.max(.42,this.neigen-e*.9));let r=0,s=0,a=!1,o=-Math.sin(this.gieren),l=-Math.cos(this.gieren);if(this.an){let T=this.an.ort(),w=T.x-n.x,A=T.y-n.z;if(Math.hypot(w,A)>4?(n.x=T.x,n.z=T.y,this.ziel.set(0,0,0),this.nachladen()):(n.x=T.x,n.z=T.y),a=this.an.laeuft(),a){let x=w*Math.cos(this.gieren)-A*Math.sin(this.gieren);Math.abs(x)>.004&&(n.blick=x>0?1:-1),n.lauf+=e}else this.marke.visible=!1}else{if(this.an||(t.w&&(r+=o,s+=l),t.s&&(r-=o,s-=l),t.a&&(r+=l,s-=o),t.d&&(r-=l,s+=o)),r||s)this.pfad=[],this.marke.visible=!1;else if(this.pfad.length){let w=this.pfad[0],A=w.x-n.x,x=w.z-n.z,_=Math.hypot(A,x);_<.15?(this.pfad.shift(),this.pfad.length||(this.marke.visible=!1)):(r=A/_,s=x/_)}let T=Math.hypot(r,s);if(a=T>.01,a){let w=4.6*e/T,A=n.x+r*w,x=n.z+s*w;this.frei(A,x)?(n.x=A,n.z=x):this.frei(A,n.z)?n.x=A:this.frei(n.x,x)?n.z=x:this.pfad.length&&this.pfad.shift();let _=r*Math.cos(this.gieren)-s*Math.sin(this.gieren);Math.abs(_)>.2&&(n.blick=_>0?1:-1),n.lauf+=e}}let u=this.stehHoehe(n.x,n.z),h=this.figur,f=this.hd.laufMass||[.5,.946,.91],c=this.hd.fuss||[.5,.94],p=this.hd.gross||1;if(a&&this.hd.lauf){let T=Math.floor(n.lauf*11)%8,w=2.05/f[2];h.setze(this.lauf,[n.blick/4,1/2],[(T%4+(n.blick<0?1:0))/4,T<4?.5:0],[w,w],[f[0],1-f[1]])}else{let T=this.stand,w=T.image?T.image.width/T.image.height:.7;h.setze(T,[n.blick,1],[n.blick<0?1:0,0],[2.05*p*w,2.05*p],[c[0],1-c[1]]),a||(n.lauf=0)}h.gruppe.position.set(n.x,u+.08,n.z),this.schattenFleck.position.set(n.x,u+.05,n.z),this.ziel.lerp(new P(n.x,u+1.1,n.z),this.ziel.lengthSq()?.18:1);let g=Math.cos(this.neigen),y=Math.sin(this.neigen);this.kamera.position.set(this.ziel.x+Math.sin(this.gieren)*g*this.abstand,this.ziel.y+y*this.abstand,this.ziel.z+Math.cos(this.gieren)*g*this.abstand),this.kamera.lookAt(this.ziel);let m=this.chunkBei(n.x,n.z);m&&this.stimmung(m.d.ebene,m.d.art||(m.d.ebene==="oberwelt"?"oberwelt":"untergrund"));let d=this.art==="untergrund",v=this.art==="innen",S=this.szene.fog,b=Math.min((or+.4)*Qe,d?34+this.abstand:v?40+this.abstand:60+this.abstand*1.8);S.far=b,S.near=d?6+this.abstand*.4:v?16+this.abstand*.6:b*.45,this.licht.position.set(this.ziel.x-30,this.ziel.y+55,this.ziel.z+22),this.licht.target.position.copy(this.ziel),this.fackel.position.set(n.x+.4,u+2.6,n.z+.6);for(let T of this.st.values())for(let w of T.bauten){let A=w.raeume.some(x=>n.x>x.x0&&n.x<x.x1&&n.z>x.z0&&n.z<x.z1);for(let x of w.daecher)x.visible=!A;for(let x of w.tueren){let _=Math.hypot(n.x-x.x,n.z-x.z)<2.2?x.auf:x.zu;x.fluegel.rotation.y+=(_-x.fluegel.rotation.y)*.18}for(let x of w.drehen)x.rotation.z-=e*.6;for(let[x,_]of w.flackern.entries()){let C=performance.now()/1e3+x*1.7;_.scale.set(1+.08*Math.sin(C*7),.8+.28*Math.abs(Math.sin(C*9.3)*Math.sin(C*4.1+1)),1+.08*Math.cos(C*6))}}{let T=performance.now()/1e3;for(let w of this.st.values())for(let A of w.leute){if(A.n<2)continue;let x=Math.floor((T+A.takt)*2.5)%(2*A.n-2);A.fb.bild(x<A.n?x:2*A.n-2-x,A.n,A.links)}for(let w of this.st.values())for(let A of w.modelle)A.tick(T+A.takt)}this.marke.rotation.z+=e;{let T=[];for(let A of this.st.values())for(let x of A.feuer)T.push(x);T.sort((A,x)=>(A.x-n.x)**2+(A.z-n.z)**2-((x.x-n.x)**2+(x.z-n.z)**2));let w=performance.now()/1e3;this.feuerLichter.forEach((A,x)=>{let _=T[x];if(!_||!d&&(_.x-n.x)**2+(_.z-n.z)**2>144){A.intensity=0;return}A.position.copy(_),A.intensity=(d?22:10)*(.85+.15*Math.sin(w*9+x*2.1)*Math.sin(w*5.3+x))})}{let T=performance.now()/1e3;for(let w of this.hinweise){let A=Math.hypot(w.x-n.x,w.y-n.z),x=A<w.r+2.6;if(w.g.visible=x,x){let _=A<w.r?1:1-(A-w.r)/2.6;w.g.scale.setScalar(.9+.08*Math.sin(T*3));for(let C of w.g.children){let L=C.material;L.opacity=C.userData.deck*_}w.g.children[2].position.y=w.g.userData.y+.15*Math.sin(T*2.4)}}}this.an&&this.kompass(),this.r.render(this.szene,this.kamera);let I=this.ix.gebiete.find(T=>n.x>=T.x&&n.x<T.x+T.b&&n.z>=T.y&&n.z<T.y+T.h);if(I&&I.id!==this.gebiet&&(this.gebiet=I.id,hn("#ez-ort b").textContent=I.name,hn("#ez-ort small").textContent=I.untertitel),this.fps.push(performance.now()),this.fps.length>=30){let T=(this.fps.length-1)*1e3/(this.fps[this.fps.length-1]-this.fps[0]);hn("#ez-fps").textContent=Math.round(T)+" FPS \xB7 "+this.r.info.render.calls+" Aufrufe \xB7 "+this.st.size+" Chunks",this.fps=[]}}},tu=new Us(.42,16);tu.userData.geteilt=!0;var ax=(()=>{let i=document.createElement("canvas");i.width=i.height=64;let e=i.getContext("2d"),t=e.createRadialGradient(32,32,0,32,32,32);t.addColorStop(0,"rgba(200,255,220,0.95)"),t.addColorStop(.4,"rgba(120,230,170,0.35)"),t.addColorStop(1,"rgba(80,200,140,0)"),e.fillStyle=t,e.fillRect(0,0,64,64);let n=new wn(i);return n.colorSpace=_t,new Xn({map:n,blending:Xi,depthWrite:!1,transparent:!0,toneMapped:!1})})(),Ul=(()=>{let i=document.createElement("canvas");i.width=i.height=64;let e=i.getContext("2d"),t=e.createRadialGradient(32,32,0,32,32,32);t.addColorStop(0,"rgba(255,210,140,0.9)"),t.addColorStop(.35,"rgba(255,150,60,0.35)"),t.addColorStop(1,"rgba(255,120,40,0)"),e.fillStyle=t,e.fillRect(0,0,64,64);let n=new wn(i);return n.colorSpace=_t,new Xn({map:n,blending:Xi,depthWrite:!1,transparent:!0,toneMapped:!1})})(),ox=new en({color:0,transparent:!0,opacity:.32,depthWrite:!1}),nu=new Cr(.55,.78,32),iu=new zs(.22,0);nu.userData.geteilt=!0;iu.userData.geteilt=!0;var lx=new ea;lx.start().catch(i=>{let e=document.querySelector("#ez-lade");e&&(e.textContent="Fehler: "+(i&&i.message?i.message:i)),console.error(i)});})();
