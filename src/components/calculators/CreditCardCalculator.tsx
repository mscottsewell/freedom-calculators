import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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
  year: number
}

export default function CreditCardCalculator() {
  const [balance, setBalance] = useKV('credit-balance', '')
  const [apr, setApr] = useKV('credit-apr', '')
  const [paymentType, setPaymentType] = useKV('credit-payment-type', 'minimum')
  const [fixedPayment, setFixedPayment] = useKV('credit-fixed-payment', '')

  const [results, setResults] = useState({
    monthsToPayoff: 0,
    totalInterest: 0,
    totalPaid: 0,
    monthlyPayment: 0
  })

  const [paymentSchedule, setPaymentSchedule] = useState<PaymentDetail[]>([])
  const [chartData, setChartData] = useState<Array<{month: number, principal: number, interest: number}>>([])

  useEffect(() => {
    const currentBalance = parseFloat(balance) || 0
    const annualRate = parseFloat(apr) / 100 || 0
    const monthlyRate = annualRate / 12
    const fixedPmt = parseFloat(fixedPayment) || 0

    if (currentBalance > 0 && annualRate > 0) {
      let remainingBalance = currentBalance
      let month = 0
      let totalInterestPaid = 0
      const schedule: PaymentDetail[] = []
      const maxMonths = 600 // Prevent infinite loops

      while (remainingBalance > 0.01 && month < maxMonths) {
        month++
        const interestPayment = remainingBalance * monthlyRate
        
        let payment: number
        if (paymentType === 'minimum') {
          payment = Math.max(interestPayment + remainingBalance * 0.01, 25) // Minimum payment
        } else {
          payment = fixedPmt
        }

        // Ensure payment doesn't exceed remaining balance + interest
        payment = Math.min(payment, remainingBalance + interestPayment)

        const principalPayment = payment - interestPayment
        remainingBalance = Math.max(0, remainingBalance - principalPayment)
        totalInterestPaid += interestPayment

        schedule.push({
          month,
          payment,
          principal: principalPayment,
          interest: interestPayment,
          balance: remainingBalance,
          year: Math.ceil(month / 12)
        })
      }

      setResults({
        monthsToPayoff: month,
        totalInterest: totalInterestPaid,
        totalPaid: currentBalance + totalInterestPaid,
        monthlyPayment: schedule.length > 0 ? schedule[0].payment : 0
      })

      setPaymentSchedule(schedule)

      // Create chart data
      const chartPoints = schedule.filter((_, index) => index % Math.max(1, Math.floor(schedule.length / 24)) === 0)
      setChartData(chartPoints.map(item => ({
        month: item.month,
        principal: item.principal,
        interest: item.interest
      })))
    } else {
      setResults({
        monthsToPayoff: 0,
        totalInterest: 0,
        totalPaid: 0,
        monthlyPayment: 0
      })
      setPaymentSchedule([])
      setChartData([])
    }
  }, [balance, apr, paymentType, fixedPayment])

  const hasValidInputs = parseFloat(balance) > 0 && parseFloat(apr) > 0 && 
    (paymentType === 'minimum' || parseFloat(fixedPayment) > 0)

  // Group payments by year for summary
  const yearlyData = paymentSchedule.reduce((acc, payment) => {
    const year = payment.year
    if (!acc[year]) {
      acc[year] = {
        year,
        payments: 0,
        principal: 0,
        interest: 0,
        endingBalance: 0
      }
    }
    acc[year].payments += payment.payment
    acc[year].principal += payment.principal
    acc[year].interest += payment.interest
    acc[year].endingBalance = payment.balance
    return acc
  }, {} as Record<number, any>)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="balance">Current Balance ($)</Label>
          <Input
            id="balance"
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="5000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apr">Annual Percentage Rate (%)</Label>
          <Input
            id="apr"
            type="number"
            step="0.1"
            value={apr}
            onChange={(e) => setApr(e.target.value)}
            placeholder="18.0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment-type">Payment Type</Label>
          <Select value={paymentType} onValueChange={setPaymentType}>
            <SelectTrigger id="payment-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minimum">Interest + 1% of Balance</SelectItem>
              <SelectItem value="fixed">Fixed Payment Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {paymentType === 'fixed' && (
          <div className="space-y-2">
            <Label htmlFor="fixed-payment">Fixed Payment ($)</Label>
            <Input
              id="fixed-payment"
              type="number"
              value={fixedPayment}
              onChange={(e) => setFixedPayment(e.target.value)}
              placeholder="200"
            />
          </div>
        )}
      </div>

      {hasValidInputs && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payoff Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Time to payoff:</span>
                  <span className="font-semibold">
                    {Math.floor(results.monthsToPayoff / 12)} years, {results.monthsToPayoff % 12} months
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total interest paid:</span>
                  <span className="font-semibold text-destructive">{formatCurrency(results.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total amount paid:</span>
                  <span className="font-semibold text-primary">{formatCurrency(results.totalPaid)}</span>
                </div>
                {paymentType === 'minimum' && (
                  <div className="flex justify-between">
                    <span>Initial monthly payment:</span>
                    <span className="font-semibold">{formatCurrency(results.monthlyPayment)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tickFormatter={(value) => `M${value}`}
                    />
                    <YAxis tickFormatter={(value) => `$${value.toFixed(0)}`} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        formatCurrency(value), 
                        name === 'principal' ? 'Principal' : 'Interest'
                      ]}
                      labelFormatter={(label) => `Month ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="principal" 
                      stackId="1"
                      stroke="oklch(0.55 0.15 200)" 
                      fill="oklch(0.55 0.15 200)"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="interest" 
                      stackId="1"
                      stroke="oklch(0.6 0.2 15)" 
                      fill="oklch(0.6 0.2 15)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentSchedule.length > 24 && (
                <>
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Year-by-Year Summary</h4>
                    <ScrollArea className="h-40 w-full">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Year</TableHead>
                            <TableHead className="text-right">Payments</TableHead>
                            <TableHead className="text-right">Principal</TableHead>
                            <TableHead className="text-right">Interest</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.values(yearlyData).map((yearData: any) => (
                            <TableRow key={yearData.year}>
                              <TableCell>{yearData.year}</TableCell>
                              <TableCell className="text-right">{formatCurrency(yearData.payments)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(yearData.principal)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(yearData.interest)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(yearData.endingBalance)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </>
              )}
              
              <div className="mb-2">
                <h4 className="font-semibold">Monthly Payment Details</h4>
              </div>
              <ScrollArea className="h-96 w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Month</TableHead>
                      <TableHead className="text-right">Payment</TableHead>
                      <TableHead className="text-right">Principal</TableHead>
                      <TableHead className="text-right">Interest</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentSchedule.map((payment) => (
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
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}