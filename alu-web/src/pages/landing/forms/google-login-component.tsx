import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { backendFetch } from '../../../lookup/lookup';

export const onGoogleLoginSuccess = async (credResp: CredentialResponse) => {
  const loginResp = await backendFetch<{ msg: string }>(
    'POST', 'profiles/google/login/', { cred_resp: credResp },
  );

  if (loginResp.msg === 'Logged in') {
    window.location.href = '/home/';
  } else if (loginResp.msg === 'Created account') {
    window.location.href = '/help/welcome/';
  } else {
    window.location.reload();
  }
}

interface GoogleLoginComponentProps {
  type: 'signup' | 'signin';
}
export default function GoogleLoginComponent({ type }: GoogleLoginComponentProps) {
  const text = {'signup': 'continue_with', 'signin': 'signin_with'}[type];

  return (<>
    <GoogleLogin
      onSuccess={onGoogleLoginSuccess}
      onError={() => {
        document.getElementsByClassName('google-login-error')[0].innerHTML = 'Error';
      }}
      text={text as ('continue_with' | 'signin_with')}
    />
    <p className='google-login-error text-danger'></p>
  </>)
}