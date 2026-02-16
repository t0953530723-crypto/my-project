/**
 * 生活助手 App 主要邏輯
 * 包含：24H 時鐘、萬年曆、星座運勢隨機生成器
 */

const App = {
    // 數據定義
    data: {
        zodiacs: [
            { name: '牡羊', icon: '♈', range: '3.21-4.19' },
            { name: '金牛', icon: '♉', range: '4.20-5.20' },
            { name: '雙子', icon: '♊', range: '5.21-6.21' },
            { name: '巨蟹', icon: '♋', range: '6.22-7.22' },
            { name: '獅子', icon: '♌', range: '7.23-8.22' },
            { name: '處女', icon: '♍', range: '8.23-9.22' },
            { name: '天秤', icon: '♎', range: '9.23-10.23' },
            { name: '天蠍', icon: '♏', range: '10.24-11.22' },
            { name: '射手', icon: '♐', range: '11.23-12.21' },
            { name: '摩羯', icon: '摩', range: '12.22-1.19', icon_override: '♑' },
            { name: '水瓶', icon: '♒', range: '1.20-2.18' },
            { name: '雙魚', icon: '♓', range: '2.19-3.20' }
        ],
        fortuneTexts: [
            "今日運勢極佳，適合啟動新的計畫或重要的合約談判。",
            "心情平和，適合整理居家環境或與久未聯絡的好友聚餐。",
            "工作中可能遇到一些瑣碎的挑戰，保持耐心能讓事情事半功倍。",
            "財運表現亮眼，可能會有意料之外的小額收入或投資回報。",
            "感情運勢上升，與伴侶的溝通更加順暢，單身者異性緣不錯。",
            "健康第一，今日應避免過度勞累，早點休息補充體力。",
            "直覺敏銳的一天，對於複雜的問題能一眼看穿核心。",
            "建議保持低調，在人群中多聽少說，能避免不必要的紛爭。"
        ],
        currentViewDate: new Date(),
        selectedZodiacIndex: 0
    },

    // 初始化應用
    init() {
        this.startClock();
        this.renderCalendar();
        this.initZodiacSelector();
        this.bindEvents();
        this.updateFortune();
    },

    // 1. 時鐘功能
    startClock() {
        const update = () => {
            const now = new Date();
            const timeStr = [
                now.getHours(),
                now.getMinutes(),
                now.getSeconds()
            ].map(v => String(v).padStart(2, '0')).join(':');

            document.getElementById('digital-clock').textContent = timeStr;

            // 更新頂部日期
            const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
            document.getElementById('current-date').textContent =
                `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${dayNames[now.getDay()]}`;

            // 農曆更新 (透過第三方庫)
            const lunar = Lunar.fromDate(now);
            document.getElementById('lunar-date').textContent =
                `農曆 ${lunar.getYearInGanZhi()}(${lunar.getYearShengXiao()})年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
        };
        setInterval(update, 1000);
        update();
    },

    // 2. 日曆功能
    renderCalendar() {
        const year = this.data.currentViewDate.getFullYear();
        const month = this.data.currentViewDate.getMonth();

        document.getElementById('calendar-title').textContent = `${year}年 ${month + 1}月`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const calendarContainer = document.getElementById('calendar-days');
        calendarContainer.innerHTML = '';

        // 填充前置空白
        for (let i = 0; i < firstDay; i++) {
            calendarContainer.appendChild(document.createElement('div'));
        }

        const today = new Date();
        const isThisMonth = today.getFullYear() === year && today.getMonth() === month;

        for (let d = 1; d <= daysInMonth; d++) {
            const dayEl = document.createElement('div');
            const isToday = isThisMonth && today.getDate() === d;

            dayEl.className = `p-2 flex flex-col items-center justify-center rounded-xl transition-all ${isToday ? 'bg-indigo-600 text-white shadow-md scale-105' : 'hover:bg-gray-100 text-gray-700'
                }`;

            // 計算農曆
            const lunar = Lunar.fromDate(new Date(year, month, d));
            const lunarShow = lunar.getDayInChinese() === '初一' ? lunar.getMonthInChinese() + '月' : lunar.getDayInChinese();

            dayEl.innerHTML = `
                <span class="text-sm font-bold">${d}</span>
                <span class="text-[9px] ${isToday ? 'text-indigo-100' : 'text-gray-400'}">${lunarShow}</span>
            `;
            calendarContainer.appendChild(dayEl);
        }
    },

    // 3. 星座功能
    initZodiacSelector() {
        const selector = document.getElementById('zodiac-selector');
        this.data.zodiacs.forEach((z, index) => {
            const item = document.createElement('div');
            item.className = `zodiac-item ${index === 0 ? 'active' : ''}`;
            item.innerHTML = `
                <span class="text-xl mb-1">${z.icon_override || z.icon}</span>
                <span class="text-[10px] font-bold text-gray-600">${z.name}</span>
            `;
            item.onclick = () => {
                document.querySelectorAll('.zodiac-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                this.data.selectedZodiacIndex = index;
                this.updateFortune();
            };
            selector.appendChild(item);
        });
    },

    updateFortune() {
        const z = this.data.zodiacs[this.data.selectedZodiacIndex];
        const dateKey = new Date().toDateString(); // 用日期當種子，確保當天運勢不變
        const seed = (this.data.selectedZodiacIndex + dateKey.length + new Date().getDate()) % this.data.fortuneTexts.length;

        const stars = (seed % 3) + 3; // 3-5 顆星

        document.getElementById('zodiac-icon').textContent = z.icon_override || z.icon;
        document.getElementById('zodiac-name').textContent = `${z.name}座`;
        document.getElementById('zodiac-date-range').textContent = z.range;
        document.getElementById('luck-stars').textContent = '★'.repeat(stars) + '☆'.repeat(5 - stars);
        document.getElementById('luck-bar').style.width = `${stars * 20}%`;
        document.getElementById('fortune-text').textContent = this.data.fortuneTexts[seed];
    },

    // 事件綁定
    bindEvents() {
        document.getElementById('prevMonth').onclick = () => {
            this.data.currentViewDate.setMonth(this.data.currentViewDate.getMonth() - 1);
            this.renderCalendar();
        };
        document.getElementById('nextMonth').onclick = () => {
            this.data.currentViewDate.setMonth(this.data.currentViewDate.getMonth() + 1);
            this.renderCalendar();
        };
    }
};

// 啟動 App
document.addEventListener('DOMContentLoaded', () => App.init());