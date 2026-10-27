// Немного элементов DOM
const form = document.getElementById('movieForm');
const modal = document.getElementById('movieModal');
const grid = document.getElementById('moviesGrid');
const searchInput = document.getElementById('searchInput');
const filterGenre = document.getElementById('filterGenre');
const filterStatus = document.getElementById('filterStatus');
const sortBy = document.getElementById('sortBy');
const sortOrderBtn = document.getElementById('sortOrderBtn');
const sortOrderIcon = document.getElementById('sortOrderIcon');

const typeSelect = document.getElementById('typeSelect');
const titleLabel = document.getElementById('titleLabel');
const titleInput = document.getElementById('titleInput');
const durationLabel = document.getElementById('durationLabel');
const tvFields = document.getElementById('tvFields');

const posterInput = document.getElementById('posterInput');
const posterPreviewImg = document.getElementById('posterPreviewImg');
const posterPlaceholderText = document.getElementById('posterPlaceholderText');

const stars = document.querySelectorAll('#starPicker i');
const ratingInput = document.getElementById('ratingInput');

const genreSelectHelper = document.getElementById('genreSelectHelper');
const selectedGenresContainer = document.getElementById('selectedGenresContainer');

let editingId = null;
let isAsc = false;
let currentGenres = [];


// Плашки выбранных жанров
function renderGenreChips() {
    selectedGenresContainer.innerHTML = '';
    currentGenres.forEach(genre => {
        const chip = document.createElement('div');
        chip.className = 'genre-tag-chip';
        chip.innerHTML = `
            <span>${genre}</span>
            <button type="button" title="Удалить">&times;</button>
        `;

        // Удаление тега
        chip.querySelector('button').onclick = () => {
            currentGenres = currentGenres.filter(g => g !== genre);
            renderGenreChips();
        };

        selectedGenresContainer.appendChild(chip);
    });
}

// Добавление жанра
genreSelectHelper.onchange = () => {
    const val = genreSelectHelper.value;
    if (val && !currentGenres.includes(val)) {
        currentGenres.push(val);
        renderGenreChips();
    }
    genreSelectHelper.value = '';
};


// Пасхалки!
const movieEasterEggs = [
    "Например: Довод",
    "Например: Интерстеллар",
    "Например: Бойцовский клуб",
    "Например: Матрица",
    "Например: Шрек 2",
    "Например: Джентльмены"
];

const tvEasterEggs = [
    "Например: Декстер",
    "Например: Во все тяжкие",
    "Например: Извне",
    "Например: Клан Сопрано",
    "Например: Пацаны",
    "Например: Реальные пацаны"
];

// Переключение типа (фильм или сериал)
typeSelect.onchange = () => {
    const isTv = typeSelect.value === 'tv';

    titleLabel.textContent = isTv ? 'Название сериала' : 'Название фильма';

    // Случайная пасхалка при переключении
    const eggs = isTv ? tvEasterEggs : movieEasterEggs;
    titleInput.placeholder = eggs[Math.floor(Math.random() * eggs.length)];

    durationLabel.textContent = isTv ? 'Длительность серии (мин)' : 'Длительность (мин)';
    document.getElementById('durationInput').placeholder = isTv ? '45' : '120';

    tvFields.style.display = isTv ? 'grid' : 'none';
};

// Превью обложки
posterInput.oninput = () => {
    const url = posterInput.value.trim();
    if (url) {
        posterPreviewImg.src = url;
        posterPreviewImg.style.display = 'block';
        posterPlaceholderText.style.display = 'none';

        posterPreviewImg.onerror = () => {
            posterPreviewImg.style.display = 'none';
            posterPlaceholderText.style.display = 'flex';
        };
    } else {
        posterPreviewImg.style.display = 'none';
        posterPlaceholderText.style.display = 'flex';
    }
};

// Рейтинг со звездочками
function updateStarsUI(val) {
    stars.forEach(star => {
        const starVal = parseInt(star.dataset.value, 10);
        if (starVal <= val) {
            star.classList.remove('fa-regular');
            star.classList.add('fa-solid', 'active');
        } else {
            star.classList.remove('fa-solid', 'active');
            star.classList.add('fa-regular');
        }
    });
}

stars.forEach(star => {
    star.onmouseenter = () => updateStarsUI(parseInt(star.dataset.value, 10));
    star.onclick = () => {
        const val = parseInt(star.dataset.value, 10);
        ratingInput.value = val;
        updateStarsUI(val);
    };
});

document.getElementById('starPicker').onmouseleave = () => {
    updateStarsUI(parseInt(ratingInput.value, 10) || 0);
};

