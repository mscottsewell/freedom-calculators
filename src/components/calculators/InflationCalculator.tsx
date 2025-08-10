import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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

export default function InflationCalculator() {
  const [currentAmount, setCurrentAmount] = useKV('inflation-current-amount', '')
  const [inflationRate, setInflationRate] = useKV('inflation-rate', '')
  const [years, setYears] = useKV('inflation-years', '')
  
  const [results, setResults] = useState({
    futureValue: 0,
    realValue: 0,
    purchasingPowerLost: 0,
    percentageLost: 0
  })

  const [chartData, setChartData] = useState<Array<{year: number, purchasingPower: number, originalValue: number}>>([])

  useEffect(() => {
    const amount = parseFloat(currentAmount) || 0
    const rate = parseFloat(inflationRate) / 100 || 0
    const numYears = parseInt(years) || 0

    if (amount > 0 && rate >= 0 && numYears > 0) {
      const futureValue = amount * Math.pow(1 + rate, numYears)
      const realValue = amount / Math.pow(1 + rate, numYears)
      const purchasingPowerLost = amount - realValue
      const percentageLost = (purchasingPowerLost / amount) * 100

      setResults({
        futureValue,
        realValue,
        purchasingPowerLost,
        percentageLost
      })

      const data = []
      for (let year = 0; year <= numYears; year++) {
        const purchasingPower = amount / Math.pow(1 + rate, year)
        data.push({
          year,
          purchasingPower,
          originalValue: amount
        })
      }
      setChartData(data)
    } else {
      setResults({
        futureValue: 0,
        realValue: 0,
        purchasingPowerLost: 0,
        percentageLost: 0
      })
      setChartData([])
    }
  }, [currentAmount, inflationRate, years])

  const hasValidInputs = parseFloat(currentAmount) > 0 && parseFloat(inflationRate) >= 0 && parseInt(years) > 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {hasValidInputs && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Impact of Inflation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Future nominal value:</span>
                  <span className="font-semibold text-primary">{formatCurrency(results.futureValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Real purchasing power:</span>
                  <span className="font-semibold text-success">{formatCurrency(results.realValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Purchasing power lost:</span>
                  <span className="font-semibold text-destructive">{formatCurrency(results.purchasingPowerLost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Percentage lost:</span>
                  <span className="font-semibold text-destructive">{formatNumber(results.percentageLost)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Purchasing Power Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Purchasing Power']}
                      labelFormatter={(label) => `Year ${label}`}
                    />
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

          <Alert>
            <AlertDescription>
              <strong>What This Means:</strong> With inflation at {inflationRate}% per year, your {formatCurrency(parseFloat(currentAmount))} 
              today will only have the purchasing power of {formatCurrency(results.realValue)} in {years} years. 
              You'll lose {formatCurrency(results.purchasingPowerLost)} ({formatNumber(results.percentageLost)}%) 
              in purchasing power due to inflation.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  )
}