import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const seeds = ['luna', 'mateo', 'olivia', 'leo', 'ines', 'nico']
const styles = ['personas', 'lorelei', 'fun-emoji']

export default function AvatarSelector({ onSelect }: { onSelect: (url: string) => void }) {
  const [selectedSeed, setSelectedSeed] = useState(seeds[0])
  const [selectedStyle, setSelectedStyle] = useState(styles[0])

  const avatarUrl = `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${selectedSeed}`

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)}>
          {styles.map(style => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>
        <select value={selectedSeed} onChange={e => setSelectedSeed(e.target.value)}>
          {seeds.map(seed => (
            <option key={seed} value={seed}>{seed}</option>
          ))}
        </select>
        <Button onClick={() => onSelect(avatarUrl)}>Usar este avatar</Button>
      </div>
      <Avatar className="w-24 h-24 border">
        <AvatarImage src={avatarUrl} alt="avatar" />
        <AvatarFallback>?</AvatarFallback>
      </Avatar>
    </div>
  )
}
