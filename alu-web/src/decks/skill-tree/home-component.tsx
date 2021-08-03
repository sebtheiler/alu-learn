import StatsComponent from './stats';
import { useApiObjectHook } from '../../utils';
import { Profile } from '../../profiles/types';
import { apiProfileDetail } from '../../lookup';


export default function HomeComponent({ username }: { username: string }) {
  const [profile] = useApiObjectHook<Profile>(apiProfileDetail, 200, 3010, [username]);

  return (<>
    <h1>Welcome!</h1>
    <p>Choose or create a deck on the left to start studying</p>
    <br />
    <hr />
    <StatsComponent profile={profile} username={username} />
    <span className='mb-5 invisible'>.</span>
  </>);
}