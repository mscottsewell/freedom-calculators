import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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

interface YearlyData {
  year: number
  beginningBalance: number
  totalPayments: number
  principalPaid: number
  interestPaid: number
  endingBalance: number
}

interface PaymentDetail {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
}

export default function MortgageCalculator() {
  const [loanAmount, setLoanAmount] = useKV('mortgage-loan-amount', '')
  const [interestRate, setInterestRate] = useKV('mortgage-interest-rate', '')
  const [loanTerm, setLoanTerm] = useKV('mortgage-loan-term', '')

  const [results, setResults] = useState({
    monthlyPayment: 0,
    totalInterest: 0,
    totalPaid: 0
  })

  const [yearlySchedule, setYearlySchedule] = useState<YearlyData[]>([])
  const [monthlySchedule, setMonthlySchedule] = useState<PaymentDetail[]>([])

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
      const monthlyData: PaymentDetail[] = []
      const yearlyData: YearlyData[] = []

      for (let month = 1; month <= numberOfPayments; month++) {
        const interestPayment = remainingBalance * monthlyRate
        const principalPayment = monthlyPayment - interestPayment
        remainingBalance = Math.max(0, remainingBalance - principalPayment)
        totalInterestPaid += interestPayment

        monthlyData.push({
          month,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: remainingBalance
        })

        // Aggregate by year
        const currentYear = Math.ceil(month / 12)
        const isLastMonthOfYear = month % 12 === 0 || month === numberOfPayments

        if (isLastMonthOfYear) {
          const yearStart = (currentYear - 1) * 12 + 1
          const yearEnd = Math.min(currentYear * 12, numberOfPayments)
          const yearPayments = monthlyData.slice(yearStart - 1, yearEnd)
          
          const beginningBalance = yearStart === 1 ? principal : monthlyData[yearStart - 2].balance
          const totalPayments = yearPayments.reduce((sum, p) => sum + p.payment, 0)
          const principalPaid = yearPayments.reduce((sum, p) => sum + p.principal, 0)
          const interestPaid = yearPayments.reduce((sum, p) => sum + p.interest, 0)
          const endingBalance = yearPayments[yearPayments.length - 1].balance

          yearlyData.push({
            year: currentYear,
            beginningBalance,
            totalPayments,
            principalPaid,
            interestPaid,
            endingBalance
          })
        }
      }

      setResults({
        monthlyPayment,
        totalInterest: totalInterestPaid,
        totalPaid: principal + totalInterestPaid
      })

      setYearlySchedule(yearlyData)
      setMonthlySchedule(monthlyData)
    } else {
      setResults({
        monthlyPayment: 0,
        totalInterest: 0,
        totalPaid: 0
      })
      setYearlySchedule([])
      setMonthlySchedule([])
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
            placeholder="300000"
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
            placeholder="3.5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="loan-term">Loan Term (Years)</Label>
          <Input
            id="loan-term"
            type="number"
            value={loanTerm}
            onChange={(e) => setLoanTerm(e.target.value)}
            placeholder="30"
          />
        </div>
      </div>

      {hasValidInputs && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mortgage Summary</CardTitle>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Yearly Amortization Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full">
                  <div className="pr-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Year</TableHead>
                          <TableHead className="text-right">Begin Balance</TableHead>
                          <TableHead className="text-right">Payments</TableHead>
                          <TableHead className="text-right">Principal</TableHead>
                          <TableHead className="text-right">Interest</TableHead>
                          <TableHead className="text-right">End Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {yearlySchedule.map((year) => (
                          <TableRow key={year.year}>
                            <TableCell>{year.year}</TableCell>
                            <TableCell className="text-right">{formatCurrency(year.beginningBalance)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(year.totalPayments)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(year.principalPaid)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(year.interestPaid)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(year.endingBalance)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Payment Breakdown</CardTitle>
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
                        {monthlySchedule.map((payment) => (
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
          </div>
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
              <strong>Your home can be your largest investment or your biggest financial mistake.</strong> A mortgage allows you to leverage borrowed money to potentially build wealth through real estate appreciation. 
              However, the total interest paid over 30 years often equals or exceeds the original loan amount. Making extra principal payments early in the loan dramatically reduces total interest costs. 
              Remember that a home isn't just an investment - it provides shelter and stability. Buy what you can afford, not what the bank will lend you.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}