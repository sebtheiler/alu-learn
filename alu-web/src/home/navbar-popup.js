import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { apiProfileReadPopup } from '../lookup';
import { errorHandler } from '../utils';
import { UserCustomization } from './customization';

export function NavbarPopup(props) {
  const {showUpdateModal, firstName} = props;
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
        <h1>New Update</h1>
        <h3>Personalizing Alu &amp; Better Study Habits</h3>
        <p>Keeping to study habits is difficult.  This update seeks to make it easier.</p>
        <p>When users join Alu, they are now asked to answer a few questions to help personalize Alu to them.  These questions include topics such as &quot;How much time would you like to spend studying per day?&quot;  If you already have an Alu account, you can manually change these settings <a href="/settings/">here</a>, or in the form below.</p>
        <hr />
        <UserCustomization />
        <hr />
        <br />
        <p>Ever forget to study one day?  You now have the option of enabling reminder emails.  These reminder emails are sent every day at 6 PM if you have a streak and haven&#39;t studied yet.  Reminder emails can help you build study habits and continue using Alu.  If you don&#39;t like the reminder emails, you can always disable them in settings.</p>
        <ul>
        <li><strong>Reminder Emails:</strong> Reminder emails can be enabled in settings and will be sent to you at 6 PM every night if you haven&#39;t studied that day.</li>
        <li><strong>Study Goals:</strong> When creating an Alu account or in settings, you can now specify how long you would like to spend studying.  Creating specific goals will help motivate you to continue studying.  In the future, Alu will automatically attempt to level out the number of cards you do every night to reach your study goal.</li>
        <li><strong>Teacher/Student:</strong> You can now specify whether you are a teacher/parent or a student/learner.  In the future, this will be used to further personalize Alu, with features such as the ability to create classes of students.</li>
        <li><strong>Improved Page Loading:</strong> There will no longer be a brief instant where the page style hasn&#39;t loaded.  This will remove the annoying black box that occurred when reloading the home page.</li>
        <li><strong>Changed Page Title:</strong> All instances of &quot;Alu Flashcards&quot; have now been updated to &quot;Alu Learn.&quot;</li>
        <li><strong>Improved Filtered Decks:</strong> You can now specify a title when creating filtered decks.  Furthermore, the attribute of which decks to take flashcards from now correctly works and is editable through the deck edit modal.  There is now an expandable section for changing search sections, making it less overwhelming to view.  A bug that stopped &quot;Daily New Card Limit&quot; and &quot;Shuffle Unseen Cards&quot; from properly working in CSSMs has also been fixed.</li>
        <li><strong>Added Changelog Popup:</strong> Users will now be greeted with a popup alerting them of new changes when they log in for the first time following an update (like the one you are reading right now).</li>
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={closeModal} block>Got it!</Button>
      </Modal.Footer>
    </Modal>
  );
}