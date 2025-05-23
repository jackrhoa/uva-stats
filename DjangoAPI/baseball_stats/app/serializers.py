from rest_framework import serializers
from .models import BatterStat, PitcherStat, PlayerInfo, FieldingStat, GameInfo

class BatterStatSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player_id.player_name', read_only=True)

    class Meta:
        model = BatterStat
        fields = '__all__'
        read_only_fields = ['id'] + ['player_name']

class PitcherStatSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player_id.player_name', read_only=True)

    class Meta:
        model = PitcherStat
        fields = '__all__'
        read_only_fields = ['id'] + ['player_name']

class FieldingStatSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player_id.player_name', read_only=True)
    
    class Meta:
        model = FieldingStat
        fields = '__all__'
        read_only_fields = ['id'] + ['player_name']

class GameInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameInfo
        fields = '__all__'
        read_only_fields = ['id']

class PlayerInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerInfo
        fields = '__all__'
        read_only_fields = ['id']
