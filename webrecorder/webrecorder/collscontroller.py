from bottle import request, response, template
from six.moves.urllib.parse import quote
import os

from webrecorder.basecontroller import BaseController, wr_api_spec
from webrecorder.webreccork import ValidationException

from webrecorder.models.base import DupeNameException
from webrecorder.models.datshare import DatShare
from webrecorder.utils import get_bool

from datetime import datetime
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# ============================================================================
class CollsController(BaseController):
    def __init__(self, *args, **kwargs):
        super(CollsController, self).__init__(*args, **kwargs)
        config = kwargs['config']

        self.allow_external = get_bool(os.environ.get('ALLOW_EXTERNAL', False))

    def init_routes(self):
        wr_api_spec.set_curr_tag('Collections')

        @self.app.post('/api/v1/collections')
        @self.api(query=['user'],
                  req=['title', 'url', 'public', 'public_index'],
                  resp='collection')

        def create_collection():
            user = self.get_user(api=True, redir_check=False)

            data = request.json or {}
            title = data.get('title', '')
            coll_name = self.sanitize_title(title)
            #if not title:
            #    title._raise_error(400, 'please enter a title to record')

            url = data.get('url', '')

            #if not url:
            #    self._raise_error(400, 'please enter a URL to record')



            if not coll_name:
                self._raise_error(400, 'invalid_coll_name')

            doi = data.get('doi', '') # TODO: generate doi here
            #
            #TODO: add redis object, key: jahr.monat, value: counter

            is_public = data.get('public', False)

            is_public_index = data.get('public_index', False)

            is_external = data.get('external', False)

            is_anon = self.access.is_anon(user)

            creatorList = data.get('creatorList', '')

            subjectHeaderList = data.get('subjectHeaderList', '')

            personHeaderList = data.get('personHeaderList', '')

            publisher = data.get('publisher', '')

            #if not publisher:
            #    self._raise_error(400, 'please enter the publisher of the resource')

            personHeadingText = data.get('personHeadingText', '')

            collTitle = data.get('collTitle', '')

            #if not collTitle:
            #    self._raise_error(400, 'please enter the authership information of the resource')

            noteToDachs = data.get('noteToDachs', '')

            publisherOriginal = data.get('publisherOriginal', '')

            pubTitleOriginal = data.get('pubTitleOriginal', '')

            collYear = data.get('collYear', '')

            copTitle = data.get('copTitle', '')

            subjectHeadingText = data.get('subjectHeadingText', '')

            surName = data.get('surName', '')

            persName = data.get('persName', '')

            usermail = data.get('usermail', '')

            emailOfRightsholder = data.get('emailOfRightsholder', '')

            #if not usermail:
            #    self._raise_error(400, 'invalid email adress')

            selectedGroupName = data.get('selectedGroupName', '')

            projektcode = data.get('projektcode', '')

            publishYear = data.get('publishYear', '')

            listID = data.get('listID', 0)

            ticketState = data.get('ticketState')

            isCollLoaded = data.get('isCollLoaded', True)

            recordingUrl = data.get('recordingUrl', '')

            recordingTimestamp = data.get('recordingTimestamp', '')


            if is_external:
                if not self.allow_external:
                    self._raise_error(403, 'external_not_allowed')

                #if not is_anon:
                #    self._raise_error(400, 'not_valid_for_external')

            elif is_anon:
                if coll_name != 'temp':
                    self._raise_error(400, 'invalid_temp_coll_name')

            if user.has_collection(coll_name):
                self._raise_error(400, 'duplicate_name')

            try:
                collection = user.create_collection(coll_name, title=title, url=url, creatorList=creatorList, noteToDachs=noteToDachs, subjectHeaderList=subjectHeaderList,
                                                    personHeaderList=personHeaderList, publisher=publisher, collTitle=collTitle, publisherOriginal=publisherOriginal,
                                                    pubTitleOriginal=pubTitleOriginal, personHeadingText=personHeadingText, collYear=collYear, copTitle=copTitle, subjectHeadingText=subjectHeadingText,
                                                    surName=surName, persName=persName, usermail=usermail, emailOfRightsholder=emailOfRightsholder, selectedGroupName=selectedGroupName, projektcode=projektcode, publishYear=publishYear,
                                                    listID=listID, desc='', public=is_public, public_index=is_public_index, ticketState=ticketState, isCollLoaded=isCollLoaded,
                                                    recordingUrl=recordingUrl, recordingTimestamp=recordingTimestamp, doi=doi)

                if is_external:
                    collection.set_external(True)

                user.mark_updated()

                self.flash_message('Created collection <b>{0}</b>!'.format(collection.get_prop('title')), 'success')
                resp = {'collection': collection.serialize()}

            except DupeNameException as de:
                self._raise_error(400, 'duplicate_name')

            except Exception as ve:
                print(ve)
                self.flash_message(str(ve))
                self._raise_error(400, 'duplicate_name')
            return resp


        @self.app.post('/api/v1/collectionsduplicate')
        @self.api(query=['user'],
                  req=['title'],
                  resp='collection')
        def create_collection_with_Warc():
            user = self.get_user(api=True, redir_check=False)

            data = request.json or {}
            title = data.get('title', '')
            coll_name = self.sanitize_title(title)
            resp = None
            collection = None
            collections= user.get_collections()
            for _col in collections:
                print(_col.get('title'))
                if _col.get('title') == title:
                    coll_name += "_duplicate"
                    title = coll_name
                    #if not title:
                    #    title._raise_error(400, 'please enter a title to record')

                    url = _col.get('url', '')

                    #if not url:
                    #    self._raise_error(400, 'please enter a URL to record')

                    coll_name = title

                    if not coll_name:
                        self._raise_error(400, 'invalid_coll_name')

                    doi = '' # TODO: generate doi here
                    #
                    #TODO: add redis object, key: jahr.monat, value: counter

                    is_public = _col.get('public', False)

                    is_public_index = _col.get('public_index', False)

                    is_external = _col.get('external', False)

                    is_anon = self.access.is_anon(user)

                    creatorList = _col.get('creatorList', '')

                    subjectHeaderList = _col.get('subjectHeaderList', '')

                    personHeaderList = _col.get('personHeaderList', '')

                    publisher = _col.get('publisher', '')

                    #if not publisher:
                    #    self._raise_error(400, 'please enter the publisher of the resource')

                    personHeadingText = _col.get('personHeadingText', '')

                    collTitle = title

                    #if not collTitle:
                    #    self._raise_error(400, 'please enter the authership information of the resource')

                    noteToDachs = _col.get('noteToDachs', '')

                    emailOfRightsholder = _col.get('emailOfRightsholder', '')

                    publisherOriginal = _col.get('publisherOriginal', '')

                    pubTitleOriginal = _col.get('pubTitleOriginal', '')

                    collYear = _col.get('collYear', '')

                    copTitle = _col.get('copTitle', '')

                    subjectHeadingText = _col.get('subjectHeadingText', '')

                    surName = _col.get('surName', '')

                    persName = _col.get('persName', '')

                    usermail = _col.get('usermail', '')

                    #if not usermail:
                    #    self._raise_error(400, 'invalid email adress')

                    selectedGroupName = _col.get('selectedGroupName', '')

                    projektcode = _col.get('projektcode', '')

                    publishYear = _col.get('publishYear', '')

                    listID = _col.get('listID', 0)

                    ticketState = 'open'

                    isCollLoaded = _col.get('isCollLoaded', True)

                    recordingUrl = _col.get('recordingUrl', '')

                    recordingTimestamp = _col.get('recordingTimestamp', '')


                    if is_external:
                        if not self.allow_external:
                            self._raise_error(403, 'external_not_allowed')

                        #if not is_anon:
                        #    self._raise_error(400, 'not_valid_for_external')

                    elif is_anon:
                        if coll_name != 'temp':
                            self._raise_error(400, 'invalid_temp_coll_name')

                    if user.has_collection(coll_name):
                        self._raise_error(400, 'duplicate_name')

                    try:
                        collection = user.create_collection(coll_name, title=title, url=url, creatorList=creatorList, noteToDachs=noteToDachs, subjectHeaderList=subjectHeaderList,
                                                            personHeaderList=personHeaderList, publisher=publisher, collTitle=collTitle, publisherOriginal=publisherOriginal,
                                                            pubTitleOriginal=pubTitleOriginal, personHeadingText=personHeadingText, collYear=collYear, copTitle=copTitle, subjectHeadingText=subjectHeadingText,
                                                            surName=surName, persName=persName, usermail=usermail, emailOfRightsholder=emailOfRightsholder, selectedGroupName=selectedGroupName, projektcode=projektcode, publishYear=publishYear,
                                                            listID=listID, desc='', public=is_public, public_index=is_public_index, ticketState=ticketState, isCollLoaded=isCollLoaded,
                                                            recordingUrl=recordingUrl, recordingTimestamp=recordingTimestamp, doi=doi)

                        if is_external:
                            collection.set_external(True)

                        user.mark_updated()

                        self.flash_message('Created collection <b>{0}</b>!'.format(collection.get_prop('title')), 'success')
                        resp = {'collection': collection.serialize()}

                    except DupeNameException as de:
                        self._raise_error(400, 'duplicate_name')

                    except Exception as ve:
                        print(ve)
                        self.flash_message(str(ve))
                        self._raise_error(400, 'duplicate_name')



                    for recording in _col.get_recordings(load=True):
                        _col.copy_recording(recording,collection)
                        #for n, warc_path in recording.iter_all_files():
                        #    print(warc_path)




                    return resp


            self._raise_error(400, 'object to duplicate not found')


        @self.app.get('/api/v1/collections')
        @self.api(query=['user', 'include_recordings', 'include_lists', 'include_pages'],
                  resp='collections')
        def get_collections():
            user = self.get_user(api=True, redir_check=False)
            kwargs = {'include_recordings': get_bool(request.query.get('include_recordings')),
                      'include_lists': get_bool(request.query.get('include_lists')),
                      'include_pages': get_bool(request.query.get('include_pages')),
                     }

            collections = user.get_collections()

            return {'collections': [coll.serialize(**kwargs) for coll in collections]}

        @self.app.get('/api/v1/collection/<coll_name>')
        @self.api(query=['user'],
                  resp='collection')
        def get_collection(coll_name):
            user = self.get_user(api=True, redir_check=False)

            return self.get_collection_info(coll_name, user=user)

        @self.app.delete('/api/v1/collection/<coll_name>')
        @self.api(query=['user'],
                  resp='deleted')
        def delete_collection(coll_name):
            user, collection = self.load_user_coll(coll_name=coll_name)

            errs = user.remove_collection(collection, delete=True)
            if errs.get('error'):
                return self._raise_error(400, errs['error'])
            else:
                return {'deleted_id': coll_name}

        @self.app.put('/api/v1/collection/<coll_name>/warc')
        def add_external_warc(coll_name):
            if not self.allow_external:
                self._raise_error(403, 'external_not_allowed')

            user, collection = self.load_user_coll(coll_name=coll_name)

            self.access.assert_can_admin_coll(collection)

            if not collection.is_external():
                self._raise_error(400, 'external_only')

            num_added = collection.add_warcs(request.json.get('warcs', {}))

            return {'success': num_added}

        @self.app.put('/api/v1/collection/<coll_name>/cdx')
        def add_external_cdxj(coll_name):
            if not self.allow_external:
                self._raise_error(403, 'external_not_allowed')

            user, collection = self.load_user_coll(coll_name=coll_name)

            self.access.assert_can_admin_coll(collection)

            if not collection.is_external():
                self._raise_error(400, 'external_only')

            num_added = collection.add_cdxj(request.body.read())

            return {'success': num_added}

        @self.app.post('/api/v1/collection/<coll_name>')
        @self.api(query=['user'],
                  req=['title'],
                  resp='collection')
        def update_collection(coll_name):
            user, collection = self.load_user_coll(coll_name=coll_name)

            self.access.assert_can_admin_coll(collection)
            print('THIS IS IMPORTANT')
            print('USER:')
            print(user)
            print('COLLECTION:')
            print(collection)
            ticketStateChanged = False

            data = request.json or {}
            if "ticketState" in data:
                print(data['ticketState'])
            if 'title' in data:
                new_coll_title = data['title']
                new_coll_name = self.sanitize_title(new_coll_title)

                if not new_coll_name:
                    self._raise_error(400, 'invalid_coll_name')

                try:
                    new_coll_name = user.colls.rename(collection, new_coll_name, allow_dupe=False)
                except DupeNameException as de:
                    self._raise_error(400, 'duplicate_name')

                collection['title'] = new_coll_title

            if 'creatorList' in data:
                collection['creatorList'] = data['creatorList']

            if 'doi' in data:
                if 'ticketState' in data and data['ticketState'] is not "approved" and data['ticketState'] is not "completed":
                    try:
                        collection['doi'] = data['doi']
                    except DupeNameException as de:
                        self._raise_error(400, 'weird problem')

            if 'subjectHeaderList' in data:
                collection['subjectHeaderList'] = data['subjectHeaderList']

            if 'personHeaderList' in data:
                collection['personHeaderList'] = data['personHeaderList']

            if 'publisherOriginal' in data:
                collection['publisherOriginal'] = data['publisherOriginal']

            if 'publisher' in data:
                collection['publisher'] = data['publisher']

            if 'collTitle' in data:
                collection['collTitle'] = data['collTitle']

            if 'collYear' in data:
                collection['collYear'] = data['collYear']

            if 'copTitle' in data:
                collection['copTitle'] = data['copTitle']

            if 'noteToDachs' in data:
                collection['noteToDachs'] = data['noteToDachs']

            if 'surName' in data:
                collection['surName'] = data['surName']

            if 'persName' in data:
                collection['persName'] = data['persName']


            if 'personHeadingText' in data:
                collection['personHeadingText'] = data['personHeadingText']

            if 'projektcode' in data:
                if  collection['ticketState'] is not "approved" and collection['ticketState'] is not "completed":
                    print('projectcode changed!!!!!!!!!!')
                    collection['projektcode'] = data['projektcode']
                    print(collection['projectcode'])

            if 'pubTitleOriginal' in data:
                collection['pubTitleOriginal'] = data['pubTitleOriginal']

            if 'subjectHeadingText' in data:
                collection['subjectHeadingText'] = data['subjectHeadingText']

            if 'usermail' in data:
                collection['usermail'] = data['usermail']

            if 'emailOfRightsholder' in data:
                collection['emailOfRightsholder'] = data['emailOfRightsholder']

            if 'selectedGroupName' in data:
                collection['selectedGroupName'] = data['selectedGroupName']
            if data['ticketState'] == "approved" and ('projektcode' in data or 'projektcode' in collection):
                try:
                    if data['projektcode'] != "":
                        print('doi has changed!!!!')
                        collection['projektcode'] = data['projektcode']
                        today = datetime.utcnow()
                        possibleDOIBase = "10.25354/"+data['projektcode']+"."+str(today.year)+"."+str(today.month)
                        tempInc = 1
                        possibleDOI = possibleDOIBase+"-"+tempInc;
                        while self.redis.sismember('doimodel', possibleDOI) == 1:
                            tempInc += 1
                            possibleDOI = possibleDOIBase+"-"+tempInc;
                        self.redis.sadd('doimodel', possibleDOI)
                        collection['doi'] = possibleDOI
                        print(collection['doi'])
                    else:
                        print('doi has changed!!!!')
                        today = datetime.utcnow()
                        possibleDOIBase = "10.25354/"+collection['projektcode']+"."+str(today.year)+"."+str(today.month)
                        tempInc = 1
                        possibleDOI = possibleDOIBase+"-"+str(tempInc);
                        while self.redis.sismember('doimodel', possibleDOI) == 1:
                            tempInc += 1
                            possibleDOI = possibleDOIBase+"-"+str(tempInc);
                        self.redis.sadd('doimodel', possibleDOI)
                        collection['doi'] = possibleDOI
                        print(collection['doi'])
                except DupeNameException as de:
                    self._raise_error(400, 'weird problem')
            else:
                print(collection['doi'])
            if 'publishYear' in data:
                collection['publishYear'] = data['publishYear']

            if 'listID' in data:
                collection['listID'] = data['listID']

            if 'isCollLoaded' in data:
                collection.set_bool_prop('isCollLoaded', data['isCollLoaded'])

            if 'recordingUrl' in data:
                collection['recordingUrl'] = data['recordingUrl']


            if 'recordingTimestamp' in data:
                collection['recordingTimestamp'] = data['recordingTimestamp']

            if 'desc' in data:
                collection['desc'] = data['desc']

            if 'ticketState' in data:
                if collection['ticketState'] != data['ticketState']:
                    prevState = collection['ticketState']
                    newState = data['ticketState']
                    ticketStateChanged = True
                    print("Ticket State changed from {} to {}".format(collection['title'], newState))
                collection['ticketState'] = data['ticketState']
            if 'url' in data:
                collection['url'] = data['url']

            if ticketStateChanged:
                if data['ticketState'] == 'completed':
                    # to user
                    reviewerMailText = template(
                        'webrecorder/templates/complete_mail_user.html',
                        coll_name=coll_name,
                        coll_doi=collection['doi']
                    )

                    mail = MIMEMultipart()
                    mail['FROM'] = 'lib-dachs-team@cats.uni-heidelberg.de'
                    mail['TO'] = collection['usermail']
                    mail['subject'] = 'Webrecorder: Archive Complete'
                    host = "relays.uni-heidelberg.de"
                    mailServer = smtplib.SMTP(host)
                    mail.attach(MIMEText(reviewerMailText, "html"))
                    msgBody = mail.as_string()
                    mailServer.sendmail('lib-dachs-team@cats.uni-heidelberg.de',collection['usermail'], msgBody)
                    mailServer.quit()
                    reviewerMailText = template(
                        'webrecorder/templates/complete_mail.html',
                        coll_name=coll_name,
                        coll_doi=collection['doi']
                    )

                    # to Hiwi/Katalogisierungsmitarbeiter/Reviewer
                    reviewerMailText = template(
                        'webrecorder/templates/complete_mail_hiwi.html',
                        coll_name=coll_name,
                        coll_doi=collection['doi'],
			            doi=collection['doi']
                    )

                    mail = MIMEMultipart()
                    mail['FROM'] = 'lib-dachs-team@cats.uni-heidelberg.de'
                    mail['TO'] = 'lib-dachs-team@cats.uni-heidelberg.de'
                    mail['subject'] = 'Webrecorder: Archive complete'
                    host = "relays.uni-heidelberg.de"
                    mailServer = smtplib.SMTP(host)
                    mail.attach(MIMEText(reviewerMailText, "html"))
                    msgBody = mail.as_string()
                    mailServer.sendmail('lib-dachs-team@cats.uni-heidelberg.de','lib-dachs-team@cats.uni-heidelberg.de', msgBody)
                    mailServer.quit()
                elif data['ticketState'] == 'approved':
                    #inform user his doi is about to be dropped
                    reviewerMailText = template(
                        'webrecorder/templates/approve_mail_user.html',
                        coll_name=coll_name,
                        username=user.name,
                        coll_doi=collection['doi'],
                        doi=collection['doi'],
                        title=collection['title'],
                        url=collection['url'], creatorList=collection['creatorList'], noteToDachs=collection['noteToDachs'], subjectHeaderList=collection['subjectHeaderList'],
                                                            personHeaderList=collection['personHeaderList'], publisher=collection['publisher'], collTitle=collection['collTitle'], publisherOriginal=collection['publisherOriginal'],
                                                            pubTitleOriginal=collection['pubTitleOriginal'], personHeadingText=collection['personHeadingText'], collYear=collection['collYear'], copTitle=collection['copTitle'], subjectHeadingText=collection['subjectHeadingText'],
                                                            surName=collection['surName'], persName=collection['persName'], usermail=collection['usermail'], emailOfRightsholder=collection['emailOfRightsholder'], selectedGroupName=collection['selectedGroupName'], projektcode=collection['projektcode'], publishYear=collection['publishYear'],
                                                            listID=collection['listID'], desc=collection['desc'], public=collection['is_public'], public_index=collection['is_public_index'], ticketState=collection['ticketState'], isCollLoaded=collection['isCollLoaded'],
                                                            recordingUrl=collection['recordingUrl'], recordingTimestamp=collection['recordingTimestamp']
                    )

                    mail = MIMEMultipart()
                    mail['FROM'] = 'lib-dachs-team@cats.uni-heidelberg.de'
                    mail['TO'] = collection['usermail']
                    mail['subject'] = 'Webrecorder: Archive approved'
                    host = "relays.uni-heidelberg.de"
                    mailServer = smtplib.SMTP(host)
                    mail.attach(MIMEText(reviewerMailText, "html"))
                    msgBody = mail.as_string()
                    mailServer.sendmail('lib-dachs-team@cats.uni-heidelberg.de',collection['usermail'], msgBody)
                    mailServer.quit()
                    #the internal doi creation related library worker
                    reviewerMailText = template(
                        'webrecorder/templates/approve_mail_hiwi.html',
                        coll_name=coll_name,
                        host=os.environ['APP_HOST'],
                        username=user.name, title=collection['title'], url=collection['url'], creatorList=collection['creatorList'], noteToDachs=collection['noteToDachs'], subjectHeaderList=collection['subjectHeaderList'],
                                                            personHeaderList=collection['personHeaderList'], publisher=collection['publisher'], collTitle=collection['collTitle'], publisherOriginal=collection['publisherOriginal'],
                                                            pubTitleOriginal=collection['pubTitleOriginal'], personHeadingText=collection['personHeadingText'], collYear=collection['collYear'], copTitle=collection['copTitle'], subjectHeadingText=collection['subjectHeadingText'],
                                                            surName=collection['surName'], persName=collection['persName'], usermail=collection['usermail'], emailOfRightsholder=collection['emailOfRightsholder'], selectedGroupName=collection['selectedGroupName'], projektcode=collection['projektcode'], publishYear=collection['publishYear'],
                                                            listID=collection['listID'], desc=collection['desc'], public=collection['is_public'], public_index=collection['is_public_index'], ticketState=collection['ticketState'], isCollLoaded=collection['isCollLoaded'],
                                                            recordingUrl=collection['recordingUrl'], recordingTimestamp=collection['recordingTimestamp'], doi=collection['doi']
                    )

                    mail = MIMEMultipart()
                    mail['FROM'] = 'lib-dachs-team@cats.uni-heidelberg.de'
                    mail['TO'] = 'lib-dachs-team@cats.uni-heidelberg.de'
                    mail['subject'] = 'Webrecorder: Archive approved'
                    host = "relays.uni-heidelberg.de"
                    mailServer = smtplib.SMTP(host)
                    mail.attach(MIMEText(reviewerMailText, "html"))
                    msgBody = mail.as_string()
                    mailServer.sendmail('lib-dachs-team@cats.uni-heidelberg.de','lib-dachs-team@cats.uni-heidelberg.de', msgBody)
                    mailServer.quit()

                elif data['ticketState'] == 'denied':
                    # to user
                    reviewerMailText = template(
                        'webrecorder/templates/deny_mail_user.html',
                        coll_name=coll_name
                    )

                    mail = MIMEMultipart()
                    mail['FROM'] = 'lib-dachs-team@cats.uni-heidelberg.de'
                    mail['TO'] = collection['usermail']
                    mail['subject'] = 'Webrecorder: Archive denied'
                    host = "relays.uni-heidelberg.de"
                    mailServer = smtplib.SMTP(host)
                    mail.attach(MIMEText(reviewerMailText, "html"))
                    msgBody = mail.as_string()
                    mailServer.sendmail('lib-dachs-team@cats.uni-heidelberg.de',collection['usermail'], msgBody)
                    mailServer.quit()

                    # to Hiwi
                    reviewerMailText = template(
                        'webrecorder/templates/deny_mail_hiwi.html',
                        coll_name=coll_name,
                        host=host,
                        usermail=collection['usermail']
                    )

                    mail = MIMEMultipart()
                    mail['FROM'] = 'lib-dachs-team@cats.uni-heidelberg.de'
                    mail['TO'] = 'lib-dachs-team@cats.uni-heidelberg.de'
                    mail['subject'] = 'Webrecorder: Archive denied'

                    host = "relays.uni-heidelberg.de"
                    mailServer = smtplib.SMTP(host)
                    MSG = "Your archive's state has been changed from {} to {}. We will inform you with further updates as soon as possible.".format(prevState, newState)
                    mail.attach(MIMEText(reviewerMailText, "html"))
                    msgBody = mail.as_string()
                    mailServer.sendmail('lib-dachs-team@cats.uni-heidelberg.de','lib-dachs-team@cats.uni-heidelberg.de', msgBody)
                    mailServer.quit()

                elif data['ticketState'] == 'pending':
                    # #send user an info mail to ease him
                    # reviewerMailText = template(
                    #     'webrecorder/templates/pending_mail_user.html',
                    #     coll_name=coll_name
                    # )
                    #
                    # mail = MIMEMultipart()
                    # mail['FROM'] = 'lib-dachs-team@cats.uni-heidelberg.de'
                    # mail['TO'] = collection['usermail']
                    # mail['subject'] = 'Webrecorder: New collection awaiting review!'
                    #
                    # host = "relays.uni-heidelberg.de"
                    # mailServer = smtplib.SMTP(host)
                    # MSG = "Your archive's state has been changed from {} to {}. We will inform you with further updates as soon as possible.".format(prevState, newState)
                    # mail.attach(MIMEText(reviewerMailText, "html"))
                    # msgBody = mail.as_string()
                    # mailServer.sendmail('lib-dachs-team@cats.uni-heidelberg.de',collection['usermail'], msgBody)
                    # mailServer.quit()
                    #send admins an infomail to get them to work
                    reviewerMailText = template(
                        'webrecorder/templates/pending_mail_admin.html',
                        coll_name=coll_name,
                        host=self.app_host
                    )

                    mail = MIMEMultipart()
                    mail['FROM'] = 'lib-dachs-team@cats.uni-heidelberg.de'
                    mail['TO'] = 'lib-dachs-team@cats.uni-heidelberg.de'
                    mail['subject'] = 'Webrecorder: Awaiting review'

                    host = "relays.uni-heidelberg.de"
                    mailServer = smtplib.SMTP(host)
                    MSG = "Your archive's state has been changed from {} to {}. We will inform you with further updates as soon as possible.".format(prevState, newState)
                    mail.attach(MIMEText(reviewerMailText, "html"))
                    msgBody = mail.as_string()
                    mailServer.sendmail('lib-dachs-team@cats.uni-heidelberg.de','lib-dachs-team@cats.uni-heidelberg.de', msgBody)
                    mailServer.quit()


            if 'public' in data:
                #if self.access.is_superuser() and data.get('notify'):
                #    pass
                collection.set_public(data['public'])

            if 'public_index' in data:
                collection.set_bool_prop('public_index', data['public_index'])

            collection.mark_updated()
            return {'collection': collection.serialize()}
        @self.app.post('/api/v1/collection/<coll_name>/appropriateurl')
        def dat_do_share(coll_name):
            user, collection = self.load_user_coll(coll_name=coll_name)
            print(user)
            # BETA only
            self.require_admin_beta_access(collection)

            try:
                data = request.json or {}
                print(data)

                if 'url' in data:
                    collection['url'] = data['url']
                    result = {'collection': collection.serialize()}
            except Exception as e:
                result = {'error': 'api_error', 'details': str(e)}

            if 'error' in result:
                self._raise_error(400, result['error'])

            return result



        @self.app.get('/api/v1/collection/<coll_name>/page_bookmarks')
        @self.api(query=['user'],
                  resp='bookmarks')
        def get_page_bookmarks(coll_name):
            user, collection = self.load_user_coll(coll_name=coll_name)

            rec = request.query.get('rec')
            if rec:
                recording = collection.get_recording(rec)
                if not recording:
                    return {'page_bookmarks': {}}

                rec_pages = collection.list_rec_pages(recording)
            else:
                rec_pages = None

            return {'page_bookmarks': collection.get_all_page_bookmarks(rec_pages)}

        # DAT
        @self.app.post('/api/v1/collection/<coll_name>/dat/share')
        def dat_do_share(coll_name):
            user, collection = self.load_user_coll(coll_name=coll_name)
            print(user)
            # BETA only
            self.require_admin_beta_access(collection)

            try:
                data = request.json or {}
                print(data)
                result = DatShare.dat_share.share(collection, data.get('always_update', False))
            except Exception as e:
                result = {'error': 'api_error', 'details': str(e)}

            if 'error' in result:
                self._raise_error(400, result['error'])

            return result

        @self.app.post('/api/v1/collection/<coll_name>/dat/unshare')
        def dat_do_unshare(coll_name):
            user, collection = self.load_user_coll(coll_name=coll_name)

            # BETA only
            self.require_admin_beta_access(collection)

            try:
                result = DatShare.dat_share.unshare(collection)
            except Exception as e:
                result = {'error': 'api_error', 'details': str(e)}

            if 'error' in result:
                self._raise_error(400, result['error'])

            return result


        @self.app.post('/api/v1/collection/<coll_name>/sendmeta')
        @self.api(query=['user'],
                  resp='reviewed')
        def send_meta(coll_name):
            user, collection = self.load_user_coll(coll_name=coll_name)
            # Serializing json
            json_object = json.dumps(collection, indent = 4)
            print(json_object)
            # Writing to sample.json
            with open("sample.json", "w") as outfile:
                outfile.write(json_object)

        @self.app.post('/api/v1/collection/<coll_name>/commit')
        def commit_file(coll_name):
            user, collection = self.load_user_coll(coll_name=coll_name)

            self.access.assert_can_admin_coll(collection)

            data = request.json or {}

            res = collection.commit_all(data.get('commit_id'))
            if not res:
                return {'success': True}
            else:
                return {'commit_id': res}

        # LEGACY ENDPOINTS (to remove)
        # Collection view (all recordings)
        @self.app.get(['/<user>/<coll_name>', '/<user>/<coll_name>/'])
        @self.jinja2_view('collection_info.html')
        def coll_info(user, coll_name):
            return self.get_collection_info_for_view(user, coll_name)

        @self.app.get(['/<user>/<coll_name>/<rec_list:re:([\w,-]+)>', '/<user>/<coll_name>/<rec_list:re:([\w,-]+)>/'])
        @self.jinja2_view('collection_info.html')
        def coll_info(user, coll_name, rec_list):
            #rec_list = [self.sanitize_title(title) for title in rec_list.split(',')]
            return self.get_collection_info_for_view(user, coll_name)

        wr_api_spec.set_curr_tag(None)

    def get_collection_info_for_view(self, user, coll_name):
        self.redir_host()

        result = self.get_collection_info(coll_name, user=user, include_pages=True)

        result['coll'] = result['collection']['id']
        result['coll_name'] = result['coll']
        result['coll_title'] = quote(result['collection']['title'])

        #if not result or result.get('error'):
        #    self._raise_error(404, 'Collection not found')

        return result

    def get_collection_info(self, coll_name, user=None, include_pages=False):
        user, collection = self.load_user_coll(user=user, coll_name=coll_name)

        result = {'collection': collection.serialize(include_rec_pages=include_pages,
                                                     include_lists=True,
                                                     include_recordings=True,
                                                     include_pages=True,
                                                     check_slug=coll_name)}

        result['user'] = user.my_id
        result['size_remaining'] = user.get_size_remaining()

        return result
