import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { apiFeedbackSubmit } from '../lookup';
import { errorHandler, FormCheckbox } from '../utils';
import { useState } from 'react';

interface ReportModalProps {
  isOpen: boolean;
  close(): void;
  defaultSubject?: string;
};
export default function ReportModal({ isOpen, close, defaultSubject }: ReportModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const reportHandler = event => {
    setIsLoading(true);
    event.preventDefault();
    const form = event.target;

    // Legal = 11; not legal = 10
    let urgency = 0;
    switch (form.reason.value) {
      case 'INAPPROPRIATE': urgency = 11; break;
      case 'CHEATING': urgency = 10; break;
      case 'PII': urgency = 11; break;
      case 'SPAM': urgency = 10; break;
      case 'TOS': urgency = 11; break;
      case 'RIGHTS': urgency = 11; break;
      default: break;
    }

    apiFeedbackSubmit(
      `${form.subject.value} - ${form.reason.value}`,
      form.description.value,
      form.reason.value,
      urgency,
      '',
      true,
      urgency === 11,
      (response, status) => {
        if (status === 201) {
          window.alert('Alu has received your report and will review it shortly');
          close();
        } else {
          // Error creating report
          errorHandler(response, status, 4000);
        }
        setIsLoading(false);
      },
    )
  }

  return (
    <Modal show={isOpen} onHide={close}>
      <Modal.Header>
        <Modal.Title>
          Report Content
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={reportHandler}>
        <Modal.Body>
          <Form.Group>
            <Form.Label>
              Subject
            </Form.Label>
            <Form.Control
              type='text'
              name='subject'
              defaultValue={defaultSubject}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Reason</Form.Label>
            <Form.Control
              as='select'
              name='reason'
              custom
            >
              <option value='INAPPROPRIATE'>Contains inappropriate, violent, or hateful content</option>
              <option value='CHEATING'>Being used to cheat or violate academic integrity (test answers)</option>
              <option value='PII'>Contains personal information about me or another user</option>
              <option value='SPAM'>Spam</option>
              <option value='TOS'>Violates Alu's Terms of Service</option>
              <option value='RIGHTS'>Violates my intellectual property rights, or other rights</option>
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>
              Description (optional)
            </Form.Label>
            <Form.Control
              as='textarea'
              name='description'
            />
          </Form.Group>
          <Form.Group>
            <FormCheckbox id='register-accept-tos' required>
              I accept Alu's <a href='/legal/tos/' target='_blank'>
              Terms of Service</a> and{' '}
              <a href='/legal/privacypolicy/' target='_blank'>
              Privacy Policy</a>.
            </FormCheckbox>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button type='submit' variant='danger' block>
            {isLoading ? 'Reporting...' : 'Report'}
          </Button>
          <small>Alu will review your report and take any action required to ensure compliance with the ToS and applicable law</small>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
