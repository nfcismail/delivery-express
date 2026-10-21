(function () {
  var DX = (window.DX = window.DX || {});
  var KEY = "dx-cart-v1";
  var memory = null;
  var listeners = [];

  DX.getCart = function () {
    var source = memory;
    if (!source) {
      try {
        source = JSON.parse(localStorage.getItem(KEY) || "[]");
      } catch (error) {
        source = [];
      }
    }
    if (!Array.isArray(source)) source = [];
    return source.map(function (item) {
      return {
        id: item.id,
        name: item.name,
        price: Number(item.price) || 0,
        qty: Number(item.qty) || 1,
        note: item.note || "",
        placeId: item.placeId || "",
        img: item.img || ""
      };
    });
  };

  DX.saveCart = function (cart) {
    memory = cart.map(function (item) {
      return {
        id: item.id,
        name: item.name,
        price: Number(item.price) || 0,
        qty: Number(item.qty) || 1,
        note: item.note || "",
        placeId: item.placeId || "",
        img: item.img || ""
      };
    });
    try {
      localStorage.setItem(KEY, JSON.stringify(memory));
    } catch (error) {}
    listeners.forEach(function (fn) {
      fn(DX.getCart());
    });
  };

  DX.onCart = function (fn) {
    listeners.push(fn);
    fn(DX.getCart());
  };

  DX.subtotal = function (cart) {
    return (cart || DX.getCart()).reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);
  };

  DX.cartCount = function (cart) {
    return (cart || DX.getCart()).reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
  };

  DX.addItem = function (product, note) {
    note = note || "";
    var cart = DX.getCart();
    var placeId = product.placeId || "";
    if (cart.length && (cart[0].placeId || "") !== placeId) cart = [];
    var found = cart.find(function (item) {
      return item.id === product.id && item.note === note;
    });
    if (found) found.qty = Math.min(20, found.qty + 1);
    else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: 1,
        note: note,
        placeId: placeId,
        img: product.img || ""
      });
    }
    DX.saveCart(cart);
  };

  DX.cartPlaceId = function (cart) {
    cart = cart || DX.getCart();
    return cart.length ? cart[0].placeId || "" : "";
  };

  DX.changeQty = function (index, delta) {
    var cart = DX.getCart();
    var item = cart[index];
    if (!item) return;
    item.qty += delta;
    if (item.qty > 20) item.qty = 20;
    if (item.qty <= 0) cart.splice(index, 1);
    DX.saveCart(cart);
  };
})();
