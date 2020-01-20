import requests
import os
from django.conf import settings

KEY = os.environ['OMDB_KEY']
URL_PREFIX = "http://www.omdbapi.com"

def getOMDB(t, y=None, plot=None):
    params = {'t': t, 'apikey': KEY}

    if y is not None:
        assert y.isdigit()
        params[y] = y
    if plot is not None:
        assert plot in ('short', 'full')
        params[plot] = plot

    # debug, skip remote request {{{
    if settings.DEBUG and str(params['t']).strip() == 'cars':
        return {
          "Title":"Cars",
          "Year":"2006",
          "Rated":"G",
          "Released":"09 Jun 2006",
          "Runtime":"117 min",
          "Genre":"Animation, Comedy, Family, Sport",
          "Director":"John Lasseter, Joe Ranft(co-director)",
          "Writer":"John Lasseter (original story by), Joe Ranft (original story by), Jorgen Klubien (original story by), Dan Fogelman (screenplay by), John Lasseter (screenplay by), Joe Ranft (screenplay by), Kiel Murray (screenplay by), Phil Lorin (screenplay by), Jorgen Klubien (screenplay by), Steve Purcell (additional screenplay material)",
          "Actors":"Owen Wilson, Paul Newman, Bonnie Hunt, Larry the Cable Guy",
          "Plot":"A hot-shot race-car named Lightning McQueen gets waylaid in Radiator Springs, where he finds the true meaning of friendship and family.",
          "Language":"English, Italian, Japanese, Yiddish",
          "Country":"USA",
          "Awards":"Nominated for 2 Oscars. Another 28 wins & 32 nominations.",
          "Poster":"https://m.media-amazon.com/images/M/MV5BMTg5NzY0MzA2MV5BMl5BanBnXkFtZTYwNDc3NTc2._V1_SX300.jpg",
          "Ratings":[
            {
              "Source":"Internet Movie Database",
              "Value":"7.1/10"
            },
            {
              "Source":"Rotten Tomatoes",
              "Value":"75%"
            },
            {
              "Source":"Metacritic",
              "Value":"73/100"
            }
          ],
          "Metascore":"73",
          "imdbRating":"7.1",
          "imdbVotes":"342,793",
          "imdbID":"tt0317219",
          "Type":"movie",
          "DVD":"07 Nov 2006",
          "BoxOffice":"$244,052,771",
          "Production":"Buena Vista",
          "Website":"N/A",
          "Response":"True"
        }
    # }}}

    response = requests.get(URL_PREFIX, params=params)
    return response.json()
    


