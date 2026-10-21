(function () {
  var DX = (window.DX = window.DX || {});

  // Barème, plafond inclus, distance arrondie au dixième :
  // 0 à 2,5 km → 20 DH
  // ≤ 4 km → 30 DH
  // ≤ 6 km → 35 DH
  // ≤ 8 km → 40 DH
  // ≤ 10 km → 50 DH
  // au-delà de 10 km → 50 DH + 5 DH/km (le pas entre 8 et 10 km)
  DX.PER_KM_AFTER_10 = 5;

  DX.ZONES = [
    { range: "0 – 2,5 km", price: "20 DH", note: "Forfait" },
    { range: "≤ 4 km", price: "30 DH", note: "Forfait" },
    { range: "≤ 6 km", price: "35 DH", note: "Forfait" },
    { range: "≤ 8 km", price: "40 DH", note: "Forfait" },
    { range: "≤ 10 km", price: "50 DH", note: "Forfait" },
    { range: "Après 10 km", price: "+ 5 DH/km", note: "En plus des 50 DH" }
  ];

  var BANDS = [
    { max: 2.5, fee: 20, zone: "0 – 2,5 km", detail: "Forfait de 0 à 2,5 km" },
    { max: 4, fee: 30, zone: "≤ 4 km", detail: "Forfait jusqu'à 4 km" },
    { max: 6, fee: 35, zone: "≤ 6 km", detail: "Forfait jusqu'à 6 km" },
    { max: 8, fee: 40, zone: "≤ 8 km", detail: "Forfait jusqu'à 8 km" },
    { max: 10, fee: 50, zone: "≤ 10 km", detail: "Forfait jusqu'à 10 km" }
  ];

  DX.quoteDelivery = function (km) {
    var distance = Math.round(Number(km) * 10) / 10;
    if (!isFinite(distance) || distance < 0) distance = 0;

    var band = BANDS.find(function (entry) { return distance <= entry.max; });
    if (band) {
      return {
        km: distance,
        fee: band.fee,
        zone: band.zone,
        detail: band.detail
      };
    }

    var extra = Math.round((distance - 10) * 10) / 10;
    var perKm = DX.PER_KM_AFTER_10;
    return {
      km: distance,
      fee: Math.round(50 + extra * perKm),
      zone: "Plus de 10 km",
      detail: "50 DH + " + perKm + " DH par kilomètre au-delà de 10 km",
      perKm: perKm,
      extraKm: extra,
      base: 50
    };
  };

  DX.estimateArrival = function (km) {
    var min = 20 + Math.ceil(Number(km) * 3);
    return min + "–" + (min + 12) + " min";
  };

  DX.haversineKm = function (a, b) {
    var earth = 6371;
    var dLat = ((b.lat - a.lat) * Math.PI) / 180;
    var dLng = ((b.lng - a.lng) * Math.PI) / 180;
    var lat1 = (a.lat * Math.PI) / 180;
    var lat2 = (b.lat * Math.PI) / 180;
    var h =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * earth * Math.asin(Math.min(1, Math.sqrt(h)));
  };

  DX.formatDh = function (amount) {
    return Math.round(Number(amount) || 0).toLocaleString("fr-FR") + " DH";
  };

  DX.formatKm = function (km) {
    return Number(km).toLocaleString("fr-FR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }) + " km";
  };

  DX.escapeHtml = function (value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };
})();
