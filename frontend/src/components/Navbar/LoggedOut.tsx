import Button from 'components/Button';
import ButtonGroup from 'components/ButtonGroup';
import GlobalContext from '@global';
import LogInModal from 'components/Modal/LogInModal';
import SignUpModal from 'components/Modal/SignUpModal';
import { CredentialResponse, useGoogleOneTapLogin } from '@react-oauth/google';
import { useContext } from 'react';


const onGoogleLoginSuccess = (credResp: CredentialResponse) => console.log(credResp);

export default function LoggedOut() {
  const { setSignUpModalOpen, setLogInModalOpen } = useContext(GlobalContext);
  useGoogleOneTapLogin({
    onSuccess: onGoogleLoginSuccess,
    onError: () => console.log('Error'),
  });

  return (
    <div className='ml-auto'>
      <ButtonGroup spaced>
        <Button onClick={() => setLogInModalOpen(true)} variant='white'>Log-in</Button>
        <Button onClick={() => setSignUpModalOpen(true)}>Sign-up</Button>
      </ButtonGroup>
      <SignUpModal />
      <LogInModal />
    </div>
  );
}
