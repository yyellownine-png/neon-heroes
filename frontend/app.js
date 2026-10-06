const API = 'https://737c6f7eb3d59c.lhr.life/api';
const UID = 1040432061;

let heroes = [];
let selectedHero = null;

let state = {
    gems: 100,
    coins: 100,
    energy: 30,
    gram: 0,
    chest_tickets: 0,
    hero_fragments: 0,
    level: 1,
    xp: 0,
    owned: []
};

let currentScreen = 'home';

let battle = {
    active: false,
    mission: 1,
    enemy: null,
    playerHp: 0,
    enemyHp: 0,
    maxPlayerHp: 0,
    maxEnemyHp: 0,
    log: [],
    busy: false
};


/* =========================
   TELEGRAM
========================= */

const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}


/* =========================
   HERO DATA
========================= */

const HEROES = {
    1: {
        color: '#00eaff',
        secondary: '#087cff',
        ability: 'NEON SHIELD'
    },
    2: {
        color: '#a855ff',
        secondary: '#ff3d9a',
        ability: 'VOID DASH'
    },
    3: {
        color: '#ff5c7c',
        secondary: '#ff9f43',
        ability: 'PHOENIX BURST'
    },
    4: {
        color: '#ffcf33',
        secondary: '#ff7b00',
        ability: 'CYBER STRIKE'
    },
    5: {
        color: '#36f5a0',
        secondary: '#00aaff',
        ability: 'SHADOW STEP'
    },
    6: {
        color: '#ff3d9a',
        secondary: '#8b5cff',
        ability: 'OVERDRIVE'
    },
    7: {
        color: '#43d9ff',
        secondary: '#a855ff',
        ability: 'ENERGY WAVE'
    },
    8: {
        color: '#ffd84d',
        secondary: '#ff5c36',
        ability: 'POWER RUSH'
    }
};


/* =========================
   HERO SVG ART
========================= */

function heroArt(id = 1) {

    const cfg = HEROES[id] || HEROES[1];

    return `
    <svg viewBox="0 0 300 340"
         xmlns="http://www.w3.org/2000/svg">

        <defs>

            <linearGradient id="armor${id}"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="1">

                <stop offset="0%"
                      stop-color="${cfg.color}"/>

                <stop offset="100%"
                      stop-color="${cfg.secondary}"/>

            </linearGradient>

            <radialGradient id="glow${id}">
                <stop offset="0%"
                      stop-color="${cfg.color}"
                      stop-opacity=".55"/>

                <stop offset="100%"
                      stop-color="${cfg.color}"
                      stop-opacity="0"/>
            </radialGradient>

            <filter id="blur${id}">
                <feGaussianBlur stdDeviation="15"/>
            </filter>

        </defs>

        <circle
            cx="150"
            cy="145"
            r="120"
            fill="url(#glow${id})"
            filter="url(#blur${id})"/>

        <path
            d="M52 330
               C58 250 76 211 105 195
               L195 195
               C224 211 242 250 248 330Z"
            fill="url(#armor${id})"
            opacity=".95"/>

        <path
            d="M85 238
               L215 238
               L235 330
               L65 330Z"
            fill="#0b1020"/>

        <path
            d="M92 232
               L150 270
               L208 232
               L218 320
               L82 320Z"
            fill="url(#armor${id})"
            opacity=".55"/>

        <ellipse
            cx="150"
            cy="140"
            rx="64"
            ry="78"
            fill="#c5d1df"/>

        <path
            d="M89 132
               C89 74 111 45 150 45
               C190 45 215 77 211 134
               C198 112 180 101 150 101
               C120 101 101 113 89 132Z"
            fill="#101525"/>

        <path
            d="M92 111
               C102 65 122 43 151 43
               C183 43 205 65 211 111
               L190 95
               L174 74
               L154 91
               L131 69
               L111 98Z"
            fill="url(#armor${id})"/>

        <path
            d="M105 135
               Q125 120 143 135"
            stroke="#111827"
            stroke-width="7"
            fill="none"
            stroke-linecap="round"/>

        <path
            d="M157 135
               Q176 120 196 135"
            stroke="#111827"
            stroke-width="7"
            fill="none"
            stroke-linecap="round"/>

        <circle
            cx="126"
            cy="137"
            r="4"
            fill="${cfg.color}"/>

        <circle
            cx="177"
            cy="137"
            r="4"
            fill="${cfg.color}"/>

        <path
            d="M132 169
               Q150 181 169 169"
            stroke="#7f8da3"
            stroke-width="4"
            fill="none"
            stroke-linecap="round"/>

        <path
            d="M150 215
               L150 280"
            stroke="${cfg.color}"
            stroke-width="7"
            opacity=".85"/>

        <circle
            cx="150"
            cy="245"
            r="14"
            fill="${cfg.color}"
            opacity=".9"/>

        <path
            d="M62 270 L20 305"
            stroke="${cfg.secondary}"
            stroke-width="13"
            stroke-linecap="round"/>

        <path
            d="M238 270 L280 305"
            stroke="${cfg.secondary}"
            stroke-width="13"
            stroke-linecap="round"/>

    </svg>`;
}


/* =========================
   PLAYER AVATAR
========================= */

function playerAvatar(name, index = 0) {

    const colors = [
        ['#00eaff','#087cff'],
        ['#a855ff','#ff3d9a'],
        ['#36f5a0','#00aaff'],
        ['#ffd84d','#ff7b00'],
        ['#ff456e','#8b5cff']
    ];

    const c = colors[index % colors.length];

    const letters = String(name || 'P')
        .replace(/[^a-zA-ZА-Яа-я0-9]/g, '')
        .slice(0,2)
        .toUpperCase() || 'P';

    return `
    <div class="player-avatar"
         style="--avatar-a:${c[0]};--avatar-b:${c[1]}">

        <span>${letters}</span>

    </div>`;
}


/* =========================
   POWER ART
========================= */

function powerArt(type = 1) {

    const colors = [
        '#00eaff',
        '#a855ff',
        '#ff3d9a',
        '#ffd84d',
        '#36f5a0'
    ];

    const color = colors[(type - 1) % colors.length];

    return `
    <svg viewBox="0 0 100 100"
         xmlns="http://www.w3.org/2000/svg">

        <circle
            cx="50"
            cy="50"
            r="38"
            fill="${color}"
            opacity=".08"/>

        <circle
            cx="50"
            cy="50"
            r="29"
            fill="none"
            stroke="${color}"
            stroke-width="2"
            opacity=".4"/>

        <path
            d="M57 12
               L27 53
               H47
               L41 88
               L74 43
               H54
               Z"
            fill="${color}"/>

    </svg>`;
}


/* =========================
   API
========================= */

async function api(path, options = {}) {

    try {

        const response = await fetch(API + path, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });

        const text = await response.text();

        if (!text) {
            return {};
        }

        try {
            return JSON.parse(text);
        } catch {
            return {
                error: 'Сервер вернул неправильный ответ'
            };
        }

    } catch (error) {

        console.error(error);

        return {
            error: 'Ошибка соединения с сервером'
        };
    }
}


/* =========================
   LOAD GAME
========================= */

