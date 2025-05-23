from django.db import models

class PlayerInfo(models.Model):
    player_id = models.AutoField(primary_key=True)
    player_name = models.CharField(max_length=100, unique=True)
    player_position = models.CharField(max_length=7)
    jersey_number = models.IntegerField()
    # team_id = models.IntegerField(max_length=4)
    # position = models.CharField(max_length=20)
    # height = models.CharField(max_length=10)
    # weight = models.IntegerField(max_length=3)

class BatterStat(models.Model):
    id = models.AutoField(primary_key=True)
    player = models.ForeignKey(PlayerInfo, on_delete=models.CASCADE, null=True)
    game_id = models.IntegerField()
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

# class PitcherStat(models.Model):
#     id = models.AutoField(primary_key=True)
#     player_id = models.IntegerField(max_length=12)
#     game_id = models.IntegerField(max_length=14)
#     starter = models.BooleanField()
#     ip = models.DecimalField(max_digits=4, decimal_places=1)
#     h = models.IntegerField(max_length=2)
#     r = models.IntegerField(max_length=2)
#     er = models.IntegerField(max_length=2)
#     bb = models.IntegerField(max_length=2)
#     so = models.IntegerField(max_length=2)
#     bf = models.IntegerField(max_length=2)
#     doubles_allowed = models.IntegerField(max_length=2)
#     triples_allowed = models.IntegerField(max_length=2)
#     hr_allowed = models.IntegerField(max_length=2)
#     wp = models.IntegerField(max_length=2)
#     hb = models.IntegerField(max_length=2)
#     ibb = models.IntegerField(max_length=2)
#     balk = models.IntegerField(max_length=2)
#     ir = models.IntegerField(max_length=2)
#     irs = models.IntegerField(max_length=2)
#     sh_allowed = models.IntegerField(max_length=2)
#     sf_allowed = models.IntegerField(max_length=2)
#     kl = models.IntegerField(max_length=2)
#     pickoffs = models.IntegerField(max_length=2)
#     win = models.BooleanField()
#     loss = models.BooleanField()
#     save = models.BooleanField()

# class FieldingStat(models.Model):
#     id = models.AutoField(primary_key=True)
#     player_id = models.IntegerField(max_length=12)
#     player_position = models.CharField(max_length=7)
#     game_id = models.IntegerField(max_length=6)
#     po = models.IntegerField(max_length=2)
#     a = models.IntegerField(max_length=2)
#     e = models.IntegerField(max_length=2)
#     catchers_interference = models.IntegerField(max_length=2)
#     pb = models.IntegerField(max_length=2)
#     sba = models.IntegerField(max_length=2)
#     cs = models.IntegerField(max_length=2)    
#     dp = models.IntegerField(max_length=2)
#     tp = models.IntegerField(max_length=2)  

# class GameInfo(models.Model):
#     game_id = models.IntegerField(primary_key=True)
#     game_date = models.DateField()
#     selected_team = models.CharField(max_length=20)
#     opponent = models.CharField(max_length=20)
#     selected_team_home = models.BooleanField()
#     total_innings = models.IntegerField()
#     selected_team_runs = models.IntegerField(max_length=2)
#     opponent_runs = models.IntegerField(max_length=2)
#     opponent_errors = models.IntegerField(max_length=2)
#     selected_team_dpt = models.IntegerField(max_length=2)
#     opponent_dpt = models.IntegerField(max_length=2)
#     selected_team_tpt = models.IntegerField(max_length=2)
#     opponent_tpt = models.IntegerField(max_length=2)
#     winning_pitcher = models.CharField(max_length=20)
#     losing_pitcher = models.CharField(max_length=20)
#     save_pitcher = models.CharField(max_length=20)
#     box_score_link = models.CharField(max_length=200)
#     attendance = models.IntegerField(max_length=6)




    


    

# # Create your models here.
