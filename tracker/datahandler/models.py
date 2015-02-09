from mongoengine import *
import datetime

class Event(Document):
    time = DateTimeField(default=datetime.datetime.now())
    visitor_id = StringField()
    account_id = StringField()
    site_id = StringField()
    page_url = StringField()
    user_agent = StringField()

    def __unicode__(self):
        return str(self.time) + ', ' + self.visitor_id + ', ' + self.account_id + ', ' + self.site_id + ', ' + self.page_url + ', ' + self.user_agent
