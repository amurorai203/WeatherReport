var dataLoad = [];
var API_key = "";
var testLocation = "Chicago";
var currentAPIURL = "https://api.openweathermap.org/data/2.5/weather"; 
var forecastAPIURL = "https://api.openweathermap.org/data/2.5/forecast";
var queryURL = "";
var weatherIconPrefix = "https://openweathermap.org/img/wn/";
var weatherIconSuffix = "@2x.png";
var today = dayjs().format("MM/DD/YYYY");

const weatherClass = {
    Date: dayjs(),
    icon: "",
    iconUrl: "",
    temp: "",
    wind: "",
    humidity: ""
}

function loadAPIKey(){
    var inputAPIKey = prompt("Please input a valid (Open Weather) API Key", "");
    console.log(inputAPIKey);
    if (inputAPIKey != null){
        API_key = inputAPIKey.trim();
        console.log("In loadAPI ");
        callAPI(testLocation, dayjs().format("MM/DD/YYYY"));
        // if (callAPI(testLocation)){
        //     return true;
        // } else {
        //     loadAPIKey();
        // }
        return true;
    } else{
        console.log("nothing input");
        $(".container-fluid").empty();
        return false;
    }
}

function callAPI(location, queryDate){

    queryURL = currentAPIURL + "?units=metric&q=" + location + "&appid=" + API_key;
    fetch(queryURL)
    .then(function(response){
        console.log("äfter fetch");
        return response.json();
    })
    .then(function (data){
        var results = data;
        console.log(data);
        var workingWeather = Object.create(weatherClass);        
        workingWeather.Date = queryDate;
        workingWeather.icon = data.weather[0].icon;
        workingWeather.iconUrl = weatherIconPrefix + data.weather[0].icon + weatherIconSuffix;
        workingWeather.temp = data.main.temp;
        workingWeather.wind = data.wind.speed;
        workingWeather.humidity = data.main.humidity;
        console.log(workingWeather);

        var objectElt = CreateDisplayElt(location, workingWeather, "column");
        $("#today").empty();
        $("#today").append(objectElt);

    }) .catch(err => {
        console.error("This is error return from Open Weather API: ", err)
        return false;
    })

    queryURL = forecastAPIURL + "?units=metric&q=" + location + "&appid=" + API_key;   
    fetch(queryURL)
    .then(function(response){
        console.log("äfter fetch");
        return response.json();
    })
    .then(function (data){
        var results = data;
        console.log(data);
        $("#forecast").empty();
        $("#forecast").append("<h3>5 Day - Forecast</h3>");
        for (let x=0;x<5;x++){
            var workingWeather = Object.create(weatherClass);        
            workingWeather.Date = dayjs.unix(data.list[x*8].dt).format("MM/DD/YYYY");
            workingWeather.icon = data.list[x*8].weather[0].icon;
            workingWeather.iconUrl = weatherIconPrefix + data.list[x*8].weather[0].icon + weatherIconSuffix;
            workingWeather.temp = data.list[x*8].main.temp;
            workingWeather.wind = data.list[x*8].wind.speed;
            workingWeather.humidity = data.list[x*8].main.humidity;
            console.log(workingWeather);

            var objectElt = CreateDisplayElt(location, workingWeather, "column");
            $("#forecast").append(objectElt);
        }
        return true;
    }) .catch(err => {
        console.error("This is error return from Open Weather API: ", err)
        return false;
    })
}

function CreateDisplayElt(location, weatherClass, rowcolumn){
    var weatherContainerElt = $("<div>");
    weatherContainerElt.addClass(rowcolumn);
    var divElt = $("<p>");
    divElt.text(location + "(" + weatherClass.Date + ")");
    var iconElt = $("<img>");
    iconElt.addClass("class=img-fluid");
    iconElt.attr("src", weatherClass.iconUrl);
    // iconElt.attr("height", "50px");
    // iconElt.attr("width", "50px");
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
    var tempDataLoad = JSON.parse(localStorage.getItem("search-history"));
    if (tempDataLoad != null){
        dataLoad = tempDataLoad;
        console.log(dataLoad);
        for (let i=0;i<dataLoad.length;i++){
            var buttonElt = $("<button>");
            buttonElt.addClass("list-group-item list-group-item-action");
            buttonElt.attr("type", "button");
            buttonElt.text(dataLoad[i]);
            console.log(dataLoad[i]);
            var pElt = $("<p>");
            $("#history").append(pElt);
            $("#history").append(buttonElt);
        }
    }
}

$("#history").on("click", ".list-group-item", function(event){
    console.log(event.target);
    var location = event.target.textContent;
    callAPI(location, dayjs().format("MM/DD/YYYY"));
})

$("#search-button").on("click", function(event){
    event.preventDefault();
    var location = $("#search-input").val();
    saveRecord(location);
    callAPI(location, dayjs().format("MM/DD/YYYY"));
});

function saveRecord(locationSave){
    dataLoad.push(locationSave);
    // console.log(dataLoad);
    localStorage.setItem("search-history", JSON.stringify(dataLoad));
}

function init(){
    // saveRecord("Chicage");
    // saveRecord("London");
    if (loadAPIKey()) {
        loadData();
    }
}

init();