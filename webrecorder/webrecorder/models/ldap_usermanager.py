from webrecorder.models.usermanager import UserManager
import ldap
import os

# ============================================================================
class LdapUserManager(UserManager):
    def __init__(self, redis, cork, config):
        super(LdapUserManager, self).__init__(redis, cork, config)

    # def register_user(self, input_data, host):
    #     msg = OrderedDict()
    #     redir_extra = ''

    #     username = input_data.get('username', '')
    #     full_name = input_data.get('full_name', '')
    #     email = input_data.get('email', '')

    #     if 'username' not in input_data:
    #         msg['username'] = 'Missing Username'

    #     elif username.startswith(self.temp_prefix):
    #         msg['username'] = 'Sorry, this is not a valid username'

    #     if 'email' not in input_data:
    #         msg['email'] = 'Missing Email'

    #     if self.invites_enabled:
    #         try:
    #             val_email = self.is_valid_invite(input_data['invite'])
    #             if val_email != email:
    #                 raise ValidationException('Sorry, this invite can only be used with email: {0}'.format(val_email))
    #         except ValidationException as ve:
    #             msg['invite'] = str(ve)

    #         else:
    #             redir_extra = '?invite=' + input_data.get('invite', '')

    #     try:
    #         self.validate_user(username, email)
    #         self.validate_password(input_data['password'], input_data['confirmpassword'])

    #     except ValidationException as ve:
    #         msg['validation'] = str(ve)

    #     try:
    #         move_info = self.get_move_temp_info(input_data)
    #     except ValidationException as ve:
    #         msg['move_info'] = str(ve)

    #     if msg:
    #         return msg, redir_extra


    #     try:
    #         desc = {'name': full_name}

    #         if move_info:
    #             desc['move_info'] = move_info

    #         desc = json.dumps(desc)

    #         self.cork.register(username, input_data['password'], email, role='archivist',
    #                       max_level=50,
    #                       subject='webrecorder.io Account Creation',
    #                       email_template='webrecorder/templates/emailconfirm.html',
    #                       description=desc,
    #                       host=host)

    #         # add to announce list if user opted in
    #         if input_data.get('announce_mailer') and self.announce_list:
    #             self.add_to_mailing_list(username, email, full_name,
    #                                      list_endpoint=self.announce_list)

    #         if self.invites_enabled:
    #             self.delete_invite(email)

    #         # extend session for upto 90 mins to store data to be migrated
    #         # to allow time for user to validate registration
    #         if move_info:
    #             self.get_session().save()

    #     except ValidationException as ve:
    #         msg['validation'] = str(ve)

    #     except Exception as ex:
    #         import traceback
    #         traceback.print_exc()
    #         msg['other_error'] = 'Registration failed: ' + str(ex)

    #     if not msg:
    #         msg['success'] = ('A confirmation e-mail has been sent to <b>{0}</b>. ' +
    #                           'Please check your e-mail to complete the registration!').format(username)

    #     return msg, redir_extra


    def get_authenticated_user(self, username, password):
        """Returns the user matching the supplied username and password otherwise
        returns None

        :param str username: The username of the user
        :param str password: The users password
        :return: The authenticated user
        :rtype: User|None
        """
        print('ldapusermanager authenticating {}'.format(username))
        c = ldap.initialize(os.environ.get('LDAP_URI', ''))
        c.protocol_version = 3
        c.set_option(ldap.OPT_REFERRALS, 0)

        try:
            result = c.simple_bind_s(username, password)
            print('ldapusermanager auth result: {}'.format(result))
            print('creating internal user')
            UserManager.all_users[username] = {
                'role': 'archivist',
                'hash': None,
                'email_addr': "NYI",
                'full_name': username,
                'creation_date': str(datetime.utcnow()),
                'last_login': str(datetime.utcnow()),
            }
            print('created internal user: {}'.format(UserManager.all_users[username]))
            UserManager.create_new_user(username, {'email': 'NYI', 'name': username })
            return UserManager.all_users[username]
        except:
            print('ldap auth failed. falling back to internal auth')
            # fallback to internal auth
            if not self.cork.is_authenticate(username, password):
                username = self.find_case_insensitive_username(username)
                if not username or not self.cork.is_authenticate(username, password):
                    return None
            return self.all_users[username]
        finally:
            c.unbind_s()




    def update_password(self, curr_password, password, confirm):
        return NotImplementedError
    def reset_password(self, password, confirm, resetcode):
        return NotImplementedError

    def create_user_as_admin(self, email, username, passwd, passwd2, role, name):
        """Create a new user with command line arguments or series of prompts,
           preforming basic validation
        """
        self.access.assert_is_superuser()

        errs = []

        # EMAIL
        # validate email
        if not re.match(self.EMAIL_RX, email):
            errs.append('valid email required!')

        if email in [data['email_addr'] for u, data in self.all_users.items()]:
            errs.append('A user already exists with {0} email!'.format(email))

        # USERNAME
        # validate username
        if not username:
            errs.append('please specify a username!')

        if not self.is_username_available(username):
            errs.append('Invalid username.')

        # ROLE
        if role not in self.get_roles():
            errs.append('Not a valid role.')

        # PASSWD
        if passwd != passwd2 or not self.PASS_RX.match(passwd):
            errs.append('Passwords must match and be at least 8 characters long '
                        'with lowercase, uppercase, and either digits or symbols.')

        if errs:
            return errs, None

        # add user to cork
        #self.cork._store.users[username] = {
        self.all_users[username] = {
            'role': role,
            'hash': self.cork._hash(username, passwd).decode('ascii'),
            'email_addr': email,
            'full_name': name,
            'creation_date': str(datetime.utcnow()),
            'last_login': str(datetime.utcnow()),
        }
        #self.cork._store.save_users()

        return None, self.create_new_user(username, {'email': email,
                                                     'name': name})

    def update_user_as_admin(self, user, data):
        """ Update any property on specified user
        For admin-only
        """
        self.access.assert_is_curr_user(user)

        errs = []

        if not data:
            errs.append('Nothing To Update')

        if 'role' in data and data['role'] not in self.get_roles():
            errs.append('Not a valid role.')

        if 'max_size' in data and not isinstance(data['max_size'], int):
            errs.append('max_size must be an int')

        if errs:
            return errs

        if 'name' in data:
            #user['desc'] = '{{"name":"{name}"}}'.format(name=data.get('name', ''))
            user['name'] = data.get('name', '')

        if 'desc' in data:
            user['desc'] = data['desc']

        if 'max_size' in data:
            user['max_size'] = data['max_size']

        if 'role' in data:
            user['role'] = data['role']

        if 'customer_id' in data:
            user['customer_id'] = data['customer_id']

        if 'customer_max_size' in data:
            user['customer_max_size'] = data['customer_max_size']

        return None
