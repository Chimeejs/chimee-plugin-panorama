# chimee-plugin-panorama
A plugin for panorama video

## install

You can install this package through npm now.

```
npm install chimee-plugin-panorama
```

## usage

It use like most of the chimee plugin.

```javascript
import Chimee from 'chimee';
import ChimeePluginPanorama from 'chimee-plugin-panorama';
Chimee.install(ChimeePluginPanorama);
const player = new Chimee({
  src: 'http://cdn.toxicjohann.com/shark.mp4',
  wrapper: '#wrapper',
  plugin: [
    ChimeePluginPanorama.name,
  ],
  volume: 0.1,
  controls: true,
  canvas: true,
  autoplay: true,
  muted: true,
});
```

