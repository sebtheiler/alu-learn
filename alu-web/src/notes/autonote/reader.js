import React from 'react';
import {Button, ButtonGroup} from 'react-bootstrap';
import './reader.css';

export function AutoReader(props) {
  const {selectedPar, setSelectedPar, updateProgressBar, finished, text, showCompiledNotes, setShowCompiledNotes} = props;

  return (<div className='container mt-5'>
    <h3 className='text-center'>Content</h3>
    <div style={{ border: '1px solid gray', padding: '30px', height: '250px', overflow: 'hidden', borderRadius: '5px' }}>
      {selectedPar !== 0 &&
        <p style={{ color: '#e0e0e0' }} dangerouslySetInnerHTML={{__html:
          `...${text[selectedPar - 1] && text[selectedPar - 1].substr(text[selectedPar - 1].length - 150, text[selectedPar - 1].length)}`
        }} />
      }
      <p style={{ color: '#000000' }} dangerouslySetInnerHTML={{__html: text[selectedPar]}} />
      {selectedPar !== text.length - 1 &&
        <p style={{ color: '#e0e0e0' }} dangerouslySetInnerHTML={{__html:
          `${text[selectedPar + 1] && text[selectedPar + 1].substr(0, 150)}...`
        }} />
      }
    </div>
    <ButtonGroup className='mt-1 float-right'>
      <Button
        variant='secondary'
        disabled={selectedPar === 0}
        onClick={event => {event.preventDefault(); setSelectedPar(selectedPar - 1); updateProgressBar(selectedPar - 1)}}
      >Go Back</Button>
      <Button
        variant='secondary'
        disabled={selectedPar === text.length - 1}
        onClick={event => {event.preventDefault(); setSelectedPar(selectedPar + 1); updateProgressBar(selectedPar + 1)}}
      >Go Forwards</Button>
      <Button
        variant='secondary'
        onClick={event => {event.preventDefault(); setShowCompiledNotes(!showCompiledNotes);}}
        className='ml-1'
      >{showCompiledNotes ? 'Hide' : 'Show'} Compiled Notes</Button>
    </ButtonGroup>
    {!finished && <>
      {props.children}
    </>}
  </div>);
};