import { useParams } from 'react-router-dom'
export default function Info() {
  const { topic } = useParams(), t = topic.replace(/-/g, ' ')
  return (<div className="wrap"><h1 className="portal-text-capitalize">{t}</h1><div className="panel"><p>[Official Information To Be Provided]</p></div></div>)
}
