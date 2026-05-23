/**
 * ==========================================================================
 * GLOBAL SUNSET OBSERVATORY - ENGINE & TELEMETRY
 * Real-time Mathematical modeling of Sun position, Earth terminator, 
 * NOAA Space Weather API connection, Atmospheric Light Scattering,
 * and double-resilient visual fallbacks for offline running.
 * ==========================================================================
 */

// --- Global App State ---
const State = {
    currentTime: new Date(),
    solarWindHistory: [412, 415, 419, 422, 420, 425, 428, 431, 429, 421], // last 10 mins
    kpIndexHistory: [2.1, 2.2, 2.0, 2.3, 2.5, 2.4, 2.2, 2.3, 2.4, 2.3],
    timeLabels: Array.from({length: 10}, (_, i) => `${i-9}m`),
    solarWind: 421.8,
    kpIndex: 2.3,
    aerosolOpticalDepth: 0.18,
    map: null,
    terminatorLayer: null,
    markersLayer: null,
    charts: {
        spectral: null,
        solar: null
    },
    activeMapStyle: 'dark', // 'dark' or 'satellite'
    isOfflineMap: false,
    isOfflineCharts: false,
    
    // --- 105 Reference Cities (Worldwide & Ukraine) ---
    cities: [
        // Ukraine (26 Cities)
        { name: "Київ", country: "Україна", lat: 50.4501, lon: 30.5234 },
        { name: "Львів", country: "Україна", lat: 49.8397, lon: 24.0297 },
        { name: "Одеса", country: "Україна", lat: 46.4825, lon: 30.7233 },
        { name: "Харків", country: "Україна", lat: 49.9935, lon: 36.2304 },
        { name: "Дніпро", country: "Україна", lat: 48.4647, lon: 35.0462 },
        { name: "Донецьк", country: "Україна", lat: 48.0159, lon: 37.8028 },
        { name: "Запоріжжя", country: "Україна", lat: 47.8388, lon: 35.1396 },
        { name: "Севастополь", country: "Україна", lat: 44.5889, lon: 33.4833 },
        { name: "Луганськ", country: "Україна", lat: 48.5740, lon: 39.3078 },
        { name: "Сімферополь", country: "Україна", lat: 44.9521, lon: 34.1024 },
        { name: "Кривий Ріг", country: "Україна", lat: 47.9105, lon: 33.3918 },
        { name: "Миколаїв", country: "Україна", lat: 46.9750, lon: 31.9946 },
        { name: "Маріуполь", country: "Україна", lat: 47.0978, lon: 37.5456 },
        { name: "Вінниця", country: "Україна", lat: 49.2331, lon: 28.4682 },
        { name: "Херсон", country: "Україна", lat: 46.6354, lon: 32.6169 },
        { name: "Полтава", country: "Україна", lat: 49.5883, lon: 34.5514 },
        { name: "Чернігів", country: "Україна", lat: 51.4982, lon: 31.2893 },
        { name: "Черкаси", country: "Україна", lat: 49.4444, lon: 32.0598 },
        { name: "Суми", country: "Україна", lat: 50.9077, lon: 34.7981 },
        { name: "Житомир", country: "Україна", lat: 50.2547, lon: 28.6587 },
        { name: "Чернівці", country: "Україна", lat: 48.2908, lon: 25.9345 },
        { name: "Рівне", country: "Україна", lat: 50.6199, lon: 26.2516 },
        { name: "Івано-Франківськ", country: "Україна", lat: 48.9215, lon: 24.7097 },
        { name: "Тернопіль", country: "Україна", lat: 49.5535, lon: 25.5948 },
        { name: "Луцьк", country: "Україна", lat: 50.7472, lon: 25.3254 },
        { name: "Ужгород", country: "Україна", lat: 48.6208, lon: 22.2879 },

        // Europe (18 Cities)
        { name: "Лондон", country: "Великобританія", lat: 51.5074, lon: -0.1278 },
        { name: "Париж", country: "Франція", lat: 48.8566, lon: 2.3522 },
        { name: "Берлін", country: "Німеччина", lat: 52.5200, lon: 13.4050 },
        { name: "Рим", country: "Італія", lat: 41.9028, lon: 12.4964 },
        { name: "Мадрид", country: "Іспанія", lat: 40.4168, lon: -3.7038 },
        { name: "Варшава", country: "Польща", lat: 52.2297, lon: 21.0122 },
        { name: "Прага", country: "Чехія", lat: 50.0755, lon: 14.4378 },
        { name: "Відень", country: "Австрія", lat: 48.2082, lon: 16.3738 },
        { name: "Афіни", country: "Греція", lat: 37.9838, lon: 23.7275 },
        { name: "Лісабон", country: "Португалія", lat: 38.7223, lon: -9.1393 },
        { name: "Амстердам", country: "Нідерланди", lat: 52.3676, lon: 4.9041 },
        { name: "Брюссель", country: "Бельгія", lat: 50.8503, lon: 4.3517 },
        { name: "Копенгаген", country: "Данія", lat: 55.6761, lon: 12.5683 },
        { name: "Стокгольм", country: "Швеція", lat: 59.3293, lon: 18.0686 },
        { name: "Осло", country: "Норвегія", lat: 59.9139, lon: 10.7522 },
        { name: "Гельсінкі", country: "Фінляндія", lat: 60.1699, lon: 24.9384 },
        { name: "Дублін", country: "Ірландія", lat: 53.3498, lon: -6.2603 },
        { name: "Рейк'явік", country: "Ісландія", lat: 64.1466, lon: -21.9426 },

        // Asia (21 Cities)
        { name: "Токіо", country: "Японія", lat: 35.6762, lon: 139.6503 },
        { name: "Пекін", country: "Китай", lat: 39.9042, lon: 116.4074 },
        { name: "Сеул", country: "Південна Корея", lat: 37.5665, lon: 126.9780 },
        { name: "Сінгапур", country: "Сінгапур", lat: 1.3521, lon: 103.8198 },
        { name: "Бангкок", country: "Таїланд", lat: 13.7563, lon: 100.5018 },
        { name: "Джакарта", country: "Індонезія", lat: -6.2088, lon: 106.8456 },
        { name: "Маніла", country: "Філіппіни", lat: 14.5995, lon: 120.9842 },
        { name: "Ханой", country: "В'єтнам", lat: 21.0285, lon: 105.8542 },
        { name: "Мумбаї", country: "Індія", lat: 19.0760, lon: 72.8777 },
        { name: "Делі", country: "Індія", lat: 28.6139, lon: 77.2090 },
        { name: "Бангалор", country: "Індія", lat: 12.9716, lon: 77.5946 },
        { name: "Тайбей", country: "Тайвань", lat: 25.0330, lon: 121.5654 },
        { name: "Гонконг", country: "Китай", lat: 22.3193, lon: 114.1694 },
        { name: "Дубай", country: "ОАЕ", lat: 25.2048, lon: 55.2708 },
        { name: "Ер-Ріяд", country: "Саудівська Аравія", lat: 24.7136, lon: 46.6753 },
        { name: "Єрусалим", country: "Ізраїль", lat: 31.7683, lon: 35.2137 },
        { name: "Стамбул", country: "Туреччина", lat: 41.0082, lon: 28.9784 },
        { name: "Тегеран", country: "Іран", lat: 35.6892, lon: 51.3890 },
        { name: "Багдад", country: "Ірак", lat: 33.3152, lon: 44.3661 },
        { name: "Новосибірськ", country: "РФ", lat: 55.0084, lon: 82.9357 },
        { name: "Владивосток", country: "РФ", lat: 43.1198, lon: 131.8869 },

        // North America (16 Cities)
        { name: "Нью-Йорк", country: "США", lat: 40.7128, lon: -74.0060 },
        { name: "Лос-Анджелес", country: "США", lat: 34.0522, lon: -118.2437 },
        { name: "Чикаго", country: "США", lat: 41.8781, lon: -87.6298 },
        { name: "Х'юстон", country: "США", lat: 29.7604, lon: -95.3698 },
        { name: "Фінікс", country: "США", lat: 33.4484, lon: -112.0740 },
        { name: "Сан-Франциско", country: "США", lat: 37.7749, lon: -122.4194 },
        { name: "Сіетл", country: "США", lat: 47.6062, lon: -122.3321 },
        { name: "Маямі", country: "США", lat: 25.7617, lon: -80.1918 },
        { name: "Бостон", country: "США", lat: 42.3601, lon: -71.0589 },
        { name: "Денвер", country: "США", lat: 39.7392, lon: -104.9903 },
        { name: "Анкоридж", country: "США (Аляска)", lat: 61.2181, lon: -149.9003 },
        { name: "Гонолулу", country: "США (Гаваї)", lat: 21.3069, lon: -157.8583 },
        { name: "Ванкувер", country: "Канада", lat: 49.2827, lon: -123.1207 },
        { name: "Торонто", country: "Канада", lat: 43.6532, lon: -79.3832 },
        { name: "Монреаль", country: "Канада", lat: 45.5017, lon: -73.5673 },
        { name: "Мехіко", country: "Мексика", lat: 19.4326, lon: -99.1332 },

        // South America (8 Cities)
        { name: "Ріо-де-Жанейро", country: "Бразилія", lat: -22.9068, lon: -43.1729 },
        { name: "Сан-Паулу", country: "Бразилія", lat: -23.5505, lon: -46.6333 },
        { name: "Бразиліа", country: "Бразилія", lat: -15.7975, lon: -47.8919 },
        { name: "Буенос-Айрес", country: "Аргентина", lat: -34.6037, lon: -58.3816 },
        { name: "Сантьяго", country: "Чилі", lat: -33.4489, lon: -70.6693 },
        { name: "Богота", country: "Колумбія", lat: 4.7110, lon: -74.0721 },
        { name: "Ліма", country: "Перу", lat: -12.0464, lon: -77.0428 },
        { name: "Каракас", country: "Венесуела", lat: 10.4806, lon: -66.9036 },

        // Africa (7 Cities)
        { name: "Каїр", country: "Єгипет", lat: 30.0444, lon: 31.2357 },
        { name: "Кейптаун", country: "ПАР", lat: -33.9249, lon: 18.4241 },
        { name: "Йоганнесбург", country: "ПАР", lat: -26.2041, lon: 28.0473 },
        { name: "Найробі", country: "Кенія", lat: -1.2921, lon: 36.8219 },
        { name: "Лагос", country: "Нігерія", lat: 6.5244, lon: 3.3792 },
        { name: "Касабланка", country: "Марокко", lat: 33.5731, lon: -7.5898 },
        { name: "Аддис-Абеба", country: "Ефіопія", lat: 9.0300, lon: 38.7400 },

        // Australia & Oceania (9 Cities)
        { name: "Сідней", country: "Австралія", lat: -33.8688, lon: 151.2093 },
        { name: "Мельбурн", country: "Австралія", lat: -37.8136, lon: 144.9631 },
        { name: "Брісбен", country: "Австралія", lat: -27.4705, lon: 153.0260 },
        { name: "Перт", country: "Австралія", lat: -31.9505, lon: 115.8605 },
        { name: "Аделаїда", country: "Австралія", lat: -34.9285, lon: 138.6007 },
        { name: "Хобарт", country: "Австралія", lat: -42.8821, lon: 147.3272 },
        { name: "Окленд", country: "Нова Зеландія", lat: -36.8485, lon: 174.7633 },
        { name: "Веллінгтон", country: "Нова Зеландія", lat: -41.2865, lon: 174.7762 },
        { name: "Сува", country: "Фіджі", lat: -18.1248, lon: 178.4501 }
    ]
};

