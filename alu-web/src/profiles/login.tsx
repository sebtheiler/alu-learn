import { LoginForm } from '../pages/landing/forms';

export function LoginComponent() {
  return (
    <>
      <h2 className='text-center'>Log-in</h2>
      <div className='w-50 mx-auto'>
        <LoginForm />
      </div>
    </>
  );
}
