const WEATHER_API_ROOT_URL = 'https://api.openweathermap.org';
const WEATHER_API_KEY = 'd91f911bcf2c0f925fb6535547a5ddc9';

export async function fetchWeather(lat, lon) {
    const apiUrl = `${WEATHER_API_ROOT_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${WEATHER_API_KEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
}

export async function fetchCoords(search) {
    const apiUrl = `${WEATHER_API_ROOT_URL}/geo/1.0/direct?q=${search}&limit=5&appid=${WEATHER_API_KEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
}
