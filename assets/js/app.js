// Constants and Global Variables
const WEATHER_API_ROOT_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const WEATHER_API_KEY = 'your_openweather_api_key_here';  // Replace with your actual API key
let searchHistory = [];

// DOM Element References
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const todayContainer = document.querySelector('#today');
const forecastContainer = document.querySelector('#forecast');
const searchHistoryContainer = document.querySelector('#history');

// Add timezone plugins to day.js
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

// Helper function to update local storage and render search history
function appendToHistory(search) {
  if (!searchHistory.includes(search)) {
    searchHistory.push(search);
    localStorage.setItem('search-history', JSON.stringify(searchHistory));
    renderSearchHistory();
  }
}

// Function to render search history
function renderSearchHistory() {
  searchHistoryContainer.innerHTML = searchHistory
    .slice()
    .reverse()
    .map((city) => {
      return `
        <button type="button" class="history-btn btn-history" data-search="${city}">
          ${city}
        </button>`;
    })
    .join('');
}

// Function to initialize search history from local storage
function initSearchHistory() {
  const storedHistory = localStorage.getItem('search-history');
  if (storedHistory) {
    searchHistory = JSON.parse(storedHistory);
  }
  renderSearchHistory();
}

// Function to render current weather data
function renderCurrentWeather(city, weather) {
  const date = dayjs().format('M/D/YYYY');
  const { temp, humidity } = weather.main;
  const { speed: windMph } = weather.wind;
  const { icon, description } = weather.weather[0];

  todayContainer.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h2 class="h3 card-title">${city} (${date})</h2>
        <img src="https://openweathermap.org/img/w/${icon}.png" alt="${description}" class="weather-img" />
        <p class="card-text">Temp: ${temp}°F</p>
        <p class="card-text">Wind: ${windMph} MPH</p>
        <p class="card-text">Humidity: ${humidity}%</p>
      </div>
    </div>`;
}

// Function to render a forecast card
function renderForecastCard(forecast) {
  const { temp, humidity } = forecast.main;
  const { speed: windMph } = forecast.wind;
  const { icon, description } = forecast.weather[0];

  return `
    <div class="col-md five-day-card">
      <div class="card bg-primary h-100 text-white">
        <div class="card-body p-2">
          <h5 class="card-title">${dayjs(forecast.dt_txt).format('M/D/YYYY')}</h5>
          <img src="https://openweathermap.org/img/w/${icon}.png" alt="${description}" class="weather-img" />
          <p class="card-text">Temp: ${temp} °F</p>
          <p class="card-text">Wind: ${windMph} MPH</p>
          <p class="card-text">Humidity: ${humidity}%</p>
        </div>
      </div>
    </div>`;
}

// Function to render 5-day forecast
function renderForecast(dailyForecast) {
  const startDt = dayjs().add(1, 'day').startOf('day').unix();
  const endDt = dayjs().add(6, 'day').startOf('day').unix();

  const filteredForecast = dailyForecast.filter((forecast) => {
    const forecastTime = forecast.dt;
    const isValidTime = forecastTime >= startDt && forecastTime < endDt;
    const isNoonForecast = forecast.dt_txt.includes('12:00:00');
    return isValidTime && isNoonForecast;
  });

  forecastContainer.innerHTML = `
    <div class="col-12">
      <h4>5-Day Forecast:</h4>
    </div>
    ${filteredForecast.map(renderForecastCard).join('')}`;
}

// Function to render current weather and forecast
function renderWeather(city, data) {
  renderCurrentWeather(city, data.list[0]);
  renderForecast(data.list);
}

// Function to fetch weather data using lat, lon from OpenWeather API
async function fetchWeather(location) {
  const { lat, lon, name: city } = location;
  const apiUrl = `${WEATHER_API_ROOT_URL}?lat=${lat}&lon=${lon}&units=imperial&appid=${WEATHER_API_KEY}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    renderWeather(city, data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

// Function to fetch coordinates for a city from OpenWeather API
async function fetchCoords(search) {
  const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${search}&limit=5&appid=${WEATHER_API_KEY}`;
  try {
    const response = await fetch(geoApiUrl);
    const data = await response.json();
    if (!data.length) {
      alert('Location not found');
      return;
    }
    appendToHistory(search);
    fetchWeather(data[0]);
  } catch (error) {
    console.error('Error fetching coordinates:', error);
  }
}

// Event handler for search form submission
function handleSearchFormSubmit(event) {
  event.preventDefault();
  const search = searchInput.value.trim();
  if (search) {
    fetchCoords(search);
    searchInput.value = '';
  }
}

// Event handler for clicking on search history
function handleSearchHistoryClick(event) {
  if (event.target.matches('.btn-history')) {
    const search = event.target.getAttribute('data-search');
    fetchCoords(search);
  }
}

// Initialize the app
function initializeApp() {
  initSearchHistory();
  searchForm.addEventListener('submit', handleSearchFormSubmit);
  searchHistoryContainer.addEventListener('click', handleSearchHistoryClick);
}

initializeApp();
