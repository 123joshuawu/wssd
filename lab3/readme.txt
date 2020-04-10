When I first started, I wanted to use the Unsplash API. However, later on I decided to use Unsplash for 
my next lab and use Public APIs for this one. I wanted the app to be simple and intuitive. I started out
with the basic Card which displayed the information of each API. The next step was learning how to use
Angular to generate the html dynamically. First I tried using Angular, however after the npm install and 
project setup collectively took over 15 minutes, I decided to opt for AngularJS. I started with the 
ng-repeat functionality for the Card and category Buttons. My main pain point for this lab was trying to 
use the AngularJS animations. I spent a lot of time trying to get the desired sliding animation and
specific steps. In the end, I was able to achieve most of the functionality I had initially envisioned 
while mostly using the tools provided by AngularJS with the exception of one small hack. Next, I wanted to
include a preview of the link provided by each api. I wanted to embed an image, but eventually opted for
an iframe. A major pain point was the various errors that caused the iframes to not work. However, I could
not find any ways to detect those errors. In the end, I decided to leave the feature in although it has
a chance of not working for certain apis. 