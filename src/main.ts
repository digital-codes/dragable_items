// main.ts
import { createApp } from "vue";
import App from "./App.vue";

// Font Awesome (SVG)
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// Pick only the icons you actually use
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

library.add(faMoon, faSun);

// Import fonts
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

// Import global styles
import "./styles/style.scss";

const app = createApp(App);
app.component("font-awesome-icon", FontAwesomeIcon);

app.mount("#app");
