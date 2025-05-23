from rest_framework import serializers
from .models import BatterStat#, PitcherStat, FieldingStat, GameInfo, PlayerInfo

class BatterStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = BatterStat
        fields = '__all__'
        read_only_fields = ['id']

# class PitcherStatSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = PitcherStat
#         fields = '__all__'
#         read_only_fields = ['id']

# class FieldingStatSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FieldingStat
#         fields = '__all__'
#         read_only_fields = ['id']

# class GameInfoSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = GameInfo
#         fields = '__all__'
#         read_only_fields = ['id']

# class PlayerInfoSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = PlayerInfo
#         fields = '__all__'
#         read_only_fields = ['id']
