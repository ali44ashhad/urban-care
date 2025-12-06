import React from 'react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'

/**
 * providers: array of provider objects
 * actions: { onView, onAssign, onDeactivate }
 */
export default function ProviderList({ providers = [], actions = {} }) {
  if (!providers.length) return <div className="text-gray-600">No providers</div>
  return (
    <div className="space-y-3">
      {providers.map(p => (
        <div key={p._id || p.id} className="bg-white p-4 rounded-xl shadow flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={p.name || p.companyName} src={p.avatar} />
            <div>
              <div className="font-semibold">{p.companyName || p.name}</div>
              <div className="text-sm text-gray-500">{p.serviceNames?.join(', ') || p.services?.length ? `${p.services.length} services` : ''}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {actions.onView && <Button variant="secondary" onClick={() => actions.onView(p)}>View</Button>}
            {actions.onAssign && <Button onClick={() => actions.onAssign(p)}>Assign</Button>}
            {actions.onDeactivate && <Button variant="ghost" onClick={() => actions.onDeactivate(p)}>{p.isActive ? 'Deactivate' : 'Activate'}</Button>}
          </div>
        </div>
      ))}
    </div>
  )
}
