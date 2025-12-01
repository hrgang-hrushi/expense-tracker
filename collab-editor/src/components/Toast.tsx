import React from 'react'

export default function Toast({ message }: { message: string }) {
  return (
    <div className="bg-white dark:bg-[#0b1220] shadow rounded px-4 py-2 text-sm text-gray-700 dark:text-gray-200 mb-2">
      {message}
    </div>
  )
}
