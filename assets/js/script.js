var dataLoad = [];
var API_key = "";
var defaultLocation = $("#search-input").attr("placeholder");
var currentAPIURL = "https://api.openweathermap.org/data/2.5/weather"; 
var forecastAPIURL = "https://api.openweathermap.org/data/2.5/forecast";
var queryURL = "";
var weatherIconPrefix = "https://openweathermap.org/img/wn/";
var weatherIconSuffix = "@2x.png";
var dateFormat = "MM/DD/YYYY";
var today = dayjs().format(dateFormat);
var storageName = "search-history";

// Define the object for weather information
const weatherClass = {
    Date: dayjs(),
    icon: "",
    iconUrl: "",
    temp: "",
    wind: "",
    humidity: ""
}

// Load and validate the API key input from user and blank screen if invalid
function loadAPIKey(){
    var inputAPIKey = prompt("Please input a valid (Open Weather) API Key", "36716e91288f48d1fb0d996c17c7ce73");

    if (inputAPIKey != null){
        API_key = inputAPIKey.trim();

        callAPI(defaultLocation, dayjs().format(dateFormat));
        return true;
    } else{
        $(".container-fluid").empty();
        return false;
    }
}

// Function to trigger Weather API to collect data and display result
function callAPI(location, isNew){
    // Clear the today and forecast area
    $("#today").empty();
    $("#forecast").empty();
    queryURL = currentAPIURL + "?units=metric&q=" + location + "&appid=" + API_key;

    // fetch the prepared today API URL
    fetch(queryURL)
    .then(function(response){
        return response.json();
    })
    .then(function (data){
        var results = data;
        // console.log(data);
        // Create and assign return from Weather API for today weather info
        var workingWeather = Object.create(weatherClass);        
        workingWeather.Date = dayjs.unix(data.dt).format(dateFormat);
        workingWeather.icon = data.weather[0].icon;
        workingWeather.iconUrl = weatherIconPrefix + data.weather[0].icon + weatherIconSuffix;
        workingWeather.temp = data.main.temp;
        workingWeather.wind = data.wind.speed;
        workingWeather.humidity = data.main.humidity;
        // Create and display today weather info
        var objectElt = CreateDisplayElt(location, workingWeather, "column");
        $("#today").append(objectElt);

    }) .catch(err => {
        // console.error("This is error return from Open Weather API: ", err);
        alert("This is error return from Open Weather API: " + err);
    })

    queryURL = forecastAPIURL + "?units=metric&q=" + location + "&appid=" + API_key;  
    
    // fetch the prepared forecast API URL
    fetch(queryURL)
    .then(function(response){
        return response.json();
    })
    .then(function (data){
        var results = data;
        // console.log(data);
        var headerElt = $("<div>");
        headerElt.text("5 Day - Forecast");
        $("#forecast").append(headerElt);
        // Loop the return result for 5 forecast weather info
        for (let x=1;x<6;x++){
            var workingWeather = Object.create(weatherClass);        
            workingWeather.Date = dayjs.unix(data.list[x*8-1].dt).format(dateFormat);
            workingWeather.icon = data.list[x*8-1].weather[0].icon;
            workingWeather.iconUrl = weatherIconPrefix + data.list[x*8-1].weather[0].icon + weatherIconSuffix;
            workingWeather.temp = data.list[x*8-1].main.temp;
            workingWeather.wind = data.list[x*8-1].wind.speed;
            workingWeather.humidity = data.list[x*8-1].main.humidity;
            // Add the created elements and display in forecast area
            var objectElt = CreateDisplayElt(location, workingWeather, "col");
            $("#forecast").append(objectElt);
        }

        // Save and refresh buttons if needed
        if (isNew){
            saveRecord(location);
            loadData();
        }
    }) .catch(err => {
        // console.error("This is error return from Open Weather API: ", err);
        alert("This is error return from Open Weather API: " + err);
    })
}

function CreateDisplayElt(location, weatherClass, rowcolumn){
    // Create the HTML object for displaying the collected Weather information
    var weatherContainerElt = $("<div>");
    weatherContainerElt.addClass(rowcolumn);
    var divElt = $("<p>");
    divElt.text(location + "(" + weatherClass.Date + ")");
    var iconElt = $("<img>");
    iconElt.addClass("class=img-fluid");
    iconElt.attr("src", weatherClass.iconUrl);
    var tempElt = $("<p>");
    tempElt.text("Temp: " + weatherClass.temp + "°C");
    var windElt = $("<p>");
    windElt.text("Wind: " + weatherClass.wind + " KPH");
    var humidityElt = $("<p>");
    humidityElt.text("Humidity: " + weatherClass.humidity + "%");
    weatherContainerElt.append(divElt);
    weatherContainerElt.append(iconElt);
    weatherContainerElt.append(tempElt);
    weatherContainerElt.append(windElt);
    weatherContainerElt.append(humidityElt);
    return weatherContainerElt;

}

function loadData(){
    var tempDataLoad = JSON.parse(localStorage.getItem(storageName));
    if (tempDataLoad != null){
        dataLoad = tempDataLoad;
        // Empty the search history area and create with buttons stored in local datastore
        $("#history").empty();
        for (let i=0;i<dataLoad.length;i++){
            var buttonElt = $("<button>");
            buttonElt.addClass("list-group-item list-group-item-action");
            buttonElt.attr("type", "button");
            buttonElt.text(dataLoad[i]);
            var pElt = $("<p>");
            $("#history").append(pElt);
            $("#history").append(buttonElt);
        }
    }
}

$("#history").on("click", ".list-group-item", function(event){
    // Get the clicked City name and call API for weather info
    var location = event.target.textContent;
    callAPI(location, false);
})

$("#search-button").on("click", function(event){
    event.preventDefault();
    // Get the input City information and call API for weather info
    var location = $("#search-input").val();
    callAPI(location, true);
    // Clear the input area for next input
    $("#search-input").attr("placeholder", "");
    $("#search-input").val("");
});

function saveRecord(locationSave){
    // Check if the input is already exist in Stored area
    if (dataLoad.includes(locationSave)){
        return;
    }
    // Save to local datastore
    dataLoad.push(locationSave);
    localStorage.setItem(storageName, JSON.stringify(dataLoad));
}

function init(){
    if (loadAPIKey()) {
        loadData();
    }
}

init();