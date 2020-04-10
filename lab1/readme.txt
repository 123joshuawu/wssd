	Joshua Wu
	wuj16

	In the beginning, I wanted to make a quick prototype to both test my understanding and review HTML and Javascript. I started out by dynamically displaying tweets in a simple html table using jQuery. The procedure was pretty straightforward and helped me get a better idea of how I wanted the final product to look and how to make the final product. I tried to do animations on table rows but was unable to. However, I was pretty confident that I would be able to do jQuery animations with divs so I decided to put that off until the next iteration.

	In the next iteration, I rewrote the page using divs and Boostrap for layout. After establishing the dynamic generation of HTML for the tweets, I started to do some basic touchups on the formatting. The start of my trouble was envisioning a good design while the rest of my trouble was me wrestling with Bootstrap. Another aspect of the formatting was using the entities object of each tweet to embed <a> tags into the string. In my first go, around 30% of the links were messed up. After careful examination of the output, I realized was overwriting other replacements. Thus, I was able to quickly fix that issue by collecting all the replacements, sorting them by starting index, and keeping track of the replacement offset.

	I decided to add the animations to this iteration because I was satisfied with the overall look. My goal was to have randomized animations for the tweets. I found $().animate which I was able to use to execute different animations through a common interface. I am pretty satisfied with the animations, though they may work better a little slower. 

	Overall, I had the most difficulty in using Bootstrap to get the desired spacing/alignment. Some possible extensions I had considered adding but had difficulty implementing were displaying more information on the user and a good visual design for displaying retweets. 