async function loadGame() {

    const heroData = await api('/heroes');

    if (Array.isArray(heroData)) {
        heroes = heroData;
    }

    const stateData = await api('/state/' + UID);

    if (stateData && !stateData.error) {
        state = {
            ...state,
            ...stateData
        };
    }

    if (!heroes.length) {

        heroes = [
            {id:1,name:'Viktor',rarity:'Common',role:'Tank',power:920},
            {id:2,name:'Nyx',rarity:'Rare',role:'Assassin',power:1350},
            {id:3,name:'Mara',rarity:'Rare',role:'Mage',power:1480},
            {id:4,name:'Raven',rarity:'Epic',role:'Assassin',power:2100},
            {id:5,name:'Kael',rarity:'Epic',role:'Warrior',power:2250},
            {id:6,name:'Sable',rarity:'Legendary',role:'Assassin',power:3200},
            {id:7,name:'Iris',rarity:'Legendary',role:'Support',power:3050},
            {id:8,name:'Jax',rarity:'Common',role:'Warrior',power:980}
        ];
    }

    if (!selectedHero) {
        selectedHero = heroes[0];
    }

    updateResources();
    render();
}


/* =========================
   RESOURCES
========================= */

function updateResources() {

    const gems = document.getElementById('gems');
    const coins = document.getElementById('coins');
    const gram = document.getElementById('gram');

    if (gems) {
        gems.textContent = state.gems ?? 0;
    }

    if (coins) {
        coins.textContent = state.coins ?? 0;
    }

    if (gram) {
        gram.textContent = state.gram ?? 0;
    }
}


/* =========================
   NAVIGATION
========================= */

function openScreen(screen) {

    if (battle.active && screen !== 'battle') {

        showMessage('Сначала закончи текущий бой.');

        return;
    }

    currentScreen = screen;

    document
        .querySelectorAll('.nav-btn')
        .forEach(btn => btn.classList.remove('active'));

    const buttons = document.querySelectorAll('.nav-btn');

    if (screen === 'home') buttons[0]?.classList.add('active');
    if (screen === 'heroes') buttons[1]?.classList.add('active');
    if (screen === 'chests') buttons[2]?.classList.add('active');
    if (screen === 'profile') buttons[3]?.classList.add('active');

    render();
}


/* =========================
   RENDER
========================= */

function render() {

    const screen = document.getElementById('screen');

    if (!screen) return;

    if (currentScreen === 'home') {
        screen.innerHTML = homeScreen();
    }

    if (currentScreen === 'heroes') {
        screen.innerHTML = heroesScreen();
    }

    if (currentScreen === 'shop') {
        screen.innerHTML = shopScreen();

        if (!window.SHOP_PRODUCTS) {
            loadShop();
        }
        return;
    }

    if (currentScreen === 'chests') {
        screen.innerHTML = chestsScreen();
    }

    if (currentScreen === 'battle') {
        screen.innerHTML = battleScreen();
    }

    if (currentScreen === 'profile') {
        screen.innerHTML = profileScreen();
    }

    if (currentScreen === 'powers') {
        screen.innerHTML = powersScreen();
    }

    updateResources();
}


/* =========================
   HOME
========================= */

function homeScreen() {

    const hero = selectedHero || heroes[0];

    return `

    <div class="page-title">NEON CITY</div>

    <p class="page-subtitle">
        Выбери героя. Вступай в бой. Поднимайся в рейтинге.
    </p>

    <div class="hero-card">

        <div class="tag">
            ACTIVE HERO
        </div>

        <h1>
            ${hero ? hero.name.toUpperCase() : 'NEON HERO'}
            <br>
            <span>READY.</span>
        </h1>

        <p>
            ${hero
                ? `${hero.role || 'WARRIOR'} • POWER ${hero.power || 0}`
                : 'Твой герой готов к бою.'}
        </p>

        <button
            class="primary-btn"
            onclick="startBattle(1)">

            НАЧАТЬ БОЙ

        </button>

        <div class="hero-symbol">

            ${hero ? heroArt(hero.id) : ''}

        </div>

    </div>

    ${statsBlock()}

    <div class="section-head">
        <h2>ИГРОВОЙ ЦЕНТР</h2>
    </div>

    <div class="quick-grid">

        <button
            class="quick-card"
            onclick="openScreen('heroes')">

            <div class="icon">H</div>

            <b>ГЕРОИ</b>

            <small>
                ${Array.isArray(state.owned)
                    ? state.owned.length
                    : 0}
                собрано
            </small>

        </button>

        <button
            class="quick-card"
            onclick="startBattle(1)">

            <div class="icon">VS</div>

            <b>АРЕНА</b>

            <small>
                Сражения и миссии
            </small>

        </button>

        <button
            class="quick-card"
            onclick="openScreen('shop')">
            <span>SHOP</span>
        </button>

        <button
            class="nav-btn"
            onclick="openScreen('chests')">

            <div class="icon">◆</div>

            <b>СУНДУКИ</b>

            <small>
                Новые герои
            </small>

        </button>

        <button
            class="quick-card"
            onclick="showLeaderboard()">

            <div class="icon">R</div>

            <b>РЕЙТИНГ</b>

            <small>
                Лучшие игроки
            </small>

        </button>

        <button
            class="quick-card"
            onclick="openScreen('powers')">

            <div class="icon">⚡</div>

            <b>СУПЕРСИЛЫ</b>

            <small>
                Способности героев
            </small>

        </button>

        <button
            class="quick-card"
            onclick="openSettings()">

            <div class="icon">⚙</div>

            <b>НАСТРОЙКИ</b>

            <small>
                Игра и аккаунт
            </small>

        </button>

    </div>

    <div class="section-head">

        <h2>ТВОИ ГЕРОИ</h2>

        <span onclick="openScreen('heroes')">
            ВСЕ →
        </span>

    </div>

    <div class="hero-grid">

        ${heroes
            .slice(0,4)
            .map(heroCard)
            .join('')}

    </div>

    `;
}


/* =========================
   STATS
========================= */

function statsBlock() {

    return `

    <div class="stats">

        <div class="stat">
            <b>${state.level ?? 1}</b>
            <small>LEVEL</small>
        </div>

        <div class="stat">
            <b>${state.energy ?? 100}</b>
            <small>ENERGY</small>
        </div>

        <div class="stat">
            <b>${state.xp ?? 0}</b>
            <small>XP</small>
        </div>

    </div>

    `;
}


/* =========================
   HERO CARD
========================= */

function heroCard(hero) {

    const cfg = HEROES[hero.id] || HEROES[1];

    const ability =
        hero.ability ||
        cfg.ability ||
        'NEON STRIKE';

    return `

    <button
        class="hero-item ${selectedHero?.id === hero.id ? 'selected' : ''}"
        onclick="selectHero(${hero.id})">

        <div class="hero-item-art">

            ${heroArt(hero.id)}

            <div class="hero-power">
                ${hero.power || 0}
            </div>

        </div>

        <div class="hero-info">

            <b>${hero.name || 'HERO'}</b>

            <span class="rarity">
                ${(hero.rarity || 'COMMON').toUpperCase()}
            </span>

            <small>
                ${hero.role || 'WARRIOR'}
                •
                ${ability}
            </small>

        </div>

        <div class="hero-select-line">

            ${selectedHero?.id === hero.id
                ? 'ACTIVE HERO'
                : 'ВЫБРАТЬ ГЕРОЯ'}

        </div>

    </button>

    `;
}


/* =========================
   HEROES
========================= */

