const API_KEY = "5fd52cb68caada91d157504baac2fcb2";

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const locationButton = document.getElementById("location-button");
const themeToggle = document.getElementById("theme-toggle");
const loadingIndicator = document.getElementById("loading");
const errorContainer = document.getElementById("error-container");
const errorMessage = document.getElementById("error-message");
const currentWeather = document.getElementById("current-weather");
// const currentYear = document.getElementById("current-year");

// currentYear.textContent = new Date().getFullYear();

searchButton.addEventListener("click", handleSearch);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSearch();
  }
});
locationButton.addEventListener("click", getUserLocation);
themeToggle.addEventListener("click", toggleTheme);

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
  getUserLocation();
});

function toggleTheme() {
  if (document.body.classList.contains("dark-mode")) {
    document.body.classList.remove("dark-mode");
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    localStorage.setItem("darkMode", "disabled");
  } else {
    document.body.classList.add("dark-mode");
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    localStorage.setItem("darkMode", "enabled");
  }
}

function handleSearch() {
  const city = searchInput.value.trim();
  if (city) {
    getWeatherByCity(city);
  }
}

function getUserLocation() {
  if (navigator.geolocation) {
    showLoading();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getWeatherByCoordinates(latitude, longitude);
      },
      (error) => {
        hideLoading();
        showError(
          "Unable to retrieve your location. Please search for a city."
        );
        console.error("Geolocation error:", error);
      }
    );
  } else {
    showError("Geolocation is not supported by your browser.");
  }
}

async function getWeatherByCity(city) {
  try {
    showLoading();
    hideError();

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(
        "City not found. Please check the spelling and try again."
      );
    }

    const data = await response.json();
    const { lat, lon } = data.coord;

    getWeatherByCoordinates(lat, lon);
  } catch (error) {
    hideLoading();
    showError(error.message);
    console.error("Error fetching weather by city:", error);
  }
}

async function getWeatherByCoordinates(lat, lon) {
  try {
    showLoading();
    hideError();

    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    if (!currentResponse.ok) {
      throw new Error("Failed to fetch current weather data.");
    }

    const currentData = await currentResponse.json();
    displayCurrentWeather(currentData);

    hideLoading();
    showWeatherData();
  } catch (error) {
    hideLoading();
    showError(error.message);
    console.error("Error fetching weather data:", error);
  }
}

function displayCurrentWeather(data) {
  document.getElementById(
    "city"
  ).textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById("date").textContent = formatDate(data.dt);

  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  document.getElementById("weather-icon").src = iconUrl;
  document.getElementById("weather-icon").alt = data.weather[0].description;

  document.getElementById("temperature").textContent = `${Math.round(
    data.main.temp
  )}°C`;
  document.getElementById("weather-condition").textContent =
    data.weather[0].description;
  document.getElementById("feels-like").textContent = `${Math.round(
    data.main.feels_like
  )}°C`;

  document.getElementById("wind-speed").textContent = `${data.wind.speed} m/s`;
  document.getElementById("humidity").textContent = `${data.main.humidity}%`;
  document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;
  document.getElementById("visibility").textContent = `${(
    data.visibility / 1000
  ).toFixed(1)} km`;

  document.getElementById("sunrise").textContent = formatTime(data.sys.sunrise);
  document.getElementById("sunset").textContent = formatTime(data.sys.sunset);
}

function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function showLoading() {
  loadingIndicator.classList.remove("hidden");
  currentWeather.classList.add("hidden");
}

function hideLoading() {
  loadingIndicator.classList.add("hidden");
}

function showWeatherData() {
  currentWeather.classList.remove("hidden");
}

function showError(message) {
  errorContainer.classList.remove("hidden");
  errorMessage.textContent = message;
  currentWeather.classList.add("hidden");
}

function hideError() {
  errorContainer.classList.add("hidden");
}
