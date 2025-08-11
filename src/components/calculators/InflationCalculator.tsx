// React imports
import { useState, useEffect } from 'react'

// Spark hooks for persistent data storage
import { useKV } from '@github/spark/hooks'

// UI component imports
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Chart component imports from Recharts
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

/**
 * Formats a number as currency with proper thousands separators
 * @param amount - The numeric amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Formats a number with proper thousands separators and decimal places
 * @param amount - The numeric amount to format
 * @returns Formatted number string (e.g., "1,234.56")
 */
const formatNumber = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Inflation Calculator Component
 * 
 * Calculates how inflation affects purchasing power over time and displays
 * the results with an interactive chart visualization.
 * 
 * Educational Purpose:
 * - Demonstrates the real impact of inflation on money's value
 * - Shows why keeping money in low-yield accounts loses purchasing power
 * - Helps students understand why investments must beat inflation
 * 
 * Features:
 * - Persistent input storage using useKV
 * - Real-time calculation updates
 * - Visual chart showing purchasing power decline
 * - Detailed explanation of results
 * - Key lesson reinforcement
 */
export default function InflationCalculator() {
  // Persistent input states - survive page refreshes
  const [currentAmount, setCurrentAmount] = useKV('inflation-current-amount', '')
  const [inflationRate, setInflationRate] = useKV('inflation-rate', '')
  const [years, setYears] = useKV('inflation-years', '')
  
  // Temporary calculation results - recalculated on input changes
  const [results, setResults] = useState({
    futureValue: 0,      // What the amount would be worth nominally
    realValue: 0,        // What it can actually buy (purchasing power)
    purchasingPowerLost: 0,  // Amount of purchasing power lost
    percentageLost: 0    // Percentage of purchasing power lost
  })

  // Chart data for purchasing power visualization over time
  const [chartData, setChartData] = useState<Array<{year: number, purchasingPower: number, originalValue: number}>>([])

  /**
   * Effect to recalculate inflation impact whenever inputs change
   * Uses the compound inflation formula: Real Value = Amount / (1 + rate)^years
   */
  useEffect(() => {
    // Convert string inputs to numbers with fallbacks
    const amount = parseFloat(currentAmount) || 0
    const rate = parseFloat(inflationRate) / 100 || 0  // Convert percentage to decimal
    const numYears = parseInt(years) || 0

    // Only calculate if we have valid positive inputs
    if (amount > 0 && rate >= 0 && numYears > 0) {
      // Step 1: Calculate future nominal value (what the dollar amount will be)
      // This shows what the number on paper will say, but not its actual buying power
      // Formula: FV = PV × (1 + inflation_rate)^years
      const futureValue = amount * Math.pow(1 + rate, numYears)
      
      // Step 2: Calculate real purchasing power value (what it can actually buy)
      // This is the key calculation - it shows what today's amount will be worth
      // in today's purchasing power after accounting for inflation
      // Formula: Real Value = Present Value / (1 + inflation_rate)^years
      // This is the "deflating" of future dollars back to today's buying power
      const realValue = amount / Math.pow(1 + rate, numYears)
      
      // Step 3: Calculate the loss in purchasing power
      // This shows how much buying power is lost to inflation
      const purchasingPowerLost = amount - realValue
      const percentageLost = (purchasingPowerLost / amount) * 100

      setResults({
        futureValue,
        realValue,
        purchasingPowerLost,
        percentageLost
      })

      // Step 4: Generate chart data showing purchasing power decline year by year
      // This creates a visual representation of how inflation erodes value over time
      const data = []
      for (let year = 0; year <= numYears; year++) {
        // Calculate purchasing power for each year
        // Year 0 = full purchasing power, each subsequent year loses value
        const purchasingPower = amount / Math.pow(1 + rate, year)
        data.push({
          year,
          purchasingPower,                    // Declining line (red area)
          originalValue: amount               // Reference line showing original value (stays flat)
        })
      }
      setChartData(data)
    } else {
      // Reset results if inputs are invalid
      setResults({
        futureValue: 0,
        realValue: 0,
        purchasingPowerLost: 0,
        percentageLost: 0
      })
      setChartData([])
    }
  }, [currentAmount, inflationRate, years])

  // Validation check for displaying results
  const hasValidInputs = parseFloat(currentAmount) > 0 && parseFloat(inflationRate) >= 0 && parseInt(years) > 0

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="current-amount">Current Amount ($)</Label>
          <Input
            id="current-amount"
            type="number"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            placeholder="10000"
          />
        </div>
        
        {/* Inflation Rate Input */}
        <div className="space-y-2">
          <Label htmlFor="inflation-rate">Inflation Rate (%)</Label>
          <Input
            id="inflation-rate"
            type="number"
            step="0.1"
            value={inflationRate}
            onChange={(e) => setInflationRate(e.target.value)}
            placeholder="3.0"
          />
        </div>
        
        {/* Years Input */}
        <div className="space-y-2">
          <Label htmlFor="years">Number of Years</Label>
          <Input
            id="years"
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="10"
          />
        </div>
      </div>

      {/* Results Section - Only show if inputs are valid */}
      {hasValidInputs && (
        <>
          {/* Results Display and Chart */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Numerical Results Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Impact of Inflation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Future nominal value - what the number will be */}
                <div className="flex justify-between">
                  <span>Future nominal value:</span>
                  <span className="font-semibold text-primary">{formatCurrency(results.futureValue)}</span>
                </div>
                
                {/* Real purchasing power - what it can actually buy */}
                <div className="flex justify-between">
                  <span>Real purchasing power:</span>
                  <span className="font-semibold text-success">{formatCurrency(results.realValue)}</span>
                </div>
                
                {/* Purchasing power lost - absolute amount */}
                <div className="flex justify-between">
                  <span>Purchasing power lost:</span>
                  <span className="font-semibold text-destructive">{formatCurrency(results.purchasingPowerLost)}</span>
                </div>
                
                {/* Percentage lost - relative impact */}
                <div className="flex justify-between">
                  <span>Percentage lost:</span>
                  <span className="font-semibold text-destructive">{formatNumber(results.percentageLost)}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Purchasing Power Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Purchasing Power Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    {/* Grid lines for readability */}
                    <CartesianGrid strokeDasharray="3 3" />
                    
                    {/* X-axis showing years */}
                    <XAxis dataKey="year" />
                    
                    {/* Y-axis showing dollar amounts in thousands */}
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    
                    {/* Tooltip showing detailed values on hover */}
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Purchasing Power']}
                      labelFormatter={(label) => `Year ${label}`}
                    />
                    
                    {/* Area chart showing purchasing power decline (red color) */}
                    <Area 
                      type="monotone" 
                      dataKey="purchasingPower" 
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Explanation Alert */}
          <Alert>
            <AlertDescription>
              <strong>What This Means:</strong> With inflation at {inflationRate}% per year, your {formatCurrency(parseFloat(currentAmount))} today
              will only have the purchasing power of {formatCurrency(results.realValue)} in {years} years. 
              You'll lose {formatCurrency(results.purchasingPowerLost)} ({formatNumber(results.percentageLost)}%) in
              purchasing power due to inflation.
            </AlertDescription>
          </Alert>

          {/* Key Lesson Card for Educational Reinforcement */}
          <Card className="border-accent">
            <CardHeader>
              <CardTitle className="text-accent flex items-center gap-2">
                💡 Key Lesson
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                <strong>Inflation is the silent wealth killer.</strong> Even at modest rates like 3% annually, inflation significantly erodes your purchasing power over time. 
                This is why keeping money in low-yield savings accounts or "under the mattress" actually causes you to lose money in real terms. 
                To preserve and grow wealth, your investments must earn returns that exceed the inflation rate. Understanding inflation's impact 
                is crucial for making informed decisions about saving, investing, and financial planning.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}