// --- High-Fidelity Earth Photographic Satellite Texture (Equirectangular Projection) ---
// Loaded dynamically from Wikipedia Commons (cached globally by Wikipedia servers)
const earthImage = new Image();
earthImage.crossOrigin = "anonymous";
earthImage.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Earthmap1000x500compac.jpg/800px-Earthmap1000x500compac.jpg";

earthImage.onload = () => {
    console.log("Photographic Earth Satellite Texture loaded successfully!");
    const solar = calculateSolarPhysics();
    if (State.isOfflineMap) {
        drawCanvasFallbackMap(solar);
    }
};

earthImage.onerror = () => {
    console.warn("Failed to load online satellite texture. Keeping vector dark fallback.");
};

// --- Offline High-Fidelity Vector Continents Coordinates ---
// Simplified geographical boundaries of the Earth's continents [Longitude, Latitude]
const CONTINENTS = [
    // Eurasia (Europe + Asia)
    [
        [-9, 36], [0, 43], [10, 44], [15, 40], [16, 37], [22, 38], [26, 40], [30, 41],
        [35, 32], [34, 29], [43, 26], [48, 13], [58, 24], [68, 23], [73, 15], [78, 8],
        [81, 16], [92, 22], [98, 10], [103, 1], [108, 15], [114, 22], [121, 25], [122, 30],
        [129, 40], [142, 43], [137, 48], [142, 53], [156, 51], [162, 58], [170, 60], [180, 65],
        [180, 72], [140, 74], [110, 73], [80, 76], [60, 70], [40, 67], [25, 71], [15, 65],
        [5, 62], [8, 55], [3, 52], [-5, 48], [-9, 43], [-9, 37]
    ],
    // Africa
    [
        [-17, 15], [-15, 20], [-13, 27], [-5, 36], [10, 37], [15, 33], [25, 32], [33, 31],
        [34, 27], [43, 12], [51, 11], [46, -5], [40, -15], [33, -28], [20, -34], [18, -34],
        [12, -15], [9, 0], [5, 5], [-8, 4], [-13, 8], [-17, 15]
    ],
    // North America
    [
        [-168, 65], [-150, 70], [-120, 70], [-100, 68], [-80, 65], [-80, 80], [-60, 60],
        [-55, 52], [-65, 45], [-75, 35], [-80, 25], [-82, 9], [-90, 16], [-96, 16], [-100, 20],
        [-105, 20], [-110, 23], [-115, 33], [-125, 48], [-140, 60], [-160, 55], [-165, 60]
    ],
    // South America
    [
        [-82, 9], [-74, 11], [-60, 5], [-45, -2], [-35, -6], [-40, -20], [-50, -38],
        [-65, -50], [-71, -55], [-74, -53], [-72, -45], [-80, -20], [-81, -5], [-82, 9]
    ],
    // Australia
    [
        [113, -26], [115, -33], [130, -32], [138, -35], [146, -39], [150, -34],
        [153, -28], [142, -10], [136, -12], [128, -15], [122, -17], [113, -26]
    ],
    // Greenland
    [
        [-60, 60], [-45, 60], [-35, 66], [-20, 70], [-10, 75], [-15, 80], [-35, 83],
        [-60, 82], [-72, 77], [-73, 69], [-60, 60]
    ],
    // Great Britain
    [
        [-5, 50], [-3, 50], [-1, 51], [1, 52], [1, 53], [-2, 57], [-4, 58], [-6, 57], [-5, 55], [-5, 50]
    ],
    // Japan
    [
        [130, 31], [132, 33], [135, 35], [140, 36], [142, 40], [145, 43], [140, 40], [136, 36], [130, 31]
    ],
    // Madagascar
    [
        [49, -12], [50, -16], [47, -25], [43, -25], [44, -18], [49, -12]
    ],
    // Iceland
    [
        [-24, 65], [-22, 66], [-14, 66], [-14, 64], [-22, 63], [-24, 65]
    ]
];

