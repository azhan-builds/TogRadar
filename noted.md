Note 1
Title: Got the static map up and running, centered on Norway

Content: I built the static map using Leaflet and openstreetmap tiles, and it working smoothly, which gives me a base to work on.

hours: 22min
Screenshots:img1

Note 2
Title: Logging live train data
Content: I have connected my project to entur using a live websocket connection. The 'graphql-trasnport-ws' subscription is working and live train data is coming in batches.

No errors so far other than some stupid typos creating issue. Fixed them and moved one right away.  

hours: 50min
screenshots:

Note 3
Title: Train now Glide.
Content: In the last update, i added markers for the trains so the trains are visible on the map. They used to snap to their new location every few seconds, that didn't felt pleasent so i made sure that they glide instead of snapping. I used requestAnimationFrame for this. However, the motion still doesn't feel continous partly because Entur's updates arrive once every few seconds, instead of once every second. Solving this is my next goal.
Hours:1hour 15 min.