function heroesScreen() {

    const hero = selectedHero || heroes[0];

    const ability =
        hero?.ability ||
        HEROES[hero?.id]?.ability ||
        'NEON STRIKE';

    return `

    <div class="page-title">
        ГЕРОИ
    </div>

    <p class="page-subtitle">
        Собирай бойцов NEON CITY и усиливай свою команду.
    </p>

    ${hero ? `

    <div class="selected-hero">

        <div class="selected-art">

            ${heroArt(hero.id)}

        </div>

        <div class="selected-info">

            <span class="rarity">
                ${(hero.rarity || 'COMMON').toUpperCase()}
            </span>

            <h2>
                ${hero.name}
            </h2>

            <p>
                ${hero.role || 'WARRIOR'}
            </p>

            <div class="power-line">

                <span>POWER</span>

                <strong>
                    ${hero.power || 0}
                </strong>

            </div>

            <div class="power-line">

                <span>LEVEL</span>

                <strong>
                    ${hero.level || 1}
                </strong>

            </div>

            <button
                class="primary-btn"
                style="width:100%;margin-top:14px;"
                onclick="startBattle(1)">

                В БОЙ

            </button>

        </div>

    </div>

    ` : ''}

    <div class="ability-box">

        <small>
            SUPER POWER
        </small>

        <b>
            ${ability}
        </b>

    </div>

    <div class="section-head">

        <h2>
            КОЛЛЕКЦИЯ
        </h2>

        <span>
            ${heroes.length} ГЕРОЕВ
        </span>

    </div>

    <div class="hero-grid">

        ${heroes.map(heroCard).join('')}

    </div>

    `;
}


/* =========================
   SELECT HERO
========================= */

function selectHero(id) {

    selectedHero =
        heroes.find(h => Number(h.id) === Number(id))
        || heroes[0];

    render();
}


/* =========================
   CHESTS
========================= */


async function loadShop() {
    try {
        const result = await api('/shop');

        window.SHOP_PRODUCTS =
            result.products || [];

        render();

    } catch (e) {
        console.error("SHOP LOAD ERROR", e);
    }
}



/* =========================
   GRAM PAYMENT
========================= */

window.GRAM_PAYMENT = {
    network: "TON",
    gram: 1,
    orderId: null,
    address: "",
    txHash: ""
};

async function loadGramPackages() {
    try {
        const result = await api('/payment/packages');

        window.GRAM_PACKAGES = result.packages || [];
        window.GRAM_ADDRESSES = result.addresses || {};

        openGramPayment();

    } catch (e) {
        console.error("GRAM PACKAGES ERROR", e);
        alert("Payment system unavailable.");
    }
}

function openGramPayment() {

    const packages = window.GRAM_PACKAGES || [];
    const payment = window.GRAM_PAYMENT;

    const modal =
        document.getElementById('modal');

    if (!modal) {
        alert("Payment window unavailable.");
        return;
    }

    modal.innerHTML = `
        <div class="modal-bg">
            <div class="modal gram-payment-modal">

                <button
                    class="modal-close"
                    onclick="closeModal()">
                    ×
                </button>

                <div class="gram-payment-title">
                    BUY GRAM
                </div>

                <div class="gram-payment-subtitle">
                    PREMIUM CURRENCY
                </div>

                <div class="gram-network-switch">

                    <button
                        class="${payment.network === 'TON' ? 'active' : ''}"
                        onclick="selectGramNetwork('TON')">
                        TON
                    </button>

                    <button
                        class="${payment.network === 'USDT_BEP20' ? 'active' : ''}"
                        onclick="selectGramNetwork('USDT_BEP20')">
                        USDT BEP20
                    </button>

                </div>

                <div class="gram-package-grid">

                    ${
                        packages.map(p => `
                            <button
                                class="gram-package ${
                                    Number(payment.gram) === Number(p.gram)
                                        ? 'active'
                                        : ''
                                }"
                                onclick="selectGramPackage(${p.gram})">

                                <strong>
                                    ${p.gram} GRAM
                                </strong>

                                <small>
                                    ${
                                        payment.network === 'TON'
                                            ? p.ton
                                            : p.usdt
                                    }
                                    ${
                                        payment.network === 'TON'
                                            ? ' TON'
                                            : ' USDT'
                                    }
                                </small>

                            </button>
                        `).join("")
                    }

                </div>

                <button
                    class="gram-create-order"
                    onclick="createGramPayment()">
                    CREATE PAYMENT
                </button>

                ${
                    payment.orderId
                    ? `
                        <div class="gram-payment-info">

                            <div class="gram-payment-status">
                                ORDER #${payment.orderId}
                            </div>

                            <div class="gram-address-label">
                                SEND TO
                            </div>

                            <div class="gram-address">
                                ${payment.address}
                            </div>

                            <button
                                class="gram-copy"
                                onclick="copyGramAddress()">
                                COPY ADDRESS
                            </button>

                            <div class="gram-tx-label">
                                TRANSACTION HASH
                            </div>

                            <input
                                id="gramTxHash"
                                class="gram-tx-input"
                                placeholder="Paste TX hash"
                                value="${payment.txHash || ''}"
                                oninput="GRAM_PAYMENT.txHash=this.value.trim()">

                            <button
                                class="gram-verify"
                                onclick="verifyGramPayment()">
                                VERIFY PAYMENT
                            </button>

                        </div>
                    `
                    : ''
                }

            </div>
        </div>
    `;
}

function selectGramNetwork(network) {

    window.GRAM_PAYMENT.network = network;
    window.GRAM_PAYMENT.orderId = null;
    window.GRAM_PAYMENT.address = "";
    window.GRAM_PAYMENT.txHash = "";

    openGramPayment();
}

function selectGramPackage(gram) {

    window.GRAM_PAYMENT.gram = Number(gram);
    window.GRAM_PAYMENT.orderId = null;
    window.GRAM_PAYMENT.address = "";
    window.GRAM_PAYMENT.txHash = "";

    openGramPayment();
}

async function createGramPayment() {

    const payment = window.GRAM_PAYMENT;

    try {

        const result = await api('/payment/create', {
            method: 'POST',
            body: JSON.stringify({
                uid: UID,
                network: payment.network,
                gram_amount: payment.gram
            })
        });

        if (result.error) {
            alert(result.error);
            return;
        }

        payment.orderId = result.order_id;
        payment.address = result.address;

        openGramPayment();

    } catch (e) {

        console.error(e);
        alert("Payment creation failed.");
    }
}

async function copyGramAddress() {

    const address =
        window.GRAM_PAYMENT.address;

    if (!address) return;

    try {

        await navigator.clipboard.writeText(address);

        alert("ADDRESS COPIED");

    } catch (e) {

        alert(address);
    }
}

async function verifyGramPayment() {

    const payment = window.GRAM_PAYMENT;

    const input =
        document.getElementById('gramTxHash');

    const txHash =
        input?.value?.trim() || payment.txHash;

    if (!txHash) {
        alert("ENTER TRANSACTION HASH");
        return;
    }

    payment.txHash = txHash;

    try {

        const result = await api('/payment/verify', {
            method: 'POST',
            body: JSON.stringify({
                uid: UID,
                order_id: payment.orderId,
                tx_hash: txHash
            })
        });

        if (result.error) {
            alert(result.error);
            return;
        }

        if (result.gram !== undefined) {
            state.gram = result.gram;
        }

        alert("PAYMENT VERIFIED\n\nGRAM ADDED");

        closeModal();
        render();

    } catch (e) {

        console.error(e);
        alert("Payment verification failed.");
    }
}

