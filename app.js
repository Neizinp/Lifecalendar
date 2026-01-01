const TOTAL_YEARS = 80;
const WEEKS_PER_YEAR = 52;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

const grid = document.getElementById('grid');
const labelLeft = document.getElementById('label-left');
const labelRight = document.getElementById('label-right');
const btnYear = document.getElementById('btn-year');
const btnLife = document.getElementById('btn-life');
const birthdateText = document.getElementById('birthdate-text');
const birthdateNative = document.getElementById('birthdate-native');

let currentView = 'year';
let birthdate = null;

function init() {
    const saved = localStorage.getItem('birthdate');
    const defaultDate = '1991-09-24';
    const dateToUse = saved || defaultDate;
    
    birthdate = new Date(dateToUse);
    if (birthdateText) birthdateText.value = dateToUse;
    if (birthdateNative) {
        birthdateNative.value = dateToUse;
        birthdateNative.max = new Date().toISOString().split('T')[0];
    }
    
    if (!saved) localStorage.setItem('birthdate', defaultDate);
    
    if (btnYear) btnYear.addEventListener('click', () => switchView('year'));
    if (btnLife) btnLife.addEventListener('click', () => switchView('life'));
    
    if (birthdateText) {
        birthdateText.addEventListener('change', (e) => {
            const val = e.target.value.trim();
            if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                const dateObj = new Date(val);
                if (!isNaN(dateObj.getTime()) && dateObj <= new Date()) {
                    birthdate = dateObj;
                    if (birthdateNative) birthdateNative.value = val;
                    localStorage.setItem('birthdate', val);
                    render();
                }
            }
        });
    }

    if (birthdateNative) {
        birthdateNative.addEventListener('change', (e) => {
            const val = e.target.value;
            birthdate = new Date(val);
            if (birthdateText) birthdateText.value = val;
            localStorage.setItem('birthdate', val);
            render();
        });
    }

    if (birthdateText && birthdateNative) {
        birthdateText.addEventListener('click', () => {
            if (typeof birthdateNative.showPicker === 'function') {
                birthdateNative.showPicker();
            } else {
                birthdateNative.click();
            }
        });
    }
    
    render();
}

function switchView(view) {
    currentView = view;
    btnYear.classList.toggle('active', view === 'year');
    btnLife.classList.toggle('active', view === 'life');
    render();
}

function render() {
    if (currentView === 'year') renderYear();
    else renderLife();
}

function renderYear() {
    const today = new Date();
    const year = today.getFullYear();
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const totalDays = isLeap ? 366 : 365;
    const startOfYear = new Date(year, 0, 1);
    const dayOfYear = Math.floor((today - startOfYear) / MS_PER_DAY);
    const daysLeft = totalDays - dayOfYear - 1;
    
    grid.className = 'grid year-view';
    grid.innerHTML = '';
    
    for (let i = 0; i < totalDays; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        if (i < dayOfYear) dot.classList.add('lived');
        else if (i === dayOfYear) dot.classList.add('current');
        grid.appendChild(dot);
    }
    
    labelLeft.textContent = year;
    labelRight.textContent = `${daysLeft} days left`;
}

function renderLife() {
    const today = new Date();
    const totalWeeks = TOTAL_YEARS * WEEKS_PER_YEAR;
    
    let weeksLived = 0;
    let age = 0;
    
    if (birthdate) {
        weeksLived = Math.floor((today - birthdate) / MS_PER_WEEK);
        age = today.getFullYear() - birthdate.getFullYear();
        const m = today.getMonth() - birthdate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) age--;
    }
    
    const weeksLeft = Math.max(0, totalWeeks - weeksLived);
    
    grid.className = 'grid life-view';
    grid.innerHTML = '';
    
    for (let i = 0; i < totalWeeks; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        if (birthdate) {
            if (i < weeksLived) dot.classList.add('lived');
            else if (i === weeksLived) dot.classList.add('current');
        }
        grid.appendChild(dot);
    }
    
    labelLeft.textContent = birthdate ? birthdate.toISOString().split('T')[0] : 'Set birthdate';
    labelRight.textContent = birthdate ? `${weeksLeft.toLocaleString()} weeks to 80` : '4,160 weeks';
}

document.addEventListener('DOMContentLoaded', init);
