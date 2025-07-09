from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from tournament.views import (
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
    TournamentListCreateView,
    TournamentDetailView,
    TeamView,
    TeamDetailView,
    MatchListCreateView,
    MatchDetailView,
    MatchEndView,
    MatchResultListView,
    MatchResultDetailView,
    MakeTournamentsMatchesView,
    CaptainTeamsView,
    JoinTournamentsView,
)

from rest_framework_simplejwt.views import TokenBlacklistView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/logout/", TokenBlacklistView.as_view(), name="logout"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # 5.2 Турніри
    path(
        "api/tournaments/",
        TournamentListCreateView.as_view(),
        name="tournament-list-create",
    ),
    path(
        "api/tournaments/<int:pk>/",
        TournamentDetailView.as_view(),
        name="tournament-detail",
    ),
    path(
        "api/tournaments/<int:pk>/generate-matches/",
        MakeTournamentsMatchesView.as_view(),
        name="tournament-generate-matches",
    ),
    path(
        "api/tournaments/<int:pk>/join/",
        JoinTournamentsView.as_view(),
        name="tournament-join",
    ),
    # 5.3 Команди
    path("api/teams/", TeamView.as_view(), name="team-list-create"),
    path("api/teams/my-teams/", CaptainTeamsView.as_view(), name="my-teams"),
    path("api/teams/<int:pk>/", TeamDetailView.as_view(), name="team-detail"),
    # 5.4 Матчі
    path("api/matches/", MatchListCreateView.as_view(), name="match-list-create"),
    path("api/matches/<int:pk>/", MatchDetailView.as_view(), name="match-detail"),
    path("api/matches/<int:pk>/end/", MatchEndView.as_view(), name="match-end"),
    # 5.5 Результати матчів
    path(
        "api/match-results/",
        MatchResultListView.as_view(),
        name="match-result-list-create",
    ),
    path(
        "api/match-results/<int:pk>/",
        MatchResultDetailView.as_view(),
        name="match-result-detail",
    ),
    path(
        'api/auth/reset-password/', 
        PasswordResetRequestView.as_view(), 
        name='reset-password'
    ),
    path(
        'api/auth/reset-password/confirm/', 
        PasswordResetConfirmView.as_view(), 
        name='reset-password-confirm'
    ),

]
