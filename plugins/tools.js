export default function ({ store }, inject) {
    const tools = {};
    tools.hexToRgb = (hex) => {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
    tools.copy = (value) => {
        const type = typeof (value);
        if (type == 'number') return value * 1;
        if (type == 'string') return value + '';
        if (value === null || value === undefined) return undefined;
        if (type == 'object') return JSON.parse(JSON.stringify(value));
        return value;
    }
    tools.cookieToObject = (cookie) => {
        if (!cookie) return {};
        const cookies = cookie.split(';');
        const result = {};
        for (let i = 0; i < cookies.length; i++) {
            const key = cookies[i].split('=')[0].trim();
            const value = cookies[i].split('=')[1] ? cookies[i].split('=')[1].trim() : '';
            result[key] = value;
        }
        return result;
    }
    tools.call = (name, data = {}) => {
        if (!process.server) {
            if (!window.events) window.events = {}
            if (!window.events[name]) window.events[name] = new CustomEvent(name);
            window.events[name].data = data
            window.dispatchEvent(window.events[name]);
        }
    }
    tools.reformCartItem = (item) => {
        const result = {};
        result._id = item._id;
        result.quantity = item.quantity;
        result.price = item.price;
        result.parents = [];
        if (item.booking) {
            result.booking =  item.booking
         }
        if (item.variant) { result.variant = { _id: item.variant._id }; }
        if (item.upsell && item.upsell.product) {
            result.parents.push(item.upsell.product._id);
            result.upsell = (({ _id, name }) => ({ _id, name }))(item.upsell);
            const discount = (({ code, type, value }) => ({ code, type, value }))(item.upsell.discount || {});
            result.upsell = { ...result.upsell, ...discount };
        }
        return result;
    }
    tools.reformWishlistItem = (item) => {
        return { _id: item._id };
    }
    tools.setCart = (cart) => {
        const cartString = JSON.stringify(cart);
        document.cookie = `STOREINO-CART=${cartString};path=/`;
    }
    tools.setWishlist = (wishlist) => {
        const wishString = JSON.stringify(wishlist);
        document.cookie = `STOREINO-WISHLIST=${wishString};path=/`;
    }
    tools.setToCookies = (data,key) => {
        const dataString = JSON.stringify(data);
        document.cookie = `STOREINO-${key}=${dataString};path=/`;
    }

    tools.toast = (message, type = 'success') => {
        if (!process.server) {
            const toast = document.createElement('div');
            const svgIcon = document.createElement('div');
            const toastMessage = document.createElement('div');
            const toastProgress = document.createElement('div');
            const toastClose = document.createElement('div');
            toast.classList.add('toast');
            toast.classList.add(type);
            toast.classList.add('toast-fade-in');
            toastMessage.className = 'toast-message';
            toastProgress.className = 'toast-progress';
            toastClose.className = 'toast-close';
            toastMessage.innerHTML = message;
            toastClose.innerHTML = '&times;';
            svgIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.25 16.518l-4.5-4.319 1.396-1.435 3.078 2.937 6.105-6.218 1.421 1.409-7.5 7.626z"/></svg>';
            toast.appendChild(svgIcon);
            toast.appendChild(toastMessage);
            toast.appendChild(toastProgress);
            toast.appendChild(toastClose);
            document.body.appendChild(toast);
            toastClose.addEventListener('click', () => {
                toast.classList.remove('toast-fade-in')
                toast.classList.add('toast-fade-out');
                setTimeout(() => {
                    toast.style.display = 'none';
                }, 450);
            });
            setTimeout(() => {
                toast.classList.remove('toast-fade-in')
                toast.classList.add('toast-fade-out');
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 450);
            }, 3000);
        }
    }
    tools.tokenDecode = (token) => {
        if (/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/.test(token) && token.split(".").length > 1) {
            let data = token.split(".")[1];
            let buff = new Buffer.from(data, 'base64');
            let text = buff.toString('ascii');
            return JSON.parse(text)
        } else return null;
    }
    tools.tokenDecode = (token) => {
        if (/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/.test(token) && token.split(".").length > 1) {
            let data = token.split(".")[1];
            let buff = new Buffer.from(data, 'base64');
            let text = buff.toString('ascii');
            return JSON.parse(text)
        } else return null;
    }
    tools.pushState = (path, params, query) => {
        if (typeof params == 'object') {
            params = params.join('+');
            let qs = serializeQuery(query);
            qs = qs == '' ? '' : '?' + qs;
            return path + params + qs;
        }
    }
    inject('tools', tools);
}