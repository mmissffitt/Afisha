
const categoryLinks = document.querySelectorAll('nav a[data-category]');
const dateButtons = document.querySelectorAll('.filter-btn[data-date]');
const eventCards = document.querySelectorAll('.event-card');
const searchInput = document.querySelector('.main-search');
const searchBtn = document.querySelector('.search-btn');

function parseEventDate(card) {
    const dateText = card.querySelector('p').textContent; 
    if (!dateText.includes(':')) return null;

    const parts = dateText.split(':')[1].trim(); 
    const datePart = parts.split(',')[0].trim(); 

    const months = {
        'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3, 'мая': 4, 'июня': 5,
        'июля': 6, 'августа': 7, 'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
    };

    const dateComponents = datePart.split(' ');
    if (dateComponents.length !== 3) return null;

    const [dayStr, monthStr, yearStr] = dateComponents;
    const day = parseInt(dayStr, 10);
    const month = months[monthStr.toLowerCase()];
    const year = parseInt(yearStr, 10);

    if (isNaN(day) || month === undefined || isNaN(year)) {
        return null;
    }

    return new Date(year, month, day);
}


function filterByCategory(category) {
    const categoryMap = {
        'music': 'музыка',
        'theatre': 'театр',
        'art': 'искусство',
        'sport': 'спорт',
        'exhibitions': 'выставки',
        'all': 'все'
    };

    const targetCategory = categoryMap[category] || category;

    eventCards.forEach(card => {
        const badge = card.querySelector('.event-category');
        const cardCategory = badge ? badge.textContent.trim().toLowerCase() : '';

        if (category === 'all' || cardCategory === targetCategory) {
            card.dataset.categoryVisible = 'true';
        } else {
            card.dataset.categoryVisible = 'false';
        }
    });

    applyCombinedFilter();
}

function filterByDate(filter) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    eventCards.forEach(card => {
        const eventDate = parseEventDate(card);
        if (!eventDate) {
            card.dataset.dateVisible = 'true';
            return;
        }

        const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        let visible = true;

        if (filter === 'today') {
            visible = (eventDay.getTime() === today.getTime());
        } else if (filter === 'tomorrow') {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            visible = (eventDay.getTime() === tomorrow.getTime());
        } else if (filter === 'weekend') {
            const dayOfWeek = eventDay.getDay(); 
            visible = (dayOfWeek === 0 || dayOfWeek === 6);
        } else if (filter === 'week') {
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() + 7);
            visible = (eventDay >= today && eventDay <= weekEnd);
        } else {
            visible = true;
        }

        card.dataset.dateVisible = visible ? 'true' : 'false';
    });

    applyCombinedFilter();
}


function filterBySearch(query) {
    const q = query.trim().toLowerCase();

    eventCards.forEach(card => {
        if (!q) {
            card.dataset.searchVisible = 'true';
            return;
        }

        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const texts = Array.from(card.querySelectorAll('p')).map(p => p.textContent.toLowerCase()).join(' ');

        const match = title.includes(q) || texts.includes(q);
        card.dataset.searchVisible = match ? 'true' : 'false';
    });

    applyCombinedFilter();
}


function applyCombinedFilter() {
    eventCards.forEach(card => {
        const byCat = card.dataset.categoryVisible !== 'false';
        const byDate = card.dataset.dateVisible !== 'false';
        const bySearch = card.dataset.searchVisible !== 'false';

        if (byCat && byDate && bySearch) {
            card.style.display = 'block'; 
        } else {
            card.style.display = 'none';
        }
    });
}


categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = link.dataset.category;
        filterByCategory(category);
    });
});


dateButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        dateButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.date;
        filterByDate(filter);
    });
});


searchBtn.addEventListener('click', () => {
    filterBySearch(searchInput.value);
});


searchInput.addEventListener('input', () => {
    filterBySearch(searchInput.value);
});


document.addEventListener('DOMContentLoaded', () => {
    eventCards.forEach(card => {
        card.dataset.categoryVisible = 'true';
        card.dataset.dateVisible = 'true';
        card.dataset.searchVisible = 'true';
    });
    applyCombinedFilter();
});
