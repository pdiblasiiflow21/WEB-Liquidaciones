import "./assets/css/vendor/dropzone.min.css";
import 'bootstrap-vue/dist/bootstrap-vue.css'
import "./assets/css/vendor/bootstrap.min.css";
import "./assets/css/vendor/bootstrap.rtl.only.min.css";
import 'video.js/dist/video-js.css'

import { defaultColor } from "./constants/config";
// import init from './init';
// import Vue from 'vue';
/*  if you want use single color theme

- ColorSwitcher component remove in 'src/App.vue' file.
- Remove multicolor section in current file
- Uncomment the two lines below

import "./assets/css/sass/themes/piaf.light.orange.scss";
import "./main";
*/

/* if you want single color remove this section:multicolor */
var color = defaultColor;

if (localStorage.getItem("themeColor")) {
  color = localStorage.getItem("themeColor");
}
let render = () => {
  import("./assets/css/sass/themes/piaf." + color + ".scss").then(() =>
    require("./main")
  );
};

// init(Vue);

render();
/* if you want single color remove this section:multicolor */