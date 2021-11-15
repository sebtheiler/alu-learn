import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import LoadingButton from '../buttons/LoadingButton';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import { FancyFormFileUpload, prependHttp } from '../../utils/utils';
import { backendFetch, Message } from '../../lookup/lookup';
import { useMemo, useState } from 'react';

type UploadType = 'URL' | 'FILE';
const uploadTypes = ['URL', 'File'];
export interface SelectedImage {
  url: string;
  description: string;
  original_url: string;
}

interface AddImageButtonProps {
  selectedImage?: SelectedImage;
  setSelectedImage(image: SelectedImage): void;
}
export default function AddImageButton({ selectedImage, setSelectedImage }: AddImageButtonProps) {
  const [addImageModalIsOpen, setAddImageModalIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedUploadType, setSelectedUploadType] = useState<UploadType>('URL');
  const [error, setError] = useState<string | undefined>();

  const processFile = (file: File) => {
    const url = URL.createObjectURL(file);
    if (file.size / 1024 > 1000) {
      setError(`Image must be smaller than 1000kb.  Your image is currently ${Math.floor(file.size / 1024)}kb Please reduce the size of your image.`);
    } else {
      console.log(document.getElementsByName('imageDescription'))
      console.log(document.getElementsByName('originalUrl'))
      const image = {
        url: url,
        description: (document.getElementsByName('imageDescription')[0] as HTMLInputElement)?.value,
        original_url: (document.getElementsByName('originalUrl')[0] as HTMLInputElement)?.value,
      }
      setSelectedImage(image);
      setError(undefined);
      setImageUrl('');
    }
  }

  const getImageFromUrl = async () => {
    // We need to use our custom proxy because of CORS
    const url = prependHttp(imageUrl);
    const imageResp = await backendFetch<string | Message>('GET', 'pages/image-proxy/', { url });

    // Error handling
    if (typeof imageResp !== 'string') {
      setError('Error getting image.  Please check the URL and try again.');
      return;
    }

    // Convert base64 string to File object (this was hard)
    const fetched = await fetch(imageResp);
    const blob = await fetched.blob();
    const fileName = url.substring(url.lastIndexOf('/') + 1);
    const file = new File([blob], fileName);
    processFile(file);
  }

  const uploadImage = async event => {
    event.preventDefault();
    const image = {
      url: selectedImage!.url,
      description: (document.getElementsByName('imageDescription')[0] as HTMLInputElement)?.value,
      original_url: (document.getElementsByName('originalUrl')[0] as HTMLInputElement)?.value,
    }
    setSelectedImage(image);
    setAddImageModalIsOpen(false);
  }

  const imgEl = useMemo(() => (<>
    <img
      id='uploaded-image-preview'
      alt=''
      className='w-100'
      src={selectedImage?.url}
    />
    <p className='text-danger text-center' id='image-error'>{error}</p>
  </>), [selectedImage, error]);

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
        {!selectedImage && <i className='fas fa-images fa-5x' />}
        {selectedImage && <img
          id='attached-image'
          alt=''
          className='w-100'
          src={selectedImage.url}
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
              onChange={e => setImageUrl(e.target.value)}
              required
            />
            {imageUrl.length > 0 && <LoadingButton clickFunc={getImageFromUrl} className='mt-2'>
              Load Image
            </LoadingButton>}
            {imgEl}
          </Form.Group>}
          {selectedUploadType === 'FILE' && <Form.Group>
            <Form.Label>Select File</Form.Label>
            <FancyFormFileUpload
              accept='image/*'
              changeCallback={event => {
                const [file] = event.target.files;
                if (file) processFile(file);
              }}
            />
            {imgEl}
          </Form.Group>}
          {selectedImage && <>
            <Form.Group>
              <Form.Label>Description (optional)</Form.Label>
              <Form.Control
                type='text'
                name='imageDescription'
                defaultValue={selectedImage.description}
                maxLength={512}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Original URL (optional)</Form.Label>
              <Form.Control
                type='text'
                name='originalUrl'
                defaultValue={selectedImage.original_url ?? imageUrl}
                maxLength={512}
              />
            </Form.Group>
          </>}
        </Modal.Body>
        {selectedImage && <Modal.Footer>
          <LoadingButton
            clickFunc={uploadImage}
            type='submit'
            block
          >
            Upload
          </LoadingButton>
          <small className='text-secondary text-center mx-auto'>
            By uploading this image, you assert that you have the right to use it (<a href='/legal/tos/' target='_blank'>ToS</a>)
          </small>
        </Modal.Footer>}
      </Form>
    </Modal>
  </>);
}