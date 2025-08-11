// React imports
import { useState, useEffect } from 'react'

// Spark hooks for persistent data storage
import { useKV } from '@github/spark/hooks'

// UI component imports
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

/**
 * Formats a number as currency with proper thousands separators
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
 */
const formatNumber = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Newton-Raphson method for calculating interest rate in TVM problems
 * 
 * This is an iterative numerical method used to find the interest rate when other
 * TVM variables are known. The method works by making successive approximations
 * until it converges on the correct answer.
 * 
 * Mathematical Background:
 * - Uses the derivative of the TVM equation to find the root (where equation equals zero)
 * - Formula: f(r) = PV(1+r)^n + PMT[((1+r)^n - 1)/r] - FV = 0
 * - Each iteration: r_new = r_old - f(r)/f'(r)
 * 
 * @param n - Number of compounding periods
 * @param pv - Present value (amount invested/borrowed today)
 * @param pmt - Payment amount per period (positive for payments received)
 * @param fv - Future value (target amount)
 * @returns Interest rate as percentage (e.g., 5.0 for 5%)
 */
function calculateInterestRate(n: number, pv: number, pmt: number, fv: number): number {
  let rate = 0.1 // Initial guess at 10% - a reasonable starting point for most financial scenarios
  const tolerance = 0.0000001 // Convergence threshold - stop when changes are smaller than this
  const maxIterations = 100   // Prevent infinite loops in case convergence fails

  for (let i = 0; i < maxIterations; i++) {
    // Calculate the TVM equation value at current rate guess
    // f(r) represents how far we are from the target (should equal zero when solved)
    const f = pv * Math.pow(1 + rate, n) + pmt * ((Math.pow(1 + rate, n) - 1) / rate) - fv
    
    // Calculate the derivative of the TVM equation (slope at current point)
    // This tells us which direction and how much to adjust our guess
    const df = n * pv * Math.pow(1 + rate, n - 1) + pmt * (n * Math.pow(1 + rate, n - 1) / rate - (Math.pow(1 + rate, n) - 1) / (rate * rate))
    
    // Calculate the next approximation using Newton-Raphson formula
    const newRate = rate - f / df
    
    // Check if we've converged (change is smaller than our tolerance)
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate * 100 // Convert to percentage and return final answer
    }
    
    // Update rate for next iteration
    rate = newRate
  }
  
  // If we reach here, convergence failed - return current best guess
  return rate * 100
}

/**
 * Calculate the number of periods needed to reach a future value
 * 
 * This function determines how many payment periods (months, years, etc.) are needed
 * to grow a present value to a target future value, given an interest rate and payment amount.
 * 
 * Mathematical Background:
 * - For simple compound interest (no payments): n = ln(FV/PV) / ln(1+r)
 * - For annuities (with payments): n = ln((FV*r + PMT)/(PV*r + PMT)) / ln(1+r)
 * - Special case: when r=0, growth is linear: n = (FV - PV) / PMT
 * 
 * @param rate - Interest rate as percentage (e.g., 5 for 5%)
 * @param pv - Present value (starting amount)
 * @param pmt - Payment amount per period (0 if no payments)
 * @param fv - Future value (target amount)
 * @returns Number of periods needed to reach the future value
 */
function calculatePeriods(rate: number, pv: number, pmt: number, fv: number): number {
  // Handle the special case where there's no interest rate (0%)
  // In this case, growth is purely linear from payments
  if (rate === 0) {
    return (fv - pv) / pmt
  }
  
  rate = rate / 100 // Convert from percentage to decimal (5% becomes 0.05)
  
  // Case 1: No payments - simple compound interest formula
  // Uses natural logarithm to solve: PV(1+r)^n = FV for n
  if (pmt === 0) {
    return Math.log(fv / pv) / Math.log(1 + rate)
  }
  
  // Case 2: With payments - annuity formula
  // Solve: PV(1+r)^n + PMT[((1+r)^n - 1)/r] = FV for n
  // Rearranged to: n = ln((FV*r + PMT)/(PV*r + PMT)) / ln(1+r)
  const numerator = Math.log((fv * rate + pmt) / (pv * rate + pmt))
  const denominator = Math.log(1 + rate)
  
  return numerator / denominator
}

