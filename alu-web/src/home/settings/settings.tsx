import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { apiProfileDetail, apiProfileSettingsUpdate } from '../../lookup';
import { UserLink } from '../../profiles';
import { Profile } from '../../profiles/types';
import { errorHandler, FormCheckbox, useApiObjectHook } from '../../utils';
import './settings.css';

export function SettingsPage({ username }) {
  const [profile] = useApiObjectHook<Profile>(apiProfileDetail, 200, 3015, [username]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    apiProfileSettingsUpdate(
      {
        // disable_all_tooltips: form.elements.disableTooltips?.checked, // unused
        send_reminders: form.elements.sendReminders?.checked,
        user_type: form.elements.userType?.value,
        ideal_time_per_day: form.elements.timePerDay?.value,
      },
      (response, status) => {
        if (status === 200) {
          window.location.reload();
        } else {
          // Error updating profile
          errorHandler(response, status, 3016);
        }
      },
    );
  }

  if (!profile)
    return <p>Loading...</p>

  return (<>
    <h1 className='text-center mt-5'>Settings</h1>
    <p className='text-center'>
      Make sure to save your changes by clicking "Save Changes" at the bottom.
    </p>
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <h3>Account and Security</h3>
        <UserLink user={profile as Profile} showAllBadges noLink />
        <br />
        <p>
          Your email (hover to view): <span className='hidden-email'>{(profile as Profile).email}</span><br />
        </p>
        <ul>
          <li><a href='/settings/change-email/'>
            Change email
          </a></li>
          <li><a href='/settings/change-password/'>
            Change password
          </a></li>
          <li><a href='/profiles/edit/'>
            Edit your profile
          </a></li>
        </ul>
      </Form.Group>
      {/* <Form.Group>
        <Form.Label as='h3'>Misc.</Form.Label>
        <FormCheckbox name='disableTooltips' defaultChecked={profile.settings.disable_all_tooltips}>
          Disable all tooltips (not recommended for beginners)
        </FormCheckbox>
      </Form.Group> */}
      <Form.Label as='h3'>Misc.</Form.Label>
      <Form.Group>
        <FormCheckbox name='sendReminders' defaultChecked={(profile as Profile).settings.send_reminders}>
          Send Email Reminders at 6PM if you haven't studied yet
        </FormCheckbox>
      </Form.Group>
      <Form.Group>
        <Form.Label>Ideal Time Spent Studying per Day</Form.Label>
        <Form.Control
          as='select'
          name='timePerDay'
          defaultValue={(profile as Profile).settings.ideal_time_per_day}
          custom
        >
          <option value='MAX'>as long as it takes</option>
          <option value='20'>20 minutes</option>
          <option value='15'>15 minutes</option>
          <option value='10'>10 minutes</option>
          <option value='5'>5 minutes</option>
        </Form.Control>
      </Form.Group>
      <Form.Group>
        <Form.Label>User Type</Form.Label>
        <Form.Control
          as='select'
          name='userType'
          defaultValue={(profile as Profile).settings.user_type}
          custom
        >
          <option value='STUDENT'>Student/Learner</option>
          <option value='TEACHER'>Teacher/Parent</option>
        </Form.Control>
      </Form.Group>
      <Form.Group>
        <Button type='submit' id='save-changes-btn' block>
          Save Changes
        </Button>
      </Form.Group>
    </Form>
  </>);
}