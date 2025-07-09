from django.test import TestCase
from django.utils import timezone
import datetime

from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from tournament.models import User, Tournament, Team, Match, MatchResult, UserRole


class UserModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword",
            nickname="testnick",
            role=UserRole.CAPTAIN
        )

    def test_user_creation(self):
        """Test user creation and properties"""
        self.assertEqual(self.user.username, "testuser")
        self.assertEqual(self.user.email, "test@example.com")
        self.assertEqual(self.user.nickname, "testnick")
        self.assertEqual(self.user.role, UserRole.CAPTAIN)

    def test_user_role_choices(self):
        """Test user role choices"""
        self.assertEqual(UserRole.ORGANIZER, "organizer")
        self.assertEqual(UserRole.CAPTAIN, "captain")
        self.assertEqual(UserRole.PLAYER, "player")
        self.assertEqual(UserRole.VIEWER, "viewer")


class TournamentModelTest(TestCase):
    def setUp(self):
        self.organizer = User.objects.create_user(
            username="organizer",
            password="password",
            role=UserRole.ORGANIZER
        )
        self.tournament = Tournament.objects.create(
            name="Test Tournament",
            organizer=self.organizer,
            max_teams=8,
            game="Test Game",
            format="Single Elimination",
            start_date=timezone.now().date(),
            end_date=(timezone.now() + datetime.timedelta(days=7)).date()
        )

    def test_tournament_creation(self):
        """Test tournament creation and properties"""
        self.assertEqual(self.tournament.name, "Test Tournament")
        self.assertEqual(self.tournament.organizer, self.organizer)
        self.assertEqual(self.tournament.max_teams, 8)
        self.assertEqual(self.tournament.game, "Test Game")
        self.assertEqual(self.tournament.format, "Single Elimination")


class TeamModelTest(TestCase):
    def setUp(self):
        self.captain = User.objects.create_user(
            username="captain",
            password="password",
            role=UserRole.CAPTAIN
        )
        self.team = Team.objects.create(
            name="Test Team",
            captain=self.captain
        )
        self.player1 = User.objects.create_user(
            username="player1",
            password="password",
            role=UserRole.PLAYER
        )

    def test_team_creation(self):
        """Test team creation and properties"""
        self.assertEqual(self.team.name, "Test Team")
        self.assertEqual(self.team.captain, self.captain)


class MatchModelTest(TestCase):
    def setUp(self):
        self.organizer = User.objects.create_user(
            username="organizer", 
            password="password",
            role=UserRole.ORGANIZER
        )
        
        self.captain1 = User.objects.create_user(
            username="captain1", 
            password="password",
            role=UserRole.CAPTAIN
        )
        
        self.captain2 = User.objects.create_user(
            username="captain2", 
            password="password",
            role=UserRole.CAPTAIN
        )
        
        self.tournament = Tournament.objects.create(
            name="Test Tournament",
            organizer=self.organizer,
            start_date=timezone.now().date(),
            end_date=(timezone.now() + datetime.timedelta(days=7)).date()
        )
        
        self.team1 = Team.objects.create(
            name="Team 1",
            captain=self.captain1
        )
        
        self.team2 = Team.objects.create(
            name="Team 2",
            captain=self.captain2
        )
        
        self.match = Match.objects.create(
            tournament=self.tournament,
            team1=self.team1,
            team2=self.team2,
            match_time=timezone.now()
        )

    def test_match_creation(self):
        """Test match creation and default status"""
        self.assertEqual(self.match.tournament, self.tournament)
        self.assertEqual(self.match.team1, self.team1)
        self.assertEqual(self.match.team2, self.team2)
        self.assertEqual(self.match.status, "scheduled")


class MatchResultTest(TestCase):
    def setUp(self):
        self.organizer = User.objects.create_user(
            username="organizer", 
            password="password",
            role=UserRole.ORGANIZER
        )
        
        self.captain1 = User.objects.create_user(
            username="captain1", 
            password="password",
            role=UserRole.CAPTAIN
        )
        
        self.captain2 = User.objects.create_user(
            username="captain2", 
            password="password",
            role=UserRole.CAPTAIN
        )
        
        self.tournament = Tournament.objects.create(
            name="Test Tournament",
            organizer=self.organizer,
            start_date=timezone.now().date(),
            end_date=(timezone.now() + datetime.timedelta(days=7)).date()
        )
        
        self.team1 = Team.objects.create(
            name="Team 1",
            captain=self.captain1
        )
        
        self.team2 = Team.objects.create(
            name="Team 2",
            captain=self.captain2
        )
        
        self.match = Match.objects.create(
            tournament=self.tournament,
            team1=self.team1,
            team2=self.team2,
            match_time=timezone.now()
        )
        
        self.match_result = MatchResult.objects.create(
            match=self.match,
            winner=self.team1,
            score_team1=3,
            score_team2=1
        )

    def test_match_result_creation(self):
        """Test match result creation and properties"""
        self.assertEqual(self.match_result.match, self.match)
        self.assertEqual(self.match_result.winner, self.team1)
        self.assertEqual(self.match_result.score_team1, 3)
        self.assertEqual(self.match_result.score_team2, 1)




