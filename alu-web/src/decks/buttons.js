import React from 'react';


// Button for editing the properties of a deck
// This may be renamed to option in the future
// This will eventually create a pop-up modal
export function EditButton(props) {
  const className = props.className ? props.className : 'btn btn-primary mb-4 mr-1';

  const handleClick = (event) => {
    event.preventDefault();
    console.log('TODO: Implement editing')
  };

  return <button onClick={handleClick} className={className}>Edit</button>;
};


// Simply a button wrapped in a link
export function RedirectButton(props) {
  const {link} = props;
  const className = props.className ? props.className : 'btn btn-primary mb-4 mr-1';
  const target = props.target ? props.target : '_blank'; // _blank = new tab, _self = same tab

  return (<a href={link.href} target={target} rel='noopener noreferrer'>
            <button className={className}>{link.display}</button>
          </a>);
};