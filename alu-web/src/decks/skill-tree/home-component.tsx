import StatsComponent from './stats';

export default function HomeComponent() {

  return (<>
    <h1>Welcome!</h1>
    <p>Choose or create a deck on the left to start studying</p>
    <br />
    <hr />
    <StatsComponent />
    <span className='mb-5 invisible'>.</span>
  </>);
}