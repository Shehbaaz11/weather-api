const API_KEY = "b561244df50b7eb4f0bdb7f68f8f4008"; 
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const weatherResult = document.getElementById("weather-result");
const errorMessage = document.getElementById("error-message");
const forecastContainer = document.getElementById("forecast-container");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) getWeather(city);
});

cityInput.addEventListener("input", () => {
  errorMessage.classList.add("hidden");
});

async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();
    displayWeather(data);
    errorMessage.classList.add("hidden");
    getForecast(data.coord.lat, data.coord.lon); 
  } catch {
    weatherResult.classList.add("hidden");
    errorMessage.textContent = "City not found. Please try again.";
    errorMessage.classList.remove("hidden");
  }
}

function displayWeather(data) {
  document.getElementById("city-name").textContent = data.name;
  document.getElementById("weather-description").textContent =
    data.weather[0].description;
  document.getElementById("temperature").textContent = data.main.temp.toFixed(1);
  document.getElementById("feels-like").textContent = data.main.feels_like.toFixed(1);
  document.getElementById("humidity").textContent = data.main.humidity;
  document.getElementById("wind-speed").textContent = data.wind.speed;
  document.getElementById("pressure").textContent = data.main.pressure;
  document.getElementById("sunrise").textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
  document.getElementById("sunset").textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString();
  weatherResult.classList.remove("hidden");
}

async function getForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch forecast");
    const forecastData = await response.json();
    displayForecast(forecastData); 
  } catch {
    console.error("Failed to fetch the forecast data.");
  }
}

function displayForecast(data) {
  forecastContainer.innerHTML = ""; 
  const dailyData = groupForecastByDay(data.list);

  dailyData.slice(0, 4).forEach((day) => {
    const forecastCard = document.createElement("div");
    forecastCard.classList.add("forecast-card");
    forecastCard.innerHTML = `
            <h3>${day.date}</h3>
            <p>🌡️ Max: ${day.tempMax.toFixed(1)}°C</p>
            <p>🌡️ Min: ${day.tempMin.toFixed(1)}°C</p>
            <p>☁️ ${day.description}</p>
            <p>💧 Humidity: ${day.humidity}%</p>
        `;
    forecastContainer.appendChild(forecastCard);
  });
  forecastContainer.classList.remove("hidden");
}

function groupForecastByDay(forecastList) {
  const dailyData = {};
  forecastList.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString("en-US", { weekday: "long" });
    if (!dailyData[date]) {
      dailyData[date] = {
        date: date,
        tempMax: item.main.temp_max,
        tempMin: item.main.temp_min,
        description: item.weather[0].description,
        humidity: item.main.humidity,
      };
    } else {
      dailyData[date].tempMax = Math.max(dailyData[date].tempMax, item.main.temp_max);
      dailyData[date].tempMin = Math.min(dailyData[date].tempMin, item.main.temp_min);
    }
  });
  return Object.values(dailyData);
}
