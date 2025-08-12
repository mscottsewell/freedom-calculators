# Mrs. Sewell's Financial FREEDom Calculators

> **Personal Finance Made Easy!**

A comprehensive suite of educational financial calculators designed for Personal Financial Planning classes. This modern web application provides six essential calculators with detailed explanations, visualizations, and real-world educational value.

![Financial Calculators](https://img.shields.io/badge/Calculators-6-blue) ![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-3178C6?logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)

## 🎯 Purpose

This application serves as a comprehensive educational tool for students learning personal finance concepts. Each calculator combines accurate mathematical formulations with clear explanations and engaging visualizations to reinforce key financial literacy concepts.

## 📊 Available Calculators

### 1. **Inflation Calculator** 📈
- **Purpose**: Understand how inflation erodes purchasing power over time
- **Features**: 
  - Calculate future nominal vs. real value
  - Visualize purchasing power loss with area charts
  - Educational explanations with real-world context
- **Key Lesson**: Inflation quietly reduces what your money can buy, making it crucial to invest in assets that grow faster than inflation

### 2. **Compound Interest Calculator** 🧮
- **Purpose**: Demonstrate the power of compound growth in investments
- **Features**: 
  - Multiple compounding frequencies (daily to annually)
  - Additional deposit support (monthly or annual)
  - Interactive growth visualization
  - Formula explanations and assumptions
- **Key Lesson**: Starting early with consistent investing creates exponential wealth growth through compounding

### 3. **Time Value of Money Calculator** ⏰
- **Purpose**: Calculate any missing variable in TVM equations
- **Features**: 
  - Solve for present value, future value, payments, periods, or interest rate
  - Advanced Newton-Raphson algorithms for complex calculations
  - Educational explanations of TVM concepts
- **Key Lesson**: A dollar today is worth more than a dollar tomorrow - time amplifies the value of money through growth opportunities

### 4. **Credit Card Minimum Payment Calculator** 💳
- **Purpose**: Show the true cost of minimum credit card payments
- **Features**: 
  - Dynamic minimum payment calculation (interest + 1% of balance)
  - Complete payment schedule with year-by-year summaries
  - Principal vs. interest breakdown charts
- **Key Lesson**: Minimum payments trap you in expensive debt - paying more than the minimum saves thousands in interest

### 5. **Auto Loan Calculator** 🚗
- **Purpose**: Calculate car loan payments and total costs
- **Features**: 
  - Monthly payment calculations
  - Complete amortization schedule
  - Year-by-year payment breakdown
  - Total interest and cost analysis
- **Key Lesson**: The total cost of financing a car is often much higher than the sticker price - shop for the best rates and shortest terms

### 6. **Mortgage Calculator** 🏠
- **Purpose**: Calculate home loan payments and build equity analysis
- **Features**: 
  - Home price and down payment percentage inputs
  - Complete yearly and monthly amortization schedules
  - Equity building visualization
  - Down payment impact analysis
- **Key Lesson**: Your home can be a wealth-building tool through equity growth, but larger down payments reduce total interest costs significantly

## ✨ Key Features

- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **💾 Persistent Storage**: All inputs are saved between sessions using advanced key-value storage
- **📊 Interactive Charts**: Dynamic visualizations using Recharts library
- **🎨 Professional UI**: Clean, modern interface using shadcn/ui components
- **♿ Accessible**: WCAG compliant with proper contrast ratios and keyboard navigation
- **📚 Educational Focus**: Each calculator includes explanations and key lessons
- **🔧 Advanced Mathematics**: Industry-standard formulas and complex algorithms

## 🛠️ Technical Stack

### Frontend Framework
- **React 18+** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Modern ES6+** JavaScript features

### Styling & UI
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** component library for consistent, accessible components
- **Inter Font** from Google Fonts for professional typography
- **Phosphor Icons** for clear, consistent iconography

### Data Visualization
- **Recharts** library for responsive, interactive charts
- Area charts, tooltips, and legends for financial data visualization

### State Management
- **React Hooks** (`useState`, `useEffect`) for component state
- **Custom `useKV` Hook** for persistent data storage across sessions
- Local state for calculations and UI interactions

### Mathematical Libraries
- **Custom algorithms** including Newton-Raphson methods
- **Precise financial calculations** following industry standards
- **Advanced compound interest** with multiple frequencies

## 📁 Project Structure

```
src/
├── App.tsx                          # Main application component
├── index.css                        # Global styles and theme variables
├── main.css                         # Structural CSS (do not edit)
├── main.tsx                         # Application entry point (do not edit)
├── components/
│   ├── calculators/                 # Individual calculator components
│   │   ├── InflationCalculator.tsx
│   │   ├── CompoundInterestCalculator.tsx
│   │   ├── TimeValueMoneyCalculator.tsx
│   │   ├── CreditCardCalculator.tsx
│   │   ├── AutoLoanCalculator.tsx
│   │   └── MortgageCalculator.tsx
│   └── ui/                          # shadcn/ui components (pre-installed)
├── lib/
│   └── utils.ts                     # Utility functions
└── assets/
    └── images/
        └── FHU_COB.jpg             # College logo
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd financial-freedom-calculators
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The optimized build will be created in the `dist/` directory.

## 🎨 Design Philosophy

### Educational Focus
- **Clear Instructions**: Each calculator includes step-by-step guidance
- **Real-World Context**: Examples and explanations relate to practical scenarios
- **Visual Learning**: Charts and graphs reinforce mathematical concepts
- **Key Lessons**: Distilled wisdom for each financial concept

### User Experience
- **Intuitive Interface**: Clean, uncluttered design focuses attention
- **Immediate Feedback**: Real-time calculations and visual updates
- **Error Prevention**: Input validation and helpful error messages
- **Accessibility**: Full keyboard navigation and screen reader support

### Visual Design
- **Professional Appearance**: Suitable for academic and professional environments
- **Consistent Typography**: Inter font family for excellent readability
- **Thoughtful Color Palette**: Blue and gray theme with meaningful accent colors
- **Responsive Layout**: Seamless experience across all device sizes

## 💡 Educational Applications

### In the Classroom
- **Interactive Demonstrations**: Show concepts in real-time during lectures
- **Student Assignments**: Hands-on exploration of financial scenarios
- **Comparative Analysis**: Students can explore different scenarios and outcomes
- **Homework Tool**: Students can practice concepts outside of class

### Learning Outcomes
- Understanding of compound growth and time value of money
- Appreciation for the cost of debt and importance of early payment
- Knowledge of how inflation affects long-term financial planning
- Practical skills in evaluating loans and investment options

## 🔧 Customization

### Themes
The application uses CSS custom properties for easy theming. Modify variables in `src/index.css`:

```css
:root {
  --primary: oklch(39.6% 0.141 25.723);    /* Primary color */
  --background: oklch(0.98 0.01 240);      /* Background color */
  --radius: 0.75rem;                       /* Border radius */
}
```

### Adding Calculators
1. Create new component in `src/components/calculators/`
2. Add to calculator configuration in `App.tsx`
3. Import appropriate icon from `@phosphor-icons/react`

### Modifying Calculations
Each calculator component contains clearly documented calculation functions that can be modified or extended as needed.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mrs. Sewell** - For inspiring financial literacy education
- **FHU College of Business** - For supporting educational technology
- **shadcn/ui** - For excellent React components
- **Recharts** - For powerful data visualization tools

## 📞 Support

For questions, suggestions, or support:
- Create an issue in this repository
- Contact the development team
- Check the documentation for troubleshooting guides

---

**Made with ❤️ for financial education**