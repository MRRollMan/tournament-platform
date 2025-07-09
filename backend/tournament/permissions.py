from rest_framework import permissions
from rest_framework.request import Request

from tournament.models import Match, Team

class RolePermission(permissions.BasePermission):
    safe_permissions = [permissions.AllowAny()]
    unsafe_permissions = [permissions.IsAuthenticated()]
    request: Request

    def get_permissions(self):
        if self.request.method not in permissions.SAFE_METHODS:
            return self.unsafe_permissions
        return self.safe_permissions


class IsOrganizer(permissions.BasePermission):
    def has_permission(self, request, view):
        is_authenticated = request.user.is_authenticated
        if not is_authenticated:
            return False
        
        try:
            obj = view.get_object()
        except AssertionError:
            return request.user.role == "organizer"
        
        if isinstance(obj, Match):
            tournament = obj.tournament
        else:
            tournament = obj
        
        return tournament.organizer.id == request.user.id


class IsCaptain(permissions.BasePermission):
    def has_permission(self, request, view):
        is_authenticated = request.user.is_authenticated
        if not is_authenticated:
            return False
        
        try:
            obj = view.get_object()
        except AssertionError:
            return request.user.role == "captain"
        
        if isinstance(obj, Team):
            team = obj
        else:
            return request.user.role == "captain"
        
        return team.captain.id == request.user.id


class IsPlayer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "player"
