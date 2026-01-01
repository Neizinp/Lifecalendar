/**
 * Your Life in Weeks - JavaScript Application
 */

const TOTAL_YEARS = 90;
const WEEKS_PER_YEAR = 52;
const TOTAL_WEEKS = TOTAL_YEARS * WEEKS_PER_YEAR;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Month data
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// DOM Elements
const birthdateInput = document.getElementById('birthdate');
const generateBtn = document.getElementById('generate-btn');
const lifeGrid = document.getElementById('life-grid');
const yearLabels = document.getElementById('year-labels');
const yearGrid = document.getElementById('year-grid');
const monthLabels = document.getElementById('month-labels');

// Stats elements
const lifeStats = document.getElementById('life-stats');
const yearStats = document.getElementById('year-stats');
const weeksLivedEl = document.getElementById('weeks-lived');
const percentageEl = document.getElementById('percentage');
const currentAgeEl = document.getElementById('current-age');
const currentYearEl = document.getElementById('current-year');
const daysPassedEl = document.getElementById('days-passed');
const totalDaysEl = document.getElementById('total-days');
const yearPercentageEl = document.getElementById('year-percentage');

let currentTooltip = null;

function init() {
    generateLifeGrid();
    generateYearLabels();
    generateYearGrid();
    generateMonthLabels();
    
    // Set current year in title
    const today = new Date();
    currentYearEl.textContent = today.getFullYear();
    
    // Load saved birthdate
    const savedBirthdate = localStorage.getItem('birthdate');
    if (savedBirthdate) {
        birthdateInput.value = savedBirthdate;
        visualize(new Date(savedBirthdate));
    }
    
    generateBtn.addEventListener('click', handleGenerate);
    birthdateInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleGenerate();
    });
    
    birthdateInput.max = new Date().toISOString().split('T')[0];
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - TOTAL_YEARS);
    birthdateInput.min = minDate.toISOString().split('T')[0];
}

function generateLifeGrid() {
    lifeGrid.innerHTML = '';
    for (let year = 0; year < TOTAL_YEARS; year++) {
        for (let week = 0; week < WEEKS_PER_YEAR; week++) {
            const el = document.createElement('div');
            el.className = 'week';
            el.dataset.year = year;
            el.dataset.week = week;
            el.addEventListener('mouseenter', (e) => showTooltip(e, 'week'));
            el.addEventListener('mouseleave', hideTooltip);
            lifeGrid.appendChild(el);
        }
    }
}

function generateYearLabels() {
    yearLabels.innerHTML = '';
    for (let year = 0; year < TOTAL_YEARS; year++) {
        const el = document.createElement('div');
        el.className = 'year-label';
        if (year % 10 === 0) {
            el.textContent = year;
            el.classList.add('decade');
        }
        yearLabels.appendChild(el);
    }
}

function generateYearGrid() {
    yearGrid.innerHTML = '';
    const today = new Date();
    const year = today.getFullYear();
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    
    for (let month = 0; month < 12; month++) {
        let daysInMonth = DAYS_IN_MONTH[month];
        if (month === 1 && isLeapYear) daysInMonth = 29;
        
        for (let day = 0; day < 31; day++) {
            const el = document.createElement('div');
            el.className = 'day';
            if (day >= daysInMonth) {
                el.classList.add('empty');
            } else {
                el.dataset.month = month;
                el.dataset.day = day + 1;
                el.addEventListener('mouseenter', (e) => showTooltip(e, 'day'));
                el.addEventListener('mouseleave', hideTooltip);
            }
            yearGrid.appendChild(el);
        }
    }
}

function generateMonthLabels() {
    monthLabels.innerHTML = '';
    ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].forEach(m => {
        const el = document.createElement('span');
        el.className = 'month-label';
        el.textContent = m;
        monthLabels.appendChild(el);
    });
}

function handleGenerate() {
    const birthdate = birthdateInput.value;
    if (!birthdate) return;
    
    const birthdateObj = new Date(birthdate);
    if (birthdateObj > new Date()) return;
    
    localStorage.setItem('birthdate', birthdate);
    visualize(birthdateObj);
}

function visualize(birthdate) {
    const today = new Date();
    
    // Update life grid
    const weeksLived = Math.floor((today - birthdate) / MS_PER_WEEK);
    updateLifeGrid(weeksLived);
    
    // Update life stats
    const age = calculateAge(birthdate, today);
    weeksLivedEl.textContent = weeksLived.toLocaleString();
    percentageEl.textContent = ((weeksLived / TOTAL_WEEKS) * 100).toFixed(1) + '%';
    currentAgeEl.textContent = age;
    lifeStats.classList.remove('hidden');
    
    // Update year grid
    updateYearGrid(today);
}

function updateLifeGrid(weeksLived) {
    const weeks = lifeGrid.querySelectorAll('.week');
    weeks.forEach((week, i) => {
        week.classList.remove('lived', 'current');
        if (i < weeksLived) week.classList.add('lived');
        else if (i === weeksLived) week.classList.add('current');
    });
}

function updateYearGrid(today) {
    const year = today.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const dayOfYear = Math.floor((today - startOfYear) / MS_PER_DAY);
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const totalDays = isLeapYear ? 366 : 365;
    
    const days = yearGrid.querySelectorAll('.day:not(.empty)');
    let dayIndex = 0;
    
    days.forEach((day) => {
        day.classList.remove('lived', 'current');
        if (dayIndex < dayOfYear) day.classList.add('lived');
        else if (dayIndex === dayOfYear) day.classList.add('current');
        dayIndex++;
    });
    
    // Update year stats
    daysPassedEl.textContent = dayOfYear + 1;
    totalDaysEl.textContent = totalDays;
    yearPercentageEl.textContent = (((dayOfYear + 1) / totalDays) * 100).toFixed(1) + '%';
    yearStats.classList.remove('hidden');
}

function calculateAge(birthdate, today) {
    let age = today.getFullYear() - birthdate.getFullYear();
    const m = today.getMonth() - birthdate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) age--;
    return age;
}

function showTooltip(e, type) {
    const el = e.target;
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    
    if (type === 'week') {
        const year = parseInt(el.dataset.year);
        const week = parseInt(el.dataset.week) + 1;
        const status = el.classList.contains('current') ? 'Now' : 
                       el.classList.contains('lived') ? 'Lived' : 'Future';
        tooltip.innerHTML = `Year ${year + 1}, Week ${week}<br><span style="color: var(--color-text-muted)">${status}</span>`;
    } else {
        const month = MONTHS[parseInt(el.dataset.month)];
        const day = el.dataset.day;
        const status = el.classList.contains('current') ? 'Today' : 
                       el.classList.contains('lived') ? 'Passed' : 'Upcoming';
        tooltip.innerHTML = `${month} ${day}<br><span style="color: var(--color-text-muted)">${status}</span>`;
    }
    
    document.body.appendChild(tooltip);
    
    const rect = el.getBoundingClientRect();
    const tr = tooltip.getBoundingClientRect();
    let left = rect.left + rect.width/2 - tr.width/2;
    let top = rect.top - tr.height - 6;
    
    if (left < 4) left = 4;
    if (left + tr.width > window.innerWidth - 4) left = window.innerWidth - tr.width - 4;
    if (top < 4) top = rect.bottom + 6;
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    currentTooltip = tooltip;
}

function hideTooltip() {
    if (currentTooltip) {
        currentTooltip.remove();
        currentTooltip = null;
    }
}

document.addEventListener('DOMContentLoaded', init);
