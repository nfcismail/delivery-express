(function () {
  var DX = (window.DX = window.DX || {});

  DX.RESTAURANT = {
    name: "Gucciano Lab",
    address: "30 Boulevard Moulay Rachid, Guéliz, Marrakech",
    lat: 31.632693,
    lng: -8.014177,
    whatsapp: "212651992715",
    whatsappDisplay: "+212 651-992715",
    email: "contact@guccianolab.ma",
    site: "https://guccianolab.ma/menu/"
  };

  DX.CATEGORIES = [
    "Pizzas Rossa",
    "Pizzas Blanches",
    "Signatures du chef",
    "Schiacciate",
    "Panuzzo",
    "Salades et entrées",
    "Pâtes",
    "Formules",
    "Desserts",
    "Boissons",
    "Suppléments"
  ];

  var pasta = ["Tagliatelle", "Spaghetti", "Penne"];

  DX.MENU = [
    { id: "primavera", category: "Pizzas Rossa", name: "Primavera", price: 180, veg: true, popular: true, desc: "Sauce tomate, mozzarella, courgettes et poivrons grillés, burrata, tomates cerises, balsamique, basilic, huile d'olive." },
    { id: "florencia", category: "Pizzas Rossa", name: "Florencia", price: 90, veg: true, popular: true, desc: "Sauce tomate, mozzarella, olives fraîches, basilic, origan, huile d'olive extra vierge." },
    { id: "toscane", category: "Pizzas Rossa", name: "Toscane Pepperoni", price: 115, popular: true, desc: "Sauce tomate, mozzarella, pepperoni, puis ricotta, olives noires, parmesan et huile d'olive." },
    { id: "turino", category: "Pizzas Rossa", name: "Turino Thon", price: 125, popular: true, desc: "Sauce tomate, mozzarella, oignons doux, thon, câpres, tomates cerises, olives noires, ciboulette, parmesan." },
    { id: "verdura", category: "Pizzas Rossa", name: "Verdura", price: 125, veg: true, desc: "Sauce tomate, mozzarella, aubergines, courgettes, champignons, poivrons, roquette, tomates cerises, parmesan, crème balsamique." },
    { id: "agliana", category: "Pizzas Rossa", name: "Agliana", price: 125, desc: "Sauce tomate, mozzarella, champignons frais, jambon de dinde, roquette, crème balsamique, huile d'olive." },
    { id: "rustica", category: "Pizzas Rossa", name: "Rustica", price: 145, desc: "Sauce tomate, bœuf haché, jambon de dinde, ricotta, pistaches, roquette, olives noires, pesto, crème balsamique." },

    { id: "fineri", category: "Pizzas Blanches", name: "Fineri Champignon", price: 135, veg: true, desc: "Sauce blanche, mozzarella, champignons de saison, ricotta et huile de truffe." },
    { id: "veronne", category: "Pizzas Blanches", name: "Veronne 4 Fromages", price: 115, veg: true, popular: true, desc: "Sauce blanche, mozzarella, gorgonzola, parmesan, ricotta et huile d'olive." },
    { id: "regina", category: "Pizzas Blanches", name: "Regina Chèvre", price: 115, veg: true, desc: "Sauce blanche, mozzarella, chèvre, pignons, miel, thym et huile d'olive." },
    { id: "parmigiana", category: "Pizzas Blanches", name: "Parmigiana", price: 135, veg: true, desc: "Sauce blanche, aubergines fondantes, mozzarella, ricotta, parmesan et ciboulette." },
    { id: "flora", category: "Pizzas Blanches", name: "Flora Saumon", price: 155, desc: "Sauce blanche, mozzarella, saumon fumé, citron, ciboulette et huile d'olive." },

    { id: "pizzoli", category: "Signatures du chef", name: "Pizzoli Création", price: 145, desc: "Pizza fermée, cuite en deux temps. Sauce tomate, mozzarella, jambon de dinde, roquette, parmesan, huile de truffe, crème balsamique." },
    { id: "ovobello", category: "Signatures du chef", name: "Ovobello", price: 130, veg: true, desc: "Sauce blanche, mozzarella, œuf, fromage bleu, champignons de saison et roquette." },
    { id: "verde-pesto", category: "Signatures du chef", name: "Verde Pesto", price: 135, veg: true, desc: "Pesto maison, mozzarella, courgettes et oignons grillés, tomates cerises, olives noires, parmesan, roquette." },

    { id: "schiacciata-burrata", category: "Schiacciate", name: "Schiacciata Burrata", price: 160, veg: true, desc: "Pâte fine et croustillante, burrata, tomates cerises, roquette, pesto, parmesan, huile d'olive." },
    { id: "schiacciata-sol", category: "Schiacciate", name: "Schiacciata del Sol", price: 105, veg: true, desc: "Pâte fine, aubergines, courgettes, poivrons, oignon rouge, olives noires, câpres et pesto." },

    { id: "panuzzo-thon", category: "Panuzzo", name: "Panuzzo Thon", price: 110, desc: "Panuozzo cuit au feu de bois, pesto, thon, tomates cerises, oignon, parmesan et huile d'olive." },
    { id: "panuzzo-tartufo", category: "Panuzzo", name: "Panuzzo Tartufo", price: 120, desc: "Jambon de dinde, roquette, tomates cerises, parmesan, huile de truffe et crème balsamique." },
    { id: "panuzzo-gucciano", category: "Panuzzo", name: "Panuzzo Gucciano", price: 155, desc: "Burrata, jambon de dinde, roquette, parmesan, huile de truffe et crème balsamique." },

    { id: "bella", category: "Salades et entrées", name: "Bella Burrata", price: 135, veg: true, desc: "Burrata, roquette, tomates fraîches et cerises, pesto maison au basilic et pignons." },
    { id: "capri", category: "Salades et entrées", name: "Salade Capri", price: 110, veg: true, desc: "Mozzarella, tomates, roquette, basilic et pesto aux pignons." },
    { id: "pomodoro", category: "Salades et entrées", name: "Salade Pomodoro", price: 115, veg: true, desc: "Pâte croustillante, tomates, ricotta, roquette, pesto et parmesan." },
    { id: "chella", category: "Salades et entrées", name: "Salade Chella", price: 115, veg: true, desc: "Pâte croustillante, tomates cerises, olives noires, ricotta, roquette, huile de truffe, parmesan." },
    { id: "focaccia", category: "Salades et entrées", name: "Focaccia maison", price: 25, veg: true, desc: "Pâte à pizza dorée au four à bois, huile d'olive extra vierge." },
    { id: "focaccia-ail", category: "Salades et entrées", name: "Focaccia à l'ail", price: 35, veg: true, desc: "Focaccia au four à bois, servie avec une sauce à l'ail." },

    { id: "bianco", category: "Pâtes", name: "Bianco Romano", price: 85, shapes: pasta, desc: "Crème, ail, oignon, jambon de dinde, œuf, parmesan et beurre." },
    { id: "tonno", category: "Pâtes", name: "Tonno Tradizionale", price: 90, shapes: pasta, desc: "Sauce tomate, thon, ail, oignon, ciboulette et huile d'olive." },
    { id: "bolognese", category: "Pâtes", name: "Vera Bolognese", price: 95, shapes: pasta, desc: "Bolognaise mijotée, bœuf haché, ail, oignon, tomates cerises et ciboulette." },
    { id: "sicilia", category: "Pâtes", name: "Verde de Sicilia", price: 105, veg: true, shapes: pasta, desc: "Crème et pesto, ail, fromage bleu, parmesan, pistaches et huile d'olive." },
    { id: "saumon-pasta", category: "Pâtes", name: "Saumon al Limone", price: 120, shapes: pasta, desc: "Beurre, crème, ail, saumon, parmesan et citron." },

    { id: "gouter", category: "Formules", name: "Formule Goûter", price: 45, veg: true, desc: "Le dessert au choix et une boisson offerte. Précisez les deux dans la note de commande." },
    { id: "enfant", category: "Formules", name: "Menu Enfant", price: 50, desc: "Pizza moyenne au choix : Florencia, Toscane Pepperoni, Regina Chèvre ou Veronne 4 Fromages, avec une boisson." },

    { id: "tiramisu", category: "Desserts", name: "Tiramisu Gucciano", price: 45, veg: true, popular: true, desc: "Tiramisu maison, mascarpone, œufs frais, café espresso et cacao." },
    { id: "mousse", category: "Desserts", name: "Mousse au chocolat", price: 45, veg: true, desc: "Mousse maison au chocolat noir et aux œufs frais." },

    { id: "eau", category: "Boissons", name: "Eau filtrée", price: 20, veg: true, desc: "Bouteille verre 1 litre, filtrée puis reminéralisée." },
    { id: "coca", category: "Boissons", name: "Coca-Cola", price: 25, veg: true, desc: "Canette 33 cl." },
    { id: "coca-zero", category: "Boissons", name: "Coca-Cola Zero", price: 25, veg: true, desc: "Canette 33 cl." },
    { id: "sprite", category: "Boissons", name: "Sprite", price: 25, veg: true, desc: "Canette 33 cl." },
    { id: "schweppes", category: "Boissons", name: "Schweppes Citron", price: 25, veg: true, desc: "Canette 33 cl." },
    { id: "hawai", category: "Boissons", name: "Hawaï Tropical", price: 25, veg: true, desc: "Canette 33 cl." },
    { id: "oulmes", category: "Boissons", name: "Oulmès", price: 25, veg: true, desc: "Eau gazeuse, 50 cl." },
    { id: "espresso", category: "Boissons", name: "Espresso", price: 20, veg: true, desc: "Café espresso." },
    { id: "double-espresso", category: "Boissons", name: "Double espresso", price: 30, veg: true, desc: "Double café espresso." },
    { id: "allonge", category: "Boissons", name: "Café allongé", price: 30, veg: true, desc: "Café allongé." },
    { id: "the-vert", category: "Boissons", name: "Thé vert", price: 30, veg: true, desc: "Thé vert Tchaba." },
    { id: "the-noir", category: "Boissons", name: "Thé noir", price: 30, veg: true, desc: "Thé noir Tchaba." },
    { id: "infusion", category: "Boissons", name: "Infusion", price: 30, veg: true, desc: "Infusion Tchaba, menthe poivrée." },

    { id: "supp", category: "Suppléments", name: "Supplément au choix", price: 25, veg: true, desc: "Un ingrédient à ajouter sur une pizza ou une salade. Précisez-le dans la note." },
    { id: "supp-boeuf", category: "Suppléments", name: "Bœuf haché maison", price: 60, desc: "Bœuf haché frais, préparé maison." },
    { id: "supp-burrata", category: "Suppléments", name: "Burrata", price: 80, veg: true, desc: "Burrata fraîche en supplément." }
  ];

  DX.popularItems = function () {
    return ["toscane", "florencia", "primavera", "turino", "veronne", "tiramisu"]
      .map(function (id) {
        return DX.MENU.find(function (item) { return item.id === id; });
      })
      .filter(Boolean);
  };

  DX.findItem = function (id) {
    return DX.MENU.find(function (item) { return item.id === id; });
  };

  DX.PHOTOS = {
    primavera: "primavera.webp",
    florencia: "florencia.webp",
    toscane: "toscane-pepperoni.webp",
    turino: "turino-thon.webp",
    verdura: "verdura-vg.webp",
    agliana: "agliana.webp",
    rustica: "rustica.webp",
    fineri: "fineri-champignon.webp",
    veronne: "veronne-4-fromages.webp",
    regina: "regina-chevre.webp",
    parmigiana: "parmigiana.webp",
    flora: "flora-saumon.webp",
    pizzoli: "pizzoli-creation-signature-du-chef.webp",
    ovobello: "ovobello-signature-du-chef.webp",
    "verde-pesto": "verde-pesto-signature-du-chef.webp",
    "schiacciata-burrata": "schiacciata-burrata.webp",
    "schiacciata-sol": "schiacciata-del-sol.webp",
    "panuzzo-thon": "panuzzo-thon.webp",
    "panuzzo-tartufo": "panuzzo-tartufo.webp",
    "panuzzo-gucciano": "panuzzo-gucciano.webp",
    bella: "bella-burrata.webp",
    capri: "salade-capri.webp",
    pomodoro: "salade-pomodoro.webp",
    chella: "salade-chella.webp",
    focaccia: "focaccia-maison.webp",
    "focaccia-ail": "focaccia-ail.webp",
    bianco: "bianco-romano.webp",
    tonno: "tonno-tradizionale.webp",
    bolognese: "vera-bolognese.webp",
    sicilia: "verde-de-sicilia.webp",
    "saumon-pasta": "saumon-al-limone.webp",
    gouter: "formule-gouter.webp",
    enfant: "menu-enfant.webp",
    tiramisu: "tiramisu-gucciano.webp",
    mousse: "mousse-au-chocolat.webp",
    "supp-burrata": "bella-burrata.webp"
  };

  DX.photo = function (id) {
    return DX.PHOTOS[id] ? "assets/menu/" + DX.PHOTOS[id] : "";
  };
})();
