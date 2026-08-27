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
    <div className="relative w-full">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground flex items-center">
        {isLink ? (
          <Link2 className="w-5 h-5 text-primary" />
        ) : (
          <PlatformIcon className="w-5 h-5 text-primary" />
        )}
      </div>
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder || '@seu_perfil ou link do instagram/tiktok/youtube...'}
        className="pl-11 pr-28 h-13 text-base shadow-inner border-2 border-primary/20 focus-visible:border-primary transition-all rounded-xl"
      />
      {detected !== 'unknown' && (
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Badge
            variant="outline"
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm ${platformColors[detected]}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {platformLabels[detected]}
          </Badge>
        </div>
      )}
    </div>
  )
}
