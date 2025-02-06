import React, { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@repo/ui/components/button'
import { ScrollArea, ScrollBar } from '@repo/ui/components/scroll-area'
import {
    Command,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@repo/ui/components/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@repo/ui/components/popover'
import { cn } from '@repo/ui/lib/utils'

// Import JSON data directly
import countries from '@repo/ui/data/countries.json' assert { type: 'json' }
import states from '@repo/ui/data/states.json' assert { type: 'json' }
interface Timezone {
    zoneName: string
    gmtOffset: number
    gmtOffsetName: string
    abbreviation: string
    tzName: string
}

interface CountryProps {
    id: number
    name: string
    iso3: string
    iso2: string
    numeric_code: string
    phone_code: string
    capital: string
    currency: string
    currency_name: string
    currency_symbol: string
    tld: string
    native: string
    region: string
    region_id: string
    subregion: string
    subregion_id: string | null
    nationality: string
    timezones: Timezone[]
    translations: any
    latitude: string
    longitude: string
    emoji: string
    emojiU: string
}

interface StateProps {
    id: number
    name: string
    country_id: number
    country_code: string
    country_name: string
    state_code: string
    type: string | null
    latitude: string
    longitude: string
}

interface LocationSelectorProps {
    disabled?: boolean,
    defaultValue?: string[] | undefined
    onCountryChange?: (country: CountryProps | null) => void
    onStateChange?: (state: StateProps | null) => void
}

const LocationSelector = ({
    disabled,
    defaultValue,
    onCountryChange,
    onStateChange,
}: LocationSelectorProps) => {

    function getDefaultCountry() {
        // Find the country object based on the defaultValue[0]
        if (defaultValue && defaultValue[0]) {
            return countries.find(
                (country) => country.name === defaultValue[0]
            ) || null
        }
        return null
    }
    function getDefaultState() {
        // Find the state object based on the defaultValue[1]
        if (defaultValue && defaultValue[1] && selectedCountry) {
            return states.find(
                (state) =>
                    state.name === defaultValue[1] &&
                    state.country_id === selectedCountry.id
            ) || null
        }
        return null
    }
    // @ts-ignore
    const [selectedCountry, setSelectedCountry] = useState<CountryProps | null>(getDefaultCountry())
    // @ts-ignore
    const [selectedState, setSelectedState] = useState<StateProps | null>(getDefaultState())

    const [openCountryDropdown, setOpenCountryDropdown] = useState(false)
    const [openStateDropdown, setOpenStateDropdown] = useState(false)

    // Cast imported JSON data to their respective types
    const countriesData = countries as CountryProps[]
    const statesData = states as StateProps[]

    // Filter states for selected country
    const availableStates = statesData.filter(
        (state) => state.country_id === selectedCountry?.id,
    )

    const handleCountrySelect = (country: CountryProps | null) => {
        setSelectedCountry(country)
        setSelectedState(null) // Reset state when country changes
        onCountryChange?.(country)
        onStateChange?.(null)
    }

    const handleStateSelect = (state: StateProps | null) => {
        setSelectedState(state)
        onStateChange?.(state)
    }

    return (
        <div className="flex gap-4">
            {/* Country Selector */}
            <Popover open={openCountryDropdown} onOpenChange={setOpenCountryDropdown}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCountryDropdown}
                        disabled={disabled}
                        className="w-full justify-between"
                    >
                        {selectedCountry ? (
                            <div className="flex items-center gap-2">
                                <span>{selectedCountry.emoji}</span>
                                <span>{selectedCountry.name}</span>
                            </div>
                        ) : (
                            <span className="font-normal">Select a country</span>
                        )}
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]">
                    <Command>
                        <CommandInput className="font-light" placeholder="Search a country" />
                        <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                                {countriesData.map((country) => (
                                    <CommandItem
                                        key={country.id}
                                        value={country.name}
                                        onSelect={() => {
                                            handleCountrySelect(country)
                                            setOpenCountryDropdown(false)
                                        }}
                                        className="flex cursor-pointer items-center justify-between text-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{country.emoji}</span>
                                            <span>{country.name}</span>
                                        </div>
                                        <Check
                                            className={cn(
                                                'h-4 w-4',
                                                selectedCountry?.id === country.id
                                                    ? 'opacity-100'
                                                    : 'opacity-0',
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* State Selector - Only shown if selected country has states */}
            {availableStates.length > 0 && (
                <Popover open={openStateDropdown} onOpenChange={setOpenStateDropdown}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openStateDropdown}
                            disabled={!selectedCountry}
                            className="w-full justify-between"
                        >
                            {selectedState ? (
                                <span>{selectedState.name}</span>
                            ) : (
                                <span>Select a state</span>
                            )}
                            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height]">
                        <Command>
                            <CommandInput placeholder="Search state..." />
                            <CommandList>
                                <CommandEmpty>No state found.</CommandEmpty>
                                <CommandGroup>
                                    {availableStates.map((state) => (
                                        <CommandItem
                                            key={state.id}
                                            value={state.name}
                                            onSelect={() => {
                                                handleStateSelect(state)
                                                setOpenStateDropdown(false)
                                            }}
                                            className="flex cursor-pointer items-center justify-between text-sm"
                                        >
                                            <span>{state.name}</span>
                                            <Check
                                                className={cn(
                                                    'h-4 w-4',
                                                    selectedState?.id === state.id
                                                        ? 'opacity-100'
                                                        : 'opacity-0',
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    )
}

export default LocationSelector

