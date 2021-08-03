import React, { useState } from 'react';
import CreateModal from '../modals/create';

export default function CreateDeckButton() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (<>
    <div className='deck-selection-item mb-5 mt-4'>
      <div
        className='deck-selection-main mb-0'
        role='button'
        onClick={() => setShowCreateModal(true)}
      >
        <p>
          <span className='title-text'>Create New Deck</span>
          <span><i className='fas fa-plus fa-2x float-left mt-2 ml-2' /></span>
        </p>
      </div>
    </div>
    <CreateModal
      show={showCreateModal}
      close={() => setShowCreateModal(false)}
    />
  </>);
}
