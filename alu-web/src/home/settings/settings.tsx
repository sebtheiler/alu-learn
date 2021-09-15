import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { apiProfileDetail, apiProfileSettingsUpdate } from '../../lookup';
import { UserLink } from '../../profiles';
import { Profile } from '../../profiles/types';
import { errorHandler, FormCheckbox, QuestionBubble, useApiObjectHook } from '../../utils';
import './settings.css';

export function SettingsPage({ username }) {
  const [profile] = useApiObjectHook<Profile>(apiProfileDetail, 200, 3015, [username]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    apiProfileSettingsUpdate(
      {
        send_reminders: form.elements.sendReminders?.checked,
        user_type: form.elements.userType?.value,
        target_num_cards: form.elements.targetNumCards?.value,
        is_opted_dev: form.elements.isOptedDev?.checked,
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
        <UserLink user={profile} showAllBadges noLink />
        <br />
        <p>
          Your email (hover to view): <span className='hidden-email'>{profile.email}</span><br />
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
      <Form.Label as='h3'>Misc.</Form.Label>
      <Form.Group>
        <FormCheckbox name='sendReminders' defaultChecked={profile.settings.send_reminders}>
          Send Email Reminders at 6PM if you haven't studied yet
        </FormCheckbox>
      </Form.Group>
      <Form.Group>
        <Form.Label>Target Number of Flashcards Per Day</Form.Label>
        <Form.Control
          type='number'
          name='targetNumCards'
          defaultValue={profile.settings.target_num_cards}
          min={5}
          max={200}
          step={5}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>User Type</Form.Label>
        <Form.Control
          as='select'
          name='userType'
          defaultValue={profile.settings.user_type}
          custom
        >
          <option value='STUDENT'>Student/Learner</option>
          <option value='TEACHER'>Teacher/Parent</option>
        </Form.Control>
      </Form.Group>
      <Form.Group>
        <FormCheckbox name='isOptedDev' defaultChecked={profile.settings.is_opted_dev}>
          Opt into development features{' '}
          <QuestionBubble>
            If checked, you will be allowed to access feature still in development.
            These features are the latest Alu offers, but may be unstable.
            No guarantee is made about the stability or safety of development features.
          </QuestionBubble>
        </FormCheckbox>
      </Form.Group>
      <Form.Group>
        <Button type='submit' id='save-changes-btn' block>
          Save Changes
        </Button>
      </Form.Group>
    </Form>
  </>);
}