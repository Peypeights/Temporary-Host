let users_longitude
let user_latitude

function darkMode() {
    const body = document.querySelector("body")
    body.style.backgroundColor = "#35374B"

    const title = document.querySelector("nav > div > h1")
    title.style.color = "white"

    const creator = document.querySelector("nav > div > h1 > a")
    creator.style.color = "white"

    const mainTemp = document.querySelector("#temp")
    mainTemp.style.color = "white"

    const mainWind = document.querySelector("#wind")
    mainWind.style.color = "white"

    const outer = document.querySelector(".outer")
    const middle = document.querySelector(".middle")
    const inner = document.querySelector(".inner")

    outer.style.backgroundColor = "#F2EFE7"
    middle.style.backgroundColor = "#E5E5E5"
    inner.style.backgroundColor = "#CECECE"

    const mainContainer = document.querySelectorAll(".main-container > div")
    for (let i = 0; i < mainContainer.length; i++) {
        mainContainer[i].style.backgroundColor = "#30313A"
    }

    const date = document.querySelectorAll(".date")
    for (let i = 0; i < date.length; i++) {
        date[i].style.color = "white"
    }
}

async function getCountry() {
    try {
        const response = await fetch(`https://us1.api-bdc.net/data/reverse-geocode-client?latitude=${user_latitude}&longitude=${users_longitude}&localityLanguage=en`)
        const object = await response.json()

        if (!response.ok) {
            throw error
        }

        return object
    } catch (error) {

    }
}

async function setCurrentTempAndWind(object) {
    const weatherCode = {
        0: "Clear Sky",
        1: "Mainly Clear",
        2: "Partly Cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing Rime Fog",
        51: "Light Drizzle",
        53: "Moderate Drizzle",
        55: "Dense Drizzle",
        56: "Light Freezing Drizzle",
        57: "Dense Freezing Drizzle",
        61: "Slight Rain",
        63: "Moderate Rain",
        65: "Heavy Rain",
        66: "Light Freezing Rain",
        67: "Dense Freezing Rain",
        71: "Slight Snow Fall",
        73: "Moderate Snow Fall",
        75: "Heavy Snow Fall",
        77: "Snow Grains",
        80: "Slight Rain Showers",
        81: "Moderate Rain Showers",
        82: "Violent Rain Showers",
        85: "Slight Snow Showers",
        86: "Heavy Snow Showers",
        95: "Thunderstorm",
        96: "Thunderstorm with Heavy Hail"
    }

    const weather = weatherCode[object["current"]["weather_code"]]
    const temp = object["current"]["temperature_2m"]
    const wind = `${object["current"]["wind_speed_10m"]}km/h`
    let string = `${weather}, ${temp}°`

    const webTemp = document.querySelector("#temp")
    webTemp.innerHTML = string

    const webWind = document.querySelector("#wind")
    webWind.innerHTML = wind

    if (weather.split(" ").length > 1) {
        webTemp.style.fontSize = "48px"
        webWind.style.fontSize = "32px"
    }

    let country = await getCountry()
    country = country["city"] + ", " + country["countryName"].replace(" (the)", "")

    const webCountry = document.querySelector("#country")
    webCountry.innerHTML = country

    const past_dates = document.querySelectorAll(".past .date")
    const future_dates = document.querySelectorAll(".forecast .date")

    for (let i = 1; i < 5; i++) {
        past_dates[i].innerHTML = object["daily"]["time"][i].replace(/-/g, "/")
    }

    for (let i = 7; i < 11; i++) {
        future_dates[i - 6].innerHTML = object["daily"]["time"][i].replace(/-/g, "/")
    }

    const past_data = document.querySelectorAll(".past .data")
    const future_data = document.querySelectorAll(".forecast .data")
    
    for (let i = 0; i < 5; i++) {
        temporary_temp = `${weatherCode[object["daily"]["weather_code"][i]]}, ${object["daily"]["temperature_2m_mean"][i]}°`
        past_data[i].innerHTML = temporary_temp
    }

    for (let i = 6; i < 11; i++) {
        temporary_temp = `${weatherCode[object["daily"]["weather_code"][i]]}, ${object["daily"]["temperature_2m_mean"][i]}°`
        future_data[i - 6].innerHTML = temporary_temp
    }
}

function runMain(object) {
    if (!object["current"]["is_day"]) { // If its night, it runs darkMode function
        darkMode()
    }

    setCurrentTempAndWind(object)
}

async function runAPI() {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${user_latitude}&longitude=${users_longitude}&daily=temperature_2m_mean,weather_code,wind_speed_10m_mean&current=temperature_2m,is_day,weather_code,wind_speed_10m&timezone=auto&past_days=5`)
        const object = await response.json()

        if (!response.ok) {
            throw error
        }

        runMain(object)
    } catch (error) {}
}

// Checks if browser support geolocation
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition( // Gets the users current location
        // If success, calls the first function while passing a position object
        (position) => {
            user_latitude = position.coords.latitude
            users_longitude = position.coords.longitude

            runAPI()
        }, (error) => {
            alert("Couldn't get location")
        }
    )
} else {
    alert("Your browser doesn't support geolocation")
}