function shopScreen() {

    const products =
        window.SHOP_PRODUCTS || [];

    const groups = {
        gems: products.filter(p => p.type === "gems"),
        energy: products.filter(p => p.type === "energy" || p.type === "energy_full"),
        chests: products.filter(p => p.type === "chest"),
        premium: products.filter(p =>
            ["starter", "weekly", "pass", "season"].includes(p.type)
        )
    };

    const productCard = (p) => `
        <div class="shop-card">

            <div class="shop-icon">
                ${
                    p.type === "gems" ? "💎" :
                    p.type === "energy" || p.type === "energy_full" ? "⚡" :
                    p.type === "chest" ? "🎁" :
                    "👑"
                }
            </div>

            <div class="shop-info">
                <div class="shop-name">
                    ${p.name}
                </div>

                <div class="shop-price">
                    💠 ${p.gram} GRAM
                </div>
            </div>

            <button
                class="shop-buy"
                onclick="buyShopProduct('${p.id}')">
                BUY
            </button>

        </div>
    `;

    return `
        <div class="screen shop-screen">

            <div class="shop-header">
                <div>
                    <div class="shop-title">
                        NEON SHOP
                    </div>

                    <div class="shop-subtitle">
                        PREMIUM STORE
                    </div>
                </div>

                <div class="shop-balance">
                    <span>💠</span>
                    <b>${state.gram || 0}</b>
                    <small>GRAM</small>

                    <button
                        class="gram-buy-button"
                        onclick="loadGramPackages()">
                        + BUY GRAM
                    </button>
                </div>
            </div>

            <section class="shop-section">
                <h3>💎 GEMS</h3>
                <div class="shop-list">
                    ${groups.gems.map(productCard).join("")}
                </div>
            </section>

            <section class="shop-section">
                <h3>⚡ ENERGY</h3>
                <div class="shop-list">
                    ${groups.energy.map(productCard).join("")}
                </div>
            </section>

            <section class="shop-section">
                <h3>🎁 CHESTS</h3>
                <div class="shop-list">
                    ${groups.chests.map(productCard).join("")}
                </div>
            </section>

            <section class="shop-section">
                <h3>👑 PREMIUM</h3>
                <div class="shop-list">
                    ${groups.premium.map(productCard).join("")}
                </div>
            </section>

        </div>
    `;
}


async function buyShopProduct(productId) {

    if (!productId) return;

    const product =
        (window.SHOP_PRODUCTS || [])
        .find(p => p.id === productId);

    if (!product) return;

    if (
        !confirm(
            `Buy ${product.name} for ${product.gram} GRAM?`
        )
    ) {
        return;
    }

    try {

        const result =
            await api('/shop/purchase', {
                method: 'POST',
                body: JSON.stringify({
                    uid: UID,
                    product_id: productId
                })
            });

        if (result.error) {
            alert(result.error);
            return;
        }

        state.gems = result.gems;
        state.coins = result.coins;
        state.energy = result.energy;
        state.gram = result.gram;

        if (window.NEON_AUDIO) {
            window.NEON_AUDIO.click();
        }

        alert(
            `PURCHASE COMPLETE\\n\\n` +
            `${product.name}\\n` +
            `GRAM spent: ${product.gram}`
        );

        render();

    } catch (e) {

        console.error(e);

        alert(
            "Purchase failed."
        );
    }
}


function chestsScreen() {

    const chests = [

        {
            id:'Basic',
            cost:3,
            name:'COMMON CHEST',
            rarity:'ОБЫЧНЫЙ'
        },

        {
            id:'Rare',
            cost:7,
            name:'RARE CHEST',
            rarity:'РЕДКИЙ'
        },

        {
            id:'Epic',
            cost:15,
            name:'EPIC CHEST',
            rarity:'ЭПИЧЕСКИЙ'
        },

        {
            id:'Legendary',
            cost:30,
            name:'LEGENDARY CHEST',
            rarity:'ЛЕГЕНДАРНЫЙ'
        }

    ];

    return `

    <div class="page-title">
        СУНДУКИ
    </div>

    <p class="page-subtitle">
        Открывай сундуки и получай новых героев.
    </p>

    <div class="chest-list">

        ${chests.map(chest => `

        <button
            class="chest-card"
            onclick='openChest(${JSON.stringify(chest)})'>

            <div class="chest-art">

                <span>◆</span>

            </div>

            <div class="chest-info">

                <span class="chest-rarity">
                    ${chest.rarity}
                </span>

                <span class="chest-name">
                    ${chest.name}
                </span>

                <span class="chest-description">
                    Случайный герой из коллекции
                </span>

                <span class="chest-cost">
                    ◆ ${chest.cost} GEMS
                </span>

            </div>

            <div class="chest-arrow">
                ›
            </div>

        </button>

        `).join('')}

    </div>

    `;
}


/* =========================
   OPEN CHEST
========================= */

async function openChest(chest) {

    if ((state.gems || 0) < chest.cost) {

        showMessage('Недостаточно кристаллов.');

        return;
    }

    const result = await api('/chest/open', {

        method:'POST',

        body:JSON.stringify({

            user_id:UID,
            uid:UID,
            chest_id:chest.id,
            chest:chest.id,
            cost:chest.cost

        })

    });

    if (result && result.state) {

        state = {
            ...state,
            ...result.state
        };

    } else if (!result.error) {

        state.gems =
            Math.max(
                0,
                (state.gems || 0) - chest.cost
            );

    }

    let received = null;

    if (result && result.hero) {

        received = result.hero;

    } else if (heroes.length) {

        received =
            heroes[
                Math.floor(Math.random() * heroes.length)
            ];

    }

    if (received) {

        selectedHero = received;

        showMessage(
            `Получен герой: ${received.name || 'NEW HERO'}`
        );

    } else {

        showMessage('Сундук открыт.');

    }

    await refreshState();

    render();
}


/* =========================
   MISSIONS
========================= */

const ENEMIES = [

    {
        name:'NEON DRONE',
        power:650,
        hp:1100,
        atk:150,
        def:80
    },

    {
        name:'CYBER HUNTER',
        power:1000,
        hp:1500,
        atk:220,
        def:120
    },

    {
        name:'VOID GUARD',
        power:1450,
        hp:1900,
        atk:280,
        def:180
    },

    {
        name:'DARK TITAN',
        power:2000,
        hp:2600,
        atk:360,
        def:250
    },

    {
        name:'NEON OVERLORD',
        power:2800,
        hp:3400,
        atk:460,
        def:320
    },

    {
        name:'FINAL BOSS',
        power:3600,
        hp:4500,
        atk:560,
        def:400
    }

];


/* =========================
   ENEMY ART
========================= */

function enemyArt() {

    return `

    <svg viewBox="0 0 240 280"
         xmlns="http://www.w3.org/2000/svg">

        <defs>

            <linearGradient
                id="enemyGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="1">

                <stop offset="0%"
                      stop-color="#ff456e"/>

                <stop offset="100%"
                      stop-color="#8b1dff"/>

            </linearGradient>

        </defs>

        <circle
            cx="120"
            cy="125"
            r="95"
            fill="#ff456e"
            opacity=".08"/>

        <path
            d="M48 270
               L60 150
               Q120 100 180 150
               L192 270Z"
            fill="#171522"
            stroke="url(#enemyGradient)"
            stroke-width="5"/>

        <path
            d="M54 135
               Q120 40 186 135
               L170 205
               Q120 240 70 205Z"
            fill="#080a11"
            stroke="#ff456e"
            stroke-width="6"/>

        <path
            d="M75 135
               L110 125
               L100 151
               L75 158Z"
            fill="#ff456e"/>

        <path
            d="M165 135
               L130 125
               L140 151
               L165 158Z"
            fill="#ff456e"/>

        <circle
            cx="95"
            cy="145"
            r="7"
            fill="#ff456e"/>

        <circle
            cx="145"
            cy="145"
            r="7"
            fill="#ff456e"/>

        <path
            d="M92 190
               Q120 211 148 190"
            fill="none"
            stroke="#8b5cff"
            stroke-width="7"/>

        <path
            d="M48 95 L20 72"
            stroke="#ff456e"
            stroke-width="12"
            stroke-linecap="round"/>

        <path
            d="M192 95 L220 72"
            stroke="#ff456e"
            stroke-width="12"
            stroke-linecap="round"/>

    </svg>

    `;
}


