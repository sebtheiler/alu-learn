import React, { useState } from 'react';
import CreateModal from '../modals/create';

export function CreateDeckButton() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (<>
    <div
      className='deck-selection-item'
      role='button'
      onClick={() => setShowCreateModal(true)}
    >
      <div
        className='deck-selection-main mb-0'
      >
        <span className='mb-0'>Create New Deck</span>
        <span>
          <i className='fas fa-plus fa-2x float-left mt-2 ml-2' />
        </span>
      </div>
    </div>
    <CreateModal
      show={showCreateModal}
      close={() => setShowCreateModal(false)}
    />
  </>);
}
