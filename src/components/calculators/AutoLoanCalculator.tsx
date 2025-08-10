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

  useEffect(() => {
    const principal = parseFloat(loanAmount) || 0
    const annualRate = parseFloat(interestRate) / 100 || 0
    const years = parseInt(loanTerm) || 0

    if (principal > 0 && annualRate >= 0 && years > 0) {
      const monthlyRate = annualRate / 12
      const numberOfPayments = years * 12

      let monthlyPayment: number
      
      if (annualRate === 0) {
        monthlyPayment = principal / numberOfPayments
      } else {
        monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      }

      let remainingBalance = principal
      let totalInterestPaid = 0
      const schedule: PaymentDetail[] = []

      for (let month = 1; month <= numberOfPayments; month++) {
        const interestPayment = remainingBalance * monthlyRate
        const principalPayment = monthlyPayment - interestPayment
        remainingBalance = Math.max(0, remainingBalance - principalPayment)
        totalInterestPaid += interestPayment

        schedule.push({
          month,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: remainingBalance
        })
      }

      setResults({
        monthlyPayment,
        totalInterest: totalInterestPaid,
        totalPaid: principal + totalInterestPaid
      })

      setAmortizationSchedule(schedule)
    } else {
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
              <strong>Understanding Your Auto Loan:</strong> For a loan amount of {formatCurrency(parseFloat(loanAmount))} 
              at {interestRate}% interest over {loanTerm} years, you'll pay {formatCurrency(results.monthlyPayment)} 
              per month. Over the life of the loan, you'll pay {formatCurrency(results.totalInterest)} in interest, 
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
    </div>
  )
}