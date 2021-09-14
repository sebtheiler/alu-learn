import StatsComponent from './stats';

export default function HomeComponent({ isTeacher }: { isTeacher: boolean }) {

  return (<>
    <h1>Welcome!</h1>
    {isTeacher
      ? <p>Choose or create a classroom on the left to start using Alu</p>
      : <p>Choose or create a deck on the left to start studying</p>
    }
    <br />
    <hr />
    <StatsComponent />
    <span className='mb-5 invisible'>.</span>
  </>);
}