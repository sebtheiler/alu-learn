export function ConfirmEmail({ email }) {
  return (
    <div>
      <h1 className='text-center mt-5'>
        Confirm Your Email
      </h1>
      <p className='text-center'>
        An email should have been sent to {email}.
        Please click the button in that email to confirm your email.
      </p>
      <p className='text-center'>
        Incorrect email? Change your email <a href='/settings/change-email/'>here</a>.
      </p>
    </div>
  );
}
