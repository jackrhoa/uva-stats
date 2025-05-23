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
from app.views import BatterStatViewSet, BatterStatCreateView

router = DefaultRouter()
router.register(r'batter_stats', BatterStatViewSet, basename='batter_stats')


urlpatterns = [
    # the path for the batter_stats page is still https://localhost:port/batter_stats/
    path('batter_stats/create/', BatterStatCreateView.as_view(), name='batter_stat_create'),
    path('', include(router.urls)),
]
