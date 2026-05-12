const categoryLinks = document.querySelectorAll('nav a[data-category]');
const dateButtons = document.querySelectorAll('.filter-btn[data-date]');
const searchInput = document.querySelector('.main-search');
const resetButton = document.getElementById('reset-filters');
const eventsGrid = document.getElementById('events-grid');
const sortSelect = document.getElementById('sort-price');

let currentCategory = 'all';
let currentDate = 'all';
let currentSearch = '';
let customDateStart = '';
let customDateEnd = '';
let currentSort = 'default';

function createEventCard(event) {
    const card = document.createElement('article');
    card.className = 'event-card';
    card.setAttribute('data-event-id', event.id);

    // Image container
    const imageDiv = document.createElement('div');
    imageDiv.className = 'event-image';
    
    if (event.image) {
        const img = document.createElement('img');
        img.src = event.image;
        img.alt = event.title;
        imageDiv.appendChild(img);
    } else {
        const span = document.createElement('span');
        span.textContent = 'Нет изображения';
        imageDiv.appendChild(span);
    }
    card.appendChild(imageDiv);

    // Category
    const categorySpan = document.createElement('span');
    categorySpan.className = 'event-category';
    categorySpan.textContent = event.category;
    card.appendChild(categorySpan);

    // Title
    const title = document.createElement('h3');
    title.textContent = event.title;
    card.appendChild(title);

    // Date
    const dateParagraph = document.createElement('p');
    const dateStrong = document.createElement('strong');
    dateStrong.textContent = 'Дата: ';
    dateParagraph.appendChild(dateStrong);
    dateParagraph.appendChild(document.createTextNode(event.date));
    card.appendChild(dateParagraph);

    // Venue
    const venueParagraph = document.createElement('p');
    const venueStrong = document.createElement('strong');
    venueStrong.textContent = 'Место: ';
    venueParagraph.appendChild(venueStrong);
    venueParagraph.appendChild(document.createTextNode(event.venue));
    card.appendChild(venueParagraph);

    // Participants (if exists)
    if (event.participants) {
        const participantsParagraph = document.createElement('p');
        const participantsStrong = document.createElement('strong');
        participantsStrong.textContent = 'Участники: ';
        participantsParagraph.appendChild(participantsStrong);
        participantsParagraph.appendChild(
            document.createTextNode(event.participants.substring(0, 30))
        );
        card.appendChild(participantsParagraph);
    }

    // Description
    const descriptionParagraph = document.createElement('p');
    descriptionParagraph.className = 'event-description';
    descriptionParagraph.textContent = event.description;
    card.appendChild(descriptionParagraph);

    // Price
    const priceParagraph = document.createElement('p');
    priceParagraph.className = 'event-price';
    priceParagraph.textContent = event.price;
    card.appendChild(priceParagraph);

    // Details button
    const detailsLink = document.createElement('a');
    detailsLink.href = `/event/${event.id}/`;
    detailsLink.className = 'btn-details';
    detailsLink.textContent = 'Подробнее';
    card.appendChild(detailsLink);

    return card;
}

function showLoading() {
    eventsGrid.innerHTML = '<div class="loading-spinner">Загрузка...</div>';
}

function hideLoading() {
    const spinner = eventsGrid.querySelector('.loading-spinner');
    if (spinner) {
        spinner.remove();
    }
}

function filterEvents() {
    const url = new URL('/filter-events/', window.location.origin);
    url.searchParams.append('category', currentCategory);
    url.searchParams.append('date', currentDate);
    url.searchParams.append('search', currentSearch);
    url.searchParams.append('sort', currentSort);
    
    if (currentDate === 'custom') {
        url.searchParams.append('date_start', customDateStart);
        url.searchParams.append('date_end', customDateEnd);
    }

    showLoading();

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            hideLoading();
            eventsGrid.innerHTML = '';
            
            if (data.events.length === 0) {
                eventsGrid.innerHTML = '<p class="no-events">Событий не найдено</p>';
                return;
            }
            
            data.events.forEach(event => {
                const card = createEventCard(event);
                eventsGrid.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            hideLoading();
            eventsGrid.innerHTML = '<p class="error-message">Ошибка загрузки данных. Попробуйте позже.</p>';
        });
}

// Category filter
categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        categoryLinks.forEach(l => l.classList.remove('active-category'));
        link.classList.add('active-category');
        
        currentCategory = link.dataset.category;
        filterEvents();
    });
});

// Date filter
dateButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        dateButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentDate = btn.dataset.date;
        filterEvents();
    });
});

// Search with debounce
let searchTimeout;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentSearch = searchInput.value;
        filterEvents();
    }, 300);
});

// Reset filters
resetButton.addEventListener('click', () => {
    currentCategory = 'all';
    currentDate = 'all';
    currentSearch = '';
    currentSort = 'default';
    customDateStart = '';
    customDateEnd = '';
    
    searchInput.value = '';
    
    categoryLinks.forEach(l => l.classList.remove('active-category'));
    const allCategoryLink = document.querySelector('nav a[data-category="all"]');
    if (allCategoryLink) {
        allCategoryLink.classList.add('active-category');
    }
    
    dateButtons.forEach(b => b.classList.remove('active'));
    const allDateButton = document.querySelector('.filter-btn[data-date="all"]');
    if (allDateButton) {
        allDateButton.classList.add('active');
    }
    
    const datePicker = document.getElementById('date-range-picker');
    if (datePicker) {
        datePicker.style.display = 'none';
    }
    
    const dateStart = document.getElementById('date-start');
    const dateEnd = document.getElementById('date-end');
    if (dateStart) dateStart.value = '';
    if (dateEnd) dateEnd.value = '';
    if (sortSelect) sortSelect.value = 'default';
    
    filterEvents();
});

// Custom date picker
const customDateBtn = document.getElementById('custom-date-btn');
if (customDateBtn) {
    customDateBtn.addEventListener('click', () => {
        const picker = document.getElementById('date-range-picker');
        if (picker) {
            picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
        }
    });
}

// Apply date range
const applyDateRange = document.getElementById('apply-date-range');
if (applyDateRange) {
    applyDateRange.addEventListener('click', () => {
        const startDate = document.getElementById('date-start').value;
        const endDate = document.getElementById('date-end').value;
        
        if (startDate && endDate) {
            customDateStart = startDate;
            customDateEnd = endDate;
            currentDate = 'custom';
            
            dateButtons.forEach(b => b.classList.remove('active'));
            if (customDateBtn) {
                customDateBtn.classList.add('active');
            }
            
            filterEvents();
            document.getElementById('date-range-picker').style.display = 'none';
        } else {
            alert('Пожалуйста, выберите начальную и конечную дату');
        }
    });
}

// Sort select
if (sortSelect) {
    sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        filterEvents();
    });
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    const allCategoryLink = document.querySelector('nav a[data-category="all"]');
    if (allCategoryLink) {
        allCategoryLink.classList.add('active-category');
    }
});