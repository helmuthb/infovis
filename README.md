# Exercise 2
## Helmuth Breitenfellner, E08725866
## 188.308 Information Visualization
## 14 December 2019

# Topic

This is an implementation of an information visualization
made for exercise 2 in the lecture "Information Visualization".

## Data

The data used is the dataset provided by the US Geology Survey (USGS),
containing measurements about the water quality in the San Francisco Bay.

At a total of 37 stations the data is measured regularly, in addition
to 15 non-standard stations which are or were used irregularly or
exceptionally.

The attributes measured include data about chlorophyll, oxygen, solids
and sediments, salt content and temperature.
In addition the information on the date & time of the measurement,
the depth of the measurement, the station number and its distance from
station number 36 is recorded.

## Domain

_Please note: this is a fictional use case._

A Non-Government Organization (NGO) focusing on the impact of climate
change is analysing the situation
in the San Francisco Bay.
This organization is working in lobbying for environmental protection
and is compiling data which helps influencing public opinion and
politicians on the impact and damage caused by climate change.

## Users

The users are environmentalists with background in meterology, biology,
or geology.
They are not necessary scientists in these fields. They want to easily
identify relevant information from the visualization, and also use the
visualization in their lobbying work.

# Toolkits Used

The visualization uses `D3.js` and `metricsgraphics.js`
for data visualization.

# Starting the Program

The application is a self-contained web site which has to be deployed
on a web server.
SSL is recommended (no testing has been done without SSL).
An implementation is temporarily hosted at
[https://helmuth.at/infovis](https://helmuth.at/infovis).

