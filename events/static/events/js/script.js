const categoryLinks = document.querySelectorAll('nav a[data-category]');
const dateButtons = document.querySelectorAll('.filter-btn[data-date]');
const searchInput = document.querySelector('.main-search');
const searchBtn = document.querySelector('.search-btn');
let currentCategory = 'all';
let currentDate = 'all';
let currentSearch = '';
let customDateStart = '';
let customDateEnd = '';

function updateEvents() {
    const url = new URL('/filter-events/', window.location.origin);
    url.searchParams.append('category', currentCategory);
    url.searchParams.append('date', currentDate);
    url.searchParams.append('search', currentSearch);
    
    if (currentDate === 'custom') {
        url.searchParams.append('date_start', customDateStart);
        url.searchParams.append('date_end', customDateEnd);
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            renderEvents(data.events);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function renderEvents(events) {
    const eventsGrid = document.getElementById('events-grid');
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
            ? `<img src="${event.image}" alt="${event.title}" style="width: 100%; height: 100%; object-fit: cover;">`
            : '<span>🎪</span>';
 
        const participantsHtml = event.participants 
            ? `<p><strong>👥</strong> ${event.participants.substring(0, 30)}${event.participants.length > 30 ? '...' : ''}</p>`
            : '';
        
        card.innerHTML = `
            <div class="event-image">
                ${imageHtml}
            </div>
            <span class="event-category">${event.category}</span>
            <h3>${event.title}</h3>
            <p><strong>📅</strong> ${event.date}</p>
            <p><strong>📍</strong> ${event.venue}</p>
            ${participantsHtml}
            <p class="event-description">${event.description.substring(0, 80)}${event.description.length > 80 ? '...' : ''}</p>
            <p class="event-price">${event.price}</p>
            <a href="/event/${event.id}/" class="btn-details">Подробнее</a>
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

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        currentSearch = searchInput.value;
        updateEvents();
    }
});

document.getElementById('reset-filters').addEventListener('click', () => {
    currentCategory = 'all';
    currentDate = 'all';
    currentSearch = '';
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