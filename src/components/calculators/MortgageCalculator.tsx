// React imports
import { useState, useEffect } from 'react'

// Spark hooks for persistent data storage
import { useKV } from '@github/spark/hooks'

// UI component imports
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'

/**
 * Formats a number as currency with proper thousands separators
 * Used throughout the mortgage calculator for displaying dollar amounts
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
 * Interface for yearly mortgage amortization data
 * Tracks the key financial metrics for each year of the loan
 */
interface YearlyData {
  year: number               // Year number (1, 2, 3, etc.)
  beginningBalance: number   // Loan balance at start of year
  totalPayments: number      // Total payments made this year
  principalPaid: number      // Principal paid down this year
  interestPaid: number       // Interest paid this year
  endingBalance: number      // Loan balance at end of year
}

/**
 * Interface for individual monthly payment details
 * Provides granular view of each mortgage payment
 */
interface PaymentDetail {
  month: number    // Payment number (1-360 for 30-year loan)
  payment: number  // Monthly payment amount
  principal: number // Principal portion of payment
  interest: number  // Interest portion of payment
  balance: number   // Remaining balance after payment
}

/**
 * Mortgage Calculator Component
 * 
 * Calculates mortgage payments and generates complete amortization schedules.
 * Helps students understand how mortgages work and the long-term cost of borrowing.
 * 
 * Educational Purpose:
 * - Demonstrates the structure of mortgage payments (principal vs interest)
 * - Shows how payments are allocated over the life of the loan
 * - Illustrates the impact of down payments on loan amounts
 * - Teaches the concept of building equity over time
 * - Reinforces the importance of understanding total loan costs
 * 
 * Features:
 * - Home price and down payment percentage inputs
 * - Automatic loan amount calculation
 * - Monthly payment calculation using standard mortgage formula
 * - Complete yearly amortization schedule
 * - Detailed monthly payment breakdown
 * - Equity calculation showing wealth building
 * - Sticky table headers for easy data viewing
 * 
 * Key Financial Concepts:
 * - Loan-to-value ratio (LTV) through down payment percentage
 * - Amortization and how payment allocation changes over time
 * - Equity building through principal payments and appreciation
 * - Total cost of borrowing including all interest payments
 */
