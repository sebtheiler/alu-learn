from rest_framework.throttling import UserRateThrottle
from .settings import REST_FRAMEWORK

# Adapted from https://stackoverflow.com/a/34539025/13042142
class ExceptionalUserRateThrottle(UserRateThrottle):
    def allow_request(self, request, view):
        """
        Give special access to a few special accounts.

        Mirrors code in super class with minor tweaks.
        """
        if self.rate is None:
            return True

        self.key = self.get_cache_key(request, view)
        if self.key is None:
            return True

        self.history = self.cache.get(self.key, [])
        self.now = self.timer()

        # Adjust if user has special privileges.
        override_rate = REST_FRAMEWORK['OVERRIDE_THROTTLE_RATES'].get(
            request.user.username,
            None,
        )
        if override_rate is not None:
            self.num_requests, self.duration = self.parse_rate(override_rate)

        # Drop any requests from the history which have now passed the
        # throttle duration
        while self.history and self.history[-1] <= self.now - self.duration:
            self.history.pop()

        if len(self.history) >= self.num_requests:
            print('failure')
            return self.throttle_failure()
        
        return self.throttle_success()