/* =========================
   START BATTLE
========================= */

function startBattle(mission = 1) {

    if (battle.active) {

        openScreen('battle');

        return;
    }

    if ((state.energy || 0) < 10) {

        showMessage('Недостаточно энергии.');

        return;
    }

    const hero = selectedHero || heroes[0];

    if (!hero) {

        showMessage('Сначала выбери героя.');

        return;
    }

    const enemy =
        ENEMIES[
            Math.min(
                ENEMIES.length - 1,
                Math.max(0, mission - 1)
            )
        ];

    state.energy -= 10;

    battle = {

        active:true,

        mission,

        enemy,

        playerHp:1000 + Number(hero.power || 500) * .65,

        enemyHp:enemy.hp,

        maxPlayerHp:1000 + Number(hero.power || 500) * .65,

        maxEnemyHp:enemy.hp,

        log:[
            `${hero.name} выходит на арену.`,
            `${enemy.name} обнаружен.`
        ],

        busy:false

    };

    currentScreen = 'battle';

    render();
}


/* =========================
   BATTLE SCREEN
========================= */

function battleScreen() {

    if (!battle.active) {

        return `

        <div class="page-title">
            АРЕНА
        </div>

        <p class="page-subtitle">
            Выбери миссию и отправь героя в бой.
        </p>

        <div class="quick-grid">

            ${ENEMIES.map((enemy,index) => `

            <button
                class="quick-card"
                onclick="startBattle(${index + 1})">

                <div class="icon">
                    ${String(index + 1).padStart(2,'0')}
                </div>

                <b>
                    ${enemy.name}
                </b>

                <small>
                    POWER ${enemy.power}
                </small>

            </button>

            `).join('')}

        </div>

        `;

    }

    const hero = selectedHero || heroes[0];

    const playerPercent =
        Math.max(
            0,
            Math.min(
                100,
                battle.playerHp /
                battle.maxPlayerHp * 100
            )
        );

    const enemyPercent =
        Math.max(
            0,
            Math.min(
                100,
                battle.enemyHp /
                battle.maxEnemyHp * 100
            )
        );

    return `

    <div class="page-title">
        BATTLE ${battle.mission}
    </div>

    <p class="page-subtitle">
        Уничтожь противника и получи награду.
    </p>

    <div class="battle-arena">

        <div class="battle-fighter">

            <div class="fighter-icon">
                ${heroArt(hero?.id || 1)}
            </div>

            <b>
                ${hero?.name || 'HERO'}
            </b>

            <small>
                ${Math.ceil(battle.playerHp)} HP
            </small>

            <div class="hp-bar">
                <div
                    class="hp-fill"
                    style="width:${playerPercent}%">
                </div>
            </div>

        </div>

        <div class="vs">
            VS
        </div>

        <div class="battle-fighter">

            <div class="fighter-icon">
                ${enemyArt()}
            </div>

            <b>
                ${battle.enemy.name}
            </b>

            <small>
                ${Math.ceil(battle.enemyHp)} HP
            </small>

            <div class="hp-bar">
                <div
                    class="hp-fill enemy-hp"
                    style="width:${enemyPercent}%">
                </div>
            </div>

        </div>

    </div>

    <div class="battle-actions">

        <button
            class="primary-btn"
            onclick="playerAttack()">

            ATTACK

        </button>

        <button
            class="primary-btn"
            onclick="playerAbility()">

            SUPER POWER

        </button>

    </div>

    <div class="battle-log">

        ${battle.log
            .slice(-10)
            .reverse()
            .map(line => `<div>${line}</div>`)
            .join('')}

    </div>

    `;
}


/* =========================
   PLAYER ATTACK
========================= */

function playerAttack() {

    if (!battle.active || battle.busy) return;

    battle.busy = true;

    const hero = selectedHero || heroes[0];

    const power =
        Number(hero?.power || 700);

    const damage =
        Math.floor(
            100 +
            power * .13 +
            Math.random() * 100
        );

    battle.enemyHp =
        Math.max(
            0,
            battle.enemyHp - damage
        );

    battle.log.push(
        `${hero?.name || 'Герой'} наносит ${damage} урона.`
    );

    if (battle.enemyHp <= 0) {

        finishBattle(true);

        return;
    }

    setTimeout(enemyAttack, 450);

    render();
}


/* =========================
   SUPER POWER
========================= */

function playerAbility() {

    if (!battle.active || battle.busy) return;

    battle.busy = true;

    const hero = selectedHero || heroes[0];

    const damage =
        Math.floor(
            250 +
            Number(hero?.power || 700) * .25 +
            Math.random() * 160
        );

    battle.enemyHp =
        Math.max(
            0,
            battle.enemyHp - damage
        );

    const ability =
        hero?.ability ||
        HEROES[hero?.id]?.ability ||
        'SUPER POWER';

    battle.log.push(
        `${ability}: ${damage} урона!`
    );

    if (battle.enemyHp <= 0) {

        finishBattle(true);

        return;
    }

    setTimeout(enemyAttack, 500);

    render();
}


/* =========================
   ENEMY ATTACK
========================= */

function enemyAttack() {

    if (!battle.active) return;

    const damage =
        Math.floor(
            battle.enemy.atk *
            (.65 + Math.random() * .55)
        );

    battle.playerHp =
        Math.max(
            0,
            battle.playerHp - damage
        );

    battle.log.push(
        `${battle.enemy.name} наносит ${damage} урона.`
    );

    battle.busy = false;

    if (battle.playerHp <= 0) {

        finishBattle(false);

        return;
    }

    render();
}


/* =========================
   FINISH BATTLE
========================= */

async function finishBattle(win) {

    if (!battle.active) return;

    battle.busy = true;

    const mission = battle.mission;

    const result = await api('/battle', {

        method:'POST',

        body:JSON.stringify({

            user_id:UID,
            uid:UID,
            mission,
            win

        })

    });

    if (result && result.state) {

        state = {
            ...state,
            ...result.state
        };

    }

    if (win) {

        const reward =
            result?.reward ||
            50 + mission * 25;

        state.coins =
            Number(state.coins || 0) +
            Number(reward);

        state.xp =
            Number(state.xp || 0) +
            20 +
            mission * 5;

        showMessage(
            `ПОБЕДА! +${reward} COINS`
        );

    } else {

        showMessage('Поражение. Попробуй ещё раз.');

    }

    battle = {

        active:false,
        mission:1,
        enemy:null,
        playerHp:0,
        enemyHp:0,
        maxPlayerHp:0,
        maxEnemyHp:0,
        log:[],
        busy:false

    };

    await refreshState();

    currentScreen = 'home';

    render();
}


/* =========================
   LEAVE BATTLE
========================= */

function leaveBattle() {

    battle = {

        active:false,
        mission:1,
        enemy:null,
        playerHp:0,
        enemyHp:0,
        maxPlayerHp:0,
        maxEnemyHp:0,
        log:[],
        busy:false

    };

    openScreen('home');
}


/* =========================
   POWERS
========================= */

