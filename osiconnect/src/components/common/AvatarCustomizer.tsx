'use client'

import { useState } from 'react'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const seeds = ['luna', 'mateo', 'olivia', 'leo', 'ines', 'nico']
const styles = ['personas', 'lorelei', 'fun-emoji']

export default function AvatarGallerySelector({ onSelect }: { onSelect: (url: string) => void }) {
  const [selectedStyle, setSelectedStyle] = useState(styles[0])
  const [selectedUrl, setSelectedUrl] = useState('')

  const generateUrl = (seed: string, style: string) =>
    `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`

  const handleSelect = (url: string) => {
    setSelectedUrl(url)
    onSelect(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <label className="font-medium">Estilo:</label>
        <select
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {styles.map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {seeds.map((seed) => {
          const url = generateUrl(seed, selectedStyle)
          return (
            <div
              key={seed}
              className={`cursor-pointer border-2 rounded p-1 ${
                selectedUrl === url ? 'border-blue-500' : 'border-transparent'
              }`}
              onClick={() => handleSelect(url)}
            >
              <Avatar className="w-20 h-20">
                <AvatarImage src={url} alt={seed} />
              </Avatar>
              <p className="text-center text-sm mt-1">{seed}</p>
            </div>
          )
        })}
      </div>

      {selectedUrl && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Avatar seleccionado:</p>
          <img src={selectedUrl} alt="Avatar seleccionado" className="w-24 h-24 mx-auto rounded-full border" />
          <Button className="mt-2" onClick={() => onSelect(selectedUrl)}>
            Usar este avatar
          </Button>
        </div>
      )}
    </div>
  )
}
