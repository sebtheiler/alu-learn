import AsyncForm from '@components/AsyncForm';
import Button from 'components/Button';
import Checkbox from 'components/Form/Checkbox';
import GlobalContext from '@global';
import Modal from 'components/Modal';
import TextInput from 'components/Form/TextInput';
import googleLogoUrl from 'assets/logos/google.svg';
import { useContext, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { getElementsVals } from '../../../helpers/getElementsVals';

const onSignUp = async (e) => {
  e.preventDefault();
  console.log(getElementsVals(e.target.elements, ['age', 'firstName', 'lastName', 'username', 'email', 'password']));
}

/**
 * Renders the global sign-up modal. Only instantiate in `Navbar`!
 */
export default function SignUpModal() {
  const { signUpModalOpen, setSignUpModalOpen } = useContext(GlobalContext);
  const login = useGoogleLogin({
    onSuccess: tokenResponse => console.log(tokenResponse),
  });

  const [continueWithEmail, setContinueWithEmail] = useState(false);
  const [age, setAge] = useState<number>(111);

  return (
    <Modal open={signUpModalOpen} close={() => setSignUpModalOpen(false)} title='Sign-up'>
      <Button onClick={() => login()} variant='white' block>
        <img src={googleLogoUrl} alt='Google Logo' width={30} className='inline absolute left-5 top-2' />
        Continue with Google
      </Button>
      <Button onClick={() => setContinueWithEmail(!continueWithEmail)} variant='primary-outline' className='mt-1' block>
        Continue with Email
      </Button>
      {continueWithEmail && <AsyncForm onSubmit={onSignUp} buttonProps={{
        children: 'Create Account',
        block: true,
      }}>
        <hr className='my-3' />
        <TextInput
          label='Age'
          name='age'
          type='number'
          className='mb-2'
          required
          onBlur={e => setAge(e.target.value.length > 0 ? parseInt(e.target.value) : 111)}
        />
        {age >= 13 && <div className='grid grid-cols-2 gap-3 mb-2'>
          <TextInput label='First Name' name='firstName' autoComplete='given-name' className='' required />
          <TextInput label='Last Name' name='lastName' autoComplete='family-name' className='' required />
        </div>}
        <TextInput
          label={age >= 13 ? 'Username' : 'Username (don\'t use your real name!)'}
          name='username'
          autoComplete='username'
          className='mb-2'
          required
        />
        <TextInput
          label={age >= 13 ? 'Email' : 'Parent\'s Email'}
          name='email'
          autoComplete='email'
          type='email'
          className='mb-2'
          required
        />
        <TextInput label='Password' name='password' autoComplete='new-password' type='password' className='mb-2' required />
        <Checkbox
          label={<>
            I accept the{' '}
            <a href='/legal/tos' target='_blank' className='text-blue-500'>terms of service</a> and{' '}
            <a href='/legal/privacypolicy' target='_blank' className='text-blue-500'>privacy policy</a>
          </>}
          id='terms-and-conditions' className='mb-4 ml-2'
          required
        />
      </AsyncForm>}
    </Modal>
  );
}
