  const apiKey = "e1934d98d052f592ff880156e86fd340"; 
    let isCelsius = JSON.parse(localStorage.getItem("isCelsius")) ?? true;
    let isDark = JSON.parse(localStorage.getItem("isDark")) ?? false;

    document.addEventListener("DOMContentLoaded", () => {
      document.getElementById("unitToggle").checked = !isCelsius;
      document.getElementById("themeToggle").checked = isDark;
      if (isDark) document.body.classList.add("dark");
      loadHistory();
    });

    function toggleUnits() {
      isCelsius = !isCelsius;
      localStorage.setItem("isCelsius", JSON.stringify(isCelsius));
      const city = document.getElementById("cityInput").value;
      if (city) getWeather(city);
    }

    function toggleTheme() {
      isDark = !isDark;
      document.body.classList.toggle("dark", isDark);
      localStorage.setItem("isDark", JSON.stringify(isDark));
    }

    function saveToHistory(city) {
      let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
      if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem("weatherHistory", JSON.stringify(history));
      }
      loadHistory();
    }

    function loadHistory() {
      const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
      const container = document.getElementById("searchHistory");
      container.innerHTML = "";
      history.forEach(city => {
        const btn = document.createElement("button");
        btn.textContent = city;
        btn.onclick = () => getWeather(city);
        container.appendChild(btn);
      });
    }

    function getWeather(city = null) {
      const input = document.getElementById("cityInput");
      if (!city) city = input.value;
      if (!city) return alert("Enter a city");

      const unit = isCelsius ? "metric" : "imperial";
      const symbol = isCelsius ? "°C" : "°F";

      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`)
        .then(res => {
          if (!res.ok) throw new Error("City not found");
          return res.json();
        })
        .then(data => {
          const weatherCard = document.getElementById("weatherCard");
          const icon = data.weather[0].icon;

          weatherCard.innerHTML = `
            <h2>${data.name}, ${data.sys.country}</h2>
            <lottie-player src="https://assets1.lottiefiles.com/packages/lf20_jzqi4zsb.json" background="transparent" speed="1" loop autoplay></lottie-player>
            <p><strong>${data.weather[0].main}</strong> - ${data.weather[0].description}</p>
            <p>🌡️ Temp: ${data.main.temp} ${symbol}</p>
            <p>💧 Humidity: ${data.main.humidity}%</p>
            <p>🌬️ Wind: ${data.wind.speed} ${unit === 'metric' ? 'm/s' : 'mph'}</p>
          `;
          weatherCard.classList.add("active");
          saveToHistory(data.name);
          getForecast(data.coord.lat, data.coord.lon);
        })
        .catch(err => alert(err.message));
    }

    function getForecast(lat, lon) {
      const unit = isCelsius ? "metric" : "imperial";
      const symbol = isCelsius ? "°C" : "°F";

      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`)
        .then(res => res.json())
        .then(data => {
          const forecastContainer = document.getElementById("forecastContainer");
          forecastContainer.innerHTML = "<h3>5-Day Forecast</h3>";

          const daily = {};

          data.list.forEach(item => {
            const date = item.dt_txt.split(" ")[0];
            if (!daily[date]) daily[date] = item;
          });

          Object.values(daily).slice(0, 5).forEach(day => {
            forecastContainer.innerHTML += `
              <div class="forecast-day">
                <strong>${new Date(day.dt_txt).toDateString()}</strong>
                <p>${day.weather[0].main} - ${day.weather[0].description}</p>
                <p>🌡️ Temp: ${day.main.temp} ${symbol}</p>
              </div>
            `;
          });

          forecastContainer.classList.add("active");
        });
    }

    function getLocation() {
      if (!navigator.geolocation) return alert("Geolocation not supported");

      navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const unit = isCelsius ? "metric" : "imperial";

        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`)
          .then(res => res.json())
          .then(data => {
            document.getElementById("cityInput").value = data.name;
            getWeather(data.name);
          });
      }, () => alert("Location permission denied"));
    }