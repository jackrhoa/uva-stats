from django.db import models

# Create your models here.

class PlayerInfo(models.Model):
    player_id = models.AutoField(primary_key=True)
    player_name = models.CharField(max_length=100, unique=True)
    player_position = models.JSONField(default=dict, null=False, blank=True)
    jersey_number = models.IntegerField(null=True)
    # team_id = models.IntegerField(max_length=4, null=True)
    img=models.CharField(max_length=200, null=True)
    height = models.CharField(max_length=10, null=True)
    weight = models.IntegerField(null=True)

    def __str__(self):
        return f"{self.player_name} (#{self.player_id})"

class BatterStat(models.Model):
    # nevermind, the id is automatically created
    # not including automatically created ID field 
    #   because the order in which data is input is not useful
    # id = models.AutoField(primary_key=True)
    # An entry in PlayerInfo cannot be deleted if
    #   there's a fielding stat associated with the id
    player_id = models.ForeignKey(PlayerInfo, on_delete=models.PROTECT, null=True)
    # If a game is deleted from GameInfo, the corresponding
    #   batting stats from that game will be deleted as well
    game_id = models.ForeignKey('GameInfo', on_delete=models.CASCADE, null=True)
    ab = models.IntegerField()
    runs = models.IntegerField()
    hits = models.IntegerField()
    rbi = models.IntegerField()
    bb = models.IntegerField()
    so = models.IntegerField()
    hbp = models.IntegerField()
    ibb = models.IntegerField()
    sb = models.IntegerField()
    cs = models.IntegerField()
    dp = models.IntegerField()
    double = models.IntegerField()
    triple = models.IntegerField()
    hr = models.IntegerField()
    sf = models.IntegerField()
    sh = models.IntegerField()
    picked_off = models.IntegerField()
    
    def __str__(self):
        return f"{self.player_id.player_name} - Game #{self.game_id} | {self.ab} AB | {self.hits} Hits | {self.runs} Runs"

    # def __str__(self):
    #     return f"{self.player_id.player_name} ({self.game_id} - {self.ab} AB - {self.hits} Hits - {self.runs} Runs"

class BattingSituational(models.Model):
    player_id = models.ForeignKey(PlayerInfo, on_delete=models.PROTECT, null=True)
    game_id = models.ForeignKey('GameInfo', on_delete=models.CASCADE, null=True)
    with_runners = models.JSONField(default={})
    hits_with_risp = models.JSONField(default={})
    vs_lhp = models.JSONField(default={})
    vs_rhp = models.JSONField(default={})
    leadoff_pct = models.JSONField(default={})
    rbi_runner_on_3rd = models.JSONField(default={})
    h_pinchhit = models.JSONField(default={})
    runners_advanced = models.JSONField(default={})
    with_two_outs = models.JSONField(default={})
    with_two_runners = models.JSONField(default={})
    with_two_in_scoring = models.JSONField(default={})
    bases_empty = models.JSONField(default={})
    bases_loaded = models.JSONField(default={})
    # with_runners_on = models.JSONField(default=dict, null=False, blank=True)


class PitcherStat(models.Model):
    # nevermind, the id is automatically created
    # not including automatically created ID field 
    #   because the order in which data is input is not useful
    # id = models.AutoField(primary_key=True)
    # A player in PlayerInfo cannot be deleted if
    #   there's a pitcher stat associated with the id
    player_id = models.ForeignKey(PlayerInfo, on_delete=models.PROTECT, null=True)
    # If a game is deleted from GameInfo, the corresponding
    #   pitching stats from that game will be deleted as well
    game_id = models.ForeignKey('GameInfo', on_delete=models.CASCADE, null=True)
    starter = models.IntegerField(default=0)
    # ip = models.DecimalField(max_digits=4, decimal_places=1)
    outs = models.IntegerField()
    h = models.IntegerField()
    r = models.IntegerField()
    er = models.IntegerField()
    bb = models.IntegerField()
    so = models.IntegerField()
    bf = models.IntegerField()
    doubles_allowed = models.IntegerField()
    triples_allowed = models.IntegerField()
    hr_allowed = models.IntegerField()
    wp = models.IntegerField()
    hb = models.IntegerField()
    ibb = models.IntegerField()
    balk = models.IntegerField()
    ir = models.IntegerField()
    irs = models.IntegerField()
    sh_allowed = models.IntegerField()
    sf_allowed = models.IntegerField()
    kl = models.IntegerField()
    pickoffs = models.IntegerField()
    win = models.IntegerField(default=0)
    loss = models.IntegerField(default=0)
    sv = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.player_id.player_name} - Game #{self.game_id} | {self.ip} IP | {self.h} Hits | {self.r} Runs | {self.er} Earned Runs"

