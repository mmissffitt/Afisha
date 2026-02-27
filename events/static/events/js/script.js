const categoryLinks = document.querySelectorAll('nav a[data-category]');
const dateButtons = document.querySelectorAll('.filter-btn[data-date]');
const searchInput = document.querySelector('.main-search');
const searchBtn = document.querySelector('.search-btn');
const eventsGrid = document.getElementById('events-grid');

let currentCategory = 'all';
let currentDate = 'all';
let currentSearch = '';
let currentSort = 'date_asc';
let customDateStart = '';
let customDateEnd = '';

function updateEvents() {
    const url = new URL('/filter-events/', window.location.origin);
    url.searchParams.append('category', currentCategory);
    url.searchParams.append('date', currentDate);
    url.searchParams.append('search', currentSearch);
    url.searchParams.append('sort', currentSort);
    
    if (currentDate === 'custom') {
        url.searchParams.append('date_start', customDateStart);
        url.searchParams.append('date_end', customDateEnd);
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            renderEvents(data.events);
        })
        .catch(error => {
            console.error('Error:', error);
            eventsGrid.innerHTML = '<p>Ошибка загрузки данных. Пожалуйста, обновите страницу.</p>';
        });
}

function renderEvents(events) {
    if (!eventsGrid) return;
    
    eventsGrid.innerHTML = '';
    
    if (events.length === 0) {
        eventsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 20px;">Событий не найдено</p>';
        return;
    }
    
    events.forEach(event => {
        const card = document.createElement('article');
        card.className = 'event-card';
        
        const imageHtml = event.image 
            ? `<img src="${event.image}" alt="${event.title}" style="max-width: 100%; height: auto; max-height: 150px; object-fit: cover;">`
            : '<div class="event-image" style="background: #ecf0f1; height: 100px;"></div>';
        
        card.innerHTML = `
            <div class="event-image" style="text-align: center; min-height: 100px; display: flex; align-items: center; justify-content: center;">
                ${imageHtml}
            </div>
            <span class="event-category">${event.category}</span>
            <h3>${event.title}</h3>
            <p><strong>Дата:</strong> ${event.date}</p>
            <p><strong>Площадка:</strong> ${event.venue}</p>
            <p><strong>Участники:</strong> ${event.participants}</p>
            <p class="event-description">${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}</p>
            <p class="event-price"><strong>Цена:</strong> ${event.price}</p>
            <button class="btn-details">Подробнее</button>
        `;
        
        eventsGrid.appendChild(card);
    });
}

categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        categoryLinks.forEach(l => l.classList.remove('active-category'));
        link.classList.add('active-category');
        
        currentCategory = link.dataset.category;
        updateEvents();
    });
});

dateButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        dateButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentDate = btn.dataset.date;
        updateEvents();
    });
});

searchBtn.addEventListener('click', () => {
    currentSearch = searchInput.value;
    updateEvents();
});

searchInput.addEventListener('input', () => {
    currentSearch = searchInput.value;
    updateEvents();
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        currentSearch = searchInput.value;
        updateEvents();
    }
});

const sortSelect = document.getElementById('sort-select');
if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        updateEvents();
    });
}

document.getElementById('reset-filters').addEventListener('click', () => {
    currentCategory = 'all';
    currentDate = 'all';
    currentSearch = '';
    currentSort = 'date_asc';
    customDateStart = '';
    customDateEnd = '';
    
    searchInput.value = '';
    
    categoryLinks.forEach(l => l.classList.remove('active-category'));
    document.querySelector('nav a[data-category="all"]').classList.add('active-category');
    
    dateButtons.forEach(b => b.classList.remove('active'));
    document.querySelector('.filter-btn[data-date="all"]').classList.add('active');
    
    const datePicker = document.getElementById('date-range-picker');
    if (datePicker) {
        datePicker.style.display = 'none';
    }
    
    const dateStart = document.getElementById('date-start');
    const dateEnd = document.getElementById('date-end');
    if (dateStart) dateStart.value = '';
    if (dateEnd) dateEnd.value = '';
    
    updateEvents();
});

document.getElementById('custom-date-btn').addEventListener('click', () => {
    const picker = document.getElementById('date-range-picker');
    if (picker) {
        picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
    }
});

document.getElementById('apply-date-range').addEventListener('click', () => {
    const startDate = document.getElementById('date-start').value;
    const endDate = document.getElementById('date-end').value;
    
    if (startDate && endDate) {
        customDateStart = startDate;
        customDateEnd = endDate;
        currentDate = 'custom';
        
        dateButtons.forEach(b => b.classList.remove('active'));
        document.getElementById('custom-date-btn').classList.add('active');
        
        updateEvents();
        document.getElementById('date-range-picker').style.display = 'none';
    } else {
        alert('Пожалуйста, выберите начальную и конечную дату');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    updateEvents();
    document.querySelector('nav a[data-category="all"]').classList.add('active-category');
});