const categoryLinks = document.querySelectorAll('nav a[data-category]');
const dateButtons = document.querySelectorAll('.filter-btn[data-date]');
const searchInput = document.querySelector('.main-search');
const searchBtn = document.querySelector('.search-btn');
const eventsGrid = document.getElementById('events-grid');

let currentCategory = 'all';
let currentDate = 'all';
let currentSearch = '';

function updateEvents() {
    // Исправленный URL - убираем слеш в начале и добавляем правильный путь
    const url = new URL('/filter-events/', window.location.origin);
    url.searchParams.append('category', currentCategory);
    url.searchParams.append('date', currentDate);
    url.searchParams.append('search', currentSearch);

    console.log('Fetching:', url.toString()); // Для отладки

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data); // Для отладки
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
        
        // Формируем HTML для изображения
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

// Обработчики событий
categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
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

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    updateEvents();
});

// Добавляем обработку Enter в поле поиска
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        currentSearch = searchInput.value;
        updateEvents();
    }
});