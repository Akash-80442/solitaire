console.log("INDEX WEB TSX IS STARTING");
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Generate required icon fonts and inject them into the DOM
import FontAwesome5_Solid from 'react-native-vector-icons/Fonts/FontAwesome5_Solid.ttf';

const iconFontStyles = `
@font-face {
  src: url(${FontAwesome5_Solid});
  font-family: FontAwesome5_Solid;
}
`;

const style = document.createElement('style');
style.type = 'text/css';
if (style.styleSheet) {
  style.styleSheet.cssText = iconFontStyles;
} else {
  style.appendChild(document.createTextNode(iconFontStyles));
}
document.head.appendChild(style);

console.log("INDEX WEB JS EXECUTING"); AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
