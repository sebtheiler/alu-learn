import AsyncForm from '@components/AsyncForm';
import Button from '@components/Button';
import GlobalContext from '@global';
import Modal from 'components/Modal';
import TextInput from '@components/Form/TextInput';
import googleLogoUrl from 'assets/google-logo.svg';
import { getElementsVals } from '@helpers/getElementsVals';
import { useContext, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';


const onLogIn = async (e) => {
  console.log(getElementsVals(e.target.elements, ['emailOrUsername', 'password']));
}


/**
 * Renders the global log-in modal. Only instantiate in `Navbar`!
 */
export default function LogInModal() {
  const { logInModalOpen, setLogInModalOpen } = useContext(GlobalContext);
  const login = useGoogleLogin({
    onSuccess: tokenResponse => console.log(tokenResponse),
  });
  const [loginWithEmail, setLoginWithEmail] = useState(false);

  return (
    <Modal open={logInModalOpen} close={() => setLogInModalOpen(false)} title='Log-in'>
      <Button onClick={() => login()} variant='white' className='border-2 border-gray-200 text-black' block>
        <img src={googleLogoUrl} alt='Google Logo' width={30} className='inline absolute left-5 top-2' />
        Log-in with Google
      </Button>
      <Button onClick={() => setLoginWithEmail(!loginWithEmail)} variant='primary-outline' className='mt-1' block>
        Log-in with Email
      </Button>
      {loginWithEmail && <AsyncForm onSubmit={onLogIn} buttonProps={{
        children: 'Log-in',
        block: true,
      }}>
        <hr className='my-3' />
        <TextInput
          label='Email or Username'
          name='emailOrUsername'
          autoComplete='email'
          className='mb-2'
          required
        />
        <TextInput
          label='Password'
          name='password'
          autoComplete='current-password'
          type='password'
          className='mb-2'
          required
        />
      </AsyncForm>}
    </Modal>
  );
}