export default function TimeValueMoneyCalculator() {
  const [periods, setPeriods] = useKV('tvm-periods', '')
  const [interestRate, setInterestRate] = useKV('tvm-rate', '')
  const [presentValue, setPresentValue] = useKV('tvm-pv', '')
  const [payment, setPayment] = useKV('tvm-pmt', '')
  const [futureValue, setFutureValue] = useKV('tvm-fv', '')
  const [calculateVariable, setCalculateVariable] = useKV('tvm-calculate', 'fv')

  const [result, setResult] = useState<number | null>(null)

  /**
   * Effect to recalculate the selected TVM variable whenever inputs change
   * 
   * Time Value of Money calculations use the fundamental equation:
   * PV(1+r)^n + PMT[((1+r)^n - 1)/r] = FV
   * 
   * This equation can be rearranged to solve for any one variable when the others are known:
   * - Present Value (PV): What amount today equals a future amount?
   * - Future Value (FV): What will an amount grow to over time?
   * - Payment (PMT): What regular payment is needed to reach a goal?
   * - Periods (N): How long will it take to reach a financial goal?
   * - Interest Rate (I): What return rate is needed to meet goals?
   */
  useEffect(() => {
    // Convert string inputs to numbers with fallbacks
    const n = parseFloat(periods) || 0          // Number of periods
    const rate = parseFloat(interestRate) / 100 || 0  // Interest rate (as decimal)
    const pv = parseFloat(presentValue) || 0    // Present value
    const pmt = parseFloat(payment) || 0        // Payment amount
    const fv = parseFloat(futureValue) || 0     // Future value

    let calculatedResult: number | null = null

    try {
      switch (calculateVariable) {
        case 'periods':
          // Calculate number of periods needed to reach future value
          // Requires: interest rate, present value or payment, and future value
          if (rate !== 0 && (pv !== 0 || pmt !== 0) && fv !== 0) {
            calculatedResult = calculatePeriods(parseFloat(interestRate), pv, pmt, fv)
          }
          break
          
        case 'rate':
          // Calculate required interest rate using Newton-Raphson method
          // Requires: number of periods, present value or payment, and future value
          if (n > 0 && (pv !== 0 || pmt !== 0) && fv !== 0) {
            calculatedResult = calculateInterestRate(n, pv, pmt, fv)
          }
          break
          
        case 'pv':
          // Calculate present value (what amount today equals the future value)
          // Formula: PV = (FV - PMT*annuity_factor) / (1+r)^n
          if (n > 0 && rate !== 0 && fv !== 0) {
            if (pmt === 0) {
              // Simple present value: PV = FV / (1+r)^n
              calculatedResult = fv / Math.pow(1 + rate, n)
            } else {
              // Present value with payments: subtract the present value of annuity payments
              const annuityPV = pmt * ((Math.pow(1 + rate, n) - 1) / rate)
              calculatedResult = (fv - annuityPV) / Math.pow(1 + rate, n)
            }
          }
          break
          
        case 'pmt':
          // Calculate required payment to reach future value from present value
          // Formula: PMT = (FV - PV(1+r)^n) / [((1+r)^n - 1)/r]
          if (n > 0 && rate !== 0 && (pv !== 0 || fv !== 0)) {
            const pvFactor = pv * Math.pow(1 + rate, n)     // Future value of present amount
            const annuityFactor = (Math.pow(1 + rate, n) - 1) / rate  // Annuity factor
            calculatedResult = (fv - pvFactor) / annuityFactor
          }
          break
          
        case 'fv':
          // Calculate future value from present value and/or payments
          // Formula: FV = PV(1+r)^n + PMT[((1+r)^n - 1)/r]
          if (n > 0 && rate >= 0) {
            if (rate === 0) {
              // No interest: FV = PV + PMT * n (simple addition)
              calculatedResult = pv + pmt * n
            } else {
              // With interest: compound present value + future value of annuity
              const compoundedPV = pv * Math.pow(1 + rate, n)  // Future value of lump sum
              const annuityFV = pmt * ((Math.pow(1 + rate, n) - 1) / rate)  // Future value of payments
              calculatedResult = compoundedPV + annuityFV
            }
          }
          break
      }
    } catch (error) {
      // Handle any mathematical errors (division by zero, invalid logarithms, etc.)
      calculatedResult = null
    }

    setResult(calculatedResult)
  }, [periods, interestRate, presentValue, payment, futureValue, calculateVariable])

  const getInputProps = (variable: string) => ({
    disabled: calculateVariable === variable,
    className: calculateVariable === variable ? 'bg-muted text-muted-foreground' : '',
    placeholder: calculateVariable === variable ? 'To be calculated' : undefined
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="calculate-var">Calculate</Label>
          <Select value={calculateVariable} onValueChange={setCalculateVariable}>
            <SelectTrigger id="calculate-var">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="periods">Number of Periods</SelectItem>
              <SelectItem value="rate">Interest Rate</SelectItem>
              <SelectItem value="pv">Present Value</SelectItem>
              <SelectItem value="pmt">Payment</SelectItem>
              <SelectItem value="fv">Future Value</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="periods">Number of Periods</Label>
          <Input
            id="periods"
            type="number"
            value={calculateVariable === 'periods' ? '' : periods}
            onChange={(e) => setPeriods(e.target.value)}
            placeholder="10"
            {...getInputProps('periods')}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="interest-rate">Interest Rate (%)</Label>
          <Input
            id="interest-rate"
            type="number"
            step="0.1"
            value={calculateVariable === 'rate' ? '' : interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="5.0"
            {...getInputProps('rate')}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="present-value">Present Value ($)</Label>
          <Input
            id="present-value"
            type="number"
            value={calculateVariable === 'pv' ? '' : presentValue}
            onChange={(e) => setPresentValue(e.target.value)}
            placeholder="1000"
            {...getInputProps('pv')}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="payment">Payment ($)</Label>
          <Input
            id="payment"
            type="number"
            value={calculateVariable === 'pmt' ? '' : payment}
            onChange={(e) => setPayment(e.target.value)}
            placeholder="100"
            {...getInputProps('pmt')}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="future-value">Future Value ($)</Label>
          <Input
            id="future-value"
            type="number"
            value={calculateVariable === 'fv' ? '' : futureValue}
            onChange={(e) => setFutureValue(e.target.value)}
            placeholder="2000"
            {...getInputProps('fv')}
          />
        </div>
      </div>

      {result !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Calculated Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6">
              <div className="text-sm text-muted-foreground mb-2">
                {calculateVariable === 'periods' && 'Number of Periods'}
                {calculateVariable === 'rate' && 'Interest Rate'}
                {calculateVariable === 'pv' && 'Present Value'}
                {calculateVariable === 'pmt' && 'Payment'}
                {calculateVariable === 'fv' && 'Future Value'}
              </div>
              <div className="text-3xl font-bold text-primary">
                {calculateVariable === 'rate' && `${formatNumber(result)}%`}
                {(calculateVariable === 'pv' || calculateVariable === 'pmt' || calculateVariable === 'fv') && formatCurrency(result)}
                {calculateVariable === 'periods' && `${formatNumber(result)} periods`}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertDescription>
          <strong>Understanding the Time Value of Money:</strong> The time value of money means a dollar today 
          is worth more than a dollar in the future because it can grow through interest or investment. 
          This concept shows that the earlier you start saving, the less you need to set aside to reach your goals. 
          It helps you calculate how much to save, based on a given interest rate, to meet future financial needs.
        </AlertDescription>
      </Alert>

      <Card className="border-accent">
        <CardHeader>
          <CardTitle className="text-accent flex items-center gap-2">
            💡 Key Lesson
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">
            <strong>Time is your most valuable financial asset.</strong> The time value of money is the foundation of all personal finance decisions. 
            Whether you're saving for retirement, a house, or any major purchase, understanding that money grows over time helps you make smarter choices. 
            It explains why paying off high-interest debt quickly is crucial, why starting to save early is so powerful, and why delaying financial goals 
            becomes increasingly expensive. Master this concept, and you'll understand why wealthy people often say "time is money."
          </p>
        </CardContent>
      </Card>
    </div>
  )
}