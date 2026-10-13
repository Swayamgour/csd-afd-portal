import { EmptyState, HomeLink } from '../components/States.jsx'
export default function NotFound() { return <div className="wrap"><EmptyState title="Page not found" text="The page you are looking for could not be found." action={<HomeLink />} /></div> }
