import React, { useState } from 'react';
import {Form} from 'react-bootstrap';

export function AutoNote(props) {
  const [selectedPar, setSelectedPar] = useState(0);

  const text = `
On the frontier of Armenia towards the south-east is the kingdom of Mosul. It is a very great kingdom, and inhabited by several different kinds of people whom we shall now describe.
First there is a kind of people called ARAB, and these worship Mahommet. Then there is another description of people who are NESTORIAN and JACOBITE Christians. These have a Patriarch, whom they call the JATOLIC, and this Patriarch creates Archbishops, and Abbots, and Prelates of all other degrees, and sends them into every quarter, as to India, to Baudas, or to Cathay, just as the Pope of Rome does in the Latin countries. For you must know that though there is a very great number of Christians in those countries, they are all Jacobites and Nestorians; Christians indeed, but not in the fashion enjoined by the Pope of Rome, for they come short in several points of the Faith.
All the cloths of gold and silk that are called muslin are made in this country; and those great Merchants called Mosolins, who carry for sale such quantities of spicery and pearls and cloths of silk and gold, are also from this kingdom.
There is yet another race of people who inhabit the mountains in that quarter, and are called CURDS. Some of them are Christians, and some of them are Saracens; but they are an evil generation, whose delight it is to plunder merchants.
[Near this province is another called MUS and MERDIN, producing an immense quantity of cotton, from which they make a great deal of buckram and other cloth. The people are craftsmen and traders, and all are subject to the Mongol King.]    
`.trim().split('\n');

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (<div className='container'>
    <h3 className='text-center'>Content</h3>
    <div style={{ border: '1px solid gray', padding: '30px' }}>
      {text.map((paragraph, index) =>
        <p
          key={`paragraph-${index}`}
          style={{ color: index === selectedPar ? 'black' : '#e0e0e0' }}
        >{paragraph}</p>
      )}
    </div>
    <Form onSubmit={handleSubmit} className='mt-4'>
      <Form.Group className='w-75 mx-auto'>
        <Form.Label as='h3'>Section (subsection with "&gt;")</Form.Label>
        <Form.Control
          type='text'
          name='sectionTitle'
          placeholder='B.F. Skinner > Skinner Box'
        />
      </Form.Group>
      <Form.Group>
        <Form.Label as='h3'>Notes</Form.Label>
        <Form.Control
          as='textarea'
          name='notes'
          rows='10'
        />
      </Form.Group>
    </Form>
  </div>);
};