(function () {
  var page = document.body.getAttribute("data-page");

  function norm(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function mountChrome() {
    var header = document.querySelector("[data-header]");
    var footer = document.querySelector("[data-footer]");
    var currentPlace = DX.activePlace ? DX.activePlace() : null;
    var orderHref = currentPlace ? "carte.html?r=" + encodeURIComponent(currentPlace.id) : "carte.html";
    var links = [
      ["index.html", "Accueil", "home"],
      [orderHref, "Carte", "carte"],
      ["livraison.html", "Frais", "livraison"],
      ["a-propos.html", "À propos", "about"],
      ["contact.html", "Contact", "contact"]
    ];

    if (header) {
      header.innerHTML =
        '<div class="wrap header-inner">' +
          '<a class="logo" href="index.html" aria-label="Delivery Express, accueil">' +
            '<img src="assets/logo.png" alt="Delivery Express">' +
          "</a>" +
          '<button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="nav">Menu</button>' +
          '<nav class="nav" id="nav" data-nav>' +
            links.map(function (link) {
              var current = link[2] === page ? ' aria-current="page"' : "";
              return '<a href="' + link[0] + '"' + current + ">" + link[1] + "</a>";
            }).join("") +
          "</nav>" +
          '<div class="header-tools">' +
            '<a class="cart-link" href="' + orderHref + '#panier">Panier <span data-cart-count>0</span></a>' +
            '<a class="btn btn-accent header-cta" href="' + orderHref + '">Commander</a>' +
          "</div>" +
        "</div>";

      var toggle = header.querySelector("[data-nav-toggle]");
      var nav = header.querySelector("[data-nav]");
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      nav.addEventListener("click", function (event) {
        if (event.target.closest("a")) {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    if (footer) {
      footer.innerHTML =
        '<div class="wrap footer-grid">' +
          '<div>' +
            '<a class="logo" href="index.html"><img src="assets/logo.png" alt="Delivery Express"></a>' +
            "<p>Livraison à Marrakech. Le livreur part du restaurant choisi, et les frais s’affichent avant l’envoi sur WhatsApp.</p>" +
          "</div>" +
          "<div><h2>Site</h2><a href=\"index.html\">Accueil</a><a href=\"" + orderHref + "\">Carte et commande</a><a href=\"livraison.html\">Frais de livraison</a><a href=\"a-propos.html\">À propos</a><a href=\"contact.html\">Contact</a><a href=\"confidentialite.html\">Confidentialité</a></div>" +
          "<div><h2>WhatsApp</h2><p>" + DX.RESTAURANT.whatsappDisplay + "</p><a href=\"https://wa.me/" + DX.RESTAURANT.whatsapp + "\" target=\"_blank\" rel=\"noopener\">Écrire sur WhatsApp</a></div>" +
          "<div><h2>Départ</h2><p>Chaque enseigne a son adresse sur la carte. Les frais partent de ce point, pas d’un dépôt unique.</p></div>" +
        "</div>" +
        '<div class="wrap footer-base"><span>© 2026 Delivery Express</span><span>Prix des plats : cartes des enseignes. Frais : Delivery Express.</span></div>';
    }

    function paintCount(cart) {
      var count = DX.cartCount(cart);
      document.querySelectorAll("[data-cart-count]").forEach(function (node) {
        node.textContent = String(count);
        node.hidden = count === 0;
      });
    }
    DX.onCart(paintCount);
  }

  function photoHtml(item) {
    var src = item.img || DX.photo(item.id);
    if (!src) return "";
    return '<div class="dish-photo"><img src="' + src + '" alt="" loading="lazy" referrerpolicy="no-referrer"></div>';
  }

  function renderPlaces() {
    var root = document.querySelector("[data-places]");
    if (!root || !DX.PARTNERS) return;
    root.innerHTML = DX.PARTNERS.map(function (place) {
      var priced = place.menu.filter(function (item) {
        return item.price >= 15 && !/sauce/i.test(item.category || "");
      });
      if (!priced.length) priced = place.menu.filter(function (item) { return item.price > 0; });
      var priceLabel = priced.length ? "dès " + DX.formatDh(Math.min.apply(null, priced.map(function (item) { return item.price; }))) : "Prix au message";
      var photos = {
        "burger-king": "assets/places/burger-king.webp",
        quick: "assets/places/quick.webp",
        "papa-johns": "assets/places/papa-johns.webp",
        courses: "assets/places/courses.jpg"
      };
      var media = place.video
        ? '<video class="place-video" muted loop playsinline preload="none" disablepictureinpicture disableremoteplayback referrerpolicy="no-referrer"><source src="' + place.video + '" type="video/mp4"></video>'
        : photos[place.id]
          ? '<img class="place-video" src="' + photos[place.id] + '" alt="' + DX.escapeHtml(place.name) + '">'
          : '<div class="place-fallback"><span>' + DX.escapeHtml(place.name) + "</span></div>";
      return (
        '<article class="place-card">' +
          media +
          '<div class="place-body">' +
            '<div class="dish-top"><p class="dish-cat">' + DX.escapeHtml(place.minutes) + '</p><strong class="price">' + priceLabel + "</strong></div>" +
            "<h3>" + DX.escapeHtml(place.name) + "</h3>" +
            (place.rating ? '<p class="place-rate">' + DX.escapeHtml(place.rating) + " <span>fiche publique</span></p>" : "") +
            "<p>" + DX.escapeHtml(place.blurb) + "</p>" +
            '<p class="place-start">Départ : ' + DX.escapeHtml(place.address) + "</p>" +
            '<a class="btn btn-dark" href="carte.html?r=' + encodeURIComponent(place.id) + '">Commander</a>' +
          "</div>" +
        "</article>"
      );
    }).join("");

    function keepPlaying(video) {
      video.dataset.keepPlaying = "1";
      var play = video.play();
      if (play && play.catch) play.catch(function () {});
    }

    root.querySelectorAll("video").forEach(function (video) {
      video.addEventListener("pause", function () {
        if (video.dataset.keepPlaying === "1") keepPlaying(video);
      });
      video.addEventListener("click", function (event) {
        event.preventDefault();
      });
    });

    if (!("IntersectionObserver" in window)) {
      root.querySelectorAll("video").forEach(keepPlaying);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target.querySelector("video");
        if (!video) return;
        if (entry.isIntersecting) {
          keepPlaying(video);
        } else {
          video.dataset.keepPlaying = "";
          video.pause();
        }
      });
    }, { threshold: 0.5 });
    root.querySelectorAll(".place-card").forEach(function (card) { observer.observe(card); });
  }

  function renderPopular() {
    var root = document.querySelector("[data-popular]");
    if (!root) return;
    root.innerHTML = DX.popularItems().map(function (item) {
      return (
        '<a class="dish dish-link" href="carte.html#item-' + item.id + '">' +
          photoHtml(item) +
          '<div class="dish-body">' +
            '<div class="dish-top"><p class="dish-cat">' + DX.escapeHtml(item.category) + "</p><strong class=\"price\">" + DX.formatDh(item.price) + "</strong></div>" +
            "<h3>" + DX.escapeHtml(item.name) + "</h3>" +
            "<p>" + DX.escapeHtml(item.desc) + "</p>" +
            '<span class="text-link">Commander</span>' +
          "</div>" +
        "</a>"
      );
    }).join("");
  }

  function renderExamples() {
    var root = document.querySelector("[data-examples]");
    if (!root) return;
    var samples = [2.5, 4, 6, 8, 10, 12];
    root.innerHTML =
      "<table class=\"examples\"><thead><tr><th>Distance</th><th>Zone</th><th>Frais</th></tr></thead><tbody>" +
      samples.map(function (km) {
        var quote = DX.quoteDelivery(km);
        return "<tr><td>" + DX.formatKm(quote.km) + "</td><td>" + DX.escapeHtml(quote.zone) + "</td><td>" + DX.formatDh(quote.fee) + "</td></tr>";
      }).join("") +
      "</tbody></table>";
  }

  function initCarte() {
    var place = DX.activePlace();
    var menuRoot = document.getElementById("menu");
    var linesRoot = document.getElementById("cart-lines");
    var totalsRoot = document.getElementById("cart-totals");
    var chipsRoot = document.getElementById("chips");
    var search = document.getElementById("menu-search");
    var quote = null;
    var active = "Tout";
    document.title = place.name + " — Delivery Express";
    var title = document.getElementById("place-title");
    if (title) title.textContent = place.name;
    var lead = document.getElementById("place-lead");
    if (lead) lead.textContent = place.blurb + " Départ : " + place.address + ".";
    var notice = document.getElementById("place-notice");
    if (notice) {
      if (place.id === "gucciano") {
        notice.textContent = "Du lundi au vendredi, de 12h à 17h, la formule déjeuner du restaurant est le plat choisi avec une boisson offerte. Écrivez-le dans la note. Cuisine halal, sans porc et sans alcool.";
      } else if (!place.menu.length && place.customOrigin) {
        notice.textContent = "Cherchez le commerce de départ sur la carte, puis votre adresse. Décrivez la commande dans le champ indication : les prix des articles se confirment sur WhatsApp.";
      } else if (!place.menu.length) {
        notice.textContent = "Cette enseigne n’a pas de prix publiés ici. Décrivez les plats dans le champ indication. Le départ est " + place.address + ".";
      } else {
        notice.textContent = "Les prix sont ceux affichés sur la carte en ligne de l’enseigne. La livraison s’ajoute selon la route depuis " + place.address + ".";
      }
    }
    var startLine = document.getElementById("place-start");
    if (startLine) {
      startLine.textContent = place.customOrigin
        ? "Pour " + place.name + ", le départ est le commerce que vous cherchez sur la carte."
        : "Le point de départ est " + place.address + ".";
    }
    var switcher = document.getElementById("place-switch");
    if (switcher && DX.PARTNERS) {
      switcher.innerHTML = DX.PARTNERS.concat([DX.guccianoPlace()]).map(function (item) {
        return '<a class="chip' + (item.id === place.id ? " is-on" : "") + '" href="carte.html?r=' + encodeURIComponent(item.id) + '">' + DX.escapeHtml(item.name) + "</a>";
      }).join("");
    }

    var categories = [];
    place.menu.forEach(function (item) {
      if (categories.indexOf(item.category) === -1) categories.push(item.category);
    });
    chipsRoot.innerHTML = ["Tout"].concat(categories).map(function (category) {
      return '<button type="button" class="chip' + (category === "Tout" ? " is-on" : "") + '" data-cat="' + DX.escapeHtml(category) + '">' + DX.escapeHtml(category) + "</button>";
    }).join("");

    function renderMenu() {
      var q = norm(search.value);
      var list = place.menu.filter(function (item) {
        var inCat = active === "Tout" || item.category === active;
        if (!inCat) return false;
        if (!q) return true;
        return norm(item.name + " " + item.desc + " " + item.category).indexOf(q) !== -1;
      });

      if (!list.length) {
        menuRoot.innerHTML = '<p class="empty-filter">Aucun plat ne correspond. Essayez « thon », « burrata » ou « tiramisu ».</p>';
        return;
      }

      var groups = [];
      list.forEach(function (item) {
        var group = groups.find(function (entry) { return entry.name === item.category; });
        if (!group) {
          group = { name: item.category, items: [] };
          groups.push(group);
        }
        group.items.push(item);
      });

      menuRoot.innerHTML = groups.map(function (group) {
        return (
          '<section class="menu-group"><h2>' + DX.escapeHtml(group.name) + "</h2><div class=\"menu-grid\">" +
          group.items.map(dishCard).join("") +
          "</div></section>"
        );
      }).join("");
    }

    function dishCard(item) {
      var shape = "";
      if (item.shapes) {
        shape =
          '<label class="shape">Pâtes<select data-shape>' +
          item.shapes.map(function (name) { return "<option>" + name + "</option>"; }).join("") +
          "</select></label>";
      }
      var veg = item.veg ? '<span class="tag">Végétarien</span>' : "";
      return (
        '<article class="dish" id="item-' + item.id + '">' +
          photoHtml(item) +
          '<div class="dish-body">' +
            '<div class="dish-top"><p class="dish-cat">' + veg + "</p><strong class=\"price\">" + DX.formatDh(item.price) + "</strong></div>" +
            "<h3>" + DX.escapeHtml(item.name) + "</h3>" +
            '<p title="' + DX.escapeHtml(item.desc) + '">' + DX.escapeHtml(item.desc) + "</p>" +
            shape +
            '<div class="dish-foot"><button class="btn btn-dark" type="button" data-add="' + item.id + '">Ajouter</button></div>' +
          "</div>" +
        "</article>"
      );
    }

    function paintLines(cart) {
      if (!cart.length) {
        linesRoot.innerHTML = '<p class="cart-empty">Aucun plat pour le moment.</p>';
        return;
      }
      linesRoot.innerHTML = cart.map(function (item, index) {
        var note = item.note ? '<span class="line-note">' + DX.escapeHtml(item.note) + "</span>" : "";
        var src = item.img || DX.photo(item.id);
        var thumb = src ? '<img class="line-photo" src="' + src + '" alt="" referrerpolicy="no-referrer">' : "";
        return (
          '<div class="line">' +
            '<div class="line-main">' + thumb + "<div><strong>" + DX.escapeHtml(item.name) + "</strong>" + note + "</div></div>" +
            '<div class="line-right">' +
              '<div class="qty">' +
                '<button type="button" data-dec="' + index + '" aria-label="Diminuer">−</button>' +
                "<span>" + item.qty + "</span>" +
                '<button type="button" data-inc="' + index + '" aria-label="Augmenter">+</button>' +
              "</div>" +
              "<b>" + DX.formatDh(item.price * item.qty) + "</b>" +
            "</div>" +
          "</div>"
        );
      }).join("");
    }

    function paintTotals(cart) {
      var sub = DX.subtotal(cart);
      var feeKnown = !!quote && cart.length > 0;
      var total = sub + (feeKnown ? quote.fee : 0);
      totalsRoot.innerHTML =
        '<div class="totals">' +
          "<div><span>Sous-total</span><strong>" + DX.formatDh(sub) + "</strong></div>" +
          "<div><span>Livraison</span><strong>" + (feeKnown ? DX.formatDh(quote.fee) : "—") + "</strong></div>" +
          '<div class="totals-grand"><span>' + (feeKnown ? "Total" : "Total hors livraison") + "</span><strong>" + DX.formatDh(total) + "</strong></div>" +
        "</div>";
      var bar = document.querySelector("[data-bar-total]");
      if (bar) bar.textContent = DX.formatDh(feeKnown ? total : sub);
      var recap = document.getElementById("order-recap");
      if (recap) {
        recap.innerHTML = feeKnown
          ? "<div class=\"totals\"><div><span>Plats " + DX.formatDh(sub) + "</span><strong>Livraison " + DX.formatDh(quote.fee) + "</strong></div><div class=\"totals-grand\"><span>À payer</span><strong>" + DX.formatDh(total) + "</strong></div></div>"
          : "";
      }
      var count = document.querySelector("[data-bar-count]");
      if (count) count.textContent = DX.cartCount(cart) + (DX.cartCount(cart) > 1 ? " articles" : " article");
    }

    function openCart() {
      document.body.classList.add("cart-open");
      var aside = document.getElementById("panier");
      if (aside) aside.classList.add("is-open");
      var backdrop = document.querySelector("[data-backdrop]");
      if (backdrop) backdrop.hidden = false;
    }

    function closeCart() {
      document.body.classList.remove("cart-open");
      var aside = document.getElementById("panier");
      if (aside) aside.classList.remove("is-open");
      var backdrop = document.querySelector("[data-backdrop]");
      if (backdrop) backdrop.hidden = true;
    }

    chipsRoot.addEventListener("click", function (event) {
      var button = event.target.closest("[data-cat]");
      if (!button) return;
      active = button.getAttribute("data-cat");
      chipsRoot.querySelectorAll(".chip").forEach(function (chip) {
        chip.classList.toggle("is-on", chip === button);
      });
      renderMenu();
    });

    search.addEventListener("input", renderMenu);

    menuRoot.addEventListener("click", function (event) {
      var button = event.target.closest("[data-add]");
      if (!button) return;
      var product = DX.findItem(button.getAttribute("data-add"));
      if (!product) return;
      var selected = button.closest(".dish").querySelector("[data-shape]");
      DX.addItem(product, selected ? selected.value : "");
      var previous = button.textContent;
      button.textContent = "Ajouté";
      window.setTimeout(function () { button.textContent = previous; }, 700);
    });

    linesRoot.addEventListener("click", function (event) {
      var inc = event.target.closest("[data-inc]");
      var dec = event.target.closest("[data-dec]");
      if (inc) DX.changeQty(Number(inc.getAttribute("data-inc")), 1);
      if (dec) DX.changeQty(Number(dec.getAttribute("data-dec")), -1);
    });

    document.querySelectorAll("[data-open-cart]").forEach(function (button) {
      button.addEventListener("click", openCart);
    });
    document.querySelectorAll("[data-close-cart], [data-backdrop]").forEach(function (button) {
      button.addEventListener("click", closeCart);
    });
    document.querySelectorAll("[data-go-address]").forEach(function (link) {
      link.addEventListener("click", closeCart);
    });

    var form = document.getElementById("checkout");
    ["name", "phone", "note"].forEach(function (field) {
      var input = form.elements[field];
      try {
        var saved = sessionStorage.getItem("dx-" + field);
        if (saved) input.value = saved;
      } catch (error) {}
      input.addEventListener("input", function () {
        try { sessionStorage.setItem("dx-" + field, input.value); } catch (error) {}
      });
    });

    var error = form.querySelector("[data-error]");
    function showError(message) {
      error.hidden = false;
      error.textContent = message;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      error.hidden = true;
      var cart = DX.getCart();
      var name = String(new FormData(form).get("name") || "").trim();
      var phone = String(new FormData(form).get("phone") || "").trim();
      var note = String(new FormData(form).get("note") || "").trim();
      if (!cart.length && (place.menu.length || note.length < 3)) {
        showError(place.menu.length ? "Ajoutez au moins un plat." : "Décrivez la commande dans le champ indication.");
        return;
      }
      var cartPlace = DX.cartPlaceId(cart) || "gucciano";
      if (cart.length && cartPlace !== place.id) {
        showError("Le panier contient une autre enseigne. Ouvrez sa carte, ou ajoutez un plat ici pour le remplacer.");
        return;
      }
      if (!quote) {
        showError("Indiquez où livrer : partagez votre position ou cliquez sur la carte.");
        document.getElementById("adresse").scrollIntoView({ behavior: "smooth" });
        return;
      }
      if (name.length < 2) {
        showError("Indiquez le nom pour la livraison.");
        return;
      }
      if (phone.replace(/\D/g, "").length < 8) {
        showError("Indiquez un numéro de téléphone valide.");
        return;
      }

      var lines = cart.map(function (item) {
        var extra = item.note ? " (" + item.note + ")" : "";
        return "• " + item.qty + " × " + item.name + extra + " — " + item.qty * item.price + " DH";
      });
      var sub = DX.subtotal(cart);
      var text = [
        "Commande Delivery Express",
        place.name + " — " + place.address,
        "",
        lines.length ? lines.join("\n") : "Commande : " + note,
        "",
        lines.length ? "Sous-total : " + sub + " DH" : "Montant des plats : à confirmer",
        "Livraison : " + quote.fee + " DH",
        "Distance : " + DX.formatKm(quote.km) + (quote.method === "route" ? " (route)" : " (estimation)"),
        "Zone : " + quote.zone,
        lines.length ? "Total : " + (sub + quote.fee) + " DH" : "Frais de route : " + quote.fee + " DH",
        "",
        "Client : " + name,
        "Téléphone : " + phone,
        "Lieu : " + quote.label,
        "Maps : https://maps.google.com/?q=" + quote.lat + "," + quote.lng,
        lines.length && note ? "Note : " + note : ""
      ].filter(function (line) { return line !== ""; }).join("\n");

      var url = "https://wa.me/" + DX.RESTAURANT.whatsapp + "?text=" + encodeURIComponent(text);
      var opened = window.open(url, "_blank", "noopener");
      if (!opened) {
        error.hidden = false;
        error.textContent = "";
        error.appendChild(document.createTextNode("Le navigateur a bloqué la fenêtre. "));
        var anchor = document.createElement("a");
        anchor.href = url;
        anchor.target = "_blank";
        anchor.rel = "noopener";
        anchor.textContent = "Ouvrir WhatsApp";
        error.appendChild(anchor);
      }
    });

    DX.onCart(function (cart) {
      paintLines(cart);
      paintTotals(cart);
    });
    renderMenu();
    if (!place.menu.length) {
      chipsRoot.hidden = true;
      var tools = search.closest(".menu-tools");
      if (tools) tools.hidden = true;
      menuRoot.innerHTML = '<p class="empty-filter">Pas de carte tarifée pour cette enseigne. Décrivez les articles dans le champ indication, sous la carte.</p>';
      form.elements.note.required = true;
      form.elements.note.placeholder = "Plats, taille, quantité, ou ce qu’il faut récupérer.";
    }

    if (window.L) {
      DX.mountDeliveryMap(document.getElementById("map-root"), {
        slot: form,
        place: place,
        onQuote: function (next) {
          quote = next;
          paintTotals(DX.getCart());
        }
      });
    }

    if (location.hash === "#panier" && window.matchMedia("(max-width: 980px)").matches) {
      openCart();
    } else if (location.hash) {
      window.setTimeout(function () {
        var target = document.querySelector(location.hash);
        if (target) target.scrollIntoView({ block: "center" });
      }, 80);
    }
  }

  function initContact() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    var error = form.querySelector("[data-error]");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(form);
      var name = String(data.get("name") || "").trim();
      var phone = String(data.get("phone") || "").trim();
      var message = String(data.get("message") || "").trim();
      if (name.length < 2 || message.length < 3) {
        error.hidden = false;
        error.textContent = "Indiquez votre nom et un message.";
        return;
      }
      error.hidden = true;
      var text = "Bonjour Delivery Express,\n" + name + (phone ? " — " + phone : "") + "\n\n" + message;
      window.open("https://wa.me/" + DX.RESTAURANT.whatsapp + "?text=" + encodeURIComponent(text), "_blank", "noopener");
    });
    if (window.L) DX.mountRestaurantMap(document.getElementById("pin-map"));
  }

  mountChrome();
  renderPopular();
  renderPlaces();
  renderExamples();

  if (page === "home" && window.L) {
    DX.mountDeliveryMap(document.getElementById("map-root"), { chooseOrigin: true });
  }
  if (page === "livraison" && window.L) {
    DX.mountDeliveryMap(document.getElementById("map-root"), { chooseOrigin: true });
  }
  if (page === "carte") initCarte();
  if (page === "contact") initContact();

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var nav = document.querySelector("[data-nav]");
    if (nav) nav.classList.remove("is-open");
    var toggle = document.querySelector("[data-nav-toggle]");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("cart-open");
    var aside = document.getElementById("panier");
    if (aside) aside.classList.remove("is-open");
    var backdrop = document.querySelector("[data-backdrop]");
    if (backdrop) backdrop.hidden = true;
  });
})();
