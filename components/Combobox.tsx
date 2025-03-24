'use client'

import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button as ButtonShadcn } from './ui/button'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComboboxProps {
  value: string
  options: { label: string; value: string }[]
  onSelect: (option: string) => void
  placeholder: string
  disabled?: boolean
}
export function Combobox({
  value,
  options,
  onSelect,
  placeholder,
  disabled,
}: ComboboxProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  return (
    <>
      <Popover
        open={disabled ? false : isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
      >
        <PopoverTrigger asChild disabled={disabled}>
          <div className="self-start w-full md:w-fit">
            <ButtonShadcn
              variant="outline"
              // biome-ignore lint/a11y/useSemanticElements: <explanation>
              role="combobox"
              type="button"
              disabled={disabled}
              className={cn(
                'w-56 p-4 text-base gap-2 justify-between bg-white ring-1 ring-[#232323]/20 shadow-none'
              )}
            >
              {/* <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 rotate-90" /> */}
              {value ? value : placeholder}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </ButtonShadcn>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Digite a marca" />
            <CommandList>
              <CommandEmpty>Nenhuma marca encontrada.</CommandEmpty>
              <CommandGroup>
                {options.map(option => (
                  <CommandItem
                    value={option.label}
                    key={option.label}
                    onSelect={() => {
                      onSelect(option.label)
                      setIsPopoverOpen(false)
                    }}
                  >
                    {option.label}
                    <Check
                      className={cn(
                        'ml-auto',
                        option.label === value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  )
}
