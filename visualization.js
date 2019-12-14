var filename = 'SFBay-months.csv';
var attributes = ['Chlorophyll','Active vs. degraded Chlorophyll',
                  'Oxygen', 'Salinity','Temperature'];
var lines = [];
var stations = [];
var the_station = undefined;
var zoom_title = 'Select Timerange for Zoom';

// will be loaded from data
var minTemp = 100;
var maxTemp = 0;

// current time range
var startDate = new Date(0);
var endDate = new Date();

// helper function - load CSV file from URL
function loadCSV(file) {
  if (d3.version.substring(0,1) == '4') {
    return new Promise(function(resolve, reject) {
      d3.csv(filename, resolve);
    });
  }
  else {
    return d3.csv(file);
  }
}

// load station coordinates from CSV file
async function loadStations() {
  stations = await loadCSV('stations.csv');
}

// load data points from (modified) CSV file
async function loadData() {
  lines = await loadCSV(filename);
  lines = MG.convert.date(lines, 'date');
  for (line of lines) {
    var temp = line['Temperature'];
    if (temp) {
      temp = parseFloat(temp);
      if (temp < minTemp) {
        minTemp = temp;
      }
      if (temp > maxTemp) {
        maxTemp = temp;
      }
    }
  }
}

// get function for click handler
function clickHandler(name) {
  return function() {
    showStation(name);
  }
}

// create image map from stations
function addStationsMap() {
  var svg = d3.select("#map")
        .attr("id", "water-path")
	.attr("width", 850)
	.attr("height", 1053);
  // loop through stations
  for (station of stations) {
    var area = document.createElement('area');
    area.setAttribute('shape', 'circle');
    area.setAttribute('title', 'Station ' + station.name);
    var coords = station.x + ',' + station.y + ',10';
    area.setAttribute('coords', coords);
    area.setAttribute('href', 'javascript:showStation("' +
        station.name + '");');
    // add area to imagemap
    // image_map.appendChild(area);
    // add rectangular
    svg.append("circle")
       .attr("id", "station-" + station.name)
       .attr("cx", station.x)
       .attr("cy", station.y)
       .attr("r", "10")
       .on("click", clickHandler(station.name))
       .attr("fill", "white");
  }
};

// show a station
function showStation(name) {
  the_station = name;
  showAllData();
  showData();
  if (name) {
    document.getElementById('reset-station').style.display = 'block';
  }
  else {
    document.getElementById('reset-station').style.display = 'none';
  }
}

// get data to be displayed
function getData(station, smooth) {
  var item_sums = {};
  var item_counts = {};
  var dates = [];
  // loop through all lines
  for (line of lines) {
    var date = new Date(line.date);
    if (smooth) {
      date.setMonth(6);
    }
    if (!the_station || the_station == line['Station.Number']) {
      for (attr of attributes) {
        // print(line[attr]);
        if (attr in line && line[attr] != "" && line[attr] != "NaN") {
          if (!(date in item_sums)) {
            item_sums[date] = {};
            item_counts[date] = {};
            dates.push(date);
          }
          if (!(attr in item_sums[date])) {
            item_sums[date][attr] = 0.;
            item_counts[date][attr] = 0;
          }
          item_sums[date][attr] += parseFloat(line[attr]);
          item_counts[date][attr] += 1;
        }
      }
    }
  }
  // calculate average
  var items = [];
  for (date of dates) {
    item = {};
    for (attr of attributes) {
      if (attr in item_sums[date]) {
        item[attr] = item_sums[date][attr] / item_counts[date][attr];
      }
    }
    item.date = date;
    items.push(item);
  }
  return items;
};

var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
];

// get text (only month) for date
function dateText(date) {
  return monthNames[date.getMonth()] + ' ' + date.getFullYear();
}

// color stations by temperature
function colorStations() {
  // calculate average temp for each station
  var temp_sum = {};
  var temp_cnt = {};
  for (line of lines) {
    if (!('Temperature' in line)) continue;
    if (line.date < startDate) continue;
    if (line.date > endDate) continue;
    var temp = parseFloat(line['Temperature']);
    if (!isNaN(temp)) {
      var station = line['Station.Number'];
      if (!(station in temp_sum)) {
        temp_sum[station] = 0.;
        temp_cnt[station] = 0;
      }
      temp_sum[station] += temp;
      temp_cnt[station] += 1;
    }
  }
  for (station of stations) {
    var elem = d3.select('#station-' + station.name);
    if (station.name in temp_sum) {
      var temp = temp_sum[station.name] / temp_cnt[station.name];
      var scale = (temp - minTemp) / (maxTemp - minTemp);
      var color = d3.interpolateTurbo(scale);
      elem.attr('fill', color);
    }
    else {
      elem.attr('fill', 'white');
    }
  }
}

