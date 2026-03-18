const categoryLinks = document.querySelectorAll('nav a[data-category]');
const dateButtons = document.querySelectorAll('.filter-btn[data-date]');
const searchInput = document.querySelector('.main-search');
const resetButton = document.getElementById('reset-filters');
const eventsGrid = document.getElementById('events-grid');

let currentCategory = 'all';
let currentDate = 'all';
let currentSearch = '';
let customDateStart = '';
let customDateEnd = '';

function filterEvents() {
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
            const eventIds = data.events.map(e => e.id);
            
            document.querySelectorAll('.event-card').forEach(card => {
                const eventId = parseInt(card.dataset.eventId);
                if (eventIds.includes(eventId)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        categoryLinks.forEach(l => l.classList.remove('active-category'));
        link.classList.add('active-category');
        
        currentCategory = link.dataset.category;
        filterEvents();
    });
});

dateButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        dateButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentDate = btn.dataset.date;
        filterEvents();
    });
});

searchInput.addEventListener('input', () => {
    currentSearch = searchInput.value;
    filterEvents();
});

resetButton.addEventListener('click', () => {
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
    
    filterEvents();
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
        
        filterEvents();
        document.getElementById('date-range-picker').style.display = 'none';
    } else {
        alert('Пожалуйста, выберите начальную и конечную дату');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('nav a[data-category="all"]').classList.add('active-category');
});