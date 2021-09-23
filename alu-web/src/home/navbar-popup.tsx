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
    <Modal show={isOpen} onHide={closeModal}>
      <Modal.Header>
        <Modal.Title>{firstName ? `Welcome Back, ${firstName}!` : 'New Changes'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h1 id='skill-tree-sep-17-1.0.0'>Skill Tree - Sep 21 - 1.0.0</h1>
        <p>I&#39;ve completely revamped Alu in this update, redoing the way that decks are organized and the way you study them.</p>
        <p>Decks are now organized into <strong>skill trees</strong> which contain sections for each unit.  Each section contains sub sections, which correspond to different sub units.  You can study and view flashcards for each section and sub section individually, giving you more control over how you study your deck.  Each section also has a &quot;percent-complete&quot; indicator that shows you how much of that section Alu estimates you have memorized.</p>
        <p>I&#39;ve also completely changed the way that studying works: instead of studying all the flashcards due for a deck at once, studying is now broken up into digestible <strong>bites</strong> of 20 flashcards at a time.  With this new method of studying, you can now study in small bits multiple times, rather than having to review a huge number of flashcards in a single sitting.  At the end of every study session, you can see an increase in the number of flashcards you&#39;ve done that day as you work towards your new, customizable <strong>daily goal</strong>.</p>
        <p>To accomodate for these huge changes, I&#39;ve completely redesigned Alu&#39;s home page.  You will now have a list of your decks and classes on the left-hand side, rather than them being isolated in a different page.  On the right-hand side, you will see your specified daily goal and how much progress you&#39;ve made towards reaching it.</p>
        <p>Last (and probably least), the navbar is black instead of blue.</p>
        <p>Other changes:</p>
        <ul>
          <li><strong>Revamped flashcard fields:</strong>  Flashcards have been redesigned to be faster to load and easier for me to develop.</li>
          <li><strong>Revamped deck editing:</strong>  Removed all the arbitrary options from deck editing and streamlined the process of both editing and creating new decks.</li>
          <li><strong>Removed Notes and Tasks:</strong>  It&#39;s sad, but no one ever used either and they were always broken.  Farewell notes!  Tasks <em>might</em> come back in some form in the future, but don&#39;t count on it.</li>
          <li><strong>Removed notification about login:</strong>  It was literally just spam.  In the future, notifications will be reserved for more important things.</li>
        </ul>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={closeModal} block>Got it!</Button>
      </Modal.Footer>
    </Modal>
  );
}