import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatNumber = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Newton-Raphson method for finding interest rate
function calculateInterestRate(n: number, pv: number, pmt: number, fv: number): number {
  let rate = 0.1 // Initial guess
  const tolerance = 0.0000001
  const maxIterations = 100

  for (let i = 0; i < maxIterations; i++) {
    const f = pv * Math.pow(1 + rate, n) + pmt * ((Math.pow(1 + rate, n) - 1) / rate) - fv
    const df = n * pv * Math.pow(1 + rate, n - 1) + pmt * (n * Math.pow(1 + rate, n - 1) / rate - (Math.pow(1 + rate, n) - 1) / (rate * rate))
    
    const newRate = rate - f / df
    
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate * 100 // Convert to percentage
    }
    
    rate = newRate
  }
  
  return rate * 100
}

// Newton-Raphson method for finding number of periods
function calculatePeriods(rate: number, pv: number, pmt: number, fv: number): number {
  if (rate === 0) {
    return (fv - pv) / pmt
  }
  
  rate = rate / 100 // Convert from percentage
  
  // Use logarithmic formula for periods
  if (pmt === 0) {
    return Math.log(fv / pv) / Math.log(1 + rate)
  }
  
  // With payments
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

  useEffect(() => {
    const n = parseFloat(periods) || 0
    const rate = parseFloat(interestRate) / 100 || 0
    const pv = parseFloat(presentValue) || 0
    const pmt = parseFloat(payment) || 0
    const fv = parseFloat(futureValue) || 0

    let calculatedResult: number | null = null

    try {
      switch (calculateVariable) {
        case 'periods':
          if (rate !== 0 && (pv !== 0 || pmt !== 0) && fv !== 0) {
            calculatedResult = calculatePeriods(parseFloat(interestRate), pv, pmt, fv)
          }
          break
        case 'rate':
          if (n > 0 && (pv !== 0 || pmt !== 0) && fv !== 0) {
            calculatedResult = calculateInterestRate(n, pv, pmt, fv)
          }
          break
        case 'pv':
          if (n > 0 && rate !== 0 && fv !== 0) {
            if (pmt === 0) {
              calculatedResult = fv / Math.pow(1 + rate, n)
            } else {
              calculatedResult = (fv - pmt * ((Math.pow(1 + rate, n) - 1) / rate)) / Math.pow(1 + rate, n)
            }
          }
          break
        case 'pmt':
          if (n > 0 && rate !== 0 && (pv !== 0 || fv !== 0)) {
            const pvFactor = pv * Math.pow(1 + rate, n)
            const annuityFactor = (Math.pow(1 + rate, n) - 1) / rate
            calculatedResult = (fv - pvFactor) / annuityFactor
          }
          break
        case 'fv':
          if (n > 0 && rate >= 0) {
            if (rate === 0) {
              calculatedResult = pv + pmt * n
            } else {
              calculatedResult = pv * Math.pow(1 + rate, n) + pmt * ((Math.pow(1 + rate, n) - 1) / rate)
            }
          }
          break
      }
    } catch (error) {
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
    </div>
  )
}