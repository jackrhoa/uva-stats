from rest_framework import serializers
from django.db.models import Sum
from .models import BatterStat, PitcherStat, PlayerInfo, FieldingStat, GameInfo

class BatterStatSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player_id.player_name', read_only=True)
    game_date = serializers.DateField(source='game_id.game_date', read_only=True)
    game_result = serializers.SerializerMethodField()
    pa = serializers.SerializerMethodField()
    avg = serializers.SerializerMethodField()
    tb = serializers.SerializerMethodField()
    box_score_link = serializers.CharField(source='game_id.box_score_link', read_only=True)

    class Meta:
        model = BatterStat
        fields = '__all__'
        read_only_fields = ['id'] + ['player_name']

    def get_pa(self, obj: BatterStat):
        return obj.ab + obj.bb + obj.hbp + obj.ibb + obj.sh + obj.sf

    # this defines the method used in the SerializerMethodField
    def get_avg(self, obj: BatterStat):
        current_ba = (
            BatterStat.objects
                .filter(player_id=obj.player_id, game_id__lte=obj.game_id)
                .aggregate(
                    total_hits=Sum('hits'),
                    total_ab=Sum('ab'),
                )
        )
        total_hits = current_ba['total_hits'] or 0
        total_ab = current_ba['total_ab'] or 0
        return total_hits / total_ab if total_ab > 0 else 0
    
    def get_game_result(self, obj: BatterStat):
        expected_innings = 9
        inning_info = f"/{obj.game_id.total_innings}" if obj.game_id.total_innings != expected_innings else ''
        return f"{"W" if obj.game_id.selected_team_runs > obj.game_id.opponent_runs else "L"}{inning_info} {obj.game_id.selected_team_runs}-{obj.game_id.opponent_runs}"

    def get_tb(self, obj: BatterStat):
        return (
            (obj.hits - obj.double - obj.triple - obj.hr) +
            (obj.double * 2) +
            (obj.triple * 3) +
            (obj.hr * 4)
        )
class BatterStatSumSerializer(serializers.Serializer):
    id = serializers.IntegerField(
        read_only=True)
    player_id = serializers.IntegerField(
        read_only=True)
    player_name = serializers.CharField(
        source='player_id__player_name', read_only=True)
    jersey_number = serializers.IntegerField(
        source='player_id__jersey_number', read_only=True)
    total_ab = serializers.IntegerField()
    total_runs = serializers.IntegerField()
    total_hits = serializers.IntegerField()
    total_rbi = serializers.IntegerField()
    total_bb = serializers.IntegerField()
    total_strikeouts = serializers.IntegerField()
    total_hr= serializers.IntegerField()
    total_ibb = serializers.IntegerField()
    total_hbp = serializers.IntegerField()
    total_sb = serializers.IntegerField()
    total_cs = serializers.IntegerField()
    total_dp = serializers.IntegerField()
    total_double = serializers.IntegerField()
    total_triple = serializers.IntegerField()
    total_sf = serializers.IntegerField()
    total_sh = serializers.IntegerField()
    total_picked_off = serializers.IntegerField()
    total_pa = serializers.SerializerMethodField()
    avg = serializers.SerializerMethodField()
    obp = serializers.SerializerMethodField()
    slg = serializers.SerializerMethodField()
    tb = serializers.SerializerMethodField()
    ops = serializers.SerializerMethodField()
    games = serializers.SerializerMethodField()
    
    def get_total_pa(self, obj):
        return (
            obj['total_ab'] + 
            obj['total_bb'] + 
            obj['total_hbp'] + 
            obj['total_ibb'] + 
            obj['total_sf'] + 
            obj['total_sh']
        )
    
    def get_avg(self, obj):
        total_hits = obj['total_hits'] or 0
        total_ab = obj['total_ab'] or 0
        return total_hits / total_ab if total_ab > 0 else 0
    
    def get_obp(self, obj):
        return (
            (obj['total_hits'] + obj['total_bb']
         + obj['total_hbp'] + obj['total_ibb'])
         / (obj['total_ab'] + obj['total_hbp'] 
          + obj['total_ibb'] + obj['total_bb'] 
          + obj['total_sf'])
          ) \
        if (
            (obj['total_ab'] + obj['total_hbp'] 
            + obj['total_ibb'] + obj['total_bb'] 
            + obj['total_sf']) > 0
            ) else 0
    def get_tb(self, obj):
        return (
            (obj['total_hits'] - obj['total_double']
            - obj['total_triple'] - obj['total_hr'])
            + 
            (obj['total_double'] * 2) + 
            (obj['total_triple'] * 3) + 
            (obj['total_hr'] * 4)
        )

    def get_slg(self, obj):
        total_bases = self.get_tb(obj)
        total_ab = obj['total_ab'] or 0
        return total_bases / total_ab \
        if total_ab > 0 else 0
    
    def get_ops(self, obj):
        obp = self.get_obp(obj)
        slg = self.get_slg(obj)
        return obp + slg if (obp or slg) else 0
    
    def get_games(self, obj):
        return BatterStat.objects.filter(player_id=obj['player_id']).count()

class PitcherStatSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player_id.player_name', read_only=True)
    ab = serializers.SerializerMethodField()
    game_date = serializers.DateField(source='game_id.game_date', read_only=True)
    game_result = serializers.SerializerMethodField()
    box_score_link = serializers.CharField(source='game_id.box_score_link', read_only=True)

    def get_ab(self, obj):
        return obj.bf -  obj.bb - obj.hb - obj.ibb - obj.sf_allowed - obj.sh_allowed
    
    def get_game_result(self, obj: BatterStat):
        expected_innings = 9
        inning_info = f"/{obj.game_id.total_innings}" if obj.game_id.total_innings != expected_innings else ''
        return f"{"W" if obj.game_id.selected_team_runs > obj.game_id.opponent_runs else "L"}{inning_info} {obj.game_id.selected_team_runs}-{obj.game_id.opponent_runs}"
    
    class Meta:
        model = PitcherStat
        fields = '__all__'
        read_only_fields = ['id'] + ['player_name']

class PitcherStatSumSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    player_id = serializers.IntegerField(read_only=True)
    player_name = serializers.CharField(source='player_id__player_name', read_only=True)
    jersey_number = serializers.IntegerField(source='player_id__jersey_number', read_only=True)
    total_ip = serializers.SerializerMethodField()
    total_outs = serializers.SerializerMethodField()
    total_h = serializers.IntegerField()
    total_r = serializers.IntegerField()
    total_er = serializers.IntegerField()
    total_bb = serializers.IntegerField()
    total_so = serializers.IntegerField()
    total_bf = serializers.IntegerField()
    total_doubles_allowed = serializers.IntegerField()
    total_triples_allowed = serializers.IntegerField()
    total_hr_allowed = serializers.IntegerField()
    total_wp = serializers.IntegerField()
    total_hb = serializers.IntegerField()
    total_starts = serializers.IntegerField()
    total_ibb = serializers.IntegerField()
    total_balk = serializers.IntegerField()
    total_ir = serializers.IntegerField()
    total_irs = serializers.IntegerField()
    total_sh_allowed = serializers.IntegerField()
    total_sf_allowed = serializers.IntegerField()
    total_kl = serializers.IntegerField()
    total_pickoffs = serializers.IntegerField()
    total_wins = serializers.IntegerField()
    total_losses = serializers.IntegerField()
    total_saves = serializers.IntegerField()
    total_ab = serializers.SerializerMethodField()
    total_era = serializers.SerializerMethodField()
    total_whip = serializers.SerializerMethodField()
    total_games = serializers.IntegerField()
    def get_total_outs(self, obj):
        innings_pitched = (
        PitcherStat.objects
            .filter(player_id=obj['player_id'])
            )
        outs = 0
        for session in innings_pitched:
            outs += (10 * session.ip) - 7 * int(session.ip)
        return outs

    def get_total_ip(self, obj):
        outs = self.get_total_outs(obj)
        return float(outs // 3) + float(0.1) * int(outs % 3) if outs > 0 else 0
    
    def get_total_ab(self, obj):
        return (
            obj['total_bf'] - 
            obj['total_bb'] - 
            obj['total_hb'] - 
            obj['total_ibb'] - 
            obj['total_sf_allowed'] - 
            obj['total_sh_allowed']
        )
    def get_total_era(self, obj):
        total_er = obj['total_er'] or 0
        return (total_er * 27) / self.get_total_outs(obj) if self.get_total_outs(obj) > 0 else None

    def get_total_whip(self, obj):
        walks_and_hits = (
            obj['total_bb'] + 
            obj['total_ibb'] +
            obj['total_h']
        )
        return walks_and_hits / (self.get_total_outs(obj) / 3) if self.get_total_ip(obj) > 0 else None

class FieldingStatSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player_id.player_name', read_only=True)
    
    class Meta:
        model = FieldingStat
        fields = '__all__'
        read_only_fields = ['id'] + ['player_name']

class GameInfoSerializer(serializers.ModelSerializer):
    result = serializers.SerializerMethodField()
    
    def get_result(self, obj: BatterStat):
        expected_innings = 9
        inning_info = f"/{obj.total_innings}" if obj.total_innings != expected_innings else ''
        return f"{"W" if obj.selected_team_runs > obj.opponent_runs else "L"}{inning_info} {obj.selected_team_runs}-{obj.opponent_runs}"
    
    class Meta:
        model = GameInfo
        fields = '__all__'
        read_only_fields = ['id']

class PlayerInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerInfo
        fields = '__all__'
        read_only_fields = ['id']
