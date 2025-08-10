import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TrendUp, Calculator, Timer, CreditCard, Car, House } from '@phosphor-icons/react'
import InflationCalculator from '@/components/calculators/InflationCalculator'
import CompoundInterestCalculator from '@/components/calculators/CompoundInterestCalculator'
import TimeValueMoneyCalculator from '@/components/calculators/TimeValueMoneyCalculator'
import CreditCardCalculator from '@/components/calculators/CreditCardCalculator'
import AutoLoanCalculator from '@/components/calculators/AutoLoanCalculator'
import MortgageCalculator from '@/components/calculators/MortgageCalculator'
import fhuLogo from '@/assets/images/FHU_COB.jpg'

const calculators = [
  {
    id: 'inflation',
    title: 'Inflation Calculator',
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

function App() {
  const [activeTab, setActiveTab] = useState('inflation')

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="mr-4">
              <img src={fhuLogo} alt="FHU College of Business" className="w-16 h-16 object-contain rounded-lg" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground mb-1">
                Mrs. Sewell's Financial FREEDom Calculators
              </h1>
              <p className="text-muted-foreground text-lg">Personal Finance Made Easy</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-6 h-auto p-1">
            {calculators.map((calc) => {
              const IconComponent = calc.icon
              return (
                <TabsTrigger
                  key={calc.id}
                  value={calc.id}
                  className="flex flex-col items-center gap-2 p-4 text-xs"
                >
                  <IconComponent size={20} />
                  <span className="text-center leading-tight">{calc.title}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {calculators.map((calc) => {
            const Component = calc.component
            return (
              <TabsContent key={calc.id} value={calc.id} className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <calc.icon size={24} />
                      {calc.title}
                    </CardTitle>
                  </CardHeader>
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