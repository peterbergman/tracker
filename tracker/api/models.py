import uuid

class Site(object):
    """A class to represnt a site."""
    def __init__(self, site_name):
        self.site_id = uuid.uuid4().hex
        self.site_name = site_name

class Account(object):
    """A class to represnt a user account."""
    def __init__(self, email, password):
        self.account_id = uuid.uuid4().hex
        self.email = email
        self.password = password
        self.sites = []