// Валидация через регулярные выражения
function validate() {
    const title = titleInput.value.trim();
    const yearStr = document.getElementById('yearInput').value.trim();

    const kpVal = document.getElementById('kinopoiskInput').value.trim();
    const imdbVal = document.getElementById('imdbInput').value.trim();
    const lbVal = document.getElementById('letterboxdInput').value.trim();
    const rtVal = document.getElementById('rottenTomatoesInput').value.trim();

    // Название: от 2 до 200 символов
    const titleRegex = /^.{2,200}$/;
    const titleOk = titleRegex.test(title);

    // Год выпуска: ровно 4 цифры + диапазон от 1888 до текущего года
    const yearRegex = /^\d{4}$/;
    const yearNum = parseInt(yearStr, 10);
    const yearOk = yearRegex.test(yearStr) && yearNum >= 1888 && yearNum <= new Date().getFullYear();

    // REGEX для URL (проверяет наличие http:// или https:// + текст ссылки)
    // const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9.-]+)+(\.[a-zA-Z]{2,6})([/\w\-._~:?#[\]@!$&'()*+,;=%]*)*\/?$/i;
    // Жутко, и я явно где-то накосячил (сохранение не работало)
    const urlRegex = /^https?:\/\/.{3,}$/i;

    const kpOk = !kpVal || urlRegex.test(kpVal);
    const imdbOk = !imdbVal || urlRegex.test(imdbVal);
    const lbOk = !lbVal || urlRegex.test(lbVal);
    const rtOk = !rtVal || urlRegex.test(rtVal);

    document.getElementById('titleError').style.display = (title && !titleOk) ? 'block' : 'none';
    document.getElementById('yearError').style.display = (yearStr && !yearOk) ? 'block' : 'none';

    const allUrlsOk = kpOk && imdbOk && lbOk && rtOk;
    document.getElementById('saveBtn').disabled = !(titleOk && yearOk && allUrlsOk);
}

// Cлушатели на все поля ввода
[
    'titleInput',
    'yearInput',
    'kinopoiskInput',
    'imdbInput',
    'letterboxdInput',
    'rottenTomatoesInput'
].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', validate);
});

const getMovies = () => JSON.parse(localStorage.getItem('moviesList') || '[]');
const saveMovies = (data) => localStorage.setItem('moviesList', JSON.stringify(data));

// Модалка
document.getElementById('openModalBtn').onclick = () => {
    clearForm();
    modal.classList.add('active');
};
document.getElementById('closeModalBtn').onclick = () => modal.classList.remove('active');

function clearForm() {
    form.reset();
    editingId = null;
    typeSelect.value = 'movie';
    typeSelect.onchange();
    posterInput.oninput();
    ratingInput.value = '';
    updateStarsUI(0);

    document.getElementById('formTitle').textContent = 'Добавить';
    document.getElementById('saveBtn').textContent = 'Сохранить';
    validate();

    currentGenres = [];
    renderGenreChips();
}

document.getElementById('resetBtn').onclick = (e) => {
    e.preventDefault();
    clearForm();
};

// Навигация (по принципу SPA, как мой любимый https://dazzieshine.github.io/resonance/)
document.querySelectorAll('.nav-link').forEach(link => {
    link.onclick = () => {
        document.querySelectorAll('.nav-link, .view-section').forEach(el => el.classList.remove('active'));
        link.classList.add('active');
        document.getElementById(link.dataset.target).classList.add('active');
    };
});

// Кнопка направления сортировки
sortOrderBtn.onclick = () => {
    isAsc = !isAsc;
    sortOrderIcon.className = isAsc ? 'fa-solid fa-arrow-up-a-z' : 'fa-solid fa-arrow-down-z-a';
    sortOrderBtn.setAttribute('data-tooltip', isAsc ? 'Порядок: по возрастанию' : 'Порядок: по убыванию');
    saveFilters();
    render();
};

// Функция статистики
function updateStats(movies) {
    let watched = 0,
        plan = 0,
        minutes = 0;
    const genres = {};

    for (let i = 0; i < movies.length; i++) {
        let m = movies[i];
        if (m.status === 'watched') {
            watched++;
            if (m.type === 'tv') {
                const eps = Number(m.episode || 1);
                const dur = Number(m.duration || 0);
                minutes += eps * dur;
            } else {
                minutes += Number(m.duration || 0);
            }
        } else {
            plan++;
        }

        // Разделяем жанры
        if (m.genre) {
            const genresArray = Array.isArray(m.genre)
                ? m.genre
                : (m.genre ? String(m.genre).split(',').map(g => g.trim()) : []);

            genresArray.forEach(g => {
                const cleanGenre = g.trim();
                if (cleanGenre) {
                    genres[cleanGenre] = (genres[cleanGenre] || 0) + 1;
                }
            });
        }
    }

    document.getElementById('statTotal').textContent = movies.length;
    document.getElementById('statWatched').textContent = watched;
    document.getElementById('statPlan').textContent = plan;
    document.getElementById('statHours').textContent = Math.round(minutes / 60) + ' ч';

    const list = document.getElementById('genreStatsList');
    list.innerHTML = Object.entries(genres).sort((a, b) => b[1] - a[1]).map(([g, c]) => `
        <div class="genre-stat-item"><span class="genre-name">${g}</span><span class="genre-count">${c} шт.</span></div>
    `).join('') || '<p class="empty-text">Нет данных</p>';
}

