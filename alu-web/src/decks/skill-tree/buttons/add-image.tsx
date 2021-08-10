import { useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import LoadingButton from '../buttons/LoadingButton';
import { FancyFormFileUpload } from '../../../utils/utils';

type UploadType = 'URL' | 'FILE';
const uploadTypes = ['URL', 'File'];
interface AddImageButtonProps {
  selectedImageUrl: string;
  setSelectedImageUrl(url: string): void;
}
export default function AddImageButton({ selectedImageUrl, setSelectedImageUrl }: AddImageButtonProps) {
  const [addImageModalIsOpen, setAddImageModalIsOpen] = useState(false);
  const [selectedUploadType, setSelectedUploadType] = useState<UploadType>('URL');

  const getImageFromUrl = async event => {
    const urlEl = document.getElementsByName('imageUrl')[0] as HTMLFormElement;
    if (!urlEl) return;
    const url = urlEl.value;

    await fetch(url).then(res => res.blob()).then(imgBlob => {
      const reader = new FileReader();
      reader.onload = function() {
        const dataUrl = reader.result as string;
        console.log(dataUrl);
        if (!dataUrl) return;
        const base64 = dataUrl.split(',')[1];
        console.log(base64)
      };
      reader.readAsDataURL(imgBlob);
    });
  }

  const uploadImage = async event => {
    event.preventDefault();
    setAddImageModalIsOpen(false);
  }

  return (<>
    <div
      className='add-image'
      role='button'
      onClick={() => setAddImageModalIsOpen(true)}
    >
      <div className='add-image-head'>
        <p className='mb-0'>Add Image</p>
      </div>
      <div className='add-image-body'>
        {!selectedImageUrl && <i className='fas fa-images fa-5x' />}
        {selectedImageUrl && <img
          id='attached-image'
          alt=''
          className='w-100'
          src={selectedImageUrl}
        />}
      </div>
    </div>
    <Modal show={addImageModalIsOpen} onHide={() => setAddImageModalIsOpen(false)}>
      <Modal.Header>
        <Modal.Title>Add Image</Modal.Title>
      </Modal.Header>
      <Form>
        <Modal.Body>
          <Row className='text-center'>
            {uploadTypes.map(uploadType =>
              <Col
                key={uploadType}
                onClick={() => setSelectedUploadType(uploadType.toUpperCase() as UploadType)}
              >
                <h3 style={{
                  textDecoration: uploadType.toUpperCase() === selectedUploadType ? 'underline' : '',
                  cursor: 'pointer',
                }}>
                  {uploadType}
                </h3>
              </Col>
            )}
          </Row>
          {selectedUploadType === 'URL' && <Form.Group>
            <Form.Label>URL of Image</Form.Label>
            <Form.Control
              type='text'
              name='imageUrl'
              required
            />
            <LoadingButton clickFunc={getImageFromUrl} className='mt-2'>
              Load Image
            </LoadingButton>
            {/* TODO: make this work */}
          </Form.Group>}
          {selectedUploadType === 'FILE' && <Form.Group>
            <Form.Label>Select File</Form.Label>
            <FancyFormFileUpload
              accept='image/*'
              changeCallback={event => {
                const [file] = event.target.files;
                if (file) {
                  const url = URL.createObjectURL(file);
                  if (file.size / 1024 > 1000) {
                    const errorEl = document.getElementById('image-error');
                    if (!errorEl) return;
                    errorEl.innerText =
                      `Image must be smaller than 1000kb.  Your image is currently ${Math.floor(file.size / 1024)}kb Please reduce the size of your image.`;
                  } else {
                    setSelectedImageUrl(url);
                    const errorEl = document.getElementById('image-error');
                    if (errorEl)
                      errorEl.innerText = '';
                  }
                }
              }}
            />
            {selectedImageUrl && <img
              id='uploaded-image-preview'
              alt=''
              className='w-100'
              src={selectedImageUrl}
            />}
            <p className='text-danger text-center' id='image-error'></p>
          </Form.Group>}
        </Modal.Body>
        {selectedImageUrl && <Modal.Footer>
          <LoadingButton
            clickFunc={uploadImage}
            type='submit'
            block
          >
            Upload
          </LoadingButton>
          <p className='text-secondary text-center mx-auto'>
            Please make sure you have the rights to use this image
          </p>
        </Modal.Footer>}
      </Form>
    </Modal>
  </>);
}