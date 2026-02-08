export interface DataPoint {
  id: string;
  label: string;
  question: string;
  placeholder: string;
  type?: 'text' | 'textarea';
}

export interface DataCategory {
  id: string;
  title: string;
  dataPoints: DataPoint[];
}

export const personalInfoCategories: DataCategory[] = [
  {
    id: 'basics',
    title: 'Basic Info',
    dataPoints: [
      { id: 'fullName', label: 'Full Name', question: "What's your full name?", placeholder: 'John Doe' },
      { id: 'currentTitle', label: 'Current Title', question: "What's your current job title?", placeholder: 'Founder & CEO' },
      { id: 'companyName', label: 'Company Name', question: "What's the name of your company?", placeholder: 'Acme Corp' },
      { id: 'industry', label: 'Industry', question: "What industry are you in?", placeholder: 'B2B SaaS' },
      { id: 'location', label: 'Location', question: "Where are you based?", placeholder: 'San Francisco, CA' },
    ],
  },
  {
    id: 'product',
    title: 'Product/Service',
    dataPoints: [
      { id: 'productName', label: 'Product Name', question: "What's your product called?", placeholder: 'YourProduct' },
      { id: 'productDescription', label: 'One-line Description', question: "Describe your product in one line", placeholder: 'AI-powered tool for X', type: 'textarea' },
      { id: 'targetCustomer', label: 'Target Customer', question: "Who is your target customer?", placeholder: 'Solo founders, SMBs, etc.' },
      { id: 'problemSolved', label: 'Problem Solved', question: "What problem does your product solve?", placeholder: 'Helps X do Y without Z' },
      { id: 'pricing', label: 'Pricing', question: "What's your pricing?", placeholder: '$99/mo, $500/yr, etc.' },
    ],
  },
  {
    id: 'metrics',
    title: 'Current Metrics',
    dataPoints: [
      { id: 'users', label: 'Total Users', question: "How many users do you have?", placeholder: '1,000' },
      { id: 'mrr', label: 'MRR', question: "What's your monthly recurring revenue?", placeholder: '$5,000' },
      { id: 'arr', label: 'ARR', question: "What's your annual recurring revenue?", placeholder: '$60,000' },
      { id: 'growth', label: 'Growth Rate', question: "What's your growth rate?", placeholder: '20% MoM' },
      { id: 'launchDate', label: 'Launch Date', question: "When did you launch?", placeholder: 'Jan 2024' },
    ],
  },
  {
    id: 'background',
    title: 'Background',
    dataPoints: [
      { id: 'previousCompany', label: 'Previous Company', question: "Where did you work before?", placeholder: 'Google, Meta, etc.' },
      { id: 'previousRole', label: 'Previous Role', question: "What was your previous role?", placeholder: 'Senior Engineer, PM, etc.' },
      { id: 'yearsExp', label: 'Years of Experience', question: "How many years of experience do you have?", placeholder: '5 years' },
      { id: 'education', label: 'Education', question: "What's your educational background?", placeholder: 'BS CS from MIT' },
    ],
  },
  {
    id: 'achievements',
    title: 'Key Achievements',
    dataPoints: [
      { id: 'biggestWin', label: 'Biggest Win', question: "What's your biggest win so far?", placeholder: 'Hit $10k MRR in 3 months' },
      { id: 'milestone1', label: 'Recent Milestone 1', question: "What's a recent milestone you hit?", placeholder: 'Launched v2.0' },
      { id: 'milestone2', label: 'Recent Milestone 2', question: "Any other recent milestones?", placeholder: '1000th customer' },
      { id: 'awards', label: 'Awards/Recognition', question: "Have you won any awards or recognition?", placeholder: 'Product Hunt #1, etc.' },
    ],
  },
  {
    id: 'expertise',
    title: 'Skills/Expertise',
    dataPoints: [
      { id: 'primarySkills', label: 'Primary Skills', question: "What are your primary skills?", placeholder: 'React, Python, AWS', type: 'textarea' },
      { id: 'specialization', label: 'Specialization', question: "What do you specialize in?", placeholder: 'AI/ML, DevOps, etc.' },
      { id: 'tools', label: 'Favorite Tools', question: "What are your favorite tools?", placeholder: 'Cursor, Vercel, Linear' },
    ],
  },
];
