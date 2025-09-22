from datetime import datetime
from email.policy import default

from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.request import Request
from rest_framework.response import Response
from tournament.models import Tournament, Team, Match, MatchResult
from tournament.api.serializers import (
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    TournamentDetailSerializer,
    UserRegisterSerializer,
    TournamentSerializer,
    TeamSerializer,
    TeamDetailSerializer,
    MatchSerializer,
    MatchResultSerializer,
    MatchEndSerializer,
    MatchDetailSerializer,
)
from tournament.permissions import IsOrganizer, RolePermission, IsCaptain

if settings.DEBUG:
    pass #permissions.IsAuthenticated = permissions.AllowAny

default_safe_permission = permissions.AllowAny

User = get_user_model()


# 5.1 Аутентифікація
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request: Request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            user = User.objects.create_user(**serializer.validated_data)
            return Response(
                UserRegisterSerializer(user).data, status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
            content_type="application/json",
        )


# 5.2 Турніри
class TournamentListCreateView(RolePermission, generics.ListCreateAPIView):
    serializer_class = TournamentSerializer
    safe_permissions = []
    unsafe_permissions = []

    def get_queryset(self):
        queryset = Tournament.objects.all().order_by("-start_date")
        status = self.request.query_params.get('status', None)
        try:
            offset = int(self.request.query_params.get('offset', 0))
        except ValueError:
            offset = 0
        now = datetime.now()
        match status:
            case 'upcoming':
                queryset = queryset.filter(start_date__gt=now)
            case 'ongoing':
                queryset = queryset.filter(start_date__lte=now, end_date__gte=now)
            case 'completed':
                queryset = queryset.filter(end_date__lt=now)
            
        return queryset[offset:30+offset]


