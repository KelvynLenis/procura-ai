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
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from './ui/badge'

interface ComboboxProps {
  values: string[]
  options: { label: string; value: string }[]
  onSelect: (options: string[]) => void
  placeholder?: string
  disabled?: boolean
  maxSelections?: number
  className?: string
}

export function Combobox({
  values,
  options,
  onSelect,
  placeholder,
  disabled,
  maxSelections,
  className,
}: ComboboxProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const handleSelect = (option: string) => {
    let newValues: string[]

    if (values?.includes(option)) {
      // Remove if already selected
      newValues = values?.filter(val => val !== option)
    } else {
      // Add if not selected and check max selections
      if (maxSelections && values?.length >= maxSelections) {
        // Replace the last item if max reached
        newValues = [...values.slice(0, maxSelections - 1), option]
      } else {
        newValues = [...values, option]
      }
    }

    onSelect?.(newValues)
  }

  const removeValue = (value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect?.(values?.filter(val => val !== value))
  }

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
                'w-56 min-h-[48px] p-2 text-base gap-2 justify-between bg-white ring-1 ring-[#232323]/20 shadow-none flex flex-wrap overflow-y-scroll custom-scroll',
                className
              )}
            >
              {values?.length > 0 ? (
                <div className="flex flex-wrap gap-1 items-center">
                  {values?.map(value => (
                    <Badge
                      key={value}
                      className="px-2 py-1 flex items-center gap-1 bg-procura-ai-blue hover:opacity-70 shadow-none hover:bg-procura-ai-blue"
                    >
                      {value}
                      {/* <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={e => removeValue(value, e)}
                      /> */}
                    </Badge>
                  ))}
                </div>
              ) : (
                <>
                  <span className="text-muted-foreground">{placeholder}</span>
                  <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </>
              )}
              {/* <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" /> */}
            </ButtonShadcn>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Digite para buscar" />
            <CommandList>
              <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
              <CommandGroup>
                {options.map(option => (
                  <CommandItem
                    value={option.label}
                    key={option.label}
                    onSelect={() => handleSelect(option.label)}
                  >
                    {option.label}
                    <Check
                      className={cn(
                        'ml-auto',
                        values?.includes(option.label)
                          ? 'opacity-100'
                          : 'opacity-0'
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
