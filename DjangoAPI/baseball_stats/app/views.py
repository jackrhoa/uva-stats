from django.shortcuts import render
from .models import BatterStat, PitcherStat, PlayerInfo, FieldingStat, GameInfo
from .serializers import BatterStatSerializer, \
PitcherStatSerializer, PlayerInfoSerializer, \
FieldingStatSerializer, GameInfoSerializer, BatterStatSumSerializer
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.conf import settings
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from django_filters import CharFilter
# Create your views here.

class BatterStatViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = BatterStat.objects.order_by('game_id', 'player_id')
    serializer_class = BatterStatSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = '__all__'

class PitcherStatViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PitcherStat.objects.order_by('game_id', 'player_id')
    serializer_class = PitcherStatSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = '__all__'

class FieldingStatViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FieldingStat.objects.order_by('game_id', 'player_id')
    serializer_class = FieldingStatSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = '__all__'

class GameInfoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GameInfo.objects.order_by('game_id')
    serializer_class = GameInfoSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = '__all__'

class PlayerInfoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PlayerInfo.objects.all()
    serializer_class = PlayerInfoSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['player_id', 'player_name', 'jersey_number', 'height', 'weight']

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
    
class TeamBattingStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):

        stats = (
            BatterStat.objects
            .values('player_id', 'player_id__player_name', 'player_id__jersey_number')
            .annotate(
                total_hits=models.Sum('hits'),
                total_ab=models.Sum('ab'),
                total_runs=models.Sum('runs'),
                total_rbi=models.Sum('rbi'),
                total_bb=models.Sum('bb'),
                total_ibb=models.Sum('ibb'),
                total_hbp=models.Sum('hbp'),
                total_sb=models.Sum('sb'),
                total_cs=models.Sum('cs'),
                total_dp=models.Sum('dp'),
                total_double=models.Sum('double'),
                total_triple=models.Sum('triple'),
                total_sf=models.Sum('sf'),
                total_sh=models.Sum('sh'),
                total_picked_off=models.Sum('picked_off'),
                total_hr=models.Sum('hr'),
                total_strikeouts=models.Sum('so'),

                id=models.F('player_id'),
            )

        )

        # stats = BatterStat.objects.filter(player_id__team_id=team_id)
        serializer = BatterStatSumSerializer(stats, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# class TeamPitchingStatsView(APIView):
#     permission_classes = [AllowAny]

#     def get(self, request, team_id):
#         # Assuming team_id is passed as a URL parameter
#         stats = PitcherStat.objects.filter(player_id__team_id=team_id)
#         serializer = PitcherStatSerializer(stats, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)