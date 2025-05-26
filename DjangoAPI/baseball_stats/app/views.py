from django.shortcuts import render
from .models import BatterStat, PitcherStat, PlayerInfo, FieldingStat, GameInfo
from .serializers import BatterStatSerializer, \
PitcherStatSerializer, PlayerInfoSerializer, \
FieldingStatSerializer, GameInfoSerializer, \
BatterStatSumSerializer, PitcherStatSumSerializer
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

class TeamPitchingStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):

        stats = (
            PitcherStat.objects
            .values('player_id', 'player_id__player_name', 'player_id__jersey_number')
            .annotate(
                total_h=models.Sum('h'),
                total_r=models.Sum('r'),
                total_er=models.Sum('er'),
                total_bb=models.Sum('bb'),
                total_so=models.Sum('so'),
                total_bf=models.Sum('bf'),
                total_doubles_allowed=models.Sum('doubles_allowed'),
                total_triples_allowed=models.Sum('triples_allowed'),
                total_hr_allowed=models.Sum('hr_allowed'),
                total_wp=models.Sum('wp'),
                total_hb=models.Sum('hb'),
                total_starts=models.Sum(
                    models.Case(
                        models.When(starter=True, then=1),
                        default=0,
                        output_field=models.IntegerField()
                    )
                ),
                total_ibb=models.Sum('ibb'),
                total_balk=models.Sum('balk'),
                total_ir=models.Sum('ir'),
                total_irs=models.Sum('irs'),
                total_sh_allowed=models.Sum('sh_allowed'),
                total_sf_allowed=models.Sum('sf_allowed'),
                total_kl=models.Sum('kl'),
                total_pickoffs=models.Sum('pickoffs'),
                total_wins=models.Sum(
                    models.Case(
                        models.When(win=True, then=1),
                        default=0,
                        output_field=models.IntegerField()
                    )
                ),
                total_losses=models.Sum(
                    models.Case(
                        models.When(loss=True, then=1),
                        default=0,
                        output_field=models.IntegerField()
                    )
                ),
                total_saves=models.Sum(
                    models.Case(
                        models.When(sv=True, then=1),
                        default=0,
                        output_field=models.IntegerField()
                    )
                ),
                total_games=models.Count('game_id'),
            )
        )

        serializer = PitcherStatSumSerializer(stats, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)