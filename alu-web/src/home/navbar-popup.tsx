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
        <h1>New Update</h1>
        <h2>Classrooms Rework &amp; Homepage Redesign - Mar 01 - 0.5.0</h2>
        <p>Welcome to Alu's biggest update since launch! In this update, you will find a completely redesigned homepage and the new assignments feature.</p>
        <p>Having teachers suspend flashcards to assign you work didn't cut it: it was too unwieldy and annoying to both students and teachers. This feature has been removed and replaced with the ability to add assignments. You can find assignments on your redesigned homepage, where you can also track your progress as you complete them. Teachers can easily create assignments from a simple tag query.</p>
        <ul>
          <li>Redesigned Homepage: I've completely redesigned the homepage to incorporate the new assignments feature. In the center of your screen, you will see a list of the classes you are enrolled in and the assignments you have for those classes. You can click an assignment to start studying it. You can access the old decks/notes/tasks homepages by clicking their respective links on the left column.</li>
          <li>Added Assignments to Classrooms: Before, teachers would have to suspend individual flashcards to assign units to you. This was annoying and inconvenient for both teachers and students. Now, teachers can create an assignment based on a tag query that you will see on your redesigned homepage. Furthermore, as you complete the assignment, you will see your percent complete continually update.</li>
          <li>Major Code Improvements: A lot of Alu's backend code has been rewritten to be more efficient and more maintainable. This will mean faster loading times and an even quicker rate of updates.</li>
          <ul>
            <li>Improved Shared Deck Code: The code for shared decks and their functions (creating, copying, updating) is in the middle of being completely rewritten. Creating and copying is much more efficient now, and operations that took up to 10 seconds before should now be completed in less than a single second. Despite this, pulling updates is still disabled until it can be further tested.</li>
            <li>Code Tests: I've added over 90 code tests using over 1000 assertments in almost 4500 lines of code. Code tests are bits of code designed to make sure that Alu is working as intended and there aren't any bugs. As I maintain and expand upon these code tests, any slight bugs remaining in Alu will be squashed as quickly as possible.</li>
          </ul>
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={closeModal} block>Got it!</Button>
      </Modal.Footer>
    </Modal>
  );
}