function powersScreen() {

    return `

    <div class="page-title">
        СУПЕРСИЛЫ
    </div>

    <p class="page-subtitle">
        Особые способности героев для решающего удара.
    </p>

    <div class="quick-grid">

        ${heroes.slice(0,8).map((hero,index) => {

            const ability =
                hero.ability ||
                HEROES[hero.id]?.ability ||
                'NEON STRIKE';

            return `

            <button
                class="quick-card"
                onclick="selectHero(${hero.id});openScreen('heroes')">

                <div class="icon">
                    ${powerArt((index % 5) + 1)}
                </div>

                <b>
                    ${ability}
                </b>

                <small>
                    ${hero.name}
                </small>

            </button>

            `;

        }).join('')}

    </div>

    `;
}


/* =========================
   PROFILE
========================= */

function profileScreen() {

    const username =
        tg?.initDataUnsafe?.user?.username
        || 'PLAYER';

    return `

    <div class="page-title">
        ПРОФИЛЬ
    </div>

    <div class="profile-card">

        <div class="avatar">
            ${String(username).slice(0,2).toUpperCase()}
        </div>

        <h2>
            ${username}
        </h2>

        <p>
            PLAYER #${UID}
        </p>

        <div class="profile-stats">

            <div class="profile-stat">
                <b>${state.level || 1}</b>
                <small>LEVEL</small>
            </div>

            <div class="profile-stat">
                <b>${state.xp || 0}</b>
                <small>XP</small>
            </div>

            <div class="profile-stat">
                <b>${state.coins || 0}</b>
                <small>COINS</small>
            </div>

            <div class="profile-stat">
                <b>${heroes.length}</b>
                <small>HEROES</small>
            </div>

        </div>

    </div>

    <div class="section-head">
        <h2>АККАУНТ</h2>
    </div>

    <div class="quick-grid">

        <button
            class="quick-card"
            onclick="showLeaderboard()">

            <div class="icon">
                R
            </div>

            <b>
                РЕЙТИНГ
            </b>

            <small>
                Лучшие игроки
            </small>

        </button>

        <button
            class="quick-card"
            onclick="openSettings()">

            <div class="icon">
                ⚙
            </div>

            <b>
                НАСТРОЙКИ
            </b>

            <small>
                Параметры игры
            </small>

        </button>

        <button
            class="quick-card"
            onclick="openScreen('powers')">

            <div class="icon">
                ⚡
            </div>

            <b>
                СУПЕРСИЛЫ
            </b>

            <small>
                Способности
            </small>

        </button>

    </div>

    `;
}


/* =========================
   LEADERBOARD
========================= */

async function showLeaderboard() {

    const result =
        await api('/leaderboard');

    let players = [];

    if (Array.isArray(result)) {

        players = result;

    } else if (Array.isArray(result?.players)) {

        players = result.players;

    }

    if (!players.length) {

        players = [

            {
                name:'RavenX',
                score:48210
            },

            {
                name:'NEXUS',
                score:45120
            },

            {
                name:'Viktor_7',
                score:43890
            },

            {
                name:'Shadow',
                score:41200
            },

            {
                name:'NEON',
                score:39500
            },

            {
                name:'CyberWolf',
                score:37400
            },

            {
                name:'Ghost',
                score:35100
            }

        ];

    }

    document.getElementById('modal').innerHTML = `

    <div
        class="modal-bg"
        onclick="closeModal()">

        <div
            class="modal"
            onclick="event.stopPropagation()">

            <h2>
                РЕЙТИНГ
            </h2>

            <p>
                Лучшие игроки NEON HEROES
            </p>

            <div class="leaderboard">

                ${players
                    .slice(0,10)
                    .map((player,index) => `

                    <div class="rank">

                        ${playerAvatar(
                            player.name ||
                            player.username ||
                            'PLAYER',
                            index
                        )}

                        <div class="rank-info">

                            <b>
                                #${index + 1}
                                ${player.name ||
                                  player.username ||
                                  'PLAYER'}
                            </b>

                            <small>
                                PLAYER
                            </small>

                        </div>

                        <strong>
                            ${player.score ||
                              player.power ||
                              player.coins ||
                              0}
                        </strong>

                    </div>

                `).join('')}

            </div>

            <div class="modal-actions">

                <button
                    class="primary-btn"
                    onclick="closeModal()">

                    ЗАКРЫТЬ

                </button>

            </div>

        </div>

    </div>

    `;

}



/* =========================
   LANGUAGE SYSTEM
========================= */

const LANG = {
    ru: {
        settings: "НАСТРОЙКИ",
        game: "ИГРА",
        account: "АККАУНТ",
        language: "ЯЗЫК",
        russian: "Русский",
        english: "English",
        sound: "Звуковые эффекты",
        music: "Фоновая музыка",
        notifications: "Игровые уведомления",
        tapToggle: "Нажми для переключения",
        on: "ВКЛ",
        off: "ВЫКЛ",
        home: "ГЛАВНАЯ",
        heroes: "ГЕРОИ",
        battle: "БОЙ",
        chests: "СУНДУКИ",
        profile: "ПРОФИЛЬ",
        leaderboard: "РЕЙТИНГ",
        missions: "ЗАДАНИЯ",
        selectHero: "ВЫБРАТЬ ГЕРОЯ",
        ordinary: "ОБЫЧНЫЙ",
        rare: "РЕДКИЙ",
        epic: "ЭПИЧЕСКИЙ",
        legendary: "ЛЕГЕНДАРНЫЙ",
        notEnoughGems: "Недостаточно кристаллов.",
        chestOpened: "Сундук открыт.",
        notEnoughEnergy: "Недостаточно энергии.",
        chooseHero: "Сначала выбери героя.",
        finishBattle: "Сначала закончи текущий бой.",
        heroReady: "Твой герой готов к бою.",
        defeat: "Поражение. Попробуй ещё раз.",
        hero: "Герой",
        damage: "наносит",
        damageWord: "урона",
        serverError: "Сервер вернул неправильный ответ",
        connectionError: "Ошибка соединения с сервером",
        player: "ИГРОК",
        accountName: "NEON HEROES ACCOUNT",
        version: "ВЕРСИЯ"
    },

    en: {
        settings: "SETTINGS",
        game: "GAME",
        account: "ACCOUNT",
        language: "LANGUAGE",
        russian: "Русский",
        english: "English",
        sound: "Sound effects",
        music: "Background music",
        notifications: "Game notifications",
        tapToggle: "Tap to toggle",
        on: "ON",
        off: "OFF",
        home: "HOME",
        heroes: "HEROES",
        battle: "BATTLE",
        chests: "CHESTS",
        profile: "PROFILE",
        leaderboard: "LEADERBOARD",
        missions: "MISSIONS",
        selectHero: "SELECT HERO",
        ordinary: "COMMON",
        rare: "RARE",
        epic: "EPIC",
        legendary: "LEGENDARY",
        notEnoughGems: "Not enough crystals.",
        chestOpened: "Chest opened.",
        notEnoughEnergy: "Not enough energy.",
        chooseHero: "Select a hero first.",
        finishBattle: "Finish the current battle first.",
        heroReady: "Your hero is ready for battle.",
        defeat: "Defeat. Try again.",
        hero: "Hero",
        damage: "deals",
        damageWord: "damage",
        serverError: "Server returned an invalid response",
        connectionError: "Connection error",
        player: "PLAYER",
        accountName: "NEON HEROES ACCOUNT",
        version: "VERSION"
    }
};

function getLanguage() {
    const saved = localStorage.getItem("neonHeroesLanguage");
    return saved === "en" ? "en" : "ru";
}

function setLanguage(lang) {
    localStorage.setItem(
        "neonHeroesLanguage",
        lang === "en" ? "en" : "ru"
    );
}

function t(key) {
    const lang = getLanguage();
    return LANG[lang]?.[key] ?? LANG.ru[key] ?? key;
}