// Карточкиии!
form.onsubmit = (e) => {
    e.preventDefault();
    let movies = getMovies();

    const movie = {
        id: editingId || Date.now(),
        type: typeSelect.value,
        title: titleInput.value.trim(),
        year: parseInt(document.getElementById('yearInput').value, 10),
        duration: parseInt(document.getElementById('durationInput').value, 10) || 0,
        season: parseInt(document.getElementById('seasonInput').value, 10) || null,
        episode: parseInt(document.getElementById('episodeInput').value, 10) || null,
        genre: currentGenres.length ? currentGenres : ['Другое'],
        status: document.getElementById('statusSelect').value,
        rating: parseFloat(ratingInput.value) || null,
        posterUrl: posterInput.value.trim(),
        synopsis: document.getElementById('synopsisInput').value.trim(),
        review: document.getElementById('reviewInput').value.trim(),
        kinopoiskUrl: document.getElementById('kinopoiskInput').value.trim(),
        imdbUrl: document.getElementById('imdbInput').value.trim(),
        letterboxdUrl: document.getElementById('letterboxdInput').value.trim(),
        rottenTomatoesUrl: document.getElementById('rottenTomatoesInput').value.trim()
    };

    if (editingId) {
        movies = movies.map(m => m.id === editingId ? movie : m);
    } else {
        movies.push(movie);
    }

    saveMovies(movies);
    modal.classList.remove('active');
    clearForm();
    render();
};

