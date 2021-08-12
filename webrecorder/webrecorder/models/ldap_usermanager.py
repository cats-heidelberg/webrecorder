from webrecorder.models.usermanager import UserManager
from webrecorder.models.base import BaseAccess
from bottle import request
import ldap
import os
from webrecorder.models.user import User, UserTable
from datetime import datetime

# ============================================================================
class LdapUserManager(UserManager):
    def __init__(self, redis, cork, config):
        super().__init__(redis, cork, config)
        self.admin_override = False
        try:
            self.redis.hsetnx('h:defaults', 'max_size', int(config['default_max_size']))
            self.redis.hsetnx('h:defaults', 'max_anon_size', int(config['default_max_anon_size']))
        except Exception as e:
            print('WARNING: Unable to init defaults: ' + str(e))

        self.all_users = UserTable(self.redis, self._get_access)


    def _get_access(self):
        if self.admin_override:
            self.admin_override = False
            return BaseAccess()
        else:
            return request['webrec.access']
    def get_authenticated_user(self, username, password):
        """Returns the user matching the supplied username and password otherwise
        returns None

        :param str username: The username of the user
        :param str password: The users password
        :return: The authenticated user
        :rtype: User|None
        """
        ldap_username = username + '@' + os.environ.get('LDAP_DOMAIN')
        print('ldapusermanager authenticating {}'.format(ldap_username))
        c = ldap.initialize(os.environ.get('LDAP_URI', ''))

        c.protocol_version = 3
        c.set_option(ldap.OPT_REFERRALS, 0)
        try:
            result = c.simple_bind_s(ldap_username, password)
            adminusers = c.search_s(os.environ.get('LDAP_BASE'), ldap.SCOPE_SUBTREE, '(&(sAMAccountName={})(memberOf={}))'.format(username, os.environ.get('LDAP_ADMIN_GROUP')))
            loginusers = c.search_s(os.environ.get('LDAP_BASE'), ldap.SCOPE_SUBTREE, '(&(sAMAccountName={})(memberOf={}))'.format(username, os.environ.get('LDAP_LOGIN_GROUP')))
            is_admin = len([dn for (dn, attrs) in adminusers if dn]) == 1
            can_login = len([dn for (dn, attrs) in loginusers if dn]) == 1

            escaped_username = username.replace(".", "_")

            if not can_login:
                return None

            try:
                self.cork.is_authenticate(escaped_username, password)
                self.admin_override = True
                self.all_users[escaped_username] = {
                    'role': 'admin' if is_admin else 'archivist',
                    'hash': self.cork._hash(escaped_username, password).decode('ascii'),
                    'email_addr': "NYI",
                    'full_name': username,
                    'creation_date': str(datetime.utcnow()),
                    'last_login': str(datetime.utcnow()),
                }
                return self.all_users[escaped_username]
            except Exception as e:
                print("user not found, exception was:")
                print(e)

            print('creating internal user')
            self.admin_override = True
            self.all_users[escaped_username] = {
                'role': 'admin' if is_admin else 'archivist',
                'hash': self.cork._hash(escaped_username, password).decode('ascii'),
                'email_addr': "NYI",
                'full_name': username,
                'creation_date': str(datetime.utcnow()),
                'last_login': str(datetime.utcnow()),
            }
            self.admin_override = True
            self.create_new_user(escaped_username)

            print('created internal user: {}'.format(self.all_users[escaped_username]))
            self.admin_override = False
            self.cork.is_authenticate(escaped_username, password)
            return self.all_users[escaped_username]
        except Exception as e:
            print('ldap auth failed. falling back to internal auth. Exception: {}'.format(e))
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
