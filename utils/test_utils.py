import time
from typing import Callable, List
import selenium

from django.contrib.auth import get_user_model
from django.core.handlers.wsgi import WSGIRequest
from django.db.models import Model
from django.test import TestCase
from django.test.testcases import LiveServerTestCase
from django.test.utils import override_settings
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory, force_authenticate
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException

from alu.settings import env_vars

User = get_user_model()


class ImprovedTestCase(TestCase):
    def setUp(self):
        # Create random users
        self.num_users = 5
        self.users = []  # type: List[User]
        for i in range(self.num_users):
            user = User.objects.create_user(
                username=f'user{i}',
                password='password',
                first_name='Agent',
                last_name='Smith',
                email=f'agent{i}@smith.com',
            )
            self.users.append(user)
        self.user = self.users[0]

        self.factory = APIRequestFactory()

    def post_response(
        self,
        path: str,
        view: Callable[[WSGIRequest], Response],
        data: dict = None,
        user: User = None,
        is_anon: bool = False,
        kwargs: dict = {},
    ) -> Response:
        request = self.factory.post(path, data, format='json')
        if not is_anon:
            force_authenticate(request, user=user or self.users[0])
        response = view(request, **kwargs)

        return response

    def get_response(
        self,
        path: str,
        view: Callable[[WSGIRequest], Response],
        user: User = None,
        is_anon: bool = False,
        kwargs: dict = {},
    ) -> Response:
        request = self.factory.get(path)
        if not is_anon:
            force_authenticate(request, user=user or self.users[0])
        response = view(request, **kwargs)

        return response


@override_settings(DEFAULT_AUTHENTICATION_CLASSES=[])
class SeleniumTestCase(LiveServerTestCase):
    def setUp(self):
        # Create random users
        self.num_users = 5
        self.users = []  # type: List[User]
        for i in range(self.num_users):
            user = User.objects.create_user(
                username=f'user{i}',
                password='password',
                first_name='Agent',
                last_name='Smith',
                email=f'agent{i}@smith.com',
            )
            user.confirm_email(user.confirmation_key)
            self.users.append(user)
        self.user = self.users[0]

        self.factory = APIRequestFactory()

        # Setup selenium
        options = webdriver.ChromeOptions()
        options.add_argument('--start-maximized')

        self.driver = webdriver.Chrome(
            executable_path=env_vars['DRIVER_EXECUTABLE_PATH'],
            options=options,
        )
        self.driver.implicitly_wait(3)

    def tearDown(self):
        self.driver.quit()

    def common_login(self):
        # Open page
        self.driver.get(self.live_server_url)

        # Login
        self.driver.find_element_by_id('login-navbar-btn').click()
        self.fill_text_element('loginUsername', self.user.username)
        self.fill_text_element('loginPassword', 'password')
        self.driver.find_element_by_id('login-btn').click()
        self.sleep(3)

        # Assert logged in
        self.assertIn('Home', self.driver.title)

    def find_element_by_text(self, text: str, class_name: str = None):
        if class_name:
            return self.driver.find_element_by_xpath(
                f'//*[contains(text(),"{text}") and contains(@class,"{class_name}")]'
            )
        else:
            return self.driver.find_element_by_xpath(
                f'//*[contains(text(),"{text}")]'
            )

    def assertTextExists(self, text: str, class_name: str = None):
        try:
            self.find_element_by_text(text, class_name=class_name)
        except NoSuchElementException:
            self.fail(f'Could not find the text "{text}" in the webpage')

    def assertTextNotExists(self, text: str, class_name: str = None):
        try:
            if len(self.find_element_by_text(text, class_name=class_name).text) > 0:
                self.fail(f'Unexpectedly found the text "{text}" in the webpage')
        except NoSuchElementException:
            pass

    def assertTextInTitle(self, text: str):
        self.assertIn(text, self.driver.title)

    def sleep(self, seconds: int):
        time.sleep(seconds)

    def fill_text_element(self, name: str, text: str):
        el = self.driver.find_element_by_name(name)
        try:
            el.clear()
        except selenium.common.exceptions.InvalidElementStateException:
            pass

        el.send_keys(text)

        return el

    def click_option(self, option_value: str):
        self.driver.find_element_by_xpath(f'//option[@value="{option_value}"]').click()

    def click_button(self, /, html_id=None, html_class=None, html_name=None):
        if html_id is None and html_class is None and html_name is None:
            raise ValueError('You must either specify html_id, html_class, or html_name')

        if html_id:
            self.driver.find_element_by_id(html_id).click()
        elif html_class:
            self.driver.find_element_by_class_name(html_class).click()
        elif html_name:
            self.driver.find_element_by_name(html_name).click()
        else:
            raise ValueError('You must have at least one truthy input')

    def new_login(self, username: str):
        self.driver.find_element_by_id('profile-dropdown').click()
        self.driver.find_element_by_id('logout-option').click()
        self.sleep(0.5)
        self.fill_text_element('loginUsername', username)
        self.fill_text_element('loginPassword', 'password')
        self.driver.find_element_by_id('login-btn').click()
        self.sleep(0.3)

    def assert_for_n_seconds(
        self,
        assertion: Callable[[], bool],
        n_seconds: int = 10,
        interval: int = 1,
        precall: Callable[[], any] = None,
    ):
        asserted = False
        for _ in range(n_seconds // interval):
            if precall:
                precall()

            if assertion():
                asserted = True
                break

            self.sleep(interval)

        self.assertTrue(asserted)

    def click_el(self, el_id: str):
        self.driver.find_element_by_id(el_id).click()

    def submit_form(self):
        self.driver.find_element_by_xpath('//button[@type=\'submit\']').click()

    def deselect_all(self):
        self.driver.find_element_by_xpath('//body').click()
