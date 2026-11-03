import { useApp } from '../state'

export default function Toast() {
  const { toastMsg } = useApp()
  return <div className={`toast ${toastMsg.on ? 'on' : ''}`} role="status">{toastMsg.texto}</div>
}
