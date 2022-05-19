import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import TZSelect from '../../utils/timezone';
import { Profile } from '../../profiles/types';
import { UserLink } from '../../profiles';
import { apiProfileDetail, apiProfileSettingsUpdate } from '../../lookup';
import { errorHandler, FormCheckbox } from '../../utils';
import { useAsyncState } from '../../lookup/lookup';
import './settings.css';

export function SettingsPage({ username }) {
  const [profile] = useAsyncState<Profile>(apiProfileDetail, [username]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    apiProfileSettingsUpdate(
      {
        send_reminders: form.elements.sendReminders.checked,
        user_type: form.elements.userType.value,
        target_num_cards: form.elements.targetNumCards.value,
        timezone: form.elements.timezone.value,
        send_marketing_research: form.elements.sendMarketingResearch.checked,
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

  if (!profile) return <p>Loading...</p>
  return (<Container className='mt-5'>
    <h1 className='text-center'>Settings</h1>
    <p className='text-center'>
      Make sure to save your changes by clicking "Save Changes" at the bottom.
    </p>
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <h3>Account and Security</h3>
        <UserLink user={profile} showAllBadges noLink />
        {/* <br /> */}
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
          required
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
          <option value='STUDENT'>Student</option>
          <option value='TEACHER'>Teacher</option>
          <option value='MIXED'>Mixed (can create and join classrooms)</option>
        </Form.Control>
      </Form.Group>
      <Form.Group>
        <Form.Label>Timezone (for resetting flashcards daily)</Form.Label>
        <TZSelect />
      </Form.Group>
      <Form.Group>
        <FormCheckbox name='sendMarketingResearch' defaultChecked={profile.settings.send_marketing_research}>
          Send marketing research emails (e.g., feedback surveys).  No spam!
        </FormCheckbox>
      </Form.Group>
      <Form.Group>
        <Button type='submit' id='save-changes-btn' block>
          Save Changes
        </Button>
      </Form.Group>
    </Form>
  </Container>);
}