// show data for time range
function showData() {
  // calculate average features
  var feat_sum = {};
  var feat_cnt = {};
  for (line of lines) {
    if (the_station && line['Station.Number'] != the_station) continue;
    if (line.date < startDate) continue;
    if (line.date > endDate) continue;
    for (attr of attributes) {
      var val = parseFloat(line[attr]);
      if (!isNaN(val)) {
        if (!(attr in feat_sum)) {
          feat_sum[attr] = 0;
          feat_cnt[attr] = 0;
        }
        feat_sum[attr] += val;
        feat_cnt[attr] += 1;
      }
    }
  }
  for (attr of attributes) {
    var attr_html = attr;
    if (attr.includes(" ")) {
      attr_html = "Chlorophyll-Ratio";
    }
    var row = $('#row-' + attr_html);
    var field = $('#row-' + attr_html + ' td');
    if (attr in feat_sum) {
      var val = feat_sum[attr] / feat_cnt[attr];
      row.show();
      field.text(val.toFixed(2));
    }
    else {
      row.hide();
      field.text('');
    }
  }
  if (the_station) {
    $('#row-Station td').text('Station ' + the_station);
  }
  else {
    $('#row-Station td').text('Average over all stations');
  }
  if (startDate > new Date(0)) {
    $('#row-Dates td').text(dateText(startDate) + ' - ' + dateText(endDate));
    $('#row-Dates').show();
  }
  else {
    $('#row-Dates').hide();
  }
}

// on zooming: set title, color stations
function onZoom(args, range) {
  // do it in the background
  window.setTimeout(function() {
    var title;
    if (range.x[0] == range.x[1]) {
      title = zoom_title;
      startDate = new Date(0);
      endDate = new Date();
    }
    else {
      var domain = MG.convert_range_to_domain(args, range);
      startDate = new Date(domain.x[0]);
      endDate = new Date(domain.x[1]);
      title = dateText(startDate) + '-' + dateText(endDate);
    }
    $('#timeline-zoom tspan.mg-chart-title').text(title);
    colorStations();
    showData();
  });
}

// show time series - all data
function showAllData() {
  var dataSmooth = getData(the_station, true);
  var data = getData(the_station, false);
  var station_text = the_station ? "Station #" + the_station
                                 : "All Stations";
  width = document.getElementById('timeline-full').clientWidth;
  height = document.getElementById('timeline-full').offsetHeight;
  document.getElementById('timeline-full').innerHTML = '';
  var subpart = {
    title: zoom_title,
    description: "This plot shows only the above selected timeframe",
    data: data,
    full_width: true,
    right: 40,
    missing_is_hidden: false,
    interpolate: d3.curveLinear,
    target: '#timeline-zoom',
    legend_target: '#legend-zoom',
    legend: attributes,
    x_accessor: 'date',
    y_accessor: attributes
  };
  var mainpart = {
    title: station_text,
    description: "Data over the whole period, yearly average, smoothed",
    data: dataSmooth,
    legend: attributes,
    missing_is_hidden: false,
    interpolate: d3.curveBasis,
    target: '#timeline-full',
    legend_target: '#legend-full',
    full_width: true,
    right: 40,
    area: false,
    x_accessor: 'date',
    y_accessor: attributes,
    brush: 'x',
    zoom_target: subpart,
    brushing_selection_changed: onZoom
  };
  MG.data_graphic(subpart);
  MG.data_graphic(mainpart);
}

// hide splash screen
function hideSplash() {
  document.getElementById('splash').style.display = 'none';
  document.getElementById('content').style.display = 'block';
}

// initialize reset station button
function initResetStation() {
  var button = document.getElementById('reset-station');
  button.style.display = 'none';
  button.onclick = function() {
    showStation();
  };
}

async function init() {
  await loadData();
  await loadStations();
  hideSplash();
  initResetStation();
  addStationsMap();
  colorStations();
  showData();
  showAllData();
}

init();
