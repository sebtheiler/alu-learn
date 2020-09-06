import React from 'react';
import { Form, Button } from 'react-bootstrap';

export function DeckImportComponent() {
  // const {username} = props;
  const fileRef = React.createRef();

  const handleImport = (event) => {
    event.preventDefault();
    const file = event.target.uploadFile.files[0];

    file.text().then((response) => {
      const contents = response;
      console.log(contents);
    });
  };

  return (
    <Form onSubmit={handleImport}>

      <Form.Group>
        <Form.File
          id='uploadFile'
          name='uploadFile'
          label='File to import'
          onChange={event => console.log(event)}
          ref={fileRef}
          required
        />
        {/* <Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}>
          {({getRootProps, getInputProps}) => (
            <section>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
              </div>
            </section>
          )}
        </Dropzone> */}
      </Form.Group>
      <Form.Group>
        <Button
          type='submit'
        >
          Import!
        </Button>
      </Form.Group>
    </Form>
  );
};