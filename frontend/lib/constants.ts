import { SummarySlide } from "@/types/summary"

export type Plan = {
    id: string,
    name: string,
    price: number,
    description: string,
    features: string[]
}
export const plans: Plan[] = [
    {
        id: "basic",
        name: "Basic",
        price: 0,
        description: "For individuals trial use",
        features: [
            "5 PDF summaries per month",
            "Max PDF size 10MB",
            "Max 10 pages per PDF"
        ]
    },
    {
        id: "pro",
        name: "Pro",
        price: 399,
        description: "For frequent users",
        features: [
            "20 PDF summaries per month",
            "Max PDF size 30MB",
            "Max 30 pages per PDF",
            "24/7 Support",
        ]
    }
]

export const containerVariants = {
    hidden: { opacity: 0},
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1,
        },
    },
}

export const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        transition: {
            type: "spring" as const,
            damping: 15,
            stiffness: 50,
            duration: 0.8,
        },
     },
}

export const demoSummary:SummarySlide[] = [
  {
    idx: 0,
    heading: "⚛️ Introduction to React.js",
    points: [
      "React.js is a JavaScript library used for building user interfaces",
      "It is maintained by Meta (Facebook) and a large open-source community",
      "React focuses on building reusable UI components",
      "It is commonly used for single-page applications (SPAs)",
      "React promotes declarative UI development, describing what the UI should look like",
      "JSX lets you write HTML-like syntax within JavaScript code",
      "React can be used to render on the client or server (Next.js for SSR)",
      "It integrates well with other libraries and tools in the ecosystem"
    ]
  },
  {
    idx: 1,
    heading: "🧱 Component-Based Architecture",
    points: [
      "React applications are built using components",
      "A component represents a reusable piece of UI",
      "Components can be functional or class-based",
      "This approach improves code reusability and maintainability",
      "Components can compose other components to form complex UIs",
      "Props and state drive how components render and behave",
      "Component boundaries help with testing and isolation",
      "Design systems often rely on consistent, reusable components"
    ]
  },
  {
    idx: 2,
    heading: "🧠 JSX – JavaScript XML",
    points: [
      "JSX is a syntax extension used in React",
      "It allows writing HTML-like code inside JavaScript",
      "JSX makes UI code more readable and expressive",
      "Under the hood, JSX is converted into JavaScript function calls",
      "JSX supports embedding JavaScript expressions within braces",
      "Attributes in JSX resemble HTML attributes but use camelCase",
      "JSX requires a build step (Babel or similar) to transpile",
      "Using JSX helps visualize UI structure directly in code"
    ]
  },
  {
    idx: 3,
    heading: "📦 Props – Passing Data to Components",
    points: [
      "Props are used to pass data from parent to child components",
      "They are read-only and cannot be modified by the child",
      "Props make components dynamic and reusable",
      "They help in maintaining a unidirectional data flow",
      "PropTypes can be used for runtime type checking",
      "Default props provide fallback values when none are supplied",
      "Destructuring props improves readability inside the component",
      "Props enable component customization without changing internal logic"
    ]
  },
  {
    idx: 4,
    heading: "🔄 State – Managing Component Data",
    points: [
      "State represents data that can change over time",
      "It is managed within a component",
      "Updating state causes the component to re-render",
      "State is commonly managed using the useState hook",
      "State updates are asynchronous and may be batched",
      "Lifting state up helps share data between components",
      "State can be derived from props or other state values",
      "Using useReducer can simplify complex state management"
    ]
  },
  {
    idx: 5,
    heading: "🪝 React Hooks Overview",
    points: [
      "Hooks allow using state and lifecycle features in functional components",
      "useState is used for local state management",
      "useEffect is used for side effects like data fetching",
      "Hooks simplify code and reduce the need for class components",
      "Custom hooks let you encapsulate reusable logic",
      "Rules of hooks ensure consistent usage (top-level calls only)",
      "Hooks enable clean separation of concerns within components",
      "Multiple hooks can be composed to manage different concerns"
    ]
  },
  {
    idx: 6,
    heading: "⚡ Virtual DOM & Performance",
    points: [
      "React uses a Virtual DOM to optimize rendering",
      "Changes are first applied to the Virtual DOM",
      "React compares the Virtual DOM with the real DOM",
      "Only the necessary updates are applied to the actual DOM",
      "Reconciliation minimizes expensive DOM operations",
      "Keys in lists help React track items efficiently",
      "Memoization can prevent unnecessary re-renders",
      "Code-splitting and lazy loading improve initial load times"
    ]
  },
  {
    idx: 7,
    heading: "🔁 Lifecycle & useEffect",
    points: [
      "Component lifecycle refers to different phases of a component",
      "In functional components, lifecycle behavior is handled using useEffect",
      "useEffect can run on mount, update, or unmount",
      "It helps manage side effects in a predictable way",
      "Cleanup functions run during unmount or before next effect",
      "Dependency arrays control when effects re-run",
      "useLayoutEffect can be used for reads before painting",
      "Understanding effects helps avoid memory leaks and stale data"
    ]
  },
  {
    idx: 8,
    heading: "🌐 Handling Events & User Interaction",
    points: [
      "React handles events using synthetic events",
      "Event handlers are written in camelCase",
      "Functions are passed as event handlers",
      "This enables interactive and dynamic user interfaces",
      "Event objects provide details about user actions",
      "Event delegation improves performance for many handlers",
      "PreventDefault and stopPropagation manage event flow",
      "Accessibility considerations ensure inclusive interactions"
    ]
  },
  {
    idx: 9,
    heading: "🚀 Why Use React.js?",
    points: [
      "React enables fast and efficient UI development",
      "Its component-based design improves scalability",
      "A strong ecosystem and community support exist",
      "It is widely used in modern web applications",
      "JSX and tooling make development expressive and enjoyable",
      "React integrates with state management libraries like Redux or Recoil",
      "Server-side rendering and static site generation are possible",
      "A rich set of debugging and profiling tools aids developers"
    ]
  }
] as SummarySlide[]

