import Chimee from 'chimee';
import { Scene, PerspectiveCamera, WebGLRenderer, Mesh, MeshBasicMaterial, SphereBufferGeometry, VideoTexture, LinearFilter, RGBFormat, Vector3, Math as ThreeMath } from 'three';
import { autobind } from 'toxic-decorators';

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
    this.$on('touchstart', this.onMouseDown);

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('touchmove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('touchend', this.onMouseUp);

    this.$on('wheel', this.onMouseWheel);
    this.$on('mousewheel', this.onMouseWheel);
    this.$on('DOMMouseScroll', this.onMouseWheel);

    this.$on('load', this.onload);
  }

  inited() {
    this.initCanvasSize();
    this.hideVideo();
    this.initCamera();
    // The video texture only accept the video loadeded
    this.$on('loadeddata', () => {
      if (this.renderer) return;
      this.initScene();
      this.initRenderer();
    });
    this.poller(this.render);
  }

  destroy() {
    this.$off('mousedown', this.onMouseDown);
    this.$off('touchstart', this.onMouseDown);

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('touchmove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('touchend', this.onMouseUp);

    this.$off('wheel', this.onMouseWheel);
    this.$off('mousewheel', this.onMouseWheel);
    this.$off('DOMMouseScroll', this.onMouseWheel);

    this.$off('load', this.onload);
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
    const scene = new Scene();
    const mesh = this.createMesh();
    scene.add(mesh);
    this.scene = scene;
  }

  createMesh() {
    const geometry = new SphereBufferGeometry(500, 60, 40);
    // invert the geometry on the x-axis so that all of the faces point inward
    geometry.scale(-1, 1, 1);
    const texture = new VideoTexture(this.$video);
    texture.minFilter = LinearFilter;
    texture.format = RGBFormat;

    const material = new MeshBasicMaterial({
      map: texture,
    });

    const mesh = new Mesh(geometry, material);

    this.mesh = mesh;

    return mesh;
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
    if (this.hideVideo) {
      this.$css('video', 'display', 'none');
    }
  }

  @autobind
  onMouseDown(event) {
    this.isUserInteracting = true;

    const {
      clientX,
      clientY,
    } = event.touches && event.touches.length
      ? event.touches[0]
      : event;

    this.onPointerDownPointerX = clientX;
    this.onPointerDownPointerY = clientY;

    this.onPointerDownLat = this.lat;
    this.onPointerDownLon = this.lon;
  }

  @autobind
  onMouseMove(event) {
    if (!this.isUserInteracting) return;

    const {
      clientX,
      clientY,
    } = event.touches && event.touches.length
      ? event.touches[0]
      : event;

    this.lon = (this.onPointerDownPointerX - clientX) * 0.1 + this.onPointerDownLon;
    this.lat = (this.onPointerDownPointerY - clientY) * 0.1 + this.onPointerDownLat;
  }

  @autobind
  onMouseUp() {
    this.isUserInteracting = false;
  }

  @autobind
  onMouseWheel(event) {
    this.distance += event.deltaY * 0.05;
    this.distance = ThreeMath.clamp(this.distance, 1, 50);
  }

  onload() {
    if (this.scene && this.mesh) {
      this.scene.remove(this.mesh);
      this.scene.add(this.createMesh());
    }
  }
}
