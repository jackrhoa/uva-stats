"""
URL configuration for baseball_stats project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from app.views import BatterStatViewSet, BatterStatCreateView, \
PitcherStatViewSet, PitcherStatCreateView, PlayerInfoViewSet, \
FieldingStatViewSet, GameInfoViewSet, FieldingStatCreateView, \
GameInfoCreateView, TeamBattingStatsViewSet, TeamPitchingStatsViewSet, \
TeamFieldingStatsByPosViewSet, TeamFieldingStatsByPlayerViewSet, \
BatterSituationalCreateView, BatterSituationalViewSet, \
SchoolInfoCreateView, SchoolInfoViewSet


router = DefaultRouter()
router.register(r'batter_stats', BatterStatViewSet, basename='batter_stats')
router.register(r'batter_situational_stats', BatterSituationalViewSet, basename='batter_situational_stats')
router.register(r'pitcher_stats', PitcherStatViewSet, basename='pitcher_stats')
router.register(r'player_info', PlayerInfoViewSet, basename='player_info')
router.register(r'fielding_stats', FieldingStatViewSet, basename='fielding_stats')
router.register(r'total_batting_stats', TeamBattingStatsViewSet, basename='team_batting_stats')
router.register(r'total_pitching_stats', TeamPitchingStatsViewSet, basename='team_pitching_stats')
router.register(r'total_fielding_stats_by_pos', TeamFieldingStatsByPosViewSet, basename='team_fielding_stats')
router.register(r'total_fielding_stats_by_player', TeamFieldingStatsByPlayerViewSet, basename='team_fielding_stats_by_player')
router.register(r'game_info', GameInfoViewSet, basename='game_info')
router.register(r'school_info', SchoolInfoViewSet, basename='school_info')

urlpatterns = [
    # the path for the batter_stats page is still https://localhost:port/batter_stats/
    path('api/batter_stats/create/', BatterStatCreateView.as_view(), name='batter_stat_create'),
    path('api/situational_batting/create/', BatterSituationalCreateView.as_view(), name='batter_situational_create'),
    path('api/pitcher_stats/create/', PitcherStatCreateView.as_view(), name='pitcher_stat_create'),
    path('api/fielding_stats/create/', FieldingStatCreateView.as_view(), name='fielding_stat_create'),
    path('api/game_info/create/', GameInfoCreateView.as_view(), name='game_info_create'),
    path('api/school_info/create/', SchoolInfoCreateView.as_view(), name='school_info_create'),
    path('admin/', admin.site.urls),
    # Include the router's URLs
    path('api/', include(router.urls)),
]
