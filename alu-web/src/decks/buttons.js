import React from 'react';

export function EditButton(props) {
    const className = props.className ? props.className : 'btn btn-primary mb-4 mr-1';
  
    const handleClick = (event) => {
      event.preventDefault();
      console.log('TODO: Implement editing')
    };
  
    return <button onClick={handleClick} className={className}>Edit</button>;
  };
  
  export function RedirectButton(props) {
    const {link} = props;
    const className = props.className ? props.className : 'btn btn-primary mb-4 mr-1';
    const target = props.target ? props.target : '_blank';
  
    return <a href={link.href} target={target} rel='noopener noreferrer'><button className={className}>{link.display}</button></a>;
  };