/* =========================
   SETTINGS
========================= */

function getGameSettings() {

    try {

        return JSON.parse(
            localStorage.getItem(
                'neonHeroesSettings'
            ) || '{}'
        );

    } catch {

        return {};

    }
}


function saveGameSettings(settings) {

    localStorage.setItem(
        'neonHeroesSettings',
        JSON.stringify(settings)
    );

}


function openSettings() {

    const settings = getGameSettings();

    const sound =
        settings.sound !== false;

    const music =
        settings.music !== false;

    const notifications =
        settings.notifications !== false;

    const currentLanguage = getLanguage();

    const modal = document.createElement("div");

    modal.className = "game-modal";
    modal.id = "settingsModal";

    modal.innerHTML = `

    <div
        class="game-modal-backdrop"
        onclick="closeSettings()">
    </div>

    <div class="settings-panel">

        <div class="settings-header">

            <div>

                <small>
                    NEON HEROES
                </small>

                <h2>
                    ${t("settings")}
                </h2>

            </div>

            <button
                class="modal-close"
                onclick="closeSettings()">

                ×

            </button>

        </div>

        <div class="settings-section-title">
            ${t("game")}
        </div>

        ${settingRow(
            "sound",
            "SOUND",
            t("sound"),
            sound
        )}

        ${settingRow(
            "music",
            "MUSIC",
            t("music"),
            music
        )}

        ${settingRow(
            "notifications",
            "ALERT",
            t("notifications"),
            notifications
        )}

        <div class="settings-section-title">
            ${t("language")}
        </div>

        <div class="language-selector">

            <button
                class="language-option ${currentLanguage === "ru" ? "selected" : ""}"
                onclick="changeLanguage('ru')">

                <span class="language-flag">🇷🇺</span>

                <span>
                    <b>Русский</b>
                    <small>Русский язык</small>
                </span>

                <span class="language-check">
                    ${currentLanguage === "ru" ? "✓" : ""}
                </span>

            </button>

            <button
                class="language-option ${currentLanguage === "en" ? "selected" : ""}"
                onclick="changeLanguage('en')">

                <span class="language-flag">🇬🇧</span>

                <span>
                    <b>English</b>
                    <small>English language</small>
                </span>

                <span class="language-check">
                    ${currentLanguage === "en" ? "✓" : ""}
                </span>

            </button>

        </div>

        <div class="settings-section-title">
            ${t("account")}
        </div>

        <div class="settings-account">

            <div class="settings-avatar">
                NH
            </div>

            <div>

                <b>
                    ${t("player")} #${UID}
                </b>

                <small>
                    ${t("accountName")}
                </small>

            </div>

        </div>

        <div class="settings-version">

            <span>
                ${t("version")}
            </span>

            <span>
                1.0.0
            </span>

        </div>

    </div>

    `;

    document.body.appendChild(modal);
}



function translateInterface() {

    const lang = getLanguage();

    if (lang === "ru") return;

    const replacements = {
        "ГЛАВНАЯ": "HOME",
        "Главная": "Home",
        "ГЕРОИ": "HEROES",
        "Герои": "Heroes",
        "БОЙ": "BATTLE",
        "Бой": "Battle",
        "СУНДУКИ": "CHESTS",
        "Сундуки": "Chests",
        "ПРОФИЛЬ": "PROFILE",
        "Профиль": "Profile",
        "РЕЙТИНГ": "LEADERBOARD",
        "Рейтинг": "Leaderboard",
        "СУПЕРСИЛЫ": "SUPERPOWERS",
        "Суперсилы": "Superpowers",
        "НАСТРОЙКИ": "SETTINGS",
        "Настройки": "Settings",

        "ИГРОВОЙ ЦЕНТР": "GAME CENTER",
        "ТВОИ ГЕРОИ": "YOUR HEROES",
        "ВСЕ": "ALL",
        "ГЕРОЕВ": "HEROES",
        "собрано": "collected",
        "АРЕНА": "ARENA",
        "Сражения и миссии": "Battles and missions",
        "Новые герои": "New heroes",
        "Лучшие игроки": "Top players",
        "Способности героев": "Hero abilities",
        "Игра и аккаунт": "Game and account",

        "ГЕРОИ": "HEROES",
        "Собирай бойцов NEON CITY и усиливай свою команду.": "Collect NEON CITY fighters and build your team.",
        "В БОЙ": "BATTLE",
        "КОЛЛЕКЦИЯ": "COLLECTION",
        "ВЫБРАТЬ ГЕРОЯ": "SELECT HERO",

        "ОБЫЧНЫЙ": "COMMON",
        "РЕДКИЙ": "RARE",
        "ЭПИЧЕСКИЙ": "EPIC",
        "ЛЕГЕНДАРНЫЙ": "LEGENDARY",

        "Открывай сундуки и получай новых героев.": "Open chests and get new heroes.",
        "Случайный герой из коллекции": "Random hero from the collection",

        "Недостаточно кристаллов.": "Not enough crystals.",
        "Сундук открыт.": "Chest opened.",
        "Получен герой:": "Hero received:",
        "Недостаточно энергии.": "Not enough energy.",
        "Сначала выбери героя.": "Select a hero first.",

        "выходит на арену.": "enters the arena.",
        "обнаружен.": "detected.",
        "Выбери миссию и отправь героя в бой.": "Choose a mission and send your hero into battle.",
        "Уничтожь противника и получи награду.": "Destroy the enemy and claim your reward.",

        "СУПЕРСИЛЫ": "SUPERPOWERS",
        "Особые способности героев для решающего удара.": "Special hero abilities for the decisive strike.",

        "ПРОФИЛЬ": "PROFILE",
        "АККАУНТ": "ACCOUNT",
        "Лучшие игроки NEON HEROES": "Top NEON HEROES players",
        "Параметры игры": "Game settings",
        "Способности": "Abilities",
        "ЗАКРЫТЬ": "CLOSE",

        "НАСТРОЙКИ": "SETTINGS",
        "ИГРА": "GAME",
        "ЯЗЫК": "LANGUAGE",
        "Русский": "Russian",
        "Русский язык": "Russian language",

        "Звуковые эффекты": "Sound effects",
        "Фоновая музыка": "Background music",
        "Игровые уведомления": "Game notifications",
        "Нажми для переключения": "Tap to toggle",

        "ВКЛ": "ON",
        "ВЫКЛ": "OFF",
        "ACCOUNT": "ACCOUNT",
        "ИГРОК": "PLAYER",
        "ВЕРСИЯ": "VERSION",

        "Сначала закончи текущий бой.": "Finish the current battle first.",
        "Твой герой готов к бою.": "Your hero is ready for battle.",
        "Поражение. Попробуй ещё раз.": "Defeat. Try again.",
        "Сервер вернул неправильный ответ": "Server returned an invalid response",
        "Ошибка соединения с сервером": "Connection error",

        "Герой": "Hero",
        "наносит": "deals",
        "урона": "damage",
        "ПОБЕДА!": "VICTORY!",
        "урона!": "damage!",

        "НАЧАТЬ БОЙ": "START BATTLE"
    };

    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
    );

    const nodes = [];

    while (walker.nextNode()) {
        nodes.push(walker.currentNode);
    }

    for (const node of nodes) {

        let value = node.nodeValue;

        for (const [ru, en] of Object.entries(replacements)) {
            value = value.split(ru).join(en);
        }

        node.nodeValue = value;
    }
}


function changeLanguage(lang) {

    setLanguage(lang);

    closeSettings();

    render();

    setTimeout(() => {
        translateInterface();
    }, 0);

}


