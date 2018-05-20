import Chimee from 'chimee';
import { Scene, PerspectiveCamera, WebGLRenderer, Mesh, MeshBasicMaterial, SphereBufferGeometry, VideoTexture, LinearFilter, RGBFormat, Vector3, Math as ThreeMath } from 'three';

export default class ChimeePluginPanorama extends Chimee.plugin {
  constructor(config, ...args) {
    const myConfig = {
      el: document.createElement('canvas'),
      penetrate: true,
      inner: true,
      useCrossOrigin: true,
      hideVideo: true,
    };
    Object.assign(myConfig, config);
    console.log(myConfig);
    super(myConfig, ...args);
    this.customConfig = myConfig;
    this.lat = 0;
    this.lon = 0;
    this.theta = 0;
    this.distance = 50;
    this.phi = 0;
    this.onMouseDownMouseX = 0;
    this.onMouseDownMouseY = 0;
    this.onMouseDownLon = 0;
    this.onMouseDownLat = 0;
    this.onPointerDownPointerX = 0;
    this.onPointerDownPointerY = 0;
    this.onPointerDownLon = 0;
    this.onPointerDownLat = 0;
    this.isUserInteracting = false;
  }

  init() {
    if (this.customConfig.useCrossOrigin) {
      this.crossOrigin = 'anonymous';
    }
    this.$on('mousedown', this.onMouseDown);
    this.$on('mousemove', this.onMouseMove);
    this.$on('mouseup', this.onMouseUp);
    this.$on('wheel', this.onMouseWheel);
  }

  inited() {
    this.initCanvasSize();
    // this.hideVideo();
    this.initCamera();
    // The video texture only accept the video loadeded
    this.$on('loadeddata', () => {
      if (this.renderer) return;
      this.initScene();
      this.initRenderer();
    });
    this.poller(this.render);
  }

  initCanvasSize() {
    const { clientWidth: width, clientHeight: height } = this.$video;
    this.canvasSize = {
      width,
      height,
    };
  }

  initCamera() {
    const { width, height } = this.canvasSize;
    const camera = new PerspectiveCamera(75, width / height, 1, 1100); // create the camera
    camera.target = new Vector3(0, 0, 0);
    this.camera = camera;
  }

  initScene() {
    const geometry = new SphereBufferGeometry(500, 60, 40);
    // invert the geometry on the x-axis so that all of the faces point inward
    geometry.scale(-1, 1, 1);

    const scene = new Scene();
    const texture = new VideoTexture(this.$video);
    // const texture = new VideoTexture(video);
    texture.minFilter = LinearFilter;
    texture.format = RGBFormat;

    const material = new MeshBasicMaterial({
      map: texture,
    });

    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    this.scene = scene;
  }

  initRenderer() {
    const { width, height } = this.canvasSize;
    const renderer = new WebGLRenderer({
      canvas: this.$dom,
    }); // 创建渲染器
    renderer.setSize(width, height); // 设置画布大小
    renderer.setPixelRatio(window.devicePixelRatio); // 设置像素比，针对高清屏
    this.renderer = renderer;
  }

  poller(fn) {
    requestAnimationFrame(() => {
      fn.call(this);
      this.poller(fn);
    });
  }

  render() {
    if (!this.renderer) return;
    let { lat, phi, theta } = this;
    const { lon, distance, camera, renderer, scene } = this;
    lat = Math.max(-85, Math.min(85, lat));
    phi = ThreeMath.degToRad(90 - lat);
    theta = ThreeMath.degToRad(lon);

    camera.position.x = distance * Math.sin(phi) * Math.cos(theta);
    camera.position.y = distance * Math.cos(phi);
    camera.position.z = distance * Math.sin(phi) * Math.sin(theta);

    camera.lookAt(camera.target);

    renderer && renderer.render(scene, camera);
  }

  hideVideo() {
    this.$css('video', 'display', 'none');
  }

  onMouseDown(event) {
    this.isUserInteracting = true;
    this.onPointerDownPointerX = event.clientX;
    this.onPointerDownPointerY = event.clientY;

    this.onPointerDownLat = this.lat;
    this.onPointerDownLon = this.lon;
  }

  onMouseMove(event) {
    if (!this.isUserInteracting) return;
    this.lon = (this.onPointerDownPointerX - event.clientX) * 0.1 + this.onPointerDownLon;
    this.lat = (event.clientY - this.onPointerDownPointerY) * 0.1 + this.onPointerDownLat;
  }

  onMouseUp() {
    this.isUserInteracting = false;
  }

  onMouseWheel(event) {
    this.distance += event.deltaY * 0.05;
    this.distance = ThreeMath.clamp( this.distance, 1, 50);
  }
}
