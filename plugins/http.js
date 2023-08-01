import https from 'https';
export default async function({ $axios, store, $tools, app, req, res, route }, inject) {
  if (process.server) {
    if (app.context.req && app.context.req.headers && app.context.req.headers.ip) {
      store.state.IP = app.context.req.headers.ip
    }
    const config = app.context.req.config;
    if (config.env == 'production') store.state.baseURL = "https://api-stores.storeino.com/api";
    let { fbclid, gclid } = req.query
    app.context.store.state.fbclid = fbclid !== undefined ? fbclid : null;
    app.context.store.state.gclid = gclid !== undefined ? gclid : null;
    app.context.store.state.utm_content = req.query?.utm_content;
    app.context.store.state.utm_source = req.query?.utm_source;
    if (!app.context.store.state.fbclid && req.cookies?.fbclid) app.context.store.state.fbclid = req.cookies.fbclid;
    if (!app.context.store.state.gclid && req.cookies?.gclid) app.context.store.state.gclid = req.cookies.gclid;
    if (!app.context.store.state.utm_content && req.cookies?.utm_content) app.context.store.state.utm_content = req.cookies.utm_content;
    if (!app.context.store.state.utm_source && req.cookies?.utm_source) app.context.store.state.utm_source = req.cookies.utm_source;
    if (req.headers['user-agent'].includes('iPhone')) app.context.store.state.isIos = true;
    let referer = req.headers.referer || req.headers.host;
    if (!referer.includes('http')) referer = `https://${referer}`;
    let source = 'newv2/';
    if (app.context.store.state.gclid) source = 'gads/';
    if (app.context.store.state.fbclid) source = 'fbads/';
    if (app.context.store.state.utm_content) source = `${app.context.store.state.utm_content}/`;
    if (app.context.store.state.utm_source) source = `${app.context.store.state.utm_source}/`;
    const uri = new URL(referer);
    if (uri.host != req.headers.host) source += uri.hostname + uri.pathname;
    else source += 'direct';
    if (req.query['affiliate-id']) source = `affiliate/${req.query['affiliate-id']}`;
    app.context.store.state.source = source;
    try {
    } catch (e) {
      console.log({ e })
    }
    const cookies = $tools.cookieToObject(app.context.req.headers.cookie);
    if (route.query.cur) {
      store.state.currency.code = route.query.cur;
    } else if (cookies['CURRENT_CURRENCY']) {
      store.state.currency.code = cookies['CURRENT_CURRENCY'];
    }
    if (route.query.lang) {
      store.state.language.code = route.query.lang;
    } else if (cookies['CURRENT_LANGUAGE']) {
      store.state.language.code = cookies['CURRENT_LANGUAGE'];
    }
    if (app.context.req && app.context.req.headers && app.context.req.headers['x-auth-token']) {
      store.state.token = app.context.req.headers['x-auth-token'];
    }
    if (!store.state.token) {
      try {
        const token = config.token;
        const response = await $axios.post(store.state.baseURL + '/stores/auth', token);
        store.state.token = response.data.accessToken;
      } catch (err) {
        console.log({ err });
      }
    }
  } else {
    if (app.context.store.state.source) localStorage.setItem('CSource', app.context.store.state.source);
    if (store.state.currency.code) document.cookie = `CURRENT_CURRENCY=${store.state.currency.code};path=/`;
    if (store.state.language.code) document.cookie = `CURRENT_LANGUAGE=${store.state.language.code};path=/`;
  }
  const http = $axios.create({
    baseURL: store.state.baseURL,
    headers: { 'x-auth-token': store.state.token },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  });
  http.interceptors.request.use(function (config) {
    if (!config.params) config.params = {};
    if (!config.params.lang && store.state.language.code) config.params.lang = store.state.language.code;
    if (!config.params.cur && store.state.currency.code) config.params.cur = store.state.currency.code;
    return config;
  }, function (error) {
    return Promise.reject(error);
  });
  inject('http', http);
}