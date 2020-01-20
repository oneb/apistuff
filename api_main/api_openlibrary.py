import requests

URL_PREFIX = 'https://openlibrary.org/api'

def getDetailsByISBN(isbn):
    #assert isbn.isdigit()
    url = '{}/books?bibkeys=ISBN:{}&format=json&jscmd=details'.format(URL_PREFIX, isbn)
    response = requests.get(url)
    return response.json()
    

