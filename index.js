// import { tools } from './plugins/tools';
// import { http } from './plugins/http';
// import { storeino } from './plugins/storeino';
// import { init } from './plugins/init';
// import { events } from "./plugins/events";


// export default function( ) {
//   return {
//     tools,
//     http,
//     storeino,
//     init,
//     events
//   }
// }


module.exports = {
  plugins: [
      './node_modules/storeino-template-core/plugins/tools.js',
      './node_modules/storeino-template-core/plugins/http.js',
      './node_modules/storeino-template-core/plugins/storeino.js',
      './node_modules/storeino-template-core/plugins/init.js',
      './node_modules/storeino-template-core/plugins/events.js',
  ]
}