// Функция рендера карточек
function render() {
    let movies = getMovies();
    updateStats(movies);

    const search = searchInput.value.toLowerCase().trim();
    const gFilter = filterGenre.value;
    const sFilter = filterStatus.value;
    const sortField = sortBy.value;

    movies = movies.filter(m => {
        const genresArr = Array.isArray(m.genre) ? m.genre : (m.genre ? [m.genre] : []);
        return m.title.toLowerCase().includes(search) &&
            (gFilter === 'all' || genresArr.includes(gFilter)) &&
            (sFilter === 'all' || m.status === sFilter);
    });

    movies.sort((a, b) => {
        let res = 0;
        if (sortField === 'title') res = a.title.localeCompare(b.title);
        else if (sortField === 'year') res = a.year - b.year;
        else if (sortField === 'rating') res = (a.rating || 0) - (b.rating || 0);
        else res = a.id - b.id;
        return isAsc ? res : -res;
    });

    grid.innerHTML = movies.length ? '' : `<div class="empty-msg"><i class="fa-solid fa-film"></i><p>Записи не найдены</p></div>`;

    movies.forEach(m => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        const poster = m.posterUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkEd6PaPwJUu607GTQfJkxjhGC80vTZfT573RVndr9QMhQjVNQHFAu51Zq&s=10';

        let typeBadgeText = 'Фильм';
        if (m.type === 'tv') {
            const s = m.season ? `S${String(m.season).padStart(2, '0')}` : '';
            const e = m.episode ? `E${String(m.episode).padStart(2, '0')}` : '';
            const suffix = [s, e].filter(Boolean).join(' ');
            typeBadgeText = suffix ? `Сериал (${suffix})` : 'Сериал';
        }

        const genreText = Array.isArray(m.genre) ? m.genre.join(', ') : (m.genre || 'Другое');

        // Вот тут и скрыта генерация карточки
        card.innerHTML = `
            <div class="poster-wrap" style="--poster-bg: url('${poster}')">
                <img src="${poster}" alt="${m.title}" onerror="this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkEd6PaPwJUu607GTQfJkxjhGC80vTZfT573RVndr9QMhQjVNQHFAu51Zq&s=10'">
                <span class="type-badge">${typeBadgeText}</span>
                <span class="status-badge ${m.status}">${m.status === 'watched' ? 'Просмотрено' : 'В планах'}</span>
            </div>
            <div class="card-body">
                <h4>${m.title} (${m.year})</h4>
                <div class="card-meta">
                    <span class="genre-tag">${genreText}</span>
                    <span class="rating-tag"><i class="fa-solid fa-star"></i> ${m.rating || '-'}/10</span>
                </div>
                ${m.synopsis ? `<p class="card-synopsis">${m.synopsis}</p>` : ''}
                ${m.review ? `<div class="card-review">${m.review}</div>` : ''}
                <div class="card-links">
                    ${m.kinopoiskUrl ? `<a href="${m.kinopoiskUrl}" target="_blank" class="service-link kp"><i class="fa-solid fa-link"></i> Кинопоиск</a>` : ''}
                    ${m.imdbUrl ? `<a href="${m.imdbUrl}" target="_blank" class="service-link imdb"><i class="fa-solid fa-link"></i> IMDb</a>` : ''}
                    ${m.letterboxdUrl ? `<a href="${m.letterboxdUrl}" target="_blank" class="service-link lb"><i class="fa-solid fa-link"></i> Letterboxd</a>` : ''}
                    ${m.rottenTomatoesUrl ? `<a href="${m.rottenTomatoesUrl}" target="_blank" class="service-link rt"><i class="fa-solid fa-link"></i> Rotten Tomatoes</a>` : ''}
                </div>
            </div>
            <div class="card-actions">
                <button class="edit-btn" title="Редактировать"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-btn" title="Удалить"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;

        // Смена статуса по клику
        card.querySelector('.status-badge').onclick = () => {
            let list = getMovies();
            list = list.map(item => item.id === m.id ? { ...item, status: item.status === 'watched' ? 'plan' : 'watched' } : item);
            saveMovies(list);
            render();
        };

        // Удаление
        card.querySelector('.delete-btn').onclick = () => {
            saveMovies(getMovies().filter(item => item.id !== m.id));
            render();
        };

        // Редактирование
        card.querySelector('.edit-btn').onclick = () => {
            editingId = m.id;
            typeSelect.value = m.type || 'movie';
            typeSelect.onchange();

            titleInput.value = m.title;
            document.getElementById('yearInput').value = m.year;
            document.getElementById('durationInput').value = m.duration || '';
            document.getElementById('seasonInput').value = m.season || '';
            document.getElementById('episodeInput').value = m.episode || '';

            currentGenres = Array.isArray(m.genre) ? [...m.genre] : (m.genre ? [m.genre] : []);
            renderGenreChips();

            document.getElementById('statusSelect').value = m.status;

            ratingInput.value = m.rating || '';
            updateStarsUI(m.rating || 0);

            posterInput.value = m.posterUrl || '';
            posterInput.oninput();

            document.getElementById('synopsisInput').value = m.synopsis || '';
            document.getElementById('reviewInput').value = m.review || '';
            document.getElementById('kinopoiskInput').value = m.kinopoiskUrl || '';
            document.getElementById('imdbInput').value = m.imdbUrl || '';
            document.getElementById('letterboxdInput').value = m.letterboxdUrl || '';
            document.getElementById('rottenTomatoesInput').value = m.rottenTomatoesUrl || '';

            document.getElementById('formTitle').textContent = 'Редактировать';
            document.getElementById('saveBtn').textContent = 'Сохранить изменения';
            validate();
            modal.classList.add('active');
        };

        grid.appendChild(card);
    });
}

// Сохранение фильтров и поиска в SessionStorage
const FILTERS_KEY = 'moviesFilters';

function saveFilters() {
    sessionStorage.setItem(FILTERS_KEY, JSON.stringify({
        search: searchInput.value,
        genre: filterGenre.value,
        status: filterStatus.value,
        sortBy: sortBy.value,
        isAsc: isAsc
    }));
}

function loadFilters() {
    try {
        return JSON.parse(sessionStorage.getItem(FILTERS_KEY)) || {};
    } catch { return {}; }
}

// Восстанавливаем фильтры при загрузке
(function restoreFilters() {
    const f = loadFilters();    
    if (f.search !== undefined) searchInput.value = f.search;
    if (f.genre)   filterGenre.value  = f.genre;
    if (f.status)  filterStatus.value = f.status;
    if (f.sortBy)  sortBy.value       = f.sortBy;
    if (typeof f.isAsc === 'boolean') {
        isAsc = f.isAsc;
        sortOrderIcon.className = isAsc ? 'fa-solid fa-arrow-up-a-z' : 'fa-solid fa-arrow-down-z-a';
        sortOrderBtn.setAttribute('data-tooltip', isAsc ? 'Порядок: по возрастанию' : 'Порядок: по убыванию');
    }
})();

// Обработчики: при изменении запускается рендер и сохранение
[searchInput, filterGenre, filterStatus, sortBy].forEach(el => {
    el.oninput = el.onchange = () => {
        saveFilters();
        render();
    };
});

render();
validate();

render();
validate();