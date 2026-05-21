"use client"

import { useState, useTransition } from "react"
import { deleteAddress, setDefaultAddress } from "@/app/actions/profile"
import AddressForm from "./AddressForm"

interface Address {
  id: string
  name: string
  phone: string
  address: string
  city: string
  state: string | null
  postalCode: string
  country: string
  isDefault: boolean
}

interface AddressListProps {
  addresses: Address[]
}

function AddressCard({
  address,
  onEdit,
}: {
  address: Address
  onEdit: (a: Address) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    if (!confirm("Remove this address?")) return
    startTransition(async () => {
      const result = await deleteAddress(address.id)
      if (result.error) setError(result.error)
    })
  }

  function handleSetDefault() {
    startTransition(async () => {
      const result = await setDefaultAddress(address.id)
      if (result.error) setError(result.error)
    })
  }

  return (
    <div
      className={`relative bg-white border rounded p-5 transition-colors ${
        address.isDefault ? "border-[#B8965C]" : "border-[#e5e5e5]"
      }`}
    >
      {address.isDefault && (
        <span className="absolute top-3 right-3 text-[10px] tracking-[0.12em] uppercase text-[#B8965C] bg-[#B8965C]/10 px-2 py-0.5 rounded">
          Default
        </span>
      )}

      <p className="text-sm font-medium text-[#111111]">{address.name}</p>
      <p className="text-xs text-[#8C8C8C] mt-1">{address.phone}</p>
      <p className="text-xs text-[#6b6b6b] mt-2 leading-relaxed">
        {address.address}
        <br />
        {address.city}
        {address.state ? `, ${address.state}` : ""} {address.postalCode}
        <br />
        {address.country}
      </p>

      {error && (
        <p className="text-xs text-[#c0392b] mt-2">{error}</p>
      )}

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={() => onEdit(address)}
          className="text-xs text-[#8C8C8C] hover:text-[#111111] transition-colors"
        >
          Edit
        </button>
        {!address.isDefault && (
          <>
            <span className="text-[#e5e5e5]">·</span>
            <button
              onClick={handleSetDefault}
              disabled={isPending}
              className="text-xs text-[#8C8C8C] hover:text-[#111111] transition-colors disabled:opacity-50"
            >
              Set as default
            </button>
          </>
        )}
        <span className="text-[#e5e5e5]">·</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs text-[#c0392b] hover:text-red-700 transition-colors disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

export default function AddressList({ addresses }: AddressListProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  return (
    <div className="space-y-4">
      {addresses.length === 0 && !showAddForm && (
        <p className="text-sm text-[#8C8C8C]">No saved addresses yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) =>
          editingAddress?.id === addr.id ? (
            <div key={addr.id} className="bg-white border border-[#B8965C] rounded p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-medium tracking-[0.12em] uppercase text-[#111111]">
                  Edit Address
                </p>
                <button
                  onClick={() => setEditingAddress(null)}
                  className="text-xs text-[#8C8C8C] hover:text-[#111111]"
                >
                  Cancel
                </button>
              </div>
              <AddressForm
                address={addr}
                onSuccess={() => setEditingAddress(null)}
              />
            </div>
          ) : (
            <AddressCard
              key={addr.id}
              address={addr}
              onEdit={setEditingAddress}
            />
          )
        )}
      </div>

      {showAddForm ? (
        <div className="bg-white border border-[#e5e5e5] rounded p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium tracking-[0.12em] uppercase text-[#111111]">
              New Address
            </p>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-[#8C8C8C] hover:text-[#111111]"
            >
              Cancel
            </button>
          </div>
          <AddressForm onSuccess={() => setShowAddForm(false)} />
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 text-xs text-[#8C8C8C] hover:text-[#B8965C] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add new address
        </button>
      )}
    </div>
  )
}
