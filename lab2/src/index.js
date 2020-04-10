import 'bootstrap/dist/css/bootstrap.min.css';

import 'bootstrap';

import moment from 'moment';

function getLocation () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((geoLocationPosition) => {
        const { latitude, longitude } = geoLocationPosition.coords;
        getWeather({ latitude, longitude });
      }, (err) => {
        toggleCardDisplays(null);
      });
    } else {
        toggleCardDisplays(null);
    }
}

function toggleCardDisplays (weatherData) {
    $('#slidr-div').html("");

    if (weatherData) { 
        renderWeatherData(weatherData);
        weatherSlidr = slidr.create('slidr-div', {
            breadcrumbs: false,
            controls: 'border',
            direction: 'horizontal',
            fade: true,
            keyboard: false,
            overflow: false,
            theme: '#6c757d',
            touch: true,
        });
        weatherSlidr.add('h', $('#slidr-div').map(() => $(this).attr('id')).get(), undefined, true);
        weatherSlidr.start('0');
    }
    
    if (Boolean(weatherData) === $('.welcomeCard').is(':visible')) {
        $('.welcomeCard').slideToggle();
        $('nav').slideToggle();
    }
}

function getUnitPreference () {
    return 'imperial';
}

function renderErrorAlert(text) {
    $('body').prepend(`
    <div id="errorAlert" 
        class="alert alert-warning alert-dismissible fade show" 
        role="alert" 
        style="position:absolute;left:50%;z-index:1;"
    >
        <strong>Error</strong> ${text}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
            </button>
    </div>
    `);
}

function getWeather (params) {
    $.post("/getWeather", {
        ...params,
        units: getUnitPreference()
    },
    function (response) {
        console.log(response);
        if (response.err) {
            renderErrorAlert(response.err.message);
            $('#errorAlert').alert();
        } else {
            currentMoment = moment.unix(response.weather.dt);

            toggleCardDisplays(response);
        }
    },
    "json");
}

function generateWeatherConditionPanel(weatherCondition) {
    const { main, icon } = weatherCondition;
    return `
            <div class="col text-center">
            <h6 class="card-subtitle text-muted">${main}</h6>
            <img class="mx-auto d-block" src="http://openweathermap.org/img/wn/${icon}@2x.png" width="100" height="100" alt="" />
            </div>
    `;

}

function generateWeatherPanelHeader(data) {
    let html = `
        <div class="row align-items-center justify-content-center">
            <div class="col-auto">
                <small>${moment.unix(data.dt).format('h A')}</small>
            </div>
            <div class="col-auto text-muted">
                <small>${Math.round(data.main.temp)}&#176</small>
            </div>
    `;

    for (const { icon } of data.weather) {
        html += `
            <img class="col-auto p-0" src="http://openweathermap.org/img/wn/${icon}.png" alt="" />`;
    }

    if (data.weather.length <= 1) {
        html += `
            <div class="col-auto">
                <small class="text-muted">${data.weather[0].main}</small>
            </div>
        </div>`;
    }

    return html;
}

function generateWeatherPanel(data, title, forecastIndex, cardIndex) {    
    let html = `
    <div class="card weatherCard">
        <div 
            class="card-header p-0"
            data-toggle="collapse"
            data-target="#dt-${forecastIndex}-${cardIndex}"
            type="button"
        >           
    `;

    html += generateWeatherPanelHeader(data);

    html += `
        </div>
    `;

    let weatherConditionPanelsHtml = "";
    for (const weatherCondition of data.weather) {
        weatherConditionPanelsHtml += generateWeatherConditionPanel(weatherCondition);
    }

    const { temp, feels_like, temp_min, temp_max } = data.main;

    html += ` 
        <div id="dt-${forecastIndex}-${cardIndex}" class="collapse weatherPanel" data-parent="#accordion${cardIndex}">  
            <div class="card-body border-bottom">
                <div class="container">
                    <div class="row">
                        <div class="col-12 text-center">
                            <h5 id="cityName" class="card-title">${title}</h5>
                        </div>
                    </div>
                    <div id="weatherConditionPanels" class="row">${weatherConditionPanelsHtml}</div>

                    <div class="row">
                        <div class="col-6 text-right border-right">
                            <h1 class="display-4">${Math.round(temp)}&#176</h1>
                        </div>
                        <div class="col-6">
                            <div class="row">
                                <div class="col-12 text-muted">Feels like ${Math.round(feels_like)}&#176</div>
                                <div class="col-12 text-muted">Highest ${Math.round(temp_max)}&#176</div>
                                <div class="col-12 text-muted">Lowest ${Math.round(temp_min)}&#176</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
            
    return html;
}

var currentMoment = null;


function generateWeatherPanels(data, title, forecastIndex, cardIndex) {
    let weatherPanelsHtml = "";

    for (   let first = true;
            forecastIndex < data.list.length && 
            (moment.unix(data.list[forecastIndex].dt).isSame(
                forecastIndex === 0 ? currentMoment : moment.unix(data.list[forecastIndex - 1].dt), 
                'day') || first); 
        first = false, forecastIndex++) {

        weatherPanelsHtml += generateWeatherPanel(data.list[forecastIndex], title, forecastIndex, cardIndex);
    }

    return { weatherPanelsHtml, forecastIndex };
}

function generateWeatherCard(weatherCardIndex, weatherPanelsHtml) {
    return `
    <div data-slidr="${weatherCardIndex}">
        <div id="accordion${weatherCardIndex}" class="accordion">${weatherPanelsHtml}</div>
    </div>
    `;
}

function renderWeatherData({ weather, forecast }) {
    for (let i = 0, forecastIndex = 0, weatherPanelsHtml; forecastIndex < forecast.list.length; i++) {
        ({ weatherPanelsHtml, forecastIndex } = 
            generateWeatherPanels(forecast, weather.name, forecastIndex, i));

        $('#slidr-div').append(
            generateWeatherCard(
                i,
                weatherPanelsHtml,
            )
        );
    }
    $('.card-header').on('click', function (e) {
        if($(this).parents('.card').children('.collapse').hasClass('show')) {
            e.stopPropagation();
        }
        e.preventDefault();
    });
    $('.collapse.weatherPanel').on('show.bs.collapse', function () {
        const data = forecast.list[+($(this).attr('id').split("-")[1])];
        $(this).parents('.card').children('.card-header').html(
            `
            <div class="row align-items-center justify-content-between">
                <div class="col-auto m-3">
                    ${moment.unix(data.dt).format('dddd h A')}
                </div>
                <div class="col-auto m-3">
                    ${moment.unix(data.dt).format('MMM D')}
                </div>
            </div>
            `
        );
    });
    $('.collapse.weatherPanel').on('hide.bs.collapse', function () {
        const data = forecast.list[+($(this).attr('id').split("-")[1])];
        $(this).parents('.card').children('.card-header').html(
            generateWeatherPanelHeader(data)
        );
    });
    $('.accordion').each(function () {
        $(this).children().first().find('.collapse').collapse('show');
    });
}  

var weatherSlidr;

$(document).ready(function () {
    $('.locationButton').click(function () {
        getLocation();
    });
    $('.locationForm').each(function () {
        $(this).submit((evt) => {
            const val = $(this).find('input').first().val();
            const params = {};
    
            if (isNaN(+val)) {
                params.cityName = val;
            } else {
                params.zipCode = +val;
            }
            $(this).find("input[type=search]").val("");
            $(this).blur();
            
            getWeather(params);
            evt.preventDefault();
        });
    });
});