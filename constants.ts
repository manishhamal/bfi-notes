import { Article, Author, Category } from './types';

export const BLOG_NAME = "BFI Notes";

export const AUTHOR: Author = {
  name: "Banking Prep Team",
  role: "Nepal BFI Experts",
  avatar: "https://picsum.photos/seed/banking/200/200",
  bio: "We provide specialized study materials for Nepal's government banking exams (NRB, RBB, NBL, ADBL). Our notes are tailored to the specific syllabi of Nepal's BFIs.",
  socials: {
    twitter: "https://twitter.com/nepalbankingprep",
    linkedin: "https://linkedin.com/company/nepalbankingprep",
    github: "https://github.com/nepalbankingprep",
  }
};

export const ARTICLES: Article[] = [
  {
    id: "nrb-act-2058",
    title: "Nepal Rastra Bank Act, 2058 (2002)",
    excerpt: "Key objectives, functions, and powers of Nepal's central bank as per the NRB Act 2058.",
    date: "2024-03-25",
    category: Category.Banking,
    readTime: "15 min read",
    tags: ["NRB Act", "Banking Laws", "Central Bank"],
    featuredImage: "https://picsum.photos/800/400?random=20",
    syllabus: "NRB Level 4 & 6 Syllabus - Section A",
    topicName: "Banking Laws and Acts",
    authorName: "Mr. Ramesh Sharma",
    authorAvatar: "https://i.ibb.co/LzNf9m9/arvind.jpg",
    authorBio: "Doing MBA Economics | Banking Law Expert",
    content: `
      <p class="lead">The Nepal Rastra Bank Act, 2058 is the primary legislation governing the central bank of Nepal. It defines the autonomy, objectives, and regulatory powers of the bank.</p>
      
      <h2>Objectives of NRB</h2>
      <p>According to Section 4 of the Act, the objectives of the Bank shall be as follows:</p>
      <ul>
        <li>To maintain price stability and balance of payments.</li>
        <li>To maintain the stability of the banking and financial sector.</li>
        <li>To develop a secure, healthy, and efficient system of payment.</li>
      </ul>
      
      <h2>Functions, Duties and Powers</h2>
      <p>The main functions of NRB include:</p>
      <ol>
        <li>Issuing bank notes and coins.</li>
        <li>Formulating and implementing monetary policy.</li>
        <li>Formulating and implementing foreign exchange policy.</li>
        <li>Acting as a banker, advisor, and financial agent to the Government of Nepal.</li>
        <li>Licensing and supervising BFIs.</li>
      </ol>

      <blockquote>"The Bank shall have full autonomy in the performance of its functions." - Section 3</blockquote>

      <h2>Board of Directors</h2>
      <p>The Board consists of seven members: The Governor (Chairperson), two Deputy Governors, the Secretary of the Ministry of Finance, and three other Directors appointed by the Government.</p>
    `
  },
  {
    id: "banking-principles",
    title: "Principles of Banking and Financial Institutions",
    excerpt: "Fundamental concepts of banking, types of deposits, and credit creation in Nepal's context.",
    date: "2024-03-22",
    category: Category.Banking,
    readTime: "12 min read",
    tags: ["Banking", "BFI", "Nepal"],
    featuredImage: "https://picsum.photos/800/400?random=21",
    syllabus: "RBB Level 4 & 5 Syllabus - Banking Section",
    topicName: "Banking Principles and Classification",
    authorName: "Ms. Anjali Thapa",
    authorAvatar: "https://picsum.photos/seed/anjali/200/200",
    authorBio: "Chartered Accountant | Financial Analyst",
    content: `
      <p class="lead">Banking is the business of accepting deposits from the public and lending those funds for investment or consumption.</p>
      
      <h2>Classification of BFIs in Nepal</h2>
      <p>NRB classifies BFIs into four categories based on their minimum capital requirements and scope of operations:</p>
      <ul>
        <li><strong>Class 'A'</strong>: Commercial Banks</li>
        <li><strong>Class 'B'</strong>: Development Banks</li>
        <li><strong>Class 'C'</strong>: Finance Companies</li>
        <li><strong>Class 'D'</strong>: Microfinance Financial Institutions</li>
      </ul>
      
      <h2>Primary Functions of Commercial Banks</h2>
      <p>Commercial banks in Nepal perform several key functions:</p>
      <ol>
        <li>Accepting various types of deposits (Current, Saving, Fixed).</li>
        <li>Providing loans and advances (Term loans, Overdrafts, etc.).</li>
        <li>Agency services (Remittance, Utility payments).</li>
        <li>General utility services (Locker facilities, LC, Guarantees).</li>
      </ol>
      
      <h2>Credit Creation</h2>
      <p>Banks create credit by lending out a portion of their deposits, keeping a certain percentage as reserves (CRR and SLR) as mandated by NRB.</p>
    `
  },
  {
    id: "management-principles",
    title: "Principles of Management for Banking Exams",
    excerpt: "Fayol's 14 principles, Taylor's scientific management, and modern management concepts.",
    date: "2024-03-18",
    category: Category.Management,
    readTime: "10 min read",
    tags: ["Management", "Fayol", "Banking Exam"],
    featuredImage: "https://picsum.photos/800/400?random=22",
    syllabus: "ADBL Level 4 & 5 - Management Section",
    topicName: "Management Principles and Functions",
    authorName: "Dr. Sunil Karki",
    authorAvatar: "https://picsum.photos/seed/sunil/200/200",
    authorBio: "PhD in Management | Senior Consultant",
    content: `
      <p class="lead">Management is the art of getting things done through and with people in formally organized groups.</p>
      
      <h2>Henri Fayol's 14 Principles</h2>
      <p>Fayol's principles are widely used in banking administration:</p>
      <ul>
        <li><strong>Division of Work</strong>: Specialization increases efficiency.</li>
        <li><strong>Authority and Responsibility</strong>: Right to give orders.</li>
        <li><strong>Discipline</strong>: Obedience to organizational rules.</li>
        <li><strong>Unity of Command</strong>: One employee, one boss.</li>
        <li><strong>Unity of Direction</strong>: One plan for a group of activities.</li>
      </ul>
      
      <h2>Functions of Management (POSDCORB)</h2>
      <p>Luther Gulick's acronym for management functions:</p>
      <ol>
        <li>Planning</li>
        <li>Organizing</li>
        <li>Staffing</li>
        <li>Directing</li>
        <li>Coordinating</li>
        <li>Reporting</li>
        <li>Budgeting</li>
      </ol>
    `
  },
  {
    id: "monetary-policy-nepal",
    title: "Monetary Policy of Nepal: An Overview",
    excerpt: "Understanding the tools, objectives, and current stance of NRB's monetary policy.",
    date: "2024-03-15",
    category: Category.Economic,
    readTime: "18 min read",
    tags: ["Monetary Policy", "NRB", "Economy"],
    syllabus: "NRB Level 6 - Economics Section",
    topicName: "Monetary Policy and Instruments",
    authorName: "Mr. Prabin Gurung",
    authorAvatar: "https://picsum.photos/seed/prabin/200/200",
    authorBio: "Economics Professor | Policy Researcher",
    content: `
      <p class="lead">Monetary policy is the process by which the central bank manages the supply of money and interest rates to achieve macroeconomic objectives.</p>
      
      <h2>Tools of Monetary Policy in Nepal</h2>
      <p>NRB uses both quantitative and qualitative tools:</p>
      <ul>
        <li><strong>Cash Reserve Ratio (CRR)</strong>: Percentage of deposits banks must keep with NRB.</li>
        <li><strong>Statutory Liquidity Ratio (SLR)</strong>: Percentage of deposits banks must keep in liquid assets.</li>
        <li><strong>Bank Rate</strong>: Rate at which NRB lends to BFIs.</li>
        <li><strong>Open Market Operations (OMO)</strong>: Buying and selling of government securities.</li>
      </ul>
      
      <h2>Current Trends</h2>
      <p>Recent monetary policies in Nepal have focused on managing liquidity, controlling inflation, and directing credit towards productive sectors like agriculture and energy.</p>
    `
  },
  {
    id: "accounting-basics",
    title: "Basic Principles of Accounting",
    excerpt: "Double entry system, accounting cycle, and financial statements for banking exams.",
    date: "2024-03-10",
    category: Category.Account,
    readTime: "12 min read",
    tags: ["Accounting", "Banking Exam", "Nepal"],
    featuredImage: "https://picsum.photos/800/400?random=23",
    syllabus: "NBL Level 4 & 5 - Accounting Section",
    topicName: "Accounting Principles and Cycle",
    authorName: "Ms. Sarita Shrestha",
    authorAvatar: "https://picsum.photos/seed/sarita/200/200",
    authorBio: "MBS Graduate | Accounting Specialist",
    content: `
      <p class="lead">Accounting is the process of recording, summarizing, and analyzing financial transactions.</p>
      <h2>Golden Rules of Accounting</h2>
      <ul>
        <li><strong>Personal Account</strong>: Debit the receiver, Credit the giver.</li>
        <li><strong>Real Account</strong>: Debit what comes in, Credit what goes out.</li>
        <li><strong>Nominal Account</strong>: Debit all expenses and losses, Credit all incomes and gains.</li>
      </ul>
    `
  },
  {
    id: "maths-shortcuts",
    title: "Mathematics Shortcuts for Competitive Exams",
    excerpt: "Time and work, percentage, and ratio calculations made easy.",
    date: "2024-03-05",
    category: Category.Maths,
    readTime: "8 min read",
    tags: ["Maths", "Shortcuts", "Banking Exam"],
    featuredImage: "https://picsum.photos/800/400?random=24",
    syllabus: "All BFIs Level 4 & 5 - Mathematics Section",
    topicName: "Quantitative Aptitude and Shortcuts",
    authorName: "Mr. Bikram Shah",
    authorAvatar: "https://picsum.photos/seed/bikram/200/200",
    authorBio: "Mathematics Expert | Competitive Exam Coach",
    content: `
      <p class="lead">Mathematics is a crucial part of the banking exam syllabus, requiring both accuracy and speed.</p>
      <h2>Important Topics</h2>
      <ul>
        <li>Percentage and its applications.</li>
        <li>Ratio and Proportion.</li>
        <li>Time, Speed, and Distance.</li>
        <li>Simple and Compound Interest.</li>
      </ul>
    `
  },
  {
    id: "computer-awareness",
    title: "Computer Awareness for Banking Exams",
    excerpt: "Hardware, software, networking, and cybersecurity basics.",
    date: "2024-03-01",
    category: Category.Computer,
    readTime: "10 min read",
    tags: ["Computer", "IT", "Banking Exam"],
    featuredImage: "https://picsum.photos/800/400?random=25",
    syllabus: "All BFIs Level 4 & 5 - Computer Section",
    topicName: "Computer Awareness and IT",
    authorName: "Er. Sandeep Pandey",
    authorAvatar: "https://picsum.photos/seed/sandeep/200/200",
    authorBio: "Software Engineer | IT Security Expert",
    content: `
      <p class="lead">Computer knowledge is essential for modern banking professionals.</p>
      <h2>Key Areas of Focus</h2>
      <ul>
        <li>Operating Systems (Windows, Linux).</li>
        <li>Microsoft Office Suite (Word, Excel, PowerPoint).</li>
        <li>Database Management Systems (DBMS).</li>
        <li>Internet and Networking.</li>
        <li>Cybersecurity and Digital Banking.</li>
      </ul>
    `
  }
];
