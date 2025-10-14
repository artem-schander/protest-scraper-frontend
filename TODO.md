- the colors dont match the protest vibe.
- the top menu (Home, About, Subscribe) can be removed for now
- language filter can be removed
- verified events only checkbox can be removed.
- date range filter needs to be a user friendly calendar with predefined options for today, this week, this month and select modes like day, week, month and free range
- "Near Me" filter shuold move to the sidebar and when active show a slider with an input field to define the radius in km
- the square placeholder in every event card can either be removed or you have a good idea for something to put in there. images for the events are not avalable
- in src/routes/+page.server.js is a hardcoded api url. that needs to be in .env - every instance of hardcoded evironment related config needs to be insude .env
- location info in event card is wrong. check `http://localhost:3000/api/protests` - also it would be nice to add a link to a map (fav: OpenStreetMap) with the lat/lon values
- there need to be a link to the original page where the event was scraped from (url field in protests api)

- the filter source select field need to be a multi select

- the "subscribe" button should either be placed into the sidebar and/or renamed. the goal is that the user has a clear understanding that he can subscribe to the individual list resulting from applied filters
- search and filters are not working. check the updated readme in the api repository: https://github.com/artem-schander/protest-scraper

- the visible events (paginated) should be an infinite scroll
- the dark mode does not work for some elements.
- buttons have no hover/active state
- date and location not showing
- No events found
- missing imprint and disclaimer page
- add a mood picture (stock free) to the header with a rioting people


Image by <a href="https://pixabay.com/users/vilkasss-35420724/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=9842669">Vilius Kukanauskas</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=9842669">Pixabay</a>