class TournamentDetailView(RolePermission, generics.RetrieveUpdateDestroyAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentDetailSerializer
    safe_permissions = [default_safe_permission()]
    unsafe_permissions = [IsOrganizer()]


class JoinTournamentsView(RolePermission, generics.CreateAPIView):
    serializer_class = TournamentDetailSerializer
    safe_permissions = [default_safe_permission()]
    unsafe_permissions = [IsCaptain()]

    def post(self, request: Request, *args, **kwargs):
        tournament_id = kwargs.get("pk", None)
        if tournament_id is None:
            return Response(
                {"error": "Tournament not found"}, status=status.HTTP_400_BAD_REQUEST
            )
        user = request.user
        if not isinstance(request.data, dict):
            return Response(
                {"error": "Invalid request data"}, status=status.HTTP_400_BAD_REQUEST
            )

        team_id = request.data.get("team_id", None)

        tournament = Tournament.objects.get(id=tournament_id)
        team = Team.objects.get(id=team_id, captain=user)
        if team is None:
            return Response(
                {"error": "You must be a captain of a team to join a tournament"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if tournament.teams.filter(id=team.pk).exists():
            return Response(
                {"error": "You have already joined this tournament"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        tournament.teams.add(team)

        return Response(
            TournamentDetailSerializer(tournament).data, status=status.HTTP_200_OK
        )
    
    def get_object(self):
        if not isinstance(self.request.data, dict):
            return None
        
        team_id = self.request.data.get("team_id", None)
        if team_id is None:
            return None
        return Team.objects.get(id=team_id)


class MakeTournamentsMatchesView(RolePermission, generics.RetrieveAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentDetailSerializer
    safe_permissions = [default_safe_permission()]
    unsafe_permissions = [IsOrganizer()]

    def post(self, request: Request, *args, **kwargs):
        tournament: Tournament = self.get_object()
        if tournament.matches.count() > 0:
            return Response(
                {"error": "Matches already created for this tournament"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if tournament.max_teams < 2:
            return Response(
                {"error": "Tournament must have at least 2 teams"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        total_matches = (tournament.max_teams) - 1
        matches: list[Match | None] = [None] * total_matches

        base_match = Match.objects.create(
            tournament=tournament,
        )

        matches[0] = base_match

        for i in range(1, total_matches):
            next_match = matches[(i-1) // 2]
            matches[i] = Match.objects.create(
                tournament=tournament, next_match=next_match
            )

        return Response(
            MatchSerializer(matches, many=True).data, status=status.HTTP_200_OK
        )


# 5.3 Команди
class TeamView(RolePermission, generics.ListCreateAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    safe_permissions = [default_safe_permission()]
    unsafe_permissions = [IsCaptain()]


class CaptainTeamsView(RolePermission, generics.ListAPIView):
    serializer_class = TeamSerializer
    safe_permissions = [default_safe_permission()]
    unsafe_permissions = [IsCaptain()]

    def get_queryset(self):
        user = self.request.user
        return Team.objects.filter(captain=user).order_by("-id")


class TeamDetailView(RolePermission, generics.RetrieveAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamDetailSerializer
    safe_permissions = [default_safe_permission()]
    unsafe_permissions = [IsCaptain()]


# 5.4 Матчі
class MatchListCreateView(RolePermission, generics.ListCreateAPIView):
    queryset = Match.objects.filter(team1__isnull=False, team2__isnull=False).order_by(
        "-status", "-match_time"
    )
    serializer_class = MatchSerializer
    safe_permissions = [default_safe_permission()]
    unsafe_permissions = [IsOrganizer()]
    
    def get_object(self):
        if not isinstance(self.request.data, dict):
            return super().get_object()
        tournament_id = self.request.data.get("tournament_id", None)
        if tournament_id is None:
            return super().get_object()
        return Tournament.objects.get(id=tournament_id)
        


class MatchDetailView(RolePermission, generics.RetrieveUpdateAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchDetailSerializer
    safe_permissions = [default_safe_permission()]
    unsafe_permissions = [IsOrganizer()]


class MatchEndView(RolePermission, generics.CreateAPIView):
    serializer_class = MatchEndSerializer
    safe_permissions = []
    unsafe_permissions = [IsOrganizer()]

    def get_queryset(self, **kwargs):
        match_id = self.kwargs.get("pk", None)
        if match_id is None:
            return Match.objects.none()
        return Match.objects.filter(id=match_id)

    def post(self, request: Request, *args, **kwargs):
        match_id = kwargs.get("pk", None)
        if match_id is None:
            return Response(
                {"error": "Match not found"}, status=status.HTTP_400_BAD_REQUEST
            )
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            if serializer.errors.get("match", None):
                return Response(
                    {"error": "Match not found or already ended"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            match = Match.objects.get(id=match_id)
            match.status = Match.COMPLETED
            match.save()
            if not hasattr(match, "result"):
                match_result = MatchResult.objects.create(
                    match=match, **serializer.validated_data
                )
            else:
                match_result = match.result
                match_result.winner = serializer.validated_data["winner"]
                match_result.score_team1 = serializer.validated_data["score_team1"]
                match_result.score_team2 = serializer.validated_data["score_team2"]
                match_result.save()
            return Response(
                MatchEndSerializer(match_result).data, status=status.HTTP_201_CREATED
            )
        except Match.DoesNotExist:
            return Response(
                {"error": "Match not found"}, status=status.HTTP_404_NOT_FOUND
            )


# 5.5 Результати матчів
class MatchResultListView(generics.ListAPIView):
    queryset = MatchResult.objects.all()
    serializer_class = MatchResultSerializer
    permission_classes = [default_safe_permission]


class MatchResultDetailView(RolePermission, generics.RetrieveUpdateAPIView):
    queryset = MatchResult.objects.all()
    serializer_class = MatchResultSerializer

    safe_permissions = [default_safe_permission()]
    unsafe_permissions = [IsOrganizer()]


class PasswordResetRequestView(generics.GenericAPIView):
    serializer_class = PasswordResetRequestSerializer

    def post(self, request, *args, **kwargs):
        serializer: PasswordResetRequestSerializer = self.get_serializer(
            data=request.data
        )
        if serializer.is_valid():
            serializer.send_reset_email(serializer.validated_data["email"])
            return Response(
                {
                    "message": 
                    "Instruction for password reset has been sent to your email."
                 }, 
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(generics.GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            return Response(
                {"message": "Password has been reset successfully."}, 
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
