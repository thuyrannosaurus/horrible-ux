"use client"

import { useState, useEffect, useRef } from "react"
import { Check, ChevronsUpDown, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Main countries
const mainCountries = [{ name: "Norway", flag: "🇳🇴", code: "+47", digits: 8 }]
// Other lesser known countries
const otherCountries = [
  { name: "France", flag: "🇫🇷", code: "+33", digits: 9 },
  { name: "Germany", flag: "🇩🇪", code: "+49", digits: 11 },
  { name: "Spain", flag: "🇪🇸", code: "+34", digits: 9 },
  { name: "Italy", flag: "🇮🇹", code: "+39", digits: 10 },
  { name: "Canada", flag: "🇨🇦", code: "+1", digits: 10 },
  { name: "Australia", flag: "🇦🇺", code: "+61", digits: 9 },
  { name: "Japan", flag: "🇯🇵", code: "+81", digits: 10 },
  { name: "China", flag: "🇨🇳", code: "+86", digits: 11 },
  { name: "India", flag: "🇮🇳", code: "+91", digits: 10 },
  { name: "Brazil", flag: "🇧🇷", code: "+55", digits: 11 },
  { name: "Mexico", flag: "🇲🇽", code: "+52", digits: 10 },
  { name: "South Korea", flag: "🇰🇷", code: "+82", digits: 10 },
  { name: "Russia", flag: "🇷🇺", code: "+7", digits: 10 },
  { name: "United States", flag: "🇺🇸", code: "+1", digits: 10 },
  { name: "United Kingdom", flag: "🇬🇧", code: "+44", digits: 10 },
  { name: "Bhutan", flag: "🇧🇹", code: "+975", digits: 8 },
  { name: "Fiji", flag: "🇫🇯", code: "+679", digits: 7 },
  { name: "Maldives", flag: "🇲🇻", code: "+960", digits: 7 },
  { name: "Monaco", flag: "🇲🇨", code: "+377", digits: 8 },
  { name: "Nauru", flag: "🇳🇷", code: "+674", digits: 7 },
  { name: "Palau", flag: "🇵🇼", code: "+680", digits: 7 },
  { name: "San Marino", flag: "🇸🇲", code: "+378", digits: 8 },
  { name: "Seychelles", flag: "🇸🇨", code: "+248", digits: 7 },
  { name: "Tuvalu", flag: "🇹🇻", code: "+688", digits: 5 },
  { name: "Vatican City", flag: "🇻🇦", code: "+379", digits: 10 },
  { name: "Kiribati", flag: "🇰🇮", code: "+686", digits: 5 },
  { name: "Liechtenstein", flag: "🇱🇮", code: "+423", digits: 7 },
  { name: "Marshall Islands", flag: "🇲🇭", code: "+692", digits: 7 },
  { name: "Micronesia", flag: "🇫🇲", code: "+691", digits: 7 },
  { name: "Saint Kitts and Nevis", flag: "🇰🇳", code: "+1869", digits: 7 },
]

// Combine all countries for the state
const allCountries = [...mainCountries, ...otherCountries]

// Array of passive-aggressive messages
const passiveAggressiveMessages = [
  "I see you've cleared the form. Perhaps you'd like to actually enter a phone number this time? It's only mandatory if you want this to work.",
  "Oh, starting over again? I guess getting it right the first time was too much to ask.",
  "Another reset? Don't worry, I've got all day to wait for you to figure this out.",
  "Cleared again? Maybe phones just aren't your thing. Have you tried carrier pigeons?",
  "Reset button seems to be your favorite. Too bad it doesn't count as completing the form.",
  "Let me guess, all those digits were just too overwhelming for you?",
  "Starting from scratch again? I admire your commitment to indecision.",
  "Form cleared. I'll just be here, waiting, for however long it takes you to enter a simple phone number.",
  "Another reset? I'm starting to think you enjoy disappointing this form.",
  "Back to square one. Again. Take your time, it's not like anyone else is waiting to use this form.",
]

// Array of excuses for why the submission failed
const submissionExcuses = [
  "Sorry, couldn't save your number. Mercury is in retrograde, affecting all telecommunications.",
  "Submission failed. The server is currently taking a mandatory coffee break.",
  "Unable to process. Your phone number contains too many consecutive digits.",
  "Error: Our system only accepts phone numbers from people named 'Steve' on Tuesdays.",
  "Submission rejected. Your phone number's astrological sign is incompatible with our database.",
  "Failed to save. Our AI detected that this number has negative vibes.",
  "Cannot process. The phone number you entered is too mainstream.",
  "Error 418: I'm a teapot, not a phone directory.",
  "Submission declined. Our quantum verification system collapsed upon observation of your number.",
  "Unable to save. Your phone number doesn't pass the vibe check.",
]

export default function PhoneNumberForm() {
  const [open, setOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(mainCountries[0])
  const [phoneDigits, setPhoneDigits] = useState<string[]>([])
  const [isHovering, setIsHovering] = useState(false)
  const [hasBeenReset, setHasBeenReset] = useState(false)
  const [resetCount, setResetCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [buttonSwapped, setButtonSwapped] = useState(false)
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const buttonContainerRef = useRef<HTMLDivElement>(null)

  // Check if all digits are selected
  const isFormComplete = phoneDigits.every((digit) => digit !== "")

  // Initialize phone digits array based on selected country
  useEffect(() => {
    setPhoneDigits(Array(selectedCountry.digits).fill(""))
  }, [selectedCountry])

  // Update a specific digit in the phone number
  const updateDigit = (index: number, value: string) => {
    const newDigits = [...phoneDigits]
    newDigits[index] = value
    setPhoneDigits(newDigits)

    // If any digit is filled after reset, hide the error message
    if (hasBeenReset && value !== "") {
      setHasBeenReset(false)
    }
  }

  // Reset the form and increment behavior counter
  const incrementBehaviorCounter = () => {
    setResetCount((prevCount) => prevCount + 1)
    setPhoneDigits(Array(selectedCountry.digits).fill(""))
    setHasBeenReset(true)

    // Reset button swapped state
    setButtonSwapped(false)
  }

  // Reset the form
  const handleReset = () => {
    incrementBehaviorCounter()

    // Get a random passive-aggressive message
    const randomIndex = Math.floor(Math.random() * passiveAggressiveMessages.length)
    setErrorMessage(passiveAggressiveMessages[randomIndex])
  }

  // Handle form submission
  const handleSubmit = () => {
    if (isFormComplete) {
      if (resetCount % 3 === 2) {
        // For behavior 3, show the dialog
        setIsDialogOpen(true)
      } else {
        // For other behaviors, show an excuse and reset
        const randomIndex = Math.floor(Math.random() * submissionExcuses.length)
        setErrorMessage(submissionExcuses[randomIndex])
        incrementBehaviorCounter()
      }
    }
  }

  // Handle dialog confirmation
  const handleDialogConfirm = () => {
    setIsDialogOpen(false)
    const randomIndex = Math.floor(Math.random() * submissionExcuses.length)
    setErrorMessage(submissionExcuses[randomIndex])
    incrementBehaviorCounter()
  }

  // Handle dialog cancellation
  const handleDialogCancel = () => {
    setIsDialogOpen(false)
    setErrorMessage("You chose to cancel, but we submitted anyway. Just kidding, we didn't.")
    incrementBehaviorCounter()
  }

  // Get button behavior based on reset count
  const getButtonBehavior = () => {
    switch (resetCount % 3) {
      case 0: // First behavior: horizontal scaling (default)
        return {
          containerClass: "relative h-10 mt-4 overflow-hidden rounded-md",
          resetButtonClass: `h-full transition-all duration-300 ease-in-out ${
            isHovering && isFormComplete ? "w-full" : "w-1/2"
          }`,
          submitButtonClass: `h-full transition-all duration-300 ease-in-out ${
            isHovering && isFormComplete ? "w-0 opacity-0 p-0" : "w-1/2 opacity-100"
          }`,
          submitButtonStyle: {},
          resetButtonStyle: {},
        }

      case 1: // Second behavior: buttons swap places on hover
        return {
          containerClass: "relative h-10 mt-4 overflow-hidden rounded-md",
          resetButtonClass: `h-full w-1/2 transition-all duration-150 ease-in-out ${
            buttonSwapped ? "order-last" : "order-first"
          }`,
          submitButtonClass: `h-full w-1/2 transition-all duration-150 ease-in-out ${
            buttonSwapped ? "order-first" : "order-last"
          }`,
          submitButtonStyle: {},
          resetButtonStyle: {},
        }

      case 2: // Third behavior: scale down really small
        return {
          containerClass: "relative h-10 mt-4 overflow-hidden rounded-md",
          resetButtonClass: "h-full w-1/2 transition-all duration-300 ease-in-out scale-50",
          submitButtonClass: "h-full w-1/2 transition-all duration-300 ease-in-out scale-50",
          submitButtonStyle: {},
          resetButtonStyle: {},
        }
    }
  }

  const buttonBehavior = getButtonBehavior()

  // Handle mouse enter for behavior 2
  const handleMouseEnter = () => {
    if (isFormComplete) {
      if (resetCount % 3 === 0) {
        // Behavior 1: Set hovering state
        setIsHovering(true)
      } else if (resetCount % 3 === 1) {
        // Behavior 2: Swap buttons
        setButtonSwapped(!buttonSwapped)
      }
      // Behavior 3: No hover effect needed
    }
  }

  // Handle mouse leave for behavior 2
  const handleMouseLeave = () => {
    if (resetCount % 3 === 0) {
      // Behavior 1: Reset hovering state
      setIsHovering(false)
    }
    // For behavior 2, we don't reset the swap on mouse leave
    // For behavior 3, no action needed
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
      {/* Country Code Selector */}
      <div className="space-y-2">
        <label htmlFor="country" className="text-sm font-medium">
          Country
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
              <div className="flex items-center gap-2">
                <span>{selectedCountry.flag}</span>
                <span>{selectedCountry.name}</span>
                <span className="text-muted-foreground">{selectedCountry.code}</span>
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup heading="Popular Countries" className="overflow-y-auto">
                  {mainCountries.map((country) => (
                    <CommandItem
                      key={country.name}
                      value={`${country.name} ${country.code}`}
                      onSelect={() => {
                        setSelectedCountry(country)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCountry.name === country.name ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="mr-2">{country.flag}</span>
                      <span>{country.name}</span>
                      <span className="ml-2 text-muted-foreground">{country.code}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Other Lesser Known Countries" className="overflow-y-auto">
                  {otherCountries.map((country) => (
                    <CommandItem
                      key={country.name}
                      value={`${country.name} ${country.code}`}
                      onSelect={() => {
                        setSelectedCountry(country)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCountry.name === country.name ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="mr-2">{country.flag}</span>
                      <span>{country.name}</span>
                      <span className="ml-2 text-muted-foreground">{country.code}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Phone Number Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Phone Number</label>
        <div className="flex items-center space-x-2 w-full">
          <div className="flex-shrink-0 bg-muted px-3 py-2 rounded-md text-sm">{selectedCountry.code}</div>
          <div className="flex gap-1 flex-grow overflow-x-auto">
            {phoneDigits.map((digit, index) => (
              <Select key={index} value={digit} onValueChange={(value) => updateDigit(index, value)}>
                <SelectTrigger className="w-10 min-w-10 px-0 flex justify-center">
                  <SelectValue placeholder="-" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(10)].map((_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {hasBeenReset && (
        <div className="text-red-600 text-sm font-medium mt-2 mb-0" role="alert">
          {errorMessage}
        </div>
      )}

      {/* Reset Count Indicator (for debugging) */}
      {/*<div className="text-xs text-muted-foreground">
        Reset count: {resetCount} (Behavior mode: {(resetCount % 3) + 1})
      </div>/}

      {/* Submit & Reset Buttons */}
      <div
        ref={buttonContainerRef}
        className={buttonBehavior.containerClass}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute inset-0 flex transition-all duration-300 ease-in-out">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className={buttonBehavior.resetButtonClass}
            style={buttonBehavior.resetButtonStyle}
          >
            Reset
          </Button>
          <Button
            ref={submitButtonRef}
            type="button"
            disabled={!isFormComplete}
            onClick={handleSubmit}
            className={buttonBehavior.submitButtonClass}
            style={buttonBehavior.submitButtonStyle}
          >
            Submit
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog for Behavior 3 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Confirm Submission?
            </DialogTitle>
            <DialogDescription>
              You are about to submit this phone number. This action may or may not be reversible, depending on factors
              beyond human comprehension.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              By proceeding, you acknowledge that this phone number might be used for purposes that may or may not
              include contacting you at inconvenient times.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <Button variant="outline" onClick={handleDialogCancel} className="sm:min-w-[180px]">
              Maybe
            </Button>
            <Button onClick={handleDialogConfirm} className="sm:min-w-[180px]">
              Proceed (But Maybe Don't)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

