import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { apiProfileReadPopup } from '../lookup';
import { errorHandler } from '../utils';

export function NavbarPopup({ showUpdateModal, firstName }) {
  const [isOpen, setIsOpen] = useState(showUpdateModal);
  const closeModal = () => {
    apiProfileReadPopup((response,  status) => {
      if (status === 200) {
        // pass
      } else {
        // Error marking the profile popup as read
        errorHandler(response, status, 3022);
      }
    });
    setIsOpen(false);
  }

  if (!showUpdateModal) return null;
  return (
    <Modal show={isOpen} onHide={closeModal} size='xl'>
      <Modal.Header>
        <Modal.Title>{firstName ? `Welcome Back, ${firstName}!` : 'New Changes'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h1 id="less-stress-apr-05-0-6-0">Less Stress - Apr 05 - 0.6.0</h1>
        <p>Alu v0.6 is all about making studying easier, more enjoyable, and less stressful.  The next major version, v0.7, will be released sometime in April with massive changes to studying.  Until v0.7 is released, v0.6 will release a bunch of tiny and iterative changes improving studying.</p>
        <p>In this update, I&#39;ve added settings for controlling how many flashcards you see per day in assignments.  You can access these settings by clicking the cog/gear icon next to the class you want to edit.  If the amount of flashcards Alu gives you feels overwhelming, you can decrease the number of new flashcards per day, the maximum number of old flashcards per day, or change the deck to a simpler difficulty.</p>
        <p>This update also adds &quot;quick feedback questions.&quot;  Occasionally, you will find quick questions on the top of your homepage so that you can provide quick and easy feedback about Alu.</p>
        <ul>
        <li><strong>Added Settings for Classroom Studying:</strong> You can now control the specifics of how many flashcards are shown to you when studying assignments for a classroom.  You can access these options by clicking the cog/gear icon next to the classroom title.  If you&#39;re feeling overwhelmed, lowering these values will make Alu give you fewer flashcards.  This feature was previously limited to just decks but has no been expanded to classrooms as well.<ul>
        <li><strong>Rearranged Deck-like Options:</strong> The &quot;advanced options&quot; are now hidden by default when editing deck-likes to make it less confusing for new users.</li>
        <li><strong>Added Option to Control Max Seen Flashcards per Day:</strong> When editing decks/assignments/custom-studies, you can now change the maximum number of previously seen flashcards per day.  It defaults to 200, which is probably right for most people, but you can lower it if you have too many flashcards to review and get overwhelmed or increase it if you want to memorize with Alu better.</li>
        <li><strong>Added Tooltips When Editing Decks:</strong> There are now tooltips explaining all of the advanced options when editing a deck.</li>
        </ul>
        </li>
        <li><strong>Fixed Tiny Studying Bug:</strong> Fixed a slightly ridiculous bug that allowed you to press &quot;zero&quot; on your keyboard as a valid response when rating your performance on a flashcard instead of the usual 1, 2, 3, and 4.</li>
        <li><strong>Changed Reminder Email:</strong> The reminder email&#39;s wording was a bit annoying, so I changed it.</li>
        <li><strong>Fixed Streak Icon For Long Streaks:</strong> The icon for displaying your streak was overflown if you had a streak greater than 100.  It&#39;s now fixed to dynamically make the text smaller if your streak gets longer than 100.  It&#39;ll break again if anyone&#39;s streak surpasses 1,000, but I should have at least 2.5 years to fix that.</li>
        <li><strong>Added JSON Importing/Exporting:</strong> Added the ability to export decks to downloadable JSON files and then import those JSON files back into useable decks.  This probably won&#39;t be a very widely used feature, but it is useful in some situations, and I need it for prototyping the next big update...</li>
        <li><strong>Added Quick Feedback Questions:</strong> There will sometimes be quick questions on the top of your homepage designed to get feedback about a feature in Alu.  These are entirely optional, but I would really appreciate it if you could fill them out to help guide Alu&#39;s future development.</li>
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={closeModal} block>Got it!</Button>
      </Modal.Footer>
    </Modal>
  );
}