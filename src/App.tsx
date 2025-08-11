// React imports
import { useState } from 'react'

// UI component imports from shadcn/ui
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Icon imports from Phosphor Icons
import { TrendUp, Calculator, Timer, CreditCard, Car, House } from '@phosphor-icons/react'

// Calculator component imports
import InflationCalculator from '@/components/calculators/InflationCalculator'
import CompoundInterestCalculator from '@/components/calculators/CompoundInterestCalculator'
import TimeValueMoneyCalculator from '@/components/calculators/TimeValueMoneyCalculator'
import CreditCardCalculator from '@/components/calculators/CreditCardCalculator'
import AutoLoanCalculator from '@/components/calculators/AutoLoanCalculator'
import MortgageCalculator from '@/components/calculators/MortgageCalculator'

// Asset imports
import fhuLogo from '@/assets/images/FHU_COB.jpg'

/**
 * Configuration array defining all available financial calculators
 * Each calculator has an id, display title, icon component, and React component
 */
const calculators = [
  {
    id: 'inflation',
    title: 'Inflation',
    icon: TrendUp,
    component: InflationCalculator
  },
  {
    id: 'compound',
    title: 'Compound Interest',
    icon: Calculator,
    component: CompoundInterestCalculator
  },
  {
    id: 'timevalue',
    title: 'Time Value of Money',
    icon: Timer,
    component: TimeValueMoneyCalculator
  },
  {
    id: 'creditcard',
    title: 'Credit Card Payoff',
    icon: CreditCard,
    component: CreditCardCalculator
  },
  {
    id: 'autoloan',
    title: 'Auto Loan',
    icon: Car,
    component: AutoLoanCalculator
  },
  {
    id: 'mortgage',
    title: 'Mortgage',
    icon: House,
    component: MortgageCalculator
  }
]

// Centralized constant for nav icon size so it is easy to tweak later
const NAV_ICON_SIZE = 64

/**
 * Main App Component
 * 
 * This is the root component for Mrs. Sewell's Financial FREEDom Calculators.
 * It provides a tabbed interface for six different financial calculators used
 * in Personal Financial Planning education.
 * 
 * Features:
 * - Responsive tab navigation (2 columns on mobile, 6 on desktop)
 * - Professional header with college branding
 * - Individual calculator components with persistent state
 * - Modern UI using shadcn/ui components
 */
function App() {
  // State to track which calculator tab is currently active
  // Defaults to 'inflation' as the first calculator
  const [activeTab, setActiveTab] = useState('inflation')

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header section with logo and title */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            {/* College logo */}
            <div className="mr-4">
              <img src={fhuLogo} alt="FHU College of Business" className="w-16 h-16 object-contain rounded-lg" />
            </div>
            {/* Main title and subtitle */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground mb-1">
                Mrs. Sewell's Financial FREEDom Calculators
              </h1>
              <p className="text-muted-foreground text-xl">Personal Finance Made Easy!</p>
            </div>
          </div>
        </div>

        {/* Main calculator tabs interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab navigation list - responsive grid layout */}
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-6 h-auto p-1">
            {calculators.map((calc) => {
              const IconComponent = calc.icon
              return (
                <TabsTrigger
                  key={calc.id}
                  value={calc.id}
                  className="flex flex-col items-center gap-3 p-4 text-lg font-bold"
                >
                  {/* Increased calculator icon size (was 48) */}
                  <IconComponent size={NAV_ICON_SIZE} />
                  <span className="text-center leading-tight text-lg font-bold">{calc.title}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Tab content - individual calculator components */}
            {calculators.map((calc) => {
            const Component = calc.component
            return (
              <TabsContent key={calc.id} value={calc.id} className="mt-0">
                <Card>
                  {/* Card header with calculator icon and title */}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <calc.icon size={28} />
                      {calc.title}
                    </CardTitle>
                  </CardHeader>
                  {/* Card content containing the calculator component */}
                  <CardContent>
                    <Component />
                  </CardContent>
                </Card>
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </div>
  )
}

export default App