function settingRow(
    key,
    icon,
    title,
    enabled
) {

    return `

    <button
        class="setting-row"
        onclick="toggleGameSetting('${key}')">

        <div class="setting-icon">
            ${icon}
        </div>

        <div>

            <b>
                ${title}
            </b>

            <small>
                Нажми для переключения
            </small>

        </div>

        <div
            class="setting-toggle ${enabled ? 'on' : ''}">

            ${enabled ? 'ON' : 'OFF'}

        </div>

    </button>

    `;
}


function closeSettings() {

    document
        .getElementById('settingsModal')
        ?.remove();

}


function toggleGameSetting(key) {

    const settings =
        getGameSettings();

    settings[key] =
        settings[key] === false;

    saveGameSettings(settings);

    closeSettings();

    openSettings();

}


/* =========================
   LEADERBOARD MODAL
========================= */

function closeModal() {

    const modal =
        document.getElementById('modal');

    if (modal) {

        modal.innerHTML = '';

    }

}


/* =========================
   MESSAGE
========================= */

function showMessage(text) {

    const old =
        document.querySelector(
            '.game-toast'
        );

    old?.remove();

    const toast =
        document.createElement('div');

    toast.className =
        'game-toast';

    toast.textContent =
        text;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.classList.add('hide');

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 2200);

}


/* =========================
   REFRESH STATE
========================= */

async function refreshState() {

    const data =
        await api('/state/' + UID);

    if (data && !data.error) {

        state = {
            ...state,
            ...data
        };

    }

    updateResources();
}


/* =========================
   START
========================= */

window.addEventListener(
    'error',
    event => {

        console.error(
            'NEON HEROES ERROR:',
            event.error || event.message
        );

    }
);

window.addEventListener(
    'unhandledrejection',
    event => {

        console.error(
            'NEON HEROES PROMISE ERROR:',
            event.reason
        );

    }
);

loadGame();

/* =========================================================
   NEON HEROES — AUDIO ENGINE + GAME ANIMATIONS
   ========================================================= */

(function initNeonAudio() {
    let audioCtx = null;
    let musicTimer = null;
    let musicStep = 0;
    let masterGain = null;

    const MUSIC = [
        [146.83, 220.00, 293.66],
        [164.81, 246.94, 329.63],
        [130.81, 196.00, 261.63],
        [146.83, 220.00, 369.99]
    ];

    function settings() {
        try {
            return JSON.parse(localStorage.getItem("neonHeroesSettings")) || {
                sound: true,
                music: true,
                notifications: true
            };
        } catch {
            return { sound: true, music: true, notifications: true };
        }
    }

    function enabled(type) {
        const s = settings();

        if (type === "music") {
            return s.music !== false;
        }

        if (type === "sound") {
            return s.sound !== false;
        }

        return true;
    }

    function createAudio() {
        if (audioCtx) {
            if (audioCtx.state === "suspended") {
                audioCtx.resume().catch(() => {});
            }
            return;
        }

        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;

        audioCtx = new AC();

        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.18;
        masterGain.connect(audioCtx.destination);

        if (enabled("music")) {
            startMusic();
        }
    }

    function tone(freq, duration, volume = 0.08, type = "sine", delay = 0) {
        if (!audioCtx || !enabled("sound")) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);

        gain.gain.setValueAtTime(0.0001, audioCtx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(
            volume,
            audioCtx.currentTime + delay + 0.008
        );
        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            audioCtx.currentTime + delay + duration
        );

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + duration + 0.03);
    }

    function clickSound() {
        tone(520, 0.055, 0.045, "square");
        tone(760, 0.045, 0.025, "sine", 0.025);
    }

    function battleSound() {
        tone(180, 0.12, 0.08, "sawtooth");
        tone(90, 0.18, 0.05, "square", 0.04);
    }

    function victorySound() {
        tone(523.25, 0.12, 0.06, "sine");
        tone(659.25, 0.12, 0.06, "sine", 0.11);
        tone(783.99, 0.22, 0.08, "sine", 0.22);
    }

    function defeatSound() {
        tone(392, 0.16, 0.055, "sine");
        tone(293.66, 0.18, 0.055, "sine", 0.13);
        tone(220, 0.28, 0.065, "sine", 0.27);
    }

    function chestSound() {
        tone(392, 0.08, 0.045, "sine");
        tone(523.25, 0.08, 0.05, "sine", 0.08);
        tone(659.25, 0.12, 0.06, "sine", 0.16);
        tone(1046.5, 0.25, 0.07, "sine", 0.27);
    }

    function startMusic() {
        if (musicTimer || !audioCtx || !enabled("music")) return;

        const playChord = () => {
            if (!audioCtx || !enabled("music")) return;

            const chord = MUSIC[musicStep % MUSIC.length];
            musicStep++;

            chord.forEach((freq, index) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = index === 0 ? "triangle" : "sine";
                osc.frequency.value = freq;

                const now = audioCtx.currentTime;

                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.linearRampToValueAtTime(
                    index === 0 ? 0.018 : 0.010,
                    now + 0.12
                );
                gain.gain.linearRampToValueAtTime(
                    0.0001,
                    now + 1.8
                );

                osc.connect(gain);
                gain.connect(masterGain);

                osc.start(now);
                osc.stop(now + 1.9);
            });
        };

        playChord();
        musicTimer = setInterval(playChord, 1850);
    }

    function stopMusic() {
        if (musicTimer) {
            clearInterval(musicTimer);
            musicTimer = null;
        }
    }

    function updateMusic() {
        if (!audioCtx) return;

        if (enabled("music")) {
            startMusic();
        } else {
            stopMusic();
        }
    }

    window.NEON_AUDIO = {
        start() {
            createAudio();
        },

        click() {
            createAudio();
            clickSound();
        },

        battle() {
            createAudio();
            battleSound();
        },

        victory() {
            createAudio();
            victorySound();
        },

        defeat() {
            createAudio();
            defeatSound();
        },

        chest() {
            createAudio();
            chestSound();
        },

        updateMusic
    };

    document.addEventListener("pointerdown", function(e) {
        createAudio();

        const target = e.target.closest(
            "button, .btn, .game-btn, .nav-btn, .hero-card, .menu-card, .chest-card, .power-card, [onclick]"
        );

        if (!target) return;

        target.classList.add("neon-pressed");

        setTimeout(() => {
            target.classList.remove("neon-pressed");
        }, 140);

        const text = (target.innerText || "").toUpperCase();

        if (
            text.includes("CHEST") ||
            text.includes("СУНДУК")
        ) {
            chestSound();
        } else if (
            text.includes("BATTLE") ||
            text.includes("БОЙ") ||
            text.includes("АРЕНА")
        ) {
            battleSound();
        } else {
            clickSound();
        }

        if (navigator.vibrate) {
            navigator.vibrate(12);
        }
    }, { passive: true });

    window.addEventListener("visibilitychange", () => {
        if (!audioCtx) return;

        if (document.hidden) {
            stopMusic();
        } else if (enabled("music")) {
            if (audioCtx.state === "suspended") {
                audioCtx.resume().catch(() => {});
            }
            startMusic();
        }
    });

    window.addEventListener("beforeunload", stopMusic);

    window.addEventListener("neon-settings-changed", updateMusic);
})();


/* Automatically translate every newly rendered screen */
(function patchRenderLocalization() {
    const originalRender = window.render;

    if (typeof originalRender !== "function") return;

    window.render = function() {
        const result = originalRender.apply(this, arguments);

        if (typeof translateInterface === "function") {
            setTimeout(() => translateInterface(), 0);
        }

        return result;
    };
})();