class AuthAPITest(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.login_url = reverse('token_obtain_pair')
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword',
            'nickname': 'testnick',
            'role': UserRole.CAPTAIN
        }

    def test_user_registration(self):
        """Test user registration endpoint"""
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, 'testuser')

    def test_user_login(self):
        """Test user login endpoint"""
        # Create a user
        User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )
        
        # Attempt to login
        response = self.client.post(self.login_url, {
            'username': 'testuser',
            'password': 'testpassword'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('access' in response.data)
        self.assertTrue('refresh' in response.data)


class TournamentAPITest(APITestCase):
    def setUp(self):
        # Create test user
        self.organizer = User.objects.create_user(
            username='organizer',
            password='password',
            role=UserRole.ORGANIZER
        )
        
        # Get token for authentication
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'organizer',
            'password': 'password'
        }, format='json')
        
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
        # URLs
        self.tournaments_url = reverse('tournament-list-create')
        
        # Test data
        self.tournament_data = {
            'name': 'API Test Tournament',
            'max_teams': 16,
            'organizer_id': self.organizer.pk,
            'game': 'Test Game',
            'format': 'Double Elimination',
            'start_date': timezone.now().date().isoformat(),
            'end_date': (timezone.now() + datetime.timedelta(days=7)).date().isoformat()
        }

    def test_create_tournament(self):
        """Test tournament creation endpoint"""
        response = self.client.post(self.tournaments_url, self.tournament_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Tournament.objects.count(), 1)
        self.assertEqual(Tournament.objects.get().name, 'API Test Tournament')
        self.assertEqual(Tournament.objects.get().organizer, self.organizer)

    def test_list_tournaments(self):
        """Test listing tournaments endpoint"""
        # Create a few tournaments
        Tournament.objects.create(
            name="Tournament 1",
            organizer=self.organizer,
            max_teams=8,
            game="Test Game",
            format="Single Elimination",
            start_date=timezone.now().date(),
            end_date=(timezone.now() + datetime.timedelta(days=7)).date()
        )
        
        Tournament.objects.create(
            name="Tournament 2",
            organizer=self.organizer,
            max_teams=16,
            game="Another Game",
            format="Round Robin",
            start_date=timezone.now().date(),
            end_date=(timezone.now() + datetime.timedelta(days=14)).date()
        )
        
        response = self.client.get(self.tournaments_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)


class TeamAPITest(APITestCase):
    def setUp(self):
        # Create test users
        self.captain = User.objects.create_user(
            username='captain',
            password='password',
            role=UserRole.CAPTAIN
        )
        
        # Get token for authentication
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'captain',
            'password': 'password'
        }, format='json')
        
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
        # URLs
        self.teams_url = reverse('team-list-create')
        
        # Test data
        self.team_data = {
            'name': 'API Test Team',
            'captain_id': self.captain.pk,
        }

    def test_create_team(self):
        """Test team creation endpoint"""
        response = self.client.post(self.teams_url, self.team_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Team.objects.count(), 1)
        self.assertEqual(Team.objects.get().name, 'API Test Team')
        self.assertEqual(Team.objects.get().captain, self.captain)

    def test_list_my_teams(self):
        """Test listing user's teams endpoint"""
        # Create a team for the captain
        Team.objects.create(
            name="Captain's Team",
            captain=self.captain
        )
        
        # Create another user and team
        other_captain = User.objects.create_user(
            username='other_captain',
            password='password',
            role=UserRole.CAPTAIN
        )
        
        Team.objects.create(
            name="Other Team",
            captain=other_captain
        )
        
        # Test the my-teams endpoint
        my_teams_url = reverse('my-teams')
        response = self.client.get(my_teams_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Captain's Team")


class MatchAPITest(APITestCase):
    def setUp(self):
        # Create test users
        self.organizer = User.objects.create_user(
            username='organizer',
            password='password',
            role=UserRole.ORGANIZER
        )
        
        self.captain1 = User.objects.create_user(
            username='captain1',
            password='password',
            role=UserRole.CAPTAIN
        )
        
        self.captain2 = User.objects.create_user(
            username='captain2',
            password='password',
            role=UserRole.CAPTAIN
        )
        
        # Get token for organizer authentication
        response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'organizer',
            'password': 'password'
        }, format='json')
        
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        
        # Create tournament and teams
        self.tournament = Tournament.objects.create(
            name="Test Tournament",
            organizer=self.organizer,
            max_teams=8,
            game="Test Game",
            format="Single Elimination",
            start_date=timezone.now().date(),
            end_date=(timezone.now() + datetime.timedelta(days=7)).date()
        )
        
        self.team1 = Team.objects.create(
            name="Team 1",
            captain=self.captain1
        )
        
        self.team2 = Team.objects.create(
            name="Team 2",
            captain=self.captain2
        )
        
        # URLs
        self.matches_url = reverse('match-list-create')
        
        # Test data
        self.match_data = {
            'tournament_id': self.tournament.pk,
            'team1_id': self.team1.pk,
            'team2_id': self.team2.pk,
            'match_time': timezone.now().isoformat(),
            'status': 'scheduled'
        }

    def test_create_match(self):
        """Test match creation endpoint"""
        response = self.client.post(self.matches_url, self.match_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Match.objects.count(), 1)
        self.assertEqual(Match.objects.get().team1, self.team1)
        self.assertEqual(Match.objects.get().team2, self.team2)

    def test_end_match(self):
        """Test ending a match with result"""
        # Create a match
        match = Match.objects.create(
            tournament=self.tournament,
            team1=self.team1,
            team2=self.team2,
            match_time=timezone.now(),
            status='ongoing'
        )
        
        # End the match
        end_match_url = reverse('match-end', kwargs={'pk': match.pk})
        result_data = {
            'winner': self.team1.pk,
            'score_team1': 3,
            'score_team2': 1
        }
        
        response = self.client.post(end_match_url, result_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check that the match is now completed
        match.refresh_from_db()
        self.assertEqual(match.status, 'completed')
        
        # Check that the result was created
        self.assertEqual(MatchResult.objects.count(), 1)
        result = MatchResult.objects.get()
        self.assertEqual(result.winner, self.team1)
        self.assertEqual(result.score_team1, 3)
        self.assertEqual(result.score_team2, 1)