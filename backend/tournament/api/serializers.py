from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from tournament.models import Tournament, Team, Player, Match, MatchResult
from tournament.utils import send_reset_email
from django.db.models import Q

User = get_user_model()


# Серіалізатор користувача
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "nickname", "role"]


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(allow_null=False)

    class Meta:
        model = User
        fields = ["id", "username", "email", "nickname", "password"]


# Серіалізатор турніру
class TournamentSerializer(serializers.ModelSerializer):
    organizer_id = serializers.IntegerField(write_only=True)
    organizer = UserSerializer(read_only=True)

    class Meta:
        model = Tournament
        fields = [
            "id", "name", "organizer", "game", "format", "start_date", 
            "end_date", "max_teams", "organizer_id"
        ]


# Серіалізатор команди
class TeamSerializer(serializers.ModelSerializer):
    captain = UserSerializer(read_only=True)
    captain_id = serializers.IntegerField(write_only=True)
    tournaments = TournamentSerializer(many=True, read_only=True)
    tournament_ids = serializers.ListField(write_only=True, 
                                           child=serializers.IntegerField(), 
                                           required=False)
    total_matches = serializers.SerializerMethodField()
    wins = serializers.SerializerMethodField()
    losses = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = [
            "id",
            "name",
            "captain",
            "tournaments",
            "tournament_ids",
            "total_matches",
            "wins",
            "losses",
            "captain_id",
        ]

    def create(self, validated_data):
        tournament_ids = validated_data.pop("tournament_ids", [])
        team = Team.objects.create(**validated_data)
        team.tournaments.set(tournament_ids)
        return team

    def get_total_matches(self, obj):
        return (
            Match.objects.filter(team1=obj, status=Match.COMPLETED).count()
            + Match.objects.filter(team2=obj, status=Match.COMPLETED).count()
        )

    def get_wins(self, obj):
        return MatchResult.objects.filter(winner=obj).count()

    def get_losses(self, obj):
        return Match.objects.filter(
            (Q(team1=obj) | Q(team2=obj)) & ~Q(result__winner=obj),
            status=Match.COMPLETED,
        ).count()


class TeamResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ["id", "name", "captain"]


# Серіалізатор гравця
class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ["id", "user", "team"]


# Серіалізатор матчу
class MatchSerializer(serializers.ModelSerializer):
    next_match = serializers.SerializerMethodField()
    result = serializers.SerializerMethodField()
    tournament_id = serializers.IntegerField(write_only=True)
    team1_id = serializers.IntegerField(write_only=True)
    team2_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Match
        fields = [
            "id",
            "tournament",
            "team1",
            "team2",
            "match_time",
            "status",
            "next_match",
            "result",
            "tournament_id",
            "team1_id",
            "team2_id",
        ]
        depth = 1
    
    def create(self, validated_data):
        tournament_id = validated_data.pop("tournament_id")
        team1_id = validated_data.pop("team1_id")
        team2_id = validated_data.pop("team2_id")
        
        tournament = Tournament.objects.get(id=tournament_id)
        team1 = Team.objects.get(id=team1_id)
        team2 = Team.objects.get(id=team2_id)

        match = Match.objects.create(
            tournament=tournament, 
            team1=team1, 
            team2=team2, 
            **validated_data
        )
        return match

    def get_next_match(self, obj):
        if obj.next_match:
            return obj.next_match.id
        return None

    def get_result(self, obj):
        result = MatchResult.objects.filter(match=obj).first()
        if result:
            return MatchResultSerializer(result).data
        return None


class ResultMatchSerializer(serializers.ModelSerializer):
    team1 = TeamResultSerializer()
    team2 = TeamResultSerializer()

    class Meta:
        model = Match
        fields = ["id", "tournament", "team1", "team2", "match_time", "status"]
        depth = 1


class MatchEndSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchResult
        fields = ["id", "winner", "score_team1", "score_team2"]


# Серіалізатор результату матчу
class MatchResultSerializer(serializers.ModelSerializer):
    match = ResultMatchSerializer()
    winner = serializers.IntegerField(source="winner.id")

    class Meta:
        model = MatchResult
        fields = ["id", "match", "winner", "score_team1", "score_team2"]


class TournamentDetailSerializer(serializers.ModelSerializer):
    organizer_id = serializers.IntegerField(write_only=True)
    organizer = UserSerializer(read_only=True)
    teams = TeamSerializer(many=True, read_only=True)
    matches = MatchSerializer(many=True, read_only=True)

    class Meta:
        model = Tournament
        fields = [
            "id",
            "name",
            "organizer",
            "organizer_id",
            "game",
            "format",
            "start_date",
            "end_date",
            "teams",
            "matches",
            "max_teams",
        ]

class TeamDetailSerializer(TeamSerializer):
    captain = UserSerializer()
    tournaments = TournamentSerializer(many=True)
    total_matches = serializers.SerializerMethodField()
    wins = serializers.SerializerMethodField()
    losses = serializers.SerializerMethodField()
    matches = MatchSerializer(many=True)

    class Meta:
        model = Team
        fields = [
            "id",
            "name",
            "captain",
            "tournaments",
            "total_matches",
            "wins",
            "losses",
            "matches",
        ]

    def get_total_matches(self, obj):
        return (
            Match.objects.filter(team1=obj, status=Match.COMPLETED).count()
            + Match.objects.filter(team2=obj, status=Match.COMPLETED).count()
        )

    def get_wins(self, obj):
        return MatchResult.objects.filter(winner=obj).count()

    def get_losses(self, obj):
        return Match.objects.filter(
            (Q(team1=obj) | Q(team2=obj)) & ~Q(result__winner=obj),
            status=Match.COMPLETED,
        ).count()
    

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['user'] = UserSerializer(user).data
        return token
    

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def send_reset_email(self, email):
        user = User.objects.get(email=email)
        token = default_token_generator.make_token(user)
        send_reset_email(token, email)


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        email = data.get("email")
        token = data.get("token")
        new_password = data.get("new_password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired token.")

        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError("Invalid or expired token.")

        user.set_password(new_password)
        user.save()
        return data


class MatchDetailSerializer(serializers.ModelSerializer):
    next_match = serializers.SerializerMethodField()
    result = serializers.SerializerMethodField()
    tournament = TournamentDetailSerializer(read_only=True)
    tournament_id = serializers.IntegerField(write_only=True)
    team1_id = serializers.IntegerField(write_only=True, allow_null=True)
    team2_id = serializers.IntegerField(write_only=True, allow_null=True)

    class Meta:
        model = Match
        fields = [
            "id",
            "tournament",
            "team1",
            "team2",
            "match_time",
            "status",
            "next_match",
            "result",
            "tournament_id",
            "team1_id",
            "team2_id",
        ]
        depth = 1
    
    def create(self, validated_data):
        tournament_id = validated_data.pop("tournament_id")
        team1_id = validated_data.pop("team1_id")
        team2_id = validated_data.pop("team2_id")
        
        tournament = Tournament.objects.get(id=tournament_id)
        team1 = Team.objects.get(id=team1_id)
        team2 = Team.objects.get(id=team2_id)

        match = Match.objects.create(
            tournament=tournament,
            team1=team1, 
            team2=team2, 
            **validated_data
        )
        return match

    def get_next_match(self, obj):
        if obj.next_match:
            return obj.next_match.id
        return None

    def get_result(self, obj):
        result = MatchResult.objects.filter(match=obj).first()
        if result:
            return MatchResultSerializer(result).data
        return None