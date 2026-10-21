(function () {
  var DX = (window.DX = window.DX || {});
  var DEST_KEY = "dx-dest-v1";
  var SHOP_KEY = "dx-shop-v1";

  function loadDest() {
    try {
      return JSON.parse(sessionStorage.getItem(DEST_KEY) || "null");
    } catch (error) {
      return null;
    }
  }

  function saveDest(dest) {
    try {
      if (dest) sessionStorage.setItem(DEST_KEY, JSON.stringify(dest));
      else sessionStorage.removeItem(DEST_KEY);
    } catch (error) {}
  }

  function loadShop() {
    try {
      return JSON.parse(sessionStorage.getItem(SHOP_KEY) || "null");
    } catch (error) {
      return null;
    }
  }

  function saveShop(shop) {
    try {
      if (shop) sessionStorage.setItem(SHOP_KEY, JSON.stringify(shop));
      else sessionStorage.removeItem(SHOP_KEY);
    } catch (error) {}
  }

  function tiles(map) {
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19
    }).addTo(map);
  }

  function pin(kind) {
    return L.divIcon({
      className: "dx-pin",
      html: '<span class="pin ' + kind + '"></span>',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
  }

  DX.mountRestaurantMap = function (el) {
    if (!window.L || !el) return;
    var spots = (DX.PARTNERS || []).filter(function (place) { return !place.customOrigin; });
    if (!spots.length) spots = [DX.RESTAURANT];
    var map = L.map(el, { scrollWheelZoom: false }).setView([spots[0].lat, spots[0].lng], 13);
    tiles(map);
    var bounds = [];
    spots.forEach(function (place) {
      L.marker([place.lat, place.lng], { icon: pin("pin-rest") })
        .addTo(map)
        .bindTooltip(place.name, { direction: "top", offset: [0, -8], className: "map-label" });
      bounds.push([place.lat, place.lng]);
    });
    if (bounds.length > 1) map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 });
    setTimeout(function () { map.invalidateSize(); }, 200);
  };

  DX.mountDeliveryMap = function (root, options) {
    options = options || {};
    if (!root) return;
    if (!window.L) {
      root.innerHTML = '<p class="delivery-status">La carte ne s’est pas chargée. Vérifiez la connexion, puis rechargez la page.</p>';
      return;
    }

    var place = options.place || (DX.activePlace ? DX.activePlace() : DX.RESTAURANT);
    if (options.chooseOrigin && place.home === false && DX.PARTNERS && DX.PARTNERS[0]) place = DX.PARTNERS[0];
    var origin = { lat: place.lat, lng: place.lng, label: place.name };
    var originReady = !place.customOrigin;
    if (place.customOrigin) {
      var remembered = loadShop();
      if (remembered && remembered.placeId === place.id && isFinite(remembered.lat)) {
        origin = { lat: remembered.lat, lng: remembered.lng, label: remembered.label || place.name };
        originReady = true;
      }
    }

    root.classList.add("delivery");
    var originSelect = "";
    if (options.chooseOrigin && DX.PARTNERS) {
      originSelect =
        '<label class="origin-pick">Restaurant de départ' +
          '<select data-origin>' +
            DX.PARTNERS.map(function (item) {
              return '<option value="' + DX.escapeHtml(item.id) + '"' + (item.id === place.id ? " selected" : "") + ">" +
                DX.escapeHtml(item.name) + " — " + DX.escapeHtml(item.address) +
              "</option>";
            }).join("") +
          "</select>" +
        "</label>";
    }
    root.innerHTML =
      originSelect +
      '<div class="delivery-bar">' +
        '<form class="search" data-search>' +
          '<label class="sr-only" for="address-query">Adresse de livraison</label>' +
          '<input id="address-query" type="search" name="q" placeholder="Quartier, rue, hôtel, lieu à Marrakech…" autocomplete="off">' +
          '<button class="btn btn-dark" type="submit">Chercher</button>' +
        "</form>" +
        '<div class="delivery-actions">' +
          '<button class="btn btn-accent" type="button" data-locate>Partager ma position</button>' +
          '<button class="btn btn-line" type="button" data-clear>Effacer</button>' +
        "</div>" +
      "</div>" +
      '<div class="delivery-results" data-results hidden></div>' +
      '<p class="delivery-status" data-status></p>' +
      '<div class="delivery-stage">' +
        '<div class="map" data-map></div>' +
        '<div class="delivery-side">' +
          '<div data-receipt></div>' +
          '<div class="delivery-slot" data-slot></div>' +
        "</div>" +
      "</div>" +
      '<ul class="zone-legend">' +
        '<li><i class="swatch s2"></i>2,5 km</li>' +
        '<li><i class="swatch s5"></i>6 km</li>' +
        '<li><i class="swatch s8"></i>10 km</li>' +
        "<li>Les cercles sont à vol d’oiseau. Le prix suit la route.</li>" +
      "</ul>";

    if (options.slot) root.querySelector("[data-slot]").appendChild(options.slot);

    var statusEl = root.querySelector("[data-status]");
    var resultsEl = root.querySelector("[data-results]");
    var receiptEl = root.querySelector("[data-receipt]");
    var mapEl = root.querySelector("[data-map]");
    var map = L.map(mapEl, { zoomControl: true }).setView([origin.lat, origin.lng], 12);
    tiles(map);
    var zones = L.layerGroup().addTo(map);
    var originMarker = null;

    var customer = null;
    var routeLine = null;
    var requestId = 0;

    function waitingText() {
      if (place.customOrigin && !originReady) {
        return "Cherchez d'abord le commerce de départ, ou cliquez son emplacement. Ensuite, indiquez votre adresse.";
      }
      return "Départ : " + origin.label + ". Partagez votre position, cherchez une adresse, ou cliquez sur la carte.";
    }

    function drawOrigin() {
      zones.clearLayers();
      if (originMarker) {
        map.removeLayer(originMarker);
        originMarker = null;
      }
      if (!originReady) {
        map.setView([place.lat, place.lng], 13);
        return;
      }
      L.circle([origin.lat, origin.lng], { radius: 2500, color: "#3d8c2a", weight: 1.5, fillColor: "#3d8c2a", fillOpacity: 0.06, interactive: false }).addTo(zones);
      L.circle([origin.lat, origin.lng], { radius: 6000, color: "#c47b12", weight: 1.5, fillColor: "#c47b12", fillOpacity: 0.04, interactive: false }).addTo(zones);
      L.circle([origin.lat, origin.lng], { radius: 10000, color: "#ff4d2e", weight: 1.75, fillColor: "#ff4d2e", fillOpacity: 0.04, interactive: false }).addTo(zones);
      originMarker = L.marker([origin.lat, origin.lng], { icon: pin("pin-rest"), zIndexOffset: 400 })
        .addTo(map)
        .bindTooltip(origin.label, { permanent: true, direction: "right", offset: [10, 0], className: "map-label" });
    }

    function setStatus(text) {
      statusEl.textContent = text;
    }

    drawOrigin();
    setStatus(waitingText());

    function renderReceipt(quote) {
      if (!quote) {
        receiptEl.innerHTML =
          '<article class="receipt">' +
            '<p class="receipt-kicker">Frais de livraison</p>' +
            '<p class="receipt-empty">En attente d’une adresse.</p>' +
            "<dl>" +
              DX.ZONES.map(function (zone) {
                return "<div><dt>" + zone.range + "</dt><dd>" + zone.price + "</dd></div>";
              }).join("") +
            "</dl>" +
          "</article>";
        return;
      }

      var method = quote.method === "route" ? "Distance routière" : "Trajet estimé";
      var formula = "";
      if (quote.extraKm != null) {
        formula =
          "<div><dt>Détail</dt><dd>" + quote.base + " DH + " +
          DX.formatKm(quote.extraKm).replace(" km", "") +
          " × " + quote.perKm + " DH</dd></div>";
      }
      var warning = quote.warning ? '<p class="receipt-warn">' + DX.escapeHtml(quote.warning) + "</p>" : "";

      receiptEl.innerHTML =
        '<article class="receipt">' +
          '<p class="receipt-kicker">Frais de livraison</p>' +
          '<p class="receipt-fee">' + DX.formatDh(quote.fee).replace(" DH", "") + " <span>DH</span></p>" +
          '<p class="receipt-zone">Zone ' + DX.escapeHtml(quote.zone) + "</p>" +
          "<dl>" +
            "<div><dt>Distance</dt><dd>" + DX.formatKm(quote.km) + "</dd></div>" +
            "<div><dt>Calcul</dt><dd>" + method + "</dd></div>" +
            "<div><dt>Règle</dt><dd>" + DX.escapeHtml(quote.detail) + "</dd></div>" +
            formula +
            "<div><dt>Arrivée estimée</dt><dd>" + DX.escapeHtml(quote.eta) + "</dd></div>" +
          "</dl>" +
          '<p class="receipt-address">' + DX.escapeHtml(quote.label) + "</p>" +
          warning +
        "</article>";
    }

    function publish(quote) {
      renderReceipt(quote);
      if (typeof options.onQuote === "function") options.onQuote(quote);
    }

    function clearRoute() {
      if (routeLine) {
        map.removeLayer(routeLine);
        routeLine = null;
      }
      if (customer) {
        map.removeLayer(customer);
        customer = null;
      }
    }

    function drawCustomer(lat, lng, label) {
      if (customer) map.removeLayer(customer);
      customer = L.marker([lat, lng], { icon: pin("pin-drop"), zIndexOffset: 500 })
        .addTo(map)
        .bindTooltip(label, { direction: "top", offset: [0, -8], className: "map-label" });
    }

    async function setDestination(lat, lng, label) {
      if (!originReady) {
        setStatus("Choisissez d'abord le commerce de départ.");
        return;
      }
      var ticket = ++requestId;
      drawCustomer(lat, lng, label);
      saveDest({ lat: lat, lng: lng, label: label });
      setStatus("Calcul du trajet…");
      resultsEl.hidden = true;

      var method = "route";
      var km = null;
      try {
        var url =
          "https://router.project-osrm.org/route/v1/driving/" +
          origin.lng + "," + origin.lat + ";" + lng + "," + lat +
          "?overview=full&geometries=geojson";
        var response = await fetch(url);
        if (!response.ok) throw new Error("route");
        var data = await response.json();
        if (!data.routes || !data.routes[0]) throw new Error("route");
        if (ticket !== requestId) return;
        km = data.routes[0].distance / 1000;
        if (routeLine) map.removeLayer(routeLine);
        routeLine = L.geoJSON(data.routes[0].geometry, {
          style: { color: "#ff4d2e", weight: 4, opacity: 0.95 }
        }).addTo(map);
        map.fitBounds(routeLine.getBounds(), { padding: [36, 36], maxZoom: 15 });
      } catch (error) {
        if (ticket !== requestId) return;
        method = "estimate";
        var straight = DX.haversineKm(origin, { lat: lat, lng: lng });
        km = straight * 1.3;
        if (routeLine) map.removeLayer(routeLine);
        routeLine = L.polyline(
          [[origin.lat, origin.lng], [lat, lng]],
          { color: "#ff4d2e", weight: 3, dashArray: "7 8", opacity: 0.9 }
        ).addTo(map);
        map.fitBounds(routeLine.getBounds(), { padding: [36, 36], maxZoom: 15 });
      }

      var quote = DX.quoteDelivery(km);
      quote.method = method;
      quote.lat = lat;
      quote.lng = lng;
      quote.label = label;
      quote.eta = DX.estimateArrival(quote.km);
      quote.warning = "";
      if (method === "estimate") {
        quote.warning = "Le service d’itinéraire n’a pas répondu. Le prix utilise un trajet estimé (distance à vol d’oiseau × 1,3).";
      }
      if (quote.km > 15) {
        quote.warning = (quote.warning ? quote.warning + " " : "") +
          "Distance élevée : le livreur confirme la course sur WhatsApp avant de partir.";
      }
      publish(quote);
      setStatus(method === "route"
        ? "Trajet routier calculé depuis " + origin.label + "."
        : "Itinéraire indisponible : estimation affichée.");
    }

    function clearAll() {
      var hadDrop = !!customer;
      requestId += 1;
      clearRoute();
      saveDest(null);
      publish(null);
      resultsEl.hidden = true;
      resultsEl.innerHTML = "";
      if (place.customOrigin && !hadDrop) {
        originReady = false;
        saveShop(null);
        drawOrigin();
      }
      map.setView([origin.lat, origin.lng], originReady ? 12 : 13);
      setStatus(waitingText());
    }

    function useAsOrigin(lat, lng, label) {
      origin = { lat: lat, lng: lng, label: label };
      originReady = true;
      saveShop({ placeId: place.id, lat: lat, lng: lng, label: label });
      drawOrigin();
      resultsEl.hidden = true;
      resultsEl.innerHTML = "";
      setStatus("Départ : " + label + ". Indiquez maintenant l'adresse de livraison.");
    }

    map.on("click", function (event) {
      if (place.customOrigin && !originReady) {
        useAsOrigin(event.latlng.lat, event.latlng.lng, "Commerce choisi sur la carte");
        return;
      }
      setDestination(event.latlng.lat, event.latlng.lng, "Point choisi sur la carte");
    });

    root.querySelector("[data-locate]").addEventListener("click", function () {
      if (!navigator.geolocation) {
        setStatus("Ce navigateur ne partage pas la position. Cliquez sur la carte.");
        return;
      }
      setStatus("Lecture de votre position…");
      navigator.geolocation.getCurrentPosition(
        function (position) {
          setDestination(position.coords.latitude, position.coords.longitude, "Position partagée");
        },
        function () {
          setStatus("Position refusée. Autorisez la localisation, cherchez une adresse, ou cliquez sur la carte.");
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
      );
    });

    root.querySelector("[data-clear]").addEventListener("click", clearAll);

    root.querySelector("[data-search]").addEventListener("submit", async function (event) {
      event.preventDefault();
      var query = new FormData(event.currentTarget).get("q");
      query = String(query || "").trim();
      if (query.length < 2) {
        setStatus("Écrivez au moins deux lettres : un quartier, une rue, un hôtel.");
        return;
      }
      setStatus("Recherche de l’adresse…");
      try {
        var endpoint = new URL("https://nominatim.openstreetmap.org/search");
        endpoint.searchParams.set("format", "jsonv2");
        endpoint.searchParams.set("q", query);
        endpoint.searchParams.set("countrycodes", "ma");
        endpoint.searchParams.set("limit", "5");
        endpoint.searchParams.set("viewbox", "-8.20,31.75,-7.85,31.50");
        endpoint.searchParams.set("bounded", "0");
        var response = await fetch(endpoint.toString());
        if (!response.ok) throw new Error("search");
        var places = await response.json();
        if (!places.length) {
          resultsEl.hidden = true;
          setStatus("Aucun lieu trouvé. Essayez « Hivernage », « Guéliz » ou « Médina ».");
          return;
        }
        resultsEl.hidden = false;
        resultsEl.innerHTML = places.map(function (item, index) {
          var parts = String(item.display_name || "").split(",").slice(0, 3).join(", ");
          return '<button type="button" data-pick="' + index + '">' + DX.escapeHtml(parts) + "</button>";
        }).join("");
        resultsEl.querySelectorAll("[data-pick]").forEach(function (button) {
          button.addEventListener("click", function () {
            var item = places[Number(button.getAttribute("data-pick"))];
            var parts = String(item.display_name || "").split(",").slice(0, 3).join(", ");
            if (place.customOrigin && !originReady) useAsOrigin(Number(item.lat), Number(item.lon), parts);
            else setDestination(Number(item.lat), Number(item.lon), parts);
          });
        });
        setStatus(place.customOrigin && !originReady ? "Choisissez le commerce de départ." : "Choisissez une adresse dans la liste.");
      } catch (error) {
        setStatus("La recherche d’adresse a échoué. Cliquez directement sur la carte.");
      }
    });

    var originSelect = root.querySelector("[data-origin]");
    if (originSelect) {
      originSelect.addEventListener("change", function () {
        var next = DX.placeById(originSelect.value);
        if (!next) return;
        DX.setPlace(next.id);
        place = next;
        requestId += 1;
        clearRoute();
        publish(null);
        resultsEl.hidden = true;
        resultsEl.innerHTML = "";
        if (next.customOrigin) {
          var shop = loadShop();
          if (shop && shop.placeId === next.id && isFinite(shop.lat) && isFinite(shop.lng)) {
            origin = { lat: shop.lat, lng: shop.lng, label: shop.label || next.name };
            originReady = true;
          } else {
            origin = { lat: next.lat, lng: next.lng, label: next.name };
            originReady = false;
          }
        } else {
          origin = { lat: next.lat, lng: next.lng, label: next.name };
          originReady = true;
        }
        drawOrigin();
        var kept = loadDest();
        if (originReady && kept && isFinite(kept.lat) && isFinite(kept.lng)) {
          setDestination(kept.lat, kept.lng, kept.label || "Adresse enregistrée");
        } else {
          setStatus(waitingText());
        }
      });
    }

    renderReceipt(null);
    var saved = loadDest();
    if (originReady && saved && isFinite(saved.lat) && isFinite(saved.lng)) {
      setDestination(saved.lat, saved.lng, saved.label || "Adresse enregistrée");
    }

    setTimeout(function () { map.invalidateSize(); }, 250);
    window.addEventListener("resize", function () { map.invalidateSize(); });

    return {
      refresh: function () { map.invalidateSize(); }
    };
  };
})();
