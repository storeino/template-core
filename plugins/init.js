import StoreinoApp from 'vue/dist/vue.common.prod';
export default async function ({ $axios, $http, route, $tools, $storeino, store, app, redirect }, inject) {
  if (process.server) {
    let response = null;
    const req = app.context.req;
    store.state.domain = req.headers.host;
    if (req.headers.ip) {
      store.state.IP = req.headers.ip
    }
    try {
      if (req.body && req.body.preview) {
        store.state.isPreview = true;
        const body = { data: JSON.parse(req.body.preview.data), schema: JSON.parse(req.body.preview.schema) };
        response = await $http.post('/settings/current', body);
      } else {
        response = await $http.get('/settings/current');
      }
      store.state.settings = response.data;
    } catch (error) {
      if (error.response) throw "ERROR :: " + error.response.data;
      throw "ERROR :: INVALID TOKEN" + error;
    }
    let cookies = $tools.cookieToObject(req.headers.cookie);
    const STOREINO_CART = cookies['STOREINO-CART'] ? cookies['STOREINO-CART'] : '[]';
    store.state.cart = JSON.parse(STOREINO_CART);
    const STOREINO_WISHLIST = cookies['STOREINO-WISHLIST'] ? cookies['STOREINO-WISHLIST'] : '[]';
    store.state.wishlist = JSON.parse(STOREINO_WISHLIST);
    const settings = store.state.settings;
    if (settings && settings.meta_tags && settings.meta_tags.length > 0) {
      for (const metaTag of settings.meta_tags) {
        const meta = { hid: metaTag[metaTag.type], [metaTag.type]: metaTag[metaTag.type], content: metaTag.content }
        store.state.seo.metaTags.push(meta);
      }
    }
    if (!store.state.currency.code) {
      const { code, symbol } = settings.store_currencies.find(c => c.default) || settings.store_currencies[0];
      store.state.currency = { code, symbol };
    } else if (settings.store_currencies.find(c => c.code == store.state.currency.code)) store.state.currency.symbol = settings.store_currencies.find(c => c.code == store.state.currency.code).symbol;
    if (!store.state.language.code) {
      const { code, name } = settings.store_languages.find(c => c.default) || settings.store_languages[0];
      store.state.language = { code, name };
    }
    try {
      store.state.apps = [];
      const response = await $storeino.apps.search({ only: ['name', 'route', 'placement', 'config'] });
      const names = response.data.results.map(app => app.route);
      const { data: objects } = await $http.get('https://appstatic.storeino.com/all/store', { params: { names } });
      for (const app of response.data.results) {
        const loaded = objects.find(object => object.name === app.route);
        app.loaded = loaded;
        store.state.apps.push(app);
      }
    } catch (err) {
      console.log({err});
    }
  } else {
    const cookies = $tools.cookieToObject(document.cookie);
    if (route.name == 'thanks') {
      if (cookies['ORDER_ID']) {
        document.cookie = 'ORDER_ID=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
        document.cookie = 'STOREINO-CART=[];path=/';
        store.state.cart = [];
      } else {
        window.location.href = '/';
        return false;
      }
    }
    StoreinoApp.$store = {
      search: async function (module, params) {
        let response = await $http.get(`/${module}/search`, { params });
        return response.data;
      },
      get: async function (module, params) {
        let response = await $http.get(`/${module}/get`, { params });
        return response.data;
      },
      create: async function (module, params, data) {
        let response = await $http.post(`/${module}/create`, data, { params });
        return response.data;
      },
      update: async function (module, params, data) {
        let response = await $http.post(`/${module}/update`, data, { params });
        return response.data;
      }
    };
    window.StoreinoApp = StoreinoApp;
    const settings = store.state.settings;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ?
          n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s)
    }(window, document, 'script',
      'https://connect.facebook.net/en_US/fbevents.js');
    window.external_id = localStorage.getItem('__external_id');
    if (!store.state.isPreview && settings.facebook_multiple_pixel && settings.facebook_multiple_pixel.length > 0) {
      settings.facebook_multiple_pixel.forEach(p => {
        if (p.active) {
          fbq.disablePushState = true;
          fbq('init', p.id);
        }
      });
    }
    window._fbpx = app.context.$storeino.fbpx;
    !function (w, d, t) {
      w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || []; ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"], ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } }; for (var i = 0; i < ttq.methods.length; i++)ttq.setAndDefer(ttq, ttq.methods[i]); ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++)ttq.setAndDefer(e, ttq.methods[n]); return e }, ttq.load = function (e, n) {
        var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
        if (settings.tiktok_pixel && settings.tiktok_pixel.length > 0) {
          ttq._i = ttq._i || {}, ttq._i[e] = [], ttq._i[e]._u = i, ttq._t = ttq._t || {}, ttq._t[e] = +new Date, ttq._o = ttq._o || {}, ttq._o[e] = n || {}; var o = document.createElement("script"); o.type = "text/javascript", o.async = !0, o.src = i + "?sdkid=" + e + "&lib=" + t; var a = document.getElementsByTagName("script")[0]; a.parentNode.insertBefore(o, a)
        }
      }
      w.tiktokPixel = function (id) { ttq.load(id); }
      w.tiktokPageView = function () { ttq.page(); }
      w.tiktokAddPaymentInfo = function (s = {}) { ttq.track('AddPaymentInfo', s); }
      w.tiktokAddToCart = function (s = {}) { ttq.track('AddToCart', s); }
      w.tiktokAddToWishlist = function (s = {}) { ttq.track('AddToWishlist', s); }
      w.tiktokClickButton = function (s = {}) { ttq.track('ClickButton', s); }
      w.tiktokPurchase = function (s = {}) { ttq.track('CompletePayment', s); }
      w.tiktokCompleteRegistration = function (s = {}) { ttq.track('CompleteRegistration', s); }
      w.tiktokViewContent = function (s = {}) { ttq.track('ViewContent', s); }
      w.tiktokSubscribe = function (s = {}) { ttq.track('Subscribe', s); }
      w.tiktokSubmitForm = function (s = {}) { ttq.track('SubmitForm', s); }
      w.tiktokSearch = function (s = {}) { ttq.track('Search', s); }
      w.tiktokPlaceAnOrder = function (s = {}) { ttq.track('PlaceAnOrder', s); }
      w.tiktokInitiateCheckout = function (s = {}) { ttq.track('InitiateCheckout', s); }
      w.tiktokDownload = function (s = {}) { ttq.track('Download', s); }
      w.tiktokContact = function (s = {}) { ttq.track('Contact', s); }
    }(window, document, 'ttq');
    if (settings.tiktok_pixel && settings.tiktok_pixel.length > 0) {
      for (const pixel of settings.tiktok_pixel) {
        if (pixel.active) {
          window.tiktokPixel(pixel.id);
        }
      }
      if (route.query.pixel) {
        const pixel = JSON.parse(route.query.pixel);
        window.tiktokPurchase(
          {
            contents: pixel.contents.map(p => {
              return {
                content_id: p.id,
                content_type: 'product',
                content_name: p.name,
                quantity: p.quantity,
                price: p.price
              }
            }),
            value: pixel.total,
            currency: store.state.currency.code || "USD"
          });
      }
    }
    (function (e, t, n, tr) {
      if (e.snaptr) return; var a = e.snaptr = function () { a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments) };
      e.snapPixel = function (id, email = "") { snaptr('init', id, { 'user_email': email }); }
      e.snapPageView = function (d = {}) { snaptr(tr, 'PAGE_VIEW', d); }
      e.snapPurchase = function (d = {}) { snaptr(tr, "PURCHASE", d) }
      e.snapViewContent = function (d = {}) { snaptr(tr, 'VIEW_CONTENT', d) }
      e.snapAddToCart = function (d = {}) { snaptr(tr, "ADD_CART", d) }
      e.snapAddToWishlist = function (d = {}) { snaptr(tr, "ADD_WISHLIST", d) }
      e.snapSignUp = function (d = {}) { snaptr(tr, 'SIGN_UP', d) }
      a.queue = []; var s = 'script', r = t.createElement(s); r.async = !0;
      r.src = n; var u = t.getElementsByTagName(s)[0];
      u.parentNode.insertBefore(r, u);
    })(window, document, 'https://sc-static.net/scevent.min.js', 'track');
    if (settings.snapchat_pixel && settings.snapchat_pixel.length > 0) {
      for (const pixel of settings.snapchat_pixel) {
        if (pixel.active) {
          snapPixel(pixel.id, pixel.email);
        }
      }
      if (route.name == 'thanks' && route.query.pixel) {
      }
    }
    (function (w, d, t) {
      if (settings && settings.google_ads && settings.google_ads.id) {
        var s = d.createElement(t); s.async = !0;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`;
        var h = d.getElementsByTagName('head')[0];
        h.appendChild(s);
        w.dataLayer = w.dataLayer || [];
        w.gtag = function gtag() { dataLayer.push(arguments); };
        w.gtag('js', new Date());
        w.gtag('config', settings.google_ads.id);
      } else w.gtag = function gtag(a, b, c, d) { };
    })(window, document, 'script');
    if (settings && settings.google_analytics_id) {
      var ga = document.createElement('script');
      ga.type = 'text/javascript'; ga.async = true;
      ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + settings.google_analytics_id;
      document.getElementsByTagName('head')[0].appendChild(ga);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { dataLayer.push(arguments); }
      window.gtag('js', new Date());
      window.gtag('config', settings.google_analytics_id);
    }
    window.googleAdsEvent = (eventName) => {
      if (settings.google_ads && settings.google_ads.id && settings.google_ads.events) {
        const eventsGroup = settings.google_ads.events.filter((e) => e.name == eventName)
        if (eventsGroup.length > 0) {
          for (const event of eventsGroup) {
            const object = {
              'send_to': `${settings.google_ads.id}/${event.value}`,
              'event_callback': () => { }
            };
            gtag('event', 'conversion', object);
          }
        }
      }
    }
    if (settings.google_ads && settings.google_ads.id && settings.google_ads.events) {
      if (route.name == 'thanks' && route.query.pixel) {
        window.googleAdsEvent('purchase');
      }
    }
  }
  inject('settings', store.state.settings);
}
