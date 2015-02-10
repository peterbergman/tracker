import datetime

class Event():
    def __init__(self, visitor_id, account_id, site_id, page_url, user_agent):
        self.time = datetime.datetime.now()
        self.visitor_id = visitor_id
        self.account_id = account_id
        self.site_id = site_id
        self.page_url = page_url
        self.user_agent = user_agent
