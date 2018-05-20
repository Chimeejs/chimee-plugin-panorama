
/**
 * chimee-plugin-panorama v0.1.0
 * (c) 2017-2018 toxic-johann
 * Released under MIT
 */

'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _Object$getOwnPropertyDescriptor = _interopDefault(require('babel-runtime/core-js/object/get-own-property-descriptor'));
var _Object$getPrototypeOf = _interopDefault(require('babel-runtime/core-js/object/get-prototype-of'));
var _Object$assign = _interopDefault(require('babel-runtime/core-js/object/assign'));
var _classCallCheck = _interopDefault(require('babel-runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('babel-runtime/helpers/createClass'));
var _possibleConstructorReturn = _interopDefault(require('babel-runtime/helpers/possibleConstructorReturn'));
var _inherits = _interopDefault(require('babel-runtime/helpers/inherits'));
var Chimee = _interopDefault(require('chimee'));
var three = require('three');
var toxicDecorators = require('toxic-decorators');

var _class;

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

var ChimeePluginPanorama = (_class = function (_Chimee$plugin) {
  _inherits(ChimeePluginPanorama, _Chimee$plugin);

  function ChimeePluginPanorama(config) {
    var _ref;

    _classCallCheck(this, ChimeePluginPanorama);

    var myConfig = {
      el: document.createElement('canvas'),
      penetrate: true,
      inner: true,
      useCrossOrigin: true,
      hideVideo: true
    };
    _Object$assign(myConfig, config);

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_ref = ChimeePluginPanorama.__proto__ || _Object$getPrototypeOf(ChimeePluginPanorama)).call.apply(_ref, [this, myConfig].concat(args)));

    _this.customConfig = myConfig;
    _this.lat = 0;
    _this.lon = 0;
    _this.theta = 0;
    _this.distance = 50;
    _this.phi = 0;
    _this.onMouseDownMouseX = 0;
    _this.onMouseDownMouseY = 0;
    _this.onMouseDownLon = 0;
    _this.onMouseDownLat = 0;
    _this.onPointerDownPointerX = 0;
    _this.onPointerDownPointerY = 0;
    _this.onPointerDownLon = 0;
    _this.onPointerDownLat = 0;
    _this.isUserInteracting = false;
    return _this;
  }

  _createClass(ChimeePluginPanorama, [{
    key: 'init',
    value: function init() {
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
  }, {
    key: 'inited',
    value: function inited() {
      var _this2 = this;

      this.initCanvasSize();
      this.hideVideo();
      this.initCamera();
      // The video texture only accept the video loadeded
      this.$on('loadeddata', function () {
        if (_this2.renderer) return;
        _this2.initScene();
        _this2.initRenderer();
      });
      this.poller(this.render);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
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
  }, {
    key: 'initCanvasSize',
    value: function initCanvasSize() {
      var _$video = this.$video,
          width = _$video.clientWidth,
          height = _$video.clientHeight;

      this.canvasSize = {
        width: width,
        height: height
      };
    }
  }, {
    key: 'initCamera',
    value: function initCamera() {
      var _canvasSize = this.canvasSize,
          width = _canvasSize.width,
          height = _canvasSize.height;

      var camera = new three.PerspectiveCamera(75, width / height, 1, 1100); // create the camera
      camera.target = new three.Vector3(0, 0, 0);
      this.camera = camera;
    }
  }, {
    key: 'initScene',
    value: function initScene() {
      var scene = new three.Scene();
      var mesh = this.createMesh();
      scene.add(mesh);
      this.scene = scene;
    }
  }, {
    key: 'createMesh',
    value: function createMesh() {
      var geometry = new three.SphereBufferGeometry(500, 60, 40);
      // invert the geometry on the x-axis so that all of the faces point inward
      geometry.scale(-1, 1, 1);
      var texture = new three.VideoTexture(this.$video);
      texture.minFilter = three.LinearFilter;
      texture.format = three.RGBFormat;

      var material = new three.MeshBasicMaterial({
        map: texture
      });

      var mesh = new three.Mesh(geometry, material);

      this.mesh = mesh;

      return mesh;
    }
  }, {
    key: 'initRenderer',
    value: function initRenderer() {
      var _canvasSize2 = this.canvasSize,
          width = _canvasSize2.width,
          height = _canvasSize2.height;

      var renderer = new three.WebGLRenderer({
        canvas: this.$dom
      }); // 创建渲染器
      renderer.setSize(width, height); // 设置画布大小
      renderer.setPixelRatio(window.devicePixelRatio); // 设置像素比，针对高清屏
      this.renderer = renderer;
    }
  }, {
    key: 'poller',
    value: function poller(fn) {
      var _this3 = this;

      requestAnimationFrame(function () {
        fn.call(_this3);
        _this3.poller(fn);
      });
    }
  }, {
    key: 'render',
    value: function render() {
      if (!this.renderer) return;
      var lat = this.lat,
          phi = this.phi,
          theta = this.theta;
      var lon = this.lon,
          distance = this.distance,
          camera = this.camera,
          renderer = this.renderer,
          scene = this.scene;

      lat = Math.max(-85, Math.min(85, lat));
      phi = three.Math.degToRad(90 - lat);
      theta = three.Math.degToRad(lon);

      camera.position.x = distance * Math.sin(phi) * Math.cos(theta);
      camera.position.y = distance * Math.cos(phi);
      camera.position.z = distance * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(camera.target);

      renderer && renderer.render(scene, camera);
    }
  }, {
    key: 'hideVideo',
    value: function hideVideo() {
      if (this.hideVideo) {
        this.$css('video', 'display', 'none');
      }
    }
  }, {
    key: 'onMouseDown',
    value: function onMouseDown(event) {
      this.isUserInteracting = true;

      var _ref2 = event.touches && event.touches.length ? event.touches[0] : event,
          clientX = _ref2.clientX,
          clientY = _ref2.clientY;

      this.onPointerDownPointerX = clientX;
      this.onPointerDownPointerY = clientY;

      this.onPointerDownLat = this.lat;
      this.onPointerDownLon = this.lon;
    }
  }, {
    key: 'onMouseMove',
    value: function onMouseMove(event) {
      if (!this.isUserInteracting) return;

      var _ref3 = event.touches && event.touches.length ? event.touches[0] : event,
          clientX = _ref3.clientX,
          clientY = _ref3.clientY;

      this.lon = (this.onPointerDownPointerX - clientX) * 0.1 + this.onPointerDownLon;
      this.lat = (this.onPointerDownPointerY - clientY) * 0.1 + this.onPointerDownLat;
    }
  }, {
    key: 'onMouseUp',
    value: function onMouseUp() {
      this.isUserInteracting = false;
    }
  }, {
    key: 'onMouseWheel',
    value: function onMouseWheel(event) {
      this.distance += event.deltaY * 0.05;
      this.distance = three.Math.clamp(this.distance, 1, 50);
    }
  }, {
    key: 'onload',
    value: function onload() {
      if (this.scene && this.mesh) {
        this.scene.remove(this.mesh);
        this.scene.add(this.createMesh());
      }
    }
  }]);

  return ChimeePluginPanorama;
}(Chimee.plugin), (_applyDecoratedDescriptor(_class.prototype, 'onMouseDown', [toxicDecorators.autobind], _Object$getOwnPropertyDescriptor(_class.prototype, 'onMouseDown'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'onMouseMove', [toxicDecorators.autobind], _Object$getOwnPropertyDescriptor(_class.prototype, 'onMouseMove'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'onMouseUp', [toxicDecorators.autobind], _Object$getOwnPropertyDescriptor(_class.prototype, 'onMouseUp'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'onMouseWheel', [toxicDecorators.autobind], _Object$getOwnPropertyDescriptor(_class.prototype, 'onMouseWheel'), _class.prototype)), _class);

module.exports = ChimeePluginPanorama;