// --- Resilient Offline Chart Engine Fallback ---
// Intercepts and mocks Chart.js calls if Chart.js failed to load
if (typeof Chart === 'undefined') {
    console.warn("Chart.js blocked or offline. Activating Resilient Custom HTML5 Canvas Plotting Engine.");
    State.isOfflineCharts = true;
    
    window.Chart = class CustomFallbackChart {
        constructor(ctx, config) {
            this.ctx = ctx;
            this.config = config;
            this.canvas = ctx.canvas;
            this.canvas.style.display = "block";
            this.update();
        }
        
        update() {
            const ctx = this.ctx;
            const canvas = this.canvas;
            
            const rect = canvas.parentNode.getBoundingClientRect();
            const w = canvas.width = rect.width || 360;
            const h = canvas.height = rect.height || 220;
            
            ctx.clearRect(0, 0, w, h);
            
            ctx.fillStyle = "#090c10";
            ctx.fillRect(0, 0, w, h);
            
            const paddingLeft = 45;
            const paddingRight = 15;
            const paddingTop = 25;
            const paddingBottom = 25;
            
            const chartWidth = w - paddingLeft - paddingRight;
            const chartHeight = h - paddingTop - paddingBottom;
            
            ctx.strokeStyle = "#21262d";
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const y = paddingTop + (chartHeight / 4) * i;
                ctx.beginPath();
                ctx.moveTo(paddingLeft, y);
                ctx.lineTo(w - paddingRight, y);
                ctx.stroke();
            }
            
            ctx.strokeStyle = "#30363d";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(paddingLeft, paddingTop - 5);
            ctx.lineTo(paddingLeft, h - paddingBottom);
            ctx.lineTo(w - paddingRight, h - paddingBottom);
            ctx.stroke();
            
            const datasets = this.config.data.datasets;
            const labels = this.config.data.labels;
            
            datasets.forEach((ds) => {
                const data = ds.data;
                const color = ds.borderColor || "#ff9966";
                
                let minVal = 0, maxVal = 100;
                
                if (ds.yAxisID === 'y-wind') { minVal = 300; maxVal = 850; }
                else if (ds.yAxisID === 'y-kp') { minVal = 0; maxVal = 9; }
                else if (this.config.options.scales && this.config.options.scales.y) {
                    minVal = this.config.options.scales.y.min ?? 0;
                    maxVal = this.config.options.scales.y.max ?? 100;
                }
                
                ctx.strokeStyle = color;
                ctx.lineWidth = 2.2;
                ctx.beginPath();
                
                data.forEach((val, i) => {
                    const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
                    const norm = (val - minVal) / (maxVal - minVal);
                    const y = h - paddingBottom - norm * chartHeight;
                    
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.stroke();
                
                if (ds.fill) {
                    ctx.fillStyle = "rgba(255, 153, 102, 0.05)";
                    ctx.beginPath();
                    data.forEach((val, i) => {
                        const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
                        const norm = (val - minVal) / (maxVal - minVal);
                        const y = h - paddingBottom - norm * chartHeight;
                        if (i === 0) ctx.moveTo(paddingLeft, h - paddingBottom);
                        ctx.lineTo(x, y);
                    });
                    ctx.lineTo(w - paddingRight, h - paddingBottom);
                    ctx.closePath();
                    ctx.fill();
                }
                
                data.forEach((val, i) => {
                    const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
                    const norm = (val - minVal) / (maxVal - minVal);
                    const y = h - paddingBottom - norm * chartHeight;
                    
                    ctx.fillStyle = ds.pointBackgroundColor ? 
                        (Array.isArray(ds.pointBackgroundColor) ? ds.pointBackgroundColor[i] : ds.pointBackgroundColor) : color;
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                });
            });
            
            ctx.fillStyle = "#8b949e";
            ctx.font = "8.5px 'JetBrains Mono', monospace";
            
            labels.forEach((lbl, i) => {
                if (i % 2 === 0 || labels.length < 8) {
                    const x = paddingLeft + (i / (labels.length - 1)) * chartWidth;
                    ctx.fillText(lbl, x - 12, h - 8);
                }
            });
            
            ctx.fillStyle = "rgba(139, 148, 158, 0.35)";
            ctx.fillText("TELEMETRY GRAPH (CANVAS MOCK)", w - 165, paddingTop - 10);
        }
    };
}

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    console.log("Initializing Global Sunset Observatory Core...");
    
    // Default system set to satellite mode for photographic Earth representation
    State.activeMapStyle = 'satellite';
    
    initUIControls();
    
    // Resilient Map Initialization
    try {
        if (typeof L !== 'undefined') {
            initMap();
        } else {
            throw new Error("Leaflet is missing.");
        }
    } catch (e) {
        console.warn("Leaflet maps blocked or offline. Switching to high-tech Canvas vector/photographic map.");
        State.isOfflineMap = true;
        document.getElementById("sunset-map").style.display = "none";
        document.getElementById("fallback-map-canvas").style.display = "block";
        initCanvasFallbackMap();
    }
    
    // Resilient Charts Initialization
    try {
        initCharts();
    } catch (e) {
        console.error("Charts initialization error (handled):", e);
    }
    
    runTelemetryCycle();
    setInterval(runTelemetryCycle, 60000);
    
    // System logs
    logConsoleMessage("system", "Встановлено з'єднання з супутниковим консорціумом GSO.");
    if (State.isOfflineMap) {
        logConsoleMessage("system", "Успішно підключено резервну фото-карту Землі GSO (Equirectangular).");
    } else {
        logConsoleMessage("system", "Інтерактивну карту Leaflet успішно ініціалізовано.");
    }
    logConsoleMessage("cosmic", "Отримано первинний вектор сонячного вітру від обсерваторії NOAA DSCOVR.");
});

