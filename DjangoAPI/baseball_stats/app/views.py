from django.shortcuts import render
from .models import BatterStat#, PlayerInfo, PitcherStat, GameInfo, FieldingStat
from .serializers import BatterStatSerializer#, PlayerInfoSerializer, PitcherStatSerializer, GameInfoSerializer, FieldingStatSerializer
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.conf import settings
from rest_framework.response import Response
# Create your views here.

class BatterStatViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BatterStat.objects.all()
    serializer_class = BatterStatSerializer
    permission_classes = [AllowAny]

class BatterStatCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        api_key = request.headers.get('X-API-Key')
        expected_key = settings.SCRAPER_API_KEY

        if api_key != expected_key:
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = BatterStatSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

