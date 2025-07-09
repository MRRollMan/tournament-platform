from django.contrib.auth.models import AbstractUser
from django.db import models


# Ролі користувачів
class UserRole(models.TextChoices):
    ORGANIZER = "organizer", "Organizer"
    CAPTAIN = "captain", "Captain"
    PLAYER = "player", "Player"
    VIEWER = "viewer", "Viewer"


# Кастомна модель користувача
class User(AbstractUser):
    id: int
    nickname = models.CharField(max_length=50, unique=True, blank=True, null=True)
    role = models.CharField(
        max_length=10, choices=UserRole.choices, default=UserRole.VIEWER
    )


# Модель турніру
class Tournament(models.Model):
    name = models.CharField(max_length=100)
    organizer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="tournaments"
    )
    max_teams = models.IntegerField(default=8)
    game = models.CharField(max_length=100)
    format = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()

    matches: models.QuerySet["Match"]
    teams: models.ManyToManyField

    def __str__(self):
        return self.name


# Модель команди
class Team(models.Model):
    name = models.CharField(max_length=100)
    captain = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="captain_teams"
    )
    tournaments = models.ManyToManyField(Tournament, related_name="teams", blank=True)
    matches_as_team1: models.QuerySet["Match"]
    matches_as_team2: models.QuerySet["Match"]

    @property
    def matches(self):
        return self.matches_as_team1.all() | self.matches_as_team2.all()

    def __str__(self):
        return self.name


# Модель гравця
class Player(models.Model):
    user: User = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="players"
    ) # type: ignore
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="players")

    def __str__(self):
        return f"{self.user.nickname or self.user.username} ({self.team.name})"


# Модель матчу
class Match(models.Model):
    SCHEDULED = "scheduled"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELED = "canceled"
    STATUS_CHOICES = {
        SCHEDULED: "Scheduled match",
        ONGOING: "Ongoing",
        COMPLETED: "Completed",
        CANCELED: "Canceled",
    }

    tournament = models.ForeignKey(
        Tournament, on_delete=models.CASCADE, related_name="matches"
    )
    team1 = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="matches_as_team1",
        null=True,
        default=None,
        blank=True,
    )
    team2 = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name="matches_as_team2",
        null=True,
        default=None,
        blank=True,
    )
    match_time = models.DateTimeField(default=None, blank=True, null=True)
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default="scheduled" # type: ignore
    )
    next_match = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        related_name="previous_matches",
        blank=True,
        null=True,
    )

    def __str__(self):
        team1_name = self.team1.name if self.team1 else "TBD"
        team2_name = self.team2.name if self.team2 else "TBD"
        return f"{team1_name} VS {team2_name} ({self.tournament.name}|{self.status})"


# Модель результату матчу
class MatchResult(models.Model):
    match = models.OneToOneField(Match, on_delete=models.CASCADE, related_name="result")
    winner = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="wins")
    score_team1 = models.IntegerField()
    score_team2 = models.IntegerField()

    def __str__(self):
        return f"{self.match.team1.name} ({self.score_team1} - {self.score_team2}) {self.match.team2.name} | {self.winner.name}" # type: ignore  # noqa: E501