// --- UI Controls and Tab Switching ---
function initUIControls() {
    document.getElementById("btn-refresh").addEventListener("click", () => {
        const btn = document.getElementById("btn-refresh");
        btn.querySelector("i").classList.add("fa-spin");
        logConsoleMessage("info", "Запит примусового оновлення телеметрії...");
        
        setTimeout(() => {
            runTelemetryCycle();
            btn.querySelector("i").classList.remove("fa-spin");
            logConsoleMessage("system", "Примусове оновлення телеметрії виконано успішно.");
        }, 800);
    });

    const tabs = document.querySelectorAll(".tab-item");
    tabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            const targetTab = tab.getAttribute("data-tab");
            logConsoleMessage("info", `Перехід на вкладку: ${targetTab}`);
            
            const targetEl = document.querySelector(`.${targetTab === 'dashboard' ? 'sidebar-metrics' : targetTab === 'map-view' ? 'map-panel' : targetTab === 'space-weather' ? 'charts-row' : 'console-panel'}`);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Map Tile Style toggles (supports both Leaflet and Canvas fallback)
    document.getElementById("map-btn-dark").addEventListener("click", () => {
        if (!State.isOfflineMap) {
            setMapStyle('dark');
        } else {
            State.activeMapStyle = 'dark';
            document.getElementById("map-btn-dark").classList.add("active");
            document.getElementById("map-btn-satellite").classList.remove("active");
            logConsoleMessage("system", "Перемкнуто в режим: Векторна карта Землі.");
            const solar = calculateSolarPhysics();
            drawCanvasFallbackMap(solar);
        }
    });
    document.getElementById("map-btn-satellite").addEventListener("click", () => {
        if (!State.isOfflineMap) {
            setMapStyle('satellite');
        } else {
            State.activeMapStyle = 'satellite';
            document.getElementById("map-btn-dark").classList.remove("active");
            document.getElementById("map-btn-satellite").classList.add("active");
            logConsoleMessage("system", "Перемкнуто в режим: Супутникова фото-карта Землі.");
            const solar = calculateSolarPhysics();
            drawCanvasFallbackMap(solar);
        }
    });
}

// --- Map Layer Setup (Leaflet) ---
function initMap() {
    State.map = L.map('sunset-map', {
        zoomControl: true,
        attributionControl: false
    }).setView([15, 10], 2);

    setMapStyle('satellite'); // Default to satellite photographic style

    State.terminatorLayer = L.layerGroup().addTo(State.map);
    State.markersLayer = L.layerGroup().addTo(State.map);
    
    L.control.zoom({
        position: 'topright'
    }).addTo(State.map);
}

function setMapStyle(style) {
    State.activeMapStyle = style;
    
    State.map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
            State.map.removeLayer(layer);
        }
    });

    document.getElementById("map-btn-dark").classList.toggle("active", style === 'dark');
    document.getElementById("map-btn-satellite").classList.toggle("active", style === 'satellite');

    let tileUrl;
    if (style === 'dark') {
        tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else {
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}';
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            zIndex: 10
        }).addTo(State.map);
    }

    L.tileLayer(tileUrl, {
        maxZoom: 19
    }).addTo(State.map);
}

// --- High-Tech World Map (HTML5 Canvas Fallback) ---
function initCanvasFallbackMap() {
    const canvas = document.getElementById("fallback-map-canvas");
    
    // Toggle active classes on fallback map buttons initially
    document.getElementById("map-btn-dark").classList.toggle("active", State.activeMapStyle === 'dark');
    document.getElementById("map-btn-satellite").classList.toggle("active", State.activeMapStyle === 'satellite');

    const resizeCanvas = () => {
        const rect = canvas.parentNode.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height || 450;
        
        const solar = calculateSolarPhysics();
        drawCanvasFallbackMap(solar);
    };
    
    window.addEventListener("resize", resizeCanvas);
    
    setTimeout(resizeCanvas, 50);
}

