import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  parseSmartInput,
  platformLabels,
  platformColors,
  type DetectedPlatform,
} from '@/lib/smart-input'
import { AtSign, Link2, Instagram, Youtube } from 'lucide-react'

interface SmartHandleInputProps {
  value: string
  onChange: (value: string, platform?: DetectedPlatform, handle?: string) => void
  placeholder?: string
}

export function SmartHandleInput({ value, onChange, placeholder }: SmartHandleInputProps) {
  const [detected, setDetected] = useState<DetectedPlatform>('unknown')

  useEffect(() => {
    const result = parseSmartInput(value)
    setDetected(result.platform)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const result = parseSmartInput(val)
    setDetected(result.platform)
    onChange(val, result.platform, result.handle)
  }

  const PlatformIcon =
    detected === 'instagram' ? Instagram : detected === 'youtube_shorts' ? Youtube : AtSign
  const isLink = /^https?:\/\//.test(value)

  return (
    <div className="relative">
      {isLink ? (
        <Link2 className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
      ) : (
        <PlatformIcon className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
      )}
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder || '@usuario ou https://...'}
        className="pl-9 pr-20"
      />
      {detected !== 'unknown' && (
        <Badge
          variant="outline"
          className={`absolute right-2 top-1.5 text-[10px] ${platformColors[detected]}`}
        >
          {platformLabels[detected]}
        </Badge>
      )}
    </div>
  )
}