export default function MortgageCalculator() {
  // Persistent input states - survive page refreshes
  const [homePrice, setHomePrice] = useKV('mortgage-home-price', '')
  const [downPaymentPercent, setDownPaymentPercent] = useKV('mortgage-down-payment-percent', '10')
  const [interestRate, setInterestRate] = useKV('mortgage-interest-rate', '')
  const [loanTerm, setLoanTerm] = useKV('mortgage-loan-term', '')

  const [results, setResults] = useState({
    loanAmount: 0,
    monthlyPayment: 0,
    totalInterest: 0,
    totalPaid: 0
  })

  const [yearlySchedule, setYearlySchedule] = useState<YearlyData[]>([])
  const [monthlySchedule, setMonthlySchedule] = useState<PaymentDetail[]>([])

  /**
   * Effect to calculate mortgage payment and amortization schedules whenever inputs change
   * 
   * Mortgage calculations follow the same amortizing loan principles as auto loans but with
   * additional complexity around home pricing and down payments. Key concepts:
   * 
   * 1. Loan Amount = Home Price - Down Payment
   * 2. Down payment reduces the principal borrowed and affects monthly payments
   * 3. Equity = Down Payment + Principal Paid + Home Appreciation
   * 4. Longer terms (30 vs 15 years) reduce payments but increase total interest
   * 
   * Mathematical Background:
   * - Uses the same PMT formula as auto loans: PMT = P × [r(1+r)^n] / [(1+r)^n - 1]
   * - Loan-to-Value ratio = Loan Amount / Home Price
   * - Total Equity = Home Value - Remaining Loan Balance
   * 
   * Educational Purpose:
   * - Demonstrates the impact of down payments on monthly payments and total cost
   * - Shows how much of early payments go to interest vs building equity
   * - Illustrates the long-term commitment and cost of homeownership
   * - Teaches the concept of building wealth through home equity
   * - Reinforces the importance of understanding total borrowing costs
   */
  useEffect(() => {
    // Convert string inputs to numbers and calculate derived values
    const housePriceValue = parseFloat(homePrice) || 0
    const downPaymentPercentValue = parseFloat(downPaymentPercent) || 0
    
    // Calculate down payment amount from percentage
    const downPaymentAmount = housePriceValue * (downPaymentPercentValue / 100)
    
    // Calculate loan principal (amount borrowed after down payment)
    const principal = Math.max(0, housePriceValue - downPaymentAmount)
    
    const annualRate = parseFloat(interestRate) / 100 || 0  // Convert percentage to decimal
    const years = parseInt(loanTerm) || 0                   // Loan term in years

    // Only calculate if we have valid inputs
    if (principal > 0 && annualRate >= 0 && years > 0) {
      const monthlyRate = annualRate / 12               // Convert annual rate to monthly
      const numberOfPayments = years * 12              // Total number of payments

      let monthlyPayment: number
      
      // Handle special case of 0% interest (interest-free loan)
      if (annualRate === 0) {
        monthlyPayment = principal / numberOfPayments
      } else {
        // Standard amortizing mortgage payment formula
        // This is the same formula used by banks and mortgage calculators
        const numerator = monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)
        const denominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1
        monthlyPayment = principal * (numerator / denominator)
      }

      // Generate detailed payment schedules
      let remainingBalance = principal
      let totalInterestPaid = 0
      const monthlyData: PaymentDetail[] = []
      const yearlyData: YearlyData[] = []

      // Calculate each monthly payment's allocation
      for (let month = 1; month <= numberOfPayments; month++) {
        // Interest portion: remaining balance × monthly interest rate
        const interestPayment = remainingBalance * monthlyRate
        
        // Principal portion: fixed payment - interest (varies each month)
        const principalPayment = monthlyPayment - interestPayment
        
        // Update remaining loan balance
        remainingBalance = Math.max(0, remainingBalance - principalPayment)
        
        // Track cumulative interest paid
        totalInterestPaid += interestPayment

        // Store monthly payment details
        monthlyData.push({
          month,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: remainingBalance
        })

        // Aggregate data by year for yearly summary table
        const currentYear = Math.ceil(month / 12)
        const isLastMonthOfYear = month % 12 === 0 || month === numberOfPayments

        if (isLastMonthOfYear) {
          // Calculate year start and end boundaries
          const yearStart = (currentYear - 1) * 12 + 1
          const yearEnd = Math.min(currentYear * 12, numberOfPayments)
          const yearPayments = monthlyData.slice(yearStart - 1, yearEnd)
          
          // Calculate yearly totals by summing monthly data
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

      // Update state with calculated results
      setResults({
        loanAmount: principal,
        monthlyPayment,
        totalInterest: totalInterestPaid,
        totalPaid: principal + totalInterestPaid  // Total amount paid over loan life
      })

      setYearlySchedule(yearlyData)
      setMonthlySchedule(monthlyData)
    } else {
      // Reset results if inputs are invalid
      setResults({
        loanAmount: 0,
        monthlyPayment: 0,
        totalInterest: 0,
        totalPaid: 0
      })
      setYearlySchedule([])
      setMonthlySchedule([])
    }
  }, [homePrice, downPaymentPercent, interestRate, loanTerm])

  const hasValidInputs = parseFloat(homePrice) > 0 && parseFloat(downPaymentPercent) >= 0 && 
                        parseFloat(downPaymentPercent) < 100 && 
                        parseFloat(interestRate) >= 0 && parseInt(loanTerm) > 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="home-price">Home Price ($)</Label>
          <Input
            id="home-price"
            type="number"
            value={homePrice}
            onChange={(e) => setHomePrice(e.target.value)}
            placeholder="350000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="down-payment">Down Payment (%)</Label>
          <Input
            id="down-payment"
            type="number"
            step="0.1"
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(e.target.value)}
            placeholder="10"
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Down Payment</div>
                  <div className="text-xl font-semibold text-accent">{formatCurrency(parseFloat(homePrice) * (parseFloat(downPaymentPercent) || 0) / 100)}</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Loan Amount</div>
                  <div className="text-xl font-semibold text-info">{formatCurrency(results.loanAmount)}</div>
                </div>
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
                <ScrollArea className="h-[500px] w-full">
                  <div className="pr-4">
                    <Table>
                      <TableHeader className="sticky top-0 bg-muted">
                        <TableRow>
                          <TableHead className="w-16">Year</TableHead>
                          <TableHead className="text-right">Payments</TableHead>
                          <TableHead className="text-right">Principal</TableHead>
                          <TableHead className="text-right">Interest</TableHead>
                          <TableHead className="text-right">End Balance</TableHead>
                          <TableHead className="text-right">Total Equity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {yearlySchedule.map((year) => (
                          <TableRow key={year.year}>
                            <TableCell>{year.year}</TableCell>
                            <TableCell className="text-right">{formatCurrency(year.totalPayments)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(year.principalPaid)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(year.interestPaid)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(year.endingBalance)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(results.loanAmount - year.endingBalance)}</TableCell>
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
                <ScrollArea className="h-[500px] w-full">
                  <div className="pr-4">
                    <Table>
                      <TableHeader className="sticky top-0 bg-muted">
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

          {/* Key Lesson Section */}
          <Card className="mt-6 border-accent">
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
        </>
      )}
    </div>
  )
}