class FieldingStat(models.Model):
    # nevermind, the id is automatically created
    # not including automatically created ID field 
    #   because the order in which data is input is not useful
    # id = models.AutoField(primary_key=True)
    # A player in PlayerInfo cannot be deleted if
    #   there's a fielding stat associated with the id
    player_id = models.ForeignKey(PlayerInfo, on_delete=models.PROTECT, null=True)
    # If a game is deleted from GameInfo, the corresponding
    #   fielding stats from that game will be deleted as well
    # game_number = models.IntegerField()
    # year = models.IntegerField()
    game_id = models.ForeignKey('GameInfo', on_delete=models.CASCADE, null=True)

    player_position = models.CharField(max_length=7)
    po = models.IntegerField()
    a = models.IntegerField()
    e = models.IntegerField()
    catchers_interference = models.IntegerField()
    pb = models.IntegerField()
    sba = models.IntegerField()
    cs = models.IntegerField()    
    dp = models.IntegerField()
    tp = models.IntegerField()

    def __str__(self):
        return f"{self.player_id.player_name} - Game #{self.game_id} | {self.player_position} | {self.po} PO | {self.a} A | {self.e} E"

class SchoolInfo(models.Model):
    school_id = models.IntegerField(primary_key=True)
    school_name = models.CharField(max_length=100, unique=True)
    school_tricode = models.CharField(max_length=6, unique=True, null=True)
    school_conference = models.CharField(max_length=5, null=True)
    total_wins = models.IntegerField(null=True)
    total_losses = models.IntegerField(null=True)
    conference_wins = models.IntegerField(null=True)
    conference_losses = models.IntegerField(null=True)

    def __str__(self):
        if [a is not None for a in [self.total_wins, self.total_losses, self.conference_wins, self.conference_losses, self.school_conference]].count(True) >= 4:
            return f"{self.school_name} - {self.total_wins}-{self.total_losses} ({self.conference_wins}-{self.conference_losses} {self.school_conference})"
        else:
            return f'{self.school_name}'
    
class GameInfo(models.Model):
    # nevermind, the id is automatically created
    # not including automatically created ID field 
    #   because the order in which data is input is not useful
    # year = models.IntegerField()
    # game_number = models.IntegerField()
    game_id = models.IntegerField(primary_key=True)
    game_date = models.CharField(max_length=15)
    selected_team = models.ForeignKey(SchoolInfo, on_delete=models.CASCADE, related_name='selected_team', null=True)
    opponent = models.ForeignKey(SchoolInfo, on_delete=models.CASCADE, related_name='opponent', null=True)
    selected_team_home = models.BooleanField()
    total_innings = models.IntegerField()
    selected_team_runs = models.IntegerField()
    opponent_runs = models.IntegerField()
    selected_team_hits = models.IntegerField(null=True)
    opponent_hits = models.IntegerField()
    selected_team_errors = models.IntegerField(null=True)
    opponent_errors = models.IntegerField()
    selected_team_dpt = models.IntegerField()
    opponent_dpt = models.IntegerField()
    selected_team_tpt = models.IntegerField()
    opponent_tpt = models.IntegerField()
    winning_pitcher = models.CharField(max_length=20)
    losing_pitcher = models.CharField(max_length=20)
    save_pitcher = models.CharField(max_length=20, null=True)
    box_score_link = models.CharField(max_length=200)
    attendance = models.IntegerField()

    def __str__(self):
        return f"Game #{self.game_id} - {self.selected_team} vs {self.opponent} on {self.game_date}"
