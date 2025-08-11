// React imports
import { useState, useEffect } from 'react'

// Spark hooks for persistent data storage
import { useKV } from '@github/spark/hooks'

// UI component imports
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Chart component imports from Recharts
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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

// Available compounding frequency options
const compoundingFrequencies = [
  { value: '1', label: 'Annually' },
  { value: '12', label: 'Monthly' }
]

// Available deposit frequency options
const depositFrequencies = [
  { value: '0', label: 'None' },
  { value: '12', label: 'Monthly' },
  { value: '1', label: 'Annual' }
]

/**
 * Compound Interest Calculator Component
 * 
 * Calculates investment growth using compound interest with optional additional deposits.
 * Demonstrates the power of compound interest and regular investing over time.
 * 
 * Educational Purpose:
 * - Shows how money grows exponentially through compound interest
 * - Demonstrates the impact of regular additional deposits
 * - Illustrates different compounding frequencies
 * - Reinforces the importance of starting early and being consistent
 * 
 * Features:
 * - Supports different compounding frequencies (annual, monthly)
 * - Optional additional deposits (monthly or annual)
 * - Real-time calculation updates
 * - Visual chart showing principal vs interest growth
 * - Detailed formula explanation and assumptions
 * - Total return percentage calculation
 */
export default function CompoundInterestCalculator() {
  // Persistent input states - survive page refreshes
  const [principal, setPrincipal] = useKV('compound-principal', '')
  const [interestRate, setInterestRate] = useKV('compound-rate', '')
  const [years, setYears] = useKV('compound-years', '')
  const [compoundingFreq, setCompoundingFreq] = useKV('compound-frequency', '12')
  const [additionalDeposit, setAdditionalDeposit] = useKV('compound-deposit', '')
  const [depositFreq, setDepositFreq] = useKV('compound-deposit-freq', '0')

  // Temporary calculation results - recalculated on input changes
  const [results, setResults] = useState({
    finalAmount: 0,           // Total final value
    totalInterest: 0,         // Interest earned
    totalDeposits: 0,         // Total money put in
    totalReturnPercentage: 0  // Return as percentage
  })

  // Chart data for growth visualization over time
  const [chartData, setChartData] = useState<Array<{year: number, principal: number, interest: number}>>([])

  /**
   * Effect to recalculate compound interest whenever inputs change
   * Uses the compound interest formula: A = P(1 + r/n)^(nt)
   * Plus additional calculations for regular deposits
   */
  useEffect(() => {
    // Convert string inputs to numbers with fallbacks
    const P = parseFloat(principal) || 0        // Principal amount
    const r = parseFloat(interestRate) / 100 || 0  // Interest rate (decimal)
    const t = parseInt(years) || 0              // Time in years
    const n = parseInt(compoundingFreq) || 12   // Compounding frequency per year
    const deposit = parseFloat(additionalDeposit) || 0  // Additional deposit amount
    const depositFreqNum = parseInt(depositFreq) || 0   // Deposit frequency per year

    // Only calculate if we have valid inputs
    if (P > 0 && r >= 0 && t > 0) {
      // Step 1: Calculate compound growth of initial principal
      // Uses the compound interest formula: A = P(1 + r/n)^(nt)
      // Where: P = principal, r = annual rate, n = compounding frequency, t = time in years
      let finalAmount = P * Math.pow(1 + r / n, n * t)
      let totalDeposits = P  // Track total money invested (starts with initial principal)
      
      // Step 2: Calculate future value of additional deposits if specified
      if (deposit > 0 && depositFreqNum > 0) {
        const totalPayments = depositFreqNum * t  // Total number of additional deposits over time
        totalDeposits += deposit * totalPayments  // Add all deposits to total invested
        
        // Calculate future value of each deposit based on when it's made
        // Each deposit compounds for a different amount of time
        // Earlier deposits compound longer than later deposits
        let depositsFutureValue = 0
        
        // Process each deposit individually to account for different compounding periods
        for (let period = 1; period <= totalPayments; period++) {
          // Calculate how long this deposit has to compound (in years)
          // Period 1 deposit compounds for almost the full time
          // Last period deposit compounds for almost no time
          const timeRemaining = t - (period / depositFreqNum)
          
          // Calculate future value of this single deposit using compound interest formula
          const thisDepositFV = deposit * Math.pow(1 + r / n, n * timeRemaining)
          depositsFutureValue += thisDepositFV
        }
        
        // Add the future value of all deposits to the final amount
        finalAmount += depositsFutureValue
      }

      // Step 3: Calculate derived values for display
      const totalInterest = finalAmount - totalDeposits  // Interest earned = Final - Invested
      const totalReturnPercentage = totalDeposits > 0 ? ((finalAmount - totalDeposits) / totalDeposits) * 100 : 0

      setResults({
        finalAmount,
        totalInterest,
        totalDeposits,
        totalReturnPercentage
      })

      // Step 4: Generate chart data showing growth progression year by year
      // This creates data points for the area chart visualization
      const data = []
      for (let year = 0; year <= t; year++) {
        // Calculate how much the initial principal has grown by this year
        let yearAmount = P * Math.pow(1 + r / n, n * year)
        let yearDeposits = P  // Track total deposits made by this year
        
        // Add deposits made up to this point in time
        if (deposit > 0 && depositFreqNum > 0 && year > 0) {
          const paymentsThisYear = Math.floor(depositFreqNum * year)  // Number of deposits made
          yearDeposits += deposit * paymentsThisYear
          
          // Calculate the future value of all deposits made up to this year
          // Each deposit compounds from when it was made until this point
          let depositsFutureValue = 0
          for (let period = 1; period <= paymentsThisYear; period++) {
            const timeRemaining = year - (period / depositFreqNum)
            const thisDepositFV = deposit * Math.pow(1 + r / n, n * timeRemaining)
            depositsFutureValue += thisDepositFV
          }
          
          yearAmount += depositsFutureValue
        }
        
        // Calculate interest portion for chart visualization
        // Interest = Total Value - Money Actually Invested
        const yearInterest = yearAmount - yearDeposits
        
        // Store data point for chart (creates the stacked area visualization)
        data.push({
          year,
          principal: yearDeposits,    // Money put in (orange area in chart)
          interest: yearInterest      // Interest earned (green area in chart)
        })
      }
      setChartData(data)
    } else {
      // Reset results if inputs are invalid
      setResults({
        finalAmount: 0,
        totalInterest: 0,
        totalDeposits: 0,
        totalReturnPercentage: 0
      })
      setChartData([])
    }
  }, [principal, interestRate, years, compoundingFreq, additionalDeposit, depositFreq])

  // Validation check for displaying results
  const hasValidInputs = parseFloat(principal) > 0 && parseFloat(interestRate) >= 0 && parseInt(years) > 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="principal">Principal Amount ($)</Label>
          <Input
            id="principal"
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="10000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="interest-rate">Interest Rate (%)</Label>
          <Input
            id="interest-rate"
            type="number"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="7.0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="years">Years</Label>
          <Input
            id="years"
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            placeholder="10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="compounding-freq">Compounding Frequency</Label>
          <Select value={compoundingFreq} onValueChange={setCompoundingFreq}>
            <SelectTrigger id="compounding-freq">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {compoundingFrequencies.map((freq) => (
                <SelectItem key={freq.value} value={freq.value}>
                  {freq.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="additional-deposit">Additional Deposit ($)</Label>
          <Input
            id="additional-deposit"
            type="number"
            value={additionalDeposit}
            onChange={(e) => setAdditionalDeposit(e.target.value)}
            placeholder="100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deposit-freq">Deposit Frequency</Label>
          <Select value={depositFreq} onValueChange={setDepositFreq}>
            <SelectTrigger id="deposit-freq">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {depositFrequencies.map((freq) => (
                <SelectItem key={freq.value} value={freq.value}>
                  {freq.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasValidInputs && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Final Amount</div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(results.finalAmount)}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Total Interest Earned</div>
                  <div className="text-xl font-semibold text-success">{formatCurrency(results.totalInterest)}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Total Deposits</div>
                  <div className="text-xl font-semibold text-warning">{formatCurrency(results.totalDeposits)}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">Total Return</div>
                  <div className="text-xl font-semibold text-info">{results.totalReturnPercentage.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Growth Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        formatCurrency(value), 
                        name === 'principal' ? 'Principal: ' : 'Interest: '
                      ]}
                      labelFormatter={(label) => `Year ${label}`}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="principal" 
                      stackId="1"
                      stroke="oklch(0.65 0.15 45)" 
                      fill="oklch(0.65 0.15 45)"
                      name="Principal"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="interest" 
                      stackId="1"
                      stroke="oklch(0.5 0.15 140)" 
                      fill="oklch(0.5 0.15 140)"
                      name="Interest"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card className="border-info">
              <CardHeader>
                <CardTitle className="text-info flex items-center gap-2">
                  📐 Formula Used
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Compound Interest Formula:</h4>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                    A = P(1 + r/n)^(nt)
                  </div>
                  <div className="text-sm text-muted-foreground mt-2 space-y-1">
                    <div><strong>A</strong> = Final amount</div>
                    <div><strong>P</strong> = Principal (initial investment)</div>
                    <div><strong>r</strong> = Annual interest rate (decimal)</div>
                    <div><strong>n</strong> = Compounding frequency per year</div>
                    <div><strong>t</strong> = Time in years</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Additional Deposits Formula:</h4>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                    FV = PMT × ((1 + r/n)^(nt) - 1) / (r/n)
                  </div>
                  <div className="text-sm text-muted-foreground mt-2 space-y-1">
                    <div><strong>FV</strong> = Future value of deposits</div>
                    <div><strong>PMT</strong> = Regular deposit amount</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-warning">
              <CardHeader>
                <CardTitle className="text-warning flex items-center gap-2">
                  ⚠️ Key Assumptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-warning mt-0.5">•</span>
                    <span>Interest rate remains constant throughout the investment period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-warning mt-0.5">•</span>
                    <span>Additional deposits are made at the end of each period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-warning mt-0.5">•</span>
                    <span>No withdrawals are made during the investment period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-warning mt-0.5">•</span>
                    <span>All interest is reinvested (compounded) automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-warning mt-0.5">•</span>
                    <span>No taxes or fees are considered in the calculation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-warning mt-0.5">•</span>
                    <span>Market volatility and inflation are not factored in</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="border-accent mt-6">
            <CardHeader>
              <CardTitle className="text-accent flex items-center gap-2">
                💡 Key Lesson
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                <strong>Compound interest is the eighth wonder of the world.</strong> The earlier you start investing, the more time your money has to grow exponentially. 
                Even small amounts invested regularly can become substantial wealth over time due to compounding. The key is starting early and being consistent - 
                time in the market is more powerful than timing the market. A 25-year-old who saves $200/month will have significantly more at retirement than 
                a 35-year-old who saves $400/month, simply because of those extra 10 years of compound growth.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}