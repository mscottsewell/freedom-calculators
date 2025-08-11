import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

interface PaymentDetail {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
}

export default function AutoLoanCalculator() {
  const [loanAmount, setLoanAmount] = useKV('auto-loan-amount', '')
  const [interestRate, setInterestRate] = useKV('auto-interest-rate', '')
  const [loanTerm, setLoanTerm] = useKV('auto-loan-term', '')

  const [results, setResults] = useState({
    monthlyPayment: 0,
    totalInterest: 0,
    totalPaid: 0
  })

  const [amortizationSchedule, setAmortizationSchedule] = useState<PaymentDetail[]>([])

  /**
   * Effect to calculate auto loan payment and amortization schedule whenever inputs change
   * 
   * Auto loan calculations use the standard amortizing loan formula where:
   * 1. Monthly payment is fixed for the entire loan term
   * 2. Each payment contains both principal and interest portions
   * 3. Early payments are mostly interest; later payments are mostly principal
   * 4. The balance decreases to zero over the loan term
   * 
   * Mathematical Background:
   * Monthly Payment Formula: PMT = P × [r(1+r)^n] / [(1+r)^n - 1]
   * Where: P = Principal, r = monthly rate, n = number of payments
   * 
   * Educational Purpose:
   * - Shows the true cost of financing a car purchase
   * - Demonstrates how loan term affects monthly payment and total interest
   * - Illustrates the amortization process and payment allocation
   * - Helps students understand the trade-offs between payment amount and loan duration
   */
  useEffect(() => {
    // Convert string inputs to numbers with fallbacks
    const principal = parseFloat(loanAmount) || 0    // Total amount borrowed
    const annualRate = parseFloat(interestRate) / 100 || 0  // Annual interest rate (as decimal)
    const years = parseInt(loanTerm) || 0            // Loan term in years

    // Only calculate if we have valid positive inputs
    if (principal > 0 && annualRate >= 0 && years > 0) {
      const monthlyRate = annualRate / 12              // Convert annual rate to monthly
      const numberOfPayments = years * 12             // Total number of monthly payments

      let monthlyPayment: number
      
      // Handle special case of 0% interest (simple division)
      if (annualRate === 0) {
        monthlyPayment = principal / numberOfPayments
      } else {
        // Standard amortizing loan payment formula
        // PMT = P × [r(1+r)^n] / [(1+r)^n - 1]
        // This ensures the loan is fully paid off in exactly n payments
        const numerator = monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)
        const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1
        monthlyPayment = principal * (numerator / denominator)
      }

      // Generate complete amortization schedule
      let remainingBalance = principal
      let totalInterestPaid = 0
      const schedule: PaymentDetail[] = []

      // Calculate each payment's allocation between principal and interest
      for (let month = 1; month <= numberOfPayments; month++) {
        // Interest portion: remaining balance × monthly rate
        const interestPayment = remainingBalance * monthlyRate
        
        // Principal portion: total payment - interest portion
        const principalPayment = monthlyPayment - interestPayment
        
        // Update remaining balance by subtracting principal payment
        remainingBalance = Math.max(0, remainingBalance - principalPayment)
        
        // Accumulate total interest paid over loan life
        totalInterestPaid += interestPayment

        // Record this payment's details
        schedule.push({
          month,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: remainingBalance
        })
      }

      // Update results with calculated values
      setResults({
        monthlyPayment,
        totalInterest: totalInterestPaid,
        totalPaid: principal + totalInterestPaid  // Original loan + all interest
      })

      setAmortizationSchedule(schedule)
    } else {
      // Reset results if inputs are invalid
      setResults({
        monthlyPayment: 0,
        totalInterest: 0,
        totalPaid: 0
      })
      setAmortizationSchedule([])
    }
  }, [loanAmount, interestRate, loanTerm])

  const hasValidInputs = parseFloat(loanAmount) > 0 && parseFloat(interestRate) >= 0 && parseInt(loanTerm) > 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="loan-amount">Loan Amount ($)</Label>
          <Input
            id="loan-amount"
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder="25000"
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
            placeholder="4.5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="loan-term">Loan Term (Years)</Label>
          <Input
            id="loan-term"
            type="number"
            value={loanTerm}
            onChange={(e) => setLoanTerm(e.target.value)}
            placeholder="5"
          />
        </div>
      </div>

      {hasValidInputs && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Loan Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Monthly Payment</div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(results.monthlyPayment)}</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Total Interest</div>
                  <div className="text-xl font-semibold text-destructive">{formatCurrency(results.totalInterest)}</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
                  <div className="text-xl font-semibold text-foreground">{formatCurrency(results.totalPaid)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertDescription>
              <strong>Understanding Your Auto Loan:</strong> For a loan amount of {formatCurrency(parseFloat(loanAmount))} at 
              {interestRate}% interest over {loanTerm} years, you'll pay {formatCurrency(results.monthlyPayment)} per
              month. Over the life of the loan, you'll pay {formatCurrency(results.totalInterest)} in interest, 
              making your total cost {formatCurrency(results.totalPaid)}.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Complete Amortization Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full">
                <div className="pr-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Payment #</TableHead>
                        <TableHead className="text-right">Payment</TableHead>
                        <TableHead className="text-right">Principal</TableHead>
                        <TableHead className="text-right">Interest</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {amortizationSchedule.map((payment) => (
                        <TableRow key={payment.month}>
                          <TableCell>{payment.month}</TableCell>
                          <TableCell className="text-right">{formatCurrency(payment.payment)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(payment.principal)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(payment.interest)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(payment.balance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}

      {hasValidInputs && (
        <Card className="border-accent">
          <CardHeader>
            <CardTitle className="text-accent flex items-center gap-2">
              💡 Key Lesson
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              <strong>Cars are depreciating assets that require smart financing.</strong> Unlike a home that may appreciate, a car loses value the moment you drive it off the lot. 
              This makes the interest rate and loan term crucial factors in your total cost. A longer loan term means lower monthly payments but significantly more interest paid over time. 
              Consider the total cost of ownership, not just the monthly payment, and remember that reliable transportation is the goal - not impressing others with an expensive car payment.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}