from django.shortcuts import redirect
import urllib.parse

class ProtectedRouteMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if the path starts with /pr/
        if request.path.startswith('/pr/'):
            # If user is not authenticated, redirect to login page with next parameter
            if not request.user.is_authenticated:
                # URL encode the next path
                next_path = urllib.parse.quote(request.path)
                return redirect(f'/login?next={next_path}')
        
        response = self.get_response(request)
        return response
