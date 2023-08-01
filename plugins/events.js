export default function ({ app, store, router, $tools }, inject) {
    if (!process.server) {
        window.addEventListener('TO_CHECKOUT', (e) => {
            window.location.href = '/checkout2'
        });
        window.addEventListener('APP_GO_TO', (e) => {
            if (e.detail && e.detail.url) {
                app.router.push(e.detail.url)
            }
        });
        window.addEventListener('PAGE_VIEW', (e) => {
            if (store.state.settings && store.state.settings.google_analytics_id) {
                gtag('js', new Date());
                gtag('config', window.escape(`${store.state.settings.google_analytics_id}`));
            }
            if (store.state.settings && store.state.settings.google_ads && store.state.settings.google_ads.id) {
                gtag('config', `${store.state.settings.google_ads.id}`);
            }
            snapPageView();
            tiktokPageView();
            if (e.data && e.data._id) {
                snapViewContent({ item_ids: [e.data._id], currency: store.state.currency.code || "USD" });
                tiktokViewContent({
                    content_id: e.data._id,
                    quantity: 1,
                    price: e.data.price.salePrice,
                    value: e.data.price.salePrice,
                    currency: store.state.currency.code || "USD"
                })
            }
        });
        window.addEventListener('ADD_TO_CART', (e) => {
            const item = $tools.reformCartItem(e.data);
            let exists = null;
            if (item.variant) exists = store.state.cart.find(i => i._id === item._id && i.variant && i.variant._id === item.variant._id);
            else exists = store.state.cart.find(i => i._id === item._id);
            if (exists) {
                item.parents = [...new Set([...exists.parents, ...item.parents])];
                exists.quantity = item.quantity;
            } else {
                store.state.cart.push(item);
            }
            $tools.setCart(store.state.cart);
            $tools.call('ADDED_TO_CART');
            snapAddToCart({
                item_ids: [item._id],
                price: item.price,
                currency: store.state.currency.code || "USD"
            });
            tiktokAddToCart({
                content_id: item._id,
                quantity: item.quantity,
                price: item.price,
                value: item.price * item.quantity,
                currency: store.state.currency.code || "USD"
            });
        });
        window.addEventListener('REMOVE_FROM_CART', (e) => {
            const item = $tools.reformCartItem(e.data);
            let index = -1;
            if (item.variant) index = store.state.cart.findIndex(i => i._id === item._id && i.variant && i.variant._id === item.variant._id);
            else index = store.state.cart.findIndex(i => i._id === item._id);
            if (index == -1) return;
            store.state.cart.splice(index, 1);
            const childs = store.state.cart.filter(i => i.parents && i.parents.includes(item._id));
            for (const child of childs) {
                const childIndex = store.state.cart.findIndex(i => i._id == child._id);
                child.parents.splice(child.parents.indexOf(item._id), 1);
                if (child.parents.length == 0) store.state.cart.splice(childIndex, 1);
            }
            $tools.setCart(store.state.cart);
        });
        window.addEventListener('ADD_TO_WISHLIST', (e) => {
            const item = $tools.reformWishlistItem(e.data);
            let exists = store.state.wishlist.find(i => i._id === item._id);
            if (!exists) store.state.wishlist.push(item);
            $tools.setWishlist(store.state.wishlist);
            fbAddToWishlist({ id: item._id, content_name: item.name, content_ids: [item._id], content_type: 'product' });
            snapAddToWishlist({ item_ids: [item._id] });
            tiktokAddToWishlist({ content_id: item._id, price: item.price, currency: store.state.currency.code || "USD" });
        });
        window.addEventListener('REMOVE_FROM_WISHLIST', (e) => {
            const item = $tools.reformWishlistItem(e.data);
            let index = store.state.wishlist.findIndex(i => i._id === item._id);
            if (index == -1) return;
            store.state.wishlist.splice(index, 1);
            $tools.setWishlist(store.state.wishlist);
        });
        window.addEventListener('message', (e) => {
            let response = e.data
            if (response.type == "addToCart") app.router.push(`/products/${response.data.product.slug}`)
            if (response.type == "loading") {
                if (response.data.route == "/login") {
                    app.router.push('/account/login')
                }
                setTimeout(() => {
                    store.state.loading = false
                }, 1000)
            }
            if (e.data.token) store.state.customer = $tools.tokenDecode(e.data.token)
            if (response.data == "login") store.state.customer = null
            if (response.type == 'route') { window.history.pushState({}, "", $tools.$pushState('/account/', [`${response.data}`], '')) }
            if (response.type == 'route_id') { window.history.pushState({}, "", $tools.$pushState('/account/', [`${response.data.name}`], { orderId: response.data.query })) }
        })
    }
}