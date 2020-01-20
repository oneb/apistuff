from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .api_omdb import getOMDB
from .api_openlibrary import getDetailsByISBN

class GetMovie(APIView):
    permission_classes = (IsAuthenticated, )
    def get(self, request):
        t = request.GET.get('title')
        y = request.GET.get('year')
        plot = request.GET.get('summarytype')
        j = getOMDB(t, y, plot)
        return Response(j)

class GetBook(APIView):
    permission_classes = (IsAuthenticated, )
    def get(self, request):
        isbn = request.GET.get('isbn')
        j = getDetailsByISBN(isbn)
        return Response(j)

