import time
from typing import Callable, List
import selenium

from django.contrib.auth import get_user_model
from django.core.handlers.wsgi import WSGIRequest
from django.test import TestCase
from django.test.testcases import LiveServerTestCase
from django.test.utils import override_settings
from rest_framework.response import Response
from rest_framework.test import APIRequestFactory, force_authenticate
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException

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
            executable_path='/media/evolvedsquid/2.0 TB HDD/code/in-progress/alu/chromedriver',
            options=options,
        )
        self.driver.implicitly_wait(3)

    def tearDown(self):
        self.driver.quit()

    def common_login(self):
        # Open page
        self.driver.get(self.live_server_url)

        # Hide DJDT
        djdt_xpath = '//*[@id="djHideToolBarButton"]'
        self.driver.find_element_by_xpath(djdt_xpath).click()

        # Login
        login_nav_button_xpath = '//*[@id="responsive-navbar-nav"]/div[2]/a[2]/button'
        username_xpath = '//*[@id="login-component"]/div/form/div[1]/input'
        password_xpath = '//*[@id="login-component"]/div/form/div[2]/input'
        tos_xpath = '//*[@id="login-component"]/div/form/div[3]/label/input'
        login_button_xpath = '//*[@id="login-component"]/div/form/div[5]/button'

        self.driver.find_element_by_xpath(login_nav_button_xpath).click()
        self.driver.find_element_by_xpath(username_xpath).send_keys(self.user.username)
        self.driver.find_element_by_xpath(password_xpath).send_keys('password')
        self.driver.find_element_by_xpath(tos_xpath).click()
        self.driver.find_element_by_xpath(login_button_xpath).click()
        self.sleep(1)

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
    
    def new_login(self, username: str):
        self.driver.find_element_by_id('profile-dropdown').click()
        self.driver.find_element_by_id('logout-option').click()
        self.sleep(0.5)
        self.fill_text_element('loginUsername', username)
        self.fill_text_element('loginPassword', 'password')
        self.driver.find_element_by_id('accept-tos').click()
        self.driver.find_element_by_id('login-btn').click()
        self.sleep(0.3)
