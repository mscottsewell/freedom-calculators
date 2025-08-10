# Planning Guide

Create a comprehensive suite of financial calculators for use in a Personal Financial Planning class, featuring six distinct calculators with detailed explanations and visualizations to help students understand core financial concepts.

**Experience Qualities**: 
1. **Educational** - Clear explanations and real-world context help students grasp complex financial concepts
2. **Professional** - Clean, academic presentation suitable for classroom use with college branding
3. **Interactive** - Immediate calculations with visual feedback and persistent data storage for experimentation

**Complexity Level**: Light Application (multiple features with basic state)
This application provides multiple interconnected calculators with data persistence and visualizations, but maintains focus on educational clarity over advanced functionality.

## Essential Features

**Tab Navigation System**
- Functionality: Six-tab interface organizing different financial calculators
- Purpose: Allows students to easily switch between different financial concepts and tools
- Trigger: Click on calculator tab or navigate via keyboard
- Progression: Tab selection → Calculator loads → Inputs persist → Results update
- Success criteria: Smooth transitions, responsive layout (2 cols mobile, 6 cols desktop)

**Inflation Calculator** 
- Functionality: Calculate purchasing power loss over time with area chart visualization
- Purpose: Teach students how inflation erodes money's value and affects long-term planning
- Trigger: Enter current amount, inflation rate, and time period
- Progression: Input values → Real-time calculation → Chart updates → Educational explanation displays
- Success criteria: Accurate calculations, clear visualization, formatted explanations with thousands separators

**Compound Interest Calculator**
- Functionality: Calculate investment growth respecting compounding frequency with additional deposits
- Purpose: Demonstrate the power of compound growth and regular saving habits
- Trigger: Enter principal, rate, years, compounding frequency, additional deposits
- Progression: Input parameters → Apply correct compounding formula → Generate growth chart → Display breakdown
- Success criteria: Mathematically accurate A = P(1 + r/n)^(nt) formula, proper additional deposit handling

**Time Value of Money Calculator**
- Functionality: Calculate any missing TVM variable using advanced Newton-Raphson methods
- Purpose: Teach core concept that money today is worth more than money tomorrow
- Trigger: Select variable to calculate, enter known values
- Progression: Variable selection → Input hiding → Advanced calculation → Result display → Educational context
- Success criteria: Handles complex calculations for periods and rates, clear conceptual explanation

**Credit Card Payment Calculator**
- Functionality: Calculate payoff scenarios with payment schedule and interest breakdown
- Purpose: Show students the true cost of credit card debt and minimum payment traps
- Trigger: Enter balance, APR, choose payment method
- Progression: Payment option selection → Payoff calculation → Schedule generation → Visual breakdown
- Success criteria: Accurate payment schedules, clear interest vs principal visualization

**Auto Loan & Mortgage Calculators**
- Functionality: Calculate loan payments with complete amortization schedules
- Purpose: Help students understand loan structures and total borrowing costs
- Trigger: Enter loan parameters (amount, rate, term)
- Progression: Input loan details → Calculate payment → Generate amortization → Format results
- Success criteria: Industry-standard calculations, comprehensive payment breakdowns

**Data Persistence System**
- Functionality: Remember all calculator inputs between sessions using useKV
- Purpose: Allow students to experiment and return to previous calculations
- Trigger: Any input field change
- Progression: Input change → Automatic save → Value restoration on reload
- Success criteria: All inputs persist, no data loss, seamless user experience

## Edge Case Handling

- **Invalid Inputs**: Clear error messages with guidance for negative values, zero rates, or impossible scenarios
- **Extreme Values**: Handle very large numbers, long time periods, and edge cases in financial formulas
- **Mobile Usage**: Responsive design maintains functionality across all device sizes
- **Calculation Limits**: Graceful handling of mathematical limits in Newton-Raphson iterations
- **Empty States**: Helpful prompts when no inputs are provided or calculations are pending

## Design Direction

The design should feel authoritative and academic while remaining approachable for students - professional enough for classroom presentation yet engaging for learning. Clean, minimal interface that prioritizes educational content over flashy effects.

## Color Selection

Complementary (opposite colors) - Professional blue primary with warm accent colors for visual hierarchy and data distinction.

- **Primary Color**: Deep professional blue (oklch(0.4 0.15 240)) communicates trust and academic authority
- **Secondary Colors**: Light blue-gray backgrounds (oklch(0.95 0.02 240)) for subtle organization without distraction
- **Accent Color**: Warm orange (oklch(0.65 0.15 45)) for important CTAs and highlight elements that need attention
- **Foreground/Background Pairings**: 
  - Background (Light Blue-Gray #F8F9FB): Dark Blue Text(#1E3A5F) - Ratio 8.2:1 ✓
  - Primary (Deep Blue #1E3A5F): White Text(#FFFFFF) - Ratio 8.2:1 ✓  
  - Accent (Warm Orange #E8965A): White Text(#FFFFFF) - Ratio 4.8:1 ✓
  - Card (Pure White #FFFFFF): Dark Blue Text(#1E3A5F) - Ratio 8.2:1 ✓

## Font Selection

Inter conveys modernity and academic professionalism while maintaining excellent readability across different screen sizes and contexts.

- **Typographic Hierarchy**: 
  - H1 (App Title): Inter Bold/32px/tight letter spacing
  - H2 (Calculator Names): Inter Semibold/24px/normal spacing  
  - H3 (Section Headers): Inter Medium/18px/normal spacing
  - Body (Instructions/Results): Inter Regular/16px/relaxed line height
  - Labels (Input Fields): Inter Medium/14px/normal spacing
  - Data (Numbers/Currency): Inter Mono/16px for alignment

## Animations

Subtle functionality-focused animations that support learning without distraction, emphasizing state changes and data relationships rather than decorative effects.

- **Purposeful Meaning**: Smooth transitions between calculators reinforce the educational journey, while chart animations help students understand data relationships
- **Hierarchy of Movement**: Tab transitions and result updates receive primary animation focus, supporting the learning workflow

## Component Selection

- **Components**: Tabs for navigation, Cards for calculator containers, Forms with Input/Label pairs, Select dropdowns, Button variants for actions, Table for schedules, Alert for explanations
- **Customizations**: Custom chart components using Recharts, formatted number displays with thousands separators, responsive tab layout
- **States**: Input focus states with educational context, loading states during complex calculations, error states with helpful guidance
- **Icon Selection**: Phosphor icons matching each calculator's purpose (TrendUp, Calculator, Timer, CreditCard, Car, House)
- **Spacing**: Consistent 4/6/8 Tailwind spacing scale, generous padding within cards for readability
- **Mobile**: Stacked calculator layout, simplified charts, touch-friendly input targets, responsive tables with horizontal scroll