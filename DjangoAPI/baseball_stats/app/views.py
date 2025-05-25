from django.shortcuts import render
from .models import BatterStat, PitcherStat, PlayerInfo, FieldingStat, GameInfo
from .serializers import BatterStatSerializer, PitcherStatSerializer, PlayerInfoSerializer, FieldingStatSerializer, GameInfoSerializer
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.conf import settings
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
# Create your views here.

class BatterStatViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BatterStat.objects.all()
    serializer_class = BatterStatSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = '__all__'

class PitcherStatViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PitcherStat.objects.all()
    serializer_class = PitcherStatSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = '__all__'

class FieldingStatViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FieldingStat.objects.all()
    serializer_class = FieldingStatSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = '__all__'

class GameInfoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GameInfo.objects.all()
    serializer_class = GameInfoSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = '__all__'

class PlayerInfoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PlayerInfo.objects.all()
    serializer_class = PlayerInfoSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = '__all__'

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
    
class PitcherStatCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        api_key = request.headers.get('X-API-Key')
        expected_key = settings.SCRAPER_API_KEY
        if api_key != expected_key:
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = PitcherStatSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FieldingStatCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        api_key = request.headers.get('X-API-Key')
        expected_key = settings.SCRAPER_API_KEY
        if api_key != expected_key:
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = FieldingStatSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class GameInfoCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        api_key = request.headers.get('X-API-Key')
        expected_key = settings.SCRAPER_API_KEY
        if api_key != expected_key:
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = GameInfoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)