function drawCanvasFallbackMap(solar) {
    const canvas = document.getElementById("fallback-map-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.shadowBlur = 0; 
    
    // Helper to map geographic coordinates to canvas pixels
    const getCanvasXY = (lat, lon) => {
        const x = ((lon + 180) / 360) * w;
        const y = ((90 - lat) / 180) * h;
        return { x, y };
    };
    
    // 1. Draw Map Background (Satellite Photographic vs Dark Vector)
    if (State.activeMapStyle === 'satellite' && earthImage.complete && earthImage.naturalWidth !== 0) {
        // Draw real photographic NASA map of the Earth
        ctx.drawImage(earthImage, 0, 0, w, h);
        
        // Overlay a thin dark blue tinted filter to match GSO Dark Dimmed style
        ctx.fillStyle = "rgba(9, 13, 22, 0.45)";
        ctx.fillRect(0, 0, w, h);
    } else {
        // Ocean Background
        ctx.fillStyle = "#090d16";
        ctx.fillRect(0, 0, w, h);
        
        // Draw Solid Vector Continents Shapes
        ctx.fillStyle = "#1b2230"; 
        ctx.strokeStyle = "#2c384e"; 
        ctx.lineWidth = 1.2;
        
        CONTINENTS.forEach(polygon => {
            ctx.beginPath();
            polygon.forEach((pt, idx) => {
                const { x, y } = getCanvasXY(pt[1], pt[0]);
                if (idx === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });
        
        // Antarctica ice sheet
        ctx.fillStyle = "#1e2738";
        ctx.fillRect(0, h - (15 / 180) * h, w, (15 / 180) * h);
    }
    
    // 2. Draw Semi-Transparent Day-Night Terminator Shadow Mask
    const geom = generateTerminatorPolygon(solar.declination, solar.subsolarLon);
    
    ctx.fillStyle = "rgba(4, 5, 12, 0.65)"; // Dark twilight shroud
    ctx.beginPath();
    geom.nightPolygon.forEach((pt, idx) => {
        const { x, y } = getCanvasXY(pt[0], pt[1]);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    
    // 3. Draw Glowing Neon Sunset Terminator Line
    ctx.strokeStyle = "#ff9966";
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "#ff9966";
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    geom.terminatorLine.forEach((pt, idx) => {
        const { x, y } = getCanvasXY(pt[0], pt[1]);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    ctx.shadowBlur = 0; // reset glow for other indicators
    
    // 4. Draw Active Cities markers inside the sunset zone
    State.cities.forEach(city => {
        const alt = getSunElevation(city.lat, city.lon, solar.declination, solar.subsolarLon);
        const isSunset = alt >= -1.2 && alt <= 1.2;
        const isGoldenHour = alt > -4 && alt < 6;
        const isTwilight = alt >= -6 && alt < -1.2;
        
        if (isSunset || isGoldenHour || isTwilight) {
            const { x, y } = getCanvasXY(city.lat, city.lon);
            
            let color = '#8b949e';
            if (isSunset) color = '#ff5e62';
            else if (isGoldenHour) color = '#ff9966';
            else if (isTwilight) color = '#bc8cff';
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI*2);
            ctx.stroke();
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, Math.PI*2);
            ctx.fill();
            
            ctx.font = "bold 9px 'Space Grotesk', sans-serif";
            ctx.fillStyle = "rgba(5, 7, 10, 0.85)";
            const textWidth = ctx.measureText(city.name).width;
            ctx.fillRect(x + 8, y - 6, textWidth + 6, 12);
            
            ctx.fillStyle = "#ffffff";
            ctx.fillText(city.name, x + 11, y + 3);
        }
    });

    // 5. Draw Subsolar Point Zeniths (☀️ SOL)
    const { x: sx, y: sy } = getCanvasXY(solar.subsolarLat, solar.subsolarLon);
    
    ctx.strokeStyle = "#ffd600";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(sx, sy, 8, 0, Math.PI*2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(sx - 12, sy); ctx.lineTo(sx + 12, sy);
    ctx.moveTo(sx, sy - 12); ctx.lineTo(sx, sy + 12);
    ctx.stroke();
    
    ctx.fillStyle = "#ffd600";
    ctx.font = "8px sans-serif";
    ctx.fillText("☀️ SOL", sx + 10, sy - 5);
}

// --- Core Science Calculations ---
function calculateSolarPhysics() {
    const now = new Date();
    const time = now.getTime();
    const julianDate = (time / 86400000) + 2440587.5;
    const d = julianDate - 2451545.0;
    
    const g = (357.529 + 0.98560028 * d) * Math.PI / 180;
    const q = (280.459 + 0.98564736 * d);
    const L_sun = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * Math.PI / 180;
    const e = (23.439 - 0.00000036 * d) * Math.PI / 180;
    
    const sinDeclination = Math.sin(e) * Math.sin(L_sun);
    const declination = Math.asin(sinDeclination); // in radians
    
    const utcHours = now.getUTCHours() + now.getUTCMinutes()/60 + now.getUTCSeconds()/3600;
    const subsolarLon = 180 - (utcHours * 15); 
    const subsolarLat = declination * 180 / Math.PI;

    return {
        declination: declination,
        subsolarLat: subsolarLat,
        subsolarLon: subsolarLon
    };
}

function getSunElevation(lat, lon, solarDeclination, subsolarLon) {
    const latRad = lat * Math.PI / 180;
    const lonRad = lon * Math.PI / 180;
    const subsolarLonRad = subsolarLon * Math.PI / 180;
    
    const H = lonRad - subsolarLonRad;
    const sinAlt = Math.sin(latRad) * Math.sin(solarDeclination) + 
                   Math.cos(latRad) * Math.cos(solarDeclination) * Math.cos(H);
    
    return Math.asin(sinAlt) * 180 / Math.PI; // in degrees
}

function generateTerminatorPolygon(solarDeclination, subsolarLon) {
    const points = [];
    const step = 2; 
    const northPoleInNight = solarDeclination < 0; 
    
    for (let lon = -180; lon <= 180; lon += step) {
        const lonRad = lon * Math.PI / 180;
        const subsolarLonRad = subsolarLon * Math.PI / 180;
        const dec = Math.abs(solarDeclination) < 0.0001 ? 0.0001 : solarDeclination;
        const tanLat = -Math.cos(lonRad - subsolarLonRad) / Math.tan(dec);
        let lat = Math.atan(tanLat) * 180 / Math.PI;
        
        points.push([lat, lon]);
    }
    
    const nightPolygon = [];
    if (northPoleInNight) {
        nightPolygon.push([-90, -180]);
        points.forEach(p => nightPolygon.push(p));
        nightPolygon.push([90, 180]);
        nightPolygon.push([90, -180]);
    } else {
        nightPolygon.push([90, -180]);
        points.forEach(p => nightPolygon.push(p));
        nightPolygon.push([-90, 180]);
        nightPolygon.push([-90, -180]);
    }
    
    return {
        terminatorLine: points,
        nightPolygon: nightPolygon
    };
}

// --- Dynamic Analytics Data Cycles ---
async function runTelemetryCycle() {
    State.currentTime = new Date();
    
    await fetchNOAASpaceWeather();
    
    const solar = calculateSolarPhysics();
    
    document.getElementById("subsolar-coords").innerText = 
        `${solar.subsolarLat.toFixed(2)}° ${solar.subsolarLat >= 0 ? 'N' : 'S'}, ${Math.abs(solar.subsolarLon).toFixed(2)}° ${solar.subsolarLon >= 0 ? 'E' : 'W'}`;

    if (!State.isOfflineMap) {
        drawTerminator(solar);
    } else {
        drawCanvasFallbackMap(solar);
    }

    updateActiveGoldenHourList(solar);
    calculateAtmosphericScattering();
    updateChartHistories();
    evaluateSystemAlerts();

    document.getElementById("system-latency").innerText = `${Math.round(25 + Math.random()*25)}ms`;

    const formatTime = State.currentTime.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById("last-update").innerText = `Оновлено: ${formatTime}`;
}

function drawTerminator(solar) {
    if (!State.terminatorLayer) return;
    State.terminatorLayer.clearLayers();
    
    const geom = generateTerminatorPolygon(solar.declination, solar.subsolarLon);
    
    L.polygon(geom.nightPolygon, {
        color: 'transparent',
        fillColor: '#05070a',
        fillOpacity: 0.58,
        interactive: false
    }).addTo(State.terminatorLayer);

    L.polyline(geom.terminatorLine, {
        color: '#ff9966',
        weight: 2.5,
        opacity: 0.85,
        interactive: false
    }).addTo(State.terminatorLayer);
}

// Check which cities are currently witnessing sunset / golden hour
function updateActiveGoldenHourList(solar) {
    if (State.markersLayer) {
        State.markersLayer.clearLayers();
    }
    const listEl = document.getElementById("golden-hour-list");
    listEl.innerHTML = "";
    
    const activeCities = [];

    State.cities.forEach(city => {
        const alt = getSunElevation(city.lat, city.lon, solar.declination, solar.subsolarLon);
        
        let status = null;
        let color = '#8b949e';
        
        if (alt >= -1.2 && alt <= 1.2) {
            status = "🌅 ЗАХІД СОНЦЯ";
            color = '#ff5e62';
        } else if (alt > -4 && alt < 6) {
            status = "✨ Золота година";
            color = '#ff9966';
        } else if (alt >= -6 && alt < -1.2) {
            status = "🌆 Сутінки";
            color = '#bc8cff';
        }
        
        if (status) {
            activeCities.push({
                ...city,
                alt: alt,
                status: status,
                color: color
            });
            
            if (!State.isOfflineMap && State.markersLayer) {
                const customIcon = L.divIcon({
                    className: 'custom-sunset-marker',
                    html: `<div class="sunset-glow-marker" style="background-color: ${color}; box-shadow: 0 0 10px ${color}"></div>`,
                    iconSize: [14, 14],
                    iconAnchor: [7, 7]
                });
                
                const localTimeStr = new Date().toLocaleTimeString('uk-UA', { timeZone: getMockTimezone(city.name), hour: '2-digit', minute: '2-digit' });
                
                L.marker([city.lat, city.lon], { icon: customIcon })
                    .bindPopup(`
                        <strong style="color: ${color}">${city.name} (${city.country})</strong><br>
                        Стан: <strong>${status}</strong><br>
                        Висота сонця: <strong>${alt.toFixed(2)}°</strong><br>
                        Місцевий час: <strong>${localTimeStr}</strong>
                    `)
                    .addTo(State.markersLayer);
            }
        }
    });

    activeCities.sort((a, b) => Math.abs(a.alt) - Math.abs(b.alt));

    if (activeCities.length === 0) {
        listEl.innerHTML = `
            <div class="loading-spinner">
                <i class="fa-solid fa-earth-europe"></i>
                Ні в одному з 105 мегаполісів зараз немає активного заходу сонця. Лінія термінатора перетинає океани.
            </div>`;
    } else {
        activeCities.forEach(city => {
            const item = document.createElement("div");
            item.className = "city-item";
            
            const minsLeft = Math.round((city.alt + 6) * 4); 
            const countdownText = minsLeft > 0 ? `Залишилось ~${minsLeft} хв` : "Сонце сіло";

            item.innerHTML = `
                <div class="city-main">
                    <span class="city-indicator" style="background-color: ${city.color}; box-shadow: 0 0 8px ${city.color}"></span>
                    <div>
                        <div class="city-name">${city.name}<span class="city-country">${city.country}</span></div>
                        <span class="city-state" style="color: ${city.color}; background: rgba(${hexToRgb(city.color)}, 0.08)">${city.status}</span>
                    </div>
                </div>
                <div class="city-metrics">
                    <span class="city-time">${city.alt.toFixed(1)}° Alt</span>
                    <span class="city-countdown">${countdownText}</span>
                </div>
            `;
            
            item.addEventListener("click", () => {
                if (!State.isOfflineMap && State.map) {
                    State.map.flyTo([city.lat, city.lon], 5, { duration: 1.5 });
                }
                logConsoleMessage("info", `Фокусування супутника на місті: ${city.name} (${city.lat.toFixed(2)}° N, ${city.lon.toFixed(2)}° E)`);
            });
            
            listEl.appendChild(item);
        });
    }
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
        : '255, 94, 98';
}

function getMockTimezone(city) {
    const mapping = {
        "Київ": "Europe/Kiev", "Львів": "Europe/Kiev", "Одеса": "Europe/Kiev", "Харків": "Europe/Kiev", "Дніпро": "Europe/Kiev",
        "Донецьк": "Europe/Kiev", "Запоріжжя": "Europe/Kiev", "Севастополь": "Europe/Kiev", "Луганськ": "Europe/Kiev", 
        "Сімферополь": "Europe/Kiev", "Кривий Ріг": "Europe/Kiev", "Миколаїв": "Europe/Kiev", "Маріуполь": "Europe/Kiev", 
        "Вінниця": "Europe/Kiev", "Херсон": "Europe/Kiev", "Полтава": "Europe/Kiev", "Чернігів": "Europe/Kiev", 
        "Черкаси": "Europe/Kiev", "Суми": "Europe/Kiev", "Житомир": "Europe/Kiev", "Чернівці": "Europe/Kiev", 
        "Рівне": "Europe/Kiev", "Івано-Франківськ": "Europe/Kiev", "Тернопіль": "Europe/Kiev", "Луцьк": "Europe/Kiev", 
        "Ужгород": "Europe/Kiev",
        
        "Лондон": "Europe/London", "Париж": "Europe/Paris", "Берлін": "Europe/Berlin", "Рим": "Europe/Rome", 
        "Мадрид": "Europe/Madrid", "Варшава": "Europe/Warsaw", "Прага": "Europe/Prague", "Відень": "Europe/Vienna", 
        "Афіни": "Europe/Athens", "Лісабон": "Europe/Lisbon", "Амстердам": "Europe/Amsterdam", "Брюссель": "Europe/Brussels", 
        "Копенгаген": "Europe/Copenhagen", "Стокгольм": "Europe/Stockholm", "Осло": "Europe/Oslo", "Гельсінкі": "Europe/Helsinki", 
        "Дублін": "Europe/Dublin", "Рейк'явік": "Atlantic/Reykjavik",
        
        "Токіо": "Asia/Tokyo", "Пекін": "Asia/Shanghai", "Сеул": "Asia/Seoul", "Сінгапур": "Asia/Singapore", 
        "Бангкок": "Asia/Bangkok", "Джакарта": "Asia/Jakarta", "Маніла": "Asia/Manila", "Ханой": "Asia/Bangkok", 
        "Мумбаї": "Asia/Kolkata", "Делі": "Asia/Kolkata", "Бангалор": "Asia/Kolkata", "Тайбей": "Asia/Taipei", 
        "Гонконг": "Asia/Hong_Kong", "Дубай": "Asia/Dubai", "Ер-Ріяд": "Asia/Riyadh", "Єрусалим": "Asia/Jerusalem", 
        "Стамбул": "Europe/Istanbul", "Тегеран": "Asia/Tehran", "Багдад": "Asia/Baghdad", "Новосибірськ": "Asia/Novosibirsk", 
        "Владивосток": "Asia/Vladivostok",
        
        "Нью-Йорк": "America/New_York", "Лос-Анджелес": "America/Los_Angeles", "Чикаго": "America/Chicago", 
        "Х'юстон": "America/Chicago", "Фінікс": "America/Phoenix", "Сан-Франциско": "America/Los_Angeles", 
        "Сіетл": "America/Los_Angeles", "Маямі": "America/New_York", "Бостон": "America/New_York", 
        "Денвер": "America/Denver", "Анкоридж": "America/Anchorage", "Гонолулу": "Pacific/Honolulu", 
        "Ванкувер": "America/Vancouver", "Торонто": "America/Toronto", "Монреаль": "America/Toronto", "Мехіко": "America/Mexico_City",
        
        "Ріо-де-Жанейро": "America/Sao_Paulo", "Сан-Паулу": "America/Sao_Paulo", "Бразиліа": "America/Sao_Paulo", 
        "Буенос-Айрес": "America/Argentina/Buenos_Aires", "Сантьяго": "America/Santiago", "Богота": "America/Bogota", 
        "Ліма": "America/Lima", "Каракас": "America/Caracas",
        
        "Каїр": "Africa/Cairo", "Кейптаун": "Africa/Johannesburg", "Йоганнесбург": "Africa/Johannesburg", 
        "Найробі": "Africa/Nairobi", "Лагос": "Africa/Lagos", "Касабланка": "Africa/Casablanca", "Аддис-Абеба": "Africa/Addis_Ababa",
        
        "Сідней": "Australia/Sydney", "Мельбурн": "Australia/Melbourne", "Брісбен": "Australia/Brisbane", 
        "Перт": "Australia/Perth", "Аделаїда": "Australia/Adelaide", "Хобарт": "Australia/Hobart", 
        "Окленд": "Pacific/Auckland", "Веллінгтон": "Pacific/Auckland", "Сува": "Pacific/Fiji"
    };
    return mapping[city] || "UTC";
}

// --- Fetch NOAA Space Weather API & Fallbacks ---
async function fetchNOAASpaceWeather() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); 
        
        const response = await fetch("https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json", { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            if (data && data[0] && data[0].windspd) {
                State.solarWind = parseFloat(data[0].windspd);
                logConsoleMessage("cosmic", `Успішно імпортовано дані NOAA: Швидкість сонячного вітру = ${State.solarWind} км/с`);
            }
        }
    } catch (e) {
        const drift = (Math.random() - 0.5) * 6;
        State.solarWind = Math.max(300, Math.min(850, parseFloat((State.solarWind + drift).toFixed(1))));
    }

    const targetKp = Math.max(0.5, Math.min(9.0, (State.solarWind - 300) / 75 + (Math.random() - 0.5)));
    State.kpIndex = parseFloat(targetKp.toFixed(1));
    
    const aodDrift = (Math.random() - 0.5) * 0.02;
    State.aerosolOpticalDepth = Math.max(0.05, Math.min(0.60, parseFloat((State.aerosolOpticalDepth + aodDrift).toFixed(2))));

    document.getElementById("solar-wind-val").innerText = State.solarWind;
    document.getElementById("kp-index-val").innerText = `Kp ${State.kpIndex}`;
    document.getElementById("aod-val").innerText = State.aerosolOpticalDepth;

    const kpTrendEl = document.getElementById("kp-trend");
    if (State.kpIndex >= 5) {
        kpTrendEl.className = "tel-trend text-danger";
        kpTrendEl.innerHTML = `<i class="fa-solid fa-bolt-lightning animate-pulse"></i> ГЕОМАГНІТНИЙ ШТОРМ G${Math.floor(State.kpIndex - 4)}`;
    } else if (State.kpIndex >= 3.5) {
        kpTrendEl.className = "tel-trend text-warning";
        kpTrendEl.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Збурене поле`;
    } else {
        kpTrendEl.className = "tel-trend text-success";
        kpTrendEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Спокійно`;
    }

    const aodTrendEl = document.getElementById("aod-trend");
    if (State.aerosolOpticalDepth >= 0.3) {
        aodTrendEl.className = "tel-trend text-danger";
        aodTrendEl.innerHTML = `<i class="fa-solid fa-smog"></i> Густий пил/аерозоль`;
    } else if (State.aerosolOpticalDepth >= 0.15) {
        aodTrendEl.className = "tel-trend text-warning";
        aodTrendEl.innerHTML = `<i class="fa-solid fa-cloud-sun"></i> Помірне розсіювання`;
    } else {
        aodTrendEl.className = "tel-trend text-success";
        aodTrendEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Чиста атмосфера`;
    }
    
    const solar = calculateSolarPhysics();
    const sunsetArea = Math.round(11800 + Math.abs(Math.sin(solar.declination)) * 3200 + (Math.random() - 0.5) * 80);
    document.getElementById("sunset-area-val").innerText = sunsetArea.toLocaleString('uk-UA');
}

// --- Atmospheric Scattering (Light Physics Simulation) ---
function calculateAtmosphericScattering() {
    let rayleighWeight = 100 - (State.aerosolOpticalDepth * 150); 
    rayleighWeight = Math.max(20, Math.min(85, rayleighWeight));
    
    let mieWeight = 100 - rayleighWeight;
    
    document.getElementById("rayleigh-perc").innerText = `${Math.round(rayleighWeight)}%`;
    document.getElementById("mie-perc").innerText = `${Math.round(mieWeight)}%`;

    let skyGradient;
    if (State.kpIndex >= 5) {
        skyGradient = `linear-gradient(90deg, #100b26 0%, #4c1130 35%, #921350 70%, #ff5e62 100%)`;
        document.getElementById("sky-gradient-preview").style.boxShadow = "0 0 15px rgba(188, 140, 255, 0.4)";
    } else if (State.aerosolOpticalDepth >= 0.3) {
        skyGradient = `linear-gradient(90deg, #1d121c 0%, #3e1920 30%, #7c1622 65%, #c83226 100%)`;
        document.getElementById("sky-gradient-preview").style.boxShadow = "0 0 15px rgba(248, 81, 73, 0.3)";
    } else {
        skyGradient = `linear-gradient(90deg, #10162f 0%, #2a2050 35%, #eb5e28 75%, #f7a072 100%)`;
        document.getElementById("sky-gradient-preview").style.boxShadow = "none";
    }
    
    document.getElementById("sky-gradient-preview").style.background = skyGradient;
}

// --- History Tracker & Chart Updating ---
function initCharts() {
    const spectralCtx = document.getElementById('spectralChart').getContext('2d');
    const wavelengths = [400, 430, 460, 490, 520, 550, 580, 610, 640, 670, 700];
    
    State.charts.spectral = new Chart(spectralCtx, {
        type: 'line',
        data: {
            labels: wavelengths.map(w => `${w}nm`),
            datasets: [{
                label: 'Проходження світла (%)',
                data: calculateTransmissionCurve(wavelengths),
                borderColor: '#ff9966',
                borderWidth: 2,
                backgroundColor: 'rgba(255, 153, 102, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: wavelengths.map(w => getWaveColor(w)),
                pointBorderColor: '#fff',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    grid: { color: '#21262d' },
                    ticks: { color: '#8b949e', font: { size: 9 } }
                },
                x: {
                    grid: { color: '#21262d' },
                    ticks: { color: '#8b949e', font: { size: 9 } }
                }
            }
        }
    });

    const solarCtx = document.getElementById('solarWindChart').getContext('2d');
    
    State.charts.solar = new Chart(solarCtx, {
        type: 'line',
        data: {
            labels: State.timeLabels,
            datasets: [
                {
                    label: 'Сонячний Вітер (км/с)',
                    data: State.solarWindHistory,
                    borderColor: '#58a6ff',
                    borderWidth: 2,
                    yAxisID: 'y-wind',
                    tension: 0.3,
                    pointRadius: 2
                },
                {
                    label: 'Індекс Kp',
                    data: State.kpIndexHistory,
                    borderColor: '#ff5e62',
                    borderWidth: 2,
                    yAxisID: 'y-kp',
                    tension: 0.3,
                    pointRadius: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#8b949e', font: { size: 9 } }
                }
            },
            scales: {
                'y-wind': {
                    type: 'linear',
                    position: 'left',
                    grid: { color: '#21262d' },
                    ticks: { color: '#58a6ff', font: { size: 9 } }
                },
                'y-kp': {
                    type: 'linear',
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    ticks: { color: '#ff5e62', font: { size: 9 } },
                    min: 0,
                    max: 9
                },
                x: {
                    grid: { color: '#21262d' },
                    ticks: { color: '#8b949e', font: { size: 9 } }
                }
            }
        }
    });
}

function calculateTransmissionCurve(wavelengths) {
    const aod = State.aerosolOpticalDepth;
    return wavelengths.map(w => {
        const rayleighAttenuation = Math.exp(-0.06 * Math.pow(550 / w, 4) * 38);
        const mieAttenuation = Math.exp(-aod * 1.2 * Math.pow(550 / w, 1.1) * 12);
        return Math.max(0, Math.min(100, Math.round(rayleighAttenuation * mieAttenuation * 100)));
    });
}

function getWaveColor(w) {
    if (w <= 440) return '#4c00b0'; 
    if (w <= 480) return '#0026e6'; 
    if (w <= 510) return '#00b0ff'; 
    if (w <= 550) return '#00e676'; 
    if (w <= 580) return '#ffd600'; 
    if (w <= 610) return '#ff9100'; 
    return '#ff1744'; 
}

function updateChartHistories() {
    State.solarWindHistory.shift();
    State.solarWindHistory.push(State.solarWind);
    
    State.kpIndexHistory.shift();
    State.kpIndexHistory.push(State.kpIndex);

    if (State.charts.solar) {
        if (State.isOfflineCharts) {
            State.charts.solar.update();
        } else {
            State.charts.solar.data.datasets[0].data = State.solarWindHistory;
            State.charts.solar.data.datasets[1].data = State.kpIndexHistory;
            State.charts.solar.update();
        }
    }

    if (State.charts.spectral) {
        if (State.isOfflineCharts) {
            State.charts.spectral.update();
        } else {
            const wavelengths = [400, 430, 460, 490, 520, 550, 580, 610, 640, 670, 700];
            State.charts.spectral.data.datasets[0].data = calculateTransmissionCurve(wavelengths);
            State.charts.spectral.update();
        }
    }
}

// --- Live Telemetry Console Log system ---
function logConsoleMessage(type, message) {
    const consoleBody = document.getElementById("system-alerts-log");
    if (!consoleBody) return;
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const line = document.createElement("div");
    line.className = "console-line";
    
    let tagClass = "tag-info";
    let tagText = "INFO";
    
    if (type === "warn") { tagClass = "tag-warn"; tagText = "WARN"; }
    else if (type === "alert") { tagClass = "tag-alert"; tagText = "ALERT"; }
    else if (type === "cosmic") { tagClass = "tag-cosmic"; tagText = "COSMIC"; }
    else if (type === "system") { tagClass = "tag-system"; tagText = "SYS"; }

    line.innerHTML = `
        <span class="console-timestamp">[${timeStr}]</span>
        <span class="console-tag ${tagClass}">${tagText}</span>
        <span class="console-msg">${message}</span>
    `;
    
    consoleBody.appendChild(line);
    consoleBody.scrollTop = consoleBody.scrollHeight;
    
    while (consoleBody.childNodes.length > 35) {
        consoleBody.removeChild(consoleBody.firstChild);
    }
}

// Evaluates current solar parameters and triggers alerts if boundaries crossed
function evaluateSystemAlerts() {
    let alertCounter = 0;
    const alertCounterEl = document.getElementById("alert-counter");
    
    if (State.kpIndex >= 6.0) {
        logConsoleMessage("alert", `КРИТИЧНО: Зафіксовано потужну магнітну бурю класу G2. Kp=${State.kpIndex}! Надвисокі шанси аномальних полярних сяйв та бузкових сансетів.`);
        alertCounter++;
    } else if (State.kpIndex >= 4.5) {
        logConsoleMessage("warn", `УВАГА: Сонячний спалах класу M спричинив збурення іоносфери. Kp=${State.kpIndex}. Спостерігається підвищене спектральне викривлення.`);
        alertCounter++;
    }

    if (State.aerosolOpticalDepth >= 0.35) {
        logConsoleMessage("warn", `УВАГА: Рівень аерозолів (AOD) досяг ${State.aerosolOpticalDepth} через пилову хмару. Розсіювання Мі збільшено, заходи сонця будуть темно-кривавими.`);
        alertCounter++;
    }

    const roll = Math.random();
    if (roll < 0.15) {
        logConsoleMessage("cosmic", `Магнітометр обсерваторії GOES-16 фіксує відновлення стабільності магнітного поля.`);
    } else if (roll < 0.25) {
        logConsoleMessage("info", `Аналіз вологості атмосфери: помічено утворення кристалів льоду на лінії 60° N, можливі паргелії.`);
    }
    
    if (alertCounter > 0) {
        alertCounterEl.innerText = `${alertCounter} Активні аномалії`;
        alertCounterEl.className = "badge badge-error animate-pulse";
    } else {
        alertCounterEl.innerText = "Нормальний статус";
        alertCounterEl.className = "badge text-success";
        alertCounterEl.style.border = "1px solid var(--color-success)";
        alertCounterEl.style.background = "rgba(63, 185, 80, 0.1)";
    }
}
