import React, {useState, useEffect} from 'react';
import {Button, Form} from 'react-bootstrap';
import { apiProfileDetail, apiProfileSettingsUpdate } from '../../lookup';
import { UserLink } from '../../profiles';
import { errorHandler, FormCheckbox } from '../../utils';

export function SettingsPage(props) {
  const {username} = props;
  const [profile, setProfile] = useState(null);
  const [profileDidSet, setProfileDidSet] = useState(false);

  // Get profile detail
  useEffect(() => {
    if (profileDidSet === false) {
      setProfileDidSet(true);
      apiProfileDetail(username, (response, status) => {
        if (status === 200) {
          setProfile(response);
        } else {
          // Error getting profile in settings
          errorHandler(response, status, 3015);
        };
      });
    };
  }, [username, profile, profileDidSet]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    apiProfileSettingsUpdate(
      form.elements.disableTooltips.checked,
      (response, status) => {
        if (status === 200) {
          window.location.reload();
        } else {
          // Error updating profile
          errorHandler(response, status, 3016);
        };
      },
    );
  };

  if (!profile) {
    return <p>Loading...</p>;
  };

  return (<>
    <h1 className='text-center mt-5'>Settings</h1>
    <p className='text-center'>
      Make sure to save your changes by clicking "Save Changes" at the bottom.
    </p>
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <h3>Account and Security</h3>
        <UserLink user={profile} showAllBadges noLink />
        <br />
        <p>
          Your email: {profile.email_address} <br />
        </p>
        <ul>
          <li><a href='/settings/changeemail/'>
            Change email
          </a></li>
          <li><a href='/settings/changepassword/'>
            Change password
          </a></li>
          <li><a href='/profiles/edit/'>
            Edit your profile
          </a></li>
        </ul>
      </Form.Group>
      <Form.Group>
        <Form.Label as='h3'>Misc.</Form.Label>
        <FormCheckbox name='disableTooltips' defaultChecked={profile.settings.disable_all_tooltips}>
          Disable all tooltips (not recommended for beginners)
        </FormCheckbox>
      </Form.Group>
      <Form.Group>
        <Button type='submit' block>
          Save Changes
        </Button>
      </Form.Group>
    </Form>
  </>);
};