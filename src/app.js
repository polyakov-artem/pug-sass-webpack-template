// Styles
import './app.scss';

// Common  Js
import importAll from '~js/importAll';

// Blocks
import '~js/blocks';

// Pages
import './pages/index/index';

// SVG images
importAll(require.context('svg-sprite-loader?sprite!~assets/svg/', true, /\.svg$/));
