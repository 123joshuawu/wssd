    For this project I decided to use the Unsplash API and create a photo feed. The idea is to allow users
to scroll through the feed and input queries which will then change what photos appear in the feed.
The idea was inspired by Facebook's News Feed. 

    When I started I had a good idea of several frameworks I wanted to use. I knew I wanted to move 
from AngularJS to Angular2. I also wanted to use SocketIO to stream the feed generation and
events. Additionally, I wanted the feed to look like a picture collage, later I would come upon the term
'masonry' effect. In the end, it was the scrollable masonry photo feed that caused me the most grief. 
SocketIO was pretty easy to work with and while Angular2 was a lot, for the most part, the provided
bootstrapped code was sufficient. 

    This time I started out working on the backend first. The process was straightforward. While looking
for Unsplash APIs on npm, I came upon a Picsum API that was offering free access to Unsplash. I gave it a 
shot but it did not work so I dropped it. Although I did find a few Unsplash API libraries on npm, none
of them gave access to the response headers, so I decided to use Axios instead. I wanted access to the
headers so I could use the API ratelimit stats for a progress bar.

    Although I initially started out looking to continue using Bootstrap, after perusing the interwebs, 
it seemed like moving to Material Design was the better option. When I first started working on the front
end I used the ng-bootstrap library, however I felt that it had limited functionality. Thus, I decided to 
use the Angular Material library. 
    
    Creating the various inputs and hooking them up to the services in the backend via SocketIO was 
relatively straightforward. However, the brisk pace turned into a hard slog. First, I found a library that
was able to arrange the photos in the manner that I envisioned. After failing many times to incorporate 
it into Angular2, I was able to resort to a library on npm. Then, I decided to incorporate the scroll using
Angular Material's virtual scroll viewport. It was only after a long struggle did I realize the difference
between virtual and infinite scrolling. Finally, I resorted to a different library for infinite scrolling
and incorporated it into the project. After a couple of bug fixes and minor adjustments, the project was
complete. 