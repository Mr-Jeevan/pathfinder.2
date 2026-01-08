/**
 * Simple Rule-Based Roadmap Generator
 * Analyzes title/description for keywords and returns tailored steps.
 */
const generateRoadmap = ({ title, description }) => {
  const content = (title + " " + description).toLowerCase();

  // 1. Define Rule Sets
  const rules = [
    {
      keywords: ["mern", "full stack", "developer", "react", "node", "javascript", "frontend", "backend"],
      type: "MERN Development",
      steps: [
        "Master JavaScript basics (ES6+, Async/Await)",
        "Learn React fundamentals (Hooks, Props, State)",
        "Explore Node.js and Express.js routing",
        "Connect MongoDB with Mongoose for data persistence",
        "Integrate Frontend & Backend with JWT Authentication",
        "Deploy the Full-Stack project (Vercel/Render)"
      ]
    },
    {
      keywords: ["fitness", "weight", "health", "exercise", "gym", "workout", "diet"],
      type: "Health & Fitness",
      steps: [
        "Consult a professional/Define measurable metrics",
        "Design a 4-week workout and nutrition plan",
        "Establish a consistent daily tracking routine",
        "Perform a bi-weekly body composition review",
        "Adjust intensity based on 1-month results"
      ]
    },
    {
      keywords: ["exam", "degree", "college", "cgpa", "study", "syllabus", "university"],
      type: "Education",
      steps: [
        "Identify high-weightage subjects and syllabus",
        "Construct a balanced weekly study timetable",
        "Complete 30-day revision cycles for each module",
        "Solve previous year mock tests under timed conditions",
        "Final performance review and target setting"
      ]
    }
  ];

  // 2. Matching Logic
  const matchedRule = rules.find(rule => 
    rule.keywords.some(keyword => content.includes(keyword))
  );

  // 3. Fallback (Generic Type)
  const finalSteps = matchedRule ? matchedRule.steps : [
    "Define clear objectives and key results",
    "Identify resources and necessary tools",
    "Set small daily milestones for consistency",
    "Track weekly progress and pivot if needed",
    "Finalize the first iteration/Review results"
  ];

  // Format into objects for the DB schema
  return finalSteps.map(stepTitle => ({
    title: stepTitle,
    completed: false
  }));
};

module.exports